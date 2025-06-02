const Twig = require('..').factory();

const {twig} = Twig;

describe('Twig.js Core ->', function () {
    it('should save and load a template by reference', function () {
        // Define and save a template
        twig({
            id: 'test',
            data: '{{ "test" }}'
        });

        // Load and render the template
        twig({ref: 'test'}).render()
            .should.equal('test');
    });

    it('should ignore comments', function () {
        twig({data: 'good {# comment #}morning'}).render().should.equal('good morning');
        twig({data: 'good{#comment#}morning'}).render().should.equal('goodmorning');
    });

    it('should ignore output tags within comments', function () {
        twig({data: 'good {# {{ "Hello" }} #}morning'}).render().should.equal('good morning');
        twig({data: 'good{#c}}om{{m{{ent#}morning'}).render().should.equal('goodmorning');
    });

    it('should ignore logic tags within comments', function () {
        twig({data: 'test {# {% bad syntax if not in comment %} #}test'}).render().should.equal('test test');
        twig({data: '{##}{##}test{# %}}}%}%{%{{% #}pass'}).render().should.equal('testpass');
    });

    // https://github.com/justjohn/twig.js/issues/95
    it('should ignore quotation marks within comments', function () {
        twig({data: 'good {# don\'t stop #}morning'}).render().should.equal('good morning');
        twig({data: 'good{#"dont stop"#}morning'}).render().should.equal('goodmorning');
        twig({data: 'good {# "don\'t stop" #}morning'}).render().should.equal('good morning');
        twig({data: 'good{#"\'#}morning'}).render().should.equal('goodmorning');
        twig({data: 'good {#"\'"\'"\'#} day'}).render().should.equal('good  day');
        twig({data: 'a {# \' #}b{# \' #} c'}).render().should.equal('a b c');
    });

    it('should be able to parse output tags with tag ends in strings', function () {
        // Really all we care about here is not throwing exceptions.
        twig({data: '{{ "test" }}'}).render().should.equal('test');
        twig({data: '{{ " }} " }}'}).render().should.equal(' }} ');
        twig({data: '{{ " \\"}} " }}'}).render().should.equal(' "}} ');
        twig({data: '{{ \' }} \' }}'}).render().should.equal(' }} ');
        twig({data: '{{ \' \\\'}} \' }}'}).render().should.equal(' \'}} ');

        twig({data: '{{ " \'}} " }}'}).render().should.equal(' \'}} ');
        twig({data: '{{ \' "}} \' }}'}).render().should.equal(' "}} ');
    });

    it('should be able to parse whitespace control output tags', function () {
        twig({data: ' {{- "test" -}}'}).render().should.equal('test');
        twig({data: ' {{- "test" -}} '}).render().should.equal('test');
        twig({data: '\n{{- "test" -}}'}).render().should.equal('test');
        twig({data: '{{- "test" -}}\n'}).render().should.equal('test');
        twig({data: '\n{{- "test" -}}\n'}).render().should.equal('test');
        twig({data: '\t{{- "test" -}}\t'}).render().should.equal('test');
        twig({data: '\n\t{{- "test" -}}\n\t'}).render().should.equal('test');
        twig({data: '123\n\t{{- "test" -}}\n\t456'}).render().should.equal('123test456');
        twig({data: '\n{{- orp -}}\n'}).render({orp: 'test'}).should.equal('test');
        twig({data: '\n{{- [1,2 ,1+2 ] -}}\n'}).render().should.equal('1,2,3');
        twig({data: ' {{- "test" -}} {{- "test" -}}'}).render().should.equal('testtest');
        twig({data: '{{ "test" }} {{- "test" -}}'}).render().should.equal('testtest');
        twig({data: '{{- "test" -}} {{ "test" }}'}).render().should.equal('testtest');
        twig({data: '<>{{- "test" -}}<>'}).render().should.equal('<>test<>');
    });

    it('should be able to parse mismatched opening whitespace control output tags', function () {
        twig({data: ' {{- "test" }}'}).render().should.equal('test');
        twig({data: '{{- "test" }}\n'}).render().should.equal('test\n');
        twig({data: '\t{{- "test" }}\t'}).render().should.equal('test\t');
        twig({data: '123\n\t{{- "test" }}\n\t456'}).render().should.equal('123test\n\t456');
        twig({data: '\n{{- [1,2 ,1+2 ] }}\n'}).render().should.equal('1,2,3\n');
        twig({data: ' {{- "test" }} {{- "test" }}'}).render().should.equal('testtest');
        twig({data: '{{ "test" }} {{- "test" }}'}).render().should.equal('testtest');
        twig({data: ' {{- "test" }} {{ "test" }}'}).render().should.equal('test test');
        twig({data: ' {{- "test" }} {{- "test" -}}'}).render().should.equal('testtest');
        twig({data: '<>{{- "test" }}'}).render().should.equal('<>test');
    });

    it('should be able to parse mismatched closing whitespace control output tags', function () {
        twig({data: ' {{ "test" -}}'}).render().should.equal(' test');
        twig({data: '\n{{ "test" -}}\n'}).render().should.equal('\ntest');
        twig({data: '\t{{ "test" -}}\t'}).render().should.equal('\ttest');
        twig({data: '123\n\t{{ "test" -}}\n\t456'}).render().should.equal('123\n\ttest456');
        twig({data: '\n{{ [1,2 ,1+2 ] -}}\n'}).render().should.equal('\n1,2,3');
        twig({data: ' {{ "test" -}} {{ "test" -}}'}).render().should.equal(' testtest');
        twig({data: '{{ "test" }} {{ "test" -}} '}).render().should.equal('test test');
        twig({data: ' {{ "test" -}} {{ "test" }} '}).render().should.equal(' testtest ');
        twig({data: ' {{ "test" -}} {{- "test" -}}'}).render().should.equal(' testtest');
        twig({data: '{{ "test" -}}<>'}).render().should.equal('test<>');
    });

    it('should be able to parse whitespace control logic tags', function () {
        // Newlines directly after logic tokens are ignored
        // So use double newlines
        twig({data: '{%- if true -%}{{ "test" }}{% endif %}'}).render().should.equal('test');
        twig({data: '{%- if true -%}{{ "test" }}{%- endif -%}'}).render().should.equal('test');
        twig({data: ' {%- if true -%} {{ "test" }}{% endif %}'}).render().should.equal('test');
        twig({data: '\n{%- if true -%}\n\n{{ "test" }}{% endif %}'}).render().should.equal('test');
        twig({data: '\n\t{%- if true -%}\n\n\t{{ "test" }}{% endif %}'}).render().should.equal('test');
        twig({data: '123\n\t{%- if true -%}\n\n\t{{ "test" }}{% endif %}456'}).render().should.equal('123test456');
        twig({data: '\n\t{%- if true -%}\n\n\t{{ [1,2 ,1+2 ] }}{% endif %}'}).render().should.equal('1,2,3');
        twig({data: '<>{%- if true -%}test{% endif %}<>'}).render().should.equal('<>test<>');
        twig({data: '{% if true -%}no_right_trim {{ "test" }}{% endif %}'}).render().should.equal('no_right_trim test');
        twig({data: '{% if true %}{{ "test" }} no_left_trim{%- endif %}'}).render().should.equal('test no_left_trim');
    });

    it('should be able to parse mismatched opening whitespace control logic tags', function () {
        twig({data: '{%- if true %}{{ "test" }}{% endif %}'}).render().should.equal('test');
        twig({data: '{%- if true %}{{ "test" }}{% endif %}'}).render().should.equal('test');
        twig({data: ' {% if true %} {{ "test" }}{% endif %}'}).render().should.equal('  test');
        twig({data: ' {%- if true %} {{ "test" }}{% endif %}'}).render().should.equal(' test');
        twig({data: '\n{% if true %}\n\n{{ "test" }}{% endif %}'}).render().should.equal('\n\ntest');
        twig({data: '\n{%- if true %}\n\n{{ "test" }}{% endif %}'}).render().should.equal('\ntest');
        twig({data: '\n\t{%- if true %}\n\n\t{{ "test" }}{% endif %}'}).render().should.equal('\n\ttest');
        twig({data: '123\n\t{%- if true %}\n\n\t{{ "test" }}{% endif %}456'}).render().should.equal('123\n\ttest456');
        twig({data: '\n\t{%- if true %}\n\n\t{{ [1,2 ,1+2 ] }}{% endif %}'}).render().should.equal('\n\t1,2,3');
        twig({data: '<>{%- if true %}test{% endif %}'}).render().should.equal('<>test');
    });

    it('should be able to parse mismatched closing whitespace control logic tags', function () {
        twig({data: '{% if true %}{{ "test" }}{% endif %}'}).render().should.equal('test');
        twig({data: '{% if true -%} {{ "test" }}{% endif %}'}).render().should.equal('test');
        twig({data: ' {% if true -%} {{ "test" }}{% endif %}'}).render().should.equal(' test');
        twig({data: ' {% if true -%} {{ "test" }}{% endif %}'}).render().should.equal(' test');
        twig({data: '\n{% if true %}\n\n{{ "test" }}{% endif %}'}).render().should.equal('\n\ntest');
        twig({data: '\n{% if true -%}\n\n{{ "test" }}{% endif %}'}).render().should.equal('\ntest');
        twig({data: '\n\t{% if true -%}\n\n\t{{ "test" }}{% endif %}'}).render().should.equal('\n\ttest');
        twig({data: '123\n\t{% if true -%}\n\n\t{{ "test" }}{% endif %}456'}).render().should.equal('123\n\ttest456');
        twig({data: '\n\t{% if true -%}\n\n\t{{ [1,2 ,1+2 ] }}{% endif %}'}).render().should.equal('\n\t1,2,3');
        twig({data: '{% if true -%}<>test{% endif %}'}).render().should.equal('<>test');
    });

    it('should be able to output numbers', function () {
        twig({data: '{{ 12 }}'}).render().should.equal('12');
        twig({data: '{{ 12.64 }}'}).render().should.equal('12.64');
        twig({data: '{{ 0.64 }}'}).render().should.equal('0.64');
    });

    it('should be able to output booleans', function () {
        twig({data: '{{ true }}'}).render().should.equal('true');
        twig({data: '{{ false }}'}).render().should.equal('false');
    });

    it('should be able to output booleans (PHP style)', function () {
        twig({phpStyleBooleans: true, data: '{{ false }}'}).render().should.equal('');
        twig({phpStyleBooleans: true, data: '{{ true }}'}).render().should.equal('1');
    });

    it('should be able to output strings', function () {
        twig({data: '{{ "double" }}'}).render().should.equal('double');
        twig({data: '{{ \'single\' }}'}).render().should.equal('single');
        twig({data: '{{ "dou\'ble" }}'}).render().should.equal('dou\'ble');
        twig({data: '{{ \'sin"gle\' }}'}).render().should.equal('sin"gle');
        twig({data: '{{ "dou\\"ble" }}'}).render().should.equal('dou"ble');
        twig({data: '{{ \'sin\\\'gle\' }}'}).render().should.equal('sin\'gle');
    });
    it('should be able to output strings with newlines', function () {
        twig({data: '{{ \'a\nb\rc\r\nd\' }}'}).render().should.equal('a\nb\rc\r\nd');
    });
    it('should be able to output arrays', function () {
        twig({data: '{{ [1] }}'}).render().should.equal('1');
        twig({data: '{{ [1,2 ,3 ] }}'}).render().should.equal('1,2,3');
        twig({data: '{{ [1,2 ,3 , val ] }}'}).render({val: 4}).should.equal('1,2,3,4');
        twig({data: '{{ ["[to",\'the\' ,"string]" ] }}'}).render().should.equal('[to,the,string]');
        twig({data: '{{ ["[to",\'the\' ,"str\\"ing]" ] }}'}).render().should.equal('[to,the,str"ing]');
    });
    it('should be able to output parse expressions in an array', function () {
        twig({data: '{{ [1,2 ,1+2 ] }}'}).render().should.equal('1,2,3');
        twig({data: '{{ [1,2 ,3 , "-", [4,5, 6] ] }}'}).render({val: 4}).should.equal('1,2,3,-,4,5,6');
        twig({data: '{{ [a,b ,(1+2) * a ] }}'}).render({a: 1, b: 2}).should.equal('1,2,3');

        twig({data: '{{ [not a, b] }}'}).render({a: false, b: true}).should.equal('true,true');
        twig({data: '{{ [a, not b] }}'}).render({a: true, b: false}).should.equal('true,true');
    });
    it('should be able to output variables', function () {
        twig({data: '{{ orp }}'}).render({orp: 'test'}).should.equal('test');
        twig({data: '{{ val }}'}).render({val() {
            return 'test';
        }}).should.equal('test');
    });

    it('should recognize null', function () {
        twig({data: '{{ null == val }}'}).render({val: null}).should.equal('true');
        twig({data: '{{ null == val }}'}).render({val: undefined}).should.equal('true');

        twig({data: '{{ null == val }}'}).render({val: 'test'}).should.equal('false');
        twig({data: '{{ null == val }}'}).render({val: 0}).should.equal('false');
        twig({data: '{{ null == val }}'}).render({val: false}).should.equal('false');
    });

    it('should recognize object literals', function () {
        twig({data: '{% set at = {"foo": "test", bar: "other", 1:"zip"} %}{{ at.foo ~ at.bar ~ at.1 }}'}).render().should.equal('testotherzip');
    });

    it('should allow newlines in object literals', function () {
        twig({data: '{% set at = {\n"foo": "test",\rbar: "other",\r\n1:"zip"\n} %}{{ at.foo ~ at.bar ~ at.1 }}'}).render().should.equal('testotherzip');
    });

    it('should recognize null in an object', function () {
        twig({data: '{% set at = {"foo": null} %}{{ at.foo == val }}'}).render({val: null}).should.equal('true');
    });

    it('should allow int 0 as a key in an object', function () {
        twig({data: '{% set at = {0: "value"} %}{{ at.0 }}'}).render().should.equal('value');
    });

    it('should support set capture', function () {
        twig({data: '{% set foo %}bar{% endset %}{{foo}}'}).render().should.equal('bar');
    });

    it('should support raw data', function () {
        twig({
            data: 'before {% raw %}{{ test }} {% test2 %} {{{% endraw %} after'
        }).render().should.equal(
            'before {{ test }} {% test2 %} {{ after'
        );
    });

    it('should support raw data using \'verbatim\' tag', function () {
        twig({
            data: 'before {% verbatim %}{{ test }} {% test2 %} {{{% endverbatim %} after'
        }).render().should.equal(
            'before {{ test }} {% test2 %} {{ after'
        );
    });

    describe('Key Notation ->', function () {
        it('should support dot key notation', function () {
            twig({data: '{{ key.value }} {{ key.sub.test }}'}).render({
                key: {
                    value: 'test',
                    sub: {
                        test: 'value'
                    }
                }
            }).should.equal('test value');
        });
        it('should support square bracket key notation', function () {
            twig({data: '{{ key["value"] }} {{ key[\'sub\']["test"] }}'}).render({
                key: {
                    value: 'test',
                    sub: {
                        test: 'value'
                    }
                }
            }).should.equal('test value');
        });
        it('should support mixed dot and bracket key notation', function () {
            twig({data: '{{ key["value"] }} {{ key.sub[key.value] }} {{ s.t["u"].v["w"] }}'}).render({
                key: {
                    value: 'test',
                    sub: {
                        test: 'value'
                    }
                },
                s: {t: {u: {v: {w: 'x'}}}}
            }).should.equal('test value x');
        });

        it('should support dot key notation after a function', function () {
            const testTemplate = twig({data: '{{ key.fn().value }}'});
            const output = testTemplate.render({
                key: {
                    fn() {
                        return {
                            value: 'test'
                        };
                    }
                }
            });
            output.should.equal('test');
        });

        it('should support bracket key notation after a function', function () {
            const testTemplate = twig({data: '{{ key.fn()["value"] }}'});
            const output = testTemplate.render({
                key: {
                    fn() {
                        return {
                            value: 'test 2'
                        };
                    }
                }
            });
            output.should.equal('test 2');
        });

        it('should check for getKey methods if a key doesn\'t exist.', function () {
            twig({data: '{{ obj.value }}'}).render({
                obj: {
                    getValue() {
                        return 'val';
                    },
                    isValue() {
                        return 'not val';
                    }
                }
            }).should.equal('val');
        });

        it('should check for isKey methods if a key doesn\'t exist.', function () {
            twig({data: '{{ obj.value }}'}).render({
                obj: {
                    isValue() {
                        return 'val';
                    }
                }
            }).should.equal('val');
        });

        it('should check for getKey methods on prototype objects.', function () {
            const object = {
                getValue() {
                    return 'val';
                }
            };
            function Subobj() {}
            Subobj.prototype = object;
            const subobj = new Subobj();

            twig({data: '{{ obj.value }}'}).render({
                obj: subobj
            }).should.equal('val');
        });

        it('should return null if a period key doesn\'t exist.', function () {
            twig({data: '{{ obj.value == null }}'}).render({
                obj: {}
            }).should.equal('true');
        });

        it('should return null if a bracket key doesn\'t exist.', function () {
            twig({data: '{{ obj["value"] == null }}'}).render({
                obj: {}
            }).should.equal('true');
        });
    });

    describe('Context ->', function () {
        it('should be supported', function () {
            twig({data: '{{ _context.value }}'}).render({
                value: 'test'
            }).should.equal('test');
        });

        it('should be an object even if it\'s not passed', function () {
            twig({data: '{{ _context|json_encode }}'}).render().should.equal('{}');
        });

        it('should support {% set %} tag', function () {
            twig({data: '{% set value = "test" %}{{ _context.value }}'}).render().should.equal('test');
        });

        it('should work correctly with properties named dynamically', function () {
            twig({data: '{{ _context[key] }}'}).render({
                key: 'value',
                value: 'test'
            }).should.equal('test');
        });

        it('should not allow to override context using {% set %}', function () {
            twig({data: '{% set _context = "test" %}{{ _context|json_encode }}'}).render().should.equal('{"_context":"test"}');
            twig({data: '{% set _context = "test" %}{{ _context._context }}'}).render().should.equal('test');
        });

        it('should support autoescape option', function () {
            twig({
                autoescape: true,
                data: '&& {{ value }} &&'
            }).render({
                value: '<test>&</test>'
            }).should.equal('&& &lt;test&gt;&amp;&lt;/test&gt; &&');
        });

        it('should not autoescape includes', function () {
            twig({id: 'included2', data: '& {{ value }} &'});
            twig({
                allowInlineIncludes: true,
                autoescape: true,
                data: '&& {% include "included2" %} &&'
            }).render({value: '&'}).should.equal('&& & &amp; & &&');
        });

        it('should not autoescape includes having a parent', function () {
            twig({id: 'included3', data: '{% extends "parent2" %}{% block body %}& {{ value }} &{% endblock %}'});
            twig({id: 'parent2', data: '&& {% block body %}{% endblock body %} &&'});
            twig({
                allowInlineIncludes: true,
                autoescape: true,
                data: '&&& {% include "included3" %} &&&'
            }).render({value: '&'}).should.equal('&&& && & &amp; & && &&&');
        });

        it('should not autoescape embeds having a parent', function () {
            twig({id: 'included4', data: '{% embed "parent3" %}{% block body %}& {{ value }} &{% endblock %}{% endembed %}'});
            twig({id: 'parent3', data: '&& {% block body %}{% endblock body %} &&'});
            twig({
                allowInlineIncludes: true,
                autoescape: true,
                data: '&&& {% include "included4" %} &&&'
            }).render({value: '&'}).should.equal('&&& && & &amp; & && &&&');
        });

        it('should support autoescape option with alternative strategy', function () {
            twig({
                autoescape: 'js',
                data: '{{ value }}'
            }).render({
                value: '<test>&</test>'
            }).should.equal('\\u003Ctest\\u003E\\u0026\\u003C\\/test\\u003E');
        });

        it('should not auto escape html_attr within the html strategy', function () {
            twig({
                autoescape: 'html',
                data: '{{ value|escape(\'html_attr\') }}'
            }).render({
                value: '" onclick="alert(\\"html_attr\\")"'
            }).should.equal('&quot;&#x20;onclick&#x3D;&quot;alert&#x28;&#x5C;&quot;html_attr&#x5C;&quot;&#x29;&quot;');
        });

        it('should return a usable string after autoescaping', function () {
            const result = twig({
                autoescape: true,
                data: '{{ value }}'
            }).render({
                value: '<test>&</test>'
            });

            (typeof result).should.equal('string');
            result.valueOf().should.equal(result);
        });

        it('should autoescape parent() output correctly', function () {
            twig({id: 'parent1', data: '{% block body %}<p>{{ value }}</p>{% endblock body %}'});
            twig({
                allowInlineIncludes: true,
                autoescape: true,
                data: '{% extends "parent1" %}{% block body %}{{ parent() }}{% endblock %}'
            }).render({
                value: '<test>&</test>'
            }).should.equal('<p>&lt;test&gt;&amp;&lt;/test&gt;</p>');
        });

        it('should autoescape handle empty include', function () {
            twig({id: 'included-return', data: ''});
            twig({
                allowInlineIncludes: true,
                autoescape: true,
                data: '{% include "included-return" %}'
            }).render().should.equal('');
        });

        it('should use a correct context in the extended template', function () {
            twig({id: 'parent', data: '{% block body %}{{ value }}{% endblock body %}'});
            twig({
                allowInlineIncludes: true,
                data: '{% extends "parent" %}{% set value = "test" %}{% block body %}{{ parent() }}{% endblock %}'
            }).render().should.equal('test');
        });

        it('should use a correct context in the included template', function () {
            twig({id: 'included', data: '{{ value }}\n{% set value = "inc" %}{{ value }}\n'});
            twig({
                allowInlineIncludes: true,
                data: '{% set value = "test" %}{% for i in [0, 1] %}{% include "included" %}{% endfor %}{{ value }}'
            }).render().should.equal('test\ninc\ntest\ninc\ntest');
        });

        it('should use the correct context for variables in the included template name', function () {
            twig({
                id: 'included-template',
                data: '{{ value }} - {{ prefix }}'
            });
            twig({
                allowInlineIncludes: true,
                data: '{% include prefix ~ "-template" with {"value": value} only %}'
            }).render({
                prefix: 'included',
                value: 'test'
            }).should.equal('test - ');
        });
    });

    describe('Imports ->', function () {
        it('should load an inline include when the file exists', function () {
            /* eslint-disable-next-line no-use-extend-native/no-use-extend-native */
            return (function () {
                twig({
                    allowInlineIncludes: true,
                    async: false,
                    rethrow: true,
                    data: '{% include \'test/templates/simple.twig\' %}'
                }).render({});
            }).should.not.throw();
        });

        it('should throw when trying to load an inline include and the file does not exist', function () {
            /* eslint-disable-next-line no-use-extend-native/no-use-extend-native */
            return (function () {
                twig({
                    allowInlineIncludes: true,
                    async: false,
                    rethrow: true,
                    data: '{% include \'test/templates/doesnt-exist-ever.twig\' %}'
                }).render({});
            }).should.throw(/Unable to find template file/);
        });
    });

    describe('tokens should have the correct positions in template', () => {
        it('should show the correct token positions in a simple template', () => {
            const tokens = twig({data: '{{ unit }}'}).tokens;
            tokens[0].position.should.eql({start: 0, end: 10});
        });

        it('should show the correct token positions in a advanced template', () => {
            const tokens = twig({data:'I want to {{ try }} a more {% if advanced | length > 3 %}{{ variable }}{% endif %} template {% set unit = 2 %}{# This is a comment #}{{ variable_after_comment }}'}).tokens;
            tokens[0].position.should.eql({start: 0, end: 10});
            tokens[1].position.should.eql({start: 10, end: 19});
            tokens[2].position.should.eql({start: 19, end: 27});
            tokens[3].position.should.eql({open: {start: 27, end: 57}, close: {start: 71, end: 82}});
            tokens[3].token.output[0].position.should.eql({start: 57, end: 71});
            tokens[5].position.should.eql({start: 92, end: 110});
            tokens[6].position.should.eql({start: 133, end: 161});
        });
    });
});
