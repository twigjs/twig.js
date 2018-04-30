// ## twig.expression.definitions.parse.js
//
// This file handles parsing expressions.
module.exports = function (Twig) {
    "use strict";

    function parseParams(thisArg, params, context) {
        if (params)
            return Twig.expression.parseAsync.call(thisArg, params, context);

        return Twig.Promise.resolve(false);
    }

    // The parse logic used to match tokens in expressions.
    //
    // Properties:
    //
    //     type: The type of expression this matches
    //
    // Functions:
    //
    //     parse: A function that parses the compiled token into output.
    //
    var definitions = [
        {
            type: Twig.expression.type.test,
            parse: function(token, stack, context) {
                var value = stack.pop();

                return parseParams(this, token.params, context)
                .then(function(params) {
                    var result = Twig.test(token.filter, value, params);

                    if (token.modifier == 'not') {
                        stack.push(!result);
                    } else {
                        stack.push(result);
                    }
                });
            }
        },
        {
            /**
             * Match a number (integer or decimal)
             */
            type: Twig.expression.type.number,
            parse: Twig.expression.fn.parse.push_value
        },
        {
            type: Twig.expression.type.operator.binary,
            parse: function(token, stack, context) {
                if (token.key) {
                    // handle ternary ':' operator
                    stack.push(token);
                } else if (token.params) {
                    // handle "{(expression):value}"
                    return Twig.expression.parseAsync.call(this, token.params, context)
                    .then(function(key) {
                        token.key = key;
                        stack.push(token);

                        //If we're in a loop, we might need token.params later, especially in this form of "(expression):value"
                        if (!context.loop) {
                            delete(token.params);
                        }
                    });
                } else {
                    Twig.expression.operator.parse(token.value, stack);
                }
            }
        },
        {
            type: Twig.expression.type.operator.unary,
            parse: function(token, stack, context) {
                Twig.expression.operator.parse(token.value, stack);
            }
        },
        {
            /**
             * Match a string. This is anything between a pair of single or double quotes.
             */
            type: Twig.expression.type.string,
            parse: Twig.expression.fn.parse.push_value
        },
        {
            /**
             * Match a subexpression set start.
             */
            type: Twig.expression.type.subexpression.start,
            parse: Twig.expression.fn.parse.push
        },
        {
            /**
             * Match a subexpression set end.
             */
            type: Twig.expression.type.subexpression.end,
            parse: function(token, stack, context) {
                var new_array = [],
                    array_ended = false,
                    value = null;

                if (token.expression) {
                    return Twig.expression.parseAsync.call(this, token.params, context)
                    .then(function(value) {
                        stack.push(value);
                    });
                } else {
                    throw new Twig.Error("Unexpected subexpression end when token is not marked as an expression");
                }
            }
        },
        {
            /**
             * Match a parameter set start.
             */
            type: Twig.expression.type.parameter.start,
            parse: Twig.expression.fn.parse.push
        },
        {
            /**
             * Match a parameter set end.
             */
            type: Twig.expression.type.parameter.end,
            parse: function(token, stack, context) {
                var new_array = [],
                    array_ended = false,
                    value = null;

                if (token.expression) {
                    return Twig.expression.parseAsync.call(this, token.params, context)
                    .then(function(value) {
                        stack.push(value);
                    });
                } else {

                    while (stack.length > 0) {
                        value = stack.pop();
                        // Push values into the array until the start of the array
                        if (value && value.type && value.type == Twig.expression.type.parameter.start) {
                            array_ended = true;
                            break;
                        }
                        new_array.unshift(value);
                    }

                    if (!array_ended) {
                        throw new Twig.Error("Expected end of parameter set.");
                    }

                    stack.push(new_array);
                }
            }
        },
        {
            type: Twig.expression.type.slice,
            regex: /^\[(\d*\:\d*)\]/,
            parse: function(token, stack, context) {
                var input = stack.pop(),
                    params = token.params;

                stack.push(Twig.filter.call(this, token.value, input, params));
            }
        },
        {
            /**
             * Match an array start.
             */
            type: Twig.expression.type.array.start,
            parse: Twig.expression.fn.parse.push
        },
        {
            /**
             * Match an array end.
             */
            type: Twig.expression.type.array.end,
            parse: function(token, stack, context) {
                var new_array = [],
                    array_ended = false,
                    value = null;

                while (stack.length > 0) {
                    value = stack.pop();
                    // Push values into the array until the start of the array
                    if (value.type && value.type == Twig.expression.type.array.start) {
                        array_ended = true;
                        break;
                    }
                    new_array.unshift(value);
                }
                if (!array_ended) {
                    throw new Twig.Error("Expected end of array.");
                }

                stack.push(new_array);
            }
        },
        // Token that represents the start of a hash map '}'
        //
        // Hash maps take the form:
        //        { "key": 'value', "another_key": item }
        //
        // Keys must be quoted (either single or double) and values can be any expression.
        {
            type: Twig.expression.type.object.start,
            parse: Twig.expression.fn.parse.push
        },

        // Token that represents the end of a Hash Map '}'
        //
        // This is where the logic for building the internal
        // representation of a hash map is defined.
        {
            type: Twig.expression.type.object.end,
            parse: function(end_token, stack, context) {
                var new_object = {},
                    object_ended = false,
                    token = null,
                    token_key = null,
                    has_value = false,
                    value = null;

                while (stack.length > 0) {
                    token = stack.pop();
                    // Push values into the array until the start of the object
                    if (token && token.type && token.type === Twig.expression.type.object.start) {
                        object_ended = true;
                        break;
                    }
                    if (token && token.type && (token.type === Twig.expression.type.operator.binary || token.type === Twig.expression.type.operator.unary) && token.key) {
                        if (!has_value) {
                            throw new Twig.Error("Missing value for key '" + token.key + "' in object definition.");
                        }
                        new_object[token.key] = value;

                        // Preserve the order that elements are added to the map
                        // This is necessary since JavaScript objects don't
                        // guarantee the order of keys
                        if (new_object._keys === undefined) new_object._keys = [];
                        new_object._keys.unshift(token.key);

                        // reset value check
                        value = null;
                        has_value = false;

                    } else {
                        has_value = true;
                        value = token;
                    }
                }
                if (!object_ended) {
                    throw new Twig.Error("Unexpected end of object.");
                }

                stack.push(new_object);
            }
        },

        // Token representing a filter
        //
        // Filters can follow any expression and take the form:
        //        expression|filter(optional, args)
        //
        // Filter parsing is done in the Twig.filters namespace.
        {
            type: Twig.expression.type.filter,
            parse: function(token, stack, context) {
                var that = this,
                    input = stack.pop();

                return parseParams(this, token.params, context)
                .then(function(params) {
                    return Twig.filter.call(that, token.value, input, params);
                })
                .then(function(value) {
                    stack.push(value);
                });
            }
        },
        {
            type: Twig.expression.type._function,
            parse: function(token, stack, context) {

                var that = this,
                    fn = token.fn,
                    value;

                return parseParams(this, token.params, context)
                .then(function(params) {
                    if (Twig.functions[fn]) {
                        // Get the function from the built-in functions
                        value = Twig.functions[fn].apply(that, params);

                    } else if (typeof context[fn] == 'function') {
                        // Get the function from the user/context defined functions
                        value = context[fn].apply(context, params);

                    } else {
                        throw new Twig.Error(fn + ' function does not exist and is not defined in the context');
                    }

                    return value;
                })
                .then(function(result) {
                    stack.push(result);
                });
            }
        },

        // Token representing a variable.
        //
        // Variables can contain letters, numbers, underscores and
        // dashes, but must start with a letter or underscore.
        //
        // Variables are retrieved from the render context and take
        // the value of 'undefined' if the given variable doesn't
        // exist in the context.
        {
            type: Twig.expression.type.variable,
            parse: function(token, stack, context) {
                // Get the variable from the context
                return Twig.expression.resolveAsync.call(this, context[token.value], context)
                .then(function(value) {
                    stack.push(value);
                });
            }
        },
        {
            type: Twig.expression.type.key.period,
            parse: function(token, stack, context, next_token) {
                var that = this,
                    key = token.key,
                    object = stack.pop(),
                    value;

                return parseParams(this, token.params, context)
                .then(function(params) {
                    if (object === null || object === undefined) {
                        if (that.options.strict_variables) {
                            throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
                        } else {
                            value = undefined;
                        }
                    } else {
                        var capitalize = function (value) {
                            return value.substr(0, 1).toUpperCase() + value.substr(1);
                        };

                        // Get the variable from the context
                        if (typeof object === 'object' && key in object) {
                            value = object[key];
                        } else if (object["get" + capitalize(key)] !== undefined) {
                            value = object["get" + capitalize(key)];
                        } else if (object["is" + capitalize(key)] !== undefined) {
                            value = object["is" + capitalize(key)];
                        } else {
                            value = undefined;
                        }
                    }

                    // When resolving an expression we need to pass next_token in case the expression is a function
                    return Twig.expression.resolveAsync.call(that, value, context, params, next_token, object);
                })
                .then(function(result) {
                    stack.push(result);
                });
            }
        },
        {
            type: Twig.expression.type.key.brackets,
            parse: function(token, stack, context, next_token) {
                // Evaluate key
                var that = this,
                    params = null,
                    object,
                    value;

                return parseParams(this, token.params, context)
                .then(function(parameters) {
                    params = parameters;
                    return Twig.expression.parseAsync.call(that, token.stack, context);
                })
                .then(function(key) {
                    object = stack.pop();

                    if (object === null || object === undefined) {
                        if (that.options.strict_variables) {
                            throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
                        } else {
                            return null;
                        }
                    }

                    // Get the variable from the context
                    if (typeof object === 'object' && key in object) {
                        value = object[key];
                    } else {
                        value = null;
                    }

                    // When resolving an expression we need to pass next_token in case the expression is a function
                    return Twig.expression.resolveAsync.call(that, value, object, params, next_token);
                })
                .then(function(result) {
                    stack.push(result);
                });
            }
        },
        {
            /**
             * Match a null value.
             */
            type: Twig.expression.type._null,
            parse: Twig.expression.fn.parse.push_value
        },
        {
            /**
             * Match the context
             */
            type: Twig.expression.type.context,
            parse: function(token, stack, context) {
                stack.push(context);
            }
        },
        {
            /**
             * Match a boolean
             */
            type: Twig.expression.type.bool,
            parse: Twig.expression.fn.parse.push_value
        }
    ];

    definitions.forEach(function (definition) {
        Twig.expression.extend(definition);
    });

    return Twig;

};
