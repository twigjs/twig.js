// ## twig.factory.js
//
// This file handles creating the Twig library
import core from "./twig.core.js";
import compiler from "./twig.compiler.js";
import expression from "./twig.expression.js";
import functions from "./twig.functions.js";
import filters from "./twig.filters.js";
import lib from "./twig.lib.js";
import loaderajax from "./twig.loader.ajax.js";
import loaderfs from "./twig.loader.fs.js";
import parsersource from "./twig.parser.source.js";
import parsertwig from "./twig.parser.twig.js";
import path from "./twig.path.js";
import tests from "./twig.tests.js";
import logic from "./twig.logic.js";
import async from "./twig.async.js";
import exports from "./twig.exports.js";

export default function factory() {
    const Twig = {
        VERSION: '1.14.0'
    };

    core(Twig);
    compiler(Twig);
    expression(Twig);
    filters(Twig);
    functions(Twig);
    lib(Twig);
    logic(Twig);
    parsersource(Twig);
    parsertwig(Twig);
    path(Twig);
    tests(Twig);
    async(Twig);
    loaderajax(Twig);
    loaderfs(Twig);
    exports(Twig);

    Twig.factory = factory;

    return Twig;
};
