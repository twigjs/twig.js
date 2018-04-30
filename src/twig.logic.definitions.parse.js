// ## twig.logic.defintions.parse.js
//
// This file handles parsing logic tokens. {% ... %}
module.exports = function (Twig) {
    "use strict";

    // Definitions for parsing logic tokens.
    //
    // Properties:
    //
    //      type:  The type of expression this matches
    //
    //  Functions:
    //
    //      parse:   A function that parses the compiled token into output (HTML / whatever the
    //               template represents).
    var definitions = [
        {
            /**
             * If type logic tokens.
             *
             *  Format: {% if expression %}
             */
            type: Twig.logic.type.if_,
            parse: function (token, context, chain) {
                var that = this;

                return Twig.expression.parseAsync.call(this, token.stack, context)
                .then(function(result) {
                    chain = true;

                    if (Twig.lib.boolval(result)) {
                        chain = false;

                        return Twig.parseAsync.call(that, token.output, context);
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
            parse: function (token, context, chain) {
                var that = this;

                return Twig.expression.parseAsync.call(this, token.stack, context)
                .then(function(result) {
                    if (chain && Twig.lib.boolval(result)) {
                        chain = false;

                        return Twig.parseAsync.call(that, token.output, context);
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
            parse: function (token, context, chain) {
                var promise = Twig.Promise.resolve('');

                if (chain) {
                    promise = Twig.parseAsync.call(this, token.output, context);
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
             * For type logic tokens.
             *
             *  Format: {% for expression %}
             */
            type: Twig.logic.type.for_,
            parse: function (token, context, continue_chain) {
                // Parse expression
                var output = [],
                    len,
                    index = 0,
                    keyset,
                    that = this,
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
                        var inner_context = Twig.ChildContext(context);

                        inner_context[token.value_var] = value;

                        if (token.key_var) {
                            inner_context[token.key_var] = key;
                        }

                        // Loop object
                        inner_context.loop = buildLoop(index, len);

                        var promise = conditional === undefined ?
                            Twig.Promise.resolve(true) :
                            Twig.expression.parseAsync.call(that, conditional, inner_context);

                        return promise.then(function(condition) {
                            if (!condition)
                                return;

                            return Twig.parseAsync.call(that, token.output, inner_context)
                            .then(function(o) {
                                output.push(o);
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


                return Twig.expression.parseAsync.call(this, token.expression, context)
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
                        output: Twig.output.call(that, output)
                    };
                });
            }
        },
        {
            /**
             * Set type logic tokens.
             *
             *  Format: {% set key = expression %}
             */
            type: Twig.logic.type.set,
            parse: function (token, context, continue_chain) {
                var key = token.key;

                return Twig.expression.parseAsync.call(this, token.expression, context)
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
            parse: function (token, context, continue_chain) {
                var that = this,
                    key = token.key;

                return Twig.parseAsync.call(this, token.output, context)
                .then(function(value) {
                    // set on both the global and local context
                    that.context[key] = value;
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
            parse: function (token, context, chain) {
                var that = this;

                return Twig.parseAsync.call(this, token.output, context)
                .then(function(unfiltered) {
                    var stack = [{
                        type: Twig.expression.type.string,
                        value: unfiltered
                    }].concat(token.stack);

                    return Twig.expression.parseAsync.call(that, stack, context);
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
             * Block logic tokens.
             *
             *  Format: {% block title %}
             */
            type: Twig.logic.type.block,
            parse: function (token, context, chain) {
                var that = this,
                    block_output,
                    output,
                    promise = Twig.Promise.resolve(),
                    isImported = Twig.indexOf(this.importedBlocks, token.block) > -1,
                    hasParent = this.blocks[token.block] && Twig.indexOf(this.blocks[token.block], Twig.placeholders.parent) > -1;

                // detect if in a for loop
                Twig.forEach(this.parseStack, function (parent_token) {
                    if (parent_token.type == Twig.logic.type.for_) {
                        token.overwrite = true;
                    }
                });

                // Don't override previous blocks unless they're imported with "use"
                if (this.blocks[token.block] === undefined || isImported || hasParent || token.overwrite) {
                    if (token.expression) {
                        promise = Twig.expression.parseAsync.call(this, token.output, context)
                        .then(function(value) {
                            return Twig.expression.parseAsync.call(that, {
                                type: Twig.expression.type.string,
                                value: value
                            }, context);
                        });
                    } else {
                        promise = Twig.parseAsync.call(this, token.output, context)
                        .then(function(value) {
                            return Twig.expression.parseAsync.call(that, {
                                type: Twig.expression.type.string,
                                value: value
                            }, context);
                        });
                    }

                    promise = promise.then(function(block_output) {
                        if (isImported) {
                            // once the block is overridden, remove it from the list of imported blocks
                            that.importedBlocks.splice(that.importedBlocks.indexOf(token.block), 1);
                        }

                        if (hasParent) {
                            that.blocks[token.block] = Twig.Markup(that.blocks[token.block].replace(Twig.placeholders.parent, block_output));
                        } else {
                            that.blocks[token.block] = block_output;
                        }

                        that.originalBlockTokens[token.block] = {
                            type: token.type,
                            block: token.block,
                            output: token.output,
                            overwrite: true
                        };
                    });
                }

                return promise.then(function() {
                    // Check if a child block has been set from a template extending this one.
                    if (that.child.blocks[token.block]) {
                        output = that.child.blocks[token.block];
                    } else {
                        output = that.blocks[token.block];
                    }

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
            parse: function (token, context, chain) {
                var args = new Array(arguments.length), args_i = arguments.length;
                while(args_i-- > 0) args[args_i] = arguments[args_i];
                return Twig.logic.handler[Twig.logic.type.block].parse.apply(this, args);
            }
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% extends "template.twig" %}
             */
            type: Twig.logic.type.extends_,
            parse: function (token, context, chain) {
                var template,
                    that = this,
                    innerContext = Twig.ChildContext(context);

                // Resolve filename
                return Twig.expression.parseAsync.call(this, token.stack, context)
                .then(function(file) {
                    // Set parent template
                    that.extend = file;

                    if (file instanceof Twig.Template) {
                        template = file;
                    } else {
                        // Import file
                        template = that.importFile(file);
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
            parse: function (token, context, chain) {
                var that = this;

                // Resolve filename
                return Twig.expression.parseAsync.call(this, token.stack, context)
                .then(function(file) {
                    // Import blocks
                    that.importBlocks(file);

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
            parse: function logicTypeInclude(token, context, chain) {
                // Resolve filename
                var innerContext = token.only ? {} : Twig.ChildContext(context),
                    ignoreMissing = token.ignoreMissing,
                    that = this,
                    promise = null,
                    result = { chain: chain, output: '' };

                if (typeof token.withStack !== 'undefined') {
                    promise = Twig.expression.parseAsync.call(this, token.withStack, context)
                    .then(function(withContext) {
                        Twig.lib.extend(innerContext, withContext);
                    });
                } else {
                    promise = Twig.Promise.resolve();
                }

                return promise
                .then(function() {
                    return Twig.expression.parseAsync.call(that, token.stack, context);
                })
                .then(function logicTypeIncludeImport(file) {
                    if (file instanceof Twig.Template) {
                        return file.renderAsync(innerContext);
                    }

                    try {
                        return that.importFile(file).renderAsync(innerContext);
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
            // Parse the html and return it without any spaces between tags
            parse: function (token, context, chain) {
                // Parse the output without any filter
                return Twig.parseAsync.call(this, token.output, context)
                .then(function(unfiltered) {
                    var // A regular expression to find closing and opening tags with spaces between them
                        rBetweenTagSpaces = />\s+</g,
                        // Replace all space between closing and opening html tags
                        output = unfiltered.replace(rBetweenTagSpaces,'><').trim();
                        // Rewrap output as a Twig.Markup
                        output = Twig.Markup(output);
                    return {
                        chain: chain,
                        output: output
                    };
                });
            }
        },
        {
            /**
             * Macro logic tokens.
             *
             * Format: {% maro input(name, value, type, size) %}
             *
             */
            type: Twig.logic.type.macro,
            parse: function (token, context, chain) {
                var template = this;
                this.macros[token.macroName] = function() {
                    // Pass global context and other macros
                    var macroContext = {
                        _self: template.macros
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
                        return Twig.parseAsync.call(template, token.output, macroContext);
                    });
                };

                return {
                    chain: chain,
                    output: ''
                };

            }
        },
        {
            /*
            * import logic tokens.
            *
            * Format: {% import "template.twig" as form %}
            */
            type: Twig.logic.type.import_,
            parse: function (token, context, chain) {
                var that = this,
                    output = { chain: chain, output: '' };

                if (token.expression === '_self') {
                    context[token.contextName] = this.macros;
                    return Twig.Promise.resolve(output);
                }

                return Twig.expression.parseAsync.call(this, token.stack, context)
                .then(function(file) {
                    return that.importFile(file || token.expression);
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
            parse: function (token, context, chain) {
                var that = this,
                    promise = Twig.Promise.resolve(this.macros);

                if (token.expression !== "_self") {
                    promise = Twig.expression.parseAsync.call(this, token.stack, context)
                    .then(function(file) {
                        return that.importFile(file || token.expression);
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
            parse: function (token, context, chain) {
                // Resolve filename
                var innerContext = {},
                    that = this,
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
                    promise = Twig.expression.parseAsync.call(this, token.withStack, context)
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
                    return Twig.expression.parseAsync.call(that, token.stack, innerContext);
                })
                .then(function(file) {
                    if (file instanceof Twig.Template) {
                        template = file;
                    } else {
                        // Import file
                        try {
                            template = that.importFile(file);
                        } catch (err) {
                            if (token.ignoreMissing) {
                                return '';
                            }

                            // Errors preserve references to variables in scope,
                            // this removes `this` from the scope.
                            that = null;

                            throw err;
                        }
                    }

                    // reset previous blocks
                    that.blocks = {};

                    // parse tokens. output will be not used
                    return Twig.parseAsync.call(that, token.output, innerContext)
                    .then(function() {
                        // render tempalte with blocks defined in embed block
                        return template.renderAsync(innerContext, {'blocks':that.blocks});
                    });
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
             * Block logic tokens.
             *
             *  Format: {% with {some: 'values'} [only] %}
             */
            type: Twig.logic.type['with'],
            parse: function (token, context, chain) {
                // Resolve filename
                var innerContext = {},
                    i,
                    that = this,
                    promise = Twig.Promise.resolve();

                if (!token.only) {
                    innerContext = Twig.ChildContext(context);
                }

                if (token.withStack !== undefined) {
                    promise = Twig.expression.parseAsync.call(this, token.withStack, context)
                    .then(function(withContext) {
                        for (i in withContext) {
                            if (withContext.hasOwnProperty(i))
                                innerContext[i] = withContext[i];
                        }
                    });
                }

                return promise
                .then(function() {
                    return Twig.parseAsync.call(that, token.output, innerContext);
                })
                .then(function(output) {
                    return {
                        chain: chain,
                        output: output
                    };
                });
            }
        }

    ];

    definitions.forEach(function (definition) {
        Twig.logic.extend(definition);
    });

    return Twig;

};
