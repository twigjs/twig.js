const ky = require('ky-universal');

module.exports = function (Twig) {
    'use strict';

    Twig.Templates.registerLoader('ajax', async function (location, params) {
        const parser = this.parsers[params.parser] || this.parser.twig;

        const data = await ky.get(location).text();

        params.url = location;
        params.data = data;

        const template = parser.call(this, params);

        return template;
    });
};
