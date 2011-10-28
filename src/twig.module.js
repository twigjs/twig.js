//     Twig.js v0.3
//     Copyright (c) 2011 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.module.js
//
// Provide a module export.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = twig;
} else {
    window.twig = twig;
}

