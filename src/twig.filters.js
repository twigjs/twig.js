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
                if (value instanceof Array || typeof value === "string") {
                    return value.length;
                } else if (value instanceof Object) {
                    if (value._keys === undefined) {
                        return Object.keys(value).length;
                    } else {
                        return value._keys.length;
                    }
                }
            }
        },

        // Array/Object Filters
        reverse: {
            parse: function(value) {
                if (value instanceof Array) {
                    return value.reverse();
                } else if (value instanceof Object) {
                    var keys = value._keys || Object.keys(value).reverse();
                    value._keys = keys;
                    return value;
                }
            }
        },
        sort: {
            parse: function(value) {
                if (value instanceof Array) {
                    return value.sort();
                } else if (value instanceof Object) {
                    // Sorting objects isn't obvious since the order of
                    // returned keys isn't guaranteed
                    // Because of this we use a "hidden" key called _order to
                    // store the keys in the order we want to return them.

                    var sorted_obj = { },
                        sorted_keys = Object.keys(value).sort(function(a, b) {
                            return value[a] > value[b];
                        });
                    sorted_keys.forEach(function(key) {
                        sorted_obj[key] = value[key];
                    });
                    value._keys = sorted_keys;
                    return value;
                }
            }
        },
        keys: {
            parse: function(value) {
                var keyset = value._keys || Object.keys(value),
                    output = [];

                keyset.forEach(function(key) {
                    if (key === "_keys") return; // Ignore the _keys property
                    if (value.hasOwnProperty(key)) {
                        output.push(key);
                    }
                });
                return output;
            }
        },
        url_encode: {
            parse: function(value) {
                return encodeURIComponent(value);
            }
        },
        join: {
            parse: function(value, params) {
                var join_str = "",
                    output = [],
                    keyset = null;

                if (params && params[0]) {
                    join_str = params[0];
                }
                if (value instanceof Array) {
                    output = value;
                } else {
                    keyset = value._keys || Object.keys(value);
                    keyset.forEach(function(key) {
                        if (key === "_keys") return; // Ignore the _keys property
                        if (value.hasOwnProperty(key)) {
                            output.push(value[key]);
                        }
                    });
                }
                return output.join(join_str);
            }
        },
        "default": {
            parse: function(value, params) {
                if (params === undefined || params.length !== 1) {
                    throw new Twig.Error("default filter expects one argument");
                }
                if (value === undefined || value === null || value === '' ) {
                    return params[0];
                } else {
                    return value;
                }
            }
        },
        json_encode: {
            parse: function(value) {
                delete value._keys;
                return JSON.stringify(value);
            }
        },
        merge: {
            parse: function(value, params) {
                var obj = [],
                    arr_index = 0,
                    keyset = [];

                // Check to see if all the objects being merged are arrays
                if (!(value instanceof Array)) {
                    // Create obj as an Object
                    obj = { };
                } else {
                    params.forEach(function(param) {
                        if (!(param instanceof Array)) {
                            obj = { };
                        }
                    });
                }
                if (!(obj instanceof Array)) {
                    obj._keys = [];
                }

                if (value instanceof Array) {
                    value.forEach(function(val) {
                        if (obj._keys) obj._keys.unshift(arr_index);
                        obj[arr_index] = val;
                        arr_index++;
                    });
                } else {
                    keyset = value._keys || Object.keys(value);
                    keyset.forEach(function(key) {
                        obj[key] = value[key];
                        obj._keys.push(key);

                        // Handle edge case where a number index in an object is greater than
                        //   the array counter. In such a case, the array counter is increased
                        //   one past the index.
                        //
                        // Example {{ ["a", "b"]|merge({"4":"value"}, ["c", "d"])
                        // Without this, d would have an index of "4" and overwrite the value
                        //   of "value"
                        var int_key = parseInt(key, 10);
                        if (!isNaN(int_key) && int_key >= arr_index) {
                            arr_index = int_key + 1;
                        }
                    });
                }

                // mixin the merge arrays
                params.forEach(function(param) {
                    if (param instanceof Array) {
                        param.forEach(function(val) {
                            if (obj._keys) obj._keys.push(arr_index);
                            obj[arr_index] = val;
                            arr_index++;
                        });
                    } else {
                        keyset = param._keys || Object.keys(param);
                        keyset.forEach(function(key) {
                            if (!obj[key]) obj._keys.unshift(key);
                            obj[key] = param[key];

                            var int_key = parseInt(key, 10);
                            if (!isNaN(int_key) && int_key >= arr_index) {
                                arr_index = int_key + 1;
                            }
                        });
                    }
                })
                if (params.length === 0) {
                    throw new Twig.Error("Filter merge expects at least one parameter");
                }

                return obj;
            }
        }


        /*convert_encoding,
        date,
        escape,
        format,
        raw,
        replace,
        striptags */
    };

    return Twig;
})(Twig || { });
