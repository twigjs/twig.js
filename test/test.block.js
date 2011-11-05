// Twig.debug = true;

module("Blocks");

// Test loading a template from a remote endpoint
test("no-extends", function() {
    twig({
        id:   'remote',
        href: 'templates/template.twig',
        async: false
    });

    // Load the template
    equal( twig({ref: 'remote'}).render({ }), "Default Title - body" );
});

// Test loading a template from a remote endpoint
twig({
    id:   'child',
    href: 'templates/child.twig',
    async: true,

    load: function(template) {
        test("extends", function() {
            // Load the template
            equal( template.render({ base: "template.twig" }), "Other Title - child" );
        });
    }
});
