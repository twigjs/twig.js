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

// Test horizontal reuse
twig({
    id:   'use',
    href: 'templates/use.twig',
    async: true,

    load: function(template) {
        test("use", function() {
            // Load the template
            equal( template.render({ place: "diner" }), "Coming soon to a diner near you!" );
        });
    }
});

// Test rendering and loading one block
twig({
    id:   'blocks',
    href: 'templates/blocks.twig',
    async: true,
    
    // Set output of template to blocks
    output: 'blocks',

    load: function(template) {
        test("blocks", function() {
            // Load the template with the blocks parameter
            equal( template.render({ place: "block" }).msg, "Coming soon to a block near you!" );
        });
    }
});

