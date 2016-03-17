var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Namespaces ->", function() {
    it("should support namespaces defined with ::", function(done) {
    	twig({
			namespaces: { 'test': 'test/templates/namespace/' },
			path: 'test/templates/namespace_::.twig',
			load: function(template) {
				// Render the template
				template.render({
				    test: "yes",
				    flag: true
				}).should.equal("namespace");

				done();
            }
    	});        
    });

    it("should support namespaces defined with @", function(done) {
    	twig({
			namespaces: { 'test': 'test/templates/namespace/' },
			path: 'test/templates/namespace_@.twig',
			load: function(template) {
				// Render the template
				template.render({
				    test: "yes",
				    flag: true
				}).should.equal("namespace");

				done();
            }
    	});        
    });


});