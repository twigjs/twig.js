var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Core ->", function() {
    it("should save and load a template by reference", function() {

        // Define and save a template
        twig({
            id:   'test',
            data: '{{ "test" }}'
        });

        // Load and render the template
        twig({ref: 'test'}).render()
                .should.equal("test");
    });

    it("should ignore comments", function() {
        twig({data: 'good {# comment #}morning'}).render().should.equal("good morning");
        twig({data: 'good{#comment#}morning'}).render().should.equal("goodmorning");
    });

    it("should ignore output tags within comments", function() {
        twig({data: 'good {# {{ "Hello" }} #}morning'}).render().should.equal("good morning");
        twig({data: 'good{#c}}om{{m{{ent#}morning'}).render().should.equal("goodmorning");
    });

    it("should ignore logic tags within comments", function() {
        twig({data: 'test {# {% bad syntax if not in comment %} #}test'}).render().should.equal("test test");
        twig({data: '{##}{##}test{# %}}}%}%{%{{% #}pass'}).render().should.equal("testpass");
    });

    // https://github.com/justjohn/twig.js/issues/95
    it("should ignore quotation marks within comments", function() {
        twig({data: "good {# don't stop #}morning"}).render().should.equal("good morning");
        twig({data: 'good{#"dont stop"#}morning'}).render().should.equal("goodmorning");
        twig({data: 'good {# "don\'t stop" #}morning'}).render().should.equal("good morning");
        twig({data: 'good{#"\'#}morning'}).render().should.equal("goodmorning");
        twig({data: 'good {#"\'"\'"\'#} day'}).render().should.equal("good  day");
        twig({data: "a {# ' #}b{# ' #} c"}).render().should.equal("a b c");
    });

    it("should be able to parse output tags with tag ends in strings", function() {
        // Really all we care about here is not throwing exceptions.
        twig({data: '{{ "test" }}'}).render().should.equal("test");
        twig({data: '{{ " }} " }}'}).render().should.equal(" }} ");
        twig({data: '{{ " \\"}} " }}'}).render().should.equal(' "}} ');
        twig({data: "{{ ' }} ' }}"}).render().should.equal(" }} ");
        twig({data: "{{ ' \\'}} ' }}"}).render().should.equal(" '}} ");

        twig({data: '{{ " \'}} " }}'}).render().should.equal(" '}} ");
        twig({data: "{{ ' \"}} ' }}"}).render().should.equal(' "}} ');
    });

    it("should be able to output numbers", function() {
        twig({data: '{{ 12 }}'}).render().should.equal( "12" );
        twig({data: '{{ 12.64 }}'}).render().should.equal( "12.64" );
        twig({data: '{{ 0.64 }}'}).render().should.equal("0.64" );
    });

    it("should be able to output booleans", function() {
        twig({data: '{{ true }}'}).render().should.equal( "true" );
        twig({data: '{{ false }}'}).render().should.equal( "false" );
    });

    it("should be able to output strings", function() {
        twig({data: '{{ "double" }}'}).render().should.equal("double");
        twig({data: "{{ 'single' }}"}).render().should.equal('single');
        twig({data: '{{ "dou\'ble" }}'}).render().should.equal("dou'ble");
        twig({data: "{{ 'sin\"gle' }}"}).render().should.equal('sin"gle');
        twig({data: '{{ "dou\\"ble" }}'}).render().should.equal("dou\"ble");
        twig({data: "{{ 'sin\\'gle' }}"}).render().should.equal("sin'gle");
    });
    it("should be able to output strings with newlines", function() {
        twig({data: "{{ 'a\nb\rc\r\nd' }}"}).render().should.equal("a\nb\rc\r\nd");
    });
    it("should be able to output arrays", function() {
         twig({data: '{{ [1] }}'}).render().should.equal("1" );
         twig({data: '{{ [1,2 ,3 ] }}'}).render().should.equal("1,2,3" );
         twig({data: '{{ [1,2 ,3 , val ] }}'}).render({val: 4}).should.equal("1,2,3,4" );
         twig({data: '{{ ["[to",\'the\' ,"string]" ] }}'}).render().should.equal('[to,the,string]' );
         twig({data: '{{ ["[to",\'the\' ,"str\\"ing]" ] }}'}).render().should.equal('[to,the,str"ing]' );
    });
    it("should be able to output parse expressions in an array", function() {
         twig({data: '{{ [1,2 ,1+2 ] }}'}).render().should.equal("1,2,3" );
         twig({data: '{{ [1,2 ,3 , "-", [4,5, 6] ] }}'}).render({val: 4}).should.equal("1,2,3,-,4,5,6" );
         twig({data: '{{ [a,b ,(1+2) * a ] }}'}).render({a:1,b:2}).should.equal("1,2,3" );
    });
    it("should be able to output variables", function() {
         twig({data: '{{ orp }}'}).render({ orp: "test"}).should.equal("test");
         twig({data: '{{ val }}'}).render({ val: function() {
                                                       return "test"
                                                   }}).should.equal("test");
    });


    it("should recognize null", function() {
        twig({data: '{{ null == val }}'}).render({val: null}).should.equal( "true" );
        twig({data: '{{ null == val }}'}).render({val: undefined}).should.equal( "true" );

        twig({data: '{{ null == val }}'}).render({val: "test"}).should.equal( "false" );
        twig({data: '{{ null == val }}'}).render({val: 0}).should.equal( "false" );
        twig({data: '{{ null == val }}'}).render({val: false}).should.equal( "false" );
    });


    it("should recognize object literals", function() {
        twig({data: '{% set at = {"foo": "test", bar: "other", 1:"zip"} %}{{ at.foo ~ at.bar ~ at.1 }}'}).render().should.equal( "testotherzip" );
    });

    it("should allow newlines in object literals", function() {
        twig({data: '{% set at = {\n"foo": "test",\rbar: "other",\r\n1:"zip"\n} %}{{ at.foo ~ at.bar ~ at.1 }}'}).render().should.equal( "testotherzip" );
    });

    it("should recognize null in an object", function() {
        twig({data: '{% set at = {"foo": null} %}{{ at.foo == val }}'}).render({val: null}).should.equal( "true" );
    });

    it("should support set capture", function() {
        twig({data: '{% set foo %}bar{% endset %}{{foo}}'}).render().should.equal( "bar" );
    });

    it("should support raw data", function() {
        twig({
        	data: "before {% raw %}{{ test }} {% test2 %} {{{% endraw %} after"
        }).render().should.equal(
        	"before {{ test }} {% test2 %} {{ after"
        );
    });

    it("should support raw data using 'verbatim' tag", function() {
        twig({
            data: "before {% verbatim %}{{ test }} {% test2 %} {{{% endverbatim %} after"
        }).render().should.equal(
            "before {{ test }} {% test2 %} {{ after"
        );
    });

    describe("Key Notation ->", function() {
        it("should support dot key notation", function() {
            twig({data: '{{ key.value }} {{ key.sub.test }}'}).render({
                key: {
                    value: "test",
                    sub: {
                        test: "value"
                    }
                }
            }).should.equal("test value");
        });
        it("should support square bracket key notation", function() {
            twig({data: '{{ key["value"] }} {{ key[\'sub\']["test"] }}'}).render({
                key: {
                    value: "test",
                    sub: {
                        test: "value"
                    }
                }
            }).should.equal("test value");
        });
        it("should support mixed dot and bracket key notation", function() {
            twig({data: '{{ key["value"] }} {{ key.sub[key.value] }} {{ s.t["u"].v["w"] }}'}).render({
                key: {
                    value: "test",
                    sub: {
                        test: "value"
                    }
                },
                s: { t: { u: { v: { w: 'x' } } } }
            }).should.equal("test value x" );
        });

        it("should support dot key notation after a function", function() {
            var test_template = twig({data: '{{ key.fn().value }}'});
            var output = test_template.render({
                key: {
                    fn: function() {
                        return {
                            value: "test"
                        }
                    }
                }
            });
            output.should.equal("test");
        });

        it("should support bracket key notation after a function", function() {
            var test_template = twig({data: '{{ key.fn()["value"] }}'});
            var output = test_template.render({
                key: {
                    fn: function() {
                        return {
                            value: "test 2"
                        }
                    }
                }
            });
            output.should.equal("test 2");
        });

        it("should check for getKey methods if a key doesn't exist.", function() {
            twig({data: '{{ obj.value }}'}).render({
                obj: {
                    getValue: function() {
                        return "val";
                    },
                    isValue: function() {
                        return "not val";
                    }
                }
            }).should.equal("val");
        });

        it("should check for isKey methods if a key doesn't exist.", function() {
            twig({data: '{{ obj.value }}'}).render({
                obj: {
                    isValue: function() {
                        return "val";
                    }
                }
            }).should.equal("val");
        });

        it("should check for getKey methods on prototype objects.", function() {
			var object = {
                getValue: function() {
                    return "val";
                }
            };
			function Subobj() {};
			Subobj.prototype = object;
			var subobj = new Subobj();

            twig({data: '{{ obj.value }}'}).render({
                obj: subobj
            }).should.equal("val");
        });

        it("should return null if a period key doesn't exist.", function() {
            twig({data: '{{ obj.value == null }}'}).render({
                obj: {}
            }).should.equal("true");
        });

        it("should return null if a bracket key doesn't exist.", function() {
            twig({data: '{{ obj["value"] == null }}'}).render({
                obj: {}
            }).should.equal("true");
        });
    });

    describe("Context ->", function() {
        it("should be supported", function() {
            twig({data: '{{ _context.value }}'}).render({
                value: "test"
            }).should.equal("test");
        });

        it("should be an object even if it's not passed", function() {
            twig({data: '{{ _context|json_encode }}'}).render().should.equal("{}");
        });

        it("should support {% set %} tag", function() {
            twig({data: '{% set value = "test" %}{{ _context.value }}'}).render().should.equal("test");
        });

        it("should work correctly with properties named dynamically", function() {
            twig({data: '{{ _context[key] }}'}).render({
                key: "value",
                value: "test"
            }).should.equal("test");
        });

        it("should not allow to override context using {% set %}", function() {
            twig({data: '{% set _context = "test" %}{{ _context|json_encode }}'}).render().should.equal('{"_context":"test"}');
            twig({data: '{% set _context = "test" %}{{ _context._context }}'}).render().should.equal("test");
        });

        it("should support autoescape option", function() {
            twig({
                autoescape: true,
                data: '{{ value }}'
            }).render({
                value: "<test>&</test>"
            }).should.equal('&lt;test&gt;&amp;&lt;/test&gt;');
        });

        it("should autoescape parent() output correctly", function() {
            twig({id: 'parent1', data: '{% block body %}<p>{{ value }}</p>{% endblock body %}'});
            twig({
                allowInlineIncludes: true,
                autoescape: true,
                data: '{% extends "parent1" %}{% block body %}{{ parent() }}{% endblock %}'
            }).render({
                value: "<test>&</test>"
            }).should.equal('<p>&lt;test&gt;&amp;&lt;/test&gt;</p>');
        });

        it("should use a correct context in the extended template", function() {
            twig({id: 'parent', data: '{% block body %}{{ value }}{% endblock body %}'});
            twig({
                allowInlineIncludes: true,
                data: '{% extends "parent" %}{% set value = "test" %}{% block body %}{{ parent() }}{% endblock %}'
            }).render().should.equal("test");
        });

        it("should use a correct context in the included template", function() {
            twig({id: 'included', data: '{{ value }}\n{% set value = "inc" %}{{ value }}\n'});
            twig({
                allowInlineIncludes: true,
                data: '{% set value = "test" %}{% for i in [0, 1] %}{% include "included" %}{% endfor %}{{ value }}'
            }).render().should.equal("test\ninc\ntest\ninc\ntest");
        });
    });
});

