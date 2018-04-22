// ## twig.expression.js
//
// This file handles tokenizing and parsing expressions.
module.exports = function (Twig) {
    "use strict";

    /**
     * Namespace for expression handling.
     */
    Twig.expression = { };

    /**
     * Reserved word that can't be used as variable names.
     */
    Twig.expression.reservedWords = [
        "true", "false", "null", "TRUE", "FALSE", "NULL", "_context", "and", "b-and", "or", "b-or", "b-xor", "in", "not in", "if"
    ];

    /**
     * The type of tokens used in expressions.
     */
    Twig.expression.type = {
        comma:      'Twig.expression.type.comma',
        operator: {
            unary:  'Twig.expression.type.operator.unary',
            binary: 'Twig.expression.type.operator.binary'
        },
        string:     'Twig.expression.type.string',
        bool:       'Twig.expression.type.bool',
        slice:      'Twig.expression.type.slice',
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
        subexpression: {
            start:  'Twig.expression.type.subexpression.start',
            end:    'Twig.expression.type.subexpression.end'
        },
        key: {
            period:   'Twig.expression.type.key.period',
            brackets: 'Twig.expression.type.key.brackets'
        },
        filter:     'Twig.expression.type.filter',
        _function:  'Twig.expression.type._function',
        variable:   'Twig.expression.type.variable',
        number:     'Twig.expression.type.number',
        _null:     'Twig.expression.type.null',
        context:    'Twig.expression.type.context',
        test:       'Twig.expression.type.test'
    };

    Twig.expression.set = {
        // What can follow an expression (in general)
        operations: [
            Twig.expression.type.filter,
            Twig.expression.type.operator.unary,
            Twig.expression.type.operator.binary,
            Twig.expression.type.array.end,
            Twig.expression.type.object.end,
            Twig.expression.type.parameter.end,
            Twig.expression.type.subexpression.end,
            Twig.expression.type.comma,
            Twig.expression.type.test
        ],
        expressions: [
            Twig.expression.type._function,
            Twig.expression.type.bool,
            Twig.expression.type.string,
            Twig.expression.type.variable,
            Twig.expression.type.number,
            Twig.expression.type._null,
            Twig.expression.type.context,
            Twig.expression.type.parameter.start,
            Twig.expression.type.array.start,
            Twig.expression.type.object.start,
            Twig.expression.type.subexpression.start,
            Twig.expression.type.operator.unary
        ]
    };

    // Most expressions allow a '.' or '[' after them, so we provide a convenience set
    Twig.expression.set.operations_extended = Twig.expression.set.operations.concat([
                    Twig.expression.type.key.period,
                    Twig.expression.type.key.brackets,
                    Twig.expression.type.slice]);

    // Some commonly used compile and parse functions.
    Twig.expression.fn = {
        compile: {
            push: function(token, stack, output) {
                output.push(token);
            },
            push_both: function(token, stack, output) {
                output.push(token);
                stack.push(token);
            }
        },
        parse: {
            push: function(token, stack, context) {
                stack.push(token);
            },
            push_value: function(token, stack, context) {
                stack.push(token.value);
            }
        }
    };

    /**
     * Resolve a context value.
     *
     * If the value is a function, it is executed with a context parameter.
     *
     * @param {string} key The context object key.
     * @param {Object} context The render context.
     */
    Twig.expression.resolveAsync = function(value, context, params, next_token, object) {
        if (typeof value != 'function')
            return Twig.Promise.resolve(value);

        var promise = Twig.Promise.resolve(params);

        /*
        If value is a function, it will have been impossible during the compile stage to determine that a following
        set of parentheses were parameters for this function.

        Those parentheses will have therefore been marked as an expression, with their own parameters, which really
        belong to this function.

        Those parameters will also need parsing in case they are actually an expression to pass as parameters.
            */
        if (next_token && next_token.type === Twig.expression.type.parameter.end) {
            //When parsing these parameters, we need to get them all back, not just the last item on the stack.
            var tokens_are_parameters = true;

            promise = promise.then(function() {
                return next_token.params && Twig.expression.parseAsync.call(this, next_token.params, context, tokens_are_parameters);
            })
            .then(function(p) {
                //Clean up the parentheses tokens on the next loop
                next_token.cleanup = true;

                return p;
            });
        }

        return promise.then(function(params) {
            return value.apply(object || context, params || []);
        });
    };

    Twig.expression.resolve = function(value, context, params, next_token, object) {
        return Twig.async.potentiallyAsync(this, false, function() {
            return Twig.expression.resolveAsync.call(this, value, context, params, next_token, object);
        });
    }

    /**
     * Registry for logic handlers.
     */
    Twig.expression.handler = {};

    /**
     * Define a new expression type, available at Twig.logic.type.{type}
     *
     * @param {string} type The name of the new type.
     */
    Twig.expression.extendType = function (type) {
        Twig.expression.type[type] = "Twig.expression.type." + type;
    };

    /**
     * Extend the expression parsing functionality with a new definition.
     *
     * Token definitions follow this format:
     *  {
     *      type:     One of Twig.expression.type.[type], either pre-defined or added using
     *                    Twig.expression.extendType
     *
     *      next:     Array of types from Twig.expression.type that can follow this token,
     *
     *      regex:    A regex or array of regex's that should match the token.
     *
     *      compile: function(token, stack, output) called when this token is being compiled.
     *                   Should return an object with stack and output set.
     *
     *      parse:   function(token, stack, context) called when this token is being parsed.
     *                   Should return an object with stack and context set.
     *  }
     *
     *  Partial token definitions are also allowed, if only property or method
     *  needs to be overridden or defined.
     *
     * @param {Object} definition A token definition.
     */
    Twig.expression.extend = function (definition) {
        if (!definition.type) {
            throw new Twig.Error("Unable to extend logic definition. No type provided for " + definition);
        }
        Twig.expression.handler[definition.type] = Twig.expression.handler[definition.type] || {};
        Object.assign(Twig.expression.handler[definition.type], definition);
    };

    /**
     * Parse an RPN expression stack within a context.
     *
     * @param {Array} tokens An array of compiled expression tokens.
     * @param {Object} context The render context to parse the tokens with.
     *
     * @return {Object} The result of parsing all the tokens. The result
     *                  can be anything, String, Array, Object, etc... based on
     *                  the given expression.
     */
    Twig.expression.parse = function (tokens, context, tokens_are_parameters, allow_async) {
        var that = this;

        // If the token isn't an array, make it one.
        if (!Twig.lib.isArray(tokens))
            tokens = [tokens];

        // The output stack
        var stack = [],
            loop_token_fixups = [],
            binaryOperator = Twig.expression.type.operator.binary;

        return Twig.async.potentiallyAsync(this, allow_async, function() {
            return Twig.async.forEach(tokens, function expressionToken(token, index) {
                var token_template = null,
                    next_token = null,
                    result;

                //If the token is marked for cleanup, we don't need to parse it
                if (token.cleanup) {
                    return;
                }

                //Determine the token that follows this one so that we can pass it to the parser
                if (tokens.length > index + 1) {
                    next_token = tokens[index + 1];
                }

                token_template = Twig.expression.handler[token.type];

                if (token_template.parse)
                    result = token_template.parse.call(that, token, stack, context, next_token);

                //Store any binary tokens for later if we are in a loop.
                if (token.type === binaryOperator && context.loop) {
                    loop_token_fixups.push(token);
                }

                return result;
            })
            .then(function loopTokenFixups() {
                //Check every fixup and remove "key" as long as they still have "params". This covers the use case where
                //a ":" operator is used in a loop with a "(expression):" statement. We need to be able to evaluate the expression
                var len = loop_token_fixups.length;
                var loop_token_fixup = null;

                while(len-- > 0) {
                    loop_token_fixup = loop_token_fixups[len];
                    if (loop_token_fixup.params && loop_token_fixup.key)
                        delete loop_token_fixup.key;
                }

                //If parse has been called with a set of tokens that are parameters, we need to return the whole stack,
                //wrapped in an Array.
                if (tokens_are_parameters) {
                    var params = stack.splice(0);

                    stack.push(params);
                }

                // Pop the final value off the stack
                return stack.pop();
            });
        });
    };

    return Twig;

};
