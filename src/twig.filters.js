// ## twig.filters.js
//
// This file handles parsing filters.
module.exports = function (Twig) {
    // Determine object type
    function is(type, obj) {
        const clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    Twig.filters = {
        // String Filters
        upper(value) {
            if (typeof value !== 'string') {
                return value;
            }

            return value.toUpperCase();
        },
        lower(value) {
            if (typeof value !== 'string') {
                return value;
            }

            return value.toLowerCase();
        },
        capitalize(value) {
            if (typeof value !== 'string') {
                return value;
            }

            return value.slice(0, 1).toUpperCase() + value.toLowerCase().slice(1);
        },
        title(value) {
            if (typeof value !== 'string') {
                return value;
            }

            return value.toLowerCase().replace(/(^|\s)([a-z])/g, (m, p1, p2) => {
                return p1 + p2.toUpperCase();
            });
        },
        length(value) {
            if (Twig.lib.is('Array', value) || typeof value === 'string') {
                return value.length;
            }

            if (Twig.lib.is('Object', value)) {
                if (value._keys === undefined) {
                    return Object.keys(value).length;
                }

                return value._keys.length;
            }

            return 0;
        },

        // Array/Object Filters
        reverse(value) {
            if (is('Array', value)) {
                return value.reverse();
            }

            if (is('String', value)) {
                return value.split('').reverse().join('');
            }

            if (is('Object', value)) {
                const keys = value._keys || Object.keys(value).reverse();
                value._keys = keys;
                return value;
            }
        },
        sort(value) {
            if (is('Array', value)) {
                return value.sort();
            }

            if (is('Object', value)) {
                // Sorting objects isn't obvious since the order of
                // returned keys isn't guaranteed in JavaScript.
                // Because of this we use a "hidden" key called _keys to
                // store the keys in the order we want to return them.

                delete value._keys;
                const keys = Object.keys(value);
                const sortedKeys = keys.sort((a, b) => {
                    let a1;
                    let b1;

                    // If a and b are comparable, we're fine :-)
                    if ((value[a] > value[b]) === !(value[a] <= value[b])) {
                        return value[a] > value[b] ? 1 :
                            (value[a] < value[b] ? -1 : 0);
                    }

                    // If a and b can be parsed as numbers, we can compare
                    // their numeric value
                    if (!isNaN(a1 = parseFloat(value[a])) &&
                                !isNaN(b1 = parseFloat(value[b]))) {
                        return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                    }

                    // If one of the values is a string, we convert the
                    // other value to string as well
                    if (typeof value[a] === 'string') {
                        return value[a] > value[b].toString() ? 1 :
                            (value[a] < value[b].toString() ? -1 : 0);
                    }

                    if (typeof value[b] === 'string') {
                        return value[a].toString() > value[b] ? 1 :
                            (value[a].toString() < value[b] ? -1 : 0);
                    }
                    // Everything failed - return 'null' as sign, that
                    // the values are not comparable

                    return null;
                });
                value._keys = sortedKeys;
                return value;
            }
        },
        keys(value) {
            if (value === undefined || value === null) {
                return;
            }

            const keyset = value._keys || Object.keys(value);
            const output = [];

            keyset.forEach(key => {
                if (key === '_keys') {
                    return;
                } // Ignore the _keys property

                if (Object.hasOwnProperty.call(value, key)) {
                    output.push(key);
                }
            });
            return output;
        },
        /* eslint-disable-next-line camelcase */
        url_encode(value) {
            if (value === undefined || value === null) {
                return;
            }

            if (Twig.lib.is('Object', value)) {
                const serialize = function (obj, prefix) {
                    const result = [];
                    const keyset = obj._keys || Object.keys(obj);

                    keyset.forEach(key => {
                        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
                            return;
                        }

                        const resultKey = prefix ? prefix + '[' + key + ']' : key;
                        const resultValue = obj[key];

                        result.push(
                            (Twig.lib.is('Object', resultValue) || Array.isArray(resultValue)) ?
                                serialize(resultValue, resultKey) :
                                encodeURIComponent(resultKey) + '=' + encodeURIComponent(resultValue)
                        );
                    });

                    return result.join('&amp;');
                };

                return serialize(value);
            }

            let result = encodeURIComponent(value);
            result = result.replace('\'', '%27');
            return result;
        },
        join(value, params) {
            if (value === undefined || value === null) {
                return;
            }

            let joinStr = '';
            let output = [];
            let keyset = null;

            if (params && params[0]) {
                joinStr = params[0];
            }

            if (is('Array', value)) {
                output = value;
            } else {
                keyset = value._keys || Object.keys(value);
                keyset.forEach(key => {
                    if (key === '_keys') {
                        return;
                    } // Ignore the _keys property

                    if (Object.hasOwnProperty.call(value, key)) {
                        output.push(value[key]);
                    }
                });
            }

            return output.join(joinStr);
        },
        default(value, params) {
            if (params !== undefined && params.length > 1) {
                throw new Twig.Error('default filter expects one argument');
            }

            if (value === undefined || value === null || value === '') {
                if (params === undefined) {
                    return '';
                }

                return params[0];
            }

            return value;
        },
        /* eslint-disable-next-line camelcase */
        json_encode(value) {
            if (value === undefined || value === null) {
                return 'null';
            }

            if ((typeof value === 'object') && (is('Array', value))) {
                const output = [];

                value.forEach(v => {
                    output.push(Twig.filters.json_encode(v));
                });

                return '[' + output.join(',') + ']';
            }

            if ((typeof value === 'object') && (is('Date', value))) {
                return '"' + value.toISOString() + '"';
            }

            if (typeof value === 'object') {
                const keyset = value._keys || Object.keys(value);
                const output = [];

                keyset.forEach(key => {
                    output.push(JSON.stringify(key) + ':' + Twig.filters.json_encode(value[key]));
                });

                return '{' + output.join(',') + '}';
            }

            return JSON.stringify(value);
        },
        merge(value, params) {
            let obj = [];
            let arrIndex = 0;
            let keyset = [];

            // Check to see if all the objects being merged are arrays
            if (is('Array', value)) {
                params.forEach(param => {
                    if (!is('Array', param)) {
                        obj = { };
                    }
                });
            } else {
                // Create obj as an Object
                obj = { };
            }

            if (!is('Array', obj)) {
                obj._keys = [];
            }

            if (is('Array', value)) {
                value.forEach(val => {
                    if (obj._keys) {
                        obj._keys.push(arrIndex);
                    }

                    obj[arrIndex] = val;
                    arrIndex++;
                });
            } else {
                keyset = value._keys || Object.keys(value);
                keyset.forEach(key => {
                    obj[key] = value[key];
                    obj._keys.push(key);

                    // Handle edge case where a number index in an object is greater than
                    //   the array counter. In such a case, the array counter is increased
                    //   one past the index.
                    //
                    // Example {{ ["a", "b"]|merge({"4":"value"}, ["c", "d"])
                    // Without this, d would have an index of "4" and overwrite the value
                    //   of "value"
                    const intKey = parseInt(key, 10);
                    if (!isNaN(intKey) && intKey >= arrIndex) {
                        arrIndex = intKey + 1;
                    }
                });
            }

            // Mixin the merge arrays
            params.forEach(param => {
                if (is('Array', param)) {
                    param.forEach(val => {
                        if (obj._keys) {
                            obj._keys.push(arrIndex);
                        }

                        obj[arrIndex] = val;
                        arrIndex++;
                    });
                } else {
                    keyset = param._keys || Object.keys(param);
                    keyset.forEach(key => {
                        if (!obj[key]) {
                            obj._keys.push(key);
                        }

                        obj[key] = param[key];

                        const intKey = parseInt(key, 10);
                        if (!isNaN(intKey) && intKey >= arrIndex) {
                            arrIndex = intKey + 1;
                        }
                    });
                }
            });
            if (params.length === 0) {
                throw new Twig.Error('Filter merge expects at least one parameter');
            }

            return obj;
        },

        date(value, params) {
            const date = Twig.functions.date(value);
            const format = params && Boolean(params.length) ? params[0] : 'F j, Y H:i';
            return Twig.lib.date(format.replace(/\\\\/g, '\\'), date);
        },
        /* eslint-disable-next-line camelcase */
        date_modify(value, params) {
            if (value === undefined || value === null) {
                return;
            }

            if (params === undefined || params.length !== 1) {
                throw new Twig.Error('date_modify filter expects 1 argument');
            }

            const modifyText = params[0];
            let time;

            if (Twig.lib.is('Date', value)) {
                time = Twig.lib.strtotime(modifyText, value.getTime() / 1000);
            }

            if (Twig.lib.is('String', value)) {
                time = Twig.lib.strtotime(modifyText, Twig.lib.strtotime(value));
            }

            if (Twig.lib.is('Number', value)) {
                time = Twig.lib.strtotime(modifyText, value);
            }

            return new Date(time * 1000);
        },

        replace(value, params) {
            if (value === undefined || value === null) {
                return;
            }

            const pairs = params[0];
            let tag;
            for (tag in pairs) {
                if (Object.hasOwnProperty.call(pairs, tag) && tag !== '_keys') {
                    value = Twig.lib.replaceAll(value, tag, pairs[tag]);
                }
            }

            return value;
        },

        format(value, params) {
            if (value === undefined || value === null) {
                return;
            }

            return Twig.lib.vsprintf(value, params);
        },

        striptags(value, allowed) {
            if (value === undefined || value === null) {
                return;
            }

            return Twig.lib.stripTags(value, allowed);
        },

        escape(value, params) {
            if (value === undefined || value === null || value === '') {
                return;
            }

            let strategy = 'html';
            if (params && Boolean(params.length) && params[0] !== true) {
                strategy = params[0];
            }

            if (strategy === 'html') {
                const rawValue = value.toString().replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
                return new Twig.Markup(rawValue, 'html');
            }

            if (strategy === 'js') {
                const rawValue = value.toString();
                let result = '';

                for (let i = 0; i < rawValue.length; i++) {
                    if (rawValue[i].match(/^[a-zA-Z0-9,._]$/)) {
                        result += rawValue[i];
                    } else {
                        const char = rawValue.charAt(i);
                        const charCode = rawValue.charCodeAt(i);

                        // A few characters have short escape sequences in JSON and JavaScript.
                        // Escape sequences supported only by JavaScript, not JSON, are ommitted.
                        // \" is also supported but omitted, because the resulting string is not HTML safe.
                        const shortMap = {
                            '\\': '\\\\',
                            '/': '\\/',
                            '\u0008': '\\b',
                            '\u000C': '\\f',
                            '\u000A': '\\n',
                            '\u000D': '\\r',
                            '\u0009': '\\t'
                        };

                        if (shortMap[char]) {
                            result += shortMap[char];
                        } else {
                            result += Twig.lib.sprintf('\\u%04s', charCode.toString(16).toUpperCase());
                        }
                    }
                }

                return new Twig.Markup(result, 'js');
            }

            if (strategy === 'css') {
                const rawValue = value.toString();
                let result = '';

                for (let i = 0; i < rawValue.length; i++) {
                    if (rawValue[i].match(/^[a-zA-Z0-9]$/)) {
                        result += rawValue[i];
                    } else {
                        const charCode = rawValue.charCodeAt(i);
                        result += '\\' + charCode.toString(16).toUpperCase() + ' ';
                    }
                }

                return new Twig.Markup(result, 'css');
            }

            if (strategy === 'url') {
                const result = Twig.filters.url_encode(value);
                return new Twig.Markup(result, 'url');
            }

            if (strategy === 'html_attr') {
                const rawValue = value.toString();
                let result = '';

                for (let i = 0; i < rawValue.length; i++) {
                    if (rawValue[i].match(/^[a-zA-Z0-9,.\-_]$/)) {
                        result += rawValue[i];
                    } else if (rawValue[i].match(/^[&<>"]$/)) {
                        result += rawValue[i].replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;');
                    } else {
                        const charCode = rawValue.charCodeAt(i);

                        // The following replaces characters undefined in HTML with
                        // the hex entity for the Unicode replacement character.
                        if (charCode <= 0x1F && charCode !== 0x09 && charCode !== 0x0A && charCode !== 0x0D) {
                            result += '&#xFFFD;';
                        } else if (charCode < 0x80) {
                            result += Twig.lib.sprintf('&#x%02s;', charCode.toString(16).toUpperCase());
                        } else {
                            result += Twig.lib.sprintf('&#x%04s;', charCode.toString(16).toUpperCase());
                        }
                    }
                }

                return new Twig.Markup(result, 'html_attr');
            }

            throw new Twig.Error('escape strategy unsupported');
        },

        /* Alias of escape */
        e(value, params) {
            return Twig.filters.escape(value, params);
        },

        nl2br(value) {
            if (value === undefined || value === null || value === '') {
                return;
            }

            const linebreakTag = 'BACKSLASH_n_replace';
            const br = '<br />' + linebreakTag;

            value = Twig.filters.escape(value)
                .replace(/\r\n/g, br)
                .replace(/\r/g, br)
                .replace(/\n/g, br);

            value = Twig.lib.replaceAll(value, linebreakTag, '\n');

            return new Twig.Markup(value);
        },

        /**
         * Adapted from: http://phpjs.org/functions/number_format:481
         */
        /* eslint-disable-next-line camelcase */
        number_format(value, params) {
            let number = value;
            const decimals = (params && params[0]) ? params[0] : undefined;
            const dec = (params && params[1] !== undefined) ? params[1] : '.';
            const sep = (params && params[2] !== undefined) ? params[2] : ',';

            number = (String(number)).replace(/[^0-9+\-Ee.]/g, '');
            const n = isFinite(Number(number)) ? Number(number) : 0;
            const prec = isFinite(Number(decimals)) ? Math.abs(decimals) : 0;
            let s = '';
            const toFixedFix = function (n, prec) {
                const k = 10 ** prec;
                return String(Math.round(n * k) / k);
            };

            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            s = (prec ? toFixedFix(n, prec) : String(Math.round(n))).split('.');
            if (s[0].length > 3) {
                s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
            }

            if ((s[1] || '').length < prec) {
                s[1] = s[1] || '';
                s[1] += new Array(prec - s[1].length + 1).join('0');
            }

            return s.join(dec);
        },

        trim(value, params) {
            if (value === undefined || value === null) {
                return;
            }

            let str = String(value);
            let whitespace;
            if (params && params[0]) {
                whitespace = String(params[0]);
            } else {
                whitespace = ' \n\r\t\f\u000B\u00A0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
            }

            for (let i = 0; i < str.length; i++) {
                if (!whitespace.includes(str.charAt(i))) {
                    str = str.slice(Math.max(0, i));
                    break;
                }
            }

            for (let i = str.length - 1; i >= 0; i--) {
                if (!whitespace.includes(str.charAt(i))) {
                    str = str.slice(0, Math.max(0, i + 1));
                    break;
                }
            }

            return whitespace.includes(str.charAt(0)) ? '' : str;
        },

        truncate(value, params) {
            let length = 30;
            let preserve = false;
            let separator = '...';

            value = String(value);
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

                value = value.slice(0, length) + separator;
            }

            return value;
        },

        slice(value, params) {
            if (value === undefined || value === null) {
                return;
            }

            if (params === undefined || params.length === 0) {
                throw new Twig.Error('slice filter expects at least 1 argument');
            }

            // Default to start of string
            const start = params[0] || 0;
            // Default to length of string
            let length = params.length > 1 ? params[1] : value.length;
            // Handle negative start values
            const startIndex = start >= 0 ? start : Math.max(value.length + start, 0);
            // Handle negative length values
            if (length < 0) {
                length = value.length - startIndex + length;
            }

            if (Twig.lib.is('Array', value)) {
                const output = [];
                for (let i = startIndex; i < startIndex + length && i < value.length; i++) {
                    output.push(value[i]);
                }

                return output;
            }

            if (Twig.lib.is('String', value)) {
                return value.slice(startIndex, startIndex + length);
            }

            throw new Twig.Error('slice filter expects value to be an array or string');
        },

        abs(value) {
            if (value === undefined || value === null) {
                return;
            }

            return Math.abs(value);
        },

        first(value) {
            if (is('Array', value)) {
                return value[0];
            }

            if (is('Object', value)) {
                if ('_keys' in value) {
                    return value[value._keys[0]];
                }
            } else if (typeof value === 'string') {
                return value.slice(0, 1);
            }
        },

        split(value, params) {
            if (value === undefined || value === null) {
                return;
            }

            if (params === undefined || params.length === 0 || params.length > 2) {
                throw new Twig.Error('split filter expects 1 or 2 argument');
            }

            if (Twig.lib.is('String', value)) {
                const delimiter = params[0];
                const limit = params[1];
                const split = value.split(delimiter);

                if (limit === undefined) {
                    return split;
                }

                if (limit < 0) {
                    return value.split(delimiter, split.length + limit);
                }

                const limitedSplit = [];

                if (delimiter === '') {
                    // Empty delimiter
                    // "aabbcc"|split('', 2)
                    //     -> ['aa', 'bb', 'cc']

                    while (split.length > 0) {
                        let temp = '';
                        for (let i = 0; i < limit && split.length > 0; i++) {
                            temp += split.shift();
                        }

                        limitedSplit.push(temp);
                    }
                } else {
                    // Non-empty delimiter
                    // "one,two,three,four,five"|split(',', 3)
                    //     -> ['one', 'two', 'three,four,five']

                    for (let i = 0; i < limit - 1 && split.length > 0; i++) {
                        limitedSplit.push(split.shift());
                    }

                    if (split.length > 0) {
                        limitedSplit.push(split.join(delimiter));
                    }
                }

                return limitedSplit;
            }

            throw new Twig.Error('split filter expects value to be a string');
        },
        last(value) {
            if (Twig.lib.is('Object', value)) {
                let keys;

                if (value._keys === undefined) {
                    keys = Object.keys(value);
                } else {
                    keys = value._keys;
                }

                return value[keys[keys.length - 1]];
            }

            if (Twig.lib.is('Number', value)) {
                return value.toString().slice(-1);
            }

            // String|array
            return value[value.length - 1];
        },
        raw(value) {
            return new Twig.Markup(value || '');
        },
        batch(items, params) {
            let size = params.shift();
            const fill = params.shift();
            let last;
            let missing;

            if (!Twig.lib.is('Array', items)) {
                throw new Twig.Error('batch filter expects items to be an array');
            }

            if (!Twig.lib.is('Number', size)) {
                throw new Twig.Error('batch filter expects size to be a number');
            }

            size = Math.ceil(size);

            const result = Twig.lib.chunkArray(items, size);

            if (fill && items.length % size !== 0) {
                last = result.pop();
                missing = size - last.length;

                while (missing--) {
                    last.push(fill);
                }

                result.push(last);
            }

            return result;
        },
        round(value, params) {
            params = params || [];

            const precision = params.length > 0 ? params[0] : 0;
            const method = params.length > 1 ? params[1] : 'common';

            value = parseFloat(value);

            if (precision && !Twig.lib.is('Number', precision)) {
                throw new Twig.Error('round filter expects precision to be a number');
            }

            if (method === 'common') {
                return Twig.lib.round(value, precision);
            }

            if (!Twig.lib.is('Function', Math[method])) {
                throw new Twig.Error('round filter expects method to be \'floor\', \'ceil\', or \'common\'');
            }

            return Math[method](value * (10 ** precision)) / (10 ** precision);
        },
        spaceless(value) {
            return value.replace(/>\s+</g, '><').trim();
        }
    };

    Twig.filter = function (filter, value, params) {
        const state = this;

        if (!Twig.filters[filter]) {
            throw new Twig.Error('Unable to find filter ' + filter);
        }

        return Twig.filters[filter].call(state, value, params);
    };

    Twig.filter.extend = function (filter, definition) {
        Twig.filters[filter] = definition;
    };

    return Twig;
};
