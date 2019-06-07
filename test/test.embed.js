const awaity = require('awaity');
const Twig = require('../twig').factory();

const {twig} = Twig;

Twig.cache(false);

describe('Twig.js Embed ->', function () {
    // Test loading a template from a remote endpoint
    it('it should load embed and render', async function () {
        await twig({
            id: 'embed',
            path: 'test/templates/embed-simple.twig'
        });
        // Load the template
        const testTemplate = twig({ref: 'embed'});

        const result = await testTemplate.render({ });

        result.trim().should.equal([
            'START',
            'A',
            'new header',
            'base footer',
            'B',
            '',
            'A',
            'base header',
            'base footer',
            'extended',
            'B',
            '',
            'A',
            'base header',
            'extended',
            'base footer',
            'extended',
            'B',
            '',
            'A',
            'Super cool new header',
            'Cool footer',
            'B',
            'END'
        ].join('\n'));
    });

    it('should skip non-existent embeds flagged with "ignore missing"', async function () {
        return awaity.map(
            ['', ' with {}', ' with {} only', ' only'],
            async options => {
                const testTemplate = twig({
                    allowInlineIncludes: true,
                    data: 'ignore-{% embed "embed-not-there.twig" ignore missing' + options + ' %}{% endembed %}missing'
                });

                return testTemplate.render().should.be.fulfilledWith('ignore-missing');
            }
        );
    });

    it('should include the correct context using "with" and "only"', async function () {
        twig({
            data: '|{{ foo }}||{{ baz }}|',
            id: 'embed.twig'
        });

        return awaity.map(
            [
                {
                    expected: '|bar||qux|',
                    options: ''
                },
                {
                    expected: '|bar||qux|',
                    options: ' with {}'
                },
                {
                    expected: '|bar||override|',
                    options: ' with {"baz": "override"}'
                },
                {
                    expected: '||||',
                    options: ' only'
                },
                {
                    expected: '||||',
                    options: ' with {} only'
                },
                {
                    expected: '|override|||',
                    options: ' with {"foo": "override"} only'
                }
            ],
            async test => {
                const testTemplate = twig({
                    allowInlineIncludes: true,
                    data: '{% embed "embed.twig"' + test.options + ' %}{% endembed %}'
                });

                return testTemplate.render({
                    foo: 'bar',
                    baz: 'qux'
                }).should.be.fulfilledWith(test.expected);
            }
        );
    });

    it('should override blocks in a for loop', async function () {
        twig({
            data: '<{% block content %}original{% endblock %}>',
            id: 'embed.twig'
        });

        const testTemplate = twig({
            allowInlineIncludes: true,
            data: '{% for i in 1..3 %}{% embed "embed.twig" %}{% block content %}override{% endblock %}{% endembed %}{% endfor %}'
        });

        return testTemplate.render().should.be.fulfilledWith('<override><override><override>');
    });

    it('should support complex nested embeds', async function () {
        twig({
            data: '<{% block header %}outer-header{% endblock %}><{% block footer %}outer-footer{% endblock %}>',
            id: 'embed-outer.twig'
        });
        twig({
            data: '{% block content %}inner-content{% endblock %}',
            id: 'embed-inner.twig'
        });

        const testTemplate = twig({
            allowInlineIncludes: true,
            data: '{% embed "embed-outer.twig" %}{% block header %}{% embed "embed-inner.twig" %}{% block content %}override-header{% endblock %}{% endembed %}{% endblock %}{% block footer %}{% embed "embed-inner.twig" %}{% block content %}override-footer{% endblock %}{% endembed %}{% endblock %}{% endembed %}'
        });

        return testTemplate.render().should.be.fulfilledWith('<override-header><override-footer>');
    });

    it('should support multiple inheritance and embeds', async function () {
        await Promise.all([
            twig({
                data: '<{% block header %}base-header{% endblock %}>{% block body %}<base-body>{% endblock %}<{% block footer %}base-footer{% endblock %}>',
                id: 'base.twig'
            }),
            twig({
                data: '{% extends "base.twig" %}{% block header %}layout-header{% endblock %}{% block body %}<{% block body_header %}layout-body-header{% endblock %}>{% block body_content %}layout-body-content{% endblock %}<{% block body_footer %}layout-body-footer{% endblock %}>{% endblock %}',
                id: 'layout.twig'
            }),
            twig({
                data: '<{% block section_title %}section-title{% endblock %}><{% block section_content %}section-content{% endblock %}>',
                id: 'section.twig'
            })
        ]);

        const testTemplate = twig({
            allowInlineIncludes: true,
            data: '{% extends "layout.twig" %}{% block body_header %}override-body-header{% endblock %}{% block body_content %}{% embed "section.twig" %}{% block section_content %}override-section-content{% endblock %}{% endembed %}{% endblock %}'
        });

        return testTemplate.render().should.be.fulfilledWith('<layout-header><override-body-header><section-title><override-section-content><layout-body-footer><base-footer>');
    });
});
