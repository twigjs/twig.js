const Twig = require('../twig').factory();

const {twig} = Twig;

describe('Twig.js Macro ->', function () {
    // Test loading a template from a remote endpoint
    it('it should load macro', async function () {
        await twig({
            id: 'macro',
            path: 'test/templates/macro.twig'
        });
        // Load the template
        const testTemplate = twig({ref: 'macro'});
        const result = await testTemplate.render({ });
        result.should.equal('');
    });

    it('it should import macro', async function () {
        await twig({
            id: 'import-macro',
            path: 'test/templates/import.twig'
        });
        // Load the template
        const testTemplate = twig({ref: 'import-macro'});
        const result = await testTemplate.render({ });
        result.trim().should.equal('Hello World');
    });

    it('it should run macro with self reference', async function () {
        await twig({
            id: 'import-macro-self',
            path: 'test/templates/macro-self.twig'
        });
        // Load the template
        const testTemplate = twig({ref: 'import-macro-self'});
        const result = await testTemplate.render({ });
        result.trim().should.equal('<p><input type="text" name="username" value="" size="20" /></p>');
    });

    it('it should run wrapped macro with self reference', async function () {
        await twig({
            id: 'import-wrapped-macro-self',
            path: 'test/templates/macro-wrapped.twig'
        });
        // Load the template
        const testTemplate = twig({ref: 'import-wrapped-macro-self'});
        const result = await testTemplate.render({ });
        result.trim().should.equal('<p><div class="field"><input type="text" name="username" value="" size="20" /></div></p>');
    });

    it('it should run wrapped macro with context and self reference', async function () {
        await twig({
            id: 'import-macro-context-self',
            path: 'test/templates/macro-context.twig'
        });
        // Load the template
        const testTemplate = twig({ref: 'import-macro-context-self'});
        const result = await testTemplate.render({greetings: 'Howdy'});
        result.trim().should.equal('Howdy Twigjs');
    });

    it('it should run wrapped macro with default value for a parameter and self reference', async function () {
        await twig({
            id: 'import-macro-defaults-self',
            path: 'test/templates/macro-defaults.twig'
        });
        // Load the template
        const testTemplate = twig({ref: 'import-macro-defaults-self'});
        const result = await testTemplate.render({ });
        result.trim().should.equal('Howdy Twigjs');
    });

    it('it should run wrapped macro inside blocks', async function () {
        await twig({
            id: 'import-macro-inside-block',
            path: 'test/templates/macro-blocks.twig'
        });
        // Load the template
        const testTemplate = twig({ref: 'import-macro-inside-block'});
        const result = await testTemplate.render({ });
        result.trim().should.equal('Welcome <div class="name">Twig Js</div>');
    });

    it('it should import selected macros from template', async function () {
        await twig({
            id: 'from-macro-import',
            path: 'test/templates/from.twig'
        });
        // Load the template
        const testTemplate = twig({ref: 'from-macro-import'});
        const result = await testTemplate.render({ });
        result.trim().should.equal('Hello Twig.js<div class="field"><input type="text" name="text" value="" size="20" /></div><div class="field red"><input type="text" name="password" value="" size="20" /></div>');
    });

    it('should support inline includes by ID', async function () {
        await twig({
            id: 'hello',
            data: '{% macro echo(name) %}Hello {{ name }}{% endmacro %}'
        });

        const testTemplate = twig({
            allowInlineIncludes: true,
            data: 'template with {% from "hello" import echo %}{{ echo("Twig.js") }}'
        });
        const output = await testTemplate.render();

        output.should.equal('template with Hello Twig.js');
    });
});
