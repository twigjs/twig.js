Twig.extend(function(TwigInternal) {
    "use strict";

    // Ensure customContext is globally available. 
    // loopIdStack should be initialized as [] by the user/framework.
    // loopCounter will be initialized or incremented safely within the parse method.
    if (typeof Twig.customContext === 'undefined') {
        // This is a fallback; ideally, Twig.customContext is set up before any rendering.
        Twig.customContext = { 
            loopIdStack: [], 
            loopCounter: 0 
        };
    } else {
        Twig.customContext.loopIdStack = Twig.customContext.loopIdStack || [];
        Twig.customContext.loopCounter = Twig.customContext.loopCounter || 0;
    }

    const originalForParse = TwigInternal.logic.type.for.parse;

    TwigInternal.logic.type.for.parse = function(token, context, chain) {
        // Increment loopCounter for a unique hash for this loop instance
        Twig.customContext.loopCounter++;
        const loopHash = "loop" + Twig.customContext.loopCounter;
        
        Twig.customContext.loopIdStack.push({ hash: loopHash });

        try {
            context = context || {}; // Ensure context is an object

            let output = "";
            const for_expression_compl = TwigInternal.expression.compile.call(this, token.expression);
            const loop_vars = token.value_var; // loop_vars is the 'value' variable name
            const key_var = token.key_var;     // key_var is the optional 'key' variable name

            let seq = TwigInternal.expression.parse.call(this, for_expression_compl.expression, context);

            // Convert objects to an array of {key, value} pairs for consistent iteration
            if (seq instanceof Object && !(seq instanceof Array) && !(seq instanceof TwigInternal.logic.type.Traversable) ) {
                let new_seq = [];
                for (let key in seq) {
                    if (seq.hasOwnProperty(key)) {
                        new_seq.push({
                            _key: key, // Use _key to avoid conflict if value_var is 'key'
                            _value: seq[key]
                        });
                    }
                }
                seq = new_seq;
            }
            
            const isEmptySequence = seq === undefined || seq === null || 
                                  (Array.isArray(seq) && seq.length === 0) ||
                                  (seq instanceof TwigInternal.logic.type.Traversable && seq.length === 0) ||
                                  (typeof seq === 'object' && !(seq instanceof TwigInternal.logic.type.Traversable) && Object.keys(seq).length === 0);


            if (isEmptySequence) {
                if (token.else_output !== undefined && token.else_output !== null) {
                    // The 'else_output' usually contains tokens that need to be parsed.
                    output = this.parser.parse(token.else_output, context);
                }
                 return {
                    chain: chain,
                    output: output
                };
            }

            let parent_loop_context = context.loop;
            const len = seq.length; // Works for arrays and Traversable

            for (let i = 0; i < len; i++) {
                let item = seq[i];
                
                let loop_context_obj = {
                    index: i + 1,
                    index0: i,
                    revindex: len - i,
                    revindex0: len - i - 1,
                    first: (i === 0),
                    last: (i === len - 1),
                    length: len,
                    parent: parent_loop_context
                };
                context.loop = loop_context_obj;

                // Assign loop variables to context
                if (key_var) {
                    context[key_var] = (item && typeof item._key !== 'undefined') ? item._key : i;
                    context[loop_vars] = (item && typeof item._value !== 'undefined') ? item._value : item;
                } else {
                    context[loop_vars] = (item && typeof item._value !== 'undefined') ? item._value : item;
                }

                // Optional 'if' condition on the for loop itself
                if (token.if_expression !== undefined) {
                    const if_expression_compl = TwigInternal.expression.compile.call(this, token.if_expression);
                    const if_result = TwigInternal.expression.parse.call(this, if_expression_compl.expression, context);
                    if (!TwigInternal.expression.isTrue(if_result)) {
                        continue; // Skip this iteration
                    }
                }

                // --- Custom Content Modification ---
                const currentLoopIndex = context.loop.index0; // 0-based index
                
                // Deep copy tokens for this iteration. token.output is the array of tokens for the loop body.
                let iterationScopedTokens = JSON.parse(JSON.stringify(token.output)); 

                iterationScopedTokens.forEach(iterToken => {
                    if (iterToken.type === Twig.token.type.raw && typeof iterToken.value === 'string') {
                        const idRegex = /@id="([^"]+)"/g;
                        iterToken.value = iterToken.value.replace(idRegex, (_match, idValue) => {
                            return `@id_processed="${idValue}_${loopHash}_${currentLoopIndex}"`;
                        });
                    }
                });
                
                // Parse the modified tokens for this iteration's content
                output += this.parser.parse(iterationScopedTokens, context);
            }

            // Restore parent loop context
            if (parent_loop_context !== undefined) {
                context.loop = parent_loop_context;
            } else {
                delete context.loop;
            }

            return {
                chain: chain,
                output: output
            };

        } finally {
            Twig.customContext.loopIdStack.pop();
            // Optional: Reset loopCounter if stack is empty and if that's desired behavior for subsequent independent renders.
            // if (Twig.customContext.loopIdStack.length === 0) {
            //     Twig.customContext.loopCounter = 0; 
            // }
        }
    };
});
