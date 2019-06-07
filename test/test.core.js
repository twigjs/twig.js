const Twig = require('../twig').factory();

const {twig} = Twig;

const {mapTestDataToAssertions} = require('./helpers')(twig);

describe('Twig.js Core ->', function () {
    it('should save and load a template by reference', async function () {
        // Define and save a template
        twig({
            id: 'test',
            data: '{{ "test" }}'
        });

        // Load and render the template
        const testTemplate = twig({ref: 'test'});
        return testTemplate.render().should.be.fulfilledWith('test');
    });

    it('should ignore comments', function () {
        const templateData = [
            'good {# comment #}morning',
            'good{#comment#}morning'
        ];

        const expected = [
            'good morning',
            'goodmorning'
        ];

        return mapTestDataToAssertions(templateData, expected);
    });

    it('should ignore output tags within comments', function () {
        const templateData = [
            'good {# {{ "Hello" }} #}morning',
            'good{#c}}om{{m{{ent#}morning'
        ];

        const expected = [
            'good morning',
            'goodmorning'
        ];

        return mapTestDataToAssertions(templateData, expected);
    });

    it('should ignore logic tags within comments', function () {
        const templateData = [
            'test {# {% bad syntax if not in comment %} #}test',
            '{##}{##}test{# %}}}%}%{%{{% #}pass'
        ];

        const expected = [
            'test test',
            'testpass'
        ];

        return mapTestDataToAssertions(templateData, expected);
    });

    // https://github.com/justjohn/twig.js/issues/95
    it('should ignore quotation marks within comments', function () {
        const templateData = [
            'good {# don\'t stop #}morning',
            'good{#"dont stop"#}morning',
            'good {# "don\'t stop" #}morning',
            'good{#"\'#}morning',
            'good {#"\'"\'"\'#} day',
            'a {# \' #}b{# \' #} c'
        ];

        const expected = [
            'good morning',
            'goodmorning',
            'good morning',
            'goodmorning',
            'good  day',
            'a b c'
        ];

        return mapTestDataToAssertions(templateData, expected);
    });

    it('should be able to parse output tags with tag ends in strings', function () {
        // Really all we care about here is not throwing exceptions.
        const templateData = [
            '{{ "test" }}',
            '{{ " }} " }}',
            '{{ " \\"}} " }}',
            '{{ \' }} \' }}',
            '{{ \' \\\'}} \' }}',
            '{{ " \'}} " }}',
            '{{ \' "}} \' }}'
        ];

        const expected = [
            'test',
            ' }} ',
            ' "}} ',
            ' }} ',
            ' \'}} ',
            ' \'}} ',
            ' "}} '
        ];

        return mapTestDataToAssertions(templateData, expected);
    });

    it('should be able to parse whitespace control output tags', async function () {
        const templateData = [
            ' {{- "test" -}}',
            ' {{- "test" -}} ',
            '\n{{- "test" -}}',
            '{{- "test" -}}\n',
            '\n{{- "test" -}}\n',
            '\t{{- "test" -}}\t',
            '\n\t{{- "test" -}}\n\t',
            '123\n\t{{- "test" -}}\n\t456',
            '\n{{- [1,2 ,1+2 ] -}}\n',
            ' {{- "test" -}} {{- "test" -}}',
            '{{ "test" }} {{- "test" -}}',
            '{{- "test" -}} {{ "test" }}',
            '<>{{- "test" -}}<>'
        ];

        const expected = [
            'test',
            'test',
            'test',
            'test',
            'test',
            'test',
            'test',
            '123test456',
            '1,2,3',
            'testtest',
            'testtest',
            'testtest',
            '<>test<>'
        ];

        const testTemplate = twig({data: '\n{{- orp -}}\n'});

        return Promise.all([
            mapTestDataToAssertions(templateData, expected),
            testTemplate.render({orp: 'test'}).should.be.fulfilledWith('test')
        ]);
    });

    it('should be able to parse mismatched opening whitespace control output tags', async function () {
        const templateData = [
            ' {{- "test" }}',
            '{{- "test" }}\n',
            '\t{{- "test" }}\t',
            '123\n\t{{- "test" }}\n\t456',
            '\n{{- [1,2 ,1+2 ] }}\n',
            ' {{- "test" }} {{- "test" }}',
            '{{ "test" }} {{- "test" }}',
            ' {{- "test" }} {{ "test" }}',
            ' {{- "test" }} {{- "test" -}}',
            '<>{{- "test" }}'
        ];

        const expected = [
            'test',
            'test\n',
            'test\t',
            '123test\n\t456',
            '1,2,3\n',
            'testtest',
            'testtest',
            'test test',
            'testtest',
            '<>test'
        ];

        return mapTestDataToAssertions(templateData, expected);
    });

    it('should be able to parse mismatched closing whitespace control output tags', async function () {
        const templateData = [
            ' {{ "test" -}}',
            '\n{{ "test" -}}\n',
            '\t{{ "test" -}}\t',
            '123\n\t{{ "test" -}}\n\t456',
            '\n{{ [1,2 ,1+2 ] -}}\n',
            ' {{ "test" -}} {{ "test" -}}',
            '{{ "test" }} {{ "test" -}} ',
            ' {{ "test" -}} {{ "test" }} ',
            ' {{ "test" -}} {{- "test" -}}',
            '{{ "test" -}}<>'
        ];

        const expected = [
            ' test',
            '\ntest',
            '\ttest',
            '123\n\ttest456',
            '\n1,2,3',
            ' testtest',
            'test test',
            ' testtest ',
            ' testtest',
            'test<>'
        ];

        return mapTestDataToAssertions(templateData, expected);
    });

    it('should be able to parse whitespace control logic tags', async function () {
        // Newlines directly after logic tokens are ignored
        // So use double newlines
        const templateData = [
            '{%- if true -%}{{ "test" }}{% endif %}',
            '{%- if true -%}{{ "test" }}{%- endif -%}',
            ' {%- if true -%} {{ "test" }}{% endif %}',
            '\n{%- if true -%}\n\n{{ "test" }}{% endif %}',
            '\n\t{%- if true -%}\n\n\t{{ "test" }}{% endif %}',
            '123\n\t{%- if true -%}\n\n\t{{ "test" }}{% endif %}456',
            '\n\t{%- if true -%}\n\n\t{{ [1,2 ,1+2 ] }}{% endif %}',
            '<>{%- if true -%}test{% endif %}<>'
        ];

        const expected = [
            'test',
            'test',
            'test',
            'test',
            'test',
            '123test456',
            '1,2,3',
            '<>test<>'
        ];

        return mapTestDataToAssertions(templateData, expected);
    });

    it('should be able to parse mismatched opening whitespace control logic tags', async function () {
        const templateData = [
            '{%- if true %}{{ "test" }}{% endif %}',
            '{%- if true %}{{ "test" }}{% endif %}',
            ' {% if true %} {{ "test" }}{% endif %}',
            ' {%- if true %} {{ "test" }}{% endif %}',
            '\n{% if true %}\n\n{{ "test" }}{% endif %}',
            '\n{%- if true %}\n\n{{ "test" }}{% endif %}',
            '\n\t{%- if true %}\n\n\t{{ "test" }}{% endif %}',
            '123\n\t{%- if true %}\n\n\t{{ "test" }}{% endif %}456',
            '\n\t{%- if true %}\n\n\t{{ [1,2 ,1+2 ] }}{% endif %}',
            '<>{%- if true %}test{% endif %}'
        ];

        const expected = [
            'test',
            'test',
            '  test',
            ' test',
            '\n\ntest',
            '\ntest',
            '\n\ttest',
            '123\n\ttest456',
            '\n\t1,2,3',
            '<>test'
        ];

        return mapTestDataToAssertions(templateData, expected);
    });

    it('should be able to parse mismatched closing whitespace control logic tags', async function () {
        const templateData = [
            '{% if true %}{{ "test" }}{% endif %}',
            '{% if true -%} {{ "test" }}{% endif %}',
            ' {% if true -%} {{ "test" }}{% endif %}',
            ' {% if true -%} {{ "test" }}{% endif %}',
            '\n{% if true %}\n\n{{ "test" }}{% endif %}',
            '\n{% if true -%}\n\n{{ "test" }}{% endif %}',
            '\n\t{% if true -%}\n\n\t{{ "test" }}{% endif %}',
            '123\n\t{% if true -%}\n\n\t{{ "test" }}{% endif %}456',
            '\n\t{% if true -%}\n\n\t{{ [1,2 ,1+2 ] }}{% endif %}',
            '{% if true -%}<>test{% endif %}'
        ];

        const expected = [
            'test',
            'test',
            ' test',
            ' test',
            '\n\ntest',
            '\ntest',
            '\n\ttest',
            '123\n\ttest456',
            '\n\t1,2,3',
            '<>test'
        ];

        return mapTestDataToAssertions(templateData, expected);
    });

    it('should be able to output numbers', async function () {
        const templateData = [
            '{{ 12 }}',
            '{{ 12.64 }}',
            '{{ 0.64 }}'
        ];

        const expected = [
            '12',
            '12.64',
            '0.64'
        ];

        return mapTestDataToAssertions(templateData, expected);
    });

    it('should be able to output booleans', async function () {
        const templateData = [
            '{{ true }}',
            '{{ false }}'
        ];

        const expected = [
            'true',
            'false'
        ];

        return mapTestDataToAssertions(templateData, expected);
    });

    it('should be able to output strings', async function () {
        const templateData = [
            '{{ "double" }}',
            '{{ \'single\' }}',
            '{{ "dou\'ble" }}',
            '{{ \'sin"gle\' }}',
            '{{ "dou\\"ble" }}',
            '{{ \'sin\\\'gle\' }}'
        ];

        const expected = [
            'double',
            'single',
            'dou\'ble',
            'sin"gle',
            'dou"ble',
            'sin\'gle'
        ];

        return mapTestDataToAssertions(templateData, expected);
    });
    it('should be able to output strings with newlines', async function () {
        const testTemplate = twig({data: '{{ \'a\nb\rc\r\nd\' }}'});
        return testTemplate.render().should.be.fulfilledWith('a\nb\rc\r\nd');
    });
    it('should be able to output arrays', async function () {
        const templateData = [
            '{{ [1] }}',
            '{{ [1,2 ,3 ] }}',
            '{{ ["[to",\'the\' ,"string]" ] }}',
            '{{ ["[to",\'the\' ,"str\\"ing]" ] }}'
        ];

        const expected = [
            '1',
            '1,2,3',
            '[to,the,string]',
            '[to,the,str"ing]'
        ];

        const testTemplate = twig({data: '{{ [1,2 ,3 , val ] }}'});

        return Promise.all([
            mapTestDataToAssertions(templateData, expected),
            testTemplate.render({val: 4}).should.be.fulfilledWith('1,2,3,4')
        ]);
    });
    it('should be able to output parse expressions in an array', async function () {
        const templateData = [
            '{{ [1,2 ,3 , "-", [4,5, 6] ] }}',
            '{{ [a,b ,(1+2) * a ] }}',
            '{{ [not a, b] }}',
            '{{ [a, not b] }}'
        ];

        const expected = [
            '1,2,3,-,4,5,6',
            '1,2,3',
            'true,true',
            'true,true'
        ];

        const contexts = [
            {val: 4},
            {a: 1, b: 2},
            {a: false, b: true},
            {a: true, b: false}
        ];

        const testTemplate = twig({data: '{{ [1,2 ,1+2 ] }}'});

        return Promise.all([
            mapTestDataToAssertions(templateData, expected, contexts),
            testTemplate.render().should.be.fulfilledWith('1,2,3')
        ]);
    });
    it('should be able to output variables', async function () {
        const templateData = [
            '{{ orp }}',
            '{{ val }}'
        ];

        const expected = [
            'test',
            'test'
        ];

        const contexts = [
            {orp: 'test'},
            {val() {
                return 'test';
            }}
        ];

        return mapTestDataToAssertions(templateData, expected, contexts);
    });

    it('should recognize null', async function () {
        const expected = [
            'true',
            'true',
            'false',
            'false',
            'false'
        ];

        const contexts = [
            {val: null},
            {val: undefined},
            {val: 'test'},
            {val: 0},
            {val: false}
        ];

        return mapTestDataToAssertions('{{ null == val }}', expected, contexts);
    });

    it('should recognize object literals', async function () {
        const testTemplate = twig({data: '{% set at = {"foo": "test", bar: "other", 1:"zip"} %}{{ at.foo ~ at.bar ~ at.1 }}'});
        return testTemplate.render().should.be.fulfilledWith('testotherzip');
    });

    it('should allow newlines in object literals', async function () {
        const testTemplate = twig({data: '{% set at = {\n"foo": "test",\rbar: "other",\r\n1:"zip"\n} %}{{ at.foo ~ at.bar ~ at.1 }}'});
        return testTemplate.render().should.be.fulfilledWith('testotherzip');
    });

    it('should recognize null in an object', async function () {
        const testTemplate = twig({data: '{% set at = {"foo": null} %}{{ at.foo == val }}'});
        return testTemplate.render({val: null}).should.be.fulfilledWith('true');
    });

    it('should allow int 0 as a key in an object', async function () {
        const testTemplate = twig({data: '{% set at = {0: "value"} %}{{ at.0 }}'});
        return testTemplate.render().should.be.fulfilledWith('value');
    });

    it('should support set capture', async function () {
        const testTemplate = twig({data: '{% set foo %}bar{% endset %}{{foo}}'});
        return testTemplate.render().should.be.fulfilledWith('bar');
    });

    it('should support raw data', async function () {
        const testTemplate = twig({
            data: 'before {% raw %}{{ test }} {% test2 %} {{{% endraw %} after'
        });
        return testTemplate.render().should.be.fulfilledWith(
            'before {{ test }} {% test2 %} {{ after'
        );
    });

    it('should support raw data using \'verbatim\' tag', async function () {
        const testTemplate = twig({
            data: 'before {% verbatim %}{{ test }} {% test2 %} {{{% endverbatim %} after'
        });
        return testTemplate.render().should.be.fulfilledWith(
            'before {{ test }} {% test2 %} {{ after'
        );
    });

    describe('Key Notation ->', function () {
        it('should support dot key notation', async function () {
            const testTemplate = twig({
                data: '{{ key.value }} {{ key.sub.test }}'
            });
            return testTemplate.render({
                key: {
                    value: 'test',
                    sub: {
                        test: 'value'
                    }
                }
            }).should.be.fulfilledWith('test value');
        });
        it('should support square bracket key notation', async function () {
            const testTemplate = twig({
                data: '{{ key["value"] }} {{ key[\'sub\']["test"] }}'
            });
            return testTemplate.render({
                key: {
                    value: 'test',
                    sub: {
                        test: 'value'
                    }
                }
            }).should.be.fulfilledWith('test value');
        });
        it('should support mixed dot and bracket key notation', async function () {
            const testTemplate = twig({
                data: '{{ key["value"] }} {{ key.sub[key.value] }} {{ s.t["u"].v["w"] }}'
            });
            return testTemplate.render({
                key: {
                    value: 'test',
                    sub: {
                        test: 'value'
                    }
                },
                s: {t: {u: {v: {w: 'x'}}}}
            }).should.be.fulfilledWith('test value x');
        });

        it('should support dot key notation after a function', async function () {
            const testTemplate = twig({data: '{{ key.fn().value }}'});
            return testTemplate.render({
                key: {
                    fn() {
                        return {
                            value: 'test'
                        };
                    }
                }
            }).should.be.fulfilledWith('test');
        });

        it('should support bracket key notation after a function', async function () {
            const testTemplate = twig({data: '{{ key.fn()["value"] }}'});
            return testTemplate.render({
                key: {
                    fn() {
                        return {
                            value: 'test 2'
                        };
                    }
                }
            }).should.be.fulfilledWith('test 2');
        });

        it('should check for getKey methods if a key doesn\'t exist.', async function () {
            const testTemplate = twig({data: '{{ obj.value }}'});
            return testTemplate.render({
                obj: {
                    getValue() {
                        return 'val';
                    },
                    isValue() {
                        return 'not val';
                    }
                }
            }).should.be.fulfilledWith('val');
        });

        it('should check for isKey methods if a key doesn\'t exist.', async function () {
            const testTemplate = twig({data: '{{ obj.value }}'});
            return testTemplate.render({
                obj: {
                    isValue() {
                        return 'val';
                    }
                }
            }).should.be.fulfilledWith('val');
        });

        it('should check for getKey methods on prototype objects.', async function () {
            const object = {
                getValue() {
                    return 'val';
                }
            };
            function Subobj() {}
            Subobj.prototype = object;
            const subobj = new Subobj();

            const testTemplate = twig({data: '{{ obj.value }}'});
            return testTemplate.render({
                obj: subobj
            }).should.be.fulfilledWith('val');
        });

        it('should return null if a period key doesn\'t exist.', async function () {
            const testTemplate = twig({data: '{{ obj.value == null }}'});
            return testTemplate.render({
                obj: {}
            }).should.be.fulfilledWith('true');
        });

        it('should return null if a bracket key doesn\'t exist.', async function () {
            const testTemplate = twig({data: '{{ obj["value"] == null }}'});
            return testTemplate.render({
                obj: {}
            }).should.be.fulfilledWith('true');
        });
    });

    describe('Context ->', function () {
        it('should be supported', async function () {
            const testTemplate = twig({data: '{{ _context.value }}'});
            return testTemplate.render({
                value: 'test'
            }).should.be.fulfilledWith('test');
        });

        it('should be an object even if it\'s not passed', async function () {
            const testTemplate = twig({data: '{{ _context|json_encode }}'});
            return testTemplate.render().should.be.fulfilledWith('{}');
        });

        it('should support {% set %} tag', async function () {
            const testTemplate = twig({data: '{% set value = "test" %}{{ _context.value }}'});
            return testTemplate.render().should.be.fulfilledWith('test');
        });

        it('should work correctly with properties named dynamically', async function () {
            const testTemplate = twig({data: '{{ _context[key] }}'});
            return testTemplate.render({
                key: 'value',
                value: 'test'
            }).should.be.fulfilledWith('test');
        });

        it('should not allow to override context using {% set %}', async function () {
            const templateData = [
                '{% set _context = "test" %}{{ _context|json_encode }}',
                '{% set _context = "test" %}{{ _context._context }}'
            ];

            const expected = [
                '{"_context":"test"}',
                'test'
            ];

            return mapTestDataToAssertions(templateData, expected);
        });

        it('should support autoescape option', async function () {
            const testTemplate = twig({
                autoescape: true,
                data: '&& {{ value }} &&'
            });

            return testTemplate.render({
                value: '<test>&</test>'
            }).should.be.fulfilledWith('&& &lt;test&gt;&amp;&lt;/test&gt; &&');
        });

        it('should not autoescape includes', async function () {
            twig({id: 'included2', data: '& {{ value }} &'});

            const testTemplate = twig({
                allowInlineIncludes: true,
                autoescape: true,
                data: '&& {% include "included2" %} &&'
            });

            return testTemplate.render({
                value: '&'
            }).should.be.fulfilledWith('&& & &amp; & &&');
        });

        it('should not autoescape includes having a parent', async function () {
            twig({id: 'included3', data: '{% extends "parent2" %}{% block body %}& {{ value }} &{% endblock %}'});
            twig({id: 'parent2', data: '&& {% block body %}{% endblock body %} &&'});

            const testTemplate = twig({
                allowInlineIncludes: true,
                autoescape: true,
                data: '&&& {% include "included3" %} &&&'
            });

            return testTemplate.render({
                value: '&'
            }).should.be.fulfilledWith('&&& && & &amp; & && &&&');
        });

        it('should not autoescape embeds having a parent', async function () {
            twig({id: 'included4', data: '{% embed "parent3" %}{% block body %}& {{ value }} &{% endblock %}{% endembed %}'});
            twig({id: 'parent3', data: '&& {% block body %}{% endblock body %} &&'});

            const testTemplate = twig({
                allowInlineIncludes: true,
                autoescape: true,
                data: '&&& {% include "included4" %} &&&'
            });

            return testTemplate.render({value: '&'}).should.be.fulfilledWith('&&& && & &amp; & && &&&');
        });

        it('should support autoescape option with alternative strategy', async function () {
            const testTemplate = twig({
                autoescape: 'js',
                data: '{{ value }}'
            });

            return testTemplate.render({
                value: '<test>&</test>'
            }).should.be.fulfilledWith('\\x3Ctest\\x3E\\x26\\x3C\\x2Ftest\\x3E');
        });

        it('should not auto escape html_attr within the html strategy', async function () {
            const testTemplate = twig({
                autoescape: 'html',
                data: '{{ value|escape(\'html_attr\') }}'
            });

            return testTemplate.render({
                value: '" onclick="alert(\\"html_attr\\")"'
            }).should.be.fulfilledWith('&quot;&#x20;onclick&#x3D;&quot;alert&#x28;&#x5C;&quot;html_attr&#x5C;&quot;&#x29;&quot;');
        });

        it('should return a usable string after autoescaping', async function () {
            const testTemplate = twig({
                autoescape: true,
                data: '{{ value }}'
            });

            const result = await testTemplate.render({
                value: '<test>&</test>'
            });

            (typeof result).should.equal('string');
            result.valueOf().should.equal(result);
        });

        it('should autoescape parent() output correctly', async function () {
            twig({id: 'parent1', data: '{% block body %}<p>{{ value }}</p>{% endblock body %}'});

            const testTemplate = twig({
                allowInlineIncludes: true,
                autoescape: true,
                data: '{% extends "parent1" %}{% block body %}{{ parent() }}{% endblock %}'
            });

            const result = await testTemplate.render({
                value: '<test>&</test>'
            });

            result.should.be.equal('<p>&lt;test&gt;&amp;&lt;/test&gt;</p>');
        });

        it('should use a correct context in the extended template', async function () {
            twig({id: 'parent', data: '{% block body %}{{ value }}{% endblock body %}'});

            const testTemplate = twig({
                allowInlineIncludes: true,
                data: '{% extends "parent" %}{% set value = "test" %}{% block body %}{{ parent() }}{% endblock %}'
            });

            return testTemplate.render().should.be.fulfilledWith('test');
        });

        it('should use a correct context in the included template', async function () {
            twig({id: 'included', data: '{{ value }}\n{% set value = "inc" %}{{ value }}\n'});

            const testTemplate = twig({
                allowInlineIncludes: true,
                data: '{% set value = "test" %}{% for i in [0, 1] %}{% include "included" %}{% endfor %}{{ value }}'
            });

            return testTemplate.render().should.be.fulfilledWith('test\ninc\ntest\ninc\ntest');
        });

        it('should use the correct context for variables in the included template name', async function () {
            twig({
                id: 'included-template',
                data: '{{ value }} - {{ prefix }}'
            });

            const testTemplate = twig({
                allowInlineIncludes: true,
                data: '{% include prefix ~ "-template" with {"value": value} only %}'
            });

            return testTemplate.render({
                prefix: 'included',
                value: 'test'
            }).should.be.fulfilledWith('test - ');
        });
    });

    describe('Imports ->', function () {
        it('should load an inline include when the file exists', async function () {
            const testTemplate = twig({
                allowInlineIncludes: true,
                rethrow: true,
                data: '{% include \'test/templates/simple.twig\' %}'
            });

            return testTemplate.render({}).should.not.be.rejected();
        });

        it('should throw when trying to load an inline include and the file does not exist', async function () {
            const testTemplate = twig({
                allowInlineIncludes: true,
                rethrow: true,
                data: '{% include \'test/templates/doesnt-exist-ever.twig\' %}'
            });

            return testTemplate.render({}).should.be.rejectedWith(/Unable to find template file/);
        });
    });
});

