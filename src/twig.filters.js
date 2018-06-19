// ## twig.filters.js
//
// This file handles parsing filters.
module.exports = function (Twig) {

    // Determine object type
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    Twig.filters = {
        // String Filters
        upper:  function(value) {
            if ( typeof value !== "string" ) {
               return value;
            }

            return value.toUpperCase();
        },
        lower: function(value) {
            if ( typeof value !== "string" ) {
               return value;
            }

            return value.toLowerCase();
        },
        capitalize: function(value) {
            if ( typeof value !== "string" ) {
                 return value;
            }

            return value.substr(0, 1).toUpperCase() + value.toLowerCase().substr(1);
        },
        title: function(value) {
            if ( typeof value !== "string" ) {
               return value;
            }

            return value.toLowerCase().replace( /(^|\s)([a-z])/g , function(m, p1, p2){
                return p1 + p2.toUpperCase();
            });
        },
        length: function(value) {
            if (Twig.lib.is("Array", value) || typeof value === "string") {
                return value.length;
            } else if (Twig.lib.is("Object", value)) {
                if (value._keys === undefined) {
                    return Object.keys(value).length;
                } else {
                    return value._keys.length;
                }
            } else {
                return 0;
            }
        },

        // Array/Object Filters
        reverse: function(value) {
            if (is("Array", value)) {
                return value.reverse();
            } else if (is("String", value)) {
                return value.split("").reverse().join("");
            } else if (is("Object", value)) {
                var keys = value._keys || Object.keys(value).reverse();
                value._keys = keys;
                return value;
            }
        },
        sort: function(value) {
            if (is("Array", value)) {
                return value.sort();
            } else if (is('Object', value)) {
                // Sorting objects isn't obvious since the order of
                // returned keys isn't guaranteed in JavaScript.
                // Because of this we use a "hidden" key called _keys to
                // store the keys in the order we want to return them.

                delete value._keys;
                var keys = Object.keys(value),
                    sorted_keys = keys.sort(function(a, b) {
                        var a1, a2;

                        // if a and b are comparable, we're fine :-)
                        if((value[a] > value[b]) == !(value[a] <= value[b])) {
                            return value[a] > value[b] ? 1 :
			           value[a] < value[b] ? -1 :
				   0;
                        }
                        // if a and b can be parsed as numbers, we can compare
                        // their numeric value
                        else if(!isNaN(a1 = parseFloat(value[a])) &&
                                !isNaN(b1 = parseFloat(value[b]))) {
                            return a1 > b1 ? 1 :
			           a1 < b1 ? -1 :
				   0;
                        }
                        // if one of the values is a string, we convert the
                        // other value to string as well
                        else if(typeof value[a] == 'string') {
                            return value[a] > value[b].toString() ? 1 :
                                   value[a] < value[b].toString() ? -1 :
				   0;
                        }
                        else if(typeof value[b] == 'string') {
                            return value[a].toString() > value[b] ? 1 :
                                   value[a].toString() < value[b] ? -1 :
				   0;
                        }
                        // everything failed - return 'null' as sign, that
                        // the values are not comparable
                        else {
                            return null;
                        }
                    });
                value._keys = sorted_keys;
                return value;
            }
        },
        keys: function(value) {
            if (value === undefined || value === null){
                return;
           }

            var keyset = value._keys || Object.keys(value),
                output = [];

            Twig.forEach(keyset, function(key) {
                if (key === "_keys") return; // Ignore the _keys property
                if (value.hasOwnProperty(key)) {
                    output.push(key);
                }
            });
            return output;
        },
        url_encode: function(value) {
            if (value === undefined || value === null){
                return;
            }

            var result = encodeURIComponent(value);
            result = result.replace("'", "%27");
            return result;
        },
        join: function(value, params) {
            if (value === undefined || value === null){
                return;
            }

            var join_str = "",
                output = [],
                keyset = null;

            if (params && params[0]) {
                join_str = params[0];
            }
            if (is("Array", value)) {
                output = value;
            } else {
                keyset = value._keys || Object.keys(value);
                Twig.forEach(keyset, function(key) {
                    if (key === "_keys") return; // Ignore the _keys property
                    if (value.hasOwnProperty(key)) {
                        output.push(value[key]);
                    }
                });
            }
            return output.join(join_str);
        },
        "default": function(value, params) {
            if (params !== undefined && params.length > 1) {
                throw new Twig.Error("default filter expects one argument");
            }
            if (value === undefined || value === null || value === '' ) {
                if (params === undefined) {
                    return '';
                }

                return params[0];
            } else {
                return value;
            }
        },
        json_encode: function(value) {
            if(value === undefined || value === null) {
                return "null";
            }
            else if ((typeof value == 'object') && (is("Array", value))) {
                output = [];

                Twig.forEach(value, function(v) {
                    output.push(Twig.filters.json_encode(v));
                });

                return "[" + output.join(",") + "]";
            }
            else if ((typeof value == 'object') && (is("Date", value))) {
                return '"' + value.toISOString() + '"';
            }
            else if (typeof value == 'object') {
                var keyset = value._keys || Object.keys(value),
                output = [];

                Twig.forEach(keyset, function(key) {
                    output.push(JSON.stringify(key) + ":" + Twig.filters.json_encode(value[key]));
                });

                return "{" + output.join(",") + "}";
            }
            else {
                return JSON.stringify(value);
            }
        },
        merge: function(value, params) {
            var obj = [],
                arr_index = 0,
                keyset = [];

            // Check to see if all the objects being merged are arrays
            if (!is("Array", value)) {
                // Create obj as an Object
                obj = { };
            } else {
                Twig.forEach(params, function(param) {
                    if (!is("Array", param)) {
                        obj = { };
                    }
                });
            }
            if (!is("Array", obj)) {
                obj._keys = [];
            }

            if (is("Array", value)) {
                Twig.forEach(value, function(val) {
                    if (obj._keys) obj._keys.push(arr_index);
                    obj[arr_index] = val;
                    arr_index++;
                });
            } else {
                keyset = value._keys || Object.keys(value);
                Twig.forEach(keyset, function(key) {
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
            Twig.forEach(params, function(param) {
                if (is("Array", param)) {
                    Twig.forEach(param, function(val) {
                        if (obj._keys) obj._keys.push(arr_index);
                        obj[arr_index] = val;
                        arr_index++;
                    });
                } else {
                    keyset = param._keys || Object.keys(param);
                    Twig.forEach(keyset, function(key) {
                        if (!obj[key]) obj._keys.push(key);
                        obj[key] = param[key];

                        var int_key = parseInt(key, 10);
                        if (!isNaN(int_key) && int_key >= arr_index) {
                            arr_index = int_key + 1;
                        }
                    });
                }
            });
            if (params.length === 0) {
                throw new Twig.Error("Filter merge expects at least one parameter");
            }

            return obj;
        },

        date: function(value, params) {
            var date = Twig.functions.date(value);
            var format = params && params.length ? params[0] : 'F j, Y H:i';
            return Twig.lib.date(format.replace(/\\\\/g, '\\'), date);
        },

        date_modify: function(value, params) {
            if (value === undefined || value === null) {
                return;
            }
            if (params === undefined || params.length !== 1) {
                throw new Twig.Error("date_modify filter expects 1 argument");
            }

            var modifyText = params[0], time;

            if (Twig.lib.is("Date", value)) {
                time = Twig.lib.strtotime(modifyText, value.getTime() / 1000);
            }
            if (Twig.lib.is("String", value)) {
                time = Twig.lib.strtotime(modifyText, Twig.lib.strtotime(value));
            }
            if (Twig.lib.is("Number", value)) {
                time = Twig.lib.strtotime(modifyText, value);
            }

            return new Date(time * 1000);
        },

        replace: function(value, params) {
            if (value === undefined||value === null){
                return;
            }

            var pairs = params[0],
                tag;
            for (tag in pairs) {
                if (pairs.hasOwnProperty(tag) && tag !== "_keys") {
                    value = Twig.lib.replaceAll(value, tag, pairs[tag]);
                }
            }
            return value;
        },

        format: function(value, params) {
            if (value === undefined || value === null){
                return;
            }

            return Twig.lib.vsprintf(value, params);
        },

        striptags: function(value, allowed) {
            if (value === undefined || value === null){
                return;
            }

            return Twig.lib.strip_tags(value, allowed);
        },

        escape: function(value, params) {
            if (value === undefined|| value === null){
                return;
            }

            var strategy = "html";
            if(params && params.length && params[0] !== true)
                strategy = params[0];

            if(strategy == "html") {
                var raw_value = value.toString().replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#039;");
                return Twig.Markup(raw_value, 'html');
            } else if(strategy == "js") {
                var raw_value = value.toString();
                var result = "";

                for(var i = 0; i < raw_value.length; i++) {
                    if(raw_value[i].match(/^[a-zA-Z0-9,\._]$/))
                        result += raw_value[i];
                    else {
                        var char_code = raw_value.charCodeAt(i);

                        if(char_code < 0x80)
                            result += "\\x" + char_code.toString(16).toUpperCase();
                        else
                            result += Twig.lib.sprintf("\\u%04s", char_code.toString(16).toUpperCase());
                    }
                }

                return Twig.Markup(result, 'js');
            } else if(strategy == "css") {
                var raw_value = value.toString();
                var result = "";

                for(var i = 0; i < raw_value.length; i++) {
                    if(raw_value[i].match(/^[a-zA-Z0-9]$/))
                        result += raw_value[i];
                    else {
                        var char_code = raw_value.charCodeAt(i);
                        result += "\\" + char_code.toString(16).toUpperCase() + " ";
                    }
                }

                return Twig.Markup(result, 'css');
            } else if(strategy == "url") {
                var result = Twig.filters.url_encode(value);
                return Twig.Markup(result, 'url');
            } else if(strategy == "html_attr") {
                var raw_value = value.toString();
                var result = "";

                for(var i = 0; i < raw_value.length; i++) {
                    if(raw_value[i].match(/^[a-zA-Z0-9,\.\-_]$/))
                        result += raw_value[i];
                    else if(raw_value[i].match(/^[&<>"]$/))
                        result += raw_value[i].replace(/&/g, "&amp;")
                                .replace(/</g, "&lt;")
                                .replace(/>/g, "&gt;")
                                .replace(/"/g, "&quot;");
                    else {
                        var char_code = raw_value.charCodeAt(i);

                        // The following replaces characters undefined in HTML with
                        // the hex entity for the Unicode replacement character.
                        if(char_code <= 0x1f && char_code != 0x09 && char_code != 0x0a && char_code != 0x0d)
                            result += "&#xFFFD;";
                        else if(char_code < 0x80)
                            result += Twig.lib.sprintf("&#x%02s;", char_code.toString(16).toUpperCase());
                        else
                            result += Twig.lib.sprintf("&#x%04s;", char_code.toString(16).toUpperCase());
                    }
                }

                return Twig.Markup(result, 'html_attr');
            } else {
                throw new Twig.Error("escape strategy unsupported");
            }
        },

        /* Alias of escape */
        "e": function(value, params) {
            return Twig.filters.escape(value, params);
        },

        nl2br: function(value) {
            if (value === undefined || value === null){
                return;
            }
            var linebreak_tag = "BACKSLASH_n_replace",
                br = "<br />" + linebreak_tag;

            value = Twig.filters.escape(value)
                        .replace(/\r\n/g, br)
                        .replace(/\r/g, br)
                        .replace(/\n/g, br);

            value = Twig.lib.replaceAll(value, linebreak_tag, "\n");

            return Twig.Markup(value);
        },

        /**
         * Adapted from: http://phpjs.org/functions/number_format:481
         */
        number_format: function(value, params) {
            var number = value,
                decimals = (params && params[0]) ? params[0] : undefined,
                dec      = (params && params[1] !== undefined) ? params[1] : ".",
                sep      = (params && params[2] !== undefined) ? params[2] : ",";

            number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
            var n = !isFinite(+number) ? 0 : +number,
                prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
                s = '',
                toFixedFix = function (n, prec) {
                    var k = Math.pow(10, prec);
                    return '' + Math.round(n * k) / k;
                };
            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
            if (s[0].length > 3) {
                s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
            }
            if ((s[1] || '').length < prec) {
                s[1] = s[1] || '';
                s[1] += new Array(prec - s[1].length + 1).join('0');
            }
            return s.join(dec);
        },

        trim: function(value, params) {
            if (value === undefined|| value === null){
                return;
            }

            var str = '' + value,
                whitespace;
            if ( params && params[0] ) {
                whitespace = '' + params[0];
            } else {
                whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
            }
            for (var i = 0; i < str.length; i++) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(i);
                    break;
                }
            }
            for (i = str.length - 1; i >= 0; i--) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
        },

        truncate: function (value, params) {
            var length = 30,
                preserve = false,
                separator = '...';

            value =  value + '';
            if (params) {
                if (params[0]) {
                    length = params[0];
                }
                if (params[1]) {
                    preserve = params[1];
                }
                if (params[2]) {
                    separator = params[2];
                }
            }

            if (value.length > length) {

                if (preserve) {
                    length = value.indexOf(' ', length);
                    if (length === -1) {
                        return value;
                    }
                }

                value =  value.substr(0, length) + separator;
            }

            return value;
        },

        slice: function(value, params) {
            if (value === undefined || value === null) {
                return;
            }
            if (params === undefined || params.length < 1) {
                throw new Twig.Error("slice filter expects at least 1 argument");
            }

            // default to start of string
            var start = params[0] || 0;
            // default to length of string
            var length = params.length > 1 ? params[1] : value.length;
            // handle negative start values
            var startIndex = start >= 0 ? start : Math.max( value.length + start, 0 );

            if (Twig.lib.is("Array", value)) {
                var output = [];
                for (var i = startIndex; i < startIndex + length && i < value.length; i++) {
                    output.push(value[i]);
                }
                return output;
            } else if (Twig.lib.is("String", value)) {
                return value.substr(startIndex, length);
            } else {
                throw new Twig.Error("slice filter expects value to be an array or string");
            }
        },

        abs: function(value) {
            if (value === undefined || value === null) {
                return;
            }

            return Math.abs(value);
        },

        first: function(value) {
            if (is("Array", value)) {
                return value[0];
            } else if (is("Object", value)) {
                if ('_keys' in value) {
                    return value[value._keys[0]];
                }
            } else if ( typeof value === "string" ) {
                return value.substr(0, 1);
            }

            return;
        },

        split: function(value, params) {
            if (value === undefined || value === null) {
                return;
            }
            if (params === undefined || params.length < 1 || params.length > 2) {
                throw new Twig.Error("split filter expects 1 or 2 argument");
            }
            if (Twig.lib.is("String", value)) {
                var delimiter = params[0],
                    limit = params[1],
                    split = value.split(delimiter);

                if (limit === undefined) {

                    return split;

                } else if (limit < 0) {

                    return value.split(delimiter, split.length + limit);

                } else {

                    var limitedSplit = [];

                    if (delimiter == '') {
                        // empty delimiter
                        // "aabbcc"|split('', 2)
                        //     -> ['aa', 'bb', 'cc']

                        while(split.length > 0) {
                            var temp = "";
                            for (var i=0; i<limit && split.length > 0; i++) {
                                temp += split.shift();
                            }
                            limitedSplit.push(temp);
                        }

                    } else {
                        // non-empty delimiter
                        // "one,two,three,four,five"|split(',', 3)
                        //     -> ['one', 'two', 'three,four,five']

                        for (var i=0; i<limit-1 && split.length > 0; i++) {
                            limitedSplit.push(split.shift());
                        }

                        if (split.length > 0) {
                            limitedSplit.push(split.join(delimiter));
                        }
                    }

                    return limitedSplit;
                }

            } else {
                throw new Twig.Error("split filter expects value to be a string");
            }
        },
        last: function(value) {
            if (Twig.lib.is('Object', value)) {
                var keys;

                if (value._keys === undefined) {
                    keys = Object.keys(value);
                } else {
                    keys = value._keys;
                }

                return value[keys[keys.length - 1]];
            }

            // string|array
            return value[value.length - 1];
        },
        raw: function(value) {
            return Twig.Markup(value);
        },
        batch: function(items, params) {
            var size = params.shift(),
                fill = params.shift(),
                result,
                last,
                missing;

            if (!Twig.lib.is("Array", items)) {
                throw new Twig.Error("batch filter expects items to be an array");
            }

            if (!Twig.lib.is("Number", size)) {
                throw new Twig.Error("batch filter expects size to be a number");
            }

            size = Math.ceil(size);

            result = Twig.lib.chunkArray(items, size);

            if (fill && items.length % size != 0) {
                last = result.pop();
                missing = size - last.length;

                while (missing--) {
                    last.push(fill);
                }

                result.push(last);
            }

            return result;
        },
        round: function(value, params) {
            params = params || [];

            var precision = params.length > 0 ? params[0] : 0,
                method = params.length > 1 ? params[1] : "common";

            value = parseFloat(value);

            if(precision && !Twig.lib.is("Number", precision)) {
                throw new Twig.Error("round filter expects precision to be a number");
            }

            if (method === "common") {
                return Twig.lib.round(value, precision);
            }

            if(!Twig.lib.is("Function", Math[method])) {
                throw new Twig.Error("round filter expects method to be 'floor', 'ceil', or 'common'");
            }

            return Math[method](value * Math.pow(10, precision)) / Math.pow(10, precision);
        }
    };

    Twig.filter = function(filter, value, params) {
        if (!Twig.filters[filter]) {
            throw "Unable to find filter " + filter;
        }
        return Twig.filters[filter].call(this, value, params);
    };

    Twig.filter.extend = function(filter, definition) {
        Twig.filters[filter] = definition;
    };

    return Twig;

};
