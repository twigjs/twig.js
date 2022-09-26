const {factory} = require('..');

let twig;

describe('Twig.js Blocks ->', function () {
    beforeEach(function () {
        twig = factory().twig;
    });

    // Test loading a template from a remote endpoint
    it('should load a parent template and render the default values', function () {
        twig({
            id: 'remote-no-extends',
            path: 'test/templates/template.twig',
            async: false
        });

        // Load the template
        twig({ref: 'remote-no-extends'}).render({ }).should.equal('Default Title - body');
    });

    // Test endblock extended syntax
    it('should understand {% endblock title %} syntax', function () {
        twig({
            id: 'endblock-extended-syntax',
            path: 'test/templates/blocks-extended-syntax.twig',
            async: false
        });

        // Load the template
        twig({ref: 'endblock-extended-syntax'}).render({ }).should.equal('This is the only thing.');
    });

    it('should load a child template and replace the parent block\'s content', function (done) {
        // Test loading a template from a remote endpoint
        twig({
            id: 'child-extends',
            path: 'test/templates/child.twig',

            load(template) {
                template.render({base: 'template.twig'}).should.equal('Other Title - child');
                done();
            }
        });
    });

    it('should have access to a parent block content', function (done) {
        // Test loading a template from a remote endpoint
        twig({
            id: 'child-parent',
            path: 'test/templates/child-parent.twig',

            load(template) {
                template.render({
                    base: 'template.twig',
                    inner: ':value'
                }).should.equal('Other Title - body:value:child');
                done();
            }
        });
    });

    it('should render nested blocks', function (done) {
        // Test rendering of blocks within blocks
        twig({
            id: 'blocks-nested',
            path: 'test/templates/blocks-nested.twig',

            load(template) {
                template.render({ }).should.equal('parent:child');
                done();
            }
        });
    });

    it('should render extended nested blocks', function (done) {
        // Test rendering of blocks within blocks
        twig({
            id: 'child-blocks-nested',
            path: 'test/templates/child-blocks-nested.twig',

            load(template) {
                template.render({base: 'template.twig'}).should.equal('Default Title - parent:child');
                done();
            }
        });
    });

    it('should be able to extend to a absolute template path', function (done) {
        // Test loading a template from a remote endpoint
        twig({
            base: 'test/templates',
            path: 'test/templates/a/child.twig',

            load(template) {
                template.render({base: 'b/template.twig'}).should.equal('Other Title - child');
                done();
            }
        });
    });

    it('should extends blocks inline', function () {
        twig({
            id: 'inline-parent-template',
            data: 'Title: {% block title %}parent{% endblock %}'
        });

        twig({
            allowInlineIncludes: true,
            data: '{% extends "inline-parent-template" %}{% block title %}child{% endblock %}'
        }).render().should.equal('Title: child');
    });

    it('should override blocks in loop when extending', function () {
        twig({
            id: 'block-loop.twig',
            data: '{% for label in ["foo", "bar", "baz"] %}<{% block content %}base-{{ label }}-{{ loop.index }}{% endblock %}>{% endfor %}'
        });

        twig({
            allowInlineIncludes: true,
            data: '{% extends "block-loop.twig" %}{% block content %}overriding-{{ parent() }}-at-index-{{ loop.index0 }}{% endblock %}'
        }).render().should.equal('<overriding-base-foo-1-at-index-0><overriding-base-bar-2-at-index-1><overriding-base-baz-3-at-index-2>');
    });

    describe('"use" tag ->', function () {
        it('should include blocks from another template for horizontal reuse', function (done) {
            // Test horizontal reuse
            twig({
                id: 'use',
                path: 'test/templates/use.twig',

                load(template) {
                    // Load the template
                    template.render({place: 'diner'}).should.equal('Coming soon to a diner near you!');
                    done();
                }
            });
        });

        it('should allow overriding of included blocks', function (done) {
            // Test overriding of included blocks
            twig({
                id: 'use-override-block',
                path: 'test/templates/use-override-block.twig',

                load(template) {
                    // Load the template
                    template.render({place: 'diner'}).should.equal('Sorry, can\'t come to a diner today.');
                    done();
                }
            });
        });

        it('should allow overriding of included nested blocks', function (done) {
            // Test overriding of included blocks
            twig({
                id: 'use-override-nested-block',
                path: 'test/templates/use-override-nested-block.twig',

                load(template) {
                    // Load the template
                    template.render().should.equal('parent:new-child1:new-child2');
                    done();
                }
            });
        });

        it('should allow "parent()" call when importing blocks', function () {
            twig({
                id: 'blocks.twig',
                data: '{% block content "blocks.twig" %}'
            });
            twig({
                id: 'base.twig',
                data: '{% use "blocks.twig" %}{% block content %}base.twig > {{ parent() }}{% endblock %}'
            });

            twig({
                allowInlineIncludes: true,
                data: '{% extends "base.twig" %}{% block content %}main.twig > {{ parent() }}{% endblock %}'
            }).render().should.equal('main.twig > base.twig > blocks.twig');
        });

        it('should allow "use" in template with "extends"', function () {
            twig({
                id: 'blocks.twig',
                data: '{% block content "blocks.twig" %}'
            });
            twig({
                id: 'base.twig',
                data: '<{% block content %}base.twig{% endblock %}><{% block footer %}footer{% endblock %}>'
            });

            twig({
                allowInlineIncludes: true,
                data: '{% extends "base.twig" %}{% use "blocks.twig" %}{% block content %}main.twig - {{ parent() }}{% endblock %}'
            }).render().should.equal('<main.twig - blocks.twig><footer>');
        });

        it('should allow "use" in template with "extends" and nested blocks', function () {
            twig({
                id: 'blocks.twig',
                data: '{% block sidebar %}blocks-sidebar{% endblock %}{% block header %}blocks-header{% endblock %}{% block content %}blocks-content{% endblock %}{% block footer %}blocks-footer{% endblock %}{% block masthead %}<blocks-masthead>{% endblock %}'
            });
            twig({
                id: 'base.twig',
                data: '<{% block sidebar %}base-sidebar{% endblock %}><{% block header %}base-header{% endblock %}><{% block content %}base-content{% endblock %}><{% block footer "base-footer" %}>'
            });

            twig({
                allowInlineIncludes: true,
                data: '{% extends "base.twig" %}{% use "blocks.twig" %}{% block sidebar %}main-sidebar{% endblock %}{% block header %}main-header - {{ parent() }}{% endblock %}{% block footer %}main-footer{% block masthead %}{{ parent() }}{% endblock %}{% endblock %}'
            }).render().should.equal('<main-sidebar><main-header - blocks-header><blocks-content><main-footer<blocks-masthead>>');
        });
    });

    describe('block function ->', function () {
        it('should render block content from an included block', function (done) {
            twig({
                path: 'test/templates/block-function.twig',

                load(template) {
                    template.render({
                        base: 'block-function-parent.twig',
                        val: 'abcd'
                    })
                        .should.equal('Child content = abcd / Result: Child content = abcd');

                    done();
                }
            });
        });

        it('should render block content from a parent block', function (done) {
            twig({
                path: 'test/templates/block-parent.twig',

                load(template) {
                    template.render({
                        base: 'block-function-parent.twig'
                    })
                        .should.equal('parent block / Result: parent block');

                    done();
                }
            });
        });

        it('should render block content with outer context', function (done) {
            twig({
                path: 'test/templates/block-outer-context.twig',

                load(template) {
                    template.render({
                        base: 'block-outer-context.twig',
                        items: ['twig', 'js', 'rocks']
                    })
                        .should.equal('Hello twig!Hello js!Hello rocks!twigjsrocks');

                    done();
                }
            });
        });

        it('should respect changes of the context made before calling the function', function () {
            twig({
                data: '{% set foo = "original" %}{% block test %}{{ foo }}{% endblock %} {% set foo = "changed" %}{{ block("test") }}'
            }).render()
                .should.equal('original changed');
        });
    });

    describe('block shorthand ->', function () {
        it('should render block content using shorthand syntax', function () {
            twig({
                data: '{% set prefix = "shorthand" %}{% block title (prefix ~ " - " ~ block_value)|title %}'
            }).render(
                /* eslint-disable-next-line camelcase */
                {block_value: 'test succeeded'}
            ).should.equal('Shorthand - Test Succeeded');
        });
        it('should overload blocks from an extended template using shorthand syntax', function () {
            twig({
                data: '{% block title %}Default Title{% endblock %} - {% block body %}body{{inner}}{% endblock %}',
                id: 'template.twig'
            });
            twig({
                allowInlineIncludes: true,
                data: '{% extends base %}{% block title %}Other Title{% endblock %}{% block body %}child{% endblock %}',
                id: 'child.twig'
            });

            twig({
                allowInlineIncludes: true,
                data: '{% extends "child.twig" %}{% block title "New Title" %}{% block body "new body uses the " ~ base ~ " template" %}'
            }).render({
                base: 'template.twig'
            }).should.equal('New Title - new body uses the template.twig template');
        });
    });
});
