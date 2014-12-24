var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Expressions ->", function() {
    var numeric_test_data = [
        {a: 10, b: 15},
        {a: 0, b: 0},
        {a: 1, b: 11},
        {a: 10444, b: 0.5},
        {a: 1034, b: -53},
        {a: -56, b: -1.7},
        {a: 34, b: 0},
        {a: 14, b: 14}
    ];

    describe("Basic Operators ->", function() {

        var string_data = [
            {a: 'test', b: 'string'},
            {a: 'test', b: ''},
            {a: '', b: 'string'},
            {a: '', b: ''},
        ];

        it("should parse parenthesis", function() {
            var test_template = twig({data: '{{ a - (b + c) }}'}),
                d = {a: 10, b: 4, c: 2},
                output = test_template.render(d);

            output.should.equal( (d.a - (d.b + d.c)).toString() );
        });

        it("should parse nested parenthesis", function() {
            var test_template = twig({data: '{{ a - ((b) + (1 + c)) }}'}),
                d = {a: 10, b: 4, c: 2},
                output = test_template.render(d);

            output.should.equal( (d.a - (d.b + 1 + d.c)).toString() );
        });

        it("should add numbers", function() {
            var test_template = twig({data: '{{ a + b }}'});
            numeric_test_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal( (pair.a + pair.b).toString() );
            });
        });
        it("should subtract numbers", function() {
            var test_template = twig({data: '{{ a - b }}'});
            numeric_test_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal( (pair.a - pair.b).toString() );
            });
        });
        it("should multiply numbers", function() {
            var test_template = twig({data: '{{ a * b }}'});
            numeric_test_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal((pair.a * pair.b).toString() );
            });
        });
        it("should divide numbers", function() {
            var test_template = twig({data: '{{ a / b }}'});
            numeric_test_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal((pair.a / pair.b).toString() );
            });
        });

        it("should divide numbers and return an int result", function() {
            var test_template = twig({data: '{{ a // b }}'});
            numeric_test_data.forEach(function(pair) {
                var output = test_template.render(pair);
                // Get expected truncated result
                var c = parseInt(pair.a/pair.b);

                output.should.equal(c.toString() );
            });
        });

        it("should raise numbers to a power", function() {
            var test_template = twig({data: '{{ a ** b }}'});
            var pow_test_data = [
                {a: 2, b:3, c: 8}
                , {a: 4, b:.5, c: 2}
                , {a: 5, b: 1, c: 5}
            ];
            pow_test_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal(pair.c.toString() );
            });
        });

        it("should concatanate values", function() {
            twig({data: '{{ "test" ~ a }}'}).render({a:1234}).should.equal("test1234");
            twig({data: '{{ a ~ "test" ~ a }}'}).render({a:1234}).should.equal("1234test1234");
            twig({data: '{{ "this" ~ "test" }}'}).render({a:1234}).should.equal("thistest");

            // Test numbers
            var test_template = twig({data: '{{ a ~ b }}'});
            numeric_test_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal(pair.a.toString() + pair.b.toString());
            });
            // Test strings
            test_template = twig({data: '{{ a ~ b }}'});
            string_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal(pair.a.toString() + pair.b.toString());
            });
        });
        it("should concatenate null and undefined values and not throw an exception", function() {
            twig({data: '{{ a ~ b }}'}).render().should.equal("");
            twig({data: '{{ a ~ b }}'}).render({
                a: null,
                b: null
            }).should.equal("");
        });
        it("should handle multiple chained operations", function() {
            var data = {a: 4.5, b: 10, c: 12,  d: -0.25, e:0, f: 65,  g: 21, h: -0.0002};
            var test_template = twig({data: '{{a/b+c*d-e+f/g*h}}'});
            var output = test_template.render(data);
            var expected = data.a / data.b + data.c * data.d - data.e + data.f / data.g * data.h;
            output.should.equal(expected.toString());
        });
        it("should handle parenthesis in chained operations", function() {
            var data = {a: 4.5, b: 10, c: 12,  d: -0.25, e:0, f: 65,  g: 21, h: -0.0002};
            var test_template = twig({data: '{{a   /(b+c )*d-(e+f)/(g*h)}}'});
            var output = test_template.render(data);
            var expected = data.a / (data.b + data.c) * data.d - (data.e + data.f) / (data.g * data.h);
            output.should.equal(expected.toString());
        });
    });

    describe("Comparison Operators ->", function() {
        var equality_data = [
            {a: true, b: "true"},
            {a: 1, b: "1"},
            {a: 1, b: 1},
            {a: 1, b: 1.0},
            {a: "str", b: "str"},
            {a: false, b: "false"}
        ];
        var boolean_data = [
            {a: true, b: true},
            {a: true, b: false},
            {a: false, b: true},
            {a: false, b: false}
        ];
        it("should support less then", function() {
            var test_template = twig({data: '{{ a < b }}'});
            numeric_test_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal((pair.a < pair.b).toString() );
            });
        });
        it("should support less then or equal", function() {
            var test_template = twig({data: '{{ a <= b }}'});
            numeric_test_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal((pair.a <= pair.b).toString() );
            });
        });
        it("should support greater then", function() {
            var test_template = twig({data: '{{ a > b }}'});
            numeric_test_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal((pair.a > pair.b).toString() );
            });
        });
        it("should support greater then or equal", function() {
            var test_template = twig({data: '{{ a >= b }}'});
            numeric_test_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal((pair.a >= pair.b).toString() );
            });
        });
        it("should support equals", function() {
            var test_template = twig({data: '{{ a == b }}'});
            boolean_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal((pair.a == pair.b).toString() );
            });
            equality_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal((pair.a == pair.b).toString() );
            });
        });
        it("should support not equals", function() {
            var test_template = twig({data: '{{ a != b }}'});
            boolean_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal((pair.a != pair.b).toString() );
            });
            equality_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal((pair.a != pair.b).toString() );
            });
        });
        it("should support boolean or", function() {
            var test_template = twig({data: '{{ a or b }}'});
            boolean_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal((pair.a || pair.b).toString() );
            });
        });
        it("should support boolean and", function() {
            var test_template = twig({data: '{{ a and b }}'});
            boolean_data.forEach(function(pair) {
                var output = test_template.render(pair);
                output.should.equal((pair.a && pair.b).toString() );
            });
        });
        it("should support boolean not", function() {
            var test_template = twig({data: '{{ not a }}'});
            test_template.render({a:false}).should.equal(true.toString());
            test_template.render({a:true}).should.equal(false.toString());
        });
    });

    describe("Other Operators ->", function() {
        it("should support the ternary operator", function() {
            var test_template = twig({data: '{{ a ? b:c }}'})
                , output_t = test_template.render({a: true,  b: "one", c: "two"})
                , output_f = test_template.render({a: false, b: "one", c: "two"});

            output_t.should.equal( "one" );
            output_f.should.equal( "two" );
        });
        it("should support the ternary operator with objects in it", function() {
            var test_template2 = twig({data: '{{ (a ? {"a":e+f}:{"a":1}).a }}'})
                , output2 = test_template2.render({a: true, b: false, e: 1, f: 2});

            output2.should.equal( "3" );
        });
        it("should support the ternary operator inside objects", function() {
            var test_template2 = twig({data: '{{ {"b" : a or b ? {"a":e+f}:{"a":1} }.b.a }}'})
                , output2 = test_template2.render({a: false, b: false, e: 1, f: 2});

            output2.should.equal( "1" );
        });

        it("should support in/containment functionality for arrays", function() {
            var test_template = twig({data: '{{ "a" in ["a", "b", "c"] }}'});
            test_template.render().should.equal(true.toString());

            var test_template = twig({data: '{{ "d" in ["a", "b", "c"] }}'});
            test_template.render().should.equal(false.toString());
        });

        it("should support not in/containment functionality for arrays", function() {
            var test_template = twig({data: '{{ "a" not in ["a", "b", "c"] }}'});
            test_template.render().should.equal(false.toString());

            var test_template = twig({data: '{{ "d" not in ["a", "b", "c"] }}'});
            test_template.render().should.equal(true.toString());
        });


        it("should support in/containment functionality for strings", function() {
            var test_template = twig({data: '{{ "at" in "hat" }}'});
            test_template.render().should.equal(true.toString());

            var test_template = twig({data: '{{ "d" in "not" }}'});
            test_template.render().should.equal(false.toString());
        });

        it("should support not in/containment functionality for strings", function() {
            var test_template = twig({data: '{{ "at" not in "hat" }}'});
            test_template.render().should.equal(false.toString());

            var test_template = twig({data: '{{ "d" not in "not" }}'});
            test_template.render().should.equal(true.toString());
        });

        it("should support in/containment functionality for objects", function() {
            var test_template = twig({data: '{{ "value" in {"key" : "value", "2": "other"} }}'});
            test_template.render().should.equal(true.toString());

            var test_template = twig({data: '{{ "d" in {"key_a" : "no"} }}'});
            test_template.render().should.equal(false.toString());
        });

        it("should support not in/containment functionality for objects", function() {
            var test_template = twig({data: '{{ "value" not in {"key" : "value", "2": "other"} }}'});
            test_template.render().should.equal(false.toString());

            var test_template = twig({data: '{{ "d" not in {"key_a" : "no"} }}'});
            test_template.render().should.equal(true.toString());
        });
    });
});
