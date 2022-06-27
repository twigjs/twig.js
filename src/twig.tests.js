// ## twig.tests.js
//
// This file handles expression tests. (is empty, is not defined, etc...)
export class TwigTests {
    #twig

    constructor(twig) {
        this.#twig = twig;
    }

    empty(value) {
        if (value === null || value === undefined) {
            return true;
        }

        // Handler numbers
        if (typeof value === 'number') {
            return false;
        } // Numbers are never "empty"

        // Handle strings and arrays
        if (value.length > 0) {
            return false;
        }

        // Handle objects
        for (const key in value) {
            if (Object.hasOwnProperty.call(value, key)) {
                return false;
            }
        }

        return true;
    }


    odd(value) {
        return value % 2 === 1;
    }


    even(value) {
        return value % 2 === 0;
    }


    divisibleby(value, params) {
        return value % params[0] === 0;
    }


    defined(value) {
        return value !== undefined;
    }


    none(value) {
        return value === null;
    }


    null(value) {
        return this.none(value); // Alias of none
    }


    'same as'(value, params) {
        return value === params[0];
    }


    sameas(value, params) {
        console.warn('`sameas` is deprecated use `same as`');
        return this['same as'](value, params);
    }


    iterable(value) {
        return value && (this.#twig.lib.is('Array', value) || this.#twig.lib.is('Object', value));
    }

    /*
    Constant ?
     */
}
