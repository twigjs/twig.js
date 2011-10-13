/**
 * Twig.js v0.1
 * Copyright (c) 2011 John Roepke
 * Available under the BSD 2-Clause License
 */

 /**
  * This file handles operator lookups and parsing.
  */
var Twig = (function (Twig) {
    "use strict";

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
