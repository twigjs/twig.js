var Twig = Twig || require("../twig"),
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
});

