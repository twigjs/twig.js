const Twig = require('..').factory();

const {twig} = Twig;

describe('Twig.js Expression Operators ->', function () {
    describe('Precedence ->', function () {
        it('should correctly order \'in\'', function () {
            const testTemplate = twig({data: '{% if true or "anything" in ["a","b","c"] %}OK!{% endif %}'});
            const output = testTemplate.render({});

            output.should.equal('OK!');
        });
    });

    describe('// ->', function () {
        it('should handle positive values', function () {
            const testTemplate = twig({data: '{{ 20 // 7 }}'});
            const output = testTemplate.render({});

            output.should.equal('2');
        });

        it('should handle negative values', function () {
            const testTemplate = twig({data: '{{ -20 // -7 }}'});
            const output = testTemplate.render({});

            output.should.equal('2');
        });

        it('should handle mixed sign values', function () {
            const testTemplate = twig({data: '{{ -20 // 7 }}'});
            const output = testTemplate.render({});

            output.should.equal('-3');
        });
    });

    describe('?: ->', function () {
        it('should support the extended ternary operator for true conditions', function () {
            const testTemplate = twig({data: '{{ a ? b }}'});
            const outputT = testTemplate.render({a: true, b: 'one'});
            const outputF = testTemplate.render({a: false, b: 'one'});

            outputT.should.equal('one');
            outputF.should.equal('');
        });

        it('should support the extended ternary operator for false conditions', function () {
            const testTemplate = twig({data: '{{ a ?: b }}'});
            const outputT = testTemplate.render({a: 'one', b: 'two'});
            const outputF = testTemplate.render({a: false, b: 'two'});

            outputT.should.equal('one');
            outputF.should.equal('two');
        });
    });

    describe('?? ->', function () {
        it('should support the null-coalescing operator for true conditions', function () {
            const testTemplate = twig({data: '{{ a ?? b }}'});
            const outputT = testTemplate.render({a: 'one', b: 'two'});
            const outputF = testTemplate.render({a: false, b: 'two'});

            outputT.should.equal('one');
            outputF.should.equal('false');
        });

        it('should support the null-coalescing operator for false conditions', function () {
            const testTemplate = twig({data: '{{ a ?? b }}'});
            const outputT = testTemplate.render({a: undefined, b: 'two'});
            const outputF = testTemplate.render({a: null, b: 'two'});

            outputT.should.equal('two');
            outputF.should.equal('two');
        });

        it('should support the null-coalescing operator for true conditions on objects or arrays', function () {
            const testTemplate = twig({data: '{% set b = a ?? "nope" %}{{ b | join("") }}'});
            const outputArr = testTemplate.render({a: [1, 2]});
            const outputObj = testTemplate.render({a: {b: 3, c: 4}});
            const outputNull = testTemplate.render();

            outputArr.should.equal('12');
            outputObj.should.equal('34');
            outputNull.should.equal('nope');
        });
    });

    describe('b-and ->', function () {
        it('should return correct value if needed bit is set or 0 if not', function () {
            const testTemplate = twig({data: '{{ a b-and b }}'});
            const output0 = testTemplate.render({a: 25, b: 1});
            const output1 = testTemplate.render({a: 25, b: 2});
            const output2 = testTemplate.render({a: 25, b: 4});
            const output3 = testTemplate.render({a: 25, b: 8});
            const output4 = testTemplate.render({a: 25, b: 16});

            output0.should.equal('1');
            output1.should.equal('0');
            output2.should.equal('0');
            output3.should.equal('8');
            output4.should.equal('16');
        });
    });

    describe('b-or ->', function () {
        it('should return initial value if needed bit is set or sum of bits if not', function () {
            const testTemplate = twig({data: '{{ a b-or b }}'});
            const output0 = testTemplate.render({a: 25, b: 1});
            const output1 = testTemplate.render({a: 25, b: 2});
            const output2 = testTemplate.render({a: 25, b: 4});
            const output3 = testTemplate.render({a: 25, b: 8});
            const output4 = testTemplate.render({a: 25, b: 16});

            output0.should.equal('25');
            output1.should.equal('27');
            output2.should.equal('29');
            output3.should.equal('25');
            output4.should.equal('25');
        });
    });

    describe('b-xor ->', function () {
        it('should subtract bit if it\'s already set or add it if it\'s not', function () {
            const testTemplate = twig({data: '{{ a b-xor b }}'});
            const output0 = testTemplate.render({a: 25, b: 1});
            const output1 = testTemplate.render({a: 25, b: 2});
            const output2 = testTemplate.render({a: 25, b: 4});
            const output3 = testTemplate.render({a: 25, b: 8});
            const output4 = testTemplate.render({a: 25, b: 16});

            output0.should.equal('24');
            output1.should.equal('27');
            output2.should.equal('29');
            output3.should.equal('17');
            output4.should.equal('9');
        });
    });
});
