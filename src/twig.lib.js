// ## twig.lib.js
//
// This file contains 3rd party libraries used within twig.
//
// Copies of the licenses for the code included here can be found in the
// LICENSES.md file.
//

var Twig = (function(Twig) {

    // Namespace for libraries
    Twig.lib = { };

    /**
    sprintf() for JavaScript 0.7-beta1
    http://www.diveintojavascript.com/projects/javascript-sprintf
    **/
    var sprintf = (function() {
            function get_type(variable) {
                    return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
            }
            function str_repeat(input, multiplier) {
                    for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
                    return output.join('');
            }

            var str_format = function() {
                    if (!str_format.cache.hasOwnProperty(arguments[0])) {
                            str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
                    }
                    return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
            };

            str_format.format = function(parse_tree, argv) {
                    var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
                    for (i = 0; i < tree_length; i++) {
                            node_type = get_type(parse_tree[i]);
                            if (node_type === 'string') {
                                    output.push(parse_tree[i]);
                            }
                            else if (node_type === 'array') {
                                    match = parse_tree[i]; // convenience purposes only
                                    if (match[2]) { // keyword argument
                                            arg = argv[cursor];
                                            for (k = 0; k < match[2].length; k++) {
                                                    if (!arg.hasOwnProperty(match[2][k])) {
                                                            throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
                                                    }
                                                    arg = arg[match[2][k]];
                                            }
                                    }
                                    else if (match[1]) { // positional argument (explicit)
                                            arg = argv[match[1]];
                                    }
                                    else { // positional argument (implicit)
                                            arg = argv[cursor++];
                                    }

                                    if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
                                            throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
                                    }
                                    switch (match[8]) {
                                            case 'b': arg = arg.toString(2); break;
                                            case 'c': arg = String.fromCharCode(arg); break;
                                            case 'd': arg = parseInt(arg, 10); break;
                                            case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
                                            case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
                                            case 'o': arg = arg.toString(8); break;
                                            case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
                                            case 'u': arg = Math.abs(arg); break;
                                            case 'x': arg = arg.toString(16); break;
                                            case 'X': arg = arg.toString(16).toUpperCase(); break;
                                    }
                                    arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
                                    pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
                                    pad_length = match[6] - String(arg).length;
                                    pad = match[6] ? str_repeat(pad_character, pad_length) : '';
                                    output.push(match[5] ? arg + pad : pad + arg);
                            }
                    }
                    return output.join('');
            };

            str_format.cache = {};

            str_format.parse = function(fmt) {
                    var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
                    while (_fmt) {
                            if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
                                    parse_tree.push(match[0]);
                            }
                            else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
                                    parse_tree.push('%');
                            }
                            else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                                    if (match[2]) {
                                            arg_names |= 1;
                                            var field_list = [], replacement_field = match[2], field_match = [];
                                            if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                                    field_list.push(field_match[1]);
                                                    while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                                                            if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                                                    field_list.push(field_match[1]);
                                                            }
                                                            else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                                                                    field_list.push(field_match[1]);
                                                            }
                                                            else {
                                                                    throw('[sprintf] huh?');
                                                            }
                                                    }
                                            }
                                            else {
                                                    throw('[sprintf] huh?');
                                            }
                                            match[2] = field_list;
                                    }
                                    else {
                                            arg_names |= 2;
                                    }
                                    if (arg_names === 3) {
                                            throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
                                    }
                                    parse_tree.push(match);
                            }
                            else {
                                    throw('[sprintf] huh?');
                            }
                            _fmt = _fmt.substring(match[0].length);
                    }
                    return parse_tree;
            };

            return str_format;
    })();

    var vsprintf = function(fmt, argv) {
     	argv.unshift(fmt);
        return sprintf.apply(null, argv);
    };

    // Expose to Twig
    Twig.lib.sprintf = sprintf;
    Twig.lib.vsprintf = vsprintf;


    /**
     * jPaq - A fully customizable JavaScript/JScript library
     * http://jpaq.org/
     *
     * Copyright (c) 2011 Christopher West
     * Licensed under the MIT license.
     * http://jpaq.org/license/
     *
     * Version: 1.0.6.0000W
     * Revised: April 6, 2011
     */
    ; (function() {
        var jPaq = {
                toString : function() {
                        /// <summary>
                        ///   Get a brief description of this library.
                        /// </summary>
                        /// <returns type="String">
                        ///   Returns a brief description of this library.
                        /// </returns>
                        return "jPaq - A fully customizable JavaScript/JScript library created by Christopher West.";
                }
        };
        var shortDays = "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",");
        var fullDays = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",");
        var shortMonths = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
        var fullMonths = "January,February,March,April,May,June,July,August,September,October,November,December".split(",");
        function getOrdinalFor(intNum) {
                return (((intNum = Math.abs(intNum) % 100) % 10 == 1 && intNum != 11) ? "st"
                        : (intNum % 10 == 2 && intNum != 12) ? "nd" : (intNum % 10 == 3
                        && intNum != 13) ? "rd" : "th");
        }
        function getISO8601Year(aDate) {
                var d = new Date(aDate.getFullYear() + 1, 0, 4);
                if((d - aDate) / 86400000 < 7 && (aDate.getDay() + 6) % 7 < (d.getDay() + 6) % 7)
                        return d.getFullYear();
                if(aDate.getMonth() > 0 || aDate.getDate() >= 4)
                        return aDate.getFullYear();
                return aDate.getFullYear() - (((aDate.getDay() + 6) % 7 - aDate.getDate() > 2) ? 1 : 0);
        }
        function getISO8601Week(aDate) {
                // Get a day during the first week of the year.
                var d = new Date(getISO8601Year(aDate), 0, 4);
                // Get the first monday of the year.
                d.setDate(d.getDate() - (d.getDay() + 6) % 7);
                return parseInt((aDate - d) / 604800000) + 1;
        }
        Date.prototype.setFromString = function(string)
        {
            var parts;

            /**
             * Default format : ISO 8601
             */
            if (parts = string.match(
                    /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})T([0-9]{2})\:([0-9]{2})\:([0-9]{2})(\+|\-)([0-9]{2}):([0-9]{2})$/
                ))
            {
                this.setFullYear(
                    parseInt(parts[1], 10),
                    parseInt(parts[2], 10) - 1,
                    parseInt(parts[3], 10)
                );
                this.setHours(parseInt(parts[4], 10));
                this.setMinutes(parseInt(parts[5], 10));
                this.setSeconds(parseInt(parts[6], 10));

                /**
                 * Convert date to GMT
                 */
                this.setMinutes(
                    this.getMinutes() -
                    parseInt(               // Hours
                        parts[7]+parts[8],
                        10
                    ) * 60 -
                    parseInt(               // Minutes
                        parts[7]+parts[9],
                        10
                    ) -                     // Client timezone offset in minutes
                    this.getTimezoneOffset()
                );
            }

            /**
             * database datetime format
             */
            else if (parts = string.match(
                    /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})\s([0-9]{2})\:([0-9]{2})\:?([0-9]{2})?$/
                ))
            {
                this.setFullYear(
                    parseInt(parts[1], 10),
                    parseInt(parts[2], 10) - 1,
                    parseInt(parts[3], 10)
                );
                this.setHours(parseInt(parts[4], 10));
                this.setMinutes(parseInt(parts[5], 10));
                parts[6] &&
                    this.setSeconds(parseInt(parts[6], 10)) ||
                    this.setSeconds(0);
            }
            /**
             * database date format
             */
            else if (parts = string.match(
                    /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/
                ))
            {
                this.setFullYear(
                    parseInt(parts[1], 10),
                    parseInt(parts[2], 10) - 1,
                    parseInt(parts[3], 10)
                );
                this.setHours(0);
                this.setMinutes(0);
                this.setSeconds(0);
            }
            else
            {
                throw new Error("Invalid string format");
            }

            return this;
        }
        Date.prototype.format = function(format) {
            /// <summary>
            ///   Gets a string for this date, formatted according to the given format
            ///   string.
            /// </summary>
            /// <param name="format" type="String">
            ///   The format of the output date string.  The format string works in a
            ///   nearly identical way to the PHP date function which is highlighted here:
            ///   http://php.net/manual/en/function.date.php.
            ///   The only difference is the fact that "u" signifies milliseconds
            ///   instead of microseconds.  The following characters are recognized in
            ///   the format parameter string:
            ///     d - Day of the month, 2 digits with leading zeros
            ///     D - A textual representation of a day, three letters
            ///     j - Day of the month without leading zeros
            ///     l (lowercase 'L') - A full textual representation of the day of the week
            ///     N - ISO-8601 numeric representation of the day of the week (starting from 1)
            ///     S - English ordinal suffix for the day of the month, 2 characters st,
            ///         nd, rd or th. Works well with j.
            ///     w - Numeric representation of the day of the week (starting from 0)
            ///     z - The day of the year (starting from 0)
            ///     W - ISO-8601 week number of year, weeks starting on Monday
            ///     F - A full textual representation of a month, such as January or March
            ///     m - Numeric representation of a month, with leading zeros
            ///     M - A short textual representation of a month, three letters
            ///     n - Numeric representation of a month, without leading zeros
            ///     t - Number of days in the given month
            ///     L - Whether it's a leap year
            ///     o - ISO-8601 year number. This has the same value as Y, except that if
            ///         the ISO week number (W) belongs to the previous or next year, that
            ///         year is used instead.
            ///     Y - A full numeric representation of a year, 4 digits
            ///     y - A two digit representation of a year
            ///     a - Lowercase Ante meridiem and Post meridiem
            ///     A - Uppercase Ante meridiem and Post meridiem
            ///     B - Swatch Internet time
            ///     g - 12-hour format of an hour without leading zeros
            ///     G - 24-hour format of an hour without leading zeros
            ///     h - 12-hour format of an hour with leading zeros
            ///     H - 24-hour format of an hour with leading zeros
            ///     i - Minutes with leading zeros
            ///     s - Seconds, with leading zeros
            ///     u - Milliseconds
            /// </param>
            /// <returns type="String">
            ///   Returns the string for this date, formatted according to the given
            ///   format string.
            /// </returns>
            // If the format was not passed, use the default toString method.
            if(typeof format !== "string" || /^\s*$/.test(format))
                    return this + "";
            var jan1st = new Date(this.getFullYear(), 0, 1);
            var me = this;
            return format.replace(/[dDjlNSwzWFmMntLoYyaABgGhHisu]/g, function(option) {
                switch(option) {
                    // Day of the month, 2 digits with leading zeros
                    case "d": return ("0" + me.getDate()).replace(/^.+(..)$/, "$1");
                    // A textual representation of a day, three letters
                    case "D": return shortDays[me.getDay()];
                    // Day of the month without leading zeros
                    case "j": return me.getDate();
                    // A full textual representation of the day of the week
                    case "l": return fullDays[me.getDay()];
                    // ISO-8601 numeric representation of the day of the week
                    case "N": return (me.getDay() + 6) % 7 + 1;
                    // English ordinal suffix for the day of the month, 2 characters
                    case "S": return getOrdinalFor(me.getDate());
                    // Numeric representation of the day of the week
                    case "w": return me.getDay();
                    // The day of the year (starting from 0)
                    case "z": return Math.ceil((jan1st - me) / 86400000);
                    // ISO-8601 week number of year, weeks starting on Monday
                    case "W": return ("0" + getISO8601Week(me)).replace(/^.(..)$/, "$1");
                    // A full textual representation of a month, such as January or March
                    case "F": return fullMonths[me.getMonth()];
                    // Numeric representation of a month, with leading zeros
                    case "m": return ("0" + (me.getMonth() + 1)).replace(/^.+(..)$/, "$1");
                    // A short textual representation of a month, three letters
                    case "M": return shortMonths[me.getMonth()];
                    // Numeric representation of a month, without leading zeros
                    case "n": return me.getMonth() + 1;
                    // Number of days in the given month
                    case "t": return new Date(me.getFullYear(), me.getMonth() + 1, -1).getDate();
                    // Whether it's a leap year
                    case "L": return new Date(me.getFullYear(), 1, 29).getDate() == 29 ? 1 : 0;
                    // ISO-8601 year number. This has the same value as Y, except that if the
                    // ISO week number (W) belongs to the previous or next year, that year is
                    // used instead.
                    case "o": return getISO8601Year(me);
                    // A full numeric representation of a year, 4 digits
                    case "Y": return me.getFullYear();
                    // A two digit representation of a year
                    case "y": return (me.getFullYear() + "").replace(/^.+(..)$/, "$1");
                    // Lowercase Ante meridiem and Post meridiem
                    case "a": return me.getHours() < 12 ? "am" : "pm";
                    // Uppercase Ante meridiem and Post meridiem
                    case "A": return me.getHours() < 12 ? "AM" : "PM";
                    // Swatch Internet time
                    case "B": return Math.floor((((me.getUTCHours() + 1) % 24) + me.getUTCMinutes() / 60 + me.getUTCSeconds() / 3600) * 1000 / 24);
                    // 12-hour format of an hour without leading zeros
                    case "g": return me.getHours() % 12 != 0 ? me.getHours() % 12 : 12;
                    // 24-hour format of an hour without leading zeros
                    case "G": return me.getHours();
                    // 12-hour format of an hour with leading zeros
                    case "h": return ("0" + (me.getHours() % 12 != 0 ? me.getHours() % 12 : 12)).replace(/^.+(..)$/, "$1");
                    // 24-hour format of an hour with leading zeros
                    case "H": return ("0" + me.getHours()).replace(/^.+(..)$/, "$1");
                    // Minutes with leading zeros
                    case "i": return ("0" + me.getMinutes()).replace(/^.+(..)$/, "$1");
                    // Seconds, with leading zeros
                    case "s": return ("0" + me.getSeconds()).replace(/^.+(..)$/, "$1");
                    // Milliseconds
                    case "u": return me.getMilliseconds();
                }
            });
        };
    })();


    Twig.lib.strip_tags = function(input, allowed) {
        // Strips HTML and PHP tags from a string
        //
        // version: 1109.2015
        // discuss at: http://phpjs.org/functions/strip_tags
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Luke Godfrey
        // +      input by: Pul
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Onno Marsman
        // +      input by: Alex
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Marc Palau
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Eric Nagel
        // +      input by: Bobby Drake
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Tomasz Wesolowski
        // +      input by: Evertjan Garretsen
        // +    revised by: Rafał Kukawski (http://blog.kukawski.pl/)
        // *     example 1: strip_tags('<p>Kevin</p> <b>van</b> <i>Zonneveld</i>', '<i><b>');
        // *     returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
        // *     example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
        // *     returns 2: '<p>Kevin van Zonneveld</p>'
        // *     example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
        // *     returns 3: '<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>'
        // *     example 4: strip_tags('1 < 5 5 > 1');
        // *     returns 4: '1 < 5 5 > 1'
        // *     example 5: strip_tags('1 <br/> 1');
        // *     returns 5: '1  1'
        // *     example 6: strip_tags('1 <br/> 1', '<br>');
        // *     returns 6: '1  1'
        // *     example 7: strip_tags('1 <br/> 1', '<br><br/>');
        // *     returns 7: '1 <br/> 1'
        allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
        return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
    }

    return Twig;

})(Twig || { });
