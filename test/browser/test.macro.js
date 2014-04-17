var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Macro ->", function() {
    // Test loading a template from a remote endpoint
    it("it should load macro", function() {
        twig({
            id:   'macro',
            href: 'templates/macro.twig',
            async: false
        });
        // Load the template
        twig({ref: 'macro'}).render({ }).should.equal( '' );
    });
    
    it("it should import macro", function() {
        twig({
            id:   'import-macro',
            href: 'templates/import.twig',
            async: false
        });
        // Load the template
        twig({ref: 'import-macro'}).render({ }).trim().should.equal( "Hello World" );
    });

    it("it should run macro with self reference", function() {
        twig({
            id:   'import-macro-self',
            href: 'templates/macro-self.twig',
            async: false
        });
        // Load the template
        twig({ref: 'import-macro-self'}).render({ }).trim().should.equal( '<p><input type="text" name="username" value="" size="20" /></p>' );
    });

    it("it should run wrapped macro with self reference", function() {
        twig({
            id:   'import-wrapped-macro-self',
            href: 'templates/macro-wrapped.twig',
            async: false
        });
        // Load the template
        twig({ref: 'import-wrapped-macro-self'}).render({ }).trim().should.equal( '<p><div class="field"><input type="text" name="username" value="" size="20" /></div></p>' );
    });

    it("it should run wrapped macro with context and self reference", function() {
        twig({
            id:   'import-macro-context-self',
            href: 'templates/macro-context.twig',
            async: false
        });
        // Load the template
        twig({ref: 'import-macro-context-self'}).render({ 'greetings': 'Howdy' }).trim().should.equal( 'Howdy Twigjs' );
    });

    it("it should run wrapped macro inside blocks", function() {
        twig({
            id:   'import-macro-inside-block',
            href: 'templates/macro-blocks.twig',
            async: false
        });
        // Load the template
        twig({ref: 'import-macro-inside-block'}).render({ }).trim().should.equal( 'Welcome <div class="name">Twig Js</div>' );
    });

    it("it should import selected macros from template", function() {
        twig({
            id:   'from-macro-import',
            href: 'templates/from.twig',
            async: false
        });
        // Load the template
        twig({ref: 'from-macro-import'}).render({ }).trim().should.equal( 'Twig.js<div class="field"><input type="text" name="text" value="" size="20" /></div><div class="field red"><input type="text" name="password" value="" size="20" /></div>' );
    });

});
