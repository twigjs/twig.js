const Twig = require('../twig').factory();

const {twig} = Twig;

const {mapTestDataToAssertions} = require('./helpers')(twig);

describe('Twig.js Regression Tests ->', function () {
    it('#47 should not match variables starting with not', async function () {
        // Define and save a template
        const testTemplate = twig({data: '{% for note in notes %}{{note}}{% endfor %}'});
        return testTemplate.render({notes: ['a', 'b', 'c']}).should.be.fulfilledWith('abc');
    });

    it('#56 functions work inside parentheses', async function () {
        // Define and save a template
        Twig.extendFunction('custom', _ => {
            return true;
        });

        const testTemplate = twig({data: '{% if (custom("val") and custom("val")) %}out{% endif %}'});
        return testTemplate.render({}).should.be.fulfilledWith('out');
    });

    it('#83 Support for trailing commas in arrays', async function () {
        const testTemplate = twig({data: '{{ [1,2,3,4,] }}'});
        return testTemplate.render().should.be.fulfilledWith('1,2,3,4');
    });

    it('#83 Support for trailing commas in objects', async function () {
        const testTemplate = twig({data: '{{ {a:1, b:2, c:3, } }}'});
        return testTemplate.render().should.be.fulfilled();
    });

    it('#283 should support quotes between raw tags', async function () {
        return mapTestDataToAssertions(
            [
                '{% raw %}\n"\n{% endraw %}',
                '{% raw %}\n\'\n{% endraw %}'
            ],
            [
                '"',
                '\''
            ]
        );
    });
});
