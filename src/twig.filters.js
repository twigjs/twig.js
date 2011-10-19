/**
 * Twig.js v0.2
 * Copyright (c) 2011 John Roepke
 * Available under the BSD 2-Clause License
 */

/**
 * This file handles coompiling and parsing filters.
 */
var Twig = (function (Twig) {

    Twig.filters = { };
    Twig.filters = {
        // String Filters
        upper: {
            parse: function(value) {
                return value.toUpperCase();
            }
        },
        lower: {
            parse: function(value) {
                return value.toLowerCase();
            }
        },
        capitalize: {
            parse: function(value) {
                return value.substr(0, 1).toUpperCase() + value.substr(1);
            }
        },
        title: {
            parse: function(value) {
                return value.replace( /(^|\s)([a-z])/g , function(m, p1, p2){
                    return p1 + p2.toUpperCase();
                });
            }
        },
        length: {
            parse: function(value) {
                console.log(value, typeof value === "string", value.length);
                if (value instanceof Array || typeof value === "string") {
                    return value.length;
                } else if (value instanceof Object) {
                    return Object.keys(value).length;
                }
            }
        },

        // Array/Object Filters
        reverse: {
            parse: function(value) {
                if (value instanceof Array) {
                    return value.reverse();
                } else if (value instanceof Object) {
                    // TODO
                }
            }
        },
        sort: {
            parse: function(value) {
                if (value instanceof Array) {
                    return value.sort();
                } else if (value instanceof Object) {
                    //  TODO
                }
            }
        },
        keys: {
            parse: function(value) {
                return Object.keys(value);
            }
        }

        /*convert_encoding,
        date,
        default,
        escape,
        format,
        join,
        json_encode,
        keys,
        merge,
        raw,
        replace,
        striptags,
        url_encode */
    };

    return Twig;
})(Twig || { });
