const Twig = require('../..').factory();

const {twig} = Twig;

describe('Twig.js Blocks ->', function () {
    it('Should load content in blocks that are not replaced', function () {
        twig({
            id: 'remote-no-extends',
            href: 'templates/template.twig',
            async: false
        });

        // Load the template
        twig({ref: 'remote-no-extends'}).render({ }).should.equal('Default Title - body');
    });

    it('Should replace block content from a child template', function (done) {
        // Test loading a template from a remote endpoint
        twig({
            id: 'child-extends',
            href: 'templates/child.twig',

            load(template) {
                template.render({base: 'template.twig'}).should.equal('Other Title - child');
                done();
            }
        });
    });

    it('Should support horizontal reuse of blocks', function (done) {
        // Test horizontal reuse
        twig({
            id: 'use',
            href: 'templates/use.twig',

            load(template) {
                template.render({place: 'user'}).should.equal('Coming soon to a user near you!');
                done();
            }
        });
    });

    it('should render nested blocks', function (done) {
        // Test rendering of blocks within blocks
        twig({
            id: 'blocks-nested',
            href: 'templates/blocks-nested.twig',

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
            href: 'templates/child-blocks-nested.twig',

            load(template) {
                template.render({base: 'template.twig'}).should.equal('Default Title - parent:child');
                done();
            }
        });
    });

    describe('block function ->', function () {
        it('should render block content from an included block', function (done) {
            twig({
                href: 'templates/block-function.twig',

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
                href: 'templates/block-parent.twig',

                load(template) {
                    template.render({
                        base: 'block-function-parent.twig'
                    })
                        .should.equal('parent block / Result: parent block');

                    done();
                }
            });
        });
    });

    describe('block shorthand ->', function () {
        it('should render block content using shorthand syntax', function () {
            twig({
                data: '{% set prefix = "shorthand" %}{% block title (prefix ~ " - " ~ blockValue)|title %}'
            })
                .render({blockValue: 'test succeeded'})
                .should.equal('Shorthand - Test Succeeded');
        });
        it('should overload blocks from an extended template using shorthand syntax', function () {
            twig({
                allowInlineIncludes: true,
                data: '{% extends "child-extends" %}{% block title "New Title" %}{% block body "new body uses the " ~ base ~ " template" %}'
            })
                .render({base: 'template.twig'})
                .should.equal('New Title - new body uses the template.twig template');
        });
    });
});
