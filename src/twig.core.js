//     Twig.js v0.3
//     Copyright (c) 2011 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

/**
 * Create and compile a twig.js template.
 *
 * @param {Object} param Paramteres for creating a Twig template.
 *
 * @return {Twig.Template} A Twig template ready for rendering.
 */
var twig = function twig(params) {
    'use strict';
    var id = params.id;

    if (params.debug !== undefined) {
        Twig.debug = params.debug;
    }

    if (params.data !== undefined) {
        return new Twig.Template({
            data: params.data,
            id:   id
        });

    } else if (params.ref !== undefined) {
        if (params.id !== undefined) {
            throw new Error("Both ref and id cannot be set on a twig.js template.");
        }
        return Twig.Templates.load(params.ref);

    } else if (params.href !== undefined) {
        return Twig.Templates.loadRemote(params.href, {
            id: id,
            precompiled: params.precompiled

        }, params.async, params.load);
    }
};

// Extend Twig with a new filter.
twig.extendFilter = function(filter, definition) {
    Twig.extendFilter(filter, definition);
};

// Extend Twig with a new test.
twig.extendTest = function(test, definition) {
    Twig.extendFilter(test, definition);
};

// Extend Twig with a new definition.
twig.extendTag = function(definition) {
    Twig.logic.extend(definition);
};


/**
 * Provide an extension for use with express.
 *
 * @param {string} markup The template markup.
 * @param {array} options The express options.
 *
 * @return {string} The rendered template.
 */
twig.compile = function(markup, options) {
    var id = options.filename,
        // Try to load the template from the cache
        template = new Twig.Template({
            data: markup,
            id: id
        }); // Twig.Templates.load(id) ||

    return function(context) {
        return template.render(context);
    };
};

