const Twig = require('..').factory();

const {twig} = Twig;

Twig.cache(false);

describe('Twig.js Embed ->', function () {
    // Test loading a template from a remote endpoint
    it('it should load embed and render', function () {
        twig({
            id: 'embed',
            path: 'test/templates/embed-simple.twig',
            async: false
        });
        // Load the template
        twig({ref: 'embed'}).render({ }).trim().should.equal([
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

    it('should skip non-existent embeds flagged with "ignore missing"', function () {
        [
            '',
            ' with {}',
            ' with {} only',
            ' only'
        ].forEach(options => {
            twig({
                allowInlineIncludes: true,
                data: 'ignore-{% embed "embed-not-there.twig" ignore missing' + options + ' %}{% endembed %}missing'
            }).render().should.equal('ignore-missing');
        });
    });

    it('should include the correct context using "with" and "only"', function () {
        twig({
            data: '|{{ foo }}||{{ baz }}|',
            id: 'embed.twig'
        });

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
        ].forEach(test => {
            twig({
                allowInlineIncludes: true,
                data: '{% embed "embed.twig"' + test.options + ' %}{% endembed %}'
            }).render({
                foo: 'bar',
                baz: 'qux'
            }).should.equal(test.expected);
        });
    });

    it('should override blocks in a for loop', function () {
        twig({
            data: '<{% block content %}original{% endblock %}>',
            id: 'embed.twig'
        });

        twig({
            allowInlineIncludes: true,
            data: '{% for i in 1..3 %}{% embed "embed.twig" %}{% block content %}override{% endblock %}{% endembed %}{% endfor %}'
        }).render().should.equal('<override><override><override>');
    });

    it('should support complex nested embeds', function () {
        twig({
            data: '<{% block header %}outer-header{% endblock %}><{% block footer %}outer-footer{% endblock %}>',
            id: 'embed-outer.twig'
        });
        twig({
            data: '{% block content %}inner-content{% endblock %}',
            id: 'embed-inner.twig'
        });

        twig({
            allowInlineIncludes: true,
            data: '{% embed "embed-outer.twig" %}{% block header %}{% embed "embed-inner.twig" %}{% block content %}override-header{% endblock %}{% endembed %}{% endblock %}{% block footer %}{% embed "embed-inner.twig" %}{% block content %}override-footer{% endblock %}{% endembed %}{% endblock %}{% endembed %}'
        }).render().should.equal('<override-header><override-footer>');
    });

    it('should support multiple inheritance and embeds', function () {
        twig({
            data: '<{% block header %}base-header{% endblock %}>{% block body %}<base-body>{% endblock %}<{% block footer %}base-footer{% endblock %}>',
            id: 'base.twig'
        });
        twig({
            data: '{% extends "base.twig" %}{% block header %}layout-header{% endblock %}{% block body %}<{% block body_header %}layout-body-header{% endblock %}>{% block body_content %}layout-body-content{% endblock %}<{% block body_footer %}layout-body-footer{% endblock %}>{% endblock %}',
            id: 'layout.twig'
        });
        twig({
            data: '<{% block section_title %}section-title{% endblock %}><{% block section_content %}section-content{% endblock %}>',
            id: 'section.twig'
        });

        twig({
            allowInlineIncludes: true,
            data: '{% extends "layout.twig" %}{% block body_header %}override-body-header{% endblock %}{% block body_content %}{% embed "section.twig" %}{% block section_content %}override-section-content{% endblock %}{% endembed %}{% endblock %}'
        }).render().should.equal('<layout-header><override-body-header><section-title><override-section-content><layout-body-footer><base-footer>');
    });

    it('should work when within include rendered multiple times', function () {
        twig({
          'data': 'embed',
          'id': 'embed.twig',
        });

        twig({
          'allowInlineIncludes': true,
          'data': '{% embed "embed.twig" %}{% endembed %}',
          'id': 'include.twig',
        });

        twig({
          'allowInlineIncludes': true,
          'data': '{% include "include.twig" %} {% include "include.twig" %}',
        }).render().should.equal('embed embed');
    });

    it('should work when rendering the same include multiple times with embedded block', function () {
        twig({
          'data': '<div><h1>component a</h2>{% block content %}{% endblock %}</div>',
          'id': 'component-a.html.twig',
        });

        twig({
          'data': '{% embed "component-a.html.twig" %}{% block content %}<p>component b</p>{% endblock %}{% endembed %}',
          'id': 'component-b.html.twig',
        });

        twig({
          'allowInlineIncludes': true,
          'data': '{% include "component-b.html.twig" %}{% include "component-b.html.twig" %}',
        }).render().trim().should.equal('<div><h1>component a</h2><p>component b</p></div><div><h1>component a</h2><p>component b</p></div>');
    });
});
