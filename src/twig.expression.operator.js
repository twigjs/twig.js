// ## twig.expression.operator.js
//
// This file handles operator lookups and parsing.
module.exports = function (Twig) {
    "use strict";

    /**
     * Operator associativity constants.
     */
    Twig.expression.operator = {
        leftToRight: 'leftToRight',
        rightToLeft: 'rightToLeft'
    };

    var containment = function(a, b) {
        if (b === undefined || b === null) {
            return null;
        } else if (b.indexOf !== undefined) {
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
     * Get the precidence and associativity of an operator. These follow the order that C/C++ use.
     * See http://en.wikipedia.org/wiki/Operators_in_C_and_C++ for the table of values.
     */
    Twig.expression.operator.lookup = function (operator, token) {
        switch (operator) {
            case "..":
                token.precidence = 20;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case ',':
                token.precidence = 18;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            // Ternary
            case '?:':
            case '?':
            case ':':
                token.precidence = 16;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            case 'or':
                token.precidence = 14;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'and':
                token.precidence = 13;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'b-or':
                token.precidence = 12;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'b-xor':
                token.precidence = 11;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'b-and':
                token.precidence = 10;
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
            case 'not in':
            case 'in':
                token.precidence = 8;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '~': // String concatination
            case '+':
            case '-':
                token.precidence = 6;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '//':
            case '**':
            case '*':
            case '/':
            case '%':
                token.precidence = 5;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'not':
                token.precidence = 3;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            default:
                throw new Twig.Error("Failed to lookup operator: " + operator + " is an unknown operator.");
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

        if (operator === '?') {
            c = stack.pop();
        }

        b = stack.pop();
        if (operator !== 'not') {
            a = stack.pop();
        }

        if (operator !== 'in' && operator !== 'not in') {
            if (a && Array.isArray(a)) {
                a = a.length;
            }

            if (b && Array.isArray(b)) {
                b = b.length;
            }
        }

        switch (operator) {
            case ':':
                // Ignore
                break;

            case '?:':
                if (Twig.lib.boolval(a)) {
                    stack.push(a);
                } else {
                    stack.push(b);
                }
                break;
            case '?':
                if (a === undefined) {
                    //An extended ternary.
                    a = b;
                    b = c;
                    c = undefined;
                }

                if (Twig.lib.boolval(a)) {
                    stack.push(b);
                } else {
                    stack.push(c);
                }
                break;

            case '+':
                b = parseFloat(b);
                a = parseFloat(a);
                stack.push(a + b);
                break;

            case '-':
                b = parseFloat(b);
                a = parseFloat(a);
                stack.push(a - b);
                break;

            case '*':
                b = parseFloat(b);
                a = parseFloat(a);
                stack.push(a * b);
                break;

            case '/':
                b = parseFloat(b);
                a = parseFloat(a);
                stack.push(a / b);
                break;

            case '//':
                b = parseFloat(b);
                a = parseFloat(a);
                stack.push(Math.floor(a / b));
                break;

            case '%':
                b = parseFloat(b);
                a = parseFloat(a);
                stack.push(a % b);
                break;

            case '~':
                stack.push( (a != null ? a.toString() : "")
                          + (b != null ? b.toString() : "") );
                break;

            case 'not':
            case '!':
                stack.push(!Twig.lib.boolval(b));
                break;

            case '<':
                stack.push(a < b);
                break;

            case '<=':
                stack.push(a <= b);
                break;

            case '>':
                stack.push(a > b);
                break;

            case '>=':
                stack.push(a >= b);
                break;

            case '===':
                stack.push(a === b);
                break;

            case '==':
                stack.push(a == b);
                break;

            case '!==':
                stack.push(a !== b);
                break;

            case '!=':
                stack.push(a != b);
                break;

            case 'or':
                stack.push(Twig.lib.boolval(a) || Twig.lib.boolval(b));
                break;

            case 'b-or':
                stack.push(a | b);
                break;

            case 'b-xor':
                stack.push(a ^ b);
                break;

            case 'and':
                stack.push(Twig.lib.boolval(a) && Twig.lib.boolval(b));
                break;

            case 'b-and':
                stack.push(a & b);
                break;

            case '**':
                stack.push(Math.pow(a, b));
                break;

            case 'not in':
                stack.push( !containment(a, b) );
                break;

            case 'in':
                stack.push( containment(a, b) );
                break;

            case '..':
                stack.push( Twig.functions.range(a, b) );
                break;

            default:
                debugger;
                throw new Twig.Error("Failed to parse operator: " + operator + " is an unknown operator.");
        }
    };

    return Twig;

};
