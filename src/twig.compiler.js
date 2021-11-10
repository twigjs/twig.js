// ## twig.compiler.js
//
// This file handles compiling templates into JS
export default class TwigCompiler {

    constructor() {
        module: {}
    }

    compile(template, options) {
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
    }

    module: {}

    wrap(id, tokens) {
        return 'twig({id:"' + id.replace('"', '\\"') + '", data:' + tokens + ', precompiled: true});\n';
    }
}