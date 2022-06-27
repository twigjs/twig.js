// ## twig.exports.js
//
// This file provides extension points and other hooks into the twig functionality.

import {TwigFilters} from "./twig.filters.js";

export class Twig {
    VERSION;
    compiler;
    filters;
    _function;
    tests;
    logic;
    lib;
    path;
    Templates;
    // Default caching to true for the improved performance it offers
    cache = true;
    trace = false;
    debug = false;

    constructor(version) {
        this.VERSION = version;
        // Express 3 handler
        this.__express = this.renderFile;
    }

    setCompile(compilerSetter) {
        this.compiler = compilerSetter(this);
        return this;
    }

    setFilterClass(filterSetter) {
        this.filters = filterSetter(this);
        return this;
    }

    setLibClass(libSetter) {
        this.lib = libSetter(this);
        return this;
    }

    setPathClass(pathSetter) {
        this.path = pathSetter(this);
        return this;
    }

    setTemplateStoreClass(tsSetter) {
        this.Templates = tsSetter(this);
        return this;
    }

    setTestsClass(testssSetter) {
        this.tests = testssSetter(this);
        return this;
    }

    merge (target, source, onlyChanged) {
        Object.keys(source).forEach(key => {
            if (onlyChanged && !(key in target)) {
                return;
            }

            target[key] = source[key];
        });

        return target;
    };
    /**
     * Create and compile a twig.js template.
     *
     * @param {Object} param Paramteres for creating a Twig template.
     *
     * @return {Twig.Template} A Twig template ready for rendering.
     */
    twig(params) {
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

        if (this.cache && id) {
            this.validateId(id);
        }

        if (params.debug !== undefined) {
            this.debug = params.debug;
        }

        if (params.trace !== undefined) {
            this.trace = params.trace;
        }

        if (params.data !== undefined) {
            return this.Templates.parsers.twig({
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

            return this.Templates.load(params.ref);
        }

        if (params.method !== undefined) {
            if (!this.Templates.isRegisteredLoader(params.method)) {
                throw new Twig.Error('Loader for "' + params.method + '" is not defined.');
            }

            return this.Templates.loadRemote(params.name || params.href || params.path || id || undefined, {
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
            return this.Templates.loadRemote(params.href, {
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
            return this.Templates.loadRemote(params.path, {
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
    }

    filter(filter, value, params) {
        const state = this;

        if (!this.filters[filter]) {
            throw new this.Error('Unable to find filter ' + filter);
        }

        return this.filters[filter].call(state, value, params);
    }

    // Extend Twig with a new filter.
    extendFilter(filter, definition) {
        TwigFilters.addFilter(this.filters, filter, definition)
    }

    // Extend Twig with a new function.
    extendFunction(fn, definition) {
        this._function.extend(fn, definition);
    }

    // Extend Twig with a new test.
    extendTest(test, definition) {
        this.tests[test] = definition;
    }

    test(test, value, params) {
        if (!this.tests[test]) {
            throw this.Error('Test ' + test + ' is not defined.');
        }

        return this.tests[test](value, params);
    };

    // Extend Twig with a new definition.
    extendTag(definition) {
        this.logic.extend(definition);
    };
    /**
     * Provide an extension for use with express 3.
     *
     * @param {string} path The location of the template file on disk.
     * @param {Object|Function} The options or callback.
     * @param {Function} fn callback.
     *
     * @throws this.Error
     */
    renderFile (path, options, fn) {
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

        this.twig(params);
    };



    /**
     * Should Twig.js cache templates.
     * Disable during development to see changes to templates without
     * reloading, and disable in production to improve performance.
     *
     * @param {boolean} cache
     */
    setCache(cache) {
        this.cache = cache;
    };


    // Provide an environment for extending Twig core.
    // Calls fn with the internal Twig object.
    extend(fn) {
        fn(this);
    };
    /**
     * Provide an extension for use with express 2.
     *
     * @param {string} markup The template markup.
     * @param {array} options The express options.
     *
     * @return {string} The rendered template.
     */
    // Twig.compile = function (markup, options) {
    //     const id = options.filename;
    //     const path = options.filename;
    //
    //     // Try to load the template from the cache
    //     const template = new Twig.Template({
    //         data: markup,
    //         path,
    //         id,
    //         options: options.settings['twig options']
    //     }); // Twig.Templates.load(id) ||
    //
    //     return function (context) {
    //         return template.render(context);
    //     };
    // };
}

