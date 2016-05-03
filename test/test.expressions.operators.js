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

    describe("// ->", function() {
        it("should handle positive values", function() {
            var test_template = twig({data: '{{ 20 // 7 }}'}),
                output = test_template.render({});

            output.should.equal("2");
        });

        it("should handle negative values", function() {
            var test_template = twig({data: '{{ -20 // -7 }}'}),
                output = test_template.render({});

            output.should.equal("2");
        });

        it("should handle mixed sign values", function() {
            var test_template = twig({data: '{{ -20 // 7 }}'}),
                output = test_template.render({});

            output.should.equal("-3");
        });
    });
});
