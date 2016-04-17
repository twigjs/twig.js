module.exports = function(Twig) {
    'use strict';

    Twig.Templates.registerParser('source', function(params) {
        return params.data || '';
    });
};
