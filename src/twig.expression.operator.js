//     Twig.js
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.expression.operator.js
//
// This file handles operator lookups and parsing.
var Twig = (function (Twig) {
    "use strict";

    /**
     * Operator associativity constants.
     */
    Twig.expression.operator = {
        leftToRight: 'leftToRight',
        rightToLeft: 'rightToLeft'
    };

    var containment = function(a, b) {
        if (b.indexOf !== undefined) {
            // String
            return a === b || a !== '' && b.indexOf(a) > -1;

        } else {
            var el;
            for (el in b) {
                if (b.hasOwnProperty(el) && b[el] === a) {
                    return true;
                }
            }
            return false;
        }
    };

    /**
     * Get the precedence and associativity of an operator. These inherit the order from Twig.php.
     * See https://github.com/twigphp/Twig/blob/1.x/lib/Twig/Extension/Core.php for the table of precedence.
     */
    Twig.expression.operator.lookup = function (operator, token) {
        switch (operator) {
            case "..":
                token.precedence = 25;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'not in':
            case 'in':
                token.precedence = 20;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case ',':
                token.precedence = 18;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            // Ternary
            case '?':
            case ':':
                token.precedence = 0;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            case 'starts with':
            case 'ends with':
            case 'matches':
                token.precedence = 20;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'or':
                token.precedence = 10;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'and':
                token.precedence = 15;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '==':
            case '!=':
            case '<':
            case '<=':
            case '>':
            case '>=':
                token.precedence = 20;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '~': // String concatenation
                token.precedence = 40;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '+':
            case '-':
                token.precedence = 30;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '**':
                token.precedence = 200;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            case '//':
            case '*':
            case '/':
            case '%':
                token.precedence = 60;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'not':
                token.precedence = 50;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            default:
                throw new Twig.Error(operator + " is an unknown operator.");
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
        var a, b, c;
        switch (operator) {
            case ':':
                // Ignore
                break;

            case '?':
                c = stack.pop(); // false expr
                b = stack.pop(); // true expr
                a = stack.pop(); // conditional
                if (a) {
                    stack.push(b);
                } else {
                    stack.push(c);
                }
                break;

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

            case '//':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(parseInt(a / b));
                break;

            case '%':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a % b);
                break;

            case '~':
                b = stack.pop();
                a = stack.pop();
                stack.push( (a != null ? a.toString() : "")
                          + (b != null ? b.toString() : "") );
                break;

            case 'not':
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

            case '===':
                b = stack.pop();
                a = stack.pop();
                stack.push(a === b);
                break;

            case '==':
                b = stack.pop();
                a = stack.pop();
                stack.push(a == b);
                break;

            case '!==':
                b = stack.pop();
                a = stack.pop();
                stack.push(a !== b);
                break;

            case '!=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a != b);
                break;

            case 'or':
                b = stack.pop();
                a = stack.pop();
                stack.push(a || b);
                break;

            case 'and':
                b = stack.pop();
                a = stack.pop();
                stack.push(a && b);
                break;

            case '**':
                b = stack.pop();
                a = stack.pop();
                stack.push(Math.pow(a, b));
                break;


            case 'not in':
                b = stack.pop();
                a = stack.pop();
                stack.push( !containment(a, b) );
                break;

            case 'in':
                b = stack.pop();
                a = stack.pop();
                stack.push( containment(a, b) );
                break;

            case '..':
                b = stack.pop();
                a = stack.pop();
                stack.push( Twig.functions.range(a, b) );
                break;

            case 'starts with':
                b = stack.pop();
                a = stack.pop();
                stack.push(Twig.lib.is('String', a)
                    && Twig.lib.is('String', b)
                    && a.indexOf(b) === 0);
                break;

            case 'ends with':
                b = stack.pop();
                a = stack.pop();
                stack.push(Twig.lib.is('String', a)
                    && Twig.lib.is('String', b)
                    && (b === '' || a.substr(-b.length) === b));
                break;

            case 'matches':
                b = stack.pop();
                a = stack.pop();

                // TODO: remove this block when
                // we start casting to string the PHP way:
                // true => '1'
                // null, undefined, false => ''
                if (a == null || a === 0 || a === false) {
                    a = '';
                } else if (a === true) {
                    a = '1';
                }

                // PHP supports different delimiters
                // We need to care of quoted chars
                var delimiter = b[0];
                var parts = b.split(delimiter);
                var flags = parts.pop();
                parts.shift();
                var pattern = parts.join(delimiter);
                pattern = pattern.replace('\\'+delimiter, delimiter);
                var regexp = new RegExp(pattern, flags);

                stack.push(regexp.exec(a));
                break;

            default:
                throw new Twig.Error(operator + " is an unknown operator.");
        }
    };

    return Twig;

})( Twig || { } );
