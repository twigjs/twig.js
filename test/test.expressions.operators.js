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

    describe("?: ->", function() {
        it("should support the extended ternary operator for true conditions", function() {
            var test_template = twig({data: '{{ a ? b }}'})
                , output_t = test_template.render({a: true,  b: "one"})
                , output_f = test_template.render({a: false, b: "one"});

            output_t.should.equal( "one" );
            output_f.should.equal( "" );
        });

        it("should support the extended ternary operator for false conditions", function() {
            debugger;
            var test_template = twig({data: '{{ a ?: b }}'})
                , output_t = test_template.render({a: "one",  b: "two"})
                , output_f = test_template.render({a: false, b: "two"});

            output_t.should.equal( "one" );
            output_f.should.equal( "two" );
        });
    });
});
