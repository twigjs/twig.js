// ## twig.lib.js
//
// This file contains 3rd party libraries used within twig.
//
// Copies of the licenses for the code included here can be found in the
// LICENSES.md file.
//

module.exports = function (Twig) {
    // Namespace for libraries
    Twig.lib = { };

    Twig.lib.sprintf = require('locutus/php/strings/sprintf');
    Twig.lib.vsprintf = require('locutus/php/strings/vsprintf');
    Twig.lib.round = require('locutus/php/math/round');
    Twig.lib.max = require('locutus/php/math/max');
    Twig.lib.min = require('locutus/php/math/min');
    Twig.lib.stripTags = require('locutus/php/strings/strip_tags');
    Twig.lib.strtotime = require('locutus/php/datetime/strtotime');
    Twig.lib.date = require('locutus/php/datetime/date');
    Twig.lib.boolval = require('locutus/php/var/boolval');

    Twig.lib.is = function (type, obj) {
        if (typeof obj === 'undefined' || obj === null) {
            return false;
        }

        switch (type) {
            case 'Array':
                return Array.isArray(obj);
            case 'Date':
                return obj instanceof Date;
            case 'String':
                return (typeof obj === 'string' || obj instanceof String);
            case 'Number':
                return (typeof obj === 'number' || obj instanceof Number);
            case 'Function':
                return (typeof obj === 'function');
            case 'Object':
                return obj instanceof Object;
            default:
                return false;
        }
    };

    Twig.lib.replaceAll = function (string, search, replace) {
        // Convert type to string if needed
        const stringToChange = typeof string === 'string' ? string : string.toString();
        // Escape possible regular expression syntax
        const searchEscaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return stringToChange.replace(new RegExp(searchEscaped, 'g'), replace);
    };

    // Chunk an array (arr) into arrays of (size) items, returns an array of arrays, or an empty array on invalid input
    Twig.lib.chunkArray = function (arr, size) {
        const returnVal = [];
        let x = 0;
        const len = arr.length;

        if (size < 1 || !Array.isArray(arr)) {
            return [];
        }

        while (x < len) {
            returnVal.push(arr.slice(x, x += size));
        }

        return returnVal;
    };

    return Twig;
};