// ## twig.core.js
//
// This file handles template level tokenizing, compiling and parsing.
var Twig = (function (Twig) {
    "use strict";

    Twig.trace = false;
    Twig.debug = false;

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
        return this.name + ": " + this.message;
    };

    /**
     * Wrapper for logging to the console.
     */
    Twig.log = {
        trace: function() {if (Twig.trace && console) {console.log(Array.prototype.slice.call(arguments));}},
        debug: function() {if (Twig.debug && console) {console.log(Array.prototype.slice.call(arguments));}}
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
        output:  'output',
        logic:   'logic',
        comment: 'comment',
        raw:     'raw'
    };

    /**
     * Token syntax definitions.
     */
    Twig.token.definitions = {
        // *Output type tokens*
        //
        // These typically take the form `{{ expression }}`.
        output: {
            type: Twig.token.type.output,
            open: '{{',
            close: '}}'
        },
        // *Logic type tokens*
        //
        // These typically take a form like `{% if expression %}` or `{% endif %}`
        logic: {
            type: Twig.token.type.logic,
            open: '{%',
            close: '%}'
        },
        // *Comment type tokens*
        //
        // These take the form `{# anything #}`
        comment: {
            type: Twig.token.type.comment,
            open: '{#',
            close: '#}'
        }
    };


    /**
     * What characters start "strings" in token definitions. We need this to ignore token close
     * strings inside an expression.
     */
    Twig.token.strings = ['"', "'"];

    Twig.token.findStart = function (template) {
        var output = {
                position: null,
                def: null
            },
            token_type,
            token_template,
            first_key_position;

        for (token_type in Twig.token.definitions) {
            if (Twig.token.definitions.hasOwnProperty(token_type)) {
                token_template = Twig.token.definitions[token_type];
                first_key_position = template.indexOf(token_template.open);

                Twig.log.trace("Twig.token.findStart: ", "Searching for ", token_template.open, " found at ", first_key_position);

                // Does this token occur before any other types?
                if (first_key_position >= 0 && (output.position === null || first_key_position < output.position)) {
                    output.position = first_key_position;
                    output.def = token_template;
                }
            }
        }

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
        // Output and intermediate stacks
        var output = [],
            stack = [],
            intermediate_output = [],
            token = null,
            logic_token = null,
            unclosed_token = null,
            // Temporary previous token.
            prev_token = null,
            // The previous token's template
            prev_template = null,
            // The output token
            tok_output = null,

            // Logic Token values
            type = null,
            open = null,
            next = null;

        while (tokens.length > 0) {
            token = tokens.shift();
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

                        if (prev_template.next.indexOf(type) < 0) {
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
                    break;

                // Do nothing, comments should be ignored
                case Twig.token.type.comment:
                    break;

                case Twig.token.type.output:
                    Twig.expression.compile.apply(this, [token]);
                    if (stack.length > 0) {
                        intermediate_output.push(token);
                    } else {
                        output.push(token);
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
                            ", expecting one of " + unclosed_token.next.join(", "));
        }
        return output;
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
        var output = [],
            // Track logic chains
            chain = true,
            that = this;

        // Default to an empty object if none provided
        context = context || { };

        tokens.forEach(function (token) {
            Twig.log.debug("Twig.parse: ", "Parsing token: ", token);

            switch (token.type) {
                case Twig.token.type.raw:
                    output.push(token.value);
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

                case Twig.token.type.output:
                    // Parse the given expression in the given context
                    output.push(Twig.expression.parse.apply(that, [token.stack, context]));
                    break;
            }
        });
        return output.join("");
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

    // Namespace for template storage and retrieval
    Twig.Templates = {
        registry: {}
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
     * @param {string} url  The remote URL to load as a template.
     * @param {Object} params The template parameters.
     * @param {function} callback  A callback triggered when the template finishes loading.
     * @param {boolean} async  Should the HTTP request be performed asynchronously. Defaults to true.
     *
     *
     */
    Twig.Templates.loadRemote = function(url, params, async, callback) {
        var id          = params.id,
            blocks      = params.blocks,
            precompiled = params.precompiled,
            template    = null;

        // Default to the URL so the template is cached.
        if (id === undefined) {
            id = url;
        }
        // Check for existing template
        if (Twig.Templates.registry.hasOwnProperty(id)) {
            // A template is already saved with the given id.
            return Twig.Templates.registry.hasOwnProperty(id);
        }
        if (typeof XMLHttpRequest == "undefined") {
            throw new Error("Unsupported platform: Unable to do remote requests " +
                            "because there is no XMLHTTPRequest implementation");
        }

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            var tokens = null;

            if(xmlhttp.readyState == 4) {
                Twig.log.debug("Got template ", xmlhttp.responseText);
                // Get the template
                if (precompiled === true) {
                    tokens = JSON.parse(xmlhttp.responseText);
                    template = new Twig.Template({
                        data: tokens,
                        blocks: blocks,
                        id:   id
                    });
                } else {
                    template = new Twig.Template({
                        data: xmlhttp.responseText,
                        blocks: blocks,
                        id: id
                    });
                    template.url = url;
                }
                if (callback) {
                    callback(template);
                }
            }
        };
        xmlhttp.open("GET", url, async === true);
        xmlhttp.send();

        if (async === false) {
            return template;
        }
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
            url;

        // # What is stored in a Twig.Template
        //
        // The Twig Template hold several chucks of data.
        //
        //     {
        //          id:     The token ID (if any)
        //          tokens: The list of tokens that makes up this template.
        //          blocks: The list of block this template contains.
        //          base:   The base template (if any)
        //     }
        //

        this.id     = id;
        this.blocks = blocks || {};
        this.extend   = null;

        if (is('String', data)) {
            this.tokens = Twig.prepare.apply(this, [data]);
        } else {
            this.tokens = data;
        }

        this.render = function (context) {
            var output = Twig.parse.apply(this, [this.tokens, context]);

            console.log(this);

            // Does this template extend another
            if (this.extend) {
                url = relativePath(this.url, this.extend);
                console.log("Loading ", url);
                // This template extends another, load it with this template's blocks
                this.parent = Twig.Templates.loadRemote(url, {
                    id:     url,
                    blocks: this.blocks
                }, false)

                // Pass the parsed blocks to the parent.
                this.parent.blocks = this.blocks;

                return this.parent.render(context);
            }

            return output
        };

        if (id !== undefined) {
            Twig.Templates.save(this);
        }
    };

    /**
     * Generate the relative canonical version of a url based on the given base path and file path.
     *
     * @param {string} base The base path.
     * @param {string} file The file path, relative to the base path.
     *
     * @return {string} The canonical version of the path.
     */
    function relativePath(base, file) {
        var sep_chr = '/',
            base_path = base.split(sep_chr),
            new_path = [],
            val;

        // Remove file from url
        base_path.pop();
        base_path = base_path.concat(file.split(sep_chr));

        while (base_path.length > 0) {
            val = base_path.shift();
            if (val == ".") {
                // Ignore
            } else if (val == ".." && new_path.length > 0 && new_path[new_path.length-1] != "..") {
                new_path.pop();
            } else {
                new_path.push(val);
            }
        }

        return new_path.join(sep_chr);
    }

    return Twig;

}) (Twig || { });

