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
});