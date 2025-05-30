const Twig = require('..').factory();

const {twig} = Twig;

describe('Twig.js Expressions ->', function () {
    const numericTestData = [
        {a: 10, b: 15},
        {a: 0, b: 0},
        {a: 1, b: 11},
        {a: 10444, b: 0.5},
        {a: 1034, b: -53},
        {a: -56, b: -1.7},
        {a: 34, b: 0},
        {a: 14, b: 14}
    ];

    describe('Basic Operators ->', function () {
        const stringData = [
            {a: 'test', b: 'string'},
            {a: 'test', b: ''},
            {a: '', b: 'string'},
            {a: '', b: ''}
        ];

        it('should parse parenthesis', function () {
            const testTemplate = twig({data: '{{ a - (b + c) }}'});
            const d = {a: 10, b: 4, c: 2};
            const output = testTemplate.render(d);

            output.should.equal((d.a - (d.b + d.c)).toString());
        });

        it('should parse nested parenthesis', function () {
            const testTemplate = twig({data: '{{ a - ((b) + (1 + c)) }}'});
            const d = {a: 10, b: 4, c: 2};
            const output = testTemplate.render(d);

            output.should.equal((d.a - (d.b + 1 + d.c)).toString());
        });

        it('should add numbers', function () {
            const testTemplate = twig({data: '{{ a + b }}'});
            numericTestData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a + pair.b).toString());
            });
        });
        it('should subtract numbers', function () {
            const testTemplate = twig({data: '{{ a - b }}'});
            numericTestData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a - pair.b).toString());
            });
        });
        it('should multiply numbers', function () {
            const testTemplate = twig({data: '{{ a * b }}'});
            numericTestData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a * pair.b).toString());
            });
        });
        it('should divide numbers', function () {
            const testTemplate = twig({data: '{{ a / b }}'});
            numericTestData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a / pair.b).toString());
            });
        });

        it('should divide numbers and return a floored result', function () {
            const testTemplate = twig({data: '{{ a // b }}'});
            numericTestData.forEach(pair => {
                const output = testTemplate.render(pair);
                // Get expected truncated result
                const c = Math.floor(pair.a / pair.b);

                output.should.equal(c.toString());
            });
        });

        it('should raise numbers to a power', function () {
            const testTemplate = twig({data: '{{ a ** b }}'});
            const powTestData = [
                {a: 2, b: 3, c: 8},
                {a: 4, b: 0.5, c: 2},
                {a: 5, b: 1, c: 5}
            ];
            powTestData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal(pair.c.toString());
            });
        });

        it('should concatanate values', function () {
            twig({data: '{{ "test" ~ a }}'}).render({a: 1234}).should.equal('test1234');
            twig({data: '{{ a ~ "test" ~ a }}'}).render({a: 1234}).should.equal('1234test1234');
            twig({data: '{{ "this" ~ "test" }}'}).render({a: 1234}).should.equal('thistest');

            // Test numbers
            let testTemplate = twig({data: '{{ a ~ b }}'});
            numericTestData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal(pair.a.toString() + pair.b.toString());
            });
            // Test strings
            testTemplate = twig({data: '{{ a ~ b }}'});
            stringData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal(pair.a.toString() + pair.b.toString());
            });
        });
        it('should concatenate null and undefined values and not throw an exception', function () {
            twig({data: '{{ a ~ b }}'}).render().should.equal('');
            twig({data: '{{ a ~ b }}'}).render({
                a: null,
                b: null
            }).should.equal('');
        });
        it('should handle multiple chained operations', function () {
            const data = {a: 4.5, b: 10, c: 12, d: -0.25, e: 0, f: 65, g: 21, h: -0.0002};
            const testTemplate = twig({data: '{{a/b+c*d-e+f/g*h}}'});
            const output = testTemplate.render(data);
            const expected = (data.a / data.b) + (data.c * data.d) - data.e + ((data.f / data.g) * data.h);
            output.should.equal(expected.toString());
        });
        it('should handle parenthesis in chained operations', function () {
            const data = {a: 4.5, b: 10, c: 12, d: -0.25, e: 0, f: 65, g: 21, h: -0.0002};
            const testTemplate = twig({data: '{{a   /(b+c )*d-(e+f)/(g*h)}}'});
            const output = testTemplate.render(data);
            const expected = ((data.a / (data.b + data.c)) * data.d) - ((data.e + data.f) / (data.g * data.h));
            output.should.equal(expected.toString());
        });

        it('should handle positive numbers', function () {
            const testTemplate = twig({data: '{{ 100 }}'});
            const output = testTemplate.render();
            output.should.equal('100');
        });

        it('should handle negative numbers', function () {
            const testTemplate = twig({data: '{{ -100 }}'});
            const output = testTemplate.render();
            output.should.equal('-100');
        });

        it('should allow expressions after period accessors', function () {
            let testTemplate;
            let output;

            testTemplate = twig({data: '{{ app.id and (true) }}'});
            output = testTemplate.render({app: {id: 1}});
            output.should.equal('true');

            // Check that parenless data works as well
            testTemplate = twig({data: '{{ app.id and true }}'});
            output = testTemplate.render({app: {id: 1}});
            output.should.equal('true');
        });
    });

    describe('Comparison Operators ->', function () {
        const equalityData = [
            {a: true, b: 'true'},
            {a: 1, b: '1'},
            {a: 1, b: 1},
            {a: 1, b: 1},
            {a: 'str', b: 'str'},
            {a: false, b: 'false'}
        ];
        const booleanData = [
            {a: true, b: true},
            {a: true, b: false},
            {a: false, b: true},
            {a: false, b: false}
        ];
        it('should support spaceship operator', function () {
            const testTemplate = twig({data: '{{ a <=> b }}'});
            numericTestData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a === pair.b ? 0 : (pair.a < pair.b ? -1 : 1)).toString());
            });
        });
        it('should support less then', function () {
            const testTemplate = twig({data: '{{ a < b }}'});
            numericTestData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a < pair.b).toString());
            });
        });
        it('should support less then or equal', function () {
            const testTemplate = twig({data: '{{ a <= b }}'});
            numericTestData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a <= pair.b).toString());
            });
        });
        it('should support greater then', function () {
            const testTemplate = twig({data: '{{ a > b }}'});
            numericTestData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a > pair.b).toString());
            });
        });
        it('should support greater then or equal', function () {
            const testTemplate = twig({data: '{{ a >= b }}'});
            numericTestData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a >= pair.b).toString());
            });
        });
        it('should support equals', function () {
            const testTemplate = twig({data: '{{ a == b }}'});
            booleanData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a === pair.b).toString());
            });

            equalityData.forEach(pair => {
                const output = testTemplate.render(pair);
                /* eslint-disable-next-line eqeqeq */
                output.should.equal((pair.a == pair.b).toString());
            });
        });
        it('should support not equals', function () {
            const testTemplate = twig({data: '{{ a != b }}'});
            booleanData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a !== pair.b).toString());
            });
            equalityData.forEach(pair => {
                const output = testTemplate.render(pair);
                /* eslint-disable-next-line eqeqeq */
                output.should.equal((pair.a != pair.b).toString());
            });
        });
        it('should support boolean or', function () {
            const testTemplate = twig({data: '{{ a or b }}'});
            booleanData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a || pair.b).toString());
            });

            testTemplate.render({a: 0, b: 1}).should.equal('true');
            testTemplate.render({a: '0', b: 1}).should.equal('true');
            testTemplate.render({a: '0', b: '0'}).should.equal('false');
        });
        it('should support boolean and', function () {
            const testTemplate = twig({data: '{{ a and b }}'});
            booleanData.forEach(pair => {
                const output = testTemplate.render(pair);
                output.should.equal((pair.a && pair.b).toString());
            });

            testTemplate.render({a: 0, b: 1}).should.equal('false');
            testTemplate.render({a: '0', b: 1}).should.equal('false');
            testTemplate.render({a: '0', b: '0'}).should.equal('false');
        });
        it('should support boolean not', function () {
            let testTemplate = twig({data: '{{ not a }}'});
            testTemplate.render({a: false}).should.equal('true');
            testTemplate.render({a: true}).should.equal('false');
            testTemplate.render({a: '0'}).should.equal('true');

            testTemplate = twig({data: '{{ a and not b }}'});
            testTemplate.render({a: true, b: false}).should.equal('true');
            testTemplate.render({a: true, b: true}).should.equal('false');

            testTemplate = twig({data: '{{ a or not b }}'});
            testTemplate.render({a: false, b: false}).should.equal('true');
            testTemplate.render({a: false, b: true}).should.equal('false');

            testTemplate = twig({data: '{{ a or not not b }}'});
            testTemplate.render({a: false, b: true}).should.equal('true');
            testTemplate.render({a: false, b: false}).should.equal('false');
        });
        it('should support boolean not in parentheses', function () {
            let testTemplate;

            testTemplate = twig({data: '{{ (test1 or test2) and test3 }}'});
            testTemplate.render({test1: true, test2: false, test3: true}).should.equal('true');
            testTemplate.render({test1: false, test2: false, test3: true}).should.equal('false');
            testTemplate.render({test1: true, test2: false, test3: false}).should.equal('false');

            testTemplate = twig({data: '{{ (test1 or test2) and not test3 }}'});
            testTemplate.render({test1: true, test2: false, test3: false}).should.equal('true');
            testTemplate.render({test1: false, test2: false, test3: false}).should.equal('false');
            testTemplate.render({test1: true, test2: false, test3: true}).should.equal('false');

            testTemplate = twig({data: '{{ (not test1 or test2) and test3 }}'});
            testTemplate.render({test1: false, test2: false, test3: true}).should.equal('true');
            testTemplate.render({test1: true, test2: false, test3: true}).should.equal('false');
            testTemplate.render({test1: false, test2: false, test3: false}).should.equal('false');

            testTemplate = twig({data: '{{ (test1 or not test2) and test3 }}'});
            testTemplate.render({test1: true, test2: true, test3: true}).should.equal('true');
            testTemplate.render({test1: false, test2: true, test3: true}).should.equal('false');
            testTemplate.render({test1: true, test2: true, test3: false}).should.equal('false');

            testTemplate = twig({data: '{{ (not test1 or not test2) and test3 }}'});
            testTemplate.render({test1: false, test2: true, test3: true}).should.equal('true');
            testTemplate.render({test1: true, test2: true, test3: true}).should.equal('false');
            testTemplate.render({test1: false, test2: true, test3: false}).should.equal('false');
        });

        it('should support regular expressions', function () {
            const testTemplate = twig({data: '{{ a matches "/^[\\d\\.]+$/" }}'});
            testTemplate.render({a: '123'}).should.equal('true');
            testTemplate.render({a: '1ab'}).should.equal('false');
        });

        it('should support starts with', function () {
            const testTemplate = twig({data: '{{ a starts with "f" }}'});
            testTemplate.render({a: 'foo'}).should.equal('true');
            testTemplate.render({a: 'bar'}).should.equal('false');
            testTemplate.render({}).should.equal('false');
        });

        it('should support ends with', function () {
            const testTemplate = twig({data: '{{ a ends with "o" }}'});
            testTemplate.render({a: 'foo'}).should.equal('true');
            testTemplate.render({a: 'bar'}).should.equal('false');
            testTemplate.render({}).should.equal('false');
        });

        it('should correctly cast arrays', function () {
            const testTemplate = twig({data: '{{ a == true }}'});
            testTemplate.render({a: ['value']}).should.equal('true');
            testTemplate.render({a: ['value', 'another']}).should.equal('true');
            testTemplate.render({a: []}).should.equal('false');

            const testTemplate2 = twig({data: '{{ true == a }}'});
            testTemplate2.render({a: ['value']}).should.equal('true');
            testTemplate2.render({a: ['value', 'another']}).should.equal('true');
            testTemplate2.render({a: []}).should.equal('false');
        });

        it('should correctly cast arrays in control structures', function () {
            const testTemplate = twig({data: '{% if a is defined and a %}true{% else %}false{% endif %}'});
            testTemplate.render({a: ['value']}).should.equal('true');
        });

        it('should be able to access array elements with colons', function () {
            const testTemplate = twig({data: '{% for d in data["test:element"] %}{{ d.id }}{% endfor %}'});
            testTemplate.render({data: {'test:element':[{'id': 100}]}}).should.equal('100');
        });
    });

    describe('Other Operators ->', function () {
        it('should support the ternary operator', function () {
            const testTemplate = twig({data: '{{ a ? b:c }}'});
            const outputT = testTemplate.render({a: true, b: 'one', c: 'two'});
            const outputF = testTemplate.render({a: false, b: 'one', c: 'two'});

            outputT.should.equal('one');
            outputF.should.equal('two');
        });
        it('should support the ternary operator with objects in it', function () {
            const testTemplate2 = twig({data: '{{ (a ? {"a":e+f}:{"a":1}).a }}'});
            const output2 = testTemplate2.render({a: true, b: false, e: 1, f: 2});

            output2.should.equal('3');
        });
        it('should support the ternary operator inside objects', function () {
            const testTemplate2 = twig({data: '{{ {"b" : a or b ? {"a":e+f}:{"a":1} }.b.a }}'});
            const output2 = testTemplate2.render({a: false, b: false, e: 1, f: 2});

            output2.should.equal('1');
        });
        it('should support non-boolean values in ternary statement', function () {
            const testTemplate = twig({data: '{{ test ? "true" : "false" }}'});

            testTemplate.render({test: 'one'}).should.equal('true');
            testTemplate.render({test: 0}).should.equal('false');
            testTemplate.render({test: 0}).should.equal('false');
            testTemplate.render({test: ''}).should.equal('false');
            testTemplate.render({test: '0'}).should.equal('false');
            testTemplate.render({test: []}).should.equal('false');
            testTemplate.render({test: null}).should.equal('false');
            testTemplate.render({test: undefined}).should.equal('false');
        });

        it('should support in/containment functionality for arrays', function () {
            let testTemplate;

            testTemplate = twig({data: '{{ "a" in ["a", "b", "c"] }}'});
            testTemplate.render().should.equal(true.toString());

            testTemplate = twig({data: '{{ "d" in ["a", "b", "c"] }}'});
            testTemplate.render().should.equal(false.toString());

            testTemplate = twig({data: '{{ ["a", "b"] in [["a", "b"], ["c", "d"]] }}'});
            testTemplate.render().should.equal(true.toString());

            testTemplate = twig({data: '{{ ["a", "c"] in [["a", "b"], ["c", "d"]] }}'});
            testTemplate.render().should.equal(false.toString());
        });

        it('should support not in/containment functionality for arrays', function () {
            let testTemplate;

            testTemplate = twig({data: '{{ "a" not in ["a", "b", "c"] }}'});
            testTemplate.render().should.equal(false.toString());

            testTemplate = twig({data: '{{ "d" not in ["a", "b", "c"] }}'});
            testTemplate.render().should.equal(true.toString());

            testTemplate = twig({data: '{{ ["a", "b"] not in [["a", "b"], ["c", "d"]] }}'});
            testTemplate.render().should.equal(false.toString());

            testTemplate = twig({data: '{{ ["a", "c"] not in [["a", "b"], ["c", "d"]] }}'});
            testTemplate.render().should.equal(true.toString());
        });

        it('should support in/containment functionality for strings', function () {
            let testTemplate;

            testTemplate = twig({data: '{{ "at" in "hat" }}'});
            testTemplate.render().should.equal(true.toString());

            testTemplate = twig({data: '{{ "d" in "not" }}'});
            testTemplate.render().should.equal(false.toString());
        });

        it('should support not in/containment functionality for strings', function () {
            let testTemplate;

            testTemplate = twig({data: '{{ "at" not in "hat" }}'});
            testTemplate.render().should.equal(false.toString());

            testTemplate = twig({data: '{{ "d" not in "not" }}'});
            testTemplate.render().should.equal(true.toString());
        });

        it('should support in/containment functionality for objects', function () {
            let testTemplate;

            testTemplate = twig({data: '{{ "value" in {"key" : "value", "2": "other"} }}'});
            testTemplate.render().should.equal(true.toString());

            testTemplate = twig({data: '{{ "d" in {"key_a" : "no"} }}'});
            testTemplate.render().should.equal(false.toString());
        });

        it('should support not in/containment functionality for objects', function () {
            let testTemplate;
            testTemplate = twig({data: '{{ "value" not in {"key" : "value", "2": "other"} }}'});
            testTemplate.render().should.equal(false.toString());

            testTemplate = twig({data: '{{ "d" not in {"key_a" : "no"} }}'});
            testTemplate.render().should.equal(true.toString());
        });

        it('should support undefined and null for the in operator', function () {
            const testTemplate = twig({data: '{{ 0 in undefined }} {{ 0 in null }}'});
            testTemplate.render().should.equal(' ');
        });

        it('should support expressions as object keys', function () {
            let testTemplate;
            testTemplate = twig({data: '{% set a = {(foo): "value"} %}{{ a.bar }}'});
            testTemplate.render({foo: 'bar'}).should.equal('value');

            testTemplate = twig({data: '{{ {(foo): "value"}.bar }}'});
            testTemplate.render({foo: 'bar'}).should.equal('value');

            testTemplate = twig({data: '{{ {(not foo): "value"}.true }}'});
            testTemplate.render({foo: false}).should.equal('value');
        });

        it('should not corrupt the stack when accessing a property of an undefined object', function () {
            const testTemplate = twig({data: '{% if true and somethingUndefined.property is not defined %}ok{% endif %}'});
            const output = testTemplate.render({});
            output.should.equal('ok');
        });

        it('should support keys as expressions', function () {
            const testTemplate = twig({data: '{% for val in arr %}{{{(val.value):null}|json_encode}}{% endfor %}'});
            const output = testTemplate.render({arr: [{value: 'one'}, {value: 'two'}]});
            output.should.equal('{"one":null}{"two":null}');
        });

        it('should support slice shorthand (full form)', function () {
            const testTemplate = twig({data: '{{ "12345"[1:2] }}'});
            const output = testTemplate.render();
            output.should.equal('23');
        });

        it('should support slice shorthand (full form) with negative start', function () {
            const testTemplate = twig({data: '{{ "12345"[-2:1] }}'});
            const output = testTemplate.render();
            output.should.equal('4');
        });

        it('should support slice shorthand (full form) with negative lenght', function () {
            const testTemplate = twig({data: '{{ "12345"[2:-1] }}'});
            const output = testTemplate.render();
            output.should.equal('34');
        });

        it('should support slice shorthand (full form) with variables as arguments', function () {
            const testTemplate = twig({data: '{{ "12345"[start:length] }}'});
            const output = testTemplate.render({start: 2, length: 3});
            output.should.equal('345');
        });

        it('should support slice shorthand (full form) with variable as argument (omit first)', function () {
            const testTemplate = twig({data: '{{ "12345"[:length] }}'});
            const output = testTemplate.render({length: 3});
            output.should.equal('123');
        });

        it('should support slice shorthand (full form) variable as argument (omit last)', function () {
            const testTemplate = twig({data: '{{ "12345"[start:] }}'});
            const output = testTemplate.render({start: 2});
            output.should.equal('345');
        });

        it('should support slice shorthand (omit first)', function () {
            const testTemplate = twig({data: '{{ "12345"[:2] }}'});
            const output = testTemplate.render();
            output.should.equal('12');
        });

        it('should support slice shorthand (omit last)', function () {
            const testTemplate = twig({data: '{{ "12345"[2:] }}'});
            const output = testTemplate.render();
            output.should.equal('345');
        });

        it('should support slice shorthand for arrays (full form)', function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5][1:2] }}'});
            const output = testTemplate.render();
            output.should.equal('2,3');
        });

        it('should support slice shorthand for arrays (omit first)', function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5][:2] }}'});
            const output = testTemplate.render();
            output.should.equal('1,2');
        });

        it('should support slice shorthand for arrays (omit last)', function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5][2:] }}'});
            const output = testTemplate.render();
            output.should.equal('3,4,5');
        });

        it('should support parenthesised expressions after test', function () {
            const testTemplate = twig({data: '{% if true is defined and (true) %}ok!{% endif %}'});
            const output = testTemplate.render();
            output.should.equal('ok!');
        });

        it('should support keys as expressions in function parameters', function () {
            const testTemplate = twig({data: '{{ func({(foo): \'stuff\'}) }}'});
            const output = testTemplate.render({
                func() {
                    return 'ok!';
                },
                foo: 'bar'
            });

            output.should.equal('ok!');
        });
    });
});
