// ## twig.logic.js
//
// This file handles tokenizing, compiling and parsing logic tokens. {% ... %}
module.exports = function (Twig) {
    'use strict';

    /**
     * Namespace for logic handling.
     */
    Twig.logic = {};

    /**
     * Logic token types.
     */
    Twig.logic.type = {
        if_: 'Twig.logic.type.if',
        endif: 'Twig.logic.type.endif',
        for_: 'Twig.logic.type.for',
        endfor: 'Twig.logic.type.endfor',
        else_: 'Twig.logic.type.else',
        elseif: 'Twig.logic.type.elseif',
        set: 'Twig.logic.type.set',
        setcapture: 'Twig.logic.type.setcapture',
        endset: 'Twig.logic.type.endset',
        filter: 'Twig.logic.type.filter',
        endfilter: 'Twig.logic.type.endfilter',
        apply: 'Twig.logic.type.apply',
        endapply: 'Twig.logic.type.endapply',
        do: 'Twig.logic.type.do',
        shortblock: 'Twig.logic.type.shortblock',
        block: 'Twig.logic.type.block',
        endblock: 'Twig.logic.type.endblock',
        extends_: 'Twig.logic.type.extends',
        use: 'Twig.logic.type.use',
        include: 'Twig.logic.type.include',
        spaceless: 'Twig.logic.type.spaceless',
        endspaceless: 'Twig.logic.type.endspaceless',
        macro: 'Twig.logic.type.macro',
        endmacro: 'Twig.logic.type.endmacro',
        import_: 'Twig.logic.type.import',
        from: 'Twig.logic.type.from',
        embed: 'Twig.logic.type.embed',
        endembed: 'Twig.logic.type.endembed',
        with: 'Twig.logic.type.with',
        endwith: 'Twig.logic.type.endwith',
        deprecated: 'Twig.logic.type.deprecated'
    };

    // Regular expressions for handling logic tokens.
    //
    // Properties:
    //
    //      type:  The type of expression this matches
    //
    //      regex: A regular expression that matches the format of the token
    //
    //      next:  What logic tokens (if any) pop this token off the logic stack. If empty, the
    //             logic token is assumed to not require an end tag and isn't push onto the stack.
    //
    //      open:  Does this tag open a logic expression or is it standalone. For example,
    //             {% endif %} cannot exist without an opening {% if ... %} tag, so open = false.
    //
    //  Functions:
    //
    //      compile: A function that handles compiling the token into an output token ready for
    //               parsing with the parse function.
    //
    //      parse:   A function that parses the compiled token into output (HTML / whatever the
    //               template represents).
    Twig.logic.definitions = [
        {
            /**
             * If type logic tokens.
             *
             *  Format: {% if expression %}
             */
            type: Twig.logic.type.if_,
            regex: /^if\s?([\s\S]+)$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.elseif,
                Twig.logic.type.endif
            ],
            open: true,
            compile(token) {
                const expression = token.match[1];
                // Compile the expression.
                token.stack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;
                delete token.match;
                return token;
            },
            parse(token, context, chain) {
                const state = this;

                return Twig.expression.parseAsync.call(state, token.stack, context)
                    .then(result => {
                        chain = true;

                        if (Twig.lib.boolval(result)) {
                            chain = false;

                            return state.parseAsync(token.output, context);
                        }

                        return '';
                    })
                    .then(output => {
                        return {
                            chain,
                            output
                        };
                    });
            }
        },
        {
            /**
             * Else if type logic tokens.
             *
             *  Format: {% elseif expression %}
             */
            type: Twig.logic.type.elseif,
            regex: /^elseif\s?([^\s].*)$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.elseif,
                Twig.logic.type.endif
            ],
            open: false,
            compile(token) {
                const expression = token.match[1];
                // Compile the expression.
                token.stack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;
                delete token.match;
                return token;
            },
            parse(token, context, chain) {
                const state = this;

                return Twig.expression.parseAsync.call(state, token.stack, context)
                    .then(result => {
                        if (chain && Twig.lib.boolval(result)) {
                            chain = false;

                            return state.parseAsync(token.output, context);
                        }

                        return '';
                    })
                    .then(output => {
                        return {
                            chain,
                            output
                        };
                    });
            }
        },
        {
            /**
             * Else type logic tokens.
             *
             *  Format: {% else %}
             */
            type: Twig.logic.type.else_,
            regex: /^else$/,
            next: [
                Twig.logic.type.endif,
                Twig.logic.type.endfor
            ],
            open: false,
            parse(token, context, chain) {
                let promise = Twig.Promise.resolve('');
                const state = this;

                if (chain) {
                    promise = state.parseAsync(token.output, context);
                }

                return promise.then(output => {
                    return {
                        chain,
                        output
                    };
                });
            }
        },
        {
            /**
             * End if type logic tokens.
             *
             *  Format: {% endif %}
             */
            type: Twig.logic.type.endif,
            regex: /^endif$/,
            next: [],
            open: false
        },
        {
            /**
             * For type logic tokens.
             *
             *  Format: {% for expression %}
             */
            type: Twig.logic.type.for_,
            regex: /^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+([\S\s]+?)(?:\s+if\s+([^\s].*))?$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.endfor
            ],
            open: true,
            compile(token) {
                const keyValue = token.match[1];
                const expression = token.match[2];
                const conditional = token.match[3];
                let kvSplit = null;

                token.keyVar = null;
                token.valueVar = null;

                if (keyValue.includes(',')) {
                    kvSplit = keyValue.split(',');
                    if (kvSplit.length === 2) {
                        token.keyVar = kvSplit[0].trim();
                        token.valueVar = kvSplit[1].trim();
                    } else {
                        throw new Twig.Error('Invalid expression in for loop: ' + keyValue);
                    }
                } else {
                    token.valueVar = keyValue.trim();
                }

                // Valid expressions for a for loop
                //   for item     in expression
                //   for key,item in expression

                // Compile the expression.
                token.expression = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;

                // Compile the conditional (if available)
                if (conditional) {
                    token.conditional = Twig.expression.compile.call(this, {
                        type: Twig.expression.type.expression,
                        value: conditional
                    }).stack;
                }

                delete token.match;
                return token;
            },
            parse(token, context, continueChain) {
                // Parse expression
                const output = [];
                let len;
                let index = 0;
                let keyset;
                const state = this;
                const {conditional} = token;
                const buildLoop = function (index, len) {
                    const isConditional = conditional !== undefined;
                    return {
                        index: index + 1,
                        index0: index,
                        revindex: isConditional ? undefined : len - index,
                        revindex0: isConditional ? undefined : len - index - 1,
                        first: (index === 0),
                        last: isConditional ? undefined : (index === len - 1),
                        length: isConditional ? undefined : len,
                        parent: context
                    };
                };

                // Run once for each iteration of the loop
                const loop = function (key, value) {
                    const innerContext = {...context};

                    innerContext[token.valueVar] = value;

                    if (token.keyVar) {
                        innerContext[token.keyVar] = key;
                    }

                    // Loop object
                    innerContext.loop = buildLoop(index, len);

                    const promise = conditional === undefined ?
                        Twig.Promise.resolve(true) :
                        Twig.expression.parseAsync.call(state, conditional, innerContext);

                    return promise.then(condition => {
                        if (!condition) {
                            return;
                        }

                        return state.parseAsync(token.output, innerContext)
                            .then(tokenOutput => {
                                output.push(tokenOutput);
                                index += 1;
                            });
                    })
                        .then(() => {
                            // Delete loop-related variables from the context
                            delete innerContext.loop;
                            delete innerContext[token.valueVar];
                            delete innerContext[token.keyVar];

                            // Merge in values that exist in context but have changed
                            // in inner_context.
                            Twig.merge(context, innerContext, true);
                        });
                };

                return Twig.expression.parseAsync.call(state, token.expression, context)
                    .then(result => {
                        if (Array.isArray(result)) {
                            len = result.length;
                            return Twig.async.forEach(result, value => {
                                const key = index;

                                return loop(key, value);
                            });
                        }

                        if (Twig.lib.is('Object', result)) {
                            if (result._keys === undefined) {
                                keyset = Object.keys(result);
                            } else {
                                keyset = result._keys;
                            }

                            len = keyset.length;
                            return Twig.async.forEach(keyset, key => {
                            // Ignore the _keys property, it's internal to twig.js
                                if (key === '_keys') {
                                    return;
                                }

                                return loop(key, result[key]);
                            });
                        }
                    })
                    .then(() => {
                    // Only allow else statements if no output was generated
                        continueChain = (output.length === 0);

                        return {
                            chain: continueChain,
                            context,
                            output: Twig.output.call(state.template, output)
                        };
                    });
            }
        },
        {
            /**
             * End for type logic tokens.
             *
             *  Format: {% endfor %}
             */
            type: Twig.logic.type.endfor,
            regex: /^endfor$/,
            next: [],
            open: false
        },
        {
            /**
             * Set type logic tokens.
             *
             *  Format: {% set key = expression %}
             */
            type: Twig.logic.type.set,
            regex: /^set\s+([a-zA-Z0-9_,\s]+)\s*=\s*([\s\S]+)$/,
            next: [],
            open: true,
            compile(token) { //
                const key = token.match[1].trim();
                const expression = token.match[2];
                // Compile the expression.
                const expressionStack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;

                token.key = key;
                token.expression = expressionStack;

                delete token.match;
                return token;
            },
            parse(token, context, continueChain) {
                const {key} = token;
                const state = this;

                return Twig.expression.parseAsync.call(state, token.expression, context)
                    .then(value => {
                        if (value === context) {
                        /*  If storing the context in a variable, it needs to be a clone of the current state of context.
                            Otherwise we have a context with infinite recursion.
                            Fixes #341
                        */
                            value = {...value};
                        }

                        context[key] = value;

                        return {
                            chain: continueChain,
                            context
                        };
                    });
            }
        },
        {
            /**
             * Set capture type logic tokens.
             *
             *  Format: {% set key %}
             */
            type: Twig.logic.type.setcapture,
            regex: /^set\s+([a-zA-Z0-9_,\s]+)$/,
            next: [
                Twig.logic.type.endset
            ],
            open: true,
            compile(token) {
                const key = token.match[1].trim();

                token.key = key;

                delete token.match;
                return token;
            },
            parse(token, context, continueChain) {
                const state = this;
                const {key} = token;

                return state.parseAsync(token.output, context)
                    .then(output => {
                    // Set on both the global and local context
                        state.context[key] = output;
                        context[key] = output;

                        return {
                            chain: continueChain,
                            context
                        };
                    });
            }
        },
        {
            /**
             * End set type block logic tokens.
             *
             *  Format: {% endset %}
             */
            type: Twig.logic.type.endset,
            regex: /^endset$/,
            next: [],
            open: false
        },
        {
            /**
             * Filter logic tokens.
             *
             *  Format: {% filter upper %} or {% filter lower|escape %}
             */
            type: Twig.logic.type.filter,
            regex: /^filter\s+(.+)$/,
            next: [
                Twig.logic.type.endfilter
            ],
            open: true,
            compile(token) {
                const expression = '|' + token.match[1].trim();
                // Compile the expression.
                token.stack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;
                delete token.match;
                return token;
            },
            parse(token, context, chain) {
                const state = this;

                return state.parseAsync(token.output, context)
                    .then(output => {
                        const stack = [{
                            type: Twig.expression.type.string,
                            value: output
                        }].concat(token.stack);

                        return Twig.expression.parseAsync.call(state, stack, context);
                    })
                    .then(output => {
                        return {
                            chain,
                            output
                        };
                    });
            }
        },
        {
            /**
             * End filter logic tokens.
             *
             *  Format: {% endfilter %}
             */
            type: Twig.logic.type.endfilter,
            regex: /^endfilter$/,
            next: [],
            open: false
        },
        {
            /**
             * Apply logic tokens.
             *
             *  Format: {% apply upper %} or {% apply lower|escape %}
             */
            type: Twig.logic.type.apply,
            regex: /^apply\s+(.+)$/,
            next: [
                Twig.logic.type.endapply
            ],
            open: true,
            compile(token) {
                const expression = '|' + token.match[1].trim();
                // Compile the expression.
                token.stack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;
                delete token.match;
                return token;
            },
            parse(token, context, chain) {
                const state = this;

                return state.parseAsync(token.output, context)
                    .then(output => {
                        const stack = [{
                            type: Twig.expression.type.string,
                            value: output
                        }].concat(token.stack);

                        return Twig.expression.parseAsync.call(state, stack, context);
                    })
                    .then(output => {
                        return {
                            chain,
                            output
                        };
                    });
            }
        },
        {
            /**
             * End apply logic tokens.
             *
             *  Format: {% endapply %}
             */
            type: Twig.logic.type.endapply,
            regex: /^endapply$/,
            next: [],
            open: false
        },
        {
            /**
             * Set type logic tokens.
             *
             *  Format: {% do expression %}
             */
            type: Twig.logic.type.do,
            regex: /^do\s+([\S\s]+)$/,
            next: [],
            open: true,
            compile(token) { //
                const expression = token.match[1];
                // Compile the expression.
                const expressionStack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;

                token.expression = expressionStack;

                delete token.match;
                return token;
            },
            parse(token, context, continueChain) {
                const state = this;

                return Twig.expression.parseAsync.call(state, token.expression, context)
                    .then(() => {
                        return {
                            chain: continueChain,
                            context
                        };
                    });
            }
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% block title %}
             */
            type: Twig.logic.type.block,
            regex: /^block\s+(\w+)$/,
            next: [
                Twig.logic.type.endblock
            ],
            open: true,
            compile(token) {
                token.blockName = token.match[1].trim();
                delete token.match;

                return token;
            },
            parse(token, context, chain) {
                const state = this;
                let promise = Twig.Promise.resolve();

                state.template.blocks.defined[token.blockName] = new Twig.Block(state.template, token);

                if (
                    state.template.parentTemplate === null ||
                    state.template.parentTemplate instanceof Twig.Template
                ) {
                    promise = state.getBlock(token.blockName).render(state, context);
                }

                return promise.then(output => {
                    return {
                        chain,
                        output
                    };
                });
            }
        },
        {
            /**
             * Block shorthand logic tokens.
             *
             *  Format: {% block title expression %}
             */
            type: Twig.logic.type.shortblock,
            regex: /^block\s+(\w+)\s+(.+)$/,
            next: [],
            open: true,
            compile(token) {
                const template = this;

                token.expression = token.match[2].trim();
                token.output = Twig.expression.compile({
                    type: Twig.expression.type.expression,
                    value: token.expression
                }).stack;

                return Twig.logic.handler[Twig.logic.type.block].compile.apply(template, [token]);
            },
            parse(...args) {
                const state = this;

                return Twig.logic.handler[Twig.logic.type.block].parse.apply(state, args);
            }
        },
        {
            /**
             * End block logic tokens.
             *
             *  Format: {% endblock %}
             */
            type: Twig.logic.type.endblock,
            regex: /^endblock(?:\s+(\w+))?$/,
            next: [],
            open: false
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% extends "template.twig" %}
             */
            type: Twig.logic.type.extends_,
            regex: /^extends\s+(.+)$/,
            next: [],
            open: true,
            compile(token) {
                const expression = token.match[1].trim();
                delete token.match;

                token.stack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;

                return token;
            },
            parse(token, context, chain) {
                const state = this;

                return Twig.expression.parseAsync.call(state, token.stack, context)
                    .then(fileName => {
                        if (Array.isArray(fileName)) {
                            const result = fileName.reverse().reduce((acc, file) => {
                                try {
                                    return {
                                        render: state.template.importFile(file),
                                        fileName: file
                                    };
                                    /* eslint-disable-next-line no-unused-vars */
                                } catch (error) {
                                    return acc;
                                }
                            }, {
                                render: null,
                                fileName: null
                            });
                            if (result.fileName !== null) {
                                state.template.parentTemplate = result.fileName;
                            }
                        } else {
                            state.template.parentTemplate = fileName;
                        }

                        return {
                            chain,
                            output: ''
                        };
                    });
            }
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% use "template.twig" %}
             */
            type: Twig.logic.type.use,
            regex: /^use\s+(.+)$/,
            next: [],
            open: true,
            compile(token) {
                const expression = token.match[1].trim();
                delete token.match;

                token.stack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;

                return token;
            },
            parse(token, context, chain) {
                const state = this;

                return Twig.expression.parseAsync.call(state, token.stack, context)
                    .then(filePath => {
                        // Create a new state instead of using the current state
                        // any defined blocks will be created in isolation

                        const useTemplate = state.template.importFile(filePath);

                        const useState = new Twig.ParseState(useTemplate);
                        return useState.parseAsync(useTemplate.tokens)
                            .then(() => {
                                state.template.blocks.imported = {
                                    ...state.template.blocks.imported,
                                    ...useState.getBlocks()
                                };
                            });
                    })
                    .then(() => {
                        return {
                            chain,
                            output: ''
                        };
                    });
            }
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% includes "template.twig" [with {some: 'values'} only] %}
             */
            type: Twig.logic.type.include,
            regex: /^include\s+(.+?)(?:\s|$)(ignore missing(?:\s|$))?(?:with\s+([\S\s]+?))?(?:\s|$)(only)?$/,
            next: [],
            open: true,
            compile(token) {
                const {match} = token;
                const expression = match[1].trim();
                const ignoreMissing = match[2] !== undefined;
                const withContext = match[3];
                const only = ((match[4] !== undefined) && match[4].length);

                delete token.match;

                token.only = only;
                token.ignoreMissing = ignoreMissing;

                token.stack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;

                if (withContext !== undefined) {
                    token.withStack = Twig.expression.compile.call(this, {
                        type: Twig.expression.type.expression,
                        value: withContext.trim()
                    }).stack;
                }

                return token;
            },
            parse(token, context, chain) {
                // Resolve filename
                let innerContext = token.only ? {} : {...context};
                const {ignoreMissing} = token;
                const state = this;
                let promise = null;
                const result = {chain, output: ''};

                if (typeof token.withStack === 'undefined') {
                    promise = Twig.Promise.resolve();
                } else {
                    promise = Twig.expression.parseAsync.call(state, token.withStack, context)
                        .then(withContext => {
                            innerContext = {
                                ...innerContext,
                                ...withContext
                            };
                        });
                }

                return promise
                    .then(() => {
                        return Twig.expression.parseAsync.call(state, token.stack, context);
                    })
                    .then(file => {
                        let files;
                        if (Array.isArray(file)) {
                            files = file;
                        } else {
                            files = [file];
                        }

                        const result = files.reduce((acc, file) => {
                            if (acc.render === null) {
                                if (file instanceof Twig.Template) {
                                    return {
                                        render: file.renderAsync(
                                            innerContext,
                                            {
                                                isInclude: true
                                            }
                                        ),
                                        lastError: null
                                    };
                                }

                                try {
                                    return {
                                        render: state.template.importFile(file).renderAsync(
                                            innerContext,
                                            {
                                                isInclude: true
                                            }
                                        ),
                                        lastError: null
                                    };
                                } catch (error) {
                                    return {
                                        render: null,
                                        lastError: error
                                    };
                                }
                            }

                            return acc;
                        }, {render: null, lastError: null});

                        if (result.render !== null) {
                            return result.render;
                        }

                        if (result.render === null && ignoreMissing) {
                            return '';
                        }

                        throw result.lastError;
                    })
                    .then(output => {
                        if (output !== '') {
                            result.output = output;
                        }

                        return result;
                    });
            }
        },
        {
            type: Twig.logic.type.spaceless,
            regex: /^spaceless$/,
            next: [
                Twig.logic.type.endspaceless
            ],
            open: true,

            // Parse the html and return it without any spaces between tags
            parse(token, context, chain) {
                const state = this;

                // Parse the output without any filter
                return state.parseAsync(token.output, context)
                    .then(tokenOutput => {
                        const // A regular expression to find closing and opening tags with spaces between them
                            rBetweenTagSpaces = />\s+</g;
                        // Replace all space between closing and opening html tags
                        let output = tokenOutput.replace(rBetweenTagSpaces, '><').trim();
                        // Rewrap output as a Twig.Markup
                        output = new Twig.Markup(output);
                        return {
                            chain,
                            output
                        };
                    });
            }
        },

        // Add the {% endspaceless %} token
        {
            type: Twig.logic.type.endspaceless,
            regex: /^endspaceless$/,
            next: [],
            open: false
        },
        {
            /**
             * Macro logic tokens.
             *
             * Format: {% macro input(name = default, value, type, size) %}
             *
             */
            type: Twig.logic.type.macro,
            regex: /^macro\s+(\w+)\s*\(\s*((?:\w+(?:\s*=\s*([\s\S]+))?(?:,\s*)?)*)\s*\)$/,
            next: [
                Twig.logic.type.endmacro
            ],
            open: true,
            compile(token) {
                const macroName = token.match[1];
                const rawParameters = token.match[2].split(/\s*,\s*/);
                const parameters = rawParameters.map(rawParameter => {
                    return rawParameter.split(/\s*=\s*/)[0];
                });
                const parametersCount = parameters.length;

                // Duplicate check
                if (parametersCount > 1) {
                    const uniq = {};
                    for (let i = 0; i < parametersCount; i++) {
                        const parameter = parameters[i];
                        if (uniq[parameter]) {
                            throw new Twig.Error('Duplicate arguments for parameter: ' + parameter);
                        } else {
                            uniq[parameter] = 1;
                        }
                    }
                }

                token.macroName = macroName;
                token.parameters = parameters;
                token.defaults = rawParameters.reduce(function (defaults, rawParameter) {
                    const pair = rawParameter.split(/\s*=\s*/);
                    const key = pair[0];
                    const expression = pair[1];

                    if (expression) {
                        defaults[key] = Twig.expression.compile.call(this, {
                            type: Twig.expression.type.expression,
                            value: expression
                        }).stack;
                    } else {
                        defaults[key] = undefined;
                    }

                    return defaults;
                }, {});

                delete token.match;
                return token;
            },
            parse(token, context, chain) {
                const state = this;

                state.macros[token.macroName] = function (...args) {
                    // Pass global context and other macros
                    const macroContext = {
                        ...context,
                        _self: state.macros
                    };
                    // Save arguments

                    return Twig.async.forEach(token.parameters, function (prop, i) {
                        // Add parameters from context to macroContext
                        if (typeof args[i] !== 'undefined') {
                            macroContext[prop] = args[i];
                            return true;
                        }

                        if (typeof token.defaults[prop] !== 'undefined') {
                            return Twig.expression.parseAsync.call(this, token.defaults[prop], context)
                                .then(value => {
                                    macroContext[prop] = value;
                                    return Twig.Promise.resolve();
                                });
                        }

                        macroContext[prop] = undefined;
                        return true;
                    }).then(() => {
                        // Render
                        return state.parseAsync(token.output, macroContext);
                    });
                };

                return {
                    chain,
                    output: ''
                };
            }
        },
        {
            /**
             * End macro logic tokens.
             *
             * Format: {% endmacro %}
             */
            type: Twig.logic.type.endmacro,
            regex: /^endmacro$/,
            next: [],
            open: false
        },
        {
            /*
            * Import logic tokens.
            *
            * Format: {% import "template.twig" as form %}
            */
            type: Twig.logic.type.import_,
            regex: /^import\s+(.+)\s+as\s+(\w+)$/,
            next: [],
            open: true,
            compile(token) {
                const expression = token.match[1].trim();
                const contextName = token.match[2].trim();
                delete token.match;

                token.expression = expression;
                token.contextName = contextName;

                token.stack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;

                return token;
            },
            parse(token, context, chain) {
                const state = this;
                const output = {
                    chain,
                    output: ''
                };

                if (token.expression === '_self') {
                    context[token.contextName] = state.macros;
                    return output;
                }

                return Twig.expression.parseAsync.call(state, token.stack, context)
                    .then(filePath => {
                        return state.template.importFile(filePath || token.expression);
                    })
                    .then(importTemplate => {
                        const importState = new Twig.ParseState(importTemplate);

                        return importState.parseAsync(importTemplate.tokens).then(() => {
                            context[token.contextName] = importState.macros;

                            return output;
                        });
                    });
            }
        },
        {
            /*
            * From logic tokens.
            *
            * Format: {% from "template.twig" import func as form %}
            */
            type: Twig.logic.type.from,
            regex: /^from\s+(.+)\s+import\s+([a-zA-Z0-9_, ]+)$/,
            next: [],
            open: true,
            compile(token) {
                const expression = token.match[1].trim();
                const macroExpressions = token.match[2].trim().split(/\s*,\s*/);
                const macroNames = {};

                for (const res of macroExpressions) {
                    // Match function as variable
                    const macroMatch = res.match(/^(\w+)\s+as\s+(\w+)$/);
                    if (macroMatch) {
                        macroNames[macroMatch[1].trim()] = macroMatch[2].trim();
                    } else if (res.match(/^(\w+)$/)) {
                        macroNames[res] = res;
                    } else {
                        // ignore import
                    }
                }

                delete token.match;

                token.expression = expression;
                token.macroNames = macroNames;

                token.stack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;

                return token;
            },
            parse(token, context, chain) {
                const state = this;
                let promise;

                if (token.expression === '_self') {
                    promise = Twig.Promise.resolve(state.macros);
                } else {
                    promise = Twig.expression.parseAsync.call(state, token.stack, context)
                        .then(filePath => {
                            return state.template.importFile(filePath || token.expression);
                        })
                        .then(importTemplate => {
                            const importState = new Twig.ParseState(importTemplate);

                            return importState.parseAsync(importTemplate.tokens).then(() => {
                                return importState.macros;
                            });
                        });
                }

                return promise
                    .then(macros => {
                        for (const macroName in token.macroNames) {
                            if (macros[macroName] !== undefined) {
                                context[token.macroNames[macroName]] = macros[macroName];
                            }
                        }

                        return {
                            chain,
                            output: ''
                        };
                    });
            }
        },
        {
            /**
             * The embed tag combines the behaviour of include and extends.
             * It allows you to include another template's contents, just like include does.
             *
             *  Format: {% embed "template.twig" [with {some: 'values'} only] %}
             */
            type: Twig.logic.type.embed,
            regex: /^embed\s+(.+?)(?:\s+(ignore missing))?(?:\s+with\s+([\S\s]+?))?(?:\s+(only))?$/,
            next: [
                Twig.logic.type.endembed
            ],
            open: true,
            compile(token) {
                const {match} = token;
                const expression = match[1].trim();
                const ignoreMissing = match[2] !== undefined;
                const withContext = match[3];
                const only = ((match[4] !== undefined) && match[4].length);

                delete token.match;

                token.only = only;
                token.ignoreMissing = ignoreMissing;

                token.stack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;

                if (withContext !== undefined) {
                    token.withStack = Twig.expression.compile.call(this, {
                        type: Twig.expression.type.expression,
                        value: withContext.trim()
                    }).stack;
                }

                return token;
            },
            parse(token, context, chain) {
                let embedContext = {};
                let promise = Twig.Promise.resolve();
                let state = this;

                if (!token.only) {
                    embedContext = {...context};
                }

                if (token.withStack !== undefined) {
                    promise = Twig.expression.parseAsync.call(state, token.withStack, context).then(withContext => {
                        embedContext = {...embedContext, ...withContext};
                    });
                }

                return promise
                    .then(() => {
                        return Twig.expression.parseAsync.call(state, token.stack, embedContext);
                    })
                    .then(fileName => {
                        const embedOverrideTemplate = new Twig.Template({
                            data: token.output,
                            id: state.template.id,
                            base: state.template.base,
                            path: state.template.path,
                            url: state.template.url,
                            name: state.template.name,
                            method: state.template.method,
                            options: state.template.options
                        });

                        try {
                            embedOverrideTemplate.importFile(fileName);
                        } catch (error) {
                            if (token.ignoreMissing) {
                                return '';
                            }

                            // Errors preserve references to variables in scope,
                            // this removes `this` from the scope.
                            state = null;

                            throw error;
                        }

                        embedOverrideTemplate.parentTemplate = fileName;

                        return embedOverrideTemplate.renderAsync(
                            embedContext,
                            {
                                isInclude: true
                            }
                        );
                    })
                    .then(output => {
                        return {
                            chain,
                            output
                        };
                    });
            }
        },
        /* Add the {% endembed %} token
         *
         */
        {
            type: Twig.logic.type.endembed,
            regex: /^endembed$/,
            next: [],
            open: false
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% with {some: 'values'} [only] %}
             */
            type: Twig.logic.type.with,
            regex: /^(?:with\s+([\S\s]+?))(?:\s|$)(only)?$/,
            next: [
                Twig.logic.type.endwith
            ],
            open: true,
            compile(token) {
                const {match} = token;
                const withContext = match[1];
                const only = ((match[2] !== undefined) && match[2].length);

                delete token.match;

                token.only = only;

                if (withContext !== undefined) {
                    token.withStack = Twig.expression.compile.call(this, {
                        type: Twig.expression.type.expression,
                        value: withContext.trim()
                    }).stack;
                }

                return token;
            },
            parse(token, context, chain) {
                // Resolve filename
                let innerContext = {};
                let i;
                const state = this;
                let promise = Twig.Promise.resolve();

                if (!token.only) {
                    innerContext = {...context};
                }

                if (token.withStack !== undefined) {
                    promise = Twig.expression.parseAsync.call(state, token.withStack, context)
                        .then(withContext => {
                            for (i in withContext) {
                                if (Object.hasOwnProperty.call(withContext, i)) {
                                    innerContext[i] = withContext[i];
                                }
                            }
                        });
                }

                return promise
                    .then(() => {
                        return state.parseAsync(token.output, innerContext);
                    })
                    .then(output => {
                        return {
                            chain,
                            output
                        };
                    });
            }
        },
        {
            type: Twig.logic.type.endwith,
            regex: /^endwith$/,
            next: [],
            open: false
        },
        {
            /**
             * Deprecated type logic tokens.
             *
             *  Format: {% deprecated 'Description' %}
             */
            type: Twig.logic.type.deprecated,
            regex: /^deprecated\s+(.+)$/,
            next: [],
            open: true,
            compile(token) {
                console.warn('Deprecation notice: ' + token.match[1]);

                return token;
            },
            parse() {
                return {};
            }
        }

    ];

    /**
     * Registry for logic handlers.
     */
    Twig.logic.handler = {};

    /**
     * Define a new token type, available at Twig.logic.type.{type}
     */
    Twig.logic.extendType = function (type, value) {
        value = value || ('Twig.logic.type' + type);
        Twig.logic.type[type] = value;
    };

    /**
     * Extend the logic parsing functionality with a new token definition.
     *
     * // Define a new tag
     * Twig.logic.extend({
     *     type: Twig.logic.type.{type},
     *     // The pattern to match for this token
     *     regex: ...,
     *     // What token types can follow this token, leave blank if any.
     *     next: [ ... ]
     *     // Create and return compiled version of the token
     *     compile: function(token) { ... }
     *     // Parse the compiled token with the context provided by the render call
     *     //   and whether this token chain is complete.
     *     parse: function(token, context, chain) { ... }
     * });
     *
     * @param {Object} definition The new logic expression.
     */
    Twig.logic.extend = function (definition) {
        if (definition.type) {
            Twig.logic.extendType(definition.type);
        } else {
            throw new Twig.Error('Unable to extend logic definition. No type provided for ' + definition);
        }

        Twig.logic.handler[definition.type] = definition;
    };

    // Extend with built-in expressions
    while (Twig.logic.definitions.length > 0) {
        Twig.logic.extend(Twig.logic.definitions.shift());
    }

    /**
     * Compile a logic token into an object ready for parsing.
     *
     * @param {Object} rawToken An uncompiled logic token.
     *
     * @return {Object} A compiled logic token, ready for parsing.
     */
    Twig.logic.compile = function (rawToken) {
        const expression = rawToken.value.trim();
        let token = Twig.logic.tokenize.call(this, expression);
        const tokenTemplate = Twig.logic.handler[token.type];

        // Check if the token needs compiling
        if (tokenTemplate.compile) {
            token = tokenTemplate.compile.call(this, token);
            Twig.log.trace('Twig.logic.compile: ', 'Compiled logic token to ', token);
        }

        return token;
    };

    /**
     * Tokenize logic expressions. This function matches token expressions against regular
     * expressions provided in token definitions provided with Twig.logic.extend.
     *
     * @param {string} expression the logic token expression to tokenize
     *                (i.e. what's between {% and %})
     *
     * @return {Object} The matched token with type set to the token type and match to the regex match.
     */
    Twig.logic.tokenize = function (expression) {
        let tokenTemplateType = null;
        let tokenType = null;
        let tokenRegex = null;
        let regexArray = null;
        let regexLen = null;
        let regexI = null;
        let match = null;

        // Ignore whitespace around expressions.
        expression = expression.trim();

        for (tokenTemplateType in Twig.logic.handler) {
            if (Object.hasOwnProperty.call(Twig.logic.handler, tokenTemplateType)) {
                // Get the type and regex for this template type
                tokenType = Twig.logic.handler[tokenTemplateType].type;
                tokenRegex = Twig.logic.handler[tokenTemplateType].regex;

                // Handle multiple regular expressions per type.
                regexArray = tokenRegex;
                if (!Array.isArray(tokenRegex)) {
                    regexArray = [tokenRegex];
                }

                regexLen = regexArray.length;
                // Check regular expressions in the order they were specified in the definition.
                for (regexI = 0; regexI < regexLen; regexI++) {
                    match = regexArray[regexI].exec(expression);
                    if (match !== null) {
                        Twig.log.trace('Twig.logic.tokenize: ', 'Matched a ', tokenType, ' regular expression of ', match);
                        return {
                            type: tokenType,
                            match
                        };
                    }
                }
            }
        }

        // No regex matches
        throw new Twig.Error('Unable to parse \'' + expression.trim() + '\'');
    };

    /**
     * Parse a logic token within a given context.
     *
     * What are logic chains?
     *      Logic chains represent a series of tokens that are connected,
     *          for example:
     *          {% if ... %} {% else %} {% endif %}
     *
     *      The chain parameter is used to signify if a chain is open of closed.
     *      open:
     *          More tokens in this chain should be parsed.
     *      closed:
     *          This token chain has completed parsing and any additional
     *          tokens (else, elseif, etc...) should be ignored.
     *
     * @param {Object} token The compiled token.
     * @param {Object} context The render context.
     * @param {boolean} chain Is this an open logic chain. If false, that means a
     *                        chain is closed and no further cases should be parsed.
     */
    Twig.logic.parse = function (token, context, chain, allowAsync) {
        return Twig.async.potentiallyAsync(this, allowAsync, function () {
            Twig.log.debug('Twig.logic.parse: ', 'Parsing logic token ', token);

            const tokenTemplate = Twig.logic.handler[token.type];
            let result;
            const state = this;

            if (!tokenTemplate.parse) {
                return '';
            }

            state.nestingStack.unshift(token);
            result = tokenTemplate.parse.call(state, token, context || {}, chain);

            if (Twig.isPromise(result)) {
                result = result.then(result => {
                    state.nestingStack.shift();

                    return result;
                });
            } else {
                state.nestingStack.shift();
            }

            return result;
        });
    };

    return Twig;
};
