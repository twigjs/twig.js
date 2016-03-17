var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Namespaces ->", function() {
    it("should support namespaces defined with ::", function(done) {
	twig({
			namespaces: { 'test': 'templates/namespaces/' },
			href: 'templates/namespaces_::.twig',
			load: function(template) {
				// Render the template
				template.render({
				    test: "yes",
				    flag: true
				}).should.equal("namespaces");

				done();
            }
    	});
    });

    it("should support namespaces defined with @", function(done) {
	twig({
			namespaces: { 'test': 'templates/namespaces/' },
			href: 'templates/namespaces_@.twig',
			load: function(template) {
				// Render the template
				template.render({
				    test: "yes",
				    flag: true
				}).should.equal("namespaces");

				done();
            }
    	});
    });
});
