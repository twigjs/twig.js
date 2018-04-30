// ## twig.exports.js
//
// This file provides extension points and other hooks into the twig functionality.

module.exports = function (Twig) {
    "use strict";
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
    Twig.exports.twig = function twig(params) {
        'use strict';
        var id = params.id,
            options = {
                strict_variables: params.strict_variables || false,
                // TODO: turn autoscape on in the next major version
                autoescape: params.autoescape != null && params.autoescape || false,
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
                path: params.hasOwnProperty('path') ? params.path : undefined,
                module: params.module,
                id:   id,
                options: options
            });

        } else if (params.ref !== undefined) {
            if (params.id !== undefined) {
                throw new Twig.Error("Both ref and id cannot be set on a twig.js template.");
            }
            return Twig.Templates.load(params.ref);

        } else if (params.method !== undefined) {
            if (!Twig.Templates.isRegisteredLoader(params.method)) {
                throw new Twig.Error('Loader for "' + params.method + '" is not defined.');
            }
            return Twig.Templates.loadRemote(params.name || params.href || params.path || id || undefined, {
                id: id,
                method: params.method,
                parser: params.parser || 'twig',
                base: params.base,
                module: params.module,
                precompiled: params.precompiled,
                async: params.async,
                options: options

            }, params.load, params.error);

        } else if (params.href !== undefined) {
            return Twig.Templates.loadRemote(params.href, {
                id: id,
                method: 'ajax',
                parser: params.parser || 'twig',
                base: params.base,
                module: params.module,
                precompiled: params.precompiled,
                async: params.async,
                options: options

            }, params.load, params.error);

        } else if (params.path !== undefined) {
            return Twig.Templates.loadRemote(params.path, {
                id: id,
                method: 'fs',
                parser: params.parser || 'twig',
                base: params.base,
                module: params.module,
                precompiled: params.precompiled,
                async: params.async,
                options: options

            }, params.load, params.error);
        }
    };

    // Extend Twig with a new filter.
    Twig.exports.extendFilter = function(filter, definition) {
        Twig.filter.extend(filter, definition);
    };

    // Extend Twig with a new function.
    Twig.exports.extendFunction = function(fn, definition) {
        Twig._function.extend(fn, definition);
    };

    // Extend Twig with a new test.
    Twig.exports.extendTest = function(test, definition) {
        Twig.test.extend(test, definition);
    };

    // Extend Twig with a new definition.
    Twig.exports.extendTag = function(definition) {
        Twig.logic.extend(definition);
    };

    // Provide an environment for extending Twig core.
    // Calls fn with the internal Twig object.
    Twig.exports.extend = function(fn) {
        fn(Twig);
    };

    /**
     * Shoud Twig.js cache templates.
     * Disable during development to see changes to templates without
     * reloading, and disable in production to improve performance.
     *
     * @param {boolean} cache
     */
    Twig.exports.cache = function(cache) {
        Twig.cache = cache;
    };

    //We need to export the path module so we can effectively test it
    Twig.exports.path = Twig.path;

    //Export our filters.
    //Resolves #307
    Twig.exports.filters = Twig.filters;

    Twig.exports.Promise = Twig.Promise;

    return Twig;
};
