// ## twig.exports.js
//
// This file provides extension points and other hooks into the twig functionality.

module.exports = function (Twig) {
    'use strict';
    Twig.exports = {
        VERSION: Twig.VERSION
    };

    /**
     * Create and compile a twig.js template.
     *
     * @param {Object} param Paramteres for creating a Twig template.
     *
     * @return {Twig.Template} A Twig template ready for rendering.
     */
    Twig.exports.twig = function (params) {
        'use strict';
        const {id} = params;
        const options = {
            strictVariables: params.strict_variables || false,
            // TODO: turn autoscape on in the next major version
            autoescape: (params.autoescape !== null && params.autoescape) || false,
            allowInlineIncludes: params.allowInlineIncludes || false,
            rethrow: params.rethrow || false,
            namespaces: params.namespaces
        };

        if (Twig.cache && id) {
            Twig.validateId(id);
        }

        if (params.debug !== undefined) {
            Twig.debug = params.debug;
        }

        if (params.trace !== undefined) {
            Twig.trace = params.trace;
        }

        if (params.data !== undefined) {
            return Twig.Templates.parsers.twig({
                data: params.data,
                path: Object.hasOwnProperty.call(params, 'path') ? params.path : undefined,
                module: params.module,
                id,
                options
            });
        }

        if (params.ref !== undefined) {
            if (params.id !== undefined) {
                throw new Twig.Error('Both ref and id cannot be set on a twig.js template.');
            }

            return Twig.Templates.load(params.ref);
        }

        if (params.method !== undefined) {
            if (!Twig.Templates.isRegisteredLoader(params.method)) {
                throw new Twig.Error('Loader for "' + params.method + '" is not defined.');
            }

            return Twig.Templates.loadRemote(params.name || params.href || params.path || id || undefined, {
                id,
                method: params.method,
                parser: params.parser || 'twig',
                base: params.base,
                module: params.module,
                precompiled: params.precompiled,
                async: params.async,
                options

            }, params.load, params.error);
        }

        if (params.href !== undefined) {
            return Twig.Templates.loadRemote(params.href, {
                id,
                method: 'ajax',
                parser: params.parser || 'twig',
                base: params.base,
                module: params.module,
                precompiled: params.precompiled,
                async: params.async,
                options

            }, params.load, params.error);
        }

        if (params.path !== undefined) {
            return Twig.Templates.loadRemote(params.path, {
                id,
                method: 'fs',
                parser: params.parser || 'twig',
                base: params.base,
                module: params.module,
                precompiled: params.precompiled,
                async: params.async,
                options
            }, params.load, params.error);
        }
    };

    // Extend Twig with a new filter.
    Twig.exports.extendFilter = function (filter, definition) {
        Twig.filter.extend(filter, definition);
    };

    // Extend Twig with a new function.
    Twig.exports.extendFunction = function (fn, definition) {
        Twig._function.extend(fn, definition);
    };

    // Extend Twig with a new test.
    Twig.exports.extendTest = function (test, definition) {
        Twig.test.extend(test, definition);
    };

    // Extend Twig with a new definition.
    Twig.exports.extendTag = function (definition) {
        Twig.logic.extend(definition);
    };

    // Provide an environment for extending Twig core.
    // Calls fn with the internal Twig object.
    Twig.exports.extend = function (fn) {
        fn(Twig);
    };

    /**
     * Provide an extension for use with express 2.
     *
     * @param {string} markup The template markup.
     * @param {array} options The express options.
     *
     * @return {string} The rendered template.
     */
    Twig.exports.compile = function (markup, options) {
        const id = options.filename;
        const path = options.filename;

        // Try to load the template from the cache
        const template = new Twig.Template({
            data: markup,
            path,
            id,
            options: options.settings['twig options']
        }); // Twig.Templates.load(id) ||

        return function (context) {
            return template.render(context);
        };
    };

    /**
     * Provide an extension for use with express 3.
     *
     * @param {string} path The location of the template file on disk.
     * @param {Object|Function} The options or callback.
     * @param {Function} fn callback.
     *
     * @throws Twig.Error
     */
    Twig.exports.renderFile = function (path, options, fn) {
        // Handle callback in options
        if (typeof options === 'function') {
            fn = options;
            options = {};
        }

        options = options || {};

        const settings = options.settings || {};

        // Mixin any options provided to the express app.
        const viewOptions = settings['twig options'];

        const params = {
            path,
            base: settings.views,
            load(template) {
                // Render and return template as a simple string, see https://github.com/twigjs/twig.js/pull/348 for more information
                if (!viewOptions || !viewOptions.allowAsync) {
                    fn(null, String(template.render(options)));
                    return;
                }

                template.renderAsync(options)
                    .then(out => fn(null, out), fn);
            },
            error(err) {
                fn(err);
            }
        };

        if (viewOptions) {
            for (const option in viewOptions) {
                if (Object.hasOwnProperty.call(viewOptions, option)) {
                    params[option] = viewOptions[option];
                }
            }
        }

        Twig.exports.twig(params);
    };

    // Express 3 handler
    Twig.exports.__express = Twig.exports.renderFile;

    /**
     * Shoud Twig.js cache templates.
     * Disable during development to see changes to templates without
     * reloading, and disable in production to improve performance.
     *
     * @param {boolean} cache
     */
    Twig.exports.cache = function (cache) {
        Twig.cache = cache;
    };

    // We need to export the path module so we can effectively test it
    Twig.exports.path = Twig.path;

    // Export our filters.
    // Resolves #307
    Twig.exports.filters = Twig.filters;

    // Export our tests.
    Twig.exports.tests = Twig.tests;

    // Export our functions.
    Twig.exports.functions = Twig.functions;

    Twig.exports.Promise = Twig.Promise;

    return Twig;
};
