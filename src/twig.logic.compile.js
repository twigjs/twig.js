// ## twig.logic.compile.js
//
// This file handles tokenizing and compiling logic tokens. {% ... %}
module.exports = function (Twig) {
    "use strict";


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

    return Twig;

};
