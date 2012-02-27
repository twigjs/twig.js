var Twig   = require("../twig"),
    twig   = Twig.twig,
    should = require('should');

describe("Twig.js Functions ->", function() {
    // Add some test functions to work with
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
    
    describe("range ->", function() { 
        it("should work over a range of numbers", function() {
            twig({data: '{% for i in range(0, 3) %}{{ i }},{% endfor %}'}).render().should.equal("0,1,2,3,");
        });
        it("should work over a range of letters", function() {
            twig({data: '{% for i in range("a", "c") %}{{ i }},{% endfor %}'}).render().should.equal("a,b,c,");
        });
        it("should work with an interval", function() {
            twig({data: '{% for i in range(1, 15, 3) %}{{ i }},{% endfor %}'}).render().should.equal("1,4,7,10,13,");
        });
    });
    describe("cycle ->", function() { 
        it("should cycle through an array of values", function() {
            twig({data: '{% for i in range(0, 3) %}{{ cycle(["odd", "even"], i) }};{% endfor %}'}).render().should.equal("odd;even;odd;even;");
        });
    });
    describe("date ->", function() { 
        function pad(num) {return num<10?'0'+num:num;}
        function stringDate(date){
            return pad(date.getDate()) + "/" + pad(date.getMonth()+1) + "/" + date.getFullYear()
                                     + " @ " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
        }
        
        it("should understand timestamps", function() {
            var date = new Date(946706400 * 1000);
            twig({data: '{{ date(946706400)|date("d/m/Y @ H:i:s") }}'}).render().should.equal(stringDate(date));
        });
        it("should understand relative dates", function() {
            twig({data: '{{ date("+1 day") > date() }}'}).render().should.equal("true");
            twig({data: '{{ date("-1 day") > date() }}'}).render().should.equal("false");
        });
        it("should understand exact dates", function() {
            var date = new Date("June 20, 2010 UTC");
            
            twig({data: '{{ date("June 20, 2010 UTC")|date("d/m/Y @ H:i:s") }}'}).render().should.equal(stringDate(date));
        });
    });
});
