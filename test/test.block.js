const {factory} = require('../twig');

let twig;

describe('Twig.js Blocks ->', function () {
    beforeEach(function () {
        twig = factory().twig;
    });

    // Test loading a template from a remote endpoint
    it('should load a parent template and render the default values', async function () {
        await twig({
            id: 'remote-no-extends',
            path: 'test/templates/template.twig'
        });

        // Load the template
        const testTemplate = twig({ref: 'remote-no-extends'});
        return testTemplate.render({}).should.be.fulfilledWith('Default Title - body');
    });

    // Test endblock extended syntax
    it('should understand {% endblock title %} syntax', async function () {
        await twig({
            id: 'endblock-extended-syntax',
            path: 'test/templates/blocks-extended-syntax.twig'
        });

        // Load the template
        const testTemplate = twig({ref: 'endblock-extended-syntax'});
        return testTemplate.render({}).should.be.fulfilledWith('This is the only thing.');
    });

    it('should load a child template and replace the parent block\'s content', async function () {
        // Test loading a template from a remote endpoint
        const testTemplate = await twig({
            id: 'child-extends',
            path: 'test/templates/child.twig'
        });
        return testTemplate.render({base: 'template.twig'}).should.be.fulfilledWith('Other Title - child');
    });

    it('should have access to a parent block content', async function () {
        // Test loading a template from a remote endpoint
        const testTemplate = await twig({
            id: 'child-parent',
            path: 'test/templates/child-parent.twig'
        });

        return testTemplate.render({
            base: 'template.twig',
            inner: ':value'
        }).should.be.fulfilledWith('Other Title - body:value:child');
    });

    it('should render nested blocks', async function () {
        // Test rendering of blocks within blocks
        const testTemplate = await twig({
            id: 'blocks-nested',
            path: 'test/templates/blocks-nested.twig'
        });

        return testTemplate.render({ }).should.be.fulfilledWith('parent:child');
    });

    it('should render extended nested blocks', async function () {
        // Test rendering of blocks within blocks
        const testTemplate = await twig({
            id: 'child-blocks-nested',
            path: 'test/templates/child-blocks-nested.twig'
        });

        return testTemplate.render({
            base: 'template.twig'
        }).should.be.fulfilledWith('Default Title - parent:child');
    });

    it('should be able to extend to a absolute template path', async function () {
        // Test loading a template from a remote endpoint
        const testTemplate = await twig({
            base: 'test/templates',
            path: 'test/templates/a/child.twig'
        });

        return testTemplate.render({base: 'b/template.twig'}).should.be.fulfilledWith('Other Title - child');
    });

    it('should extends blocks inline', async function () {
        twig({
            id: 'inline-parent-template',
            data: 'Title: {% block title %}parent{% endblock %}'
        });

        const testTemplate = await twig({
            allowInlineIncludes: true,
            data: '{% extends "inline-parent-template" %}{% block title %}child{% endblock %}'
        });

        return testTemplate.render().should.be.fulfilledWith('Title: child');
    });

    it('should override blocks in loop when extending', async function () {
        twig({
            id: 'block-loop.twig',
            data: '{% for label in ["foo", "bar", "baz"] %}<{% block content %}base-{{ label }}-{{ loop.index }}{% endblock %}>{% endfor %}'
        });

        const testTemplate = await twig({
            allowInlineIncludes: true,
            data: '{% extends "block-loop.twig" %}{% block content %}overriding-{{ parent() }}-at-index-{{ loop.index0 }}{% endblock %}'
        });

        return testTemplate.render().should.be.fulfilledWith('<overriding-base-foo-1-at-index-0><overriding-base-bar-2-at-index-1><overriding-base-baz-3-at-index-2>');
    });

    describe('"use" tag ->', function () {
        it('should include blocks from another template for horizontal reuse', async function () {
            // Test horizontal reuse
            const testTemplate = await twig({
                id: 'use',
                path: 'test/templates/use.twig'
            });

            return testTemplate.render({place: 'diner'}).should.be.fulfilledWith('Coming soon to a diner near you!');
        });

        it('should allow overriding of included blocks', async function () {
            // Test overriding of included blocks
            const testTemplate = await twig({
                id: 'use-override-block',
                path: 'test/templates/use-override-block.twig'
            });

            return testTemplate.render({place: 'diner'}).should.be.fulfilledWith('Sorry, can\'t come to a diner today.');
        });

        it('should allow overriding of included nested blocks', async function () {
            // Test overriding of included blocks
            const testTemplate = await twig({
                id: 'use-override-nested-block',
                path: 'test/templates/use-override-nested-block.twig'
            });

            return testTemplate.render().should.be.fulfilledWith('parent:new-child1:new-child2');
        });

        it('should allow "parent()" call when importing blocks', async function () {
            twig({
                id: 'blocks.twig',
                data: '{% block content "blocks.twig" %}'
            });
            twig({
                id: 'base.twig',
                data: '{% use "blocks.twig" %}{% block content %}base.twig > {{ parent() }}{% endblock %}'
            });

            const testTemplate = await twig({
                allowInlineIncludes: true,
                data: '{% extends "base.twig" %}{% block content %}main.twig > {{ parent() }}{% endblock %}'
            });

            return testTemplate.render().should.be.fulfilledWith('main.twig > base.twig > blocks.twig');
        });

        it('should allow "use" in template with "extends"', async function () {
            twig({
                id: 'blocks.twig',
                data: '{% block content "blocks.twig" %}'
            });
            twig({
                id: 'base.twig',
                data: '<{% block content %}base.twig{% endblock %}><{% block footer %}footer{% endblock %}>'
            });

            const testTemplate = await twig({
                allowInlineIncludes: true,
                data: '{% extends "base.twig" %}{% use "blocks.twig" %}{% block content %}main.twig - {{ parent() }}{% endblock %}'
            });

            return testTemplate.render().should.be.fulfilledWith('<main.twig - blocks.twig><footer>');
        });

        it('should allow "use" in template with "extends" and nested blocks', async function () {
            twig({
                id: 'blocks.twig',
                data: '{% block sidebar %}blocks-sidebar{% endblock %}{% block header %}blocks-header{% endblock %}{% block content %}blocks-content{% endblock %}{% block footer %}blocks-footer{% endblock %}{% block masthead %}<blocks-masthead>{% endblock %}'
            });
            twig({
                id: 'base.twig',
                data: '<{% block sidebar %}base-sidebar{% endblock %}><{% block header %}base-header{% endblock %}><{% block content %}base-content{% endblock %}><{% block footer "base-footer" %}>'
            });

            const testTemplate = await twig({
                allowInlineIncludes: true,
                data: '{% extends "base.twig" %}{% use "blocks.twig" %}{% block sidebar %}main-sidebar{% endblock %}{% block header %}main-header - {{ parent() }}{% endblock %}{% block footer %}main-footer{% block masthead %}{{ parent() }}{% endblock %}{% endblock %}'
            });

            return testTemplate.render().should.be.fulfilledWith('<main-sidebar><main-header - blocks-header><blocks-content><main-footer<blocks-masthead>>');
        });
    });

    describe('block function ->', function () {
        it('should render block content from an included block', async function () {
            const testTemplate = await twig({
                path: 'test/templates/block-function.twig'
            });

            return testTemplate.render({
                base: 'block-function-parent.twig',
                val: 'abcd'
            }).should.be.fulfilledWith('Child content = abcd / Result: Child content = abcd');
        });

        it('should render block content from a parent block', async function () {
            const testTemplate = await twig({
                path: 'test/templates/block-parent.twig'
            });

            return testTemplate.render({
                base: 'block-function-parent.twig'
            }).should.be.fulfilledWith('parent block / Result: parent block');
        });

        it('should render block content with outer context', async function () {
            const testTemplate = await twig({
                path: 'test/templates/block-outer-context.twig'
            });

            return testTemplate.render({
                base: 'block-outer-context.twig',
                items: ['twig', 'js', 'rocks']
            }).should.be.fulfilledWith('Hello twig!Hello js!Hello rocks!twigjsrocks');
        });

        it('should respect changes of the context made before calling the function', async function () {
            const testTemplate = await twig({
                data: '{% set foo = "original" %}{% block test %}{{ foo }}{% endblock %} {% set foo = "changed" %}{{ block("test") }}'
            });

            return testTemplate.render().should.be.fulfilledWith('original changed');
        });
    });

    describe('block shorthand ->', function () {
        it('should render block content using shorthand syntax', async function () {
            const testTemplate = await twig({
                data: '{% set prefix = "shorthand" %}{% block title (prefix ~ " - " ~ blockValue)|title %}'
            });

            return testTemplate.render({
                blockValue: 'test succeeded'
            }).should.be.fulfilledWith('Shorthand - Test Succeeded');
        });
        it('should overload blocks from an extended template using shorthand syntax', async function () {
            twig({
                data: '{% block title %}Default Title{% endblock %} - {% block body %}body{{inner}}{% endblock %}',
                id: 'template.twig'
            });
            twig({
                allowInlineIncludes: true,
                data: '{% extends base %}{% block title %}Other Title{% endblock %}{% block body %}child{% endblock %}',
                id: 'child.twig'
            });

            const testTemplate = twig({
                allowInlineIncludes: true,
                data: '{% extends "child.twig" %}{% block title "New Title" %}{% block body "new body uses the " ~ base ~ " template" %}'
            });

            return testTemplate.render({
                base: 'template.twig'
            }).should.be.fulfilledWith('New Title - new body uses the template.twig template');
        });
    });
});
