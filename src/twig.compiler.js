//     Twig.js v0.3
//     Copyright (c) 2011-2012 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.tests.js
//
// This file handles compiling templates into JS
var Twig = (function (Twig) {
    /**
     * Namespace for compilation.
     */
    Twig.compiler = { };
    
    // Compile a Twig Template to output.
    Twig.compiler.compile = function(template) {
        // Get tokens
        var tokens = JSON.stringify(template.tokens)
            , id = template.id;
            
        return Twig.compiler.wrap(id, tokens);
    };
    
    Twig.compiler.wrap = function(id, tokens) {
        var output = 'twig({id:"'+id.replace('"', '\\"')+'", data:'+tokens+', precompiled: true});';
        return output;
    };
    
    return Twig;
})(Twig || {});