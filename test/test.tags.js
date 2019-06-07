const Twig = require('../twig').factory();

const {twig} = Twig;

describe('Twig.js Tags ->', function () {
    it('should support spaceless', async function () {
        const testTemplate = twig({
            data: '{% spaceless %}<div>\n    <b>b</b>   <i>i</i>\n</div>{% endspaceless %}'
        });

        return testTemplate.render().should.be.fulfilledWith(
            '<div><b>b</b><i>i</i></div>'
        );
    });

    it('should not escape static values when using spaceless', async function () {
        const testTemplate = twig({
            autoescape: true,
            data: '{% spaceless %}<div>{% endspaceless %}'
        });

        return testTemplate.render().should.be.fulfilledWith(
            '<div>'
        );
    });

    it('should support with', async function () {
        const testTemplate = twig({
            autoescape: true,
            data: '{% set prefix = "Hello" %}{% with { name: "world" } %}{{prefix}} {{name}}{% endwith %}'
        });

        return testTemplate.render().should.be.fulfilledWith(
            'Hello world'
        );
    });

    it('should limit scope of with only', async function () {
        const testTemplate = twig({
            autoescape: true,
            data: '{% set prefix = "Hello" %}{% with { name: "world" } only %}{{prefix}} {{name}}{% endwith %}'
        });

        return testTemplate.render().should.be.fulfilledWith(
            ' world'
        );
    });
});
