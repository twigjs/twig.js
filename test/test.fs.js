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


describe("Twig.js Blocks ->", function() {
    // Test loading a template from a remote endpoint
    it("should load a parent template and render the default values", function() {
        twig({
            id:   'remote-no-extends',
            path: 'test/templates/template.twig',
            async: false
        });
    
        // Load the template
        twig({ref: 'remote-no-extends'}).render({ }).should.equal( "Default Title - body" );
    });
    
    it("should load a child template and replace the parent block's content", function(done) {
        // Test loading a template from a remote endpoint
        twig({
            id:   'child-extends',
            path: 'test/templates/child.twig',
                    
            load: function(template) {
                template.render({ base: "template.twig" }).should.equal( "Other Title - child" );
                done();
            }
        });
    });
    
    it("should have access to a parent block content", function(done) {
        // Test loading a template from a remote endpoint
        twig({
            id:   'child-parent',
            path: 'test/templates/child-parent.twig',
                    
            load: function(template) {
                template.render({ 
                    base: "template.twig", 
                    inner: ':value' 
                }).should.equal( "Other Title - body:value:child" );
                done();
            }
        });
    });
    
    
    it("should include blocks from another template for horizontal reuse", function(done) {
        // Test horizontal reuse
        twig({
            id:   'use',
            path: 'test/templates/use.twig',
                    
            load: function(template) {
                // Load the template
                template.render({ place: "diner" }).should.equal("Coming soon to a diner near you!" );
                done();
            }
        });
    });
    
    it("should make the contents of blocks available after they're rendered", function(done) {
        // Test rendering and loading one block
        twig({
            id:   'blocks',
            path: 'test/templates/blocks.twig',
        
            load: function(template) {
                // Render the template with the blocks parameter
                template.render({ place: "block" }, {output: 'blocks'}).msg.should.equal("Coming soon to a block near you!" );
                done();
            }
        });
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
    
    /* it("should load an included template with distinct additional context", function() {
        twig({
            id:   'include-distinct',
            path: 'test/templates/include-distinct.twig',
            async: false
        });
    
        // Load the template
        twig({ref: 'include-distinct'}).render({test: 'tst'}).should.equal( "BeforeTest template = tst\n\nAfter" );
    }); */
});


