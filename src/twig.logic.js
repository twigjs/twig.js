// ## twig.logic.js
//
// This file handles tokenizing, compiling and parsing logic tokens. {% ... %}
module.exports = function (Twig) {
    "use strict";

    /**
     * Namespace for logic handling.
     */
    Twig.logic = {};

    /**
     * Logic token types.
     */
    Twig.logic.type = {
        if_:       'Twig.logic.type.if',
        endif:     'Twig.logic.type.endif',
        for_:      'Twig.logic.type.for',
        endfor:    'Twig.logic.type.endfor',
        else_:     'Twig.logic.type.else',
        elseif:    'Twig.logic.type.elseif',
        set:       'Twig.logic.type.set',
        setcapture:'Twig.logic.type.setcapture',
        endset:    'Twig.logic.type.endset',
        filter:    'Twig.logic.type.filter',
        endfilter: 'Twig.logic.type.endfilter',
        shortblock: 'Twig.logic.type.shortblock',
        block:     'Twig.logic.type.block',
        endblock:  'Twig.logic.type.endblock',
        extends_:  'Twig.logic.type.extends',
        use:       'Twig.logic.type.use',
        include:   'Twig.logic.type.include',
        spaceless: 'Twig.logic.type.spaceless',
        endspaceless: 'Twig.logic.type.endspaceless',
        macro:     'Twig.logic.type.macro',
        endmacro:  'Twig.logic.type.endmacro',
        import_:   'Twig.logic.type.import',
        from:      'Twig.logic.type.from',
        embed:     'Twig.logic.type.embed',
        endembed:  'Twig.logic.type.endembed',
        'with':     'Twig.logic.type.with',
        endwith:  'Twig.logic.type.endwith'
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
            regex: /^if\s+([\s\S]+)$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.elseif,
                Twig.logic.type.endif
            ],
            open: true,
            compile: function (token) {
                var expression = token.match[1];
                // Compile the expression.
                token.stack = Twig.expression.compile.call(this, {
                    type:  Twig.expression.type.expression,
                    value: expression
                }).stack;
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var state = this;

                return Twig.expression.parseAsync.call(state, token.stack, context)
                .then(function(result) {
                    chain = true;

                    if (Twig.lib.boolval(result)) {
                        chain = false;

                        return Twig.parseAsync.call(state, token.output, context)
                            .then(function (result) {
                                return result.output;
                            });
                    }

                    return '';
                })
                .then(function(output) {
                    return {
                        chain: chain,
                        output: output
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
            regex: /^elseif\s+([^\s].*)$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.elseif,
                Twig.logic.type.endif
            ],
            open: false,
            compile: function (token) {
                var expression = token.match[1];
                // Compile the expression.
                token.stack = Twig.expression.compile.call(this, {
                    type:  Twig.expression.type.expression,
                    value: expression
                }).stack;
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var state = this;

                return Twig.expression.parseAsync.call(state, token.stack, context)
                .then(function(result) {
                    if (chain && Twig.lib.boolval(result)) {
                        chain = false;

                        return Twig.parseAsync.call(state, token.output, context)
                            .then(function (result) {
                                return result.output;
                            });
                    }

                    return '';
                })
                .then(function(output) {
                    return {
                        chain: chain,
                        output: output
                    }
                });
            }
        },
        {
            /**
             * Else if type logic tokens.
             *
             *  Format: {% elseif expression %}
             */
            type: Twig.logic.type.else_,
            regex: /^else$/,
            next: [
                Twig.logic.type.endif,
                Twig.logic.type.endfor
            ],
            open: false,
            parse: function (token, context, chain) {
                var promise = Twig.Promise.resolve(''),
                    state = this;

                if (chain) {
                    promise = Twig.parseAsync.call(state, token.output, context).then(function (result) {
                        return result.output;
                    });
                }

                return promise.then(function(output) {
                    return {
                        chain: chain,
                        output: output
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
            next: [ ],
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
            compile: function (token) {
                var key_value = token.match[1],
                    expression = token.match[2],
                    conditional = token.match[3],
                    kv_split = null;

                token.key_var = null;
                token.value_var = null;

                if (key_value.indexOf(",") >= 0) {
                    kv_split = key_value.split(',');
                    if (kv_split.length === 2) {
                        token.key_var = kv_split[0].trim();
                        token.value_var = kv_split[1].trim();
                    } else {
                        throw new Twig.Error("Invalid expression in for loop: " + key_value);
                    }
                } else {
                    token.value_var = key_value;
                }

                // Valid expressions for a for loop
                //   for item     in expression
                //   for key,item in expression

                // Compile the expression.
                token.expression = Twig.expression.compile.call(this, {
                    type:  Twig.expression.type.expression,
                    value: expression
                }).stack;

                // Compile the conditional (if available)
                if (conditional) {
                    token.conditional = Twig.expression.compile.call(this, {
                        type:  Twig.expression.type.expression,
                        value: conditional
                    }).stack;
                }

                delete token.match;
                return token;
            },
            parse: function (token, context, continue_chain) {
                // Parse expression
                var output = [],
                    len,
                    index = 0,
                    keyset,
                    state = this,
                    conditional = token.conditional,
                    buildLoop = function(index, len) {
                        var isConditional = conditional !== undefined;
                        return {
                            index: index+1,
                            index0: index,
                            revindex: isConditional?undefined:len-index,
                            revindex0: isConditional?undefined:len-index-1,
                            first: (index === 0),
                            last: isConditional?undefined:(index === len-1),
                            length: isConditional?undefined:len,
                            parent: context
                        };
                    },
                    // run once for each iteration of the loop
                    loop = function(key, value) {
                        var inner_context = Twig.lib.copy(context);

                        inner_context[token.value_var] = value;

                        if (token.key_var) {
                            inner_context[token.key_var] = key;
                        }

                        // Loop object
                        inner_context.loop = buildLoop(index, len);

                        var promise = conditional === undefined ?
                            Twig.Promise.resolve(true) :
                            Twig.expression.parseAsync.call(state, conditional, inner_context);

                        return promise.then(function(condition) {
                            if (!condition)
                                return;

                            return Twig.parseAsync.call(state, token.output, inner_context)
                            .then(function(result) {
                                output.push(result.output);
                                index += 1;
                            });
                        })
                        .then(function() {
                            // Delete loop-related variables from the context
                            delete inner_context['loop'];
                            delete inner_context[token.value_var];
                            delete inner_context[token.key_var];

                            // Merge in values that exist in context but have changed
                            // in inner_context.
                            Twig.merge(context, inner_context, true);
                        });
                    };


                return Twig.expression.parseAsync.call(state, token.expression, context)
                .then(function(result) {
                    if (Twig.lib.isArray(result)) {
                        len = result.length;
                        return Twig.async.forEach(result, function (value) {
                            var key = index;

                            return loop(key, value);
                        });
                    } else if (Twig.lib.is('Object', result)) {
                        if (result._keys !== undefined) {
                            keyset = result._keys;
                        } else {
                            keyset = Object.keys(result);
                        }
                        len = keyset.length;
                        return Twig.async.forEach(keyset, function(key) {
                            // Ignore the _keys property, it's internal to twig.js
                            if (key === "_keys") return;

                            return loop(key,  result[key]);
                        });
                    }
                })
                .then(function() {
                    // Only allow else statements if no output was generated
                    continue_chain = (output.length === 0);

                    return {
                        chain: continue_chain,
                        output: Twig.output.call(state.template, output)
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
            type: Twig.logic.type.endfor,
            regex: /^endfor$/,
            next: [ ],
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
            next: [ ],
            open: true,
            compile: function (token) { //
                var key = token.match[1].trim(),
                    expression = token.match[2],
                    // Compile the expression.
                    expression_stack  = Twig.expression.compile.call(this, {
                        type:  Twig.expression.type.expression,
                        value: expression
                    }).stack;

                token.key = key;
                token.expression = expression_stack;

                delete token.match;
                return token;
            },
            parse: function (token, context, continue_chain) {
                var key = token.key,
                    state = this;

                return Twig.expression.parseAsync.call(state, token.expression, context)
                .then(function(value) {
                    if (value === context) {
                        /*  If storing the context in a variable, it needs to be a clone of the current state of context.
                            Otherwise we have a context with infinite recursion.
                            Fixes #341
                        */
                        value = Twig.lib.copy(value);
                    }

                    context[key] = value;

                    return {
                        chain: continue_chain,
                        context: context
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
            compile: function (token) {
                var key = token.match[1].trim();

                token.key = key;

                delete token.match;
                return token;
            },
            parse: function (token, context, continue_chain) {
                var state = this,
                    key = token.key;

                return Twig.parseAsync.call(state, token.output, context)
                .then(function(result) {
                    // set on both the global and local context
                    state.context[key] = result.output;
                    context[key] = result.output;

                    return {
                        chain: continue_chain,
                        context: context
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
            next: [ ],
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
            compile: function (token) {
                var expression = "|" + token.match[1].trim();
                // Compile the expression.
                token.stack = Twig.expression.compile.call(this, {
                    type:  Twig.expression.type.expression,
                    value: expression
                }).stack;
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var state = this;

                return Twig.parseAsync.call(state, token.output, context)
                .then(function(result) {
                    var stack = [{
                        type: Twig.expression.type.string,
                        value: result.output
                    }].concat(token.stack);

                    return Twig.expression.parseAsync.call(state, stack, context);
                })
                .then(function(output) {
                    return {
                        chain: chain,
                        output: output
                    }
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
            next: [ ],
            open: false
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% block title %}
             */
            type: Twig.logic.type.block,
            regex: /^block\s+([a-zA-Z0-9_]+)$/,
            next: [
                Twig.logic.type.endblock
            ],
            open: true,
            compile: function (token) {
                token.block = token.match[1].trim();
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var state = this,
                    block_output,
                    output,
                    promise = Twig.Promise.resolve(),
                    isImported = Twig.indexOf(state.importedBlocks, token.block) > -1,
                    hasParent = state.blocks[token.block] && Twig.indexOf(state.blocks[token.block], Twig.placeholders.parent) > -1;

                // detect if in a for loop
                Twig.forEach(state.nestingStack, function (parent_token) {
                    if (parent_token.type == Twig.logic.type.for_) {
                        token.overwrite = true;
                    }
                });

                // Don't override previous blocks unless they're imported with "use"
                if (state.blocks[token.block] === undefined || isImported || hasParent || token.overwrite) {
                    if (token.expression) {
                        promise = Twig.expression.parseAsync.call(state, token.output, context)
                        .then(function(value) {
                            return Twig.expression.parseAsync.call(state, {
                                type: Twig.expression.type.string,
                                value: value
                            }, context);
                        });
                    } else {
                        promise = Twig.parseAsync.call(state, token.output, context)
                        .then(function(result) {
                            return Twig.expression.parseAsync.call(state, {
                                type: Twig.expression.type.string,
                                value: result.output
                            }, context);
                        });
                    }

                    promise = promise.then(function(block_output) {
                        if (isImported) {
                            // once the block is overridden, remove it from the list of imported blocks
                            state.importedBlocks.splice(state.importedBlocks.indexOf(token.block), 1);
                        }

                        if (hasParent) {
                            state.blocks[token.block] = Twig.Markup(state.blocks[token.block].replace(Twig.placeholders.parent, block_output));
                        } else {
                            state.blocks[token.block] = block_output;
                        }

                        state.originalBlockTokens[token.block] = {
                            type: token.type,
                            block: token.block,
                            output: token.output,
                            overwrite: true
                        };
                    });
                }

                return promise.then(function() {
                    output = state.blocks[token.block];

                    return {
                        chain: chain,
                        output: output
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
            regex: /^block\s+([a-zA-Z0-9_]+)\s+(.+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                token.expression = token.match[2].trim();

                token.output = Twig.expression.compile({
                    type: Twig.expression.type.expression,
                    value: token.expression
                }).stack;

                token.block = token.match[1].trim();
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var args = new Array(arguments.length),
                    args_i = arguments.length,
                    state = this;
                while(args_i-- > 0) args[args_i] = arguments[args_i];
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
            regex: /^endblock(?:\s+([a-zA-Z0-9_]+))?$/,
            next: [ ],
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
            next: [ ],
            open: true,
            compile: function (token) {
                var expression = token.match[1].trim();
                delete token.match;

                token.stack   = Twig.expression.compile.call(this, {
                    type:  Twig.expression.type.expression,
                    value: expression
                }).stack;

                return token;
            },
            parse: function (token, context, chain) {
                var template,
                    state = this,
                    innerContext = Twig.lib.copy(context);

                // Resolve filename
                return Twig.expression.parseAsync.call(state, token.stack, context)
                .then(function(file) {
                    // Set parent template
                    state.extend = file;

                    if (file instanceof Twig.Template) {
                        template = file;
                    } else {
                        // Import file
                        template = state.template.importFile(file);
                    }

                    // Render the template in case it puts anything in its context
                    return template.renderAsync(innerContext);
                })
                .then(function() {
                    // Extend the parent context with the extended context
                    Twig.lib.extend(context, innerContext);

                    return {
                        chain: chain,
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
            next: [ ],
            open: true,
            compile: function (token) {
                var expression = token.match[1].trim();
                delete token.match;

                token.stack = Twig.expression.compile.call(this, {
                    type:  Twig.expression.type.expression,
                    value: expression
                }).stack;

                return token;
            },
            parse: function (token, context, chain) {
                var state = this;

                // Resolve filename
                return Twig.expression.parseAsync.call(state, token.stack, context)
                .then(function(file) {
                    // Import blocks
                    state.importBlocks(file);

                    return {
                        chain: chain,
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
            next: [ ],
            open: true,
            compile: function (token) {
                var match = token.match,
                    expression = match[1].trim(),
                    ignoreMissing = match[2] !== undefined,
                    withContext = match[3],
                    only = ((match[4] !== undefined) && match[4].length);

                delete token.match;

                token.only = only;
                token.ignoreMissing = ignoreMissing;

                token.stack = Twig.expression.compile.call(this, {
                    type:  Twig.expression.type.expression,
                    value: expression
                }).stack;

                if (withContext !== undefined) {
                    token.withStack = Twig.expression.compile.call(this, {
                        type:  Twig.expression.type.expression,
                        value: withContext.trim()
                    }).stack;
                }

                return token;
            },
            parse: function logicTypeInclude(token, context, chain) {
                // Resolve filename
                var innerContext = token.only ? {} : Twig.lib.copy(context),
                    ignoreMissing = token.ignoreMissing,
                    state = this,
                    promise = null,
                    result = { chain: chain, output: '' };

                if (typeof token.withStack !== 'undefined') {
                    promise = Twig.expression.parseAsync.call(state, token.withStack, context)
                    .then(function(withContext) {
                        Twig.lib.extend(innerContext, withContext);
                    });
                } else {
                    promise = Twig.Promise.resolve();
                }

                return promise
                .then(function() {
                    return Twig.expression.parseAsync.call(state, token.stack, context);
                })
                .then(function logicTypeIncludeImport(file) {
                    if (file instanceof Twig.Template) {
                        return file.renderAsync(innerContext);
                    }

                    try {
                        return state.template.importFile(file).renderAsync(innerContext);
                    } catch(err) {
                        if (ignoreMissing)
                            return '';

                        throw err;
                    }
                })
                .then(function slowLogicReturn(output) {
                    if (output !== '')
                        result.output = output;

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
            parse: function (token, context, chain) {
                var state = this;

                // Parse the output without any filter
                return Twig.parseAsync.call(state, token.output, context)
                .then(function(result) {
                    var // A regular expression to find closing and opening tags with spaces between them
                        rBetweenTagSpaces = />\s+</g,
                        // Replace all space between closing and opening html tags
                        output = result.output.replace(rBetweenTagSpaces,'><').trim();
                        // Rewrap output as a Twig.Markup
                        output = Twig.Markup(output);
                    return {
                        chain: chain,
                        output: output
                    };
                });
            }
        },

        // Add the {% endspaceless %} token
        {
            type: Twig.logic.type.endspaceless,
            regex: /^endspaceless$/,
            next: [ ],
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
            regex: /^macro\s+([a-zA-Z0-9_]+)\s*\(\s*((?:[a-zA-Z0-9_]+(?:\s*=\s*([\s\S]+))?(?:,\s*)?)*)\s*\)$/,
            next: [
                Twig.logic.type.endmacro
            ],
            open: true,
            compile: function (token) {
                var macroName = token.match[1],
                    rawParameters = token.match[2].split(/\s*,\s*/),
                    parameters = rawParameters.map(function (rawParameter) {
                        return rawParameter.split(/\s*=\s*/)[0];
                    }),
                    parametersCount = parameters.length;

                // Duplicate check
               if (parametersCount > 1) {
                    var uniq = {};
                    for (var i = 0; i < parametersCount; i++) {
                        var parameter = parameters[i];
                        if (!uniq[parameter]) {
                            uniq[parameter] = 1;
                        } else {
                            throw new Twig.Error("Duplicate arguments for parameter: " + parameter);
                        }
                    }
                }

                token.macroName = macroName;
                token.parameters = parameters;
                token.defaults = rawParameters.reduce(function (defaults, rawParameter) {
                    var pair = rawParameter.split(/\s*=\s*/);
                    var key = pair[0];
                    var expression = pair[1];

                    if(expression) {
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
            parse: function (token, context, chain) {
                var state = this;

                state.macros[token.macroName] = function() {
                    // Pass global context and other macros
                    var macroContext = {
                        _self: state.macros
                    };
                    // Save arguments
                    var args = Array.prototype.slice.call(arguments);

                    return Twig.async.forEach(token.parameters, function (prop, i) {
                        // Add parameters from context to macroContext
                        if (typeof args[i] !== 'undefined') {
                            macroContext[prop] = args[i];
                            return true;
                        } else if (typeof token.defaults[prop] !== 'undefined') {
                            return Twig.expression.parseAsync.call(this, token.defaults[prop], context)
                                .then(function(value) {
                                    macroContext[prop] = value;
                                    return Twig.Promise.resolve();
                                });
                        } else {
                            macroContext[prop] = undefined;
                            return true;
                        }
                    }).then(function () {
                        // Render
                        return Twig.parseAsync.call(state, token.output, macroContext)
                            .then(function (result) {
                                return result.output;
                            });;
                    });
                };

                return {
                    chain: chain,
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
             next: [ ],
             open: false
        },
        {
            /*
            * import logic tokens.
            *
            * Format: {% import "template.twig" as form %}
            */
            type: Twig.logic.type.import_,
            regex: /^import\s+(.+)\s+as\s+([a-zA-Z0-9_]+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var expression = token.match[1].trim(),
                    contextName = token.match[2].trim();
                delete token.match;

                token.expression = expression;
                token.contextName = contextName;

                token.stack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: expression
                }).stack;

                return token;
            },
            parse: function (token, context, chain) {
                var state = this,
                    output = { chain: chain, output: '' };

                if (token.expression === '_self') {
                    context[token.contextName] = state.macros;
                    return Twig.Promise.resolve(output);
                }

                return Twig.expression.parseAsync.call(state, token.stack, context)
                .then(function(file) {
                    return state.template.importFile(file || token.expression);
                })
                .then(function(template) {
                    context[token.contextName] = template.renderAsync({}, {output: 'macros'});

                    return output;
                });
            }
        },
        {
            /*
            * from logic tokens.
            *
            * Format: {% from "template.twig" import func as form %}
            */
            type: Twig.logic.type.from,
            regex: /^from\s+(.+)\s+import\s+([a-zA-Z0-9_, ]+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var expression = token.match[1].trim(),
                    macroExpressions = token.match[2].trim().split(/\s*,\s*/),
                    macroNames = {};

                for (var i=0; i<macroExpressions.length; i++) {
                    var res = macroExpressions[i];

                    // match function as variable
                    var macroMatch = res.match(/^([a-zA-Z0-9_]+)\s+as\s+([a-zA-Z0-9_]+)$/);
                    if (macroMatch) {
                        macroNames[macroMatch[1].trim()] = macroMatch[2].trim();
                    }
                    else if (res.match(/^([a-zA-Z0-9_]+)$/)) {
                        macroNames[res] = res;
                    }
                    else {
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
            parse: function (token, context, chain) {
                var state = this,
                    promise = Twig.Promise.resolve(state.macros);

                if (token.expression !== "_self") {
                    promise = Twig.expression.parseAsync.call(state, token.stack, context)
                    .then(function(file) {
                        return state.template.importFile(file || token.expression);
                    })
                    .then(function(template) {
                        return template.renderAsync({}, {output: 'macros'});
                    });
                }

                return promise
                .then(function(macros) {
                    for (var macroName in token.macroNames) {
                        if (macros.hasOwnProperty(macroName)) {
                            context[token.macroNames[macroName]] = macros[macroName];
                        }
                    }

                    return {
                        chain: chain,
                        output: ''
                    }
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
            compile: function (token) {
                var match = token.match,
                    expression = match[1].trim(),
                    ignoreMissing = match[2] !== undefined,
                    withContext = match[3],
                    only = ((match[4] !== undefined) && match[4].length);

                delete token.match;

                token.only = only;
                token.ignoreMissing = ignoreMissing;

                token.stack = Twig.expression.compile.call(this, {
                    type:  Twig.expression.type.expression,
                    value: expression
                }).stack;

                if (withContext !== undefined) {
                    token.withStack = Twig.expression.compile.call(this, {
                        type:  Twig.expression.type.expression,
                        value: withContext.trim()
                    }).stack;
                }

                return token;
            },
            parse: function (token, context, chain) {
                // Resolve filename
                var innerContext = {},
                    state = this,
                    i,
                    template,
                    promise = Twig.Promise.resolve();

                if (!token.only) {
                    for (i in context) {
                        if (context.hasOwnProperty(i))
                            innerContext[i] = context[i];
                    }
                }

                if (token.withStack !== undefined) {
                    promise = Twig.expression.parseAsync.call(state, token.withStack, context)
                    .then(function(withContext) {
                        for (i in withContext) {
                            if (withContext.hasOwnProperty(i))
                                innerContext[i] = withContext[i];
                        }
                    });
                }

                return promise.then(function() {
                    // Allow this function to be cleaned up early
                    promise = null;
                    return Twig.expression.parseAsync.call(state, token.stack, innerContext);
                })
                .then(function(file) {
                    if (file instanceof Twig.Template) {
                        template = file;
                    } else {
                        // Import file
                        try {
                            template = state.template.importFile(file);
                        } catch (err) {
                            if (token.ignoreMissing) {
                                return '';
                            }

                            // Errors preserve references to variables in scope,
                            // this removes `this` from the scope.
                            state = null;

                            throw err;
                        }
                    }

                    // store previous blocks
                    that._blocks = Twig.lib.copy(that.blocks);
                    // reset previous blocks
                    state.blocks = {};

                    // parse tokens. output will be not used
                    return Twig.parseAsync.call(state, token.output, innerContext)
                    .then(function() {
                        // render tempalte with blocks defined in embed block
                        return template.renderAsync(innerContext, {'blocks': state.blocks});
                    });
                })
                .then(function(output) {
                    // restore previous blocks
                    that.blocks = Twig.lib.copy(that._blocks);
                    return {
                        chain: chain,
                        output: output
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
            next: [ ],
            open: false
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% with {some: 'values'} [only] %}
             */
            type: Twig.logic.type['with'],
            regex: /^(?:with\s+([\S\s]+?))(?:\s|$)(only)?$/,
            next: [
                Twig.logic.type.endwith
            ],
            open: true,
            compile: function (token) {
                var match = token.match,
                    withContext = match[1],
                    only = ((match[2] !== undefined) && match[2].length);

                delete token.match;

                token.only = only;

                if (withContext !== undefined) {
                    token.withStack = Twig.expression.compile.call(this, {
                        type:  Twig.expression.type.expression,
                        value: withContext.trim()
                    }).stack;
                }

                return token;
            },
            parse: function (token, context, chain) {
                // Resolve filename
                var innerContext = {},
                    i,
                    state = this,
                    promise = Twig.Promise.resolve();

                if (!token.only) {
                    innerContext = Twig.lib.copy(context);
                }

                if (token.withStack !== undefined) {
                    promise = Twig.expression.parseAsync.call(state, token.withStack, context)
                    .then(function(withContext) {
                        for (i in withContext) {
                            if (withContext.hasOwnProperty(i))
                                innerContext[i] = withContext[i];
                        }
                    });
                }

                return promise
                .then(function() {
                    return Twig.parseAsync.call(state, token.output, innerContext);
                })
                .then(function(result) {
                    return {
                        chain: chain,
                        output: result.output
                    };
                });
            }
        },
        {
            type: Twig.logic.type.endwith,
            regex: /^endwith$/,
            next: [ ],
            open: false
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
        value = value || ("Twig.logic.type" + type);
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

        if (!definition.type) {
            throw new Twig.Error("Unable to extend logic definition. No type provided for " + definition);
        } else {
            Twig.logic.extendType(definition.type);
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
     * @param {Object} raw_token An uncompiled logic token.
     *
     * @return {Object} A compiled logic token, ready for parsing.
     */
    Twig.logic.compile = function (raw_token) {
        var expression = raw_token.value.trim(),
            token = Twig.logic.tokenize.call(this, expression),
            token_template = Twig.logic.handler[token.type];

        // Check if the token needs compiling
        if (token_template.compile) {
            token = token_template.compile.call(this, token);
            Twig.log.trace("Twig.logic.compile: ", "Compiled logic token to ", token);
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
        var token_template_type = null,
            token_type = null,
            token_regex = null,
            regex_array = null,
            regex_len = null,
            regex_i = null,
            regex = null,
            match = null;

        // Ignore whitespace around expressions.
        expression = expression.trim();

        for (token_template_type in Twig.logic.handler) {
            // Get the type and regex for this template type
            token_type = Twig.logic.handler[token_template_type].type;
            token_regex = Twig.logic.handler[token_template_type].regex;

            // Handle multiple regular expressions per type.
            regex_array = token_regex;
            if (!Twig.lib.isArray(token_regex))
                regex_array = [token_regex];

            regex_len = regex_array.length;
            // Check regular expressions in the order they were specified in the definition.
            for (regex_i = 0; regex_i < regex_len; regex_i++) {
                match = regex_array[regex_i].exec(expression);
                if (match !== null) {
                    Twig.log.trace("Twig.logic.tokenize: ", "Matched a ", token_type, " regular expression of ", match);
                    return {
                        type: token_type,
                        match: match
                    };
                }
            }
        }

        // No regex matches
        throw new Twig.Error("Unable to parse '" + expression.trim() + "'");
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
    Twig.logic.parse = function (token, context, chain, allow_async) {
        return Twig.async.potentiallyAsync(this, allow_async, function() {
            Twig.log.debug("Twig.logic.parse: ", "Parsing logic token ", token);

            var token_template = Twig.logic.handler[token.type],
                result,
                state = this;


            if (!token_template.parse)
                return '';

            state.nestingStack.unshift(token);
            result = token_template.parse.call(state, token, context || {}, chain);

            if (Twig.isPromise(result)) {
                result = result.then(function (result) {
                    state.nestingStack.shift();

                    return result;
                })
            } else {
                state.nestingStack.shift();
            }

            return result;
        });
    };

    return Twig;

};
