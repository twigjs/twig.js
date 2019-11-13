// ## twig.compiler.js
//
// This file handles compiling templates into JS
module.exports = function (Twig) {
    /**
     * Namespace for compilation.
     */
    Twig.compiler = {
        module: {}
    };

    // Compile a Twig Template to output.
    Twig.compiler.compile = function (template, options) {
        // Get tokens
        const tokens = JSON.stringify(template.tokens);
        const {id} = template;
        let output = null;

        if (options.module) {
            if (Twig.compiler.module[options.module] === undefined) {
                throw new Twig.Error('Unable to find module type ' + options.module);
            }

            output = Twig.compiler.module[options.module](id, tokens, options.twig);
        } else {
            output = Twig.compiler.wrap(id, tokens);
        }

        return output;
    };

    Twig.compiler.module = {
        amd(id, tokens, pathToTwig) {
            return 'define(["' + pathToTwig + '"], function (Twig) {\n\tvar twig, templates;\ntwig = Twig.twig;\ntemplates = ' + Twig.compiler.wrap(id, tokens) + '\n\treturn templates;\n});';
        },
        node(id, tokens) {
            return 'var twig = require("twig").twig;\nexports.template = ' + Twig.compiler.wrap(id, tokens);
        },
        cjs2(id, tokens, pathToTwig) {
            return 'module.declare([{ twig: "' + pathToTwig + '" }], function (require, exports, module) {\n\tvar twig = require("twig").twig;\n\texports.template = ' + Twig.compiler.wrap(id, tokens) + '\n});';
        }
    };

    Twig.compiler.wrap = function (id, tokens) {
        return 'twig({id:"' + id.replace('"', '\\"') + '", data:' + tokens + ', precompiled: true});\n';
    };

    return Twig;
};
