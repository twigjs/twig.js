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
     * @param {Twig.Template} template
     * @param {string} path
     */
    Twig.path.expandNamespace = function (namespaces, path) {
        const namespaceIdentifiers = Object.keys(namespaces);
        const pattern = new RegExp(`^(?:@(${namespaceIdentifiers.join('|')})/|(${namespaceIdentifiers.join('|')})::)`);

        return path.replace(pattern, (wholeMatch, atNamespace, colonNamespace) => {
            const namespaceIdentifier = (atNamespace === undefined ? colonNamespace : atNamespace);

            return `${namespaces[namespaceIdentifier]}/`;
        });
    };

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
        const {namespaces} = template.options;
        const file = _file || '';
        const hasNamespaces = namespaces && typeof namespaces === 'object';

        let path = (hasNamespaces ? Twig.path.expandNamespace(namespaces, file) : file);

        if (path === file) {
            path = Twig.path.relativePath(template, file);
        }

        return path;
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
        // Only filesystem templates are clamped: for URLs and custom loaders a
        // leading '..' is not a filesystem escape and existing behaviour is kept.
        let isFsTemplate = false;

        if (template.url) {
            if (typeof template.base === 'undefined') {
                base = template.url;
            } else {
                // Add slash to the end of path
                base = template.base.replace(/([^/])$/, '$1/');
            }
        } else if (template.path) {
            isFsTemplate = true;
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

        const resolved = newPath.join(sepChr);

        // When a template directory has been configured (`base`), refuse a
        // target that resolves outside it. Relative includes *within* that
        // directory (e.g. `{% include "../simple.twig" %}` from a subfolder)
        // keep working; only paths that climb out of the configured root are
        // rejected, matching the reference PHP implementation ("Looking
        // outside the configured directories is forbidden"). Without this,
        // enough `../` segments read arbitrary files off disk.
        if (isFsTemplate && template.base !== undefined) {
            const nodePath = require('path');
            const rootDir = nodePath.resolve(template.base);
            const target = nodePath.resolve(resolved);
            const rel = nodePath.relative(rootDir, target);
            if (rel.split(nodePath.sep)[0] === '..' || nodePath.isAbsolute(rel)) {
                throw new Twig.Error('Template "' + (_file || '') + '" is outside the configured template directory.');
            }
        }

        return resolved;
    };

    return Twig;
};
