const Twig = require('..').factory();

const {twig} = Twig;

describe('Twig.js Control Structures ->', function () {
    // {% if ... %}
    describe('if tag ->', function () {
        it('should parse the contents of the if block if the expression is true', function () {
            const testTemplate = twig({data: '{% if test %}true{% endif%}'});
            testTemplate.render({test: true}).should.equal('true');
            testTemplate.render({test: false}).should.equal('');
        });
        it('should call the if or else blocks based on the expression result', function () {
            const testTemplate = twig({data: '{% if test %}true{% endif%}'});
            testTemplate.render({test: true}).should.equal('true');
            testTemplate.render({test: false}).should.equal('');
        });
        it('should support elseif', function () {
            const testTemplate = twig({data: '{% if test %}1{% elseif other %}2{%else%}3{% endif%}'});
            testTemplate.render({test: true, other: false}).should.equal('1');
            testTemplate.render({test: true, other: true}).should.equal('1');
            testTemplate.render({test: false, other: true}).should.equal('2');
            testTemplate.render({test: false, other: false}).should.equal('3');
        });
        it('should be able to nest', function () {
            const testTemplate = twig({data: '{% if test %}{% if test2 %}true{% else %}false{% endif%}{% else %}not{% endif%}'});
            testTemplate.render({test: true, test2: true}).should.equal('true');
            testTemplate.render({test: true, test2: false}).should.equal('false');
            testTemplate.render({test: false, test2: true}).should.equal('not');
            testTemplate.render({test: false, test2: false}).should.equal('not');
        });
        it('should support newlines in if statement', function () {
            const testTemplate = twig({data: '{% if test or\r\nother %}true{% endif%}'});
            testTemplate.render({test: true, other: false}).should.equal('true');
            testTemplate.render({test: false, other: false}).should.equal('');
        });
        it('should support values which are not booleans', function () {
            const testTemplate = twig({data: '{% if test %}test_true{% elseif other %}other_true{% else %}all_false{% endif %}'});
            testTemplate.render({test: 'true', other: true}).should.equal('test_true');
            testTemplate.render({test: false, other: 'true'}).should.equal('other_true');
            testTemplate.render({test: false, other: false}).should.equal('all_false');

            testTemplate.render({test: 0, other: true}).should.equal('other_true');
            testTemplate.render({test: 0, other: true}).should.equal('other_true');
            testTemplate.render({test: '', other: true}).should.equal('other_true');
            testTemplate.render({test: '0', other: true}).should.equal('other_true');
            testTemplate.render({test: [], other: true}).should.equal('other_true');
            testTemplate.render({test: null, other: true}).should.equal('other_true');
            testTemplate.render({test: undefined, other: true}).should.equal('other_true');
        });
    });

    // {% for ... %}
    describe('for tag ->', function () {
        it('should provide value only for array input', function () {
            const testTemplate = twig({data: '{% for value in test %}{{ value }}{% endfor %}'});
            testTemplate.render({test: [1, 2, 3, 4]}).should.equal('1234');
            testTemplate.render({test: []}).should.equal('');
        });
        it('should provide both key and value for array input', function () {
            const testTemplate = twig({data: '{% for key,value in test %}{{key}}:{{ value }}{% endfor %}'});
            testTemplate.render({test: [1, 2, 3, 4]}).should.equal('0:11:22:33:4');
            testTemplate.render({test: []}).should.equal('');
        });
        it('should provide both key and value for multiline array input', function () {
            const testTemplate = twig({data: '{% for key,value in [\n"foo",\n"bar\n","baz"] %}{{key}}:{{ value }}{% endfor %}'});
            testTemplate.render({ }).should.equal('0:foo1:bar\n2:baz');
        });
        it('should provide value only for object input', function () {
            const testTemplate = twig({data: '{% for value in test %}{{ value }}{% endfor %}'});
            testTemplate.render({test: {one: 1, two: 2, three: 3}}).should.equal('123');
            testTemplate.render({test: {}}).should.equal('');
        });
        it('should provide both key and value for object input', function () {
            const testTemplate = twig({data: '{% for key, value in test %}{{key}}:{{ value }}{% endfor %}'});
            testTemplate.render({test: {one: 1, two: 2, three: 3}}).should.equal('one:1two:2three:3');
            testTemplate.render({test: {}}).should.equal('');
        });
        it('should provide both key and value for multiline object input', function () {
            const testTemplate = twig({data: '{% for key,value in {\n"foo":"bar\n",\n"baz":"bar"\n} %}{{key}}:{{ value }}{% endfor %}'});
            testTemplate.render({ }).should.equal('foo:bar\nbaz:bar');
        });
        it('should support else if the input is empty', function () {
            const testTemplate = twig({data: '{% for key,value in test %}{{ value }}{% else %}else{% endfor %}'});
            testTemplate.render({test: [1, 2, 3, 4]}).should.equal('1234');
            testTemplate.render({test: []}).should.equal('else');
        });
        it('should be able to nest', function () {
            const testTemplate = twig({data: '{% for key,list in test %}{% for val in list %}{{ val }}{%endfor %}.{% else %}else{% endfor %}'});
            testTemplate.render({test: [[1, 2], [3, 4], [5, 6]]}).should.equal('12.34.56.');
            testTemplate.render({test: []}).should.equal('else');
        });
        it('should have a loop context item available for arrays', function () {
            let testTemplate = twig({data: '{% for key,value in test %}{{ loop.index }}{% endfor %}'});
            testTemplate.render({test: [1, 2, 3, 4]}).should.equal('1234');
            testTemplate = twig({data: '{% for key,value in test %}{{ loop.index0 }}{% endfor %}'});
            testTemplate.render({test: [1, 2, 3, 4]}).should.equal('0123');
            testTemplate = twig({data: '{% for key,value in test %}{{ loop.revindex }}{% endfor %}'});
            testTemplate.render({test: [1, 2, 3, 4]}).should.equal('4321');
            testTemplate = twig({data: '{% for key,value in test %}{{ loop.revindex0 }}{% endfor %}'});
            testTemplate.render({test: [1, 2, 3, 4]}).should.equal('3210');
            testTemplate = twig({data: '{% for key,value in test %}{{ loop.length }}{% endfor %}'});
            testTemplate.render({test: [1, 2, 3, 4]}).should.equal('4444');
            testTemplate = twig({data: '{% for key,value in test %}{{ loop.first }}{% endfor %}'});
            testTemplate.render({test: [1, 2, 3, 4]}).should.equal('truefalsefalsefalse');
            testTemplate = twig({data: '{% for key,value in test %}{{ loop.last }}{% endfor %}'});
            testTemplate.render({test: [1, 2, 3, 4]}).should.equal('falsefalsefalsetrue');
        });
        it('should have a loop context item available for objects', function () {
            let testTemplate = twig({data: '{% for key,value in test %}{{ loop.index }}{% endfor %}'});
            testTemplate.render({test: {a: 1, b: 2, c: 3, d: 4}}).should.equal('1234');
            testTemplate = twig({data: '{% for key,value in test %}{{ loop.index0 }}{% endfor %}'});
            testTemplate.render({test: {a: 1, b: 2, c: 3, d: 4}}).should.equal('0123');
            testTemplate = twig({data: '{% for key,value in test %}{{ loop.revindex }}{% endfor %}'});
            testTemplate.render({test: {a: 1, b: 2, c: 3, d: 4}}).should.equal('4321');
            testTemplate = twig({data: '{% for key,value in test %}{{ loop.revindex0 }}{% endfor %}'});
            testTemplate.render({test: {a: 1, b: 2, c: 3, d: 4}}).should.equal('3210');
            testTemplate = twig({data: '{% for key,value in test %}{{ loop.length }}{% endfor %}'});
            testTemplate.render({test: {a: 1, b: 2, c: 3, d: 4}}).should.equal('4444');
            testTemplate = twig({data: '{% for key,value in test %}{{ loop.first }}{% endfor %}'});
            testTemplate.render({test: {a: 1, b: 2, c: 3, d: 4}}).should.equal('truefalsefalsefalse');
            testTemplate = twig({data: '{% for key,value in test %}{{ loop.last }}{% endfor %}'});
            testTemplate.render({test: {a: 1, b: 2, c: 3, d: 4}}).should.equal('falsefalsefalsetrue');
        });
        it('should have a loop context item available in child loops objects', function () {
            const testTemplate = twig({data: '{% for value in test %}{% for value in inner %}({{ loop.parent.loop.index }},{{ loop.index }}){% endfor %}{% endfor %}'});
            testTemplate.render({test: {a: 1, b: 2}, inner: [1, 2, 3]}).should.equal('(1,1)(1,2)(1,3)(2,1)(2,2)(2,3)');
        });

        it('should support conditionals on for loops', function () {
            let testTemplate = twig({data: '{% for value in test if false %}{{ value }},{% endfor %}'});
            testTemplate.render({test: ['one', 'two', 'a', 'b', 'other']}).should.equal('');

            testTemplate = twig({data: '{% for value in test if true %}{{ value }}{% endfor %}'});
            testTemplate.render({test: ['a', 's', 'd', 'f']}).should.equal('asdf');

            testTemplate = twig({data: '{% for value in test if value|length > 2 %}{{ value }},{% endfor %}'});
            testTemplate.render({test: ['one', 'two', 'a', 'b', 'other']}).should.equal('one,two,other,');

            testTemplate = twig({data: '{% for key,item in test if item.show %}{{key}}:{{ item.value }},{% endfor %}'});
            testTemplate.render({test: {
                a: {show: true, value: 'one'},
                b: {show: false, value: 'two'},
                c: {show: true, value: 'three'}}}).should.equal('a:one,c:three,');
        });
    });

    // {% set thing='value' %}
    describe('set tag ->', function () {
        it('should not set the global context from within a for loop', function () {
            const testTemplate = twig({data: '{% for value in [1] %}{% set foo="right" %}{% endfor %}{{ foo }}'});
            testTemplate.render().should.equal('');
        });

        it('should set the global context from within a for loop when the variable is initialized outside of the loop', function () {
            const testTemplate = twig({data: '{% set foo="wrong" %}{% for value in [1] %}{% set foo="right" %}{% endfor %}{{ foo }}'});
            testTemplate.render().should.equal('right');
        });

        it('should set the global context from within a nested for loop when the variable is initialized outside of the loop', function () {
            const testTemplate = twig({data: '{% set k = 0 %}{% for i in 0..2 %}{% for j in 0..2 %}{{ k }}{% set k = k + 1 %}{% endfor %}{% endfor %}'});
            testTemplate.render().should.equal('012345678');
        });
    });
});

