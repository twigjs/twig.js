// ## twig.path.js
//
// This file handles path parsing
module.exports = function (Twig) {
    "use strict";

    /**
     * Namespace for path handling.
     */
    Twig.path = {};

    /**
     * Generate the canonical version of a url based on the given base path and file path and in
     * the previously registered namespaces.
     *
     * @param  {string} template The Twig Template
     * @param  {string} file     The file path, may be relative and may contain namespaces.
     *
     * @return {string}          The canonical version of the path
     */
     Twig.path.parsePath = function(template, file) {
        var namespaces = null,
            file = file || "",
            files = [];

        if (typeof template === 'object' && typeof template.options === 'object') {
            namespaces = template.options.namespaces;
        }

        if (!Array.isArray(file)) {
            files = [file];
        } else {
            files = file;
        }

        return files.reduce(function(acc, _file){
            if (typeof namespaces === 'object' && (_file.indexOf('::') > 0) || _file.indexOf('@') >= 0){
                for (var k in namespaces){
                    if (namespaces.hasOwnProperty(k)) {
                        _file = _file.replace(k + '::', namespaces[k]);
                        _file = _file.replace('@' + k, namespaces[k]);
                    }
                }

                acc.push(_file);
            } else {
                acc = acc.concat(Twig.path.relativePath(template, _file));
            }

            return acc;
        }, []);
    };

    /**
     * Generate the relative canonical version of a url based on the given base path and file path.
     *
     * @param {Twig.Template} template The Twig.Template.
     * @param {string} file The file path, relative to the base path.
     *
     * @return {string} The canonical version of the path.
     */
    Twig.path.relativePath = function(template, file) {
        var base,
            base_path,
            bases = [],
            sep_chr = "/",
            new_path = [],
            file = file || "",
            val;

        if (template.url) {
            if (typeof template.base !== 'undefined') {
                base = template.base + ((template.base.charAt(template.base.length-1) === '/') ? '' : '/');
            } else {
                base = template.url;
            }
            bases.push(base);
        } else if (template.path) {
            // Get the system-specific path separator
            var path = require("path"),
                sep = path.sep || sep_chr,
                relative = new RegExp("^\\.{1,2}" + sep.replace("\\", "\\\\")),
                pathNormalize = function(_path){

                    if (template.base !== undefined && file.match(relative) == null) {
                        file = file.replace(template.base, '');
                        base = template.base + sep;
                    } else {
                        base = path.normalize(_path);
                    }

                    return base.replace(sep+sep, sep);
                };

            file = file.replace(/\//g, sep);

            if (Array.isArray(template.path)) {
                bases = template.path.map(pathNormalize);
            } else {
                bases.push(pathNormalize(template.path));
            }

            sep_chr = sep;
        } else if ((template.name || template.id) && template.method && template.method !== 'fs' && template.method !== 'ajax') {
            // Custom registered loader
            base = template.base || template.name || template.id;
            bases.push(base);
        } else {
            throw new Twig.Error("Cannot extend an inline template.");
        }


        return bases.map(function(base){
            base_path = base.split(sep_chr);

            // Remove file from url
            base_path.pop();
            base_path = base_path.concat(file.split(sep_chr));

            while (base_path.length > 0) {
                val = base_path.shift();
                if (val == ".") {
                    // Ignore
                } else if (val == ".." && new_path.length > 0 && new_path[new_path.length-1] != "..") {
                    new_path.pop();
                } else {
                    new_path.push(val);
                }
            }

            var res = new_path.join(sep_chr);
            return res;
        })
    };

    return Twig;
};
