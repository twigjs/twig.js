// ## twig.factory.js
//
// This file handles creating the Twig library
import core from "./twig.core";
import compiler from "./twig.compiler";
import expression from "./twig.expression";
import functions from "./twig.functions";
import filters from "./twig.filters";
import lib from "./twig.lib";
import loaderajax from "./twig.loader.ajax";
import loaderfs from "./twig.loader.fs";
import parsersource from "./twig.parser.source";
import parsertwig from "./twig.parser.twig";
import path from "./twig.path";
import tests from "./twig.tests";
import logic from "./twig.logic";
import async from "./twig.async";
import exports from "./twig.exports";

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
    loaderajax(Twig);
    loaderfs(Twig);
    logic(Twig);
    parsersource(Twig);
    parsertwig(Twig);
    path(Twig);
    tests(Twig);
    async(Twig);
    exports(Twig);

    Twig.factory = factory;

    return Twig;
};
