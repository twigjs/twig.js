var Twig   = require("../twig"),
    twig   = Twig.twig,
    should = require('should');

// twig({data: '{% if echo(true) or echo(false) %}yes{% endif %}'}).render().should.equal("yes");

describe("Twig.js Functions ->", function() {
	Twig.extendFunction("echo", function(a) {
	    return a;
	});
    Twig.extendFunction("square", function(a) {
        return a * a;
    });
    Twig.extendFunction("list", function() {
        return Array.prototype.slice.call(arguments);
    });
    it("should allow you to define a function", function() {
        twig({data: '{{ square(a) }}'}).render({a:4}).should.equal("16");
    });
    it("should chain with other expressions", function() {
        twig({data: '{{ square(a) + 4 }}'}).render({a:4}).should.equal("20");
    });
    it("should chain with filters", function() {
        twig({data: '{{ echo(a)|default("foo") }}'}).render().should.equal("foo");
    });
    it("should work in for loop expressions", function() {
        twig({data: '{% for i in list(1, 2, 3) %}{{ i }},{% endfor %}'}).render().should.equal("1,2,3,");
    });
    it("should be able to differentiate between a function and a variable", function() {
        twig({data: '{{ square ( square ) + square }}'}).render({square: 2}).should.equal("6");
    });
    it("should work with boolean operations", function() {
        twig({data: '{% if echo(true) or echo(false) %}yes{% endif %}'}).render().should.equal("yes");
    });
});
