// The following methods are from MDN and are available under a
// [Creative Commons Attribution-ShareAlike 2.5 License.](http://creativecommons.org/licenses/by-sa/2.5/)
//
// See:
//
// * [Array.indexOf - MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf)
// * [Array.forEach - MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach)
// * [Object.keys - MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys)

// ## twig.fills.js
//
// This file contains fills for backwards compatability.
(function() {
    "use strict";
    // Handle methods that don't yet exist in every browser

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
            if (this === void 0 || this === null) {
                throw new TypeError();
            }
            var t = Object(this);
            var len = t.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = 0;
            if (arguments.length > 0) {
                n = Number(arguments[1]);
                if (n !== n) { // shortcut for verifying if it's NaN
                    n = 0;
                } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            if (n >= len) {
                return -1;
            }
            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
            for (; k < len; k++) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        }
    };

    // Production steps of ECMA-262, Edition 5, 15.4.4.18
    // Reference: http://es5.github.com/#x15.4.4.18
    if ( !Array.prototype.forEach ) {
      Array.prototype.forEach = function( callback, thisArg ) {

        var T, k;

        if ( this == null ) {
          throw new TypeError( " this is null or not defined" );
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0; // Hack to convert O.length to a UInt32

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if ( {}.toString.call(callback) != "[object Function]" ) {
          throw new TypeError( callback + " is not a function" );
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if ( thisArg ) {
          T = thisArg;
        }

        // 6. Let k be 0
        k = 0;

        // 7. Repeat, while k < len
        while( k < len ) {

          var kValue;

          // a. Let Pk be ToString(k).
          //   This is implicit for LHS operands of the in operator
          // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
          //   This step can be combined with c
          // c. If kPresent is true, then
          if ( k in O ) {

            // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
            kValue = O[ k ];

            // ii. Call the Call internal method of callback with T as the this value and
            // argument list containing kValue, k, and O.
            callback.call( T, kValue, k, O );
          }
          // d. Increase k by 1.
          k++;
        }
        // 8. return undefined
      };
    };

    if(!Object.keys) Object.keys = function(o){
        if (o !== Object(o)) {
            throw new TypeError('Object.keys called on non-object');
        }
        var ret = [], p;
        for (p in o) if (Object.prototype.hasOwnProperty.call(o, p)) ret.push(p);
        return ret;
    }

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
})();
