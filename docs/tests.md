# TOC
   - [Twig.js Blocks ->](#twigjs-blocks--)
     - [block function ->](#twigjs-blocks---block-function--)
   - [Twig.js Control Structures ->](#twigjs-control-structures--)
     - [if tag ->](#twigjs-control-structures---if-tag--)
     - [for tag ->](#twigjs-control-structures---for-tag--)
     - [set tag ->](#twigjs-control-structures---set-tag--)
   - [Twig.js Core ->](#twigjs-core--)
     - [Key Notation ->](#twigjs-core---key-notation--)
     - [Context ->](#twigjs-core---context--)
   - [Twig.js Embed ->](#twigjs-embed--)
   - [Twig.js Expressions ->](#twigjs-expressions--)
     - [Basic Operators ->](#twigjs-expressions---basic-operators--)
     - [Comparison Operators ->](#twigjs-expressions---comparison-operators--)
     - [Other Operators ->](#twigjs-expressions---other-operators--)
   - [Twig.js Extensions ->](#twigjs-extensions--)
   - [Twig.js Filters ->](#twigjs-filters--)
     - [url_encode ->](#twigjs-filters---url_encode--)
     - [json_encode ->](#twigjs-filters---json_encode--)
     - [upper ->](#twigjs-filters---upper--)
     - [lower ->](#twigjs-filters---lower--)
     - [capitalize ->](#twigjs-filters---capitalize--)
     - [title ->](#twigjs-filters---title--)
     - [length ->](#twigjs-filters---length--)
     - [sort ->](#twigjs-filters---sort--)
     - [reverse ->](#twigjs-filters---reverse--)
     - [keys ->](#twigjs-filters---keys--)
     - [merge ->](#twigjs-filters---merge--)
     - [join ->](#twigjs-filters---join--)
     - [default ->](#twigjs-filters---default--)
     - [date ->](#twigjs-filters---date--)
     - [replace ->](#twigjs-filters---replace--)
     - [format ->](#twigjs-filters---format--)
     - [striptags ->](#twigjs-filters---striptags--)
     - [escape ->](#twigjs-filters---escape--)
     - [e ->](#twigjs-filters---e--)
     - [nl2br ->](#twigjs-filters---nl2br--)
     - [truncate ->](#twigjs-filters---truncate--)
     - [trim ->](#twigjs-filters---trim--)
     - [number_format ->](#twigjs-filters---number_format--)
     - [slice ->](#twigjs-filters---slice--)
     - [abs ->](#twigjs-filters---abs--)
     - [first ->](#twigjs-filters---first--)
     - [split ->](#twigjs-filters---split--)
     - [batch ->](#twigjs-filters---batch--)
     - [last ->](#twigjs-filters---last--)
     - [raw ->](#twigjs-filters---raw--)
     - [round ->](#twigjs-filters---round--)
   - [Twig.js Loader ->](#twigjs-loader--)
   - [Twig.js Include ->](#twigjs-include--)
   - [Twig.js Functions ->](#twigjs-functions--)
     - [Built-in Functions ->](#twigjs-functions---built-in-functions--)
       - [range ->](#twigjs-functions---built-in-functions---range--)
       - [cycle ->](#twigjs-functions---built-in-functions---cycle--)
       - [date ->](#twigjs-functions---built-in-functions---date--)
       - [dump ->](#twigjs-functions---built-in-functions---dump--)
       - [block ->](#twigjs-functions---built-in-functions---block--)
       - [attribute ->](#twigjs-functions---built-in-functions---attribute--)
       - [template_from_string ->](#twigjs-functions---built-in-functions---template_from_string--)
       - [random ->](#twigjs-functions---built-in-functions---random--)
   - [Twig.js Macro ->](#twigjs-macro--)
   - [Twig.js Optional Functionality ->](#twigjs-optional-functionality--)
   - [Twig.js Regression Tests ->](#twigjs-regression-tests--)
   - [Twig.js Tags ->](#twigjs-tags--)
   - [Twig.js Tests ->](#twigjs-tests--)
     - [empty test ->](#twigjs-tests---empty-test--)
     - [odd test ->](#twigjs-tests---odd-test--)
     - [even test ->](#twigjs-tests---even-test--)
     - [divisibleby test ->](#twigjs-tests---divisibleby-test--)
     - [defined test ->](#twigjs-tests---defined-test--)
     - [none test ->](#twigjs-tests---none-test--)
     - [sameas test ->](#twigjs-tests---sameas-test--)
     - [iterable test ->](#twigjs-tests---iterable-test--)
<a name=""></a>
 
<a name="twigjs-blocks--"></a>
# Twig.js Blocks ->
should load a parent template and render the default values.

```js
twig({
    id:   'remote-no-extends',
    path: 'test/templates/template.twig',
    async: false
});
// Load the template
twig({ref: 'remote-no-extends'}).render({ }).should.equal( "Default Title - body" );
```

should understand {% endblock title %} syntax.

```js
twig({
    id:   'endblock-extended-syntax',
    path: 'test/templates/blocks-extended-syntax.twig',
    async: false
});
// Load the template
twig({ref: 'endblock-extended-syntax'}).render({ }).should.equal( "This is the only thing." );
```

should load a child template and replace the parent block's content.

```js
// Test loading a template from a remote endpoint
twig({
    id:   'child-extends',
    path: 'test/templates/child.twig',
    load: function(template) {
        template.render({ base: "template.twig" }).should.equal( "Other Title - child" );
        done();
    }
});
```

should have access to a parent block content.

```js
// Test loading a template from a remote endpoint
twig({
    id:   'child-parent',
    path: 'test/templates/child-parent.twig',
    load: function(template) {
        template.render({
            base: "template.twig",
            inner: ':value'
        }).should.equal( "Other Title - body:value:child" );
        done();
    }
});
```

should include blocks from another template for horizontal reuse.

```js
// Test horizontal reuse
twig({
    id:   'use',
    path: 'test/templates/use.twig',
    load: function(template) {
        // Load the template
        template.render({ place: "diner" }).should.equal("Coming soon to a diner near you!" );
        done();
    }
});
```

should allow overriding of included blocks.

```js
// Test overriding of included blocks
twig({
    id:   'use-override-block',
    path: 'test/templates/use-override-block.twig',
    load: function(template) {
        // Load the template
        template.render({ place: "diner" }).should.equal("Sorry, can't come to a diner today." );
        done();
    }
});
```

should allow overriding of included nested blocks.

```js
// Test overriding of included blocks
twig({
    id:   'use-override-nested-block',
    path: 'test/templates/use-override-nested-block.twig',
    load: function(template) {
        // Load the template
        template.render().should.equal("parent:new-child1:new-child2");
        done();
    }
});
```

should make the contents of blocks available after they're rendered.

```js
// Test rendering and loading one block
twig({
    id:   'blocks',
    path: 'test/templates/blocks.twig',
    load: function(template) {
        // Render the template with the blocks parameter
        template.render({ place: "block" }, {output: 'blocks'}).msg.should.equal("Coming soon to a block near you!" );
        done();
    }
});
```

should render nested blocks.

```js
// Test rendering of blocks within blocks
twig({
    id:     'blocks-nested',
    path:   'test/templates/blocks-nested.twig',
    load: function(template) {
        template.render({ }).should.equal( "parent:child" )
        done();
    }
})
```

should render extended nested blocks.

```js
// Test rendering of blocks within blocks
twig({
    id:     'child-blocks-nested',
    path:   'test/templates/child-blocks-nested.twig',
    load: function(template) {
        template.render({ base: "template.twig" }).should.equal( "Default Title - parent:child" );
        done();
    }
})
```

should be able to extend to a absolute template path.

```js
// Test loading a template from a remote endpoint
twig({
    base: 'test/templates',
    path: 'test/templates/a/child.twig',
    load: function(template) {
        template.render({ base: "b/template.twig" }).should.equal( "Other Title - child" );
        done();
    }
});
```

should extends blocks inline.

```js
twig({
    id: 'inline-parent-template',
    data: 'Title: {% block title %}parent{% endblock %}'
});
twig({
    allowInlineIncludes: true,
    data: '{% extends "inline-parent-template" %}{% block title %}child{% endblock %}'
}).render().should.equal("Title: child");
```

<a name="twigjs-blocks---block-function--"></a>
## block function ->
should render block content from an included block.

```js
twig({
    path:   'test/templates/block-function.twig',
    load: function(template) {
        template.render({
            base: "block-function-parent.twig",
            val: "abcd"
        })
        .should.equal( "Child content = abcd / Result: Child content = abcd" );
        done();
    }
})
```

should render block content from a parent block.

```js
twig({
    path:   'test/templates/block-parent.twig',
    load: function(template) {
        template.render({
            base: "block-function-parent.twig"
        })
        .should.equal( "parent block / Result: parent block" );
        done();
    }
})
```

should render block content with outer context.

```js
twig({
    path:   'test/templates/block-outer-context.twig',
    load: function(template) {
        template.render({
            base: "block-outer-context.twig",
            items: ["twig", "js", "rocks"]
        })
        .should.equal( "Hello twig!Hello js!Hello rocks!twigjsrocks" );
        done();
    }
})
```

<a name="twigjs-control-structures--"></a>
# Twig.js Control Structures ->
<a name="twigjs-control-structures---if-tag--"></a>
## if tag ->
should parse the contents of the if block if the expression is true.

```js
var test_template = twig({data: '{% if test %}true{% endif%}'});
test_template.render({test: true}).should.equal("true" );
test_template.render({test: false}).should.equal("" );
```

should call the if or else blocks based on the expression result.

```js
var test_template = twig({data: '{% if test %}true{% endif%}'});
test_template.render({test: true}).should.equal("true" );
test_template.render({test: false}).should.equal("" );
```

should support elseif.

```js
var test_template = twig({data: '{% if test %}1{% elseif other %}2{%else%}3{% endif%}'});
test_template.render({test: true, other:false}).should.equal("1" );
test_template.render({test: true, other:true}).should.equal("1" );
test_template.render({test: false, other:true}).should.equal("2" );
test_template.render({test: false, other:false}).should.equal("3" );
```

should be able to nest.

```js
var test_template = twig({data: '{% if test %}{% if test2 %}true{% else %}false{% endif%}{% else %}not{% endif%}'});
test_template.render({test: true, test2: true}).should.equal("true" );
test_template.render({test: true, test2: false}).should.equal("false" );
test_template.render({test: false, test2: true}).should.equal("not" );
test_template.render({test: false, test2: false}).should.equal("not" );
```

<a name="twigjs-control-structures---for-tag--"></a>
## for tag ->
should provide value only for array input.

```js
var test_template = twig({data: '{% for value in test %}{{ value }}{% endfor %}'});
test_template.render({test: [1,2,3,4]}).should.equal("1234" );
test_template.render({test: []}).should.equal("" );
```

should provide both key and value for array input.

```js
var test_template = twig({data: '{% for key,value in test %}{{key}}:{{ value }}{% endfor %}'});
test_template.render({test: [1,2,3,4]}).should.equal("0:11:22:33:4" );
test_template.render({test: []}).should.equal("" );
```

should provide value only for object input.

```js
var test_template = twig({data: '{% for value in test %}{{ value }}{% endfor %}'});
test_template.render({test: {one: 1, two: 2, three: 3}}).should.equal("123" );
test_template.render({test: {}}).should.equal("" );
```

should provide both key and value for object input.

```js
var test_template = twig({data: '{% for key, value in test %}{{key}}:{{ value }}{% endfor %}'});
test_template.render({test: {one: 1, two: 2, three: 3}}).should.equal("one:1two:2three:3" );
test_template.render({test: {}}).should.equal("" );
```

should support else if the input is empty.

```js
var test_template = twig({data: '{% for key,value in test %}{{ value }}{% else %}else{% endfor %}'});
test_template.render({test: [1,2,3,4]}).should.equal("1234" );
test_template.render({test: []}).should.equal("else" );
```

should be able to nest.

```js
var test_template = twig({data: '{% for key,list in test %}{% for val in list %}{{ val }}{%endfor %}.{% else %}else{% endfor %}'});
test_template.render({test: [[1,2],[3,4],[5,6]]}).should.equal("12.34.56." );
test_template.render({test: []}).should.equal("else" );
```

should have a loop context item available for arrays.

```js
var test_template = twig({data: '{% for key,value in test %}{{ loop.index }}{% endfor %}'});
test_template.render({test: [1,2,3,4]}).should.equal("1234" );
test_template = twig({data: '{% for key,value in test %}{{ loop.index0 }}{% endfor %}'});
test_template.render({test: [1,2,3,4]}).should.equal("0123" );
test_template = twig({data: '{% for key,value in test %}{{ loop.revindex }}{% endfor %}'});
test_template.render({test: [1,2,3,4]}).should.equal("4321" );
test_template = twig({data: '{% for key,value in test %}{{ loop.revindex0 }}{% endfor %}'});
test_template.render({test: [1,2,3,4]}).should.equal("3210" );
test_template = twig({data: '{% for key,value in test %}{{ loop.length }}{% endfor %}'});
test_template.render({test: [1,2,3,4]}).should.equal("4444" );
test_template = twig({data: '{% for key,value in test %}{{ loop.first }}{% endfor %}'});
test_template.render({test: [1,2,3,4]}).should.equal("truefalsefalsefalse" );
test_template = twig({data: '{% for key,value in test %}{{ loop.last }}{% endfor %}'});
test_template.render({test: [1,2,3,4]}).should.equal("falsefalsefalsetrue" );
```

should have a loop context item available for objects.

```js
var test_template = twig({data: '{% for key,value in test %}{{ loop.index }}{% endfor %}'});
test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("1234" );
test_template = twig({data: '{% for key,value in test %}{{ loop.index0 }}{% endfor %}'});
test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("0123" );
test_template = twig({data: '{% for key,value in test %}{{ loop.revindex }}{% endfor %}'});
test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("4321" );
test_template = twig({data: '{% for key,value in test %}{{ loop.revindex0 }}{% endfor %}'});
test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("3210" );
test_template = twig({data: '{% for key,value in test %}{{ loop.length }}{% endfor %}'});
test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("4444" );
test_template = twig({data: '{% for key,value in test %}{{ loop.first }}{% endfor %}'});
test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("truefalsefalsefalse" );
test_template = twig({data: '{% for key,value in test %}{{ loop.last }}{% endfor %}'});
test_template.render({test: {a:1,b:2,c:3,d:4}}).should.equal("falsefalsefalsetrue" );
```

should have a loop context item available in child loops objects.

```js
var test_template = twig({data: '{% for value in test %}{% for value in inner %}({{ loop.parent.loop.index }},{{ loop.index }}){% endfor %}{% endfor %}'});
test_template.render({test: {a:1,b:2}, inner:[1,2,3]}).should.equal("(1,1)(1,2)(1,3)(2,1)(2,2)(2,3)");
```

should support conditionals on for loops.

```js
var test_template = twig({data: '{% for value in test if false %}{{ value }},{% endfor %}'});
test_template.render({test: ["one", "two", "a", "b", "other"]}).should.equal("");
test_template = twig({data: '{% for value in test if true %}{{ value }}{% endfor %}'});
test_template.render({test: ["a", "s", "d", "f"]}).should.equal("asdf");
test_template = twig({data: '{% for value in test if value|length > 2 %}{{ value }},{% endfor %}'});
test_template.render({test: ["one", "two", "a", "b", "other"]}).should.equal("one,two,other,");
test_template = twig({data: '{% for key,item in test if item.show %}{{key}}:{{ item.value }},{% endfor %}'});
test_template.render({test: {
    a: {show:true, value: "one"},
    b: {show:false, value: "two"},
    c: {show:true, value: "three"}}}).should.equal("a:one,c:three,");
```

<a name="twigjs-control-structures---set-tag--"></a>
## set tag ->
should not set the global context from within a for loop.

```js
var test_template = twig({data: '{% for value in [1] %}{% set foo="right" %}{% endfor %}{{ foo }}'});
test_template.render().should.equal("");
```

should set the global context from within a for loop when the variable is initialized outside of the loop.

```js
var test_template = twig({data: '{% set foo="wrong" %}{% for value in [1] %}{% set foo="right" %}{% endfor %}{{ foo }}'});
test_template.render().should.equal("right");
```

should set the global context from within a nested for loop when the variable is initialized outside of the loop.

```js
var test_template = twig({data: '{% set k = 0 %}{% for i in 0..2 %}{% for j in 0..2 %}{{ k }}{% set k = k + 1 %}{% endfor %}{% endfor %}'});
test_template.render().should.equal("012345678");
```

<a name="twigjs-core--"></a>
# Twig.js Core ->
should save and load a template by reference.

```js
// Define and save a template
        twig({
            id:   'test',
            data: '{{ "test" }}'
        });
        // Load and render the template
        twig({ref: 'test'}).render()
                .should.equal("test");
```

should ignore comments.

```js
twig({data: 'good {# comment #}morning'}).render().should.equal("good morning");
twig({data: 'good{#comment#}morning'}).render().should.equal("goodmorning");
```

should ignore output tags within comments.

```js
twig({data: 'good {# {{ "Hello" }} #}morning'}).render().should.equal("good morning");
twig({data: 'good{#c}}om{{m{{ent#}morning'}).render().should.equal("goodmorning");
```

should ignore logic tags within comments.

```js
twig({data: 'test {# {% bad syntax if not in comment %} #}test'}).render().should.equal("test test");
twig({data: '{##}{##}test{# %}}}%}%{%{{% #}pass'}).render().should.equal("testpass");
```

should ignore quotation marks within comments.

```js
twig({data: "good {# don't stop #}morning"}).render().should.equal("good morning");
twig({data: 'good{#"dont stop"#}morning'}).render().should.equal("goodmorning");
twig({data: 'good {# "don\'t stop" #}morning'}).render().should.equal("good morning");
twig({data: 'good{#"\'#}morning'}).render().should.equal("goodmorning");
twig({data: 'good {#"\'"\'"\'#} day'}).render().should.equal("good  day");
twig({data: "a {# ' #}b{# ' #} c"}).render().should.equal("a b c");
```

should be able to parse output tags with tag ends in strings.

```js
// Really all we care about here is not throwing exceptions.
twig({data: '{{ "test" }}'}).render().should.equal("test");
twig({data: '{{ " }} " }}'}).render().should.equal(" }} ");
twig({data: '{{ " \\"}} " }}'}).render().should.equal(' "}} ');
twig({data: "{{ ' }} ' }}"}).render().should.equal(" }} ");
twig({data: "{{ ' \\'}} ' }}"}).render().should.equal(" '}} ");
twig({data: '{{ " \'}} " }}'}).render().should.equal(" '}} ");
twig({data: "{{ ' \"}} ' }}"}).render().should.equal(' "}} ');
```

should be able to output numbers.

```js
twig({data: '{{ 12 }}'}).render().should.equal( "12" );
twig({data: '{{ 12.64 }}'}).render().should.equal( "12.64" );
twig({data: '{{ 0.64 }}'}).render().should.equal("0.64" );
```

should be able to output booleans.

```js
twig({data: '{{ true }}'}).render().should.equal( "true" );
twig({data: '{{ false }}'}).render().should.equal( "false" );
```

should be able to output strings.

```js
twig({data: '{{ "double" }}'}).render().should.equal("double");
twig({data: "{{ 'single' }}"}).render().should.equal('single');
twig({data: '{{ "dou\'ble" }}'}).render().should.equal("dou'ble");
twig({data: "{{ 'sin\"gle' }}"}).render().should.equal('sin"gle');
twig({data: '{{ "dou\\"ble" }}'}).render().should.equal("dou\"ble");
twig({data: "{{ 'sin\\'gle' }}"}).render().should.equal("sin'gle");
```

should be able to output arrays.

```js
twig({data: '{{ [1] }}'}).render().should.equal("1" );
twig({data: '{{ [1,2 ,3 ] }}'}).render().should.equal("1,2,3" );
twig({data: '{{ [1,2 ,3 , val ] }}'}).render({val: 4}).should.equal("1,2,3,4" );
twig({data: '{{ ["[to",\'the\' ,"string]" ] }}'}).render().should.equal('[to,the,string]' );
twig({data: '{{ ["[to",\'the\' ,"str\\"ing]" ] }}'}).render().should.equal('[to,the,str"ing]' );
```

should be able to output parse expressions in an array.

```js
twig({data: '{{ [1,2 ,1+2 ] }}'}).render().should.equal("1,2,3" );
twig({data: '{{ [1,2 ,3 , "-", [4,5, 6] ] }}'}).render({val: 4}).should.equal("1,2,3,-,4,5,6" );
twig({data: '{{ [a,b ,(1+2) * a ] }}'}).render({a:1,b:2}).should.equal("1,2,3" );
```

should be able to output variables.

```js
twig({data: '{{ orp }}'}).render({ orp: "test"}).should.equal("test");
twig({data: '{{ val }}'}).render({ val: function() {
                                              return "test"
                                          }}).should.equal("test");
```

should recognize null.

```js
twig({data: '{{ null == val }}'}).render({val: null}).should.equal( "true" );
twig({data: '{{ null == val }}'}).render({val: undefined}).should.equal( "true" );
twig({data: '{{ null == val }}'}).render({val: "test"}).should.equal( "false" );
twig({data: '{{ null == val }}'}).render({val: 0}).should.equal( "false" );
twig({data: '{{ null == val }}'}).render({val: false}).should.equal( "false" );
```

should recognize object literals.

```js
twig({data: '{% set at = {"foo": "test", bar: "other", 1:"zip"} %}{{ at.foo ~ at.bar ~ at.1 }}'}).render().should.equal( "testotherzip" );
```

should recognize null in an object.

```js
twig({data: '{% set at = {"foo": null} %}{{ at.foo == val }}'}).render({val: null}).should.equal( "true" );
```

should support set capture.

```js
twig({data: '{% set foo %}bar{% endset %}{{foo}}'}).render().should.equal( "bar" );
```

should support raw data.

```js
twig({
	data: "before {% raw %}{{ test }} {% test2 %} {{{% endraw %} after"
}).render().should.equal(
	"before {{ test }} {% test2 %} {{ after"
);
```

<a name="twigjs-core---key-notation--"></a>
## Key Notation ->
should support dot key notation.

```js
twig({data: '{{ key.value }} {{ key.sub.test }}'}).render({
    key: {
        value: "test",
        sub: {
            test: "value"
        }
    }
}).should.equal("test value");
```

should support square bracket key notation.

```js
twig({data: '{{ key["value"] }} {{ key[\'sub\']["test"] }}'}).render({
    key: {
        value: "test",
        sub: {
            test: "value"
        }
    }
}).should.equal("test value");
```

should support mixed dot and bracket key notation.

```js
twig({data: '{{ key["value"] }} {{ key.sub[key.value] }} {{ s.t["u"].v["w"] }}'}).render({
    key: {
        value: "test",
        sub: {
            test: "value"
        }
    },
    s: { t: { u: { v: { w: 'x' } } } }
}).should.equal("test value x" );
```

should support dot key notation after a function.

```js
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
```

should support bracket key notation after a function.

```js
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
```

should check for getKey methods if a key doesn't exist..

```js
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
```

should check for isKey methods if a key doesn't exist..

```js
twig({data: '{{ obj.value }}'}).render({
    obj: {
        isValue: function() {
            return "val";
        }
    }
}).should.equal("val");
```

should check for getKey methods on prototype objects..

```js
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
```

should return null if a period key doesn't exist..

```js
twig({data: '{{ obj.value == null }}'}).render({
    obj: {}
}).should.equal("true");
```

should return null if a bracket key doesn't exist..

```js
twig({data: '{{ obj["value"] == null }}'}).render({
    obj: {}
}).should.equal("true");
```

<a name="twigjs-core---context--"></a>
## Context ->
should be supported.

```js
twig({data: '{{ _context.value }}'}).render({
    value: "test"
}).should.equal("test");
```

should be an object even if it's not passed.

```js
twig({data: '{{ _context|json_encode }}'}).render().should.equal("{}");
```

should support {% set %} tag.

```js
twig({data: '{% set value = "test" %}{{ _context.value }}'}).render().should.equal("test");
```

should work correctly with properties named dynamically.

```js
twig({data: '{{ _context[key] }}'}).render({
    key: "value",
    value: "test"
}).should.equal("test");
```

should not allow to override context using {% set %}.

```js
twig({data: '{% set _context = "test" %}{{ _context|json_encode }}'}).render().should.equal('{"_context":"test"}');
twig({data: '{% set _context = "test" %}{{ _context._context }}'}).render().should.equal("test");
```

should support autoescape option.

```js
twig({
    autoescape: true,
    data: '{{ value }}'
}).render({
    value: "<test>&</test>"
}).should.equal('&lt;test&gt;&amp;&lt;/test&gt;');
```

should use a correct context in the extended template.

```js
twig({id: 'parent', data: '{% block body %}{{ value }}{% endblock body %}'});
twig({
    allowInlineIncludes: true,
    data: '{% extends "parent" %}{% set value = "test" %}{% block body %}{{ parent() }}{% endblock %}'
}).render().should.equal("test");
```

<a name="twigjs-embed--"></a>
# Twig.js Embed ->
it should load embed and render.

```js
twig({
    id:   'embed',
    path: 'test/templates/embed-simple.twig',
    async: false
});
// Load the template
twig({ref: 'embed'}).render({ }).trim().should.equal( ['START',
                                                       'A',
                                                       'new header',
                                                       'base footer',
                                                       'B',
                                                       '',
                                                       'A',
                                                       'base header',
                                                       'base footer',
                                                       'extended',
                                                       'B',
                                                       '',
                                                       'A',
                                                       'base header',
                                                       'extended',
                                                       'base footer',
                                                       'extended',
                                                       'B',
                                                       '',
                                                       'A',
                                                       'Super cool new header',
                                                       'Cool footer',
                                                       'B',
                                                       'END'].join('\n') );
```

<a name="twigjs-expressions--"></a>
# Twig.js Expressions ->
<a name="twigjs-expressions---basic-operators--"></a>
## Basic Operators ->
should parse parenthesis.

```js
var test_template = twig({data: '{{ a - (b + c) }}'}),
    d = {a: 10, b: 4, c: 2},
    output = test_template.render(d);
output.should.equal( (d.a - (d.b + d.c)).toString() );
```

should parse nested parenthesis.

```js
var test_template = twig({data: '{{ a - ((b) + (1 + c)) }}'}),
    d = {a: 10, b: 4, c: 2},
    output = test_template.render(d);
output.should.equal( (d.a - (d.b + 1 + d.c)).toString() );
```

should add numbers.

```js
var test_template = twig({data: '{{ a + b }}'});
numeric_test_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal( (pair.a + pair.b).toString() );
});
```

should subtract numbers.

```js
var test_template = twig({data: '{{ a - b }}'});
numeric_test_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal( (pair.a - pair.b).toString() );
});
```

should multiply numbers.

```js
var test_template = twig({data: '{{ a * b }}'});
numeric_test_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal((pair.a * pair.b).toString() );
});
```

should divide numbers.

```js
var test_template = twig({data: '{{ a / b }}'});
numeric_test_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal((pair.a / pair.b).toString() );
});
```

should divide numbers and return an int result.

```js
var test_template = twig({data: '{{ a // b }}'});
numeric_test_data.forEach(function(pair) {
    var output = test_template.render(pair);
    // Get expected truncated result
    var c = parseInt(pair.a/pair.b);
    output.should.equal(c.toString() );
});
```

should raise numbers to a power.

```js
var test_template = twig({data: '{{ a ** b }}'});
var pow_test_data = [
    {a: 2, b:3, c: 8}
    , {a: 4, b:.5, c: 2}
    , {a: 5, b: 1, c: 5}
];
pow_test_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal(pair.c.toString() );
});
```

should concatanate values.

```js
twig({data: '{{ "test" ~ a }}'}).render({a:1234}).should.equal("test1234");
twig({data: '{{ a ~ "test" ~ a }}'}).render({a:1234}).should.equal("1234test1234");
twig({data: '{{ "this" ~ "test" }}'}).render({a:1234}).should.equal("thistest");
// Test numbers
var test_template = twig({data: '{{ a ~ b }}'});
numeric_test_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal(pair.a.toString() + pair.b.toString());
});
// Test strings
test_template = twig({data: '{{ a ~ b }}'});
string_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal(pair.a.toString() + pair.b.toString());
});
```

should concatenate null and undefined values and not throw an exception.

```js
twig({data: '{{ a ~ b }}'}).render().should.equal("");
twig({data: '{{ a ~ b }}'}).render({
    a: null,
    b: null
}).should.equal("");
```

should handle multiple chained operations.

```js
var data = {a: 4.5, b: 10, c: 12,  d: -0.25, e:0, f: 65,  g: 21, h: -0.0002};
var test_template = twig({data: '{{a/b+c*d-e+f/g*h}}'});
var output = test_template.render(data);
var expected = data.a / data.b + data.c * data.d - data.e + data.f / data.g * data.h;
output.should.equal(expected.toString());
```

should handle parenthesis in chained operations.

```js
var data = {a: 4.5, b: 10, c: 12,  d: -0.25, e:0, f: 65,  g: 21, h: -0.0002};
var test_template = twig({data: '{{a   /(b+c )*d-(e+f)/(g*h)}}'});
var output = test_template.render(data);
var expected = data.a / (data.b + data.c) * data.d - (data.e + data.f) / (data.g * data.h);
output.should.equal(expected.toString());
```

<a name="twigjs-expressions---comparison-operators--"></a>
## Comparison Operators ->
should support less then.

```js
var test_template = twig({data: '{{ a < b }}'});
numeric_test_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal((pair.a < pair.b).toString() );
});
```

should support less then or equal.

```js
var test_template = twig({data: '{{ a <= b }}'});
numeric_test_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal((pair.a <= pair.b).toString() );
});
```

should support greater then.

```js
var test_template = twig({data: '{{ a > b }}'});
numeric_test_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal((pair.a > pair.b).toString() );
});
```

should support greater then or equal.

```js
var test_template = twig({data: '{{ a >= b }}'});
numeric_test_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal((pair.a >= pair.b).toString() );
});
```

should support equals.

```js
var test_template = twig({data: '{{ a == b }}'});
boolean_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal((pair.a == pair.b).toString() );
});
equality_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal((pair.a == pair.b).toString() );
});
```

should support not equals.

```js
var test_template = twig({data: '{{ a != b }}'});
boolean_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal((pair.a != pair.b).toString() );
});
equality_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal((pair.a != pair.b).toString() );
});
```

should support boolean or.

```js
var test_template = twig({data: '{{ a or b }}'});
boolean_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal((pair.a || pair.b).toString() );
});
```

should support boolean and.

```js
var test_template = twig({data: '{{ a and b }}'});
boolean_data.forEach(function(pair) {
    var output = test_template.render(pair);
    output.should.equal((pair.a && pair.b).toString() );
});
```

should support boolean not.

```js
var test_template = twig({data: '{{ not a }}'});
test_template.render({a:false}).should.equal(true.toString());
test_template.render({a:true}).should.equal(false.toString());
```

<a name="twigjs-expressions---other-operators--"></a>
## Other Operators ->
should support the ternary operator.

```js
var test_template = twig({data: '{{ a ? b:c }}'})
    , output_t = test_template.render({a: true,  b: "one", c: "two"})
    , output_f = test_template.render({a: false, b: "one", c: "two"});
output_t.should.equal( "one" );
output_f.should.equal( "two" );
```

should support the ternary operator with objects in it.

```js
var test_template2 = twig({data: '{{ (a ? {"a":e+f}:{"a":1}).a }}'})
    , output2 = test_template2.render({a: true, b: false, e: 1, f: 2});
output2.should.equal( "3" );
```

should support the ternary operator inside objects.

```js
var test_template2 = twig({data: '{{ {"b" : a or b ? {"a":e+f}:{"a":1} }.b.a }}'})
    , output2 = test_template2.render({a: false, b: false, e: 1, f: 2});
output2.should.equal( "1" );
```

should support in/containment functionality for arrays.

```js
var test_template = twig({data: '{{ "a" in ["a", "b", "c"] }}'});
test_template.render().should.equal(true.toString());
var test_template = twig({data: '{{ "d" in ["a", "b", "c"] }}'});
test_template.render().should.equal(false.toString());
```

should support not in/containment functionality for arrays.

```js
var test_template = twig({data: '{{ "a" not in ["a", "b", "c"] }}'});
test_template.render().should.equal(false.toString());
var test_template = twig({data: '{{ "d" not in ["a", "b", "c"] }}'});
test_template.render().should.equal(true.toString());
```

should support in/containment functionality for strings.

```js
var test_template = twig({data: '{{ "at" in "hat" }}'});
test_template.render().should.equal(true.toString());
var test_template = twig({data: '{{ "d" in "not" }}'});
test_template.render().should.equal(false.toString());
```

should support not in/containment functionality for strings.

```js
var test_template = twig({data: '{{ "at" not in "hat" }}'});
test_template.render().should.equal(false.toString());
var test_template = twig({data: '{{ "d" not in "not" }}'});
test_template.render().should.equal(true.toString());
```

should support in/containment functionality for objects.

```js
var test_template = twig({data: '{{ "value" in {"key" : "value", "2": "other"} }}'});
test_template.render().should.equal(true.toString());
var test_template = twig({data: '{{ "d" in {"key_a" : "no"} }}'});
test_template.render().should.equal(false.toString());
```

should support not in/containment functionality for objects.

```js
var test_template = twig({data: '{{ "value" not in {"key" : "value", "2": "other"} }}'});
test_template.render().should.equal(false.toString());
var test_template = twig({data: '{{ "d" not in {"key_a" : "no"} }}'});
test_template.render().should.equal(true.toString());
```

<a name="twigjs-extensions--"></a>
# Twig.js Extensions ->
should be able to extend a meta-type tag.

```js
var flags = {};
	Twig.extend(function(Twig) {
		Twig.exports.extendTag({
	            type: "flag",
	            regex: /^flag\s+(.+)$/,
		        next: [ ],
		        open: true,
	            compile: function (token) {
	                var expression = token.match[1];

	                // Compile the expression.
	                token.stack = Twig.expression.compile.apply(this, [{
	                    type:  Twig.expression.type.expression,
	                    value: expression
	                }]).stack;

	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, chain) {
	                var name = Twig.expression.parse.apply(this, [token.stack, context]),
	                	output = '';

	                flags[name] = true;

	                return {
	                    chain: false,
	                    output: output
	                };
	            }
		});
	});
	var template = twig({data:"{% flag 'enabled' %}"}).render();
	flags.enabled.should.equal(true);
```

should be able to extend paired tags.

```js
// demo data
	var App = {
		user: "john",
		users: {
			john: {level: "admin"},
			tom: {level: "user"}
		}
	};
	Twig.extend(function(Twig) {
		// example of extending a tag type that would
		// restrict content to the specified "level"
		Twig.exports.extendTag({
	            type: "auth",
	            regex: /^auth\s+(.+)$/,
	            next: ["endauth"], // match the type of the end tag
	            open: true,
	            compile: function (token) {
	                var expression = token.match[1];

	                // turn the string expression into tokens.
	                token.stack = Twig.expression.compile.apply(this, [{
	                    type:  Twig.expression.type.expression,
	                    value: expression
	                }]).stack;

	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, chain) {
	            	var level = Twig.expression.parse.apply(this, [token.stack, context]),
	            		output = "";

	            	if (App.users[App.currentUser].level == level)
	            	{
		                output = Twig.parse.apply(this, [token.output, context]);
		            }

	                return {
	                    chain: chain,
	                    output: output
	                };
	            }
		});
		Twig.exports.extendTag({
	            type: "endauth",
	            regex: /^endauth$/,
	            next: [ ],
	            open: false
	        });
	});
	var template = twig({data:"Welcome{% auth 'admin' %} ADMIN{% endauth %}!"});

		App.currentUser = "john";
	template.render().should.equal("Welcome ADMIN!");

		App.currentUser = "tom";
		template.render().should.equal("Welcome!");
```

<a name="twigjs-filters--"></a>
# Twig.js Filters ->
should chain.

```js
var test_template = twig({data: '{{ ["a", "b", "c"]|keys|reverse }}' });
test_template.render().should.equal("2,1,0");
```

<a name="twigjs-filters---url_encode--"></a>
## url_encode ->
should encode URLs.

```js
var test_template = twig({data: '{{ "http://google.com/?q=twig.js"|url_encode() }}' });
test_template.render().should.equal("http%3A%2F%2Fgoogle.com%2F%3Fq%3Dtwig.js" );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|url_encode() }}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---json_encode--"></a>
## json_encode ->
should encode strings to json.

```js
var test_template = twig({data: '{{ test|json_encode }}' });
test_template.render({test:'value'}).should.equal('"value"' );
```

should encode numbers to json.

```js
var test_template = twig({data: '{{ test|json_encode }}' });
test_template.render({test:21}).should.equal('21' );
```

should encode arrays to json.

```js
var test_template = twig({data: '{{ [1,"b",3]|json_encode }}' });
test_template.render().should.equal('[1,"b",3]' );
```

should encode objects to json.

```js
var test_template = twig({data: '{{ {"a":[1,"b",3]}|json_encode }}' });
test_template.render().should.equal('{"a":[1,"b",3]}' );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|json_encode }}' });
test_template.render().should.equal("null" );
```

<a name="twigjs-filters---upper--"></a>
## upper ->
should convert text to uppercase.

```js
var test_template = twig({data: '{{ "hello"|upper }}' });
test_template.render().should.equal("HELLO" );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|upper }}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---lower--"></a>
## lower ->
should convert text to lowercase.

```js
var test_template = twig({data: '{{ "HELLO"|lower }}' });
test_template.render().should.equal("hello" );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|lower }}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---capitalize--"></a>
## capitalize ->
should capitalize the first word in a string.

```js
var test_template = twig({data: '{{ "hello world"|capitalize }}' });
test_template.render().should.equal("Hello world" );
var test_template2 = twig({data: '{{ "HELLO WORLD"|capitalize }}' });
test_template2.render().should.equal("Hello world" );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|capitalize }}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---title--"></a>
## title ->
should capitalize all the words in a string.

```js
var test_template = twig({data: '{{ "hello world"|title }}' });
test_template.render().should.equal("Hello World" );
var test_template2 = twig({data: '{{ "HELLO WORLD"|title }}' });
test_template2.render().should.equal("Hello World" );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|title }}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---length--"></a>
## length ->
should determine the length of a string.

```js
var test_template = twig({data: '{{ "test"|length }}' });
test_template.render().should.equal("4");
```

should determine the length of an array.

```js
var test_template = twig({data: '{{ [1,2,4,76,"tesrt"]|length }}' });
test_template.render().should.equal("5");
```

should determine the length of an object.

```js
var test_template = twig({data: '{{ {"a": "b", "c": "1", "test": "test"}|length }}' });
test_template.render().should.equal("3");
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|length }}' });
test_template.render().should.equal("0" );
```

<a name="twigjs-filters---sort--"></a>
## sort ->
should sort an array.

```js
var test_template = twig({data: '{{ [1,5,2,7]|sort }}' });
test_template.render().should.equal("1,2,5,7" );
test_template = twig({data: '{{ ["test","abc",2,7]|sort }}' });
test_template.render().should.equal("2,7,abc,test" );
```

should sort an object.

```js
var test_template = twig({data: "{% set obj =  {'c': 1,'d': 5,'t': 2,'e':7}|sort %}{% for key,value in obj|sort %}{{key}}:{{value}} {%endfor %}" });
test_template.render().should.equal("c:1 t:2 d:5 e:7 " );
test_template = twig({data: "{% set obj = {'m':'test','z':'abc','a':2,'y':7} %}{% for key,value in obj|sort %}{{key}}:{{value}} {%endfor %}" });
test_template.render().should.equal("a:2 y:7 z:abc m:test " );
```

should handle undefined.

```js
var test_template = twig({data: '{% set obj = undef|sort %}{% for key, value in obj|sort %}{{key}}:{{value}}{%endfor%}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---reverse--"></a>
## reverse ->
should reverse an array.

```js
var test_template = twig({data: '{{ ["a", "b", "c"]|reverse }}' });
test_template.render().should.equal("c,b,a" );
```

should reverse an object.

```js

```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|reverse }}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---keys--"></a>
## keys ->
should return the keys of an array.

```js
var test_template = twig({data: '{{ ["a", "b", "c"]|keys }}' });
test_template.render().should.equal("0,1,2" );
```

should return the keys of an object.

```js
var test_template = twig({data: '{{ {"a": 1, "b": 4, "c": 5}|keys }}' });
test_template.render().should.equal("a,b,c" );
test_template = twig({data: '{{ {"0":"a", "1":"b", "2":"c"}|keys }}' });
test_template.render().should.equal("0,1,2" );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|keys }}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---merge--"></a>
## merge ->
should merge two objects into an object.

```js
// Object merging
var test_template = twig({data: '{% set obj= {"a":"test", "b":"1"}|merge({"b":2,"c":3}) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}' });
test_template.render().should.equal('a:test b:2 c:3 ' );
```

should merge two arrays into and array.

```js
// Array merging
var test_template = twig({data: '{% set obj= ["a", "b"]|merge(["c", "d"]) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}' });
test_template.render().should.equal('0:a 1:b 2:c 3:d ' );
```

should merge an object and an array into an object.

```js
// Mixed merging
var test_template = twig({data: '{% set obj= ["a", "b"]|merge({"a": "c", "3":4}, ["c", "d"]) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}' });
test_template.render().should.equal('0:a 1:b 3:4 4:c 5:d a:c ' );
// Mixed merging(2)
test_template = twig({data: '{% set obj= {"1":"a", "a":"b"}|merge(["c", "d"]) %}{% for key in obj|keys %}{{key}}:{{obj[key]}} {%endfor %}' });
test_template.render().should.equal('1:a a:b 2:c 3:d ' );
```

<a name="twigjs-filters---join--"></a>
## join ->
should join all values in an object.

```js
var test_template = twig({data: '{{ {"a":"1", "b": "b", "c":test}|join("-") }}' });
test_template.render({"test": "t"}).should.equal("1-b-t" );
```

should joing all values in an array.

```js
var test_template = twig({data: '{{ [1,2,4,76]|join }}' });
test_template.render().should.equal("12476" );
test_template = twig({data: '{{ [1+ 5,2,4,76]|join("-" ~ ".") }}' });
test_template.render().should.equal("6-.2-.4-.76" );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|join }}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---default--"></a>
## default ->
should not provide the default value if a key is defined and not empty.

```js
var test_template = twig({data: '{{ var|default("Not Defined") }}' });
test_template.render({"var":"value"}).should.equal("value" );
```

should provide a default value if a key is not defined.

```js
var test_template = twig({data: '{{ var|default("Not Defined") }}' });
test_template.render().should.equal("Not Defined" );
```

should provide a default value if a value is empty.

```js
var test_template = twig({data: '{{ ""|default("Empty String") }}' });
test_template.render().should.equal("Empty String" );
test_template = twig({data: '{{ var.key|default("Empty Key") }}' });
test_template.render({'var':{}}).should.equal("Empty Key" );
```

<a name="twigjs-filters---date--"></a>
## date ->
should recognize timestamps.

```js
var template = twig({data: '{{ 27571323556|date("d/m/Y @ H:i:s") }}'})
    , date = new Date(27571323556000); // 13/09/2843 @ 08:59:16 EST
template.render().should.equal( stringDate(date) );
```

should recognize string date formats.

```js
var template = twig({data: '{{ "Tue Aug 14 08:52:15 +0000 2007"|date("d/m/Y @ H:i:s") }}'})
    , date = new Date(1187081535000); // 14/08/2007 @ 04:52:15 EST
template.render().should.equal( stringDate(date) );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|date("d/m/Y @ H:i:s") }}' });
test_template.render().should.equal( "" );
```

<a name="twigjs-filters---replace--"></a>
## replace ->
should replace strings provided in a map.

```js
var template = twig({data: '{{ "I like %this% and %that%. Seriously, I like %this% and %that%."|replace({"%this%": foo, "%that%": "bar"}) }}'});
template.render({foo: "foo"}).should.equal("I like foo and bar. Seriously, I like foo and bar." );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|replace }}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---format--"></a>
## format ->
should replace formatting tags with parameters.

```js
var template = twig({data: '{{ "I like %s and %s."|format(foo, "bar") }}'});
template.render({foo: "foo"}).should.equal("I like foo and bar." );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|format }}' });
test_template.render().should.equal("" );
```

should handle positive leading sign without padding.

```js
var template = twig({data: '{{ "I like positive numbers like %+d."|format(123) }}'});
template.render({foo: "foo"}).should.equal("I like positive numbers like +123." );
```

should handle negative leading sign without padding.

```js
var template = twig({data: '{{ "I like negative numbers like %+d."|format(-123) }}'});
template.render({foo: "foo"}).should.equal("I like negative numbers like -123." );
```

should handle positive leading sign with padding zero.

```js
var template = twig({data: '{{ "I like positive numbers like %+05d."|format(123) }}'});
template.render({foo: "foo"}).should.equal("I like positive numbers like +0123." );
```

should handle negative leading sign with padding zero.

```js
var template = twig({data: '{{ "I like negative numbers like %+05d."|format(-123) }}'});
template.render({foo: "foo"}).should.equal("I like negative numbers like -0123." );
```

should handle positive leading sign with padding space.

```js
var template = twig({data: '{{ "I like positive numbers like %+5d."|format(123) }}'});
template.render({foo: "foo"}).should.equal("I like positive numbers like  +123." );
```

should handle negative leading sign with padding space.

```js
var template = twig({data: '{{ "I like negative numbers like %+5d."|format(-123) }}'});
template.render({foo: "foo"}).should.equal("I like negative numbers like  -123." );
```

<a name="twigjs-filters---striptags--"></a>
## striptags ->
should remove tags from a value.

```js
var template = twig({data: '{{ "<p>Test paragraph.</p><!-- Comment --> <a href=\\"#fragment\\">Other text</a>"|striptags }}'});
template.render().should.equal("Test paragraph. Other text" );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|striptags }}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---escape--"></a>
## escape ->
should convert unsafe characters to HTML entities.

```js
var template = twig({data: '{{ "<p>Test paragraph.</p><!-- Comment --> <a href=\'#fragment\'>Other text</a>"|escape }}'});
template.render().should.equal("&lt;p&gt;Test paragraph.&lt;/p&gt;&lt;!-- Comment --&gt; &lt;a href=&#039;#fragment\&#039;&gt;Other text&lt;/a&gt;" );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|escape }}' });
test_template.render().should.equal("" );
```

should not escape twice if autoescape is on.

```js
twig({
    autoescape: true,
    data: '{{ value }}'
}).render({
    value: "<test>&</test>"
}).should.equal('&lt;test&gt;&amp;&lt;/test&gt;');
```

<a name="twigjs-filters---e--"></a>
## e ->
should alias escape function with e.

```js
var template = twig({data: '{{ "<p>Test paragraph.</p><!-- Comment --> <a href=\'#fragment\'>Other text</a>"|e }}'});
template.render().should.equal("&lt;p&gt;Test paragraph.&lt;/p&gt;&lt;!-- Comment --&gt; &lt;a href=&#039;#fragment\&#039;&gt;Other text&lt;/a&gt;" );
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|e }}' });
test_template.render().should.equal("" );
```

should not escape twice if autoescape is on.

```js
var template = twig({
    autoescape: true,
    data: '{{ value }}'
});
template.render({
    value: "<test>&</test>"
}).should.equal('&lt;test&gt;&amp;&lt;/test&gt;');
```

<a name="twigjs-filters---nl2br--"></a>
## nl2br ->
should convert newlines into html breaks.

```js
var template = twig({data: '{{ test|nl2br }}'});
template.render({ test: 'Line 1\r\nLine 2\nLine 3\rLine 4\n\n' })
    .should.equal("Line 1<br />\nLine 2<br />\nLine 3<br />\nLine 4<br />\n<br />\n");
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|nl2br }}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---truncate--"></a>
## truncate ->
should truncate string to default size(20) and add default separator.

```js
var template = twig({data: '{{ test|truncate }}'});
template.render({test: '01234567890123456789012345678901234567890123456789'}).should.equal("012345678901234567890123456789...");
```

should truncate string to custom size(10) and add default separator.

```js
var template = twig({data: '{{ test|truncate(10) }}'});
template.render({test: '01234567890123456789012345678901234567890123456789'}).should.equal("0123456789...");
```

should truncate string to custom size(15) with preserve and add default separator.

```js
var template = twig({data: '{{ test|truncate(15, true) }}'});
template.render({test: '0123456789 0123456789 0123456789 0123456789 0123456789'}).should.equal("0123456789 0123456789...");
```

should truncate string to custom size(15) with preserve and add custom(*) separator.

```js
var template = twig({data: '{{ test|truncate(15, true, "*") }}'});
template.render({test: '0123456789 0123456789 0123456789 0123456789 0123456789'}).should.equal("0123456789 0123456789*");
```

<a name="twigjs-filters---trim--"></a>
## trim ->
should trim whitespace from strings.

```js
var template = twig({data: '{{ test|trim }}'});
template.render({ test: '\r\n Test\n  ' }).should.equal("Test");
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|trim }}' });
test_template.render().should.equal("" );
```

<a name="twigjs-filters---number_format--"></a>
## number_format ->
should round to nearest integer if no parameters.

```js
var template = twig({data: '{{ 1234.56|number_format }}'});
template.render().should.equal("1,235");
```

should have customizable precision.

```js
var template = twig({data: '{{ 1234.567890123|number_format(4) }}'});
template.render().should.equal("1,234.5679");
```

should have a customizable decimal seperator.

```js
var template = twig({data: '{{ 1234.567890123|number_format(2,",") }}'});
template.render().should.equal("1,234,57");
```

should have a customizable thousands seperator.

```js
var template = twig({data: '{{ 1234.5678|number_format(2,","," ") }}'});
template.render().should.equal("1 234,57");
```

should handle blank seperators.

```js
var template = twig({data: '{{ 1234.5678|number_format(2,"","") }}'});
template.render().should.equal("123457");
```

should handle undefined.

```js
var test_template = twig({data: '{{ undef|number_format }}' });
test_template.render().should.equal("0");
```

<a name="twigjs-filters---slice--"></a>
## slice ->
should slice a string.

```js
var test_template = twig({data: "{{ '12345'|slice(1, 2) }}" });
test_template.render().should.equal("23");
```

should slice a string to the end.

```js
var test_template = twig({data: "{{ '12345'|slice(2) }}" });
test_template.render().should.equal("345");
```

should slice a string from the start.

```js
var test_template = twig({data: "{{ '12345'|slice(null, 2) }}" });
test_template.render().should.equal("12");
```

should slice a string from a negative offset.

```js
var test_template = twig({data: "{{ '12345'|slice(-2, 1) }}" });
test_template.render().should.equal("4");
```

should slice a string from a negative offset to end of string.

```js
var test_template = twig({data: "{{ '12345'|slice(-2) }}" });
test_template.render().should.equal("45");
```

should slice an array.

```js
var test_template = twig({data: "{{ [1, 2, 3, 4, 5]|slice(1, 2)|join(',') }}" });
test_template.render().should.equal("2,3");
```

should slice an array to the end.

```js
var test_template = twig({data: "{{ [1, 2, 3, 4, 5]|slice(2)|join(',') }}" });
test_template.render().should.equal("3,4,5");
```

should slice an array from the start.

```js
var test_template = twig({data: "{{ [1, 2, 3, 4, 5]|slice(null, 2)|join(',') }}" });
test_template.render().should.equal("1,2");
```

should slice an array from a negative offset.

```js
var test_template = twig({data: "{{ [1, 2, 3, 4, 5]|slice(-2, 1)|join(',') }}" });
test_template.render().should.equal("4");
```

should slice an array from a negative offset to the end of the array.

```js
var test_template = twig({data: "{{ [1, 2, 3, 4, 5]|slice(-4)|join(',') }}" });
test_template.render().should.equal("2,3,4,5");
```

<a name="twigjs-filters---abs--"></a>
## abs ->
should convert negative numbers to its absolute value.

```js
var test_template = twig({data: "{{ '-7.365'|abs }}"});
test_template.render().should.equal("7.365");
```

should not alter absolute numbers.

```js
var test_template = twig({data: "{{ 95|abs }}"});
test_template.render().should.equal("95");
```

<a name="twigjs-filters---first--"></a>
## first ->
should return first item in array.

```js
var test_template = twig({data: "{{ ['a', 'b', 'c', 'd']|first }}"});
test_template.render().should.equal("a");
```

should return first member of object.

```js
var test_template = twig({data: "{{ { item1: 'a', item2: 'b', item3: 'c', item4: 'd'}|first }}"});
test_template.render().should.equal("a");
```

should not fail when passed empty obj, arr or str.

```js
var test_template = twig({data: "{{ {}|first }}"});
test_template.render().should.equal("");
var test_template = twig({data: "{{ []|first }}"});
test_template.render().should.equal("");
var test_template = twig({data: "{{ myemptystr|first }}"});
test_template.render({myemptystr: ""}).should.equal("");
```

should return first character in string.

```js
var test_template = twig({data: "{{ 'abcde'|first }}"});
test_template.render().should.equal("a");
```

<a name="twigjs-filters---split--"></a>
## split ->
should split string with a separator.

```js
var test_template = twig({data: "{{ 'one-two-three'|split('-') }}"});
test_template.render().should.equal("one,two,three");
```

should split string with a separator and positive limit.

```js
var test_template = twig({data: "{{ 'one-two-three-four-five'|split('-', 3) }}"});
test_template.render().should.equal("one,two,three-four-five");
```

should split string with a separator and negative limit.

```js
var test_template = twig({data: "{{ 'one-two-three-four-five'|split('-', -2) }}"});
test_template.render().should.equal("one,two,three");
```

should split with empty separator.

```js
var test_template = twig({data: "{{ '123'|split('') }}"});
test_template.render().should.equal("1,2,3");
```

should split with empty separator and limit.

```js
var test_template = twig({data: "{{ 'aabbcc'|split('', 2) }}"});
test_template.render().should.equal("aa,bb,cc");
```

<a name="twigjs-filters---batch--"></a>
## batch ->
should work with arrays that require filling (with fill specified).

```js
var test_template = twig({data: "{{ ['a', 'b', 'c', 'd', 'e', 'f', 'g']|batch(3, 'x') }}"});
test_template.render().should.equal("a,b,c,d,e,f,g,x,x");
```

should work with arrays that require filling (without fill specified).

```js
var test_template = twig({data: "{{ ['a', 'b', 'c', 'd', 'e', 'f', 'g']|batch(3) }}"});
test_template.render().should.equal("a,b,c,d,e,f,g");
```

should work with arrays that do not require filling (with fill specified).

```js
var test_template = twig({data: "{{ ['a', 'b', 'c', 'd', 'e', 'f']|batch(3, 'x') }}"});
test_template.render().should.equal("a,b,c,d,e,f");
```

should work with arrays that do not require filling (without fill specified).

```js
var test_template = twig({data: "{{ ['a', 'b', 'c', 'd', 'e', 'f']|batch(3) }}"});
test_template.render().should.equal("a,b,c,d,e,f");
```

should return an empty result for an empty array.

```js
var test_template = twig({data: "{{ []|batch(3, 'x') }}"});
test_template.render().should.equal("");
```

<a name="twigjs-filters---last--"></a>
## last ->
should return last character in string.

```js
var test_template = twig({data: "{{ 'abcd'|last }}"});
test_template.render().should.equal("d");
```

should return last item in array.

```js
var test_template = twig({data: "{{ ['a', 'b', 'c', 'd']|last }}"});
test_template.render().should.equal("d");
```

should return last item in a sorted object.

```js
var test_template = twig({data: "{{ {'m':1, 'z':5, 'a':3}|sort|last }}" });
test_template.render().should.equal("5");
```

<a name="twigjs-filters---raw--"></a>
## raw ->
should output the raw value if autoescape is on.

```js
var template = twig({
    autoescape: true,
    data: '{{ value|raw }}'
});
template.render({
    value: "<test>&</test>"
}).should.equal('<test>&</test>');
```

should output the raw value if autoescape is off.

```js
var template = twig({
    autoescape: false,
    data: '{{ value|raw }}'
});
template.render({
    value: "<test>&</test>"
}).should.equal('<test>&</test>');
```

<a name="twigjs-filters---round--"></a>
## round ->
should round up (common).

```js
var test_template = twig({data: "{{ 2.7|round }}"});
test_template.render().should.equal("3");
```

should round down (common).

```js
var test_template = twig({data: "{{ 2.1|round }}"});
test_template.render().should.equal("2");
```

should truncate input when input decimal places exceeds precision (floor).

```js
var test_template = twig({data: "{{ 2.1234|round(3, 'floor') }}" });
test_template.render().should.equal("2.123");
```

should round up (ceil).

```js
var test_template = twig({data: "{{ 2.1|round(0, 'ceil') }}" });
test_template.render().should.equal("3");
```

should truncate precision when a negative precision is passed (common).

```js
var test_template = twig({data: "{{ 21.3|round(-1)}}" });
test_template.render().should.equal("20");
```

should round up and truncate precision when a negative precision is passed (ceil).

```js
var test_template = twig({data: "{{ 21.3|round(-1, 'ceil')}}" });
test_template.render().should.equal("30");
```

should round down and truncate precision when a negative precision is passed (floor).

```js
var test_template = twig({data: "{{ 21.3|round(-1, 'ceil')}}" });
test_template.render().should.equal("30");
```

<a name="twigjs-loader--"></a>
# Twig.js Loader ->
should load a template from the filesystem asynchronously.

```js
twig({
    id:   'fs-node-async',
    path: 'test/templates/test.twig',
    load: function(template) {
        // Render the template
        template.render({
            test: "yes",
            flag: true
        }).should.equal("Test template = yes\n\nFlag set!");
        done();
    }
});
```

should load a template from the filesystem synchronously.

```js
var template = twig({
    id:   'fs-node-sync',
    path: 'test/templates/test.twig',
    async: false
});
// Render the template
template.render({
    test: "yes",
    flag: true
}).should.equal("Test template = yes\n\nFlag set!");
```

<a name="twigjs-include--"></a>
# Twig.js Include ->
should load an included template with no context.

```js
twig({
    id:   'include',
    path: 'test/templates/include.twig',
    async: false
});
// Load the template
twig({ref: 'include'}).render({test: 'tst'}).should.equal( "BeforeTest template = tst\n\nAfter" );
```

should load an included template with additional context.

```js
twig({
    id:   'include-with',
    path: 'test/templates/include-with.twig',
    async: false
});
// Load the template
twig({ref: 'include-with'}).render({test: 'tst'}).should.equal( "template: before,tst-mid-template: after,tst" );
```

should load an included template with only additional context.

```js
twig({
    id:   'include-only',
    path: 'test/templates/include-only.twig',
    async: false
});
// Load the template
twig({ref: 'include-only'}).render({test: 'tst'}).should.equal( "template: before,-mid-template: after," );
```

<a name="twigjs-functions--"></a>
# Twig.js Functions ->
should allow you to define a function.

```js
twig({data: '{{ square(a) }}'}).render({a:4}).should.equal("16");
```

should chain with other expressions.

```js
twig({data: '{{ square(a) + 4 }}'}).render({a:4}).should.equal("20");
```

should chain with filters.

```js
twig({data: '{{ echo(a)|default("foo") }}'}).render().should.equal("foo");
```

should work in for loop expressions.

```js
twig({data: '{% for i in list(1, 2, 3) %}{{ i }},{% endfor %}'}).render().should.equal("1,2,3,");
```

should be able to differentiate between a function and a variable.

```js
twig({data: '{{ square ( square ) + square }}'}).render({square: 2}).should.equal("6");
```

should work with boolean operations.

```js
twig({data: '{% if echo(true) or echo(false) %}yes{% endif %}'}).render().should.equal("yes");
```

should execute functions passed as context values.

```js
twig({
    data: '{{ value }}'
}).render({
    value: function() {
        return "test";
    }
}).should.equal("test");
```

should execute functions passed as context values with this mapped to the context.

```js
twig({
    data: '{{ value }}'
}).render({
    test: "value",
    value: function() {
        return this.test;
    }
}).should.equal("value");
```

should execute functions passed as context values with arguments.

```js
twig({
    data: '{{ value(1, "test") }}'
}).render({
    value: function(a, b, c) {
        return a + "-" + b + "-" + (c===undefined?"true":"false");
    }
}).should.equal("1-test-true");
```

should execute functions passed as context value parameters with this mapped to the context.

```js
twig({
    data: '{{ value }}'
}).render({
    test: "value",
    value: function() {
        return this.test;
    }
}).should.equal("value");
```

should execute functions passed as context object parameters.

```js
twig({
    data: '{{ obj.value }}'
}).render({
    obj: {
         value: function() {
            return "test";
        }
    }
}).should.equal("test");
```

should execute functions passed as context object parameters with arguments.

```js
twig({
    data: '{{ obj.value(1, "test") }}'
}).render({
    obj: {
         value: function(a, b, c) {
            return a + "-" + b + "-" + (c===undefined?"true":"false");
        }
    }
}).should.equal("1-test-true");
```

should execute functions passed as context object parameters.

```js
twig({
    data: '{{ obj["value"] }}'
}).render({
    obj: {
         value: function() {
            return "test";
        }
    }
}).should.equal("test");
```

should execute functions passed as context object parameters with arguments.

```js
twig({
    data: '{{ obj["value"](1, "test") }}'
}).render({
    obj: {
         value: function(a, b, c) {
            return a + "-" + b + "-" + (c===undefined?"true":"false");
        }
    }
}).should.equal("1-test-true");
```

<a name="twigjs-functions---built-in-functions--"></a>
## Built-in Functions ->
<a name="twigjs-functions---built-in-functions---range--"></a>
### range ->
should work over a range of numbers.

```js
twig({data: '{% for i in range(0, 3) %}{{ i }},{% endfor %}'}).render().should.equal("0,1,2,3,");
```

should work over a range of letters.

```js
twig({data: '{% for i in range("a", "c") %}{{ i }},{% endfor %}'}).render().should.equal("a,b,c,");
```

should work with an interval.

```js
twig({data: '{% for i in range(1, 15, 3) %}{{ i }},{% endfor %}'}).render().should.equal("1,4,7,10,13,");
```

should work with .. invocation.

```js
twig({data: '{% for i in 0..3 %}{{ i }},{% endfor %}'}).render().should.equal("0,1,2,3,");
twig({data: '{% for i in "a" .. "c" %}{{ i }},{% endfor %}'}).render().should.equal("a,b,c,");
```

<a name="twigjs-functions---built-in-functions---cycle--"></a>
### cycle ->
should cycle through an array of values.

```js
twig({data: '{% for i in range(0, 3) %}{{ cycle(["odd", "even"], i) }};{% endfor %}'}).render().should.equal("odd;even;odd;even;");
```

<a name="twigjs-functions---built-in-functions---date--"></a>
### date ->
should understand timestamps.

```js
var date = new Date(946706400 * 1000);
twig({data: '{{ date(946706400)|date("d/m/Y @ H:i:s") }}'}).render().should.equal(stringDate(date));
```

should understand relative dates.

```js
twig({data: '{{ date("+1 day") > date() }}'}).render().should.equal("true");
twig({data: '{{ date("-1 day") > date() }}'}).render().should.equal("false");
```

should support 'now' as a date parameter.

```js
twig({data: '{{ date("now") }}' }).render().should.equal(new Date().toString());
```

should understand exact dates.

```js
var date = new Date("June 20, 2010 UTC");
            
twig({data: '{{ date("June 20, 2010 UTC")|date("d/m/Y @ H:i:s") }}'}).render().should.equal(stringDate(date));
```

<a name="twigjs-functions---built-in-functions---dump--"></a>
### dump ->
should output formatted number.

```js
twig({data: '{{ dump(test) }}' }).render({ test: 5 }).should.equal('number(5)' + EOL);
```

should output formatted string.

```js
twig({data: '{{ dump(test) }}' }).render({ test: "String" }).should.equal('string(6) "String"' + EOL);
```

should output formatted boolean.

```js
twig({data: '{{ dump(test) }}' }).render({ test: true }).should.equal('bool(true)' + EOL);
```

should output formatted null.

```js
twig({data: '{{ dump(test) }}' }).render({ test: null }).should.equal('NULL' + EOL);
```

should output formatted object.

```js
twig({data: '{{ dump(test) }}' }).render({ test: {} }).should.equal('object(0) {' + EOL + '}' + EOL);
```

should output formatted array.

```js
twig({data: '{{ dump(test) }}' }).render({ test: [] }).should.equal('object(0) {' + EOL + '}' + EOL);
```

should output formatted undefined.

```js
twig({data: '{{ dump(test) }}' }).render({ test: undefined }).should.equal('undefined' + EOL);
```

<a name="twigjs-functions---built-in-functions---block--"></a>
### block ->
should render the content of blocks.

```js
twig({data: '{% block title %}Content - {{ val }}{% endblock %} Title: {{ block("title") }}'}).render({ val: "test" })
    .should.equal("Content - test Title: Content - test");
```

shouldn't escape the content of blocks twice.

```js
twig({
    autoescape: true,
    data: '{% block test %}{{ val }}{% endblock %} {{ block("test") }}'
}).render({
    val: "te&st"
}).should.equal("te&amp;st te&amp;st");
```

<a name="twigjs-functions---built-in-functions---attribute--"></a>
### attribute ->
should access attribute of an object.

```js
twig({data: '{{ attribute(obj, key) }}' }).render({
    obj: { name: "Twig.js"}, 
    key: "name"
})
.should.equal("Twig.js");
```

should call function of attribute of an object.

```js
twig({data: '{{ attribute(obj, key, params) }}' }).render({ 
    obj: {
        name: function(first, last) { 
            return first+'.'+last;
        } 
    },
    key: "name",
    params: ['Twig', 'js']
  })
  .should.equal("Twig.js");
```

should return undefined for missing attribute of an object.

```js
twig({data: '{{ attribute(obj, key, params) }}' }).render({ 
    obj: {
        name: function(first, last) { 
            return first+'.'+last;
        } 
    },
    key: "missing",
    params: ['Twig', 'js']
  })
  .should.equal("");
```

should return element of an array.

```js
twig({data: '{{ attribute(arr, 0) }}' }).render({ 
    arr: ['Twig', 'js']
  })
  .should.equal("Twig");
```

should return undef for array beyond index size.

```js
twig({data: '{{ attribute(arr, 100) }}' }).render({ 
    arr: ['Twig', 'js']
  })
  .should.equal("");
```

<a name="twigjs-functions---built-in-functions---template_from_string--"></a>
### template_from_string ->
should load a template from a string.

```js
twig({data: '{% include template_from_string("{{ value }}") %}'}).render({
    value: 'test'
})
.should.equal('test');
```

should load a template from a variable.

```js
twig({data: '{% include template_from_string(template) %}'}).render({
    template: '{{ value }}',
    value: 'test'
})
.should.equal('test');
```

<a name="twigjs-functions---built-in-functions---random--"></a>
### random ->
should return a random item from a traversable or array.

```js
var arr = "bcdefghij".split("");
for (var i = 1; i <= 1000; i++) {
    arr.should.containEql(twig({data: '{{ random(arr) }}'}).render({arr: arr}));
}
```

should return a random character from a string.

```js
var str = "abcdefghij";
for (var i = 1; i <= 1000; i++) {
    str.should.containEql(twig({data: '{{ random(str) }}'}).render({str: str}));
}
```

should return a random integer between 0 and the integer parameter.

```js
for (var i = 1; i <= 1000; i++) {
    twig({data: '{{ random(10) }}'}).render().should.be.within(0, 10);
}
```

should return a random integer between 0 and 2147483647 when no parameters are passed.

```js
for (var i = 1; i <= 1000; i++) {
    twig({data: '{{ random() }}'}).render().should.be.within(0, 2147483647);
}
```

<a name="twigjs-macro--"></a>
# Twig.js Macro ->
it should load macro.

```js
twig({
    id:   'macro',
    path: 'test/templates/macro.twig',
    async: false
});
// Load the template
twig({ref: 'macro'}).render({ }).should.equal( '' );
```

it should import macro.

```js
twig({
    id:   'import-macro',
    path: 'test/templates/import.twig',
    async: false
});
// Load the template
twig({ref: 'import-macro'}).render({ }).trim().should.equal( "Hello World" );
```

it should run macro with self reference.

```js
twig({
    id:   'import-macro-self',
    path: 'test/templates/macro-self.twig',
    async: false
});
// Load the template
twig({ref: 'import-macro-self'}).render({ }).trim().should.equal( '<p><input type="text" name="username" value="" size="20" /></p>' );
```

it should run wrapped macro with self reference.

```js
twig({
    id:   'import-wrapped-macro-self',
    path: 'test/templates/macro-wrapped.twig',
    async: false
});
// Load the template
twig({ref: 'import-wrapped-macro-self'}).render({ }).trim().should.equal( '<p><div class="field"><input type="text" name="username" value="" size="20" /></div></p>' );
```

it should run wrapped macro with context and self reference.

```js
twig({
    id:   'import-macro-context-self',
    path: 'test/templates/macro-context.twig',
    async: false
});
// Load the template
twig({ref: 'import-macro-context-self'}).render({ 'greetings': 'Howdy' }).trim().should.equal( 'Howdy Twigjs' );
```

it should run wrapped macro inside blocks.

```js
twig({
    id:   'import-macro-inside-block',
    path: 'test/templates/macro-blocks.twig',
    async: false
});
// Load the template
twig({ref: 'import-macro-inside-block'}).render({ }).trim().should.equal( 'Welcome <div class="name">Twig Js</div>' );
```

it should import selected macros from template.

```js
twig({
    id:   'from-macro-import',
    path: 'test/templates/from.twig',
    async: false
});
// Load the template
twig({ref: 'from-macro-import'}).render({ }).trim().should.equal( 'Twig.js<div class="field"><input type="text" name="text" value="" size="20" /></div><div class="field red"><input type="text" name="password" value="" size="20" /></div>' );
```

should support inline includes by ID.

```js
twig({
    id:   'hello',
    data: '{% macro echo(name) %}Hello {{ name }}{% endmacro %}'
});
var template = twig({
        allowInlineIncludes: true,
        data: 'template with {% from "hello" import echo %}{{ echo("Twig.js") }}'
    }),
    output = template.render()
output.should.equal("template with Twig.js");
```

<a name="twigjs-optional-functionality--"></a>
# Twig.js Optional Functionality ->
should support inline includes by ID.

```js
twig({
    id:   'other',
    data: 'another template'
});
var template = twig({
        allowInlineIncludes: true,
        data: 'template with {% include "other" %}'
    }),
    output = template.render()
output.should.equal("template with another template");
```

<a name="twigjs-regression-tests--"></a>
# Twig.js Regression Tests ->
#47 should not match variables starting with not.

```js
// Define and save a template
twig({data: '{% for note in notes %}{{note}}{% endfor %}'}).render({notes:['a', 'b', 'c']}).should.equal("abc");
```

#56 functions work inside parentheses.

```js
// Define and save a template
Twig.extendFunction('custom', function(value) {
    return true;
});
twig({data: '{% if (custom("val") and custom("val")) %}out{% endif %}'}).render({}).should.equal("out");
```

#83 Support for trailing commas in arrays.

```js
twig({data: '{{ [1,2,3,4,] }}'}).render().should.equal("1,2,3,4");
```

#83 Support for trailing commas in objects.

```js
twig({data: '{{ {a:1, b:2, c:3, } }}'}).render();
```

<a name="twigjs-tags--"></a>
# Twig.js Tags ->
should support spaceless.

```js
twig({
	data: "{% spaceless %}<div>\n    <b>b</b>   <i>i</i>\n</div>{% endspaceless %}"
}).render().should.equal(
	"<div><b>b</b><i>i</i></div>"
);
```

<a name="twigjs-tests--"></a>
# Twig.js Tests ->
<a name="twigjs-tests---empty-test--"></a>
## empty test ->
should identify numbers as not empty.

```js
// number
twig({data: '{{ 1 is empty }}'}).render().should.equal("false" );
twig({data: '{{ 0 is empty }}'}).render().should.equal("false" );
```

should identify empty strings.

```js
// String
twig({data: '{{ "" is empty }}'}).render().should.equal("true" );
twig({data: '{{ "test" is empty }}'}).render().should.equal("false" );
```

should identify empty arrays.

```js
// Array
twig({data: '{{ [] is empty }}'}).render().should.equal("true" );
twig({data: '{{ ["1"] is empty }}'}).render().should.equal("false" );
```

should identify empty objects.

```js
// Object
twig({data: '{{ {} is empty }}'}).render().should.equal("true" );
twig({data: '{{ {"a":"b"} is empty }}'}).render().should.equal("false" );
twig({data: '{{ {"a":"b"} is not empty }}'}).render().should.equal("true" );
```

<a name="twigjs-tests---odd-test--"></a>
## odd test ->
should identify a number as odd.

```js
twig({data: '{{ (1 + 4) is odd }}'}).render().should.equal("true" );
twig({data: '{{ 6 is odd }}'}).render().should.equal("false" );
```

<a name="twigjs-tests---even-test--"></a>
## even test ->
should identify a number as even.

```js
twig({data: '{{ (1 + 4) is even }}'}).render().should.equal("false" );
twig({data: '{{ 6 is even }}'}).render().should.equal("true" );
```

<a name="twigjs-tests---divisibleby-test--"></a>
## divisibleby test ->
should determine if a number is divisible by the given number.

```js
twig({data: '{{ 5 is divisibleby(3) }}'}).render().should.equal("false" );
twig({data: '{{ 6 is divisibleby(3) }}'}).render().should.equal("true" );
```

<a name="twigjs-tests---defined-test--"></a>
## defined test ->
should identify a key as defined if it exists in the render context.

```js
twig({data: '{{ key is defined }}'}).render().should.equal("false" );
twig({data: '{{ key is defined }}'}).render({key: "test"}).should.equal( "true" );
```

<a name="twigjs-tests---none-test--"></a>
## none test ->
should identify a key as none if it exists in the render context and is null.

```js
twig({data: '{{ key is none }}'}).render().should.equal("false");
twig({data: '{{ key is none }}'}).render({key: "test"}).should.equal("false");
twig({data: '{{ key is none }}'}).render({key: null}).should.equal("true");
twig({data: '{{ key is null }}'}).render({key: null}).should.equal("true");
```

<a name="twigjs-tests---sameas-test--"></a>
## sameas test ->
should identify the exact same type as true.

```js
twig({data: '{{ true is sameas(true) }}'}).render().should.equal("true");
twig({data: '{{ a is sameas(1) }}'}).render({a: 1}).should.equal("true");
twig({data: '{{ a is sameas("test") }}'}).render({a: "test"}).should.equal("true");
twig({data: '{{ a is sameas(true) }}'}).render({a: true}).should.equal("true");
```

should identify the different types as false.

```js
twig({data: '{{ false is sameas(true) }}'}).render().should.equal("false");
twig({data: '{{ true is sameas(1) }}'}).render().should.equal("false");
twig({data: '{{ false is sameas("") }}'}).render().should.equal("false");
twig({data: '{{ a is sameas(1) }}'}).render({a: "1"}).should.equal("false");
```

<a name="twigjs-tests---iterable-test--"></a>
## iterable test ->
should fail on non-iterable data types.

```js
twig({data: "{{ val is iterable ? 'ok' : 'ko' }}"}).render(data).should.equal("ko");
twig({data: "{{ val is iterable ? 'ok' : 'ko' }}"}).render({val: null}).should.equal("ko");
twig({data: "{{ val is iterable ? 'ok' : 'ko' }}"}).render({}).should.equal("ko");
```

should pass on iterable data types.

```js
twig({data: "{{ foo is iterable ? 'ok' : 'ko' }}"}).render(data).should.equal("ok");
twig({data: "{{ obj is iterable ? 'ok' : 'ko' }}"}).render(data).should.equal("ok");
```

