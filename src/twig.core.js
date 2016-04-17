// ## twig.core.js
//
// This file handles template level tokenizing, compiling and parsing.
module.exports = function (Twig) {
    "use strict";

    Twig.trace = false;
    Twig.debug = false;

    // Default caching to true for the improved performance it offers
    Twig.cache = true;

    Twig.placeholders = {
        parent: "{{|PARENT|}}"
    };

    /**
     * Fallback for Array.indexOf for IE8 et al
     */
    Twig.indexOf = function (arr, searchElement /*, fromIndex */ ) {
        if (Array.prototype.hasOwnProperty("indexOf")) {
            return arr.indexOf(searchElement);
        }
        if (arr === void 0 || arr === null) {
            throw new TypeError();
        }
        var t = Object(arr);
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
            // console.log("indexOf not found1 ", JSON.stringify(searchElement), JSON.stringify(arr));
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        if (arr == searchElement) {
            return 0;
        }
        // console.log("indexOf not found2 ", JSON.stringify(searchElement), JSON.stringify(arr));

        return -1;
    }

    Twig.forEach = function (arr, callback, thisArg) {
        if (Array.prototype.forEach ) {
            return arr.forEach(callback, thisArg);
        }

        var T, k;

        if ( arr == null ) {
          throw new TypeError( " this is null or not defined" );
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(arr);

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

    Twig.merge = function(target, source, onlyChanged) {
        Twig.forEach(Object.keys(source), function (key) {
            if (onlyChanged && !(key in target)) {
                return;
            }

            target[key] = source[key]
        });

        return target;
    };

    /**
     * Exception thrown by twig.js.
     */
    Twig.Error = function(message) {
       this.message = message;
       this.name = "TwigException";
       this.type = "TwigException";
    };

    /**
     * Get the string representation of a Twig error.
     */
    Twig.Error.prototype.toString = function() {
        var output = this.name + ": " + this.message;

        return output;
    };

    /**
     * Wrapper for logging to the console.
     */
    Twig.log = {
        trace: function() {if (Twig.trace && console) {console.log(Array.prototype.slice.call(arguments));}},
        debug: function() {if (Twig.debug && console) {console.log(Array.prototype.slice.call(arguments));}}
    };


    if (typeof console !== "undefined") {
        if (typeof console.error !== "undefined") {
            Twig.log.error = function() {
                console.error.apply(console, arguments);
            }
        } else if (typeof console.log !== "undefined") {
            Twig.log.error = function() {
                console.log.apply(console, arguments);
            }
        }
    } else {
        Twig.log.error = function(){};
    }

    /**
     * Wrapper for child context objects in Twig.
     *
     * @param {Object} context Values to initialize the context with.
     */
    Twig.ChildContext = function(context) {
        var ChildContext = function ChildContext() {};
        ChildContext.prototype = context;
        return new ChildContext();
    };

    /**
     * Container for methods related to handling high level template tokens
     *      (for example: {{ expression }}, {% logic %}, {# comment #}, raw data)
     */
    Twig.token = {};

    /**
     * Token types.
     */
    Twig.token.type = {
        output:                 'output',
        logic:                  'logic',
        comment:                'comment',
        raw:                    'raw',
        output_whitespace_pre:  'output_whitespace_pre',
        output_whitespace_post: 'output_whitespace_post',
        output_whitespace_both: 'output_whitespace_both',
        logic_whitespace_pre:   'logic_whitespace_pre',
        logic_whitespace_post:  'logic_whitespace_post',
        logic_whitespace_both:  'logic_whitespace_both'
    };

    /**
     * Token syntax definitions.
     */
    Twig.token.definitions = [
        {
            type: Twig.token.type.raw,
            open: '{% raw %}',
            close: '{% endraw %}'
        },
        {
            type: Twig.token.type.raw,
            open: '{% verbatim %}',
            close: '{% endverbatim %}'
        },
        // *Whitespace type tokens*
        //
        // These typically take the form `{{- expression -}}` or `{{- expression }}` or `{{ expression -}}`.
        {
            type: Twig.token.type.output_whitespace_pre,
            open: '{{-',
            close: '}}'
        },
        {
            type: Twig.token.type.output_whitespace_post,
            open: '{{',
            close: '-}}'
        },
        {
            type: Twig.token.type.output_whitespace_both,
            open: '{{-',
            close: '-}}'
        },
        {
            type: Twig.token.type.logic_whitespace_pre,
            open: '{%-',
            close: '%}'
        },
        {
            type: Twig.token.type.logic_whitespace_post,
            open: '{%',
            close: '-%}'
        },
        {
            type: Twig.token.type.logic_whitespace_both,
            open: '{%-',
            close: '-%}'
        },
        // *Output type tokens*
        //
        // These typically take the form `{{ expression }}`.
        {
            type: Twig.token.type.output,
            open: '{{',
            close: '}}'
        },
        // *Logic type tokens*
        //
        // These typically take a form like `{% if expression %}` or `{% endif %}`
        {
            type: Twig.token.type.logic,
            open: '{%',
            close: '%}'
        },
        // *Comment type tokens*
        //
        // These take the form `{# anything #}`
        {
            type: Twig.token.type.comment,
            open: '{#',
            close: '#}'
        }
    ];


    /**
     * What characters start "strings" in token definitions. We need this to ignore token close
     * strings inside an expression.
     */
    Twig.token.strings = ['"', "'"];

    Twig.token.findStart = function (template) {
        var output = {
                position: null,
                close_position: null,
                def: null
            },
            i,
            token_template,
            first_key_position,
            close_key_position;

        for (i=0;i<Twig.token.definitions.length;i++) {
            token_template = Twig.token.definitions[i];
            first_key_position = template.indexOf(token_template.open);
            close_key_position = template.indexOf(token_template.close);

            Twig.log.trace("Twig.token.findStart: ", "Searching for ", token_template.open, " found at ", first_key_position);

            //Special handling for mismatched tokens
            if (first_key_position >= 0) {
                //This token matches the template
                if (token_template.open.length !== token_template.close.length) {
                    //This token has mismatched closing and opening tags
                    if (close_key_position < 0) {
                        //This token's closing tag does not match the template
                        continue;
                    }
                }
            }
            // Does this token occur before any other types?
            if (first_key_position >= 0 && (output.position === null || first_key_position < output.position)) {
                output.position = first_key_position;
                output.def = token_template;
                output.close_position = close_key_position;
            } else if (first_key_position >= 0 && output.position !== null && first_key_position === output.position) {
                /*This token exactly matches another token,
                greedily match to check if this token has a greater specificity*/
                if (token_template.open.length > output.def.open.length) {
                    //This token's opening tag is more specific than the previous match
                    output.position = first_key_position;
                    output.def = token_template;
                    output.close_position = close_key_position;
                } else if (token_template.open.length === output.def.open.length) {
                    if (token_template.close.length > output.def.close.length) {
                        //This token's opening tag is as specific as the previous match,
                        //but the closing tag has greater specificity
                        if (close_key_position >= 0 && close_key_position < output.close_position) {
                            //This token's closing tag exists in the template,
                            //and it occurs sooner than the previous match
                            output.position = first_key_position;
                            output.def = token_template;
                            output.close_position = close_key_position;
                        }
                    } else if (close_key_position >= 0 && close_key_position < output.close_position) {
                        //This token's closing tag is not more specific than the previous match,
                        //but it occurs sooner than the previous match
                        output.position = first_key_position;
                        output.def = token_template;
                        output.close_position = close_key_position;
                    }
                }
            }
        }

        delete output['close_position'];

        return output;
    };

    Twig.token.findEnd = function (template, token_def, start) {
        var end = null,
            found = false,
            offset = 0,

            // String position variables
            str_pos = null,
            str_found = null,
            pos = null,
            end_offset = null,
            this_str_pos = null,
            end_str_pos = null,

            // For loop variables
            i,
            l;

        while (!found) {
            str_pos = null;
            str_found = null;
            pos = template.indexOf(token_def.close, offset);

            if (pos >= 0) {
                end = pos;
                found = true;
            } else {
                // throw an exception
                throw new Twig.Error("Unable to find closing bracket '" + token_def.close +
                                "'" + " opened near template position " + start);
            }

            // Ignore quotes within comments; just look for the next comment close sequence,
            // regardless of what comes before it. https://github.com/justjohn/twig.js/issues/95
            if (token_def.type === Twig.token.type.comment) {
              break;
            }
            // Ignore quotes within raw tag
            // Fixes #283
            if (token_def.type === Twig.token.type.raw) {
                break;
            }

            l = Twig.token.strings.length;
            for (i = 0; i < l; i += 1) {
                this_str_pos = template.indexOf(Twig.token.strings[i], offset);

                if (this_str_pos > 0 && this_str_pos < pos &&
                        (str_pos === null || this_str_pos < str_pos)) {
                    str_pos = this_str_pos;
                    str_found = Twig.token.strings[i];
                }
            }

            // We found a string before the end of the token, now find the string's end and set the search offset to it
            if (str_pos !== null) {
                end_offset = str_pos + 1;
                end = null;
                found = false;
                while (true) {
                    end_str_pos = template.indexOf(str_found, end_offset);
                    if (end_str_pos < 0) {
                        throw "Unclosed string in template";
                    }
                    // Ignore escaped quotes
                    if (template.substr(end_str_pos - 1, 1) !== "\\") {
                        offset = end_str_pos + 1;
                        break;
                    } else {
                        end_offset = end_str_pos + 1;
                    }
                }
            }
        }
        return end;
    };

    /**
     * Convert a template into high-level tokens.
     */
    Twig.tokenize = function (template) {
        var tokens = [],
            // An offset for reporting errors locations in the template.
            error_offset = 0,

            // The start and type of the first token found in the template.
            found_token = null,
            // The end position of the matched token.
            end = null;

        while (template.length > 0) {
            // Find the first occurance of any token type in the template
            found_token = Twig.token.findStart(template);

            Twig.log.trace("Twig.tokenize: ", "Found token: ", found_token);

            if (found_token.position !== null) {
                // Add a raw type token for anything before the start of the token
                if (found_token.position > 0) {
                    tokens.push({
                        type: Twig.token.type.raw,
                        value: template.substring(0, found_token.position)
                    });
                }
                template = template.substr(found_token.position + found_token.def.open.length);
                error_offset += found_token.position + found_token.def.open.length;

                // Find the end of the token
                end = Twig.token.findEnd(template, found_token.def, error_offset);

                Twig.log.trace("Twig.tokenize: ", "Token ends at ", end);

                tokens.push({
                    type:  found_token.def.type,
                    value: template.substring(0, end).trim()
                });

                if (template.substr( end + found_token.def.close.length, 1 ) === "\n") {
                    switch (found_token.def.type) {
                        case "logic_whitespace_pre":
                        case "logic_whitespace_post":
                        case "logic_whitespace_both":
                        case "logic":
                            // Newlines directly after logic tokens are ignored
                            end += 1;
                            break;
                    }
                }

                template = template.substr(end + found_token.def.close.length);

                // Increment the position in the template
                error_offset += end + found_token.def.close.length;

            } else {
                // No more tokens -> add the rest of the template as a raw-type token
                tokens.push({
                    type: Twig.token.type.raw,
                    value: template
                });
                template = '';
            }
        }

        return tokens;
    };


    Twig.compile = function (tokens) {
        try {

            // Output and intermediate stacks
            var output = [],
                stack = [],
                // The tokens between open and close tags
                intermediate_output = [],

                token = null,
                logic_token = null,
                unclosed_token = null,
                // Temporary previous token.
                prev_token = null,
                // Temporary previous output.
                prev_output = null,
                // Temporary previous intermediate output.
                prev_intermediate_output = null,
                // The previous token's template
                prev_template = null,
                // Token lookahead
                next_token = null,
                // The output token
                tok_output = null,

                // Logic Token values
                type = null,
                open = null,
                next = null;

            var compile_output = function(token) {
                Twig.expression.compile.apply(this, [token]);
                if (stack.length > 0) {
                    intermediate_output.push(token);
                } else {
                    output.push(token);
                }
            };

            var compile_logic = function(token) {
                // Compile the logic token
                logic_token = Twig.logic.compile.apply(this, [token]);

                type = logic_token.type;
                open = Twig.logic.handler[type].open;
                next = Twig.logic.handler[type].next;

                Twig.log.trace("Twig.compile: ", "Compiled logic token to ", logic_token,
                                                 " next is: ", next, " open is : ", open);

                // Not a standalone token, check logic stack to see if this is expected
                if (open !== undefined && !open) {
                    prev_token = stack.pop();
                    prev_template = Twig.logic.handler[prev_token.type];

                    if (Twig.indexOf(prev_template.next, type) < 0) {
                        throw new Error(type + " not expected after a " + prev_token.type);
                    }

                    prev_token.output = prev_token.output || [];

                    prev_token.output = prev_token.output.concat(intermediate_output);
                    intermediate_output = [];

                    tok_output = {
                        type: Twig.token.type.logic,
                        token: prev_token
                    };
                    if (stack.length > 0) {
                        intermediate_output.push(tok_output);
                    } else {
                        output.push(tok_output);
                    }
                }

                // This token requires additional tokens to complete the logic structure.
                if (next !== undefined && next.length > 0) {
                    Twig.log.trace("Twig.compile: ", "Pushing ", logic_token, " to logic stack.");

                    if (stack.length > 0) {
                        // Put any currently held output into the output list of the logic operator
                        // currently at the head of the stack before we push a new one on.
                        prev_token = stack.pop();
                        prev_token.output = prev_token.output || [];
                        prev_token.output = prev_token.output.concat(intermediate_output);
                        stack.push(prev_token);
                        intermediate_output = [];
                    }

                    // Push the new logic token onto the logic stack
                    stack.push(logic_token);

                } else if (open !== undefined && open) {
                    tok_output = {
                        type: Twig.token.type.logic,
                        token: logic_token
                    };
                    // Standalone token (like {% set ... %}
                    if (stack.length > 0) {
                        intermediate_output.push(tok_output);
                    } else {
                        output.push(tok_output);
                    }
                }
            };

            while (tokens.length > 0) {
                token = tokens.shift();
                prev_output = output[output.length - 1];
                prev_intermediate_output = intermediate_output[intermediate_output.length - 1];
                next_token = tokens[0];
                Twig.log.trace("Compiling token ", token);
                switch (token.type) {
                    case Twig.token.type.raw:
                        if (stack.length > 0) {
                            intermediate_output.push(token);
                        } else {
                            output.push(token);
                        }
                        break;

                    case Twig.token.type.logic:
                        compile_logic.call(this, token);
                        break;

                    // Do nothing, comments should be ignored
                    case Twig.token.type.comment:
                        break;

                    case Twig.token.type.output:
                        compile_output.call(this, token);
                        break;

                    //Kill whitespace ahead and behind this token
                    case Twig.token.type.logic_whitespace_pre:
                    case Twig.token.type.logic_whitespace_post:
                    case Twig.token.type.logic_whitespace_both:
                    case Twig.token.type.output_whitespace_pre:
                    case Twig.token.type.output_whitespace_post:
                    case Twig.token.type.output_whitespace_both:
                        if (token.type !== Twig.token.type.output_whitespace_post && token.type !== Twig.token.type.logic_whitespace_post) {
                            if (prev_output) {
                                //If the previous output is raw, pop it off
                                if (prev_output.type === Twig.token.type.raw) {
                                    output.pop();

                                    //If the previous output is not just whitespace, trim it
                                    if (prev_output.value.match(/^\s*$/) === null) {
                                        prev_output.value = prev_output.value.trim();
                                        //Repush the previous output
                                        output.push(prev_output);
                                    }
                                }
                            }

                            if (prev_intermediate_output) {
                                //If the previous intermediate output is raw, pop it off
                                if (prev_intermediate_output.type === Twig.token.type.raw) {
                                    intermediate_output.pop();

                                    //If the previous output is not just whitespace, trim it
                                    if (prev_intermediate_output.value.match(/^\s*$/) === null) {
                                        prev_intermediate_output.value = prev_intermediate_output.value.trim();
                                        //Repush the previous intermediate output
                                        intermediate_output.push(prev_intermediate_output);
                                    }
                                }
                            }
                        }

                        //Compile this token
                        switch (token.type) {
                            case Twig.token.type.output_whitespace_pre:
                            case Twig.token.type.output_whitespace_post:
                            case Twig.token.type.output_whitespace_both:
                                compile_output.call(this, token);
                                break;
                            case Twig.token.type.logic_whitespace_pre:
                            case Twig.token.type.logic_whitespace_post:
                            case Twig.token.type.logic_whitespace_both:
                                compile_logic.call(this, token);
                                break;
                        }

                        if (token.type !== Twig.token.type.output_whitespace_pre && token.type !== Twig.token.type.logic_whitespace_pre) {
                            if (next_token) {
                                //If the next token is raw, shift it out
                                if (next_token.type === Twig.token.type.raw) {
                                    tokens.shift();

                                    //If the next token is not just whitespace, trim it
                                    if (next_token.value.match(/^\s*$/) === null) {
                                        next_token.value = next_token.value.trim();
                                        //Unshift the next token
                                        tokens.unshift(next_token);
                                    }
                                }
                            }
                        }

                        break;
                }

                Twig.log.trace("Twig.compile: ", " Output: ", output,
                                                 " Logic Stack: ", stack,
                                                 " Pending Output: ", intermediate_output );
            }

            // Verify that there are no logic tokens left in the stack.
            if (stack.length > 0) {
                unclosed_token = stack.pop();
                throw new Error("Unable to find an end tag for " + unclosed_token.type +
                                ", expecting one of " + unclosed_token.next);
            }
            return output;
        } catch (ex) {
            Twig.log.error("Error compiling twig template " + this.id + ": ");
            if (ex.stack) {
                Twig.log.error(ex.stack);
            } else {
                Twig.log.error(ex.toString());
            }

            if (this.options.rethrow) throw ex;
        }
    };

    /**
     * Parse a compiled template.
     *
     * @param {Array} tokens The compiled tokens.
     * @param {Object} context The render context.
     *
     * @return {string} The parsed template.
     */
    Twig.parse = function (tokens, context) {
        try {
            var output = [],
                // Track logic chains
                chain = true,
                that = this;

            Twig.forEach(tokens, function parseToken(token) {
                Twig.log.debug("Twig.parse: ", "Parsing token: ", token);

                switch (token.type) {
                    case Twig.token.type.raw:
                        output.push(Twig.filters.raw(token.value));
                        break;

                    case Twig.token.type.logic:
                        var logic_token = token.token,
                            logic = Twig.logic.parse.apply(that, [logic_token, context, chain]);

                        if (logic.chain !== undefined) {
                            chain = logic.chain;
                        }
                        if (logic.context !== undefined) {
                            context = logic.context;
                        }
                        if (logic.output !== undefined) {
                            output.push(logic.output);
                        }
                        break;

                    case Twig.token.type.comment:
                        // Do nothing, comments should be ignored
                        break;

                    //Fall through whitespace to output
                    case Twig.token.type.output_whitespace_pre:
                    case Twig.token.type.output_whitespace_post:
                    case Twig.token.type.output_whitespace_both:
                    case Twig.token.type.output:
                        Twig.log.debug("Twig.parse: ", "Output token: ", token.stack);
                        // Parse the given expression in the given context
                        output.push(Twig.expression.parse.apply(that, [token.stack, context]));
                        break;
                }
            });
            return Twig.output.apply(this, [output]);
        } catch (ex) {
            Twig.log.error("Error parsing twig template " + this.id + ": ");
            if (ex.stack) {
                Twig.log.error(ex.stack);
            } else {
                Twig.log.error(ex.toString());
            }

            if (this.options.rethrow) throw ex;

            if (Twig.debug) {
                return ex.toString();
            }
        }
    };

    /**
     * Tokenize and compile a string template.
     *
     * @param {string} data The template.
     *
     * @return {Array} The compiled tokens.
     */
    Twig.prepare = function(data) {
        var tokens, raw_tokens;

        // Tokenize
        Twig.log.debug("Twig.prepare: ", "Tokenizing ", data);
        raw_tokens = Twig.tokenize.apply(this, [data]);

        // Compile
        Twig.log.debug("Twig.prepare: ", "Compiling ", raw_tokens);
        tokens = Twig.compile.apply(this, [raw_tokens]);

        Twig.log.debug("Twig.prepare: ", "Compiled ", tokens);

        return tokens;
    };

    /**
     * Join the output token's stack and escape it if needed
     *
     * @param {Array} Output token's stack
     *
     * @return {string|String} Autoescaped output
     */
    Twig.output = function(output) {
        if (!this.options.autoescape) {
            return output.join("");
        }

        var strategy = 'html';
        if(typeof this.options.autoescape == 'string')
            strategy = this.options.autoescape;

        // [].map would be better but it's not supported by IE8-
        var escaped_output = [];
        Twig.forEach(output, function (str) {
            if (str && (str.twig_markup !== true && str.twig_markup != strategy)) {
                str = Twig.filters.escape(str, [ strategy ]);
            }
            escaped_output.push(str);
        });
        return Twig.Markup(escaped_output.join(""));
    }

    // Namespace for template storage and retrieval
    Twig.Templates = {
        /**
         * Registered template loaders - use Twig.Templates.registerLoader to add supported loaders
         * @type {Object}
         */
        loaders: {},

        /**
         * Registered template parsers - use Twig.Templates.registerParser to add supported parsers
         * @type {Object}
         */
        parsers: {},

        /**
         * Cached / loaded templates
         * @type {Object}
         */
        registry: {}
    };

    /**
     * Is this id valid for a twig template?
     *
     * @param {string} id The ID to check.
     *
     * @throws {Twig.Error} If the ID is invalid or used.
     * @return {boolean} True if the ID is valid.
     */
    Twig.validateId = function(id) {
        if (id === "prototype") {
            throw new Twig.Error(id + " is not a valid twig identifier");
        } else if (Twig.cache && Twig.Templates.registry.hasOwnProperty(id)) {
            throw new Twig.Error("There is already a template with the ID " + id);
        }
        return true;
    }

    /**
     * Register a template loader
     *
     * @example
     * Twig.extend(function(Twig) {
     *    Twig.Templates.registerLoader('custom_loader', function(location, params, callback, error_callback) {
     *        // ... load the template ...
     *        params.data = loadedTemplateData;
     *        // create and return the template
     *        var template = new Twig.Template(params);
     *        if (typeof callback === 'function') {
     *            callback(template);
     *        }
     *        return template;
     *    });
     * });
     * 
     * @param {String} method_name The method this loader is intended for (ajax, fs)
     * @param {Function} func The function to execute when loading the template
     * @param {Object|undefined} scope Optional scope parameter to bind func to
     *
     * @throws Twig.Error
     *
     * @return {void}
     */
    Twig.Templates.registerLoader = function(method_name, func, scope) {
        if (typeof func !== 'function') {
            throw new Twig.Error('Unable to add loader for ' + method_name + ': Invalid function reference given.');
        }
        if (scope) {
            func = func.bind(scope);
        }
        this.loaders[method_name] = func;
    };

    /**
     * Remove a registered loader
     * 
     * @param {String} method_name The method name for the loader you wish to remove
     *
     * @return {void}
     */
    Twig.Templates.unRegisterLoader = function(method_name) {
        if (this.isRegisteredLoader(method_name)) {
            delete this.loaders[method_name];
        }
    };

    /**
     * See if a loader is registered by its method name
     * 
     * @param {String} method_name The name of the loader you are looking for
     *
     * @return {boolean}
     */
    Twig.Templates.isRegisteredLoader = function(method_name) {
        return this.loaders.hasOwnProperty(method_name);
    };

    /**
     * Register a template parser
     *
     * @example
     * Twig.extend(function(Twig) {
     *    Twig.Templates.registerParser('custom_parser', function(params) {
     *        // this template source can be accessed in params.data
     *        var template = params.data
     *
     *        // ... custom process that modifies the template
     *
     *        // return the parsed template
     *        return template;
     *    });
     * });
     *
     * @param {String} method_name The method this parser is intended for (twig, source)
     * @param {Function} func The function to execute when parsing the template
     * @param {Object|undefined} scope Optional scope parameter to bind func to
     *
     * @throws Twig.Error
     *
     * @return {void}
     */
    Twig.Templates.registerParser = function(method_name, func, scope) {
        if (typeof func !== 'function') {
            throw new Twig.Error('Unable to add parser for ' + method_name + ': Invalid function regerence given.');
        }

        if (scope) {
            func = func.bind(scope);
        }

        this.parsers[method_name] = func;
    };

    /**
     * Remove a registered parser
     *
     * @param {String} method_name The method name for the parser you wish to remove
     *
     * @return {void}
     */
    Twig.Templates.unRegisterParser = function(method_name) {
        if (this.isRegisteredParser(method_name)) {
            delete this.parsers[method_name];
        }
    };

    /**
     * See if a parser is registered by its method name
     *
     * @param {String} method_name The name of the parser you are looking for
     *
     * @return {boolean}
     */
    Twig.Templates.isRegisteredParser = function(method_name) {
        return this.parsers.hasOwnProperty(method_name);
    };

    /**
     * Save a template object to the store.
     *
     * @param {Twig.Template} template   The twig.js template to store.
     */
    Twig.Templates.save = function(template) {
        if (template.id === undefined) {
            throw new Twig.Error("Unable to save template with no id");
        }
        Twig.Templates.registry[template.id] = template;
    };

    /**
     * Load a previously saved template from the store.
     *
     * @param {string} id   The ID of the template to load.
     *
     * @return {Twig.Template} A twig.js template stored with the provided ID.
     */
    Twig.Templates.load = function(id) {
        if (!Twig.Templates.registry.hasOwnProperty(id)) {
            return null;
        }
        return Twig.Templates.registry[id];
    };

    /**
     * Load a template from a remote location using AJAX and saves in with the given ID.
     *
     * Available parameters:
     *
     *      async:       Should the HTTP request be performed asynchronously.
     *                      Defaults to true.
     *      method:      What method should be used to load the template
     *                      (fs or ajax)
     *      parser:      What method should be used to parse the template
     *                      (twig or source)
     *      precompiled: Has the template already been compiled.
     *
     * @param {string} location  The remote URL to load as a template.
     * @param {Object} params The template parameters.
     * @param {function} callback  A callback triggered when the template finishes loading.
     * @param {function} error_callback  A callback triggered if an error occurs loading the template.
     *
     *
     */
    Twig.Templates.loadRemote = function(location, params, callback, error_callback) {
        var loader;

        // Default to async
        if (params.async === undefined) {
            params.async = true;
        }

        // Default to the URL so the template is cached.
        if (params.id === undefined) {
            params.id = location;
        }

        // Check for existing template
        if (Twig.cache && Twig.Templates.registry.hasOwnProperty(params.id)) {
            // A template is already saved with the given id.
            if (typeof callback === 'function') {
                callback(Twig.Templates.registry[params.id]);
            }
            // TODO: if async, return deferred promise
            return Twig.Templates.registry[params.id];
        }

        //if the parser name hasn't been set, default it to twig
        params.parser = params.parser || 'twig';

        // Assume 'fs' if the loader is not defined
        loader = this.loaders[params.method] || this.loaders.fs;
        return loader.apply(this, arguments);
    };

    // Determine object type
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    /**
     * Create a new twig.js template.
     *
     * Parameters: {
     *      data:   The template, either pre-compiled tokens or a string template
     *      id:     The name of this template
     *      blocks: Any pre-existing block from a child template
     * }
     *
     * @param {Object} params The template parameters.
     */
    Twig.Template = function ( params ) {
        var data = params.data,
            id = params.id,
            blocks = params.blocks,
            macros = params.macros || {},
            base = params.base,
            path = params.path,
            url = params.url,
            name = params.name,
            method = params.method,
            // parser options
            options = params.options;

        // # What is stored in a Twig.Template
        //
        // The Twig Template hold several chucks of data.
        //
        //     {
        //          id:     The token ID (if any)
        //          tokens: The list of tokens that makes up this template.
        //          blocks: The list of block this template contains.
        //          base:   The base template (if any)
        //            options:  {
        //                Compiler/parser options
        //
        //                strict_variables: true/false
        //                    Should missing variable/keys emit an error message. If false, they default to null.
        //            }
        //     }
        //

        this.id     = id;
        this.method = method;
        this.base   = base;
        this.path   = path;
        this.url    = url;
        this.name   = name;
        this.macros = macros;
        this.options = options;

        this.reset(blocks);

        if (is('String', data)) {
            this.tokens = Twig.prepare.apply(this, [data]);
        } else {
            this.tokens = data;
        }

        if (id !== undefined) {
            Twig.Templates.save(this);
        }
    };

    Twig.Template.prototype.reset = function(blocks) {
        Twig.log.debug("Twig.Template.reset", "Reseting template " + this.id);
        this.blocks = {};
        this.importedBlocks = [];
        this.originalBlockTokens = {};
        this.child = {
            blocks: blocks || {}
        };
        this.extend = null;
    };

    Twig.Template.prototype.render = function (context, params) {
        params = params || {};

        var output,
            url;

        this.context = context || {};

        // Clear any previous state
        this.reset();
        if (params.blocks) {
            this.blocks = params.blocks;
        }
        if (params.macros) {
            this.macros = params.macros;
        }

        output = Twig.parse.apply(this, [this.tokens, this.context]);

        // Does this template extend another
        if (this.extend) {
            var ext_template;

            // check if the template is provided inline
            if ( this.options.allowInlineIncludes ) {
                ext_template = Twig.Templates.load(this.extend);
                if ( ext_template ) {
                    ext_template.options = this.options;
                }
            }

            // check for the template file via include
            if (!ext_template) {
                url = Twig.path.parsePath(this, this.extend);

                ext_template = Twig.Templates.loadRemote(url, {
                    method: this.getLoaderMethod(),
                    base: this.base,
                    async:  false,
                    id:     url,
                    options: this.options
                });
            }

            this.parent = ext_template;

            return this.parent.render(this.context, {
                blocks: this.blocks
            });
        }

        if (params.output == 'blocks') {
            return this.blocks;
        } else if (params.output == 'macros') {
            return this.macros;
        } else {
            return output;
        }
    };

    Twig.Template.prototype.importFile = function(file) {
        var url, sub_template;
        if (!this.url && this.options.allowInlineIncludes) {
            file = this.path ? this.path + '/' + file : file;
            sub_template = Twig.Templates.load(file);

            if (!sub_template) {
                sub_template = Twig.Templates.loadRemote(url, {
                    id: file,
                    method: this.getLoaderMethod(),
                    async: false,
                    options: this.options
                });

                if (!sub_template) {
                    throw new Twig.Error("Unable to find the template " + file);
                }
            }

            sub_template.options = this.options;

            return sub_template;
        }

        url = Twig.path.parsePath(this, file);

        // Load blocks from an external file
        sub_template = Twig.Templates.loadRemote(url, {
            method: this.getLoaderMethod(),
            base: this.base,
            async: false,
            options: this.options,
            id: url
        });

        return sub_template;
    };

    Twig.Template.prototype.importBlocks = function(file, override) {
        var sub_template = this.importFile(file),
            context = this.context,
            that = this,
            key;

        override = override || false;

        sub_template.render(context);

        // Mixin blocks
        Twig.forEach(Object.keys(sub_template.blocks), function(key) {
            if (override || that.blocks[key] === undefined) {
                that.blocks[key] = sub_template.blocks[key];
                that.importedBlocks.push(key);
            }
        });
    };

    Twig.Template.prototype.importMacros = function(file) {
        var url = Twig.path.parsePath(this, file);

        // load remote template
        var remoteTemplate = Twig.Templates.loadRemote(url, {
            method: this.getLoaderMethod(),
            async: false,
            id: url
        });

        return remoteTemplate;
    };

    Twig.Template.prototype.getLoaderMethod = function() {
        if (this.path) {
            return 'fs';
        }
        if (this.url) {
            return 'ajax';
        }
        return this.method || 'fs';
    };

    Twig.Template.prototype.compile = function(options) {
        // compile the template into raw JS
        return Twig.compiler.compile(this, options);
    };

    /**
     * Create safe output
     *
     * @param {string} Content safe to output
     *
     * @return {String} Content wrapped into a String
     */

    Twig.Markup = function(content, strategy) {
        if(typeof strategy == 'undefined') {
            strategy = true;
        }

        if (typeof content === 'string' && content.length > 0) {
            content = new String(content);
            content.twig_markup = strategy;
        }
        return content;
    };

    return Twig;

};
