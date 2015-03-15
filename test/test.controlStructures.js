var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Control Structures ->", function() {

    // {% if ... %}
    describe("if tag ->", function() {
        it("should parse the contents of the if block if the expression is true", function() {
            var test_template = twig({data: '{% if test %}true{% endif%}'});
            test_template.render({test: true}).should.equal("true" );
            test_template.render({test: false}).should.equal("" );
        });
        it("should call the if or else blocks based on the expression result", function() {
            var test_template = twig({data: '{% if test %}true{% endif%}'});
            test_template.render({test: true}).should.equal("true" );
            test_template.render({test: false}).should.equal("" );
        });
        it("should support elseif", function() {
            var test_template = twig({data: '{% if test %}1{% elseif other %}2{%else%}3{% endif%}'});
            test_template.render({test: true, other:false}).should.equal("1" );
            test_template.render({test: true, other:true}).should.equal("1" );
            test_template.render({test: false, other:true}).should.equal("2" );
            test_template.render({test: false, other:false}).should.equal("3" );
        });
        it("should be able to nest", function() {
            var test_template = twig({data: '{% if test %}{% if test2 %}true{% else %}false{% endif%}{% else %}not{% endif%}'});
            test_template.render({test: true, test2: true}).should.equal("true" );
            test_template.render({test: true, test2: false}).should.equal("false" );
            test_template.render({test: false, test2: true}).should.equal("not" );
            test_template.render({test: false, test2: false}).should.equal("not" );
        });
        it("should support newlines in if statement", function() {
            var test_template = twig({data: '{% if test or\r\nother %}true{% endif%}'});
            test_template.render({test: true, other: false}).should.equal("true" );
            test_template.render({test: false, other: false}).should.equal("" );
        });
    });

    // {% for ... %}
    describe("for tag ->", function() {
        it("should provide value only for array input", function() {
            var test_template = twig({data: '{% for value in test %}{{ value }}{% endfor %}'});
            test_template.render({test: [1,2,3,4]}).should.equal("1234" );
            test_template.render({test: []}).should.equal("" );
        });
        it("should provide both key and value for array input", function() {
            var test_template = twig({data: '{% for key,value in test %}{{key}}:{{ value }}{% endfor %}'});
            test_template.render({test: [1,2,3,4]}).should.equal("0:11:22:33:4" );
            test_template.render({test: []}).should.equal("" );
        });
        it("should provide value only for object input", function() {
            var test_template = twig({data: '{% for value in test %}{{ value }}{% endfor %}'});
            test_template.render({test: {one: 1, two: 2, three: 3}}).should.equal("123" );
            test_template.render({test: {}}).should.equal("" );
        });
        it("should provide both key and value for object input", function() {
            var test_template = twig({data: '{% for key, value in test %}{{key}}:{{ value }}{% endfor %}'});
            test_template.render({test: {one: 1, two: 2, three: 3}}).should.equal("one:1two:2three:3" );
            test_template.render({test: {}}).should.equal("" );
        });
        it("should support else if the input is empty", function() {
            var test_template = twig({data: '{% for key,value in test %}{{ value }}{% else %}else{% endfor %}'});
            test_template.render({test: [1,2,3,4]}).should.equal("1234" );
            test_template.render({test: []}).should.equal("else" );
        });
        it("should be able to nest", function() {
            var test_template = twig({data: '{% for key,list in test %}{% for val in list %}{{ val }}{%endfor %}.{% else %}else{% endfor %}'});
            test_template.render({test: [[1,2],[3,4],[5,6]]}).should.equal("12.34.56." );
            test_template.render({test: []}).should.equal("else" );
        });
        it("should have a loop context item available for arrays", function() {
            var test_template = twig({data: '{% for key,value in test %}{{ loop.index }}{% endfor %}'});
            test_template.render({test: [1,2,3,4]}).should.equal("1234" );
            test_template = twig({data: '{% for key,value in test %}{{ loop.index0 }}{% endfor %}'});
            test_template.render({test: [1,2,3,4]}).should.equal("0123" );
            test_template = twig({data: '{% for key,value in test %}{{ loop.revindex }}{% endfor %}'});
            test_template.render({test: [1,2,3,4]}).should.equal("4321" );
            test_template = twig({data: '{% for key,value in test %}{{ loop.revindex0 }}{% endfor %}'});
            test_template.render({test: [1,2,3,4]}).should.equal("3210" );
            test_template = twig({data: '{% for key,value in test %}{{ loop.length }}{% endfor %}'});
            test_template.render({test: [1,2,3,4]}).should.equal("4444" );
            test_template = twig({data: '{% for key,value in test %}{{ loop.first }}{% endfor %}'});
            test_template.render({test: [1,2,3,4]}).should.equal("truefalsefalsefalse" );
            test_template = twig({data: '{% for key,value in test %}{{ loop.last }}{% endfor %}'});
            test_template.render({test: [1,2,3,4]}).should.equal("falsefalsefalsetrue" );
        });
        it("should have a loop context item available for objects", function() {
            var test_template = twig({data: '{% for key,value in test %}{{ loop.index }}{% endfor %}'});
            test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("1234" );
            test_template = twig({data: '{% for key,value in test %}{{ loop.index0 }}{% endfor %}'});
            test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("0123" );
            test_template = twig({data: '{% for key,value in test %}{{ loop.revindex }}{% endfor %}'});
            test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("4321" );
            test_template = twig({data: '{% for key,value in test %}{{ loop.revindex0 }}{% endfor %}'});
            test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("3210" );
            test_template = twig({data: '{% for key,value in test %}{{ loop.length }}{% endfor %}'});
            test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("4444" );
            test_template = twig({data: '{% for key,value in test %}{{ loop.first }}{% endfor %}'});
            test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("truefalsefalsefalse" );
            test_template = twig({data: '{% for key,value in test %}{{ loop.last }}{% endfor %}'});
            test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("falsefalsefalsetrue" );
        });
        it("should have a loop context item available in child loops objects", function() {
            var test_template = twig({data: '{% for value in test %}{% for value in inner %}({{ loop.parent.loop.index }},{{ loop.index }}){% endfor %}{% endfor %}'});
            test_template.render({test: {a:1,b:2}, inner:[1,2,3]}).should.equal("(1,1)(1,2)(1,3)(2,1)(2,2)(2,3)");
        });

        it("should support conditionals on for loops", function() {
            var test_template = twig({data: '{% for value in test if false %}{{ value }},{% endfor %}'});
            test_template.render({test: ["one", "two", "a", "b", "other"]}).should.equal("");

            test_template = twig({data: '{% for value in test if true %}{{ value }}{% endfor %}'});
            test_template.render({test: ["a", "s", "d", "f"]}).should.equal("asdf");

            test_template = twig({data: '{% for value in test if value|length > 2 %}{{ value }},{% endfor %}'});
            test_template.render({test: ["one", "two", "a", "b", "other"]}).should.equal("one,two,other,");

            test_template = twig({data: '{% for key,item in test if item.show %}{{key}}:{{ item.value }},{% endfor %}'});
            test_template.render({test: {
                a: {show:true, value: "one"},
                b: {show:false, value: "two"},
                c: {show:true, value: "three"}}}).should.equal("a:one,c:three,");
        });

    });

    // {% set thing='value' %}
    describe("set tag ->", function() {
        it("should not set the global context from within a for loop", function() {
            var test_template = twig({data: '{% for value in [1] %}{% set foo="right" %}{% endfor %}{{ foo }}'});
            test_template.render().should.equal("");
        });

        it("should set the global context from within a for loop when the variable is initialized outside of the loop", function() {
            var test_template = twig({data: '{% set foo="wrong" %}{% for value in [1] %}{% set foo="right" %}{% endfor %}{{ foo }}'});
            test_template.render().should.equal("right");
        });

        it("should set the global context from within a nested for loop when the variable is initialized outside of the loop", function() {
            var test_template = twig({data: '{% set k = 0 %}{% for i in 0..2 %}{% for j in 0..2 %}{{ k }}{% set k = k + 1 %}{% endfor %}{% endfor %}'});
            test_template.render().should.equal("012345678");
        });
    });
});




