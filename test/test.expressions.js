const awaity = require('awaity');
const Twig = require('../twig').factory();

const {twig} = Twig;

const {mapTestDataToAssertions} = require('./helpers')(twig);

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

        it('should parse parenthesis', async function () {
            const testTemplate = twig({data: '{{ a - (b + c) }}'});
            const d = {a: 10, b: 4, c: 2};
            const output = testTemplate.render(d);

            return output.should.be.fulfilledWith((d.a - (d.b + d.c)).toString());
        });

        it('should parse nested parenthesis', async function () {
            const testTemplate = twig({data: '{{ a - ((b) + (1 + c)) }}'});
            const d = {a: 10, b: 4, c: 2};
            const output = testTemplate.render(d);

            return output.should.be.fulfilledWith((d.a - (d.b + 1 + d.c)).toString());
        });

        it('should add numbers', async function () {
            const testTemplate = twig({data: '{{ a + b }}'});
            return awaity.map(numericTestData, pair => {
                const output = testTemplate.render(pair);
                return output.should.be.fulfilledWith((pair.a + pair.b).toString());
            });
        });
        it('should subtract numbers', async function () {
            const testTemplate = twig({data: '{{ a - b }}'});
            return awaity.map(numericTestData, pair => {
                const output = testTemplate.render(pair);
                return output.should.be.fulfilledWith((pair.a - pair.b).toString());
            });
        });
        it('should multiply numbers', async function () {
            const testTemplate = twig({data: '{{ a * b }}'});
            return awaity.map(numericTestData, pair => {
                const output = testTemplate.render(pair);
                return output.should.be.fulfilledWith((pair.a * pair.b).toString());
            });
        });
        it('should divide numbers', async function () {
            const testTemplate = twig({data: '{{ a / b }}'});
            return awaity.map(numericTestData, pair => {
                const output = testTemplate.render(pair);
                return output.should.be.fulfilledWith((pair.a / pair.b).toString());
            });
        });

        it('should divide numbers and return a floored result', async function () {
            const testTemplate = twig({data: '{{ a // b }}'});
            return awaity.map(numericTestData, pair => {
                const output = testTemplate.render(pair);
                // Get expected truncated result
                const c = Math.floor(pair.a / pair.b);

                return output.should.be.fulfilledWith(c.toString());
            });
        });

        it('should raise numbers to a power', async function () {
            const testTemplate = twig({data: '{{ a ** b }}'});
            const powTestData = [
                {a: 2, b: 3, c: 8},
                {a: 4, b: 0.5, c: 2},
                {a: 5, b: 1, c: 5}
            ];
            return awaity.map(powTestData, pair => {
                const output = testTemplate.render(pair);
                return output.should.be.fulfilledWith(pair.c.toString());
            });
        });

        it('should concatanate values', async function () {
            const templateData = [
                '{{ "test" ~ a }}',
                '{{ a ~ "test" ~ a }}',
                '{{ "this" ~ "test" }}'
            ];

            const expected = [
                'test1234',
                '1234test1234',
                'thistest'
            ];

            const testTemplate = twig({data: '{{ a ~ b }}'});

            return Promise.all([
                mapTestDataToAssertions(templateData, expected, {a: 1234}),
                awaity.map(numericTestData, pair => {
                    // Test numbers
                    const output = testTemplate.render(pair);
                    output.should.be.fulfilledWith(pair.a.toString() + pair.b.toString());
                }),
                awaity.map(stringData, pair => {
                    // Test strings
                    const output = testTemplate.render(pair);
                    output.should.be.fulfilledWith(pair.a.toString() + pair.b.toString());
                })
            ]);
        });
        it('should concatenate null and undefined values and not throw an exception', async function () {
            const testTemplate = twig({data: '{{ a ~ b }}'});

            return Promise.all([
                testTemplate.render().should.be.fulfilledWith(''),
                testTemplate.render({
                    a: null,
                    b: null
                }).should.be.fulfilledWith('')
            ]);
        });
        it('should handle multiple chained operations', async function () {
            const data = {a: 4.5, b: 10, c: 12, d: -0.25, e: 0, f: 65, g: 21, h: -0.0002};
            const testTemplate = twig({data: '{{a/b+c*d-e+f/g*h}}'});
            const output = testTemplate.render(data);
            const expected = (data.a / data.b) + (data.c * data.d) - data.e + ((data.f / data.g) * data.h);
            return output.should.be.fulfilledWith(expected.toString());
        });
        it('should handle parenthesis in chained operations', async function () {
            const data = {a: 4.5, b: 10, c: 12, d: -0.25, e: 0, f: 65, g: 21, h: -0.0002};
            const testTemplate = twig({data: '{{a   /(b+c )*d-(e+f)/(g*h)}}'});
            const output = testTemplate.render(data);
            const expected = ((data.a / (data.b + data.c)) * data.d) - ((data.e + data.f) / (data.g * data.h));
            return output.should.be.fulfilledWith(expected.toString());
        });

        it('should handle positive numbers', async function () {
            const testTemplate = twig({data: '{{ 100 }}'});
            const output = testTemplate.render();
            return output.should.be.fulfilledWith('100');
        });

        it('should handle negative numbers', async function () {
            const testTemplate = twig({data: '{{ -100 }}'});
            const output = testTemplate.render();
            return output.should.be.fulfilledWith('-100');
        });

        it('should allow expressions after period accessors', async function () {
            const templateData = [
                '{{ app.id and (true) }}',
                '{{ app.id and true }}'
            ];

            const expected = [
                'true',
                'true'
            ];

            return mapTestDataToAssertions(templateData, expected, {app: {id: 1}});
        });
    });

    describe('Comparison Operators ->', function () {
        const equalityData = [
            {a: true, b: 'true'},
            {a: 1, b: '1'},
            {a: 1, b: 1},
            {a: 1, b: 1.0},
            {a: 'str', b: 'str'},
            {a: false, b: 'false'}
        ];
        const booleanData = [
            {a: true, b: true},
            {a: true, b: false},
            {a: false, b: true},
            {a: false, b: false}
        ];
        it('should support less then', async function () {
            const testTemplate = twig({data: '{{ a < b }}'});
            return awaity.map(numericTestData, pair => {
                const output = testTemplate.render(pair);
                return output.should.be.fulfilledWith((pair.a < pair.b).toString());
            });
        });
        it('should support less then or equal', async function () {
            const testTemplate = twig({data: '{{ a <= b }}'});
            return awaity.map(numericTestData, pair => {
                const output = testTemplate.render(pair);
                return output.should.be.fulfilledWith((pair.a <= pair.b).toString());
            });
        });
        it('should support greater then', async function () {
            const testTemplate = twig({data: '{{ a > b }}'});
            return awaity.map(numericTestData, pair => {
                const output = testTemplate.render(pair);
                return output.should.be.fulfilledWith((pair.a > pair.b).toString());
            });
        });
        it('should support greater then or equal', async function () {
            const testTemplate = twig({data: '{{ a >= b }}'});
            return awaity.map(numericTestData, pair => {
                const output = testTemplate.render(pair);
                return output.should.be.fulfilledWith((pair.a >= pair.b).toString());
            });
        });
        it('should support equals', async function () {
            const testTemplate = twig({data: '{{ a == b }}'});
            return Promise.all([
                awaity.map(booleanData, pair => {
                    const output = testTemplate.render(pair);
                    output.should.be.fulfilledWith((pair.a === pair.b).toString());
                }),
                awaity.map(equalityData, pair => {
                    const output = testTemplate.render(pair);
                    /* eslint-disable-next-line eqeqeq */
                    output.should.be.fulfilledWith((pair.a == pair.b).toString());
                })
            ]);
        });
        it('should support not equals', async function () {
            const testTemplate = twig({data: '{{ a != b }}'});
            return Promise.all([
                awaity.map(booleanData, pair => {
                    const output = testTemplate.render(pair);
                    output.should.be.fulfilledWith((pair.a !== pair.b).toString());
                }),
                awaity.map(equalityData, pair => {
                    const output = testTemplate.render(pair);
                    /* eslint-disable-next-line eqeqeq */
                    output.should.be.fulfilledWith((pair.a != pair.b).toString());
                })
            ]);
        });
        it('should support boolean or', async function () {
            const testTemplate = twig({data: '{{ a or b }}'});

            const contexts = [
                {a: 0, b: 1},
                {a: '0', b: 1},
                {a: '0', b: '0'}
            ];

            const expected = [
                'true',
                'true',
                'false'
            ];

            return Promise.all([
                awaity.map(booleanData, pair => {
                    const output = testTemplate.render(pair);
                    output.should.be.fulfilledWith((pair.a || pair.b).toString());
                }),
                mapTestDataToAssertions('{{ a or b }}', expected, contexts)
            ]);
        });
        it('should support boolean and', async function () {
            const testTemplate = twig({data: '{{ a and b }}'});

            const contexts = [
                {a: 0, b: 1},
                {a: '0', b: 1},
                {a: '0', b: '0'}
            ];

            const expected = [
                'false',
                'false',
                'false'
            ];

            return Promise.all([
                awaity.map(booleanData, pair => {
                    const output = testTemplate.render(pair);
                    output.should.be.fulfilledWith((pair.a && pair.b).toString());
                }),
                mapTestDataToAssertions('{{ a and b }}', expected, contexts)
            ]);
        });
        it('should support boolean not', async function () {
            return Promise.all([
                mapTestDataToAssertions(
                    '{{ not a }}',
                    ['true', 'false', 'true'],
                    [{a: false}, {a: true}, {a: '0'}]
                ),
                mapTestDataToAssertions(
                    '{{ a and not b }}',
                    ['true', 'false'],
                    [{a: true, b: false}, {a: true, b: true}]
                ),
                mapTestDataToAssertions(
                    '{{ a or not b }}',
                    ['true', 'false'],
                    [{a: false, b: false}, {a: false, b: true}]
                ),
                mapTestDataToAssertions(
                    '{{ a or not not b }}',
                    ['true', 'false'],
                    [{a: false, b: true}, {a: false, b: false}]
                )
            ]);
        });
        it('should support boolean not in parentheses', async function () {
            return Promise.all([
                mapTestDataToAssertions(
                    '{{ (test1 or test2) and test3 }}',
                    ['true', 'false', 'false'],
                    [
                        {test1: true, test2: false, test3: true},
                        {test1: false, test2: false, test3: true},
                        {test1: true, test2: false, test3: false}
                    ]
                ),
                mapTestDataToAssertions(
                    '{{ (test1 or test2) and not test3 }}',
                    ['true', 'false', 'false'],
                    [
                        {test1: true, test2: false, test3: false},
                        {test1: false, test2: false, test3: false},
                        {test1: true, test2: false, test3: true}
                    ]
                ),
                mapTestDataToAssertions(
                    '{{ (not test1 or test2) and test3 }}',
                    ['true', 'false', 'false'],
                    [
                        {test1: false, test2: false, test3: true},
                        {test1: true, test2: false, test3: true},
                        {test1: false, test2: false, test3: false}
                    ]
                ),
                mapTestDataToAssertions(
                    '{{ (test1 or not test2) and test3 }}',
                    ['true', 'false', 'false'],
                    [
                        {test1: true, test2: true, test3: true},
                        {test1: false, test2: true, test3: true},
                        {test1: true, test2: true, test3: false}
                    ]
                ),
                mapTestDataToAssertions(
                    '{{ (not test1 or not test2) and test3 }}',
                    ['true', 'false', 'false'],
                    [
                        {test1: false, test2: true, test3: true},
                        {test1: true, test2: true, test3: true},
                        {test1: false, test2: true, test3: false}
                    ]
                )
            ]);
        });

        it('should support regular expressions', async function () {
            return mapTestDataToAssertions(
                '{{ a matches "/^[\\d\\.]+$/" }}',
                ['true', 'false'],
                [{a: '123'}, {a: '1ab'}]
            );
        });

        it('should support starts with', async function () {
            return mapTestDataToAssertions(
                '{{ a starts with "f" }}',
                ['true', 'false'],
                [{a: 'foo'}, {a: 'bar'}]
            );
        });

        it('should support ends with', async function () {
            return mapTestDataToAssertions(
                '{{ a ends with "o" }}',
                ['true', 'false'],
                [{a: 'foo'}, {a: 'bar'}]
            );
        });

        it('should correctly cast arrays', async function () {
            return mapTestDataToAssertions(
                '{{ a == true }}',
                ['true', 'false'],
                [{a: ['value']}, {a: []}]
            );
        });

        it('should correctly cast arrays in control structures', async function () {
            const testTemplate = twig({data: '{% if a is defined and a %}true{% else %}false{% endif %}'});
            return testTemplate.render({a: ['value']}).should.be.fulfilledWith('true');
        });
    });

    describe('Other Operators ->', function () {
        it('should support the ternary operator', async function () {
            const testTemplate = twig({data: '{{ a ? b:c }}'});
            const outputT = testTemplate.render({a: true, b: 'one', c: 'two'});
            const outputF = testTemplate.render({a: false, b: 'one', c: 'two'});

            return Promise.all([
                outputT.should.be.fulfilledWith('one'),
                outputF.should.be.fulfilledWith('two')
            ]);
        });
        it('should support the ternary operator with objects in it', async function () {
            const testTemplate2 = twig({data: '{{ (a ? {"a":e+f}:{"a":1}).a }}'});
            const output2 = testTemplate2.render({a: true, b: false, e: 1, f: 2});

            return output2.should.be.fulfilledWith('3');
        });
        it('should support the ternary operator inside objects', async function () {
            const testTemplate2 = twig({data: '{{ {"b" : a or b ? {"a":e+f}:{"a":1} }.b.a }}'});
            const output2 = testTemplate2.render({a: false, b: false, e: 1, f: 2});

            return output2.should.be.fulfilledWith('1');
        });
        it('should support non-boolean values in ternary statement', async function () {
            return mapTestDataToAssertions(
                '{{ test ? "true" : "false" }}',
                [
                    'true',
                    'false',
                    'false',
                    'false',
                    'false',
                    'false',
                    'false',
                    'false'
                ],
                [
                    {test: 'one'},
                    {test: 0},
                    {test: 0.0},
                    {test: ''},
                    {test: '0'},
                    {test: []},
                    {test: null},
                    {test: undefined}
                ]
            );
        });

        it('should support in/containment functionality for arrays', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ "a" in ["a", "b", "c"] }}',
                    '{{ "d" in ["a", "b", "c"] }}'
                ],
                [true.toString(), false.toString()]
            );
        });

        it('should support not in/containment functionality for arrays', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ "a" not in ["a", "b", "c"] }}',
                    '{{ "d" not in ["a", "b", "c"] }}'
                ],
                [false.toString(), true.toString()]
            );
        });

        it('should support in/containment functionality for strings', async function () {
            return mapTestDataToAssertions(
                ['{{ "at" in "hat" }}', '{{ "d" in "not" }}'],
                [true.toString(), false.toString()]
            );
        });

        it('should support not in/containment functionality for strings', async function () {
            return mapTestDataToAssertions(
                ['{{ "at" not in "hat" }}', '{{ "d" not in "not" }}'],
                [false.toString(), true.toString()]
            );
        });

        it('should support in/containment functionality for objects', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ "value" in {"key" : "value", "2": "other"} }}',
                    '{{ "d" in {"key_a" : "no"} }}'
                ],
                [true.toString(), false.toString()]
            );
        });

        it('should support not in/containment functionality for objects', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ "value" not in {"key" : "value", "2": "other"} }}',
                    '{{ "d" not in {"key_a" : "no"} }}'
                ],
                [false.toString(), true.toString()]
            );
        });

        it('should support undefined and null for the in operator', async function () {
            const testTemplate = twig({data: '{{ 0 in undefined }} {{ 0 in null }}'});
            return testTemplate.render().should.be.fulfilledWith(' ');
        });

        it('should support expressions as object keys', async function () {
            return mapTestDataToAssertions(
                [
                    '{% set a = {(foo): "value"} %}{{ a.bar }}',
                    '{{ {(foo): "value"}.bar }}',
                    '{{ {(not foo): "value"}.true }}'
                ],
                ['value', 'value', 'value'],
                [{foo: 'bar'}, {foo: 'bar'}, {foo: false}]
            );
        });

        it('should not corrupt the stack when accessing a property of an undefined object', async function () {
            const testTemplate = twig({data: '{% if true and somethingUndefined.property is not defined %}ok{% endif %}'});
            const output = testTemplate.render({});
            return output.should.be.fulfilledWith('ok');
        });

        it('should support keys as expressions', async function () {
            const testTemplate = twig({data: '{% for val in arr %}{{{(val.value):null}|json_encode}}{% endfor %}'});
            const output = testTemplate.render({arr: [{value: 'one'}, {value: 'two'}]});
            return output.should.be.fulfilledWith('{"one":null}{"two":null}');
        });

        it('should support slice shorthand (full form)', async function () {
            const testTemplate = twig({data: '{{ "12345"[1:2] }}'});
            const output = testTemplate.render();
            return output.should.be.fulfilledWith('23');
        });

        it('should support slice shorthand (omit first)', async function () {
            const testTemplate = twig({data: '{{ "12345"[:2] }}'});
            const output = testTemplate.render();
            return output.should.be.fulfilledWith('12');
        });

        it('should support slice shorthand (omit last)', async function () {
            const testTemplate = twig({data: '{{ "12345"[2:] }}'});
            const output = testTemplate.render();
            return output.should.be.fulfilledWith('345');
        });

        it('should support slice shorthand for arrays (full form)', async function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5][1:2] }}'});
            const output = testTemplate.render();
            return output.should.be.fulfilledWith('2,3');
        });

        it('should support slice shorthand for arrays (omit first)', async function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5][:2] }}'});
            const output = testTemplate.render();
            return output.should.be.fulfilledWith('1,2');
        });

        it('should support slice shorthand for arrays (omit last)', async function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5][2:] }}'});
            const output = testTemplate.render();
            return output.should.be.fulfilledWith('3,4,5');
        });

        it('should support parenthesised expressions after test', async function () {
            const testTemplate = twig({data: '{% if true is defined and (true) %}ok!{% endif %}'});
            const output = testTemplate.render();
            return output.should.be.fulfilledWith('ok!');
        });

        it('should support keys as expressions in function parameters', async function () {
            const testTemplate = twig({data: '{{ func({(foo): \'stuff\'}) }}'});
            const output = testTemplate.render({
                func() {
                    return 'ok!';
                },
                foo: 'bar'
            });

            return output.should.be.fulfilledWith('ok!');
        });
    });
});
