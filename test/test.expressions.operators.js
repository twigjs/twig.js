const Twig = require('../twig').factory();

const {twig} = Twig;

const {mapTestDataToAssertions} = require('./helpers')(twig);

describe('Twig.js Expression Operators ->', function () {
    describe('Precedence ->', function () {
        it('should correctly order \'in\'', async function () {
            const testTemplate = twig({data: '{% if true or "anything" in ["a","b","c"] %}OK!{% endif %}'});
            return testTemplate.render({}).should.be.fulfilledWith('OK!');
        });
    });

    describe('// ->', function () {
        it('should handle positive values', async function () {
            const testTemplate = twig({data: '{{ 20 // 7 }}'});
            return testTemplate.render({}).should.be.fulfilledWith('2');
        });

        it('should handle negative values', async function () {
            const testTemplate = twig({data: '{{ -20 // -7 }}'});
            return testTemplate.render({}).should.be.fulfilledWith('2');
        });

        it('should handle mixed sign values', async function () {
            const testTemplate = twig({data: '{{ -20 // 7 }}'});
            return testTemplate.render({}).should.be.fulfilledWith('-3');
        });
    });

    describe('?: ->', function () {
        it('should support the extended ternary operator for true conditions', async function () {
            return mapTestDataToAssertions(
                '{{ a ? b }}',
                ['one', ''],
                [{a: true, b: 'one'}, {a: false, b: 'one'}]
            );
        });

        it('should support the extended ternary operator for false conditions', async function () {
            return mapTestDataToAssertions(
                '{{ a ?: b }}',
                ['one', 'two'],
                [{a: 'one', b: 'two'}, {a: false, b: 'two'}]
            );
        });
    });

    describe('?? ->', function () {
        it('should support the null-coalescing operator for true conditions', async function () {
            return mapTestDataToAssertions(
                '{{ a ?? b }}',
                ['one', 'false'],
                [{a: 'one', b: 'two'}, {a: false, b: 'two'}]
            );
        });

        it('should support the null-coalescing operator for false conditions', async function () {
            return mapTestDataToAssertions(
                '{{ a ?? b }}',
                ['two', 'two'],
                [{a: undefined, b: 'two'}, {a: null, b: 'two'}]
            );
        });
    });

    describe('b-and ->', function () {
        it('should return correct value if needed bit is set or 0 if not', function () {
            return mapTestDataToAssertions(
                '{{ a b-and b }}',
                ['1', '0', '0', '8', '16'],
                [
                    {a: 25, b: 1},
                    {a: 25, b: 2},
                    {a: 25, b: 4},
                    {a: 25, b: 8},
                    {a: 25, b: 16}
                ]
            );
        });
    });

    describe('b-or ->', function () {
        it('should return initial value if needed bit is set or sum of bits if not', function () {
            return mapTestDataToAssertions(
                '{{ a b-or b }}',
                ['25', '27', '29', '25', '25'],
                [
                    {a: 25, b: 1},
                    {a: 25, b: 2},
                    {a: 25, b: 4},
                    {a: 25, b: 8},
                    {a: 25, b: 16}
                ]
            );
        });
    });

    describe('b-xor ->', function () {
        it('should subtract bit if it\'s already set or add it if it\'s not', function () {
            return mapTestDataToAssertions(
                '{{ a b-xor b }}',
                ['24', '27', '29', '17', '9'],
                [
                    {a: 25, b: 1},
                    {a: 25, b: 2},
                    {a: 25, b: 4},
                    {a: 25, b: 8},
                    {a: 25, b: 16}
                ]
            );
        });
    });
});
