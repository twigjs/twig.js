var Twig = (Twig || require("../twig")).factory(),
    twig = twig || Twig.twig;

describe("Twig.js Rethrow ->", function() {
    it("should throw a \"Unable to parse 'missing'\" exception", function() {
        (function(){
            twig({
                rethrow: true,
                data: 'include missing template {% missing %}'
            }).render()
        }).should.throw("Unable to parse 'missing'");
    });

    it("should throw a \"Unable to find closing bracket '%}\" exception", function() {
        (function(){
            twig({
                rethrow: true,
                data: 'missing closing bracket {% }'
            }).render()
        }).should.throw(" Unable to find closing bracket '%}");
    });

    it("should throw a compile error having its file property set to the file", function(done) {
        try {
            var template = twig({
                path: 'test/templates/error/compile/entry.twig',
                async: false,
                rethrow: true
            });

            done(template);
        }
        catch(err) {
            err.should.have.property('file', 'test/templates/error/compile/entry.twig');

            done();
        }
    });

    it("should throw a parse error having its file property set to the entry file", function(done) {
        try {
            var output = twig({
                path: 'test/templates/error/parse/in-entry/entry.twig',
                async: false,
                rethrow: true
            }).render();

            done(output);
        }
        catch(err) {
            err.should.have.property('file', 'test/templates/error/parse/in-entry/entry.twig');

            done();
        }
    });

    it("should throw a parse error having its file property set to the partial file", function(done) {
        try {
            var output = twig({
                path: 'test/templates/error/parse/in-partial/entry.twig',
                async: false,
                rethrow: true
            }).render();

            done(output);
        }
        catch(err) {
            err.should.have.property('file', 'test/templates/error/parse/in-entry/entry.twig');

            done();
        }
    });
});

