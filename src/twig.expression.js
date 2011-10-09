/**
 * Twig.js v0.1
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
        comma:      'comma',
        expression: 'expression',
        operator:   'operator',
        string:     'string',
        array: {
            start:  'array_start',
            end:    'array_end'
        },
        object: {
            start:  'object_start',
            end:    'object_end'
        },
        filter:     'filter',
        variable:   'variable',
        number:     'number'
    };

    /**
     * The regular expressions used to match tokens in expressions.
     */
    Twig.expression.definitions = [
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
                var evaluated_expression = Twig.expression.compile(token),
                    sub_stack = evaluated_expression.stack;
                while (sub_stack.length > 0) {
                    output.push(sub_stack.shift());
                }
                return {
                    stack: stack,
                    output: output
                };
            },
            parse: function(token, stack, context) {
                return {
                    stack: stack,
                    context: context
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
                Twig.expression.type.operator,
                Twig.expression.type.array.end,
                Twig.expression.type.comma
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
                Twig.expression.type.array.end,
                Twig.expression.type.comma
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
                    array_ended = false;
                    
                while (stack.length > 0) {
                    var value = stack.pop();
                    // Push values into the array until the start of the array
                    if (value.type && value.type == Twig.expression.type.array.start) {
                        array_ended = true;
                        break;
                    }
                    new_array.unshift(value);
                }
                if (!array_ended) {
                    throw "Expected end of array.";
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
            next: [ ]
        },
        {
            /**
             * Match an object/hash map snd.
             */
            type: Twig.expression.type.object.end,
            regex: /^\}/,
            next: [ ]
        },
        {
            /**
             * Match a filter of the form something|encode(...)
             */
            type: Twig.expression.type.filter,
            // match a | then a letter or _, then any number of letters, numbers, _ or -
            regex: /(^\|[a-zA-Z_][a-zA-Z0-9_\-]*\([^\)]\))/,
            next: [
                Twig.expression.type.operator,
                Twig.expression.type.array.end
            ]
        },
        {
            /**
             * Match a filter of the form something|raw
             */
            type: Twig.expression.type.filter,
            // match a | then a letter or _, then any number of letters, numbers, _ or -
            regex: /(^\|[a-zA-Z_][a-zA-Z0-9_\-]*)/,
            next: [
                Twig.expression.type.operator,
                Twig.expression.type.array.end,
                Twig.expression.type.comma
            ]
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
                // Get the variable from the context
                if (!context.hasOwnProperty(token.value)) {
                    throw "Model doesn't provide the property " + token.value;
                }
                stack.push(context[token.value]);
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
            throw "Unable to extend logic definition. No type provided for " + definition;
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
            // The possible next token for the match
            next,
            // Has a match been found from the definitions
            match_found,
            match_function = function (match) {
                Twig.log.trace("Twig.expression.tokenize",
                               "Matched a ", type, " regular expression of ", match);
    
                // Check that this token is a valid next token
                if (tokens.length > 0) {
                    prev_token = tokens[tokens.length-1];
                } else {
                    prev_token = null;
                }
    
                if (prev_next !== null && prev_next.indexOf(type) < 0) {
                    throw type + " cannot follow a " + prev_token.type + " at template:" + exp_offset + " near '" + match.substring(0, 20) + "'";
                }
    
                if (type === Twig.expression.type.expression) {
                    // Trim parenthesis of of an expression
                    match = match.substring(1, match.length-1);
                }
    
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
                    match_found = false;
    
                    expression = expression.replace(regex, match_function);
    
                    // An expression token has been matched. Break the for loop and start trying to
                    //  match the next template (if expression isn't empty.)
                    if (match_found) {
                        break;
                    }
                }
            }
            if (!match_found) {
                throw "Unable to parse '" + expression + "' at template position" + exp_offset;
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

    /**
     * Operator associativity constants.
     */
    Twig.expression.operator = {
        leftToRight: 'leftToRight',
        rightToLeft: 'rightToLeft'
    };

    /**
     * Get the precidence and associativity of an operator. These follow the order that C/C++ use.
     * See http://en.wikipedia.org/wiki/Operators_in_C_and_C++ for the table of values.
     */
    Twig.expression.operator.lookup = function (operator, token) {
        switch (operator) {
            case ',':
                token.precidence = 18;
                token.associativity = Twig.expression.operator.leftToRight;
                break;
            
            // Ternary
            case '?':
            case ':':
                token.precidence = 16;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            case '||':
                token.precidence = 14;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '&&':
                token.precidence = 13;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '==':
            case '!=':
                token.precidence = 9;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '<':
            case '<=':
            case '>':
            case '>=':
                token.precidence = 8;
                token.associativity = Twig.expression.operator.leftToRight;
                break;


            case '~': // String concatination
            case '+':
            case '-':
                token.precidence = 6;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '*':
            case '/':
            case '%':
                token.precidence = 5;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '!':
                token.precidence = 3;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            default:
                throw operator + " is an unknown operator.";
        }
        token.operator = operator;
        return token;
    };

    /**
     * Handle operations on the RPN stack.
     *
     * Returns the updated stack.
     */
    Twig.expression.operator.parse = function (operator, stack) {
        Twig.log.trace("Twig.expression.operator.parse: ", "Handling ", operator);
        var a,b;
        switch (operator) {
            case '+':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a + b);
                break;

            case '-':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a - b);
                break;

            case '*':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a * b);
                break;

            case '/':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a / b);
                break;

            case '%':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a % b);
                break;

            case '~':
                b = stack.pop().toString();
                a = stack.pop().toString();
                stack.push(a + b);
                break;

            case '!':
                stack.push(!stack.pop());
                break;

            case '<':
                b = stack.pop();
                a = stack.pop();
                stack.push(a < b);
                break;

            case '<=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a <= b);
                break;

            case '>':
                b = stack.pop();
                a = stack.pop();
                stack.push(a > b);
                break;

            case '>=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a >= b);
                break;

            case '==':
                b = stack.pop();
                a = stack.pop();
                stack.push(a == b);
                break;

            case '!=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a != b);
                break;

            case '||':
                b = stack.pop();
                a = stack.pop();
                stack.push(a || b);
                break;

            case '&&':
                b = stack.pop();
                a = stack.pop();
                stack.push(a && b);
                break;
        }

        return stack;
    };

    return Twig;

})( Twig || { } );
