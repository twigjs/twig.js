module.exports = function (Twig) {
    'use strict';

    let fs;
    let path;
    let util;

    try {
        // Require lib dependencies at runtime
        fs = require('fs');
        path = require('path');
        util = require('util');
    } catch (error) {
        // NOTE: this is in a try/catch to avoid errors cross platform
    }

    Twig.Templates.registerLoader('fs', async function (location, params) {
        const parser = this.parsers[params.parser] || this.parser.twig;

        if (!fs || !path) {
            throw new Twig.Error('Unsupported platform: Unable to load from file ' +
                                 'because there is no "fs" or "path" implementation');
        }

        params.path = params.path || location;

        const statAsync = util.promisify(fs.stat);
        const readFileAsync = util.promisify(fs.readFile);

        let stats;
        try {
            stats = await statAsync(params.path);
        } catch (_) {
            throw new Twig.Error('Unable to find template file ' + params.path);
        }

        if (!stats.isFile()) {
            throw new Twig.Error('Unable to find template file ' + params.path);
        }

        const data = await readFileAsync(params.path, 'utf8');

        params.data = data;
        params.path = params.path || location;

        // Template is in data
        return parser.call(this, params);
    });
};
