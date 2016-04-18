var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Expression Operators ->", function() {
    describe("Precedence ->", function() {
        it("should correctly order 'in'", function() {
            var test_template = twig({data: '{% if true or "anything" in ["a","b","c"] %}OK!{% endif %}'}),
                output = test_template.render({});

            output.should.equal("OK!");
        });
    });
});
