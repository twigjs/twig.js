// ## twig.lib.js
//
// This file contains 3rd party libraries used within twig.
//
// Copies of the licenses for the code included here can be found in the
// LICENSES.md file.
//

module.exports = function (Twig) {
    const { sprintf } = require('locutus/php/strings/sprintf');
    const { vsprintf } = require('locutus/php/strings/vsprintf');
    const { strip_tags } = require('locutus/php/strings/strip_tags');
    const { round } = require('locutus/php/math/round');
    const { min } = require('locutus/php/math/min');
    const { max } = require('locutus/php/math/max');
    const { strtotime } = require('locutus/php/datetime/strtotime');
    const { date } = require('locutus/php/datetime/date');
    const { boolval } = require('locutus/php/var/boolval');

    // Namespace for libraries
    Twig.lib = { };

    Twig.lib.sprintf = sprintf;
    Twig.lib.vsprintf = vsprintf;
    Twig.lib.round = round;
    Twig.lib.max = max;
    Twig.lib.min = min;
    Twig.lib.stripTags = strip_tags;
    Twig.lib.strtotime = strtotime;
    Twig.lib.date = date;
    Twig.lib.boolval = boolval;

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
