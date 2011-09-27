var Twig = {};

var twig = (function(Twig) {

    Twig.trace = false;

    Twig.token = {
        type: {
            output: 'output',
            logic: 'logic',
            comment: 'comment',
            raw: 'raw'
        }
    }
    Twig.token.definitions = {
        output: {
            type: Twig.token.type.output,
            open: '{{',
            close: '}}'
        },
        login: {
            type: Twig.token.type.logic,
            open: '{%',
            close: '%}'
        },
        comment: {
            type: Twig.token.type.comment,
            open: '{#',
            close: '#}'
        }
    };
    // What characters start "strings" in token definitions
    Twig.token.strings = [
        '"', "'"
    ];

    Twig.tokenize = function(template) {
        var tokens = [];

        while (template.length > 0) {
            // Find the first occurance of any token type in the template
            var found_token = findToken(template);
            if (Twig.trace) console.log("Found token ", found_token);

            if (found_token.position !== null) {
                // Add a raw type token for anything before the start of the token
                if (found_token.position > 0) {
                    tokens.push({
                        type: Twig.token.type.raw,
                        value: template.substring(0, found_token.position - 1)
                    });
                }
                template = template.substr(found_token.position + found_token.def.open.length);

                var start = 0;
                if (Twig.trace) console.log("Token starts at ", start);

                // Find the end of the token
                var end = findTokenEnd(template, found_token.def, found_token.position);
                if (Twig.trace) console.log("Token ends at ", end);

                var token_str = template.substring(start, end - 1).trim();
                tokens.push({
                    type: found_token.def.type,
                    value: token_str
                });

                template = template.substr(end + found_token.def.close.length);

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
        if (Twig.trace) console.log(Twig.token.definitions);
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
                throw "Unable to find closing bracket '" + token_def.close + "'" + " opened at template position " + start;
            }
            var str_pos = null;
            var str_found = null;
            for (var i=0,l=Twig.token.strings.length;i<l;i++) {
                var str = Twig.token.strings[i];
                var this_str_pos = template.indexOf(str, offset);
                if (this_str_pos > 0 && this_str_pos < pos && ( str_pos == null || this_str_pos < str_pos ) ) {
                    str_pos = this_str_pos;
                    str_found = str;
                }
            }
            // We found a string before the end of the token, now find the string's end and set the search offset to it
            if (str_pos != null) {
                end = null;
                found = false;
                var end_str_pos = template.indexOf(str_found, str_pos);
                offset = end_str_pos + 1;
            }
        }
        return end;
    }

    Twig.expression = {
        type: {
            expression: 'expression',
            operator: 'operator',
            string: 'string',
            variable: 'variable',
            number: 'number',
            unknown: 'unknown'
        }
    };

    Twig.expression.regex = [
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
            // Match any of +, *, /, -,^, ~, !
            regex: /(^[\+\*\/\-\^~!])/,
            next: [
                Twig.expression.type.expression,
                Twig.expression.type.string,
                Twig.expression.type.variable,
                Twig.expression.type.number,
            ]
        },
        {
            type: Twig.expression.type.string,
            // Match ", anything but ", "  OR  ', anything but ', '  (NOTE: doesn't handle \' or \")
            regex: /(^"[^"]*"|'[^']*')/,
            next: [
                Twig.expression.type.operator
            ]
        },
        {
            type: Twig.expression.type.variable,
            // match any letter or _, then any number of letters, numbers, _ or -
            regex: /(^[a-zA-Z_][a-zA-Z0-9_\-]*)/,
            next: [
                Twig.expression.type.operator
            ]
        },
        {
            type: Twig.expression.type.number,
            // match a number
            regex: /(^\-?\d*\.?\d+)/,
            next: [
                Twig.expression.type.operator
            ]
        },
        {
            type: Twig.expression.type.unknown,
            // Catch-all for unknown expressions
            regex:  /^(.*)/,
            next: [ ]
        }
    ];


    Twig.expression.parse = function(expression, context) {
        console.log("Parsing expression", expression);

        // Tokenize expression
        var tokens = Twig.expression.tokenize(expression);
        console.log("tokens are ", tokens);

        // What do valid expressions look like:
        //  a + b * c - d
        //  basically: (expression)[(operator)(expression)]*
        // What are the operators
        //   +, -, *, /, ~, ^
    };

    Twig.expression.tokenize = function(expression) {
        var tokens = [],
            exp_offset = 0;
        while (expression.length > 0) {
            var l = Twig.expression.regex.length;
            for (var i = 0; i < l; i++) {
                var token_template = Twig.expression.regex[i],
                    type = token_template.type,
                    regex = token_template.regex,
                    match_found = false;

                expression = expression.trim().replace(regex, function(match, from, offset, string) {
                    if (Twig.trace) console.log("Matched a ", type, " regular expression of ", match);

                    if (type == "unknown") throw "Unable to parse '" + match + "' at template:" + exp_offset;
                    // Check that this token is a valid next token
                    var prev_token = tokens.length > 0 ? tokens[tokens.length-1] : null;
                    if (prev_token != null && prev_token.next.indexOf(type) < 0) {
                        throw type + " cannot follow a " + prev_token.type + " at template:" + exp_offset + " near '" + match.substring(0, 20) + "'";
                    }

                    match_found = true;
                    tokens.push({
                        type: type,
                        value: match,
                        next: token_template.next
                    });
                    exp_offset += match.length;
                    return '';
                });
                if (match_found) break;
            }
        }
        return tokens;
    };

    // Language:
    /*

    Output:

    OPEN   token_value   CLOSE
    {{ user }}

    Command Logic:
    {%  command  %}

    Comments:
    {# comment... #}
    */

   Twig.Template = function( tokens ) {
       this.tokens = tokens;
       this.render = function(context) {
           var output = [];
           tokens.forEach(function(token) {
               console.log(token);
               switch (token.type) {
                   case Twig.token.type.raw:
                       output.push(token.value);
                       break;

                   case Twig.token.type.logic:
                       break;

                   case Twig.token.type.comment:
                       // Do nothing, comments should be ignored
                       break;

                   case Twig.token.type.output:
                       // Parse the given expression in the given context
                       output.push(Twig.expression.parse(token.value, context));
                       break;
               }
           });
           return output.join("");
       }
   }

    return function(params) {
        if (Twig.debug) console.log("parsing ", params);

        var tokens = Twig.tokenize(params.html);

        if (Twig.debug) console.log("Parsed into ", tokens);

        return new Twig.Template( tokens );
    }
})( Twig );