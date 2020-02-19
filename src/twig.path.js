// ## twig.path.js
//
// This file handles path parsing
module.exports = function (Twig) {
    'use strict';

    /**
     * Namespace for path handling.
     */
    Twig.path = {};

    /**
     * Generate the canonical version of a url based on the given base path and file path and in
     * the previously registered namespaces.
     *
     * @param  {string} template The Twig Template
     * @param  {string} _file    The file path, may be relative and may contain namespaces.
     *
     * @return {string}          The canonical version of the path
     */
    Twig.path.parsePath = function (template, _file) {
        let k = null;
        const {namespaces} = template.options;
        let file = _file || '';
        const hasNamespaces = namespaces && typeof namespaces === 'object';

        if (hasNamespaces) {
            for (k in namespaces) {
                if (!file.includes(k)) {
                    continue;
                }

                // Check if keyed namespace exists at path's start
                const colon = new RegExp('^' + k + '::');
                const atSign = new RegExp('^@' + k + '/');
                // Add slash to the end of path
                const namespacePath = namespaces[k].replace(/([^/])$/, '$1/');

                if (colon.test(file)) {
                    file = file.replace(colon, namespacePath);
                    return file;
                }

                if (atSign.test(file)) {
                    file = file.replace(atSign, namespacePath);
                    return file;
                }
            }
        }

        return Twig.path.relativePath(template, file);
    };

    /**
     * Generate the relative canonical version of a url based on the given base path and file path.
     *
     * @param {Twig.Template} template The Twig.Template.
     * @param {string} _file The file path, relative to the base path.
     *
     * @return {string} The canonical version of the path.
     */
    Twig.path.relativePath = function (template, _file) {
        let base;
        let basePath;
        let sepChr = '/';
        const newPath = [];
        let file = _file || '';
        let val;

        if (template.url) {
            if (typeof template.base === 'undefined') {
                base = template.url;
            } else {
                // Add slash to the end of path
                base = template.base.replace(/([^/])$/, '$1/');
            }
        } else if (template.path) {
            // Get the system-specific path separator
            const path = require('path');
            const sep = path.sep || sepChr;
            const relative = new RegExp('^\\.{1,2}' + sep.replace('\\', '\\\\'));
            file = file.replace(/\//g, sep);

            if (template.base !== undefined && file.match(relative) === null) {
                file = file.replace(template.base, '');
                base = template.base + sep;
            } else {
                base = path.normalize(template.path);
            }

            base = base.replace(sep + sep, sep);
            sepChr = sep;
        } else if ((template.name || template.id) && template.method && template.method !== 'fs' && template.method !== 'ajax') {
            // Custom registered loader
            base = template.base || template.name || template.id;
        } else {
            throw new Twig.Error('Cannot extend an inline template.');
        }

        basePath = base.split(sepChr);

        // Remove file from url
        basePath.pop();
        basePath = basePath.concat(file.split(sepChr));

        while (basePath.length > 0) {
            val = basePath.shift();
            if (val === '.') {
                // Ignore
            } else if (val === '..' && newPath.length > 0 && newPath[newPath.length - 1] !== '..') {
                newPath.pop();
            } else {
                newPath.push(val);
            }
        }

        return newPath.join(sepChr);
    };

    return Twig;
};
