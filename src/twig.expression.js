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
        expression: 'expression',
        operator:   'operator',
        string:     'string',
        array:      'array',
        object:     'object',
        filter:     'filter',
        variable:   'variable',
        number:     'number',
        unknown:    'unknown'
    };

    /**
     * The regular expressions used to match tokens in expressions.
     */
    Twig.expression.definitions = [
        {
            type: Twig.expression.type.expression,
            // Match (, anything but ), )
            regex: /^\([^\)]+\)/,
            next: [
                Twig.expression.type.operator
            ]
        },
        {
            type: Twig.expression.type.operator,
            // Match any of +, *, /, -,^, ~, !, <, <=, >, >=, !=, ==, ||, &&
            regex: /(^[\+\*\/\-\^~%]|^[<>!]=?|^==|^\|\||^&&)/,
            next: [
                Twig.expression.type.expression,
                Twig.expression.type.string,
                Twig.expression.type.variable,
                Twig.expression.type.number
            ]
        },
        {
            /**
             * Match a string. This is anything between a pair of single or double quotes.
             */
            type: Twig.expression.type.string,
            // See: http://blog.stevenlevithan.com/archives/match-quoted-string
            regex: /^(["'])(?:(?=(\\?))\2.)*?\1/,
            next: [
                Twig.expression.type.operator
            ]
        },
        {
            /**
             * Match an array.
             */
            type: Twig.expression.type.array,
            regex: /\[[^\]]\]/,
            next: [ ]
        },
        {
            /**
             * Match an object/hash map.
             */
            type: Twig.expression.type.object,
            regex: /\{[^\}]\}/,
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
                Twig.expression.type.operator
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
                Twig.expression.type.operator
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
                Twig.expression.type.filter
            ]
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
                Twig.expression.type.filter
            ]
        }
    ];

    /**
     * Break an expression into tokens defined in Twig.expression.definitions.
     */
    Twig.expression.tokenize = function (expression) {
        var tokens = [],
            // Keep an offset of the location in the expression for error messages.
            exp_offset = 0,
            // The valid next tokens of the previous token
            prev_next = null,
            // Match type
            type,
            // Match regex
            regex,
            // The possible next token for the match
            next,
            // Has a match been found from the definitions
            match_found,
            i,
            l;

        if (Twig.debug) {
            console.log("Twig.expression.tokenize", "Tokenizing expression ", expression);
        }

        var match_function = function (match) {
            if (Twig.trace) {
                console.log("Twig.expression.tokenize",
                            "Matched a ", type, " regular expression of ", match);
            }

            // Check that this token is a valid next token
            var prev_token = tokens.length > 0 ? tokens[tokens.length-1] : null;
            if (prev_next !== null && prev_next.indexOf(type) < 0) {
                throw type + " cannot follow a " + prev_token.type + " at template:" + exp_offset + " near '" + match.substring(0, 20) + "'";
            }

            if (type === Twig.expression.type.expression) {
                // Trim parenthesis of of an expression
                match = match.substring(1, match.length-1);
            }

            tokens.push({
                type: type,
                value: match
            });
            match_found = true;
            prev_next = next;
            exp_offset += match.length;
            return '';
        };

        while (expression.length > 0) {
            l = Twig.expression.definitions.length;
            for (i = 0; i < l; i += 1) {
                next = Twig.expression.definitions[i].next;
                type = Twig.expression.definitions[i].type;
                regex = Twig.expression.definitions[i].regex;
                match_found = false;

                expression = expression.trim().replace(regex, match_function);

                // An expression token has been matched. Break the for loop and start trying to
                //  match the next template (if expression isn't empty.)
                if (match_found) {
                    break;
                }
            }
            if (!match_found) {
                throw "Unable to parse '" + expression + "' at template position" + exp_offset;
            }
        }
        return tokens;
    };

    Twig.expression.compile = function (raw_token) {
        var expression = raw_token.value;
        if (Twig.trace) {
            console.log("Twig.expression.compile: ", "Compiling expression", expression);
        }

        // Tokenize expression
        var tokens = Twig.expression.tokenize(expression);

        if (Twig.trace) {
            console.log("Twig.expression.compile: ", "Tokens tokenized to ", tokens);
        }

        // Push tokens into RPN stack using the Sunting-yard algorithm
        // See http://en.wikipedia.org/wiki/Shunting_yard_algorithm

        var output = [];
        var operator_stack = [];

        while(tokens.length > 0) {
            var token = tokens.shift(),
                type = token.type,
                value = token.value;

            switch (type) {
                // variable/contant types
                case Twig.expression.type.string:
                    // Remove the quotes from the string
                    if (value.substring(0,1) === '"') {
                        value = value.replace('\\"', '"');
                    } else {
                        value = value.replace("\\'", "'");
                    }
                    token.value = value.substring(1, value.length-1);
                    if (Twig.trace) {
                        console.log("Twig.expression.compile: ", "String value: ", token.value);
                    }
                    output.push(token);
                    break;

                case Twig.expression.type.variable:
                case Twig.expression.type.number:
                    if (Twig.trace) {
                        console.log("Twig.expression.compile: ", "Var/number value: ", value);
                    }
                    output.push(token);
                    break;


                /**
                 * Handler operators (e.g. +,-,/,etc...)
                 *
                 * This looks up the operator in the
                 */
                case Twig.expression.type.operator:
                    var operator = Twig.expression.operator.lookup(value, token);
                    if (Twig.trace) {
                        console.log("Twig.expression.compile: ", "Operator: ", operator);
                    }

                    while (operator_stack.length > 0 && (
                                (operator.associativity === Twig.expression.operator.leftToRight &&
                                 operator.precidence    >= operator_stack[operator_stack.length-1].precidence)

                             || (operator.associativity === Twig.expression.operator.rightToLeft &&
                                 operator.precidence    >  operator_stack[operator_stack.length-1].precidence))
                           ) {
                         output.push(operator_stack.pop());
                    }

                    operator_stack.push(operator);
                    break;

                /**
                 * Handle sub-expressions (expressions in parenthesis)
                 */
                case Twig.expression.type.expression:
                    var evaluated_expression = Twig.expression.compile(token),
                        sub_stack = evaluated_expression.stack;
                    sub_stack.reverse();
                    while (sub_stack.length > 0) {
                        output.push(sub_stack.pop());
                    }
                    break;

                case Twig.expression.type.filter:
                    // TODO: implement
                    break;
            }
        }

        while(operator_stack.length > 0) {
            output.push(operator_stack.pop());
        }

        if (Twig.trace) {
            console.log("Twig.expression.compile: ", "Stack is", output);
        }

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
        var stack = [];
        tokens.forEach(function (token) {
            if (Twig.trace) {
                console.log("Twig.expression.parse: ", "Parsing ", token);
            }
            switch (token.type) {
                // variable/contant types
                case Twig.expression.type.string:
                case Twig.expression.type.number:
                    stack.push(token.value);
                    break;
                case Twig.expression.type.variable:
                    // Get the variable from the context
                    if (!context.hasOwnProperty(token.value)) {
                        throw "Model doesn't provide the property " + token.value;
                    }
                    stack.push(context[token.value]);
                    break;

                case Twig.expression.type.operator:
                    var operator = token.value;
                    stack = Twig.expression.operator.parse(operator, stack);
                    break;
            }
        });
        if (Twig.trace) {
            console.log("Twig.expression.parse: ", "Stack result: ", stack);
        }
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
        if (Twig.trace) {
            console.log("Twig.expression.operator.parse: ", "Handling ", operator);
        }
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
