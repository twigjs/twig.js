module.exports = function (Twig) {
    'use strict';

    Twig.Templates.registerParser('source', params => {
        return params.data || '';
    });
};
