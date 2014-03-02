var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Browser Loading ->", function() {
    it("Should load a template synchronously", function() {

        twig({
            id:   'remote-browser',
            href: 'templates/test.twig',
            async: false
        });

        // Verify the template was loaded
        twig({ref: 'remote-browser'}).render({
            test: "reload",
            flag: false
        }).should.equal("Test template = reload\n\n");
    });
    
    it("Should trigger the error callback for a missing template", function(done) {

        twig({
            href: 'templates/notthere.twig',
            load: function(template) {
                // failure
                throw "Template didn't trigger error callback";
            },
            error: function(err) {
                console.log(err);
                done();
            }
        });
    });

    it("Should load a template asynchronously", function(done) {

        // Test loading a template from a remote endpoint asynchronously
        twig({
            id:   'remote-browser-async',
            href: 'templates/test.twig',

            // Callback after template loads
            load: function(template) {
                template.render({
                    test: "yes",
                    flag: true
                }).should.equal("Test template = yes\n\nFlag set!");

                // Verify the template was saved
                twig({ref: 'remote-browser-async'}).render({
                    test: "reload",
                    flag: false
                }).should.equal("Test template = reload\n\n");

                done();
            }
        });
    });

    it("should be able to extend to a relative tempalte path", function(done) {
        // Test loading a template from a remote endpoint
        twig({
            href: 'templates/child.twig',

            load: function(template) {
                template.render({ base: "template.twig" }).should.equal( "Other Title - child" );
                done();
            }
        });
    });

    it("should be able to extend to a absolute tempalte path", function(done) {
        // Test loading a template from a remote endpoint
        twig({
            base: 'templates',
            href: 'templates/a/child.twig',

            load: function(template) {
                template.render({ base: "b/template.twig" }).should.equal( "Other Title - child" );
                done();
            }
        });
    });
});


