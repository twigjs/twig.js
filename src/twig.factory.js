// ## twig.factory.js
//
// This file handles creating the Twig library
module.exports = function factory() {
    const Twig = {
        VERSION: '1.14.0'
    };

    require('./twig.core')(Twig);
    require('./twig.compiler')(Twig);
    require('./twig.expression')(Twig);
    require('./twig.filters')(Twig);
    require('./twig.functions')(Twig);
    require('./twig.lib')(Twig);
    require('./twig.loader.ajax')(Twig);
    require('./twig.loader.fs')(Twig);
    require('./twig.logic')(Twig);
    require('./twig.parser.source')(Twig);
    require('./twig.parser.twig')(Twig);
    require('./twig.path')(Twig);
    require('./twig.tests')(Twig);
    require('./twig.async')(Twig);
    require('./twig.exports')(Twig);

    Twig.exports.factory = factory;

    return Twig.exports;
};
