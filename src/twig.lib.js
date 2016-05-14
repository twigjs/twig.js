// ## twig.lib.js
//
// This file contains 3rd party libraries used within twig.
//
// Copies of the licenses for the code included here can be found in the
// LICENSES.md file.
//

module.exports = function(Twig) {

    // Namespace for libraries
    Twig.lib = { };

    Twig.lib.sprintf = require('exports?sprintf!phpjs/functions/strings/sprintf');
    Twig.lib.vsprintf = require('exports?vsprintf!phpjs/functions/strings/vsprintf');
    Twig.lib.round = require('exports?round!phpjs/functions/math/round');
    Twig.lib.max = require('exports?max!phpjs/functions/math/max');
    Twig.lib.min = require('exports?min!phpjs/functions/math/min');
    Twig.lib.strip_tags = require('exports?strip_tags!phpjs/functions/strings/strip_tags');
    Twig.lib.strtotime = require('exports?strtotime!phpjs/functions/datetime/strtotime');
    Twig.lib.date = require('exports?date!phpjs/functions/datetime/date');

    Twig.lib.is = function(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    };

    // shallow-copy an object
    Twig.lib.copy = function(src) {
        var target = {},
            key;
        for (key in src)
            target[key] = src[key];

        return target;
    };

    Twig.lib.extend = function (src, add) {
        var keys = Object.keys(add),
            i;

        i = keys.length;

        while (i--) {
            src[keys[i]] = add[keys[i]];
        }

        return src;
    };

    Twig.lib.replaceAll = function(string, search, replace) {
        return string.split(search).join(replace);
    };

    // chunk an array (arr) into arrays of (size) items, returns an array of arrays, or an empty array on invalid input
    Twig.lib.chunkArray = function (arr, size) {
        var returnVal = [],
            x = 0,
            len = arr.length;

        if (size < 1 || !Twig.lib.is("Array", arr)) {
            return [];
        }

        while (x < len) {
            returnVal.push(arr.slice(x, x += size));
        }

        return returnVal;
    };

    return Twig;
};
