const Twig = require('../twig').factory();
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

    it('should support with', function () {
        twig({
            autoescape: true,
            data: '{% set prefix = "Hello" %}{% with { name: "world" } %}{{prefix}} {{name}}{% endwith %}'
        }).render().should.equal(
            'Hello world'
        );
    });

    it('should limit scope of with only', function () {
        twig({
            autoescape: true,
            data: '{% set prefix = "Hello" %}{% with { name: "world" } only %}{{prefix}} {{name}}{% endwith %}'
        }).render().should.equal(
            ' world'
        );
    });

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
        let consoleSpy = sinon.spy(console, 'warn');

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
