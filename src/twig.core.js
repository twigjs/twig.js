// ## twig.core.js
//
// This file handles template level tokenizing, compiling and parsing.
module.exports = function (Twig) {
    'use strict';

    Twig.trace = false;
    Twig.debug = false;

    // Default caching to true for the improved performance it offers
    Twig.cache = true;

    Twig.noop = function () {};

    Twig.merge = function (target, source, onlyChanged) {
        Object.keys(source).forEach(key => {
            if (onlyChanged && !(key in target)) {
                return;
            }

            target[key] = source[key];
        });

        return target;
    };

    /**
     * Exception thrown by twig.js.
     */
    Twig.Error = function (message, file) {
        this.message = message;
        this.name = 'TwigException';
        this.type = 'TwigException';
        this.file = file;
    };

    /**
     * Get the string representation of a Twig error.
     */
    Twig.Error.prototype.toString = function () {
        const output = this.name + ': ' + this.message;

        return output;
    };

    /**
     * Wrapper for logging to the console.
     */
    Twig.log = {
        trace(...args) {
            if (Twig.trace && console) {
                console.log(Array.prototype.slice.call(args));
            }
        },
        debug(...args) {
            if (Twig.debug && console) {
                console.log(Array.prototype.slice.call(args));
            }
        }
    };

    if (typeof console === 'undefined') {
        Twig.log.error = function () {};
    } else if (typeof console.error !== 'undefined') {
        Twig.log.error = function (...args) {
            console.error(...args);
        };
    } else if (typeof console.log !== 'undefined') {
        Twig.log.error = function (...args) {
            console.log(...args);
        };
    }

    /**
     * Container for methods related to handling high level template tokens
     *      (for example: {{ expression }}, {% logic %}, {# comment #}, raw data)
     */
    Twig.token = {};

    /**
     * Token types.
     */
    Twig.token.type = {
        output: 'output',
        logic: 'logic',
        comment: 'comment',
        raw: 'raw',
        outputWhitespacePre: 'output_whitespace_pre',
        outputWhitespacePost: 'output_whitespace_post',
        outputWhitespaceBoth: 'output_whitespace_both',
        logicWhitespacePre: 'logic_whitespace_pre',
        logicWhitespacePost: 'logic_whitespace_post',
        logicWhitespaceBoth: 'logic_whitespace_both'
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
            type: Twig.token.type.outputWhitespacePre,
            open: '{{-',
            close: '}}'
        },
        {
            type: Twig.token.type.outputWhitespacePost,
            open: '{{',
            close: '-}}'
        },
        {
            type: Twig.token.type.outputWhitespaceBoth,
            open: '{{-',
            close: '-}}'
        },
        {
            type: Twig.token.type.logicWhitespacePre,
            open: '{%-',
            close: '%}'
        },
        {
            type: Twig.token.type.logicWhitespacePost,
            open: '{%',
            close: '-%}'
        },
        {
            type: Twig.token.type.logicWhitespaceBoth,
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
    Twig.token.strings = ['"', '\''];

    Twig.token.findStart = function (template) {
        const output = {
            position: null,
            def: null
        };
        let closePosition = null;
        const len = Twig.token.definitions.length;
        let i;
        let tokenTemplate;
        let firstKeyPosition;
        let closeKeyPosition;

        for (i = 0; i < len; i++) {
            tokenTemplate = Twig.token.definitions[i];
            firstKeyPosition = template.indexOf(tokenTemplate.open);
            closeKeyPosition = template.indexOf(tokenTemplate.close);

            Twig.log.trace('Twig.token.findStart: ', 'Searching for ', tokenTemplate.open, ' found at ', firstKeyPosition);

            // Special handling for mismatched tokens
            if (firstKeyPosition >= 0) {
                // This token matches the template
                if (tokenTemplate.open.length !== tokenTemplate.close.length) {
                    // This token has mismatched closing and opening tags
                    if (closeKeyPosition < 0) {
                        // This token's closing tag does not match the template
                        continue;
                    }
                }
            }
            // Does this token occur before any other types?

            if (firstKeyPosition >= 0 && (output.position === null || firstKeyPosition < output.position)) {
                output.position = firstKeyPosition;
                output.def = tokenTemplate;
                closePosition = closeKeyPosition;
            } else if (firstKeyPosition >= 0 && output.position !== null && firstKeyPosition === output.position) {
                /* This token exactly matches another token,
                greedily match to check if this token has a greater specificity */
                if (tokenTemplate.open.length > output.def.open.length) {
                    // This token's opening tag is more specific than the previous match
                    output.position = firstKeyPosition;
                    output.def = tokenTemplate;
                    closePosition = closeKeyPosition;
                } else if (tokenTemplate.open.length === output.def.open.length) {
                    if (tokenTemplate.close.length > output.def.close.length) {
                        // This token's opening tag is as specific as the previous match,
                        // but the closing tag has greater specificity
                        if (closeKeyPosition >= 0 && closeKeyPosition < closePosition) {
                            // This token's closing tag exists in the template,
                            // and it occurs sooner than the previous match
                            output.position = firstKeyPosition;
                            output.def = tokenTemplate;
                            closePosition = closeKeyPosition;
                        }
                    } else if (closeKeyPosition >= 0 && closeKeyPosition < closePosition) {
                        // This token's closing tag is not more specific than the previous match,
                        // but it occurs sooner than the previous match
                        output.position = firstKeyPosition;
                        output.def = tokenTemplate;
                        closePosition = closeKeyPosition;
                    }
                }
            }
        }

        return output;
    };

    Twig.token.findEnd = function (template, tokenDef, start) {
        let end = null;
        let found = false;
        let offset = 0;

        // String position variables
        let strPos = null;
        let strFound = null;
        let pos = null;
        let endOffset = null;
        let thisStrPos = null;
        let endStrPos = null;

        // For loop variables
        let i;
        let l;

        while (!found) {
            strPos = null;
            strFound = null;
            pos = template.indexOf(tokenDef.close, offset);

            if (pos >= 0) {
                end = pos;
                found = true;
            } else {
                // Throw an exception
                throw new Twig.Error('Unable to find closing bracket \'' + tokenDef.close +
                                '\' opened near template position ' + start);
            }

            // Ignore quotes within comments; just look for the next comment close sequence,
            // regardless of what comes before it. https://github.com/justjohn/twig.js/issues/95
            if (tokenDef.type === Twig.token.type.comment) {
                break;
            }
            // Ignore quotes within raw tag
            // Fixes #283

            if (tokenDef.type === Twig.token.type.raw) {
                break;
            }

            l = Twig.token.strings.length;
            for (i = 0; i < l; i += 1) {
                thisStrPos = template.indexOf(Twig.token.strings[i], offset);

                if (thisStrPos > 0 && thisStrPos < pos &&
                        (strPos === null || thisStrPos < strPos)) {
                    strPos = thisStrPos;
                    strFound = Twig.token.strings[i];
                }
            }

            // We found a string before the end of the token, now find the string's end and set the search offset to it
            if (strPos !== null) {
                endOffset = strPos + 1;
                end = null;
                found = false;
                for (;;) {
                    endStrPos = template.indexOf(strFound, endOffset);
                    if (endStrPos < 0) {
                        throw Twig.Error('Unclosed string in template');
                    }
                    // Ignore escaped quotes

                    if (template.slice(endStrPos - 1, endStrPos) === '\\') {
                        endOffset = endStrPos + 1;
                    } else {
                        offset = endStrPos + 1;
                        break;
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
        const tokens = [];
        // An offset for reporting errors locations in the template.
        let errorOffset = 0;

        // The start and type of the first token found in the template.
        let foundToken = null;
        // The end position of the matched token.
        let end = null;

        while (template.length > 0) {
            // Find the first occurance of any token type in the template
            foundToken = Twig.token.findStart(template);

            Twig.log.trace('Twig.tokenize: ', 'Found token: ', foundToken);

            if (foundToken.position === null) {
                // No more tokens -> add the rest of the template as a raw-type token
                tokens.push({
                    type: Twig.token.type.raw,
                    value: template
                });
                template = '';
            } else {
                // Add a raw type token for anything before the start of the token
                if (foundToken.position > 0) {
                    tokens.push({
                        type: Twig.token.type.raw,
                        value: template.slice(0, Math.max(0, foundToken.position))
                    });
                }

                template = template.slice(foundToken.position + foundToken.def.open.length);
                errorOffset += foundToken.position + foundToken.def.open.length;

                // Find the end of the token
                end = Twig.token.findEnd(template, foundToken.def, errorOffset);

                Twig.log.trace('Twig.tokenize: ', 'Token ends at ', end);

                tokens.push({
                    type: foundToken.def.type,
                    value: template.slice(0, Math.max(0, end)).trim()
                });

                if (template.slice(end + foundToken.def.close.length, end + foundToken.def.close.length + 1) === '\n') {
                    switch (foundToken.def.type) {
                        case 'logic_whitespace_pre':
                        case 'logic_whitespace_post':
                        case 'logic_whitespace_both':
                        case 'logic':
                            // Newlines directly after logic tokens are ignored
                            end += 1;
                            break;
                        default:
                            break;
                    }
                }

                template = template.slice(end + foundToken.def.close.length);

                // Increment the position in the template
                errorOffset += end + foundToken.def.close.length;
            }
        }

        return tokens;
    };

    Twig.compile = function (tokens) {
        const self = this;
        try {
            // Output and intermediate stacks
            const output = [];
            const stack = [];
            // The tokens between open and close tags
            let intermediateOutput = [];

            let token = null;
            let logicToken = null;
            let unclosedToken = null;
            // Temporary previous token.
            let prevToken = null;
            // Temporary previous output.
            let prevOutput = null;
            // Temporary previous intermediate output.
            let prevIntermediateOutput = null;
            // The previous token's template
            let prevTemplate = null;
            // Token lookahead
            let nextToken = null;
            // The output token
            let tokOutput = null;

            // Logic Token values
            let type = null;
            let open = null;
            let next = null;

            const compileOutput = function (token) {
                Twig.expression.compile.call(self, token);
                if (stack.length > 0) {
                    intermediateOutput.push(token);
                } else {
                    output.push(token);
                }
            };

            const compileLogic = function (token) {
                // Compile the logic token
                logicToken = Twig.logic.compile.call(self, token);

                type = logicToken.type;
                open = Twig.logic.handler[type].open;
                next = Twig.logic.handler[type].next;

                Twig.log.trace('Twig.compile: ', 'Compiled logic token to ', logicToken,
                    ' next is: ', next, ' open is : ', open);

                // Not a standalone token, check logic stack to see if this is expected
                if (open !== undefined && !open) {
                    prevToken = stack.pop();
                    prevTemplate = Twig.logic.handler[prevToken.type];

                    if (!prevTemplate.next.includes(type)) {
                        throw new Error(type + ' not expected after a ' + prevToken.type);
                    }

                    prevToken.output = prevToken.output || [];

                    prevToken.output = prevToken.output.concat(intermediateOutput);
                    intermediateOutput = [];

                    tokOutput = {
                        type: Twig.token.type.logic,
                        token: prevToken
                    };
                    if (stack.length > 0) {
                        intermediateOutput.push(tokOutput);
                    } else {
                        output.push(tokOutput);
                    }
                }

                // This token requires additional tokens to complete the logic structure.
                if (next !== undefined && next.length > 0) {
                    Twig.log.trace('Twig.compile: ', 'Pushing ', logicToken, ' to logic stack.');

                    if (stack.length > 0) {
                        // Put any currently held output into the output list of the logic operator
                        // currently at the head of the stack before we push a new one on.
                        prevToken = stack.pop();
                        prevToken.output = prevToken.output || [];
                        prevToken.output = prevToken.output.concat(intermediateOutput);
                        stack.push(prevToken);
                        intermediateOutput = [];
                    }

                    // Push the new logic token onto the logic stack
                    stack.push(logicToken);
                } else if (open !== undefined && open) {
                    tokOutput = {
                        type: Twig.token.type.logic,
                        token: logicToken
                    };
                    // Standalone token (like {% set ... %}
                    if (stack.length > 0) {
                        intermediateOutput.push(tokOutput);
                    } else {
                        output.push(tokOutput);
                    }
                }
            };

            while (tokens.length > 0) {
                token = tokens.shift();
                prevOutput = output[output.length - 1];
                prevIntermediateOutput = intermediateOutput[intermediateOutput.length - 1];
                nextToken = tokens[0];
                Twig.log.trace('Compiling token ', token);
                switch (token.type) {
                    case Twig.token.type.raw:
                        if (stack.length > 0) {
                            intermediateOutput.push(token);
                        } else {
                            output.push(token);
                        }

                        break;

                    case Twig.token.type.logic:
                        compileLogic.call(self, token);
                        break;

                    // Do nothing, comments should be ignored
                    case Twig.token.type.comment:
                        break;

                    case Twig.token.type.output:
                        compileOutput.call(self, token);
                        break;

                    // Kill whitespace ahead and behind this token
                    case Twig.token.type.logicWhitespacePre:
                    case Twig.token.type.logicWhitespacePost:
                    case Twig.token.type.logicWhitespaceBoth:
                    case Twig.token.type.outputWhitespacePre:
                    case Twig.token.type.outputWhitespacePost:
                    case Twig.token.type.outputWhitespaceBoth:
                        if (token.type !== Twig.token.type.outputWhitespacePost && token.type !== Twig.token.type.logicWhitespacePost) {
                            if (prevOutput) {
                                // If the previous output is raw, pop it off
                                if (prevOutput.type === Twig.token.type.raw) {
                                    output.pop();

                                    prevOutput.value = prevOutput.value.trimEnd();
                                    // Repush the previous output
                                    output.push(prevOutput);
                                }
                            }

                            if (prevIntermediateOutput) {
                                // If the previous intermediate output is raw, pop it off
                                if (prevIntermediateOutput.type === Twig.token.type.raw) {
                                    intermediateOutput.pop();

                                    prevIntermediateOutput.value = prevIntermediateOutput.value.trimEnd();
                                    // Repush the previous intermediate output
                                    intermediateOutput.push(prevIntermediateOutput);
                                }
                            }
                        }

                        // Compile this token
                        switch (token.type) {
                            case Twig.token.type.outputWhitespacePre:
                            case Twig.token.type.outputWhitespacePost:
                            case Twig.token.type.outputWhitespaceBoth:
                                compileOutput.call(self, token);
                                break;
                            case Twig.token.type.logicWhitespacePre:
                            case Twig.token.type.logicWhitespacePost:
                            case Twig.token.type.logicWhitespaceBoth:
                                compileLogic.call(self, token);
                                break;
                            default:
                                break;
                        }

                        if (token.type !== Twig.token.type.outputWhitespacePre && token.type !== Twig.token.type.logicWhitespacePre) {
                            if (nextToken) {
                                // If the next token is raw, shift it out
                                if (nextToken.type === Twig.token.type.raw) {
                                    tokens.shift();

                                    nextToken.value = nextToken.value.trimStart();
                                    // Unshift the next token
                                    tokens.unshift(nextToken);
                                }
                            }
                        }

                        break;
                    default:
                        break;
                }

                Twig.log.trace('Twig.compile: ', ' Output: ', output,
                    ' Logic Stack: ', stack,
                    ' Pending Output: ', intermediateOutput
                );
            }

            // Verify that there are no logic tokens left in the stack.
            if (stack.length > 0) {
                unclosedToken = stack.pop();
                throw new Error('Unable to find an end tag for ' + unclosedToken.type +
                                ', expecting one of ' + unclosedToken.next);
            }

            return output;
        } catch (error) {
            if (self.options.rethrow) {
                if (error.type === 'TwigException' && !error.file) {
                    error.file = self.id;
                }

                throw error;
            } else {
                Twig.log.error('Error compiling twig template ' + self.id + ': ');
                if (error.stack) {
                    Twig.log.error(error.stack);
                } else {
                    Twig.log.error(error.toString());
                }
            }
        }
    };

    function handleException(state, ex) {
        if (state.template.options.rethrow) {
            if (typeof ex === 'string') {
                ex = new Twig.Error(ex);
            }

            if (ex.type === 'TwigException' && !ex.file) {
                ex.file = state.template.id;
            }

            throw ex;
        } else {
            Twig.log.error('Error parsing twig template ' + state.template.id + ': ');
            if (ex.stack) {
                Twig.log.error(ex.stack);
            } else {
                Twig.log.error(ex.toString());
            }

            if (Twig.debug) {
                return ex.toString();
            }
        }
    }

    /**
     * Tokenize and compile a string template.
     *
     * @param {string} data The template.
     *
     * @return {Array} The compiled tokens.
     */
    Twig.prepare = function (data) {
        // Tokenize
        Twig.log.debug('Twig.prepare: ', 'Tokenizing ', data);
        const rawTokens = Twig.tokenize.call(this, data);

        // Compile
        Twig.log.debug('Twig.prepare: ', 'Compiling ', rawTokens);
        const tokens = Twig.compile.call(this, rawTokens);

        Twig.log.debug('Twig.prepare: ', 'Compiled ', tokens);

        return tokens;
    };

    /**
     * Join the output token's stack and escape it if needed
     *
     * @param {Array} Output token's stack
     *
     * @return {string|String} Autoescaped output
     */
    Twig.output = function (output) {
        const {autoescape} = this.options;

        if (!autoescape) {
            return output.join('');
        }

        const strategy = (typeof autoescape === 'string') ? autoescape : 'html';

        const escapedOutput = output.map(str => {
            if (
                str &&
                (str.twigMarkup !== true && str.twigMarkup !== strategy) &&
                !(strategy === 'html' && str.twigMarkup === 'html_attr')
            ) {
                str = Twig.filters.escape(str, [strategy]);
            }

            return str;
        });

        if (escapedOutput.length === 0) {
            return '';
        }

        const joinedOutput = escapedOutput.join('');
        if (joinedOutput.length === 0) {
            return '';
        }

        return new Twig.Markup(joinedOutput, true);
    };

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
    Twig.validateId = function (id) {
        if (id === 'prototype') {
            throw new Twig.Error(id + ' is not a valid twig identifier');
        } else if (Twig.cache && Object.hasOwnProperty.call(Twig.Templates.registry, id)) {
            throw new Twig.Error('There is already a template with the ID ' + id);
        }

        return true;
    };

    /**
     * Register a template loader
     *
     * @example
     * Twig.extend(function (Twig) {
     *    Twig.Templates.registerLoader('custom_loader', function (location, params, callback, errorCallback) {
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
     * @param {String} methodName The method this loader is intended for (ajax, fs)
     * @param {Function} func The function to execute when loading the template
     * @param {Object|undefined} scope Optional scope parameter to bind func to
     *
     * @throws Twig.Error
     *
     * @return {void}
     */
    Twig.Templates.registerLoader = function (methodName, func, scope) {
        if (typeof func !== 'function') {
            throw new Twig.Error('Unable to add loader for ' + methodName + ': Invalid function reference given.');
        }

        if (scope) {
            func = func.bind(scope);
        }

        this.loaders[methodName] = func;
    };

    /**
     * Remove a registered loader
     *
     * @param {String} methodName The method name for the loader you wish to remove
     *
     * @return {void}
     */
    Twig.Templates.unRegisterLoader = function (methodName) {
        if (this.isRegisteredLoader(methodName)) {
            delete this.loaders[methodName];
        }
    };

    /**
     * See if a loader is registered by its method name
     *
     * @param {String} methodName The name of the loader you are looking for
     *
     * @return {boolean}
     */
    Twig.Templates.isRegisteredLoader = function (methodName) {
        return Object.hasOwnProperty.call(this.loaders, methodName);
    };

    /**
     * Register a template parser
     *
     * @example
     * Twig.extend(function (Twig) {
     *    Twig.Templates.registerParser('custom_parser', function (params) {
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
     * @param {String} methodName The method this parser is intended for (twig, source)
     * @param {Function} func The function to execute when parsing the template
     * @param {Object|undefined} scope Optional scope parameter to bind func to
     *
     * @throws Twig.Error
     *
     * @return {void}
     */
    Twig.Templates.registerParser = function (methodName, func, scope) {
        if (typeof func !== 'function') {
            throw new Twig.Error('Unable to add parser for ' + methodName + ': Invalid function regerence given.');
        }

        if (scope) {
            func = func.bind(scope);
        }

        this.parsers[methodName] = func;
    };

    /**
     * Remove a registered parser
     *
     * @param {String} methodName The method name for the parser you wish to remove
     *
     * @return {void}
     */
    Twig.Templates.unRegisterParser = function (methodName) {
        if (this.isRegisteredParser(methodName)) {
            delete this.parsers[methodName];
        }
    };

    /**
     * See if a parser is registered by its method name
     *
     * @param {String} methodName The name of the parser you are looking for
     *
     * @return {boolean}
     */
    Twig.Templates.isRegisteredParser = function (methodName) {
        return Object.hasOwnProperty.call(this.parsers, methodName);
    };

    /**
     * Save a template object to the store.
     *
     * @param {Twig.Template} template   The twig.js template to store.
     */
    Twig.Templates.save = function (template) {
        if (template.id === undefined) {
            throw new Twig.Error('Unable to save template with no id');
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
    Twig.Templates.load = function (id) {
        if (!Object.hasOwnProperty.call(Twig.Templates.registry, id)) {
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
     * @param {function} errorCallback  A callback triggered if an error occurs loading the template.
     *
     *
     */
    Twig.Templates.loadRemote = function (location, params, callback, errorCallback) {
        // Default to the URL so the template is cached.
        const id = typeof params.id === 'undefined' ? location : params.id;
        const cached = Twig.Templates.registry[id];

        // Check for existing template
        if (Twig.cache && typeof cached !== 'undefined') {
            // A template is already saved with the given id.
            if (typeof callback === 'function') {
                callback(cached);
            }
            // TODO: if async, return deferred promise

            return cached;
        }

        // If the parser name hasn't been set, default it to twig
        params.parser = params.parser || 'twig';
        params.id = id;

        // Default to async
        if (typeof params.async === 'undefined') {
            params.async = true;
        }

        // Assume 'fs' if the loader is not defined
        const loader = this.loaders[params.method] || this.loaders.fs;
        return loader.call(this, location, params, callback, errorCallback);
    };

    // Determine object type
    function is(type, obj) {
        const clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    /**
     * A wrapper for template blocks.
     *
     * @param  {Twig.Template} The template that the block was originally defined in.
     * @param  {Object} The compiled block token.
     */
    Twig.Block = function (template, token) {
        this.template = template;
        this.token = token;
    };

    /**
     * Render the block using a specific parse state and context.
     *
     * @param  {Twig.ParseState} parseState
     * @param  {Object} context
     *
     * @return {Promise}
     */
    Twig.Block.prototype.render = function (parseState, context) {
        const originalTemplate = parseState.template;
        let promise;

        parseState.template = this.template;

        if (this.token.expression) {
            promise = Twig.expression.parseAsync.call(parseState, this.token.output, context);
        } else {
            promise = parseState.parseAsync(this.token.output, context);
        }

        return promise
            .then(value => {
                return Twig.expression.parseAsync.call(
                    parseState,
                    {
                        type: Twig.expression.type.string,
                        value
                    },
                    context
                );
            })
            .then(output => {
                parseState.template = originalTemplate;

                return output;
            });
    };

    /**
     * Holds the state needed to parse a template.
     *
     * @param {Twig.Template} template The template that the tokens being parsed are associated with.
     * @param {Object} blockOverrides Any blocks that should override those defined in the associated template.
     */
    Twig.ParseState = function (template, blockOverrides, context) {
        this.renderedBlocks = {};
        this.overrideBlocks = blockOverrides === undefined ? {} : blockOverrides;
        this.context = context === undefined ? {} : context;
        this.macros = {};
        this.nestingStack = [];
        this.template = template;
    };

    /**
     * Get a block by its name, resolving in the following order:
     *     - override blocks specified when initialized (except when excluded)
     *     - blocks resolved from the associated template
     *     - blocks resolved from the parent template when extending
     *
     * @param {String} name The name of the block to return.
     * @param {Boolean} checkOnlyInheritedBlocks Whether to skip checking the overrides and associated template, will not skip by default.
     *
     * @return {Twig.Block|undefined}
     */
    Twig.ParseState.prototype.getBlock = function (name, checkOnlyInheritedBlocks) {
        let block;

        if (checkOnlyInheritedBlocks !== true) {
            // Blocks specified when initialized
            block = this.overrideBlocks[name];
        }

        if (block === undefined) {
            // Block defined by the associated template
            block = this.template.getBlock(name, checkOnlyInheritedBlocks);
        }

        if (block === undefined && this.template.parentTemplate !== null) {
            // Block defined in the parent template when extending
            block = this.template.parentTemplate.getBlock(name);
        }

        return block;
    };

    /**
     * Get all the available blocks, resolving in the following order:
     *     - override blocks specified when initialized
     *     - blocks resolved from the associated template
     *     - blocks resolved from the parent template when extending (except when excluded)
     *
     * @param {Boolean} includeParentBlocks Whether to get blocks from the parent template when extending, will always do so by default.
     *
     * @return {Object}
     */
    Twig.ParseState.prototype.getBlocks = function (includeParentBlocks) {
        let blocks = {};

        if (includeParentBlocks !== false &&
            this.template.parentTemplate !== null &&
            // Prevent infinite loop
            this.template.parentTemplate !== this.template
        ) {
            // Blocks from the parent template when extending
            blocks = this.template.parentTemplate.getBlocks();
        }

        blocks = {
            ...blocks,
            // Override with any blocks defined within the associated template
            ...this.template.getBlocks(),
            // Override with any blocks specified when initialized
            ...this.overrideBlocks
        };

        return blocks;
    };

    /**
     * Get the closest token of a specific type to the current nest level.
     *
     * @param  {String} type  The logic token type
     *
     * @return {Object}
     */
    Twig.ParseState.prototype.getNestingStackToken = function (type) {
        let matchingToken;

        this.nestingStack.forEach(token => {
            if (matchingToken === undefined && token.type === type) {
                matchingToken = token;
            }
        });

        return matchingToken;
    };

    /**
     * Parse a set of tokens using the current state.
     *
     * @param {Array} tokens The compiled tokens.
     * @param {Object} context The context to set the state to while parsing.
     * @param {Boolean} allowAsync Whether to parse asynchronously.
     * @param {Object} blocks Blocks that should override any defined while parsing.
     *
     * @return {String} The rendered tokens.
     *
     */
    Twig.ParseState.prototype.parse = function (tokens, context, allowAsync) {
        const state = this;
        let output = [];

        // Store any error that might be thrown by the promise chain.
        let err = null;

        // This will be set to isAsync if template renders synchronously
        let isAsync = true;
        let promise = null;
        // Track logic chains
        let chain = true;

        if (context) {
            state.context = context;
        }

        /*
         * Extracted into it's own function such that the function
         * does not get recreated over and over again in the `forEach`
         * loop below. This method can be compiled and optimized
         * a single time instead of being recreated on each iteration.
         */
        function outputPush(o) {
            output.push(o);
        }

        function parseTokenLogic(logic) {
            if (typeof logic.chain !== 'undefined') {
                chain = logic.chain;
            }

            if (typeof logic.context !== 'undefined') {
                state.context = logic.context;
            }

            if (typeof logic.output !== 'undefined') {
                output.push(logic.output);
            }
        }

        promise = Twig.async.forEach(tokens, token => {
            Twig.log.debug('Twig.ParseState.parse: ', 'Parsing token: ', token);

            switch (token.type) {
                case Twig.token.type.raw:
                    output.push(Twig.filters.raw(token.value));
                    break;

                case Twig.token.type.logic:
                    return Twig.logic.parseAsync.call(state, token.token /* logicToken */, state.context, chain)
                        .then(parseTokenLogic);
                case Twig.token.type.comment:
                    // Do nothing, comments should be ignored
                    break;

                // Fall through whitespace to output
                case Twig.token.type.outputWhitespacePre:
                case Twig.token.type.outputWhitespacePost:
                case Twig.token.type.outputWhitespaceBoth:
                case Twig.token.type.output:
                    Twig.log.debug('Twig.ParseState.parse: ', 'Output token: ', token.stack);
                    // Parse the given expression in the given context
                    return Twig.expression.parseAsync.call(state, token.stack, state.context)
                        .then(outputPush);
                default:
                    break;
            }
        }).then(() => {
            output = Twig.output.call(state.template, output);
            isAsync = false;
            return output;
        }).catch(error => {
            if (allowAsync) {
                handleException(state, error);
            }

            err = error;
        });

        // If `allowAsync` we will always return a promise since we do not
        // know in advance if we are going to run asynchronously or not.
        if (allowAsync) {
            return promise;
        }

        // Handle errors here if we fail synchronously.
        if (err !== null) {
            return handleException(state, err);
        }

        // If `allowAsync` is not true we should not allow the user
        // to use asynchronous functions or filters.
        if (isAsync) {
            throw new Twig.Error('You are using Twig.js in sync mode in combination with async extensions.');
        }

        return output;
    };

    /**
     * Create a new twig.js template.
     *
     * Parameters: {
     *      data:   The template, either pre-compiled tokens or a string template
     *      id:     The name of this template
     * }
     *
     * @param {Object} params The template parameters.
     */
    Twig.Template = function (params) {
        const {data, id, base, path, url, name, method, options} = params;

        // # What is stored in a Twig.Template
        //
        // The Twig Template hold several chucks of data.
        //
        //     {
        //          id:     The token ID (if any)
        //          tokens: The list of tokens that makes up this template.
        //          base:   The base template (if any)
        //            options:  {
        //                Compiler/parser options
        //
        //                strict_variables: true/false
        //                    Should missing variable/keys emit an error message. If false, they default to null.
        //            }
        //     }
        //

        this.base = base;
        this.blocks = {
            defined: {},
            imported: {}
        };
        this.id = id;
        this.method = method;
        this.name = name;
        this.options = options;
        this.parentTemplate = null;
        this.path = path;
        this.url = url;

        if (is('String', data)) {
            this.tokens = Twig.prepare.call(this, data);
        } else {
            this.tokens = data;
        }

        if (id !== undefined) {
            Twig.Templates.save(this);
        }
    };

    /**
     * Get a block by its name, resolving in the following order:
     *     - blocks defined in the template itself
     *     - blocks imported from another template
     *
     * @param {String} name The name of the block to return.
     * @param {Boolean} checkOnlyInheritedBlocks Whether to skip checking the blocks defined in the template itself, will not skip by default.
     *
     * @return {Twig.Block|undefined}
     */
    Twig.Template.prototype.getBlock = function (name, checkOnlyInheritedBlocks, checkImports = true) {
        let block;

        if (checkOnlyInheritedBlocks !== true) {
            block = this.blocks.defined[name];
        }

        if (checkImports && block === undefined) {
            block = this.blocks.imported[name];
        }

        if (block === undefined && this.parentTemplate !== null) {
            /**
             * Block defined in the parent template when extending.
             * This recursion is useful to inherit from ascendants.
             * But take care of not considering ascendants' {% use %}
             */
            block = this.parentTemplate.getBlock(name, checkOnlyInheritedBlocks, checkImports = false);
        }

        return block;
    };

    /**
     * Get all the available blocks, resolving in the following order:
     *     - blocks defined in the template itself
     *     - blocks imported from other templates
     *
     * @return {Object}
     */
    Twig.Template.prototype.getBlocks = function () {
        let blocks = {};

        blocks = {
            ...blocks,
            // Get any blocks imported from other templates
            ...this.blocks.imported,
            // Override with any blocks defined within the template itself
            ...this.blocks.defined
        };

        return blocks;
    };

    Twig.Template.prototype.render = function (context, params, allowAsync) {
        const template = this;

        params = params || {};

        return Twig.async.potentiallyAsync(template, allowAsync, () => {
            const state = new Twig.ParseState(template, params.blocks, context);

            return state.parseAsync(template.tokens)
                .then(output => {
                    let parentTemplate;
                    let url;

                    if (template.parentTemplate !== null) {
                        // This template extends another template

                        if (template.options.allowInlineIncludes) {
                            // The template is provided inline
                            parentTemplate = Twig.Templates.load(template.parentTemplate);

                            if (parentTemplate) {
                                parentTemplate.options = template.options;
                            }
                        }

                        // Check for the template file via include
                        if (!parentTemplate) {
                            url = Twig.path.parsePath(template, template.parentTemplate);

                            parentTemplate = Twig.Templates.loadRemote(url, {
                                method: template.getLoaderMethod(),
                                base: template.base,
                                async: false,
                                id: url,
                                options: template.options
                            });
                        }

                        template.parentTemplate = parentTemplate;

                        return template.parentTemplate.renderAsync(
                            state.context,
                            {
                                blocks: state.getBlocks(false),
                                isInclude: true
                            }
                        );
                    }

                    if (params.isInclude === true) {
                        return output;
                    }

                    return output.valueOf();
                });
        });
    };

    Twig.Template.prototype.importFile = function (file) {
        let url = null;
        let subTemplate;
        if (!this.url && this.options.allowInlineIncludes) {
            file = this.path ? Twig.path.parsePath(this, file) : file;
            subTemplate = Twig.Templates.load(file);

            if (!subTemplate) {
                subTemplate = Twig.Templates.loadRemote(url, {
                    id: file,
                    method: this.getLoaderMethod(),
                    async: false,
                    path: file,
                    options: this.options
                });

                if (!subTemplate) {
                    throw new Twig.Error('Unable to find the template ' + file);
                }
            }

            subTemplate.options = this.options;

            return subTemplate;
        }

        url = Twig.path.parsePath(this, file);

        // Load blocks from an external file
        subTemplate = Twig.Templates.loadRemote(url, {
            method: this.getLoaderMethod(),
            base: this.base,
            async: false,
            options: this.options,
            id: url
        });

        return subTemplate;
    };

    Twig.Template.prototype.getLoaderMethod = function () {
        if (this.path) {
            return 'fs';
        }

        if (this.url) {
            return 'ajax';
        }

        return this.method || 'fs';
    };

    Twig.Template.prototype.compile = function (options) {
        // Compile the template into raw JS
        return Twig.compiler.compile(this, options);
    };

    /**
     * Create safe output
     *
     * @param {string} Content safe to output
     *
     * @return {String} Content wrapped into a String
     */

    Twig.Markup = function (content, strategy) {
        if (typeof content !== 'string') {
            return content;
        }

        /* eslint-disable no-new-wrappers, unicorn/new-for-builtins */
        const output = new String(content);
        /* eslint-enable */
        output.twigMarkup = (typeof strategy === 'undefined') ? true : strategy;

        return output;
    };

    return Twig;
};
