var Twig = Twig || requireUncached("../twig"),
    twig = twig || Twig.twig;

Twig.cache(false);

describe("Twig.js Embed ->", function() {
    // Test loading a template from a remote endpoint
    it("it should load embed and render", function() {
        twig({
            id:   'embed',
            path: 'test/templates/embed-simple.twig',
            async: false
        });
        // Load the template
        twig({ref: 'embed'}).render({ }).trim().should.equal( ['START',
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
                                                               'END'].join('\n') );
    });

    it('should skip non-existent embeds flagged with "ignore missing"', function() {
        [
            '',
            ' with {}',
            ' with {} only',
            ' only'
        ].forEach(function (options) {
            twig({
                allowInlineIncludes: true,
                data: 'ignore-{% embed "embed-not-there.twig" ignore missing' + options + ' %}{% endembed %}missing'
            }).render().should.equal('ignore-missing');
        });
    });

    it('should include the correct context using "with" and "only"', function() {
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
            },
        ].forEach(function (test) {
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
});
