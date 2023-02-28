const Twig = require('..').factory();
const sinon = require('sinon');

const {twig} = Twig;

describe('Twig.js Tags ->', function () {
    it('should support spaceless', function () {
        twig({
            data: '{% spaceless %}<div>\n    <b>b</b>   <i>i</i>\n</div>{% endspaceless %}'
        }).render().should.equal(
            '<div><b>b</b><i>i</i></div>'
        );
    });

    it('should not escape static values when using spaceless', function () {
        twig({
            autoescape: true,
            data: '{% spaceless %}<div>{% endspaceless %}'
        }).render().should.equal(
            '<div>'
        );
    });

    describe(
        'with ->',
        function () {
            it('should support providing context', function () {
                twig({
                    'data': '{% with { name: "world" } %}{{ name }}{% endwith %}'
                }).render().should.equal('world');
            });

            it('should support exclusive context', function () {
                twig({
                    'data': '{% with { name: "world" } only %}{{ name }}{% endwith %}'
                }).render().should.equal('world');
            });

            it('should support not providing context', function () {
                twig({
                    'data': '{% with %}{% set foo = 42 %}{{ foo }}{% endwith %}',
                }).render().should.equal('42');
            });

            it('should handle outer context properly', function () {
                twig({
                    'data': '{% set foo = "bar" %}{% with { name: "world" } %}{{ name }} - {{ foo | default("foo is not defined here") }}{% endwith %}'
                }).render().should.equal('world - bar');

                twig({
                    'data': '{% set foo = "bar" %}{% with { name: "world" } only %}{{ name }} - {{ foo | default("foo is not defined here") }}{% endwith %}'
                }).render().should.equal('world - foo is not defined here');

                twig({
                    'data': '{% set bar = "baz" %}{% with %}{% set foo = 42 %}{{ foo }} - {{ bar | default("bar is not defined here") }}{% endwith %}',
                }).render().should.equal('42 - baz');
            });

            it('should scope any context changes within the tags', function () {
                twig({
                    'data': '{% set foo = "bar" %}{% with { name: "world" } %}{{ name }} - {{ foo | default("foo is not defined here") }}{% endwith %} - {{ name | default("name is not defined here") }}'
                }).render().should.equal('world - bar - name is not defined here');

                twig({
                    'data': '{% set foo = "bar" %}{% with { name: "world" } only %}{{ name }} - {{ foo | default("foo is not defined here") }}{% endwith %} - {{ name | default("name is not defined here") }}'
                }).render().should.equal('world - foo is not defined here - name is not defined here');

                twig({
                    'data': '{% set bar = "baz" %}{% with %}{% set foo = 42 %}{{ foo }} - {{ bar | default("bar is not defined here") }}{% endwith %} - {{ foo | default("foo is not defined here") }}',
                }).render().should.equal('42 - baz - foo is not defined here');
            });
        }
    );

    it('should support apply upper', function () {
        twig({
            data: '{% apply upper %}twigjs{% endapply %}'
        }).render().should.equal(
            'TWIGJS'
        );
    });

    it('should support apply lower|escape', function () {
        twig({
            data: '{% apply lower|escape %}<strong>Twig.js</strong>{% endapply %}'
        }).render().should.equal(
            '&lt;strong&gt;twig.js&lt;/strong&gt;'
        );
    });

    it('should support deprecated tag and show a console warn message', function () {
        const consoleSpy = sinon.spy(console, 'warn');

        twig({
            data: '{% deprecated \'`foo` is deprecated use `bar`\' %}'
        }).render();

        consoleSpy.should.be.calledWith('Deprecation notice: \'`foo` is deprecated use `bar`\'');
    });

    it('should support do', function () {
        twig({data: '{% do 1 + 2 %}'}).render().should.equal('');
        twig({data: '{% do arr %}'}).render({arr:[1]}).should.equal('');
        twig({data: `{% do arr.foo("
multiline", argument) %}`}).render().should.equal('');
    });
});
