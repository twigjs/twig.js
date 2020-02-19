module.exports = function (Twig) {
    'use strict';

    let fs;
    let path;

    try {
        // Require lib dependencies at runtime
        fs = require('fs');
        path = require('path');
    } catch (error) {
        // NOTE: this is in a try/catch to avoid errors cross platform
        console.warn('Missing fs and path modules. ' + error);
    }

    Twig.Templates.registerLoader('fs', function (location, params, callback, errorCallback) {
        let template;
        let data = null;
        const {precompiled} = params;
        const parser = this.parsers[params.parser] || this.parser.twig;

        if (!fs || !path) {
            throw new Twig.Error('Unsupported platform: Unable to load from file ' +
                                 'because there is no "fs" or "path" implementation');
        }

        const loadTemplateFn = function (err, data) {
            if (err) {
                if (typeof errorCallback === 'function') {
                    errorCallback(err);
                }

                return;
            }

            if (precompiled === true) {
                data = JSON.parse(data);
            }

            params.data = data;
            params.path = params.path || location;

            // Template is in data
            template = parser.call(this, params);

            if (typeof callback === 'function') {
                callback(template);
            }
        };

        params.path = params.path || location;

        if (params.async) {
            fs.stat(params.path, (err, stats) => {
                if (err || !stats.isFile()) {
                    if (typeof errorCallback === 'function') {
                        errorCallback(new Twig.Error('Unable to find template file ' + params.path));
                    }

                    return;
                }

                fs.readFile(params.path, 'utf8', loadTemplateFn);
            });
            // TODO: return deferred promise
            return true;
        }

        try {
            if (!fs.statSync(params.path).isFile()) {
                throw new Twig.Error('Unable to find template file ' + params.path);
            }
        } catch (error) {
            throw new Twig.Error('Unable to find template file ' + params.path + '. ' + error);
        }

        data = fs.readFileSync(params.path, 'utf8');
        loadTemplateFn(undefined, data);
        return template;
    });
};
