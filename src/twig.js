var Twig = {};

var twig = (function(Twig) {
    // Language:
    /*
    OPEN   token_value   CLOSE
    {{ user }}

    Command Logic:
    {%  command  %}

    Comments:
    {# comment... #}
    */

    Twig.trace = false;

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
        raw: 'raw'
    };

    /**
     * Token syntax definitions.
     */
    Twig.token.definitions = {
        /**
         * Output type tokens.
         *  These typically take the form {{ expression }}.
         */
        output: {
            type: Twig.token.type.output,
            open: '{{',
            close: '}}'
        },
        /**
         * Logic type tokens.
         *  These typically take a form like {% if expression %} or {% endif %}
         */
        logic: {
            type: Twig.token.type.logic,
            open: '{%',
            close: '%}'
        },
        /**
         * Comment type tokens.
         *  These take the form {# anything #}
         */
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

    /**
     * Convert a template into high-level tokens.
     */
    Twig.tokenize = function(template) {
        var tokens = [],
            error_offset = 0;

        while (template.length > 0) {
            // Find the first occurance of any token type in the template
            var found_token = findToken(template);
            if (Twig.trace) console.log("Found token ", found_token);

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
                var end = findTokenEnd(template, found_token.def, error_offset);
                if (Twig.trace) console.log("Token ends at ", end);

                var token_str = template.substring(0, end).trim();
                tokens.push({
                    type: found_token.def.type,
                    value: token_str
                });

                template = template.substr(end + found_token.def.close.length);
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
    }

    function findToken(template) {
        var output = {
            position: null,
            def: null
        };
        for (tok_name in Twig.token.definitions) {
            var tok = Twig.token.definitions[tok_name];
            var key = tok.open;
            if (Twig.trace) console.log("Searching for ", key);
            var first_key = template.indexOf(key);
            if (Twig.trace) console.log("Found at ", first_key);
            // Does this token occur before any other types?
            if (first_key >= 0 && (output.position == null || first_key < output.position)) {
                output.position = first_key;
                output.def = tok;
            }
        }
        return output;
    }

    function findTokenEnd(template, token_def, start) {
        var end = null;
        var found = false;
        var offset = 0;
        while (!found) {
            if (Twig.trace) console.log("Looking for ", token_def.close);
            if (Twig.trace) console.log("Looking in ", template);
            var pos = template.indexOf(token_def.close, offset);
            if (Twig.trace) console.log("Found end at ", pos);
            if (pos >= 0) {
                end = pos;
                found = true;
            } else {
                // throw an exception
                throw "Unable to find closing bracket '" + token_def.close + "'" + " opened near template position " + start;
            }
            var str_pos = null;
            var str_found = null;
            for (var i=0,l=Twig.token.strings.length;i<l;i++) {
                var str = Twig.token.strings[i];
                var this_str_pos = template.indexOf(str, offset);
                if ( this_str_pos > 0
                    && this_str_pos < pos
                    && ( str_pos == null || this_str_pos < str_pos ) ) {

                    str_pos = this_str_pos;
                    str_found = str;
                }
            }
            // We found a string before the end of the token, now find the string's end and set the search offset to it
            if (str_pos != null) {
                end = null;
                found = false;
                var end_offset = str_pos+1;
                while (true) {
                    var end_str_pos = template.indexOf(str_found, end_offset);
                    if (end_str_pos == -1) {
                        throw "Unclosed string in template";
                    }
                    // Ignore escaped quotes
                    if (template.substr(end_str_pos-1, 1) != "\\") {
                        offset = end_str_pos + 1;
                        break;
                    } else {
                        end_offset = end_str_pos + 1;
                    }
                }
            }
        }
        return end;
    }

    Twig.compile = function(tokens) {
        var output = [];
        var stack = [];
        var intermediate_output = [];

        tokens.reverse();
        while (tokens.length > 0) {
            var token = tokens.pop();
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
                    var logic_token = Twig.logic.compile(token),
                        type = logic_token.type,
                        token_template = Twig.logic.handler[type],
                        open = token_template.open,
                        next = token_template.next;

                    if (Twig.trace) console.log("compiled logic token to ", logic_token, " next is: ", next, " open is : ", open);

                    // Not a standalone token, check logic stack to see if this is expected
                    if (open != undefined && !open) {
                        var prev_token = stack.pop(),
                            prev_template = Twig.logic.handler[prev_token.type];

                        if (prev_template.next.indexOf(type) < 0) {
                            throw type + " not expected after a " + prev_token.type;
                        }

                        if (!prev_token.output) prev_token.output = [];
                        prev_token.output = prev_token.output.concat(intermediate_output);
                        intermediate_output = [];

                        var tok_output = {
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
                    if (next != undefined && next.length > 0) {
                        if (Twig.trace) console.log("pushing ", logic_token, " to logic stack: ", stack);
                        if (stack.length > 0) {
                            // Put any currently held output into the output list of the logic operator
                            // currently at the head of the stack before we push a new one on.
                            var prev_token = stack.pop();
                            if (!prev_token.output) prev_token.output = [];
                            prev_token.output = prev_token.output.concat(intermediate_output);
                            stack.push(prev_token);
                        }

                        // Push the new logic token onto the logic stack
                        stack.push(logic_token);

                    } else if (open != undefined && open) {
                        var tok_output = {
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

                case Twig.token.type.comment:
                    // Do nothing, comments should be ignored
                    break;

                case Twig.token.type.output:
                    var expression_token = Twig.expression.compile(token);
                    if (stack.length > 0) {
                        intermediate_output.push(expression_token);
                    } else {
                        output.push(expression_token);
                    }
                    break;
            }

            if (Twig.trace) console.log("Output: ", output, " Logic Stack: ", stack, " Pending Output: ", intermediate_output );
        }
        if (stack.length > 0) {
            var unclosed_token = stack.pop();
            throw "Unable to find an end tag for " + unclosed_token.type
                + ", expecting one of " + unclosed_token.next.join(", ");
        }
        return output;
    };

    Twig.parse = function(tokens, context) {
        var output = [];
        // Track logic chains
        var chain = true;
        tokens.forEach(function(token) {
            switch (token.type) {
                case Twig.token.type.raw:
                    output.push(token.value);
                    break;

                case Twig.token.type.logic:
                    var logic_token = token.token,
                        logic = Twig.logic.parse(logic_token, context, chain);
                    chain = logic.chain;
                    output.push(logic.output);
                    break;

                case Twig.token.type.comment:
                    // Do nothing, comments should be ignored
                    break;

                case Twig.token.type.output:
                    // Parse the given expression in the given context
                    output.push(Twig.expression.parse(token.stack, context));
                    break;
            }
        });
        return output.join("");
    };

    Twig.logic = {};

    Twig.logic.type = {
        if_: 'if',
        endif: 'endif',
        for_: 'for',
        endfor: 'endfor',
        else_: 'else',
        elseif: 'elseif',
        set: 'set'
    }

    /**
     * Regular expressions to match templates to.
     *
     * FORMAT:
     *      type:  The type of expression this matches
     *
     *      regex: A regular expression that matches the format of the token
     *
     *      next:  What logic tokens (if any) pop this token off the logic stack. If empty, the
     *             logic token is assumed to not require an end tag and isn't push onto the stack.
     *
     *      open:  Does this tag open a logic expression or is it standalone. For example,
     *             {% endif %} cannot exist without an opening {% if ... %} tag, so open = false.
     */
    Twig.logic.definitions = [
        {
            /**
             * If type logic tokens.
             *
             *  Format: {% if expression %}
             */
            type: Twig.logic.type.if_,
            regex: /^if\s+([^\s].+)$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.elseif,
                Twig.logic.type.endif
            ],
            open: true,
            compile: function(token) {
                var expression = token.match[1];
                if (Twig.trace) console.log("Compiling IF token with expression", expression);
                // Compile the expression.
                token.stack = Twig.expression.compile({
                    type:  Twig.expression.type.expression,
                    value: expression
                }).stack;
                delete token.match;
                return token;
            },
            parse: function(token, context, chain) {
                var output = '';
                // Start a new logic chain
                chain = true;

                if (Twig.trace) console.log("parsing ", token);

                // Parse the expression
                var result = Twig.expression.parse(token.stack, context);
                if (Twig.trace) console.log("parsed to ", result);
                if (result == true) {
                    chain = false;
                    // parse if output
                    output = Twig.parse(token.output, context);
                }
                return {
                    chain: chain,
                    output: output
                };
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
                Twig.logic.type.endif
            ],
            open: false,
            compile: function(token) {
                var expression = token.match[1];
                if (Twig.trace) console.log("Compiling ELSEIF token with expression", expression);
                // Compile the expression.
                token.stack = Twig.expression.compile({
                    type:  Twig.expression.type.expression,
                    value: expression
                }).stack;
                delete token.match;
                return token;
            },
            parse: function(token, context, chain) {
                var output = '';
                if (chain) {
                    var result = Twig.expression.parse(token.stack, context);
                    if (result == true) {
                        chain = false;
                        // parse if output
                        output = Twig.parse(token.output, context);
                    }
                }
                return {
                    chain: chain,
                    output: output
                };
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
            parse: function(token, context, chain) {
                var output = '';
                if (chain) {
                    output = Twig.parse(token.output, context);
                }
                return {
                    chain: chain,
                    output: output
                };
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
            regex: /^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+([^\s].+)$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.endfor
            ],
            open: true,
            compile: function(token) {
                var key_value = token.match[1],
                    expression = token.match[2];
                if (Twig.trace) console.log("Compiling FOR token with expression", expression);

                token.key_var = null,
                token.value_var = null;
                if (key_value.indexOf(",") >= 0) {
                    var kv_split = key_value.split(',')
                    if (kv_split.length == 2) {
                        token.key_var = kv_split[0].trim();
                        token.value_var = kv_split[1].trim();
                    } else {
                        throw "Invalid expression in for loop: " + key_value;
                    }
                } else {
                    token.value_var = key_value;
                }

                // Valid expressions for a for loop
                //   for item     in expression
                //   for key,item in expression

                // Compile the expression.
                var expression_stack = Twig.expression.compile({
                    type:  Twig.expression.type.expression,
                    value: expression
                }).stack;

                if (expression_stack.length != 1) {
                    throw "Invalid expression in for loop, expected one expression, got " + expression_stack;

                } else {
                    var expression_token = expression_stack.pop();
                    if (expression_token.type != Twig.expression.type.array
                        && expression_token.type != Twig.expression.type.object
                        && expression_token.type != Twig.expression.type.variable) {

                        throw "Invalid expression in for loop " + expression_token.type;
                    }
                    token.expression = expression_token;
                }

                if (Twig.trace) console.log("Compiled for token to ", token);

                delete token.match;
                return token;
            },
            parse: function(token, context, continue_chain) {
                // Parse expression
                var result = Twig.expression.parse(token.expression, context),
                    output = [];

                if (result instanceof Array) {
                    var key = 0;
                    result.forEach(function(value) {
                        context[token.value_var] = value;
                        if (token.key_var) context[token.key_var] = key++;
                        output.push(Twig.parse(token.output, context));
                    })
                } else if (result instanceof Object) {
                    for (key in result) {
                        var value = result[key];
                        context[token.value_var] = value;
                        if (token.key_var) context[token.key_var] = key;
                        output.push(Twig.parse(token.output, context));
                    }
                }
                // Only allow else statements if no output was generated
                continue_chain = (output.length == 0);

                return {
                    chain: continue_chain,
                    output: output.join("")
                };
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
        }
    ];

    /**
     * Registry for logic handlers.
     */
    Twig.logic.handler = {};

    /**
     * Register a new logic token type.
     */
    Twig.logic.extendType = function(type, value) {
        if (value == undefined) value = type;
        Twig.logic.type[type] = value;
    }

    /**
     * Extend the logic parsing functionality with a new token definition.
     */
    Twig.logic.extend = function(definition) {

        if (!definition.type) {
            throw "Unable to extend logic definition. No type provided for " + definition;
        }
        Twig.logic.handler[definition.type] = definition;
    };

    // Load built-in expressions
    while (Twig.logic.definitions.length > 0) Twig.logic.extend(Twig.logic.definitions.shift());

    Twig.logic.compile = function(raw_token) {
        var expression = raw_token.value.trim(),
            token = Twig.logic.tokenize(expression),
            token_template = Twig.logic.handler[token.type];

        // Check if the token needs compiling
        if (token_template.compile) {
            token = token_template.compile(token);
            if (Twig.trace) console.log("T.l.c: Compiled logic token to ", token);
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
     * @return {Object} The matched token with a type and regex match set.
     */
    Twig.logic.tokenize = function(expression) {
        var token = {};
        for (token_type in Twig.logic.handler) {
            var token_template = Twig.logic.handler[token_type],
                type = token_template.type,
                token_regex = token_template.regex,
                regexArray = [];


            if (token_regex instanceof Array) {
                regexArray = token_regex;
            } else {
                regexArray.push(token_regex);
            }

            while (regexArray.length > 0)  {
                var regex = regexArray.shift();
                var match = regex.exec(expression.trim());
                if (match != null) {
                    token.type  = type;
                    token.match = match;

                    if (Twig.trace) console.log("T.l.t: Matched a ", type, " regular expression of ", match);

                    found = true;

                    return token;
                }
            }
        }
        throw "Unable to parse '" + expression.trim() + "'";

        return token;
    };

    Twig.logic.parse = function(token, context, chain) {
        // What does chain mean:
        //   Should we continue a chain of expressions?
        //   If false, no logic token with an open: false should be evaluated
        //     e.g. If an {% if ... %} evaluates true, then sets chain = false, any
        //          following tokens with open=false (else, elseif) should be ignored.

        if (Twig.trace) console.log("Parsing logic token ", token);

        var output = '',
            token_template = Twig.logic.handler[token.type];

        if (token_template.parse) {
            output = token_template.parse(token, context, chain);
        }
        return output;
    };

    /**
     * Namespace for expression handling.
     */
    Twig.expression = { };

    /**
     * The type of tokens used in expressions.
     */
    Twig.expression.type = {
        expression: 'expression',
        operator:   'operator',
        string:     'string',
        array:      'array',
        object:     'object',
        filter:     'filter',
        variable:   'variable',
        number:     'number',
        unknown:    'unknown'
    };

    /**
     * The regular expressions used to match tokens in expressions.
     */
    Twig.expression.definitions = [
        {
            type: Twig.expression.type.expression,
            // Match (, anything but ), )
            regex: /^\([^\)]+\)/,
            next: [
                Twig.expression.type.operator
            ]
        },
        {
            type: Twig.expression.type.operator,
            // Match any of +, *, /, -,^, ~, !, <, <=, >, >=, !=, ==, ||, &&
            regex: /(^[\+\*\/\-\^~%]|^[<>!]=?|^==|^\|\||^&&)/,
            next: [
                Twig.expression.type.expression,
                Twig.expression.type.string,
                Twig.expression.type.variable,
                Twig.expression.type.number,
            ]
        },
        {
            /**
             * Match a string. This is anything between a pair of single or double quotes.
             */
            type: Twig.expression.type.string,
            // See: http://blog.stevenlevithan.com/archives/match-quoted-string
            regex: /^(["'])(?:(?=(\\?))\2.)*?\1/,
            next: [
                Twig.expression.type.operator
            ]
        },
        {
            /**
             * Match an array.
             */
            type: Twig.expression.type.array,
            regex: /\[[^\]]\]/,
            next: [ ]
        },
        {
            /**
             * Match an object/hash map.
             */
            type: Twig.expression.type.object,
            regex: /\{[^\}]\}/,
            next: [ ]
        },
        {
            /**
             * Match a filter of the form something|encode(...)
             */
            type: Twig.expression.type.filter,
            // match a | then a letter or _, then any number of letters, numbers, _ or -
            regex: /(^\|[a-zA-Z_][a-zA-Z0-9_\-]*\([^\)]\))/,
            next: [
                Twig.expression.type.operator
            ]
        },
        {
            /**
             * Match a filter of the form something|raw
             */
            type: Twig.expression.type.filter,
            // match a | then a letter or _, then any number of letters, numbers, _ or -
            regex: /(^\|[a-zA-Z_][a-zA-Z0-9_\-]*)/,
            next: [
                Twig.expression.type.operator
            ]
        },
        {
            /**
             * Match a variable. Variables can contain letters, numbers, underscores and dashes
             * but must start with a letter or underscore.
             */
            type: Twig.expression.type.variable,
            // match any letter or _, then any number of letters, numbers, _ or -
            regex: /(^[a-zA-Z_][a-zA-Z0-9_]*)/,
            next: [
                Twig.expression.type.operator,
                Twig.expression.type.filter
            ]
        },
        {
            /**
             * Match a number (integer or decimal)
             */
            type: Twig.expression.type.number,
            // match a number
            regex: /(^\-?\d*\.?\d+)/,
            next: [
                Twig.expression.type.operator,
                Twig.expression.type.filter
            ]
        },
        {
            /*
             * Match anything else.
             * This type will throw an error and halt parsing.
             */
            type: Twig.expression.type.unknown,
            // Catch-all for unknown expressions
            regex:  /^(.*)/,
            next: [ ]
        }
    ];

    Twig.expression.tokenize = function(expression) {
        if (Twig.trace) console.log("T.e.t: Tokenizing expression ", expression);
        var tokens = [],
            exp_offset = 0,
            prev_next = null;
        while (expression.length > 0) {
            var l = Twig.expression.definitions.length;
            for (var i = 0; i < l; i++) {
                var token_template = Twig.expression.definitions[i],
                    type = token_template.type,
                    regex = token_template.regex,
                    match_found = false;

                expression = expression.trim().replace(regex, function(match, from, offset, string) {
                    if (Twig.trace) console.log("Matched a ", type, " regular expression of ", match);

                    if (type == Twig.expression.type.unknown) throw "Unable to parse '" + match + "' at template:" + exp_offset;
                    // Check that this token is a valid next token
                    var prev_token = tokens.length > 0 ? tokens[tokens.length-1] : null;
                    if (prev_next != null && prev_next.indexOf(type) < 0) {
                        throw type + " cannot follow a " + prev_token.type + " at template:" + exp_offset + " near '" + match.substring(0, 20) + "'";
                    }

                    if (type == Twig.expression.type.expression) {
                        // Trim parenthesis of of an expression
                        match = match.substring(1, match.length-1);
                    }

                    match_found = true;
                    tokens.push({
                        type: type,
                        value: match
                    });
                    prev_next = token_template.next;
                    exp_offset += match.length;
                    return '';
                });
                if (match_found) break;
            }
        }
        return tokens;
    };

    Twig.expression.compile = function(raw_token) {
        var expression = raw_token.value;
        if (Twig.trace) console.log("Compiling expression", expression);

        // Tokenize expression
        var tokens = Twig.expression.tokenize(expression);
        tokens.reverse();
        if (Twig.trace) console.log("tokens are ", tokens);

        // Push tokens into RPN stack using the Sunting-yard algorithm
        // See http://en.wikipedia.org/wiki/Shunting_yard_algorithm

        var output = [];
        var operator_stack = [];

        while(tokens.length > 0) {
            var token = tokens.pop(),
                type = token.type,
                value = token.value;

            switch (type) {
                // variable/contant types
                case Twig.expression.type.string:
                    // Remove the quotes from the string
                    if (value.substring(0,1) == '"') {
                        value = value.replace('\\"', '"');
                    } else {
                        value = value.replace("\\'", "'");
                    }
                    token.value = value.substring(1, value.length-1);
                    if (Twig.trace) console.log("String value: ", token.value)
                    output.push(token);
                    break;

                case Twig.expression.type.variable:
                case Twig.expression.type.number:
                    if (Twig.trace) console.log("Var/number value: ", value)
                    output.push(token);
                    break;


                /**
                 * Handler operators (e.g. +,-,/,etc...)
                 *
                 * This looks up the operator in the
                 */
                case Twig.expression.type.operator:
                    var operator = Twig.expression.operator.lookup(value, token);
                    if (Twig.trace) console.log("operator: ", operator);

                    while (operator_stack.length > 0 && (
                                (operator.associativity == Twig.expression.operator.leftToRight &&
                                 operator.precidence    >= operator_stack[operator_stack.length-1].precidence)

                             || (operator.associativity == Twig.expression.operator.rightToLeft &&
                                 operator.precidence    >  operator_stack[operator_stack.length-1].precidence))
                           ) {
                         output.push(operator_stack.pop());
                    }

                    operator_stack.push(operator);
                    break;

                /**
                 * Handle sub-expressions (expressions in parenthesis)
                 */
                case Twig.expression.type.expression:
                    var evaluated_expression = Twig.expression.compile(token),
                        sub_stack = evaluated_expression.stack;
                    sub_stack.reverse();
                    while (sub_stack.length > 0) {
                        output.push(sub_stack.pop());
                    }
                    break;

                case Twig.expression.type.filter:
            }
        }

        while(operator_stack.length > 0) {
            output.push(operator_stack.pop());
        }

        if (Twig.trace) console.log("stack is", output);

        raw_token.stack = output;
        delete raw_token.value;

        return raw_token;

    };


    /**
     * Parse an RPN expression stack within a context.
     */
    Twig.expression.parse = function(tokens, context) {
        // If the token isn't an array, make it one.
        if (!(tokens instanceof Array)) tokens = [tokens];

        // The output stack
        var stack = [];
        tokens.forEach(function(token) {
            if (Twig.trace) console.log("Parsing ", token);
            switch (token.type) {
                // variable/contant types
                case Twig.expression.type.string:
                case Twig.expression.type.number:
                    stack.push(token.value);
                    break;
                case Twig.expression.type.variable:
                    // Get the variable from the context
                    if (!context.hasOwnProperty(token.value)) {
                        throw "Model doesn't provide the property " + token.value;
                    }
                    stack.push(context[token.value]);
                    break;

                case Twig.expression.type.operator:
                    var operator = token.value;
                    stack = Twig.expression.operator.parse(operator, stack);
                    break;
            }
        });
        if (Twig.trace) console.log("Stack result: ", stack);
        // Pop the final value off the stack
        return stack.pop();
    };

    /**
     * Operator associativity constants.
     */
    Twig.expression.operator = {
        leftToRight: 'leftToRight',
        rightToLeft: 'rightToLeft'
    }

    /**
     * Get the precidence and associativity of an operator. These follow the order that C/C++ use.
     * See http://en.wikipedia.org/wiki/Operators_in_C_and_C++ for the table of values.
     */
    Twig.expression.operator.lookup = function(operator, token) {
        switch (operator) {
            // Ternary
            case '?':
            case ':':
                token.precidence = 16;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            case '||':
                token.precidence = 14;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '&&':
                token.precidence = 13;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '==':
            case '!=':
                token.precidence = 9;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '<':
            case '<=':
            case '>':
            case '>=':
                token.precidence = 8;
                token.associativity = Twig.expression.operator.leftToRight;
                break;


            case '~': // String concatination
            case '+':
            case '-':
                token.precidence = 6;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '*':
            case '/':
            case '%':
                token.precidence = 5;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '!':
                token.precidence = 3;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            default:
                throw operator + " is an unknown operator."
        }
        token.operator = operator;
        return token;
    }

    /**
     * Handle operations on the RPN stack.
     *
     * Returns the updated stack.
     */
    Twig.expression.operator.parse = function(operator, stack) {
        if (Twig.trace) console.log("Handling", operator);
        var a,b,c;
        switch (operator) {
            case '+':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a + b);
                break;

            case '-':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a - b);
                break;

            case '*':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a * b);
                break;

            case '/':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a / b);
                break;

            case '%':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a % b);
                break;

            case '~':
                b = stack.pop().toString();
                a = stack.pop().toString();
                stack.push(a + b);
                break;

            case '!':
                stack.push(!stack.pop());
                break;

            case '<':
                b = stack.pop();
                a = stack.pop();
                stack.push(a < b);
                break;

            case '<=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a <= b);
                break;

            case '>':
                b = stack.pop();
                a = stack.pop();
                stack.push(a > b);
                break;

            case '>=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a >= b);
                break;

            case '==':
                b = stack.pop();
                a = stack.pop();
                stack.push(a == b);
                break;

            case '!=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a != b);
                break;

            case '||':
                b = stack.pop();
                a = stack.pop();
                stack.push(a || b);
                break;

            case '&&':
                b = stack.pop();
                a = stack.pop();
                stack.push(a && b);
                break;
        }

        return stack;
    };

    /**
     * A Twig Template model.
     *
     * Holds a set of compiled tokens ready to be rendered.
     */
    Twig.Template = function( tokens ) {
        this.tokens = tokens;
        this.render = function(context) {
            if (Twig.debug) console.log("Render context is ", context);
            var output = Twig.parse(tokens, context);
            if (Twig.debug) console.log("Rendered to: ", output);
            return output;
        }
    }

    /**
     * Create and compile a Twig template.
     *
     * Returns a Twig.Template ready for rendering.
     */
    return function(params) {
        if (Twig.debug) console.log("Parsing ", params);

        var raw_tokens = Twig.tokenize(params.data);
        var tokens = Twig.compile(raw_tokens);

        if (Twig.debug) console.log("Parsed into ", tokens);

        return new Twig.Template( tokens );
    }
})( Twig );