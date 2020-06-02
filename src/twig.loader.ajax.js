module.exports = function (Twig) {
    'use strict';

    Twig.Templates.registerLoader('ajax', function (location, params, callback, errorCallback) {
        let template;
        const {precompiled} = params;
        const parser = this.parsers[params.parser] || this.parser.twig;

        if (typeof XMLHttpRequest === 'undefined') {
            throw new Twig.Error('Unsupported platform: Unable to do ajax requests ' +
                                 'because there is no "XMLHTTPRequest" implementation');
        }

        const xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            let data = null;

            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || (window.cordova && xmlhttp.status === 0)) {
                    Twig.log.debug('Got template ', xmlhttp.responseText);

                    if (precompiled === true) {
                        data = JSON.parse(xmlhttp.responseText);
                    } else {
                        data = xmlhttp.responseText;
                    }

                    params.url = location;
                    params.data = data;

                    template = parser.call(this, params);

                    if (typeof callback === 'function') {
                        callback(template);
                    }
                } else if (typeof errorCallback === 'function') {
                    errorCallback(xmlhttp);
                }
            }
        };

        xmlhttp.open('GET', location, Boolean(params.async));
        xmlhttp.overrideMimeType('text/plain');
        xmlhttp.send();

        if (params.async) {
            // TODO: return deferred promise
            return true;
        }

        return template;
    });
};
