// ## twig.lib.js
//
// This file contains 3rd party libraries used within twig.
//
// Copies of the licenses for the code included here can be found in the
// LICENSES.md file.
//

var php = require('phpjs');

module.exports = function(Twig) {

    // Namespace for libraries
    Twig.lib = { };

    Twig.lib.sprintf = php.sprintf;
    Twig.lib.vsprintf = php.vsprintf;
    Twig.lib.round = php.round;
    Twig.lib.max = php.max;
    Twig.lib.min = php.min;
    Twig.lib.strip_tags = php.strip_tags;
    Twig.lib.strtotime = php.strtotime;
    Twig.lib.date = php.date;

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
