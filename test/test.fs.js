var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Loader ->", function() {
    it("should load a template from the filesystem asynchronously", function(done) {
        twig({
            id:   'fs-node-async',
            path: 'test/templates/test.twig',
            load: function(template) {
                // Render the template
                template.render({
                    test: "yes",
                    flag: true
                }).should.equal("Test template = yes\n\nFlag set!");

                done();
            }
        });
    });
    it("should load a template from the filesystem synchronously", function() {
        var template = twig({
            id:   'fs-node-sync',
            path: 'test/templates/test.twig',
            async: false
        });
        // Render the template
        template.render({
            test: "yes",
            flag: true
        }).should.equal("Test template = yes\n\nFlag set!");
    });
});


describe("Twig.js Include ->", function() {
    it("should load an included template with no context", function() {
        twig({
            id:   'include',
            path: 'test/templates/include.twig',
            async: false
        });

        // Load the template
        twig({ref: 'include'}).render({test: 'tst'}).should.equal( "BeforeTest template = tst\n\nAfter" );
    });

    it("should load an included template with additional context", function() {
        twig({
            id:   'include-with',
            path: 'test/templates/include-with.twig',
            async: false
        });

        // Load the template
        twig({ref: 'include-with'}).render({test: 'tst'}).should.equal( "template: before,tst-mid-template: after,tst" );
    });

    it("should load an included template with only additional context", function() {
        twig({
            id:   'include-only',
            path: 'test/templates/include-only.twig',
            async: false
        });

        // Load the template
        twig({ref: 'include-only'}).render({test: 'tst'}).should.equal( "template: before,-mid-template: after," );
    });
});


