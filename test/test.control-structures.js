const Twig = require('../twig').factory();

const {twig} = Twig;

const {mapTestDataToAssertions} = require('./helpers')(twig);

describe('Twig.js Control Structures ->', function () {
    // {% if ... %}
    describe('if tag ->', function () {
        it('should parse the contents of the if block if the expression is true', async function () {
            return mapTestDataToAssertions(
                '{% if test %}true{% endif%}',
                ['true', ''],
                [{test: true}, {test: false}]
            );
        });
        it('should call the if or else blocks based on the expression result', async function () {
            return mapTestDataToAssertions(
                '{% if test %}true{% else %}false{% endif%}',
                ['true', 'false'],
                [{test: true}, {test: false}]
            );
        });
        it('should support elseif', async function () {
            return mapTestDataToAssertions(
                '{% if test %}1{% elseif other %}2{%else%}3{% endif%}',
                ['1', '1', '2', '3'],
                [
                    {test: true, other: false},
                    {test: true, other: true},
                    {test: false, other: true},
                    {test: false, other: false}
                ]
            );
        });
        it('should be able to nest', async function () {
            return mapTestDataToAssertions(
                '{% if test %}{% if test2 %}true{% else %}false{% endif%}{% else %}not{% endif%}',
                ['true', 'false', 'not', 'not'],
                [
                    {test: true, test2: true},
                    {test: true, test2: false},
                    {test: false, test2: true},
                    {test: false, test2: false}
                ]
            );
        });
        it('should support newlines in if statement', async function () {
            return mapTestDataToAssertions(
                '{% if test or\r\nother %}true{% endif%}',
                ['true', ''],
                [
                    {test: true, other: false},
                    {test: false, other: false}
                ]
            );
        });
        it('should support values which are not booleans', async function () {
            return mapTestDataToAssertions(
                '{% if test %}test_true{% elseif other %}other_true{% else %}all_false{% endif %}',
                [
                    'test_true',
                    'other_true',
                    'all_false',
                    'other_true',
                    'other_true',
                    'other_true',
                    'other_true',
                    'other_true',
                    'other_true',
                    'other_true'
                ],
                [
                    {test: 'true', other: true},
                    {test: false, other: 'true'},
                    {test: false, other: false},
                    {test: 0, other: true},
                    {test: 0.0, other: true},
                    {test: '', other: true},
                    {test: '0', other: true},
                    {test: [], other: true},
                    {test: null, other: true},
                    {test: undefined, other: true}
                ]
            );
        });
    });

    // {% for ... %}
    describe('for tag ->', function () {
        const loopTemplates = [
            '{% for key,value in test %}{{ loop.index }}{% endfor %}',
            '{% for key,value in test %}{{ loop.index0 }}{% endfor %}',
            '{% for key,value in test %}{{ loop.revindex }}{% endfor %}',
            '{% for key,value in test %}{{ loop.revindex0 }}{% endfor %}',
            '{% for key,value in test %}{{ loop.length }}{% endfor %}',
            '{% for key,value in test %}{{ loop.first }}{% endfor %}',
            '{% for key,value in test %}{{ loop.last }}{% endfor %}'
        ];

        const expected = [
            '1234',
            '0123',
            '4321',
            '3210',
            '4444',
            'truefalsefalsefalse',
            'falsefalsefalsetrue'
        ];

        it('should provide value only for array input', async function () {
            return mapTestDataToAssertions(
                '{% for value in test %}{{ value }}{% endfor %}',
                ['1234', ''],
                [{test: [1, 2, 3, 4]}, {test: []}]
            );
        });
        it('should provide both key and value for array input', async function () {
            return mapTestDataToAssertions(
                '{% for key,value in test %}{{key}}:{{ value }}{% endfor %}',
                ['0:11:22:33:4', ''],
                [{test: [1, 2, 3, 4]}, {test: []}]
            );
        });
        it('should provide both key and value for multiline array input', async function () {
            const testTemplate = twig({data: '{% for key,value in [\n"foo",\n"bar\n","baz"] %}{{key}}:{{ value }}{% endfor %}'});
            return testTemplate.render({ }).should.be.fulfilledWith('0:foo1:bar\n2:baz');
        });
        it('should provide value only for object input', async function () {
            return mapTestDataToAssertions(
                '{% for value in test %}{{ value }}{% endfor %}',
                ['123', ''],
                [{test: {one: 1, two: 2, three: 3}}, {test: {}}]
            );
        });
        it('should provide both key and value for object input', async function () {
            return mapTestDataToAssertions(
                '{% for key, value in test %}{{key}}:{{ value }}{% endfor %}',
                ['one:1two:2three:3', ''],
                [{test: {one: 1, two: 2, three: 3}}, {test: {}}]
            );
        });
        it('should provide both key and value for multiline object input', async function () {
            const testTemplate = twig({data: '{% for key,value in {\n"foo":"bar\n",\n"baz":"bar"\n} %}{{key}}:{{ value }}{% endfor %}'});
            return testTemplate.render({ }).should.be.fulfilledWith('foo:bar\nbaz:bar');
        });
        it('should support else if the input is empty', async function () {
            return mapTestDataToAssertions(
                '{% for key,value in test %}{{ value }}{% else %}else{% endfor %}',
                ['1234', 'else'],
                [{test: [1, 2, 3, 4]}, {test: {}}]
            );
        });
        it('should be able to nest', async function () {
            return mapTestDataToAssertions(
                '{% for key,list in test %}{% for val in list %}{{ val }}{%endfor %}.{% else %}else{% endfor %}',
                ['12.34.56.', 'else'],
                [{test: [[1, 2], [3, 4], [5, 6]]}, {test: []}]
            );
        });
        it('should have a loop context item available for arrays', function () {
            return mapTestDataToAssertions(loopTemplates, expected, {test: [1, 2, 3, 4]});
        });
        it('should have a loop context item available for objects', function () {
            return mapTestDataToAssertions(loopTemplates, expected, {test: {a: 1, b: 2, c: 3, d: 4}});
        });
        it('should have a loop context item available in child loops objects', async function () {
            const testTemplate = twig({data: '{% for value in test %}{% for value in inner %}({{ loop.parent.loop.index }},{{ loop.index }}){% endfor %}{% endfor %}'});
            return testTemplate.render({test: {a: 1, b: 2}, inner: [1, 2, 3]}).should.be.fulfilledWith('(1,1)(1,2)(1,3)(2,1)(2,2)(2,3)');
        });

        it('should support conditionals on for loops', function () {
            return mapTestDataToAssertions(
                [
                    '{% for value in test if false %}{{ value }},{% endfor %}',
                    '{% for value in test if true %}{{ value }}{% endfor %}',
                    '{% for value in test if value|length > 2 %}{{ value }},{% endfor %}',
                    '{% for key,item in test if item.show %}{{key}}:{{ item.value }},{% endfor %}'
                ],
                [
                    '',
                    'asdf',
                    'one,two,other,',
                    'a:one,c:three,'
                ],
                [
                    {test: ['one', 'two', 'a', 'b', 'other']},
                    {test: ['a', 's', 'd', 'f']},
                    {test: ['one', 'two', 'a', 'b', 'other']},
                    {
                        test: {
                            a: {show: true, value: 'one'},
                            b: {show: false, value: 'two'},
                            c: {show: true, value: 'three'}
                        }
                    }
                ]
            );
        });
    });

    // {% set thing='value' %}
    describe('set tag ->', function () {
        it('should not set the global context from within a for loop', async function () {
            const testTemplate = twig({data: '{% for value in [1] %}{% set foo="right" %}{% endfor %}{{ foo }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });

        it('should set the global context from within a for loop when the variable is initialized outside of the loop', async function () {
            const testTemplate = twig({data: '{% set foo="wrong" %}{% for value in [1] %}{% set foo="right" %}{% endfor %}{{ foo }}'});
            return testTemplate.render().should.be.fulfilledWith('right');
        });

        it('should set the global context from within a nested for loop when the variable is initialized outside of the loop', async function () {
            const testTemplate = twig({data: '{% set k = 0 %}{% for i in 0..2 %}{% for j in 0..2 %}{{ k }}{% set k = k + 1 %}{% endfor %}{% endfor %}'});
            return testTemplate.render().should.be.fulfilledWith('012345678');
        });
    });
});

