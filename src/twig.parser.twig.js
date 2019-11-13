module.exports = function (Twig) {
    'use strict';

    Twig.Templates.registerParser('twig', params => {
        return new Twig.Template(params);
    });
};
