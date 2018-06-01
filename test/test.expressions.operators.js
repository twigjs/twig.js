var Twig = (Twig || require("../twig")).factory(),
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

    describe("b-and ->", function() {
        it("should return correct value if needed bit is set or 0 if not", function() {
            var test_template = twig({data: '{{ a b-and b }}'})
                , output_0 = test_template.render({a: 25, b: 1})
                , output_1 = test_template.render({a: 25, b: 2})
                , output_2 = test_template.render({a: 25, b: 4})
                , output_3 = test_template.render({a: 25, b: 8})
                , output_4 = test_template.render({a: 25, b: 16});

            output_0.should.equal( "1" );
            output_1.should.equal( "0" );
            output_2.should.equal( "0" );
            output_3.should.equal( "8" );
            output_4.should.equal( "16" );
        });
    });

    describe("b-or ->", function() {
        it("should return initial value if needed bit is set or sum of bits if not", function() {
            var test_template = twig({data: '{{ a b-or b }}'})
                , output_0 = test_template.render({a: 25, b: 1})
                , output_1 = test_template.render({a: 25, b: 2})
                , output_2 = test_template.render({a: 25, b: 4})
                , output_3 = test_template.render({a: 25, b: 8})
                , output_4 = test_template.render({a: 25, b: 16});

            output_0.should.equal( "25" );
            output_1.should.equal( "27" );
            output_2.should.equal( "29" );
            output_3.should.equal( "25" );
            output_4.should.equal( "25" );
        });
    });

    describe("b-xor ->", function() {
        it("should subtract bit if it's already set or add it if it's not", function() {
            var test_template = twig({data: '{{ a b-xor b }}'})
                , output_0 = test_template.render({a: 25, b: 1})
                , output_1 = test_template.render({a: 25, b: 2})
                , output_2 = test_template.render({a: 25, b: 4})
                , output_3 = test_template.render({a: 25, b: 8})
                , output_4 = test_template.render({a: 25, b: 16});

            output_0.should.equal( "24" );
            output_1.should.equal( "27" );
            output_2.should.equal( "29" );
            output_3.should.equal( "17" );
            output_4.should.equal( "9" );
        });
    });
});
