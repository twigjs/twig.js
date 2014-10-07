var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Embed ->", function() {
    // Test loading a template from a remote endpoint
    it("it should load embed", function() {
        twig({
            id:   'embed',
            path: 'test/templates/embed-simple.twig',
            async: false
        });
        // Load the template
        twig({ref: 'embed'}).render({ }).trim().should.equal( 'START\nA\nnew headerbase footer\nB\nA\nbase headerbase footer:extended\nB\nA\nbase header:extendedbase footer:extended\nB\nEND' );
    });

});
