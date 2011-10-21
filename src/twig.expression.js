/**
 * Twig.js v0.2
 * Copyright (c) 2011 John Roepke
 * Available under the BSD 2-Clause License
 */

 /**
  * This file handles tokenizing, compiling and parsing expression.
  */
var Twig = (function (Twig) {
    "use strict";

    /**
     * Namespace for expression handling.
     */
    Twig.expression = { };

    /**
     * The type of tokens used in expressions.
     */
    Twig.expression.type = {
        comma:      'Twig.expression.type.comma',
        expression: 'Twig.expression.type.expression',
        operator:   'Twig.expression.type.operator',
        string:     'Twig.expression.type.string',
        array: {
            start:  'Twig.expression.type.array.start',
            end:    'Twig.expression.type.array.end'
        },
        object: {
            start:  'Twig.expression.type.object.start',
            end:    'Twig.expression.type.object.end'
        },
        parameter: {
            start:  'Twig.expression.type.parameter.start',
            end:    'Twig.expression.type.parameter.end'
        },
        key: {
            period:   'Twig.expression.type.key.period',
            brackets: 'Twig.expression.type.key.brackets'
        },
        filter:     'Twig.expression.type.filter',
        variable:   'Twig.expression.type.variable',
        number:     'Twig.expression.type.number',
        setkey:     'Twig.expression.type.setkey'
    };

    /**
     * The regular expressions and compile/parse logic used to match tokens in expressions.
     *
     * Properties:
     *
     *      type:  The type of expression this matches
     *
     *      regex: One or more regular expressions that matche the format of the token.
     *
     *      next:  Valid tokens that can occur next in the expression.
     *
     * Functions:
     *
     *      compile: A function that compiles the raw regular expression match into a token.
     *
     *      parse:   A function that parses the compiled token into output.
     */
    Twig.expression.definitions = [
        {
            type: Twig.expression.type.setkey,
            regex: /^\:/,
            next: [
                Twig.expression.type.expression,
                Twig.expression.type.string,
                Twig.expression.type.variable,
                Twig.expression.type.number,
                Twig.expression.type.array.start,
                Twig.expression.type.object.start
            ],
            compile: function(token, stack, output) {
                var key_token = output.pop();
                if (key_token.type !== Twig.expression.type.string) {
                    throw new Twig.Error("Unexpected object key: " + key_token);
                }
                token.key = key_token.value;
                output.push(token);

                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                stack.push(token);
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            type: Twig.expression.type.comma,
            // Match a comma
            regex: /^,/,
            next: [
                Twig.expression.type.expression,
                Twig.expression.type.string,
                Twig.expression.type.variable,
                Twig.expression.type.number,
                Twig.expression.type.array.start,
                Twig.expression.type.object.start
            ],
            compile: function(token, stack, output) {
                while(stack.length > 0) {
                    output.push(stack.pop());
                }
                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            }
        },
        {
            type: Twig.expression.type.expression,
            // Match (, anything but ), )
            regex: /^\([^\)]+\)/,
            next: [
                Twig.expression.type.operator,
                Twig.expression.type.array.end
            ],
            compile: function(token, stack, output) {
                token.value = token.value.substring(1, token.value.length - 1);

                var evaluated_expression = Twig.expression.compile(token),
                    sub_stack = evaluated_expression.stack;
                while (sub_stack.length > 0) {
                    output.push(sub_stack.shift());
                }
                return {
                    stack: stack,
                    output: output
                };
            }
        },
        {
            type: Twig.expression.type.operator,
            // Match any of +, *, /, -,^, ~, !, <, <=, >, >=, !=, ==, ||, &&
            regex: /(^[\+\*\/\-\^~%]|^[<>!]=?|^==|^\|\||^&&)/,
            next: [
                Twig.expression.type.expression,
                Twig.expression.type.string,
                Twig.expression.type.variable,
                Twig.expression.type.number,
                Twig.expression.type.array.start,
                Twig.expression.type.object.start
            ],
            compile: function(token, stack, output) {
                var value = token.value,
                    operator = Twig.expression.operator.lookup(value, token);

                Twig.log.trace("Twig.expression.compile: ", "Operator: ", operator);

                while (stack.length > 0 && (
                            (operator.associativity === Twig.expression.operator.leftToRight &&
                             operator.precidence    >= stack[stack.length-1].precidence) ||

                            (operator.associativity === Twig.expression.operator.rightToLeft &&
                             operator.precidence    >  stack[stack.length-1].precidence))
                       ) {
                     output.push(stack.pop());
                }
                stack.push(operator);

                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                stack = Twig.expression.operator.parse(token.value, stack);
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            /**
             * Match a string. This is anything between a pair of single or double quotes.
             */
            type: Twig.expression.type.string,
            // See: http://blog.stevenlevithan.com/archives/match-quoted-string
            regex: /^(["'])(?:(?=(\\?))\2.)*?\1/,
            next: [
                Twig.expression.type.filter,
                Twig.expression.type.operator,
                Twig.expression.type.array.end,
                Twig.expression.type.object.end,
                Twig.expression.type.parameter.end,
                Twig.expression.type.comma,
                Twig.expression.type.setkey
            ],
            compile: function(token, stack, output) {
                var value = token.value;

                // Remove the quotes from the string
                if (value.substring(0, 1) === '"') {
                    value = value.replace('\\"', '"');
                } else {
                    value = value.replace("\\'", "'");
                }
                token.value = value.substring(1, value.length-1);
                Twig.log.trace("Twig.expression.compile: ", "String value: ", token.value);
                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                stack.push(token.value);
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            /**
             * Match a parameter set start.
             */
            type: Twig.expression.type.parameter.start,
            regex: /^\(/,
            next: [
                Twig.expression.type.expression,
                Twig.expression.type.string,
                Twig.expression.type.variable,
                Twig.expression.type.number,
                Twig.expression.type.object.start,
                Twig.expression.type.array.start,
                Twig.expression.type.parameter.end
            ],
            compile: function(token, stack, output) {
                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                stack.push(token);
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            /**
             * Match a parameter set end.
             */
            type: Twig.expression.type.parameter.end,
            regex: /^\)/,
            next: [
                Twig.expression.type.filter,
                Twig.expression.type.operator,
                Twig.expression.type.array.end,
                Twig.expression.type.object.end,
                Twig.expression.type.parameter.end,
                Twig.expression.type.comma,
                Twig.expression.type.setkey
            ],
            compile: function(token, stack, output) {
                while(stack.length > 0) {
                    output.push(stack.pop());
                }
                // Move contents of parens into preceding filter
                var param_stack = [],
                    control_token = null;
                while(token.type !== Twig.expression.type.parameter.start) {
                    // Add token to arguments stack
                    param_stack.unshift(token);
                    token = output.pop();
                }
                param_stack.unshift(token);

                // Get the token preceding the parameters
                token = output.pop();
                if (token.type !== Twig.expression.type.filter) {
                    throw new Twig.Error("Expected filter before parameters, got " + token.type);
                }
                token.params = param_stack;
                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                var new_array = [],
                    array_ended = false,
                    value = null;

                while (stack.length > 0) {
                    value = stack.pop();
                    // Push values into the array until the start of the array
                    if (value.type && value.type == Twig.expression.type.parameter.start) {
                        array_ended = true;
                        break;
                    }
                    new_array.unshift(value);
                }
                if (!array_ended) {
                    throw new Twig.Error("Expected end of parameter set.");
                }

                stack.push(new_array);
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            /**
             * Match an array start.
             */
            type: Twig.expression.type.array.start,
            regex: /^\[/,
            next: [
                Twig.expression.type.expression,
                Twig.expression.type.string,
                Twig.expression.type.variable,
                Twig.expression.type.number,
                Twig.expression.type.array.end
            ],
            compile: function(token, stack, output) {
                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                stack.push(token);
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            /**
             * Match an array end.
             */
            type: Twig.expression.type.array.end,
            regex: /^\]/,
            next: [
                Twig.expression.type.filter,
                Twig.expression.type.comma,
                Twig.expression.type.parameter.end,
                Twig.expression.type.array.end,
                Twig.expression.type.object.end
            ],
            compile: function(token, stack, output) {
                while(stack.length > 0) {
                    output.push(stack.pop());
                }
                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            },
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
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            /**
             * Match an object/hash map start.
             */
            type: Twig.expression.type.object.start,
            regex: /^\{/,
            next: [
                Twig.expression.type.expression,
                Twig.expression.type.string,
                Twig.expression.type.variable,
                Twig.expression.type.number,
                Twig.expression.type.array.start,
                Twig.expression.type.object.start
            ],
            compile: function(token, stack, output) {
                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                stack.push(token);
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            /**
             * Match an object/hash map end.
             */
            type: Twig.expression.type.object.end,
            regex: /^\}/,
            next: [
                Twig.expression.type.filter,
                Twig.expression.type.comma,
                Twig.expression.type.array.end,
                Twig.expression.type.object.end,
                Twig.expression.type.array.end,
                Twig.expression.type.parameter.end,
                Twig.expression.type.key.period,
                Twig.expression.type.key.brackets
            ],
            compile: function(token, stack, output) {
                while(stack.length > 0) {
                    output.push(stack.pop());
                }
                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(tken, stack, context) {
                var new_object = {},
                    object_ended = false,
                    token = null,
                    value = null;

                while (stack.length > 0) {
                    token = stack.pop();
                    // Push values into the array until the start of the object
                    if (token.type && token.type === Twig.expression.type.object.start) {
                        object_ended = true;
                        break;
                    }
                    if (token.type && token.type === Twig.expression.type.setkey) {
                        if (value === null) {
                            throw new Twig.Error("Expected value for key " + token.key + " in object definition. Got " + token);
                        }
                        new_object[token.key] = value;

                        // Preserve the order that elements are added to the map
                        // This is necessary since JavaScript objects don't
                        // guarantee the order of keys
                        if (new_object._keys === undefined) new_object._keys = [];
                        new_object._keys.push(token.key);

                        value = null;

                    } else {
                        value = token;
                    }
                }
                if (!object_ended) {
                    throw new Twig.Error("Unexpected end of object.");
                }

                stack.push(new_object);
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            /**
             * Match a filter of the form something|encode(...)
             */
            type: Twig.expression.type.filter,
            // match a | then a letter or _, then any number of letters, numbers, _ or -
            regex: /(^\|[a-zA-Z_][a-zA-Z0-9_\-]*)/,
            next: [
                Twig.expression.type.comma,
                Twig.expression.type.filter,
                Twig.expression.type.operator,
                Twig.expression.type.array.end,
                Twig.expression.type.object.end,
                Twig.expression.type.parameter.end,
                Twig.expression.type.key.period,
                Twig.expression.type.key.brackets,
                Twig.expression.type.parameter.start
            ],
            compile: function(token, stack, output) {
                token.value = token.value.substr(1);
                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                if (Twig.filters[token.value] === undefined) {
                    throw "Unable to find filter " + token.value;
                }
                var input = stack.pop(),
                    params = token.params && Twig.expression.parse(token.params, context);

                stack.push(Twig.filters[token.value].parse(input, params));
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            /**
             * Match a variable. Variables can contain letters, numbers, underscores and dashes
             * but must start with a letter or underscore.
             */
            type: Twig.expression.type.variable,
            // match any letter or _, then any number of letters, numbers, _ or -
            regex: /(^[a-zA-Z_][a-zA-Z0-9_]*)/,
            next: [
                Twig.expression.type.operator,
                Twig.expression.type.filter,
                Twig.expression.type.array.end,
                Twig.expression.type.object.end,
                Twig.expression.type.parameter.end,
                Twig.expression.type.comma,
                Twig.expression.type.key.period,
                Twig.expression.type.key.brackets
            ],
            compile: function(token, stack, output) {
                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                // Get the variable from the context
                if (!context.hasOwnProperty(token.value)) {
                    // throw new Twig.Error("Model doesn't provide the property " + token.value);
                }
                stack.push(context[token.value]);
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            type: Twig.expression.type.key.period,
            regex: /^(\.[a-zA-Z_][a-zA-Z0-9_]*)/,
            next: [
                Twig.expression.type.operator,
                Twig.expression.type.filter,
                Twig.expression.type.array.end,
                Twig.expression.type.object.end,
                Twig.expression.type.parameter.end,
                Twig.expression.type.comma,
                Twig.expression.type.key.period,
                Twig.expression.type.key.brackets
            ],
            compile: function(token, stack, output) {
                token.key = token.value.substr(1);
                delete token.value;

                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                var key = token.key,
                    object = stack.pop();

                if (object === null || object === undefined) {
                    throw new Twig.Error("Can't access a key " + key + " on an undefined object.");
                }

                // Get the variable from the context
                if (!object.hasOwnProperty(key)) {
                    // throw new Twig.Error("Model doesn't provide the key " + key);
                }
                stack.push(object[key]);
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            type: Twig.expression.type.key.brackets,
            regex: /^\[[^\]]*\]/,
            next: [
                Twig.expression.type.operator,
                Twig.expression.type.filter,
                Twig.expression.type.array.end,
                Twig.expression.type.object.end,
                Twig.expression.type.parameter.end,
                Twig.expression.type.comma,
                Twig.expression.type.key.period,
                Twig.expression.type.key.brackets
            ],
            compile: function(token, stack, output) {
                token.value = token.value.substring(1, token.value.length-1);

                // The expression stack for the key
                token.stack = Twig.expression.compile({
                    value: token.value
                }).stack;
                delete token.value;

                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                // Evaluate key
                var key = Twig.expression.parse(token.stack, context),
                    object = stack.pop();
                // Get the variable from the context
                if (!object.hasOwnProperty(key)) {
                    throw new Twig.Error("Model doesn't provide the key " + key);
                }
                stack.push(object[key]);
                return {
                    stack: stack,
                    context: context
                };
            }
        },
        {
            /**
             * Match a number (integer or decimal)
             */
            type: Twig.expression.type.number,
            // match a number
            regex: /(^\-?\d*\.?\d+)/,
            next: [
                Twig.expression.type.operator,
                Twig.expression.type.filter,
                Twig.expression.type.array.end,
                Twig.expression.type.object.end,
                Twig.expression.type.parameter.end,
                Twig.expression.type.comma
            ],
            compile: function(token, stack, output) {
                output.push(token);
                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                stack.push(token.value);
                return {
                    stack: stack,
                    context: context
                };
            }
        }
    ];

    /**
     * Registry for logic handlers.
     */
    Twig.expression.handler = {};

    /**
     * Define a new expression type, available at Twig.logic.type.{type}
     */
    Twig.expression.extendType = function (type, value) {
        value = value || type;
        Twig.expression.type[type] = value;
    };

    /**
     * Extend the expression parsing functionality with a new definition.
     */
    Twig.expression.extend = function (definition) {

        if (!definition.type) {
            throw new Twig.Error("Unable to extend logic definition. No type provided for " + definition);
        }
        Twig.expression.handler[definition.type] = definition;
    };

    // Extend with built-in expressions
    while (Twig.expression.definitions.length > 0) {
        Twig.expression.extend(Twig.expression.definitions.shift());
    }

    /**
     * Break an expression into tokens defined in Twig.expression.definitions.
     */
    Twig.expression.tokenize = function (expression) {
        var tokens = [],
            // Keep an offset of the location in the expression for error messages.
            exp_offset = 0,
            // The valid next tokens of the previous token
            prev_next = null,
            // The previous token.
            prev_token,
            // Match type
            type,
            // Match regex
            regex,
            regex_array,
            // The possible next token for the match
            next,
            // Has a match been found from the definitions
            match_found,
            invalid_matches = [],
            match_function = function (match) {
                Twig.log.trace("Twig.expression.tokenize",
                               "Matched a ", type, " regular expression of ", match);

                // Check that this token is a valid next token
                if (tokens.length > 0) {
                    prev_token = tokens[tokens.length - 1];
                } else {
                    prev_token = null;
                }

                if (prev_next !== null && prev_next.indexOf(type) < 0) {
                    invalid_matches.push(type + " cannot follow a " + prev_token.type + " at template:" + exp_offset + " near '" + match.substring(0, 20) + "'");
                    // Not a match, don't change the expression
                    return match;
                }
                invalid_matches = [];

                var obj = {
                    type:  type,
                    value: match
                };
                tokens.push(obj);

                match_found = true;
                prev_next = next;
                exp_offset += match.length;
                return '';
            };

        Twig.log.debug("Twig.expression.tokenize", "Tokenizing expression ", expression);

        while (expression.length > 0) {
            expression = expression.trim();
            for (type in Twig.expression.handler) {
                if (Twig.expression.handler.hasOwnProperty(type)) {
                    next = Twig.expression.handler[type].next;
                    regex = Twig.expression.handler[type].regex;
                    if (regex instanceof Array) {
                        regex_array = regex;
                    } else {
                        regex_array = [regex];
                    }

                    match_found = false;
                    while (regex_array.length > 0) {
                        regex = regex_array.pop();
                        expression = expression.replace(regex, match_function);
                    }
                    // An expression token has been matched. Break the for loop and start trying to
                    //  match the next template (if expression isn't empty.)
                    if (match_found) {
                        break;
                    }
                }
            }
            if (!match_found) {
                if (invalid_matches.length > 0) {
                    throw new Twig.Error(invalid_matches.join(" OR "));
                } else {
                    throw new Twig.Error("Unable to parse '" + expression + "' at template position" + exp_offset);
                }
            }
        }

        Twig.log.trace("Twig.expression.tokenize", "Tokenized to ", tokens);
        return tokens;
    };

    Twig.expression.compile = function (raw_token) {
        var expression = raw_token.value,
            // Tokenize expression
            tokens = Twig.expression.tokenize(expression),
            token = null,
            output = [],
            stack = [],
            value = null,
            token_template = null;

        Twig.log.trace("Twig.expression.compile: ", "Compiling ", expression);
        Twig.log.trace("Twig.expression.compile: ", "Tokens tokenized to ", tokens);

        // Push tokens into RPN stack using the Sunting-yard algorithm
        // See http://en.wikipedia.org/wiki/Shunting_yard_algorithm

        while (tokens.length > 0) {
            token = tokens.shift();
            token_template = Twig.expression.handler[token.type];
            if (token_template.compile) {
                value = token_template.compile(token, stack, output);
                output = value.output && output;
                stack = value.stack && stack;
            }
        }

        while(stack.length > 0) {
            output.push(stack.pop());
        }

        Twig.log.trace("Twig.expression.compile: ", "Stack is", output);

        raw_token.stack = output;
        delete raw_token.value;

        return raw_token;

    };


    /**
     * Parse an RPN expression stack within a context.
     */
    Twig.expression.parse = function (tokens, context) {
        // If the token isn't an array, make it one.
        if (!(tokens instanceof Array)) {
            tokens = [tokens];
        }

        // The output stack
        var stack = [],
            token_template = null,
            new_env = null;

        tokens.forEach(function (token) {
            token_template = Twig.expression.handler[token.type];

            Twig.log.trace("Twig.expression.parse: ", "Parsing ", token);
            if (token_template.parse) {
                new_env = token_template.parse(token, stack, context);
                stack = new_env.stack && stack;
                context = new_env.context && context;
            }
            Twig.log.trace("Twig.expression.parse: ", "Stack result: ", stack);
        });
        // Pop the final value off the stack
        return stack.pop();
    };

    return Twig;

})( Twig || { } );
