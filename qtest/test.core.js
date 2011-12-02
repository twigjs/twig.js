// Twig.debug = true;

module("Core");

test("ref", function() {
    // Define and save a template
    twig({
        id:   'test',
        data: '{{ "test" }}'
    });

    // Load and render the template
    equal( twig({ref: 'test'}).render(), "test" );
});

var test_data = [
    {a: 10, b: 15},
    {a: 0, b: 0},
    {a: 1, b: 11},
    {a: 10444, b: 0.5},
    {a: 1034, b: -53},
    {a: -56, b: -1.7},
    {a: 34, b: 0},
    {a: 14, b: 14}
];

module("Tags");
test("output", function() {
    // Really all we care about here is not throwing exceptions.
    equal( twig({data: '{{ "test" }}'}).render(), "test" );
    equal( twig({data: '{{ " }} " }}'}).render(), " }} " );
    equal( twig({data: '{{ " \\"}} " }}'}).render(), ' "}} ' );
    equal( twig({data: "{{ ' }} ' }}"}).render(), " }} " );
    equal( twig({data: "{{ ' \\'}} ' }}"}).render(), " '}} " );

    equal( twig({data: '{{ " \'}} " }}'}).render(), " '}} " );
    equal( twig({data: "{{ ' \"}} ' }}"}).render(), ' "}} ' );
});


module("Expression Types");

test("number", function() {
    expect(3);
    equal( twig({data: '{{ 12 }}'}).render(), "12" );
    equal( twig({data: '{{ 12.64 }}'}).render(), "12.64" );
    equal( twig({data: '{{ .64 }}'}).render(), ".64" );
});

test("string", function() {
    expect(6);
    equal( twig({data: '{{ "double" }}'}).render(), "double" );
    equal( twig({data: "{{ 'single' }}"}).render(), 'single' );
    equal( twig({data: '{{ "dou\'ble" }}'}).render(), "dou'ble" );
    equal( twig({data: "{{ 'sin\"gle' }}"}).render(), 'sin"gle' );
    equal( twig({data: '{{ "dou\\"ble" }}'}).render(), "dou\"ble" );
    equal( twig({data: "{{ 'sin\\'gle' }}"}).render(), "sin'gle" );
});

test("array", function() {
    equal( twig({data: '{{ [1] }}'}).render(), "1" );
    equal( twig({data: '{{ [1,2 ,3 ] }}'}).render(), "1,2,3" );
    equal( twig({data: '{{ [1,2 ,3 , val ] }}'}).render({val: 4}), "1,2,3,4" );
    equal( twig({data: '{{ ["[to",\'the\' ,"string]" ] }}'}).render(), '[to,the,string]' );
    equal( twig({data: '{{ ["[to",\'the\' ,"str\\"ing]" ] }}'}).render(), '[to,the,str"ing]' );
});
test("array.complex", function() {
    equal( twig({data: '{{ [1,2 ,1+2 ] }}'}).render(), "1,2,3" );
    equal( twig({data: '{{ [1,2 ,3 , "-", [4,5, 6] ] }}'}).render({val: 4}), "1,2,3,-,4,5,6" );
    equal( twig({data: '{{ [a,b ,(1+2) * a ] }}'}).render({a:1,b:2}), "1,2,3" );
});
test("variable", function() {
    equal( twig({data: '{{ val }}'}).render({ val: "test"}), "test" );
    equal( twig({data: '{{ val }}'}).render({ val: function() {
                                                       return "test"
                                                   }}), "test" );
});

// Expression tests
module("Expressions");

test("key", function() {
    var test_template = twig({data: '{{ key.value }} {{ key.sub.test }}'});
    var output = test_template.render({
        key: {
            value: "test",
            sub: {
                test: "value"
            }
        }
    });
    equal( output, "test value" );

    test_template = twig({data: '{{ key["value"] }} {{ key.sub[key.value] }} {{ s.t["u"].v["w"] }}'});
    output = test_template.render({
        key: {
            value: "test",
            sub: {
                test: "value"
            }
        },
        s: { t: { u: { v: { w: 'x' } } } }
    });
    equal( output, "test value x" );
});

test("add", function() {
    expect(test_data.length);
    var test_template = twig({data: '{{ a + b }}'});
    test_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, (pair.a + pair.b).toString() );
    });
});

test("subtract", function() {
    expect(test_data.length);
    var test_template = twig({data: '{{ a - b }}'});
    test_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, (pair.a - pair.b).toString() );
    });
});

test("multiply", function() {
    expect(test_data.length);
    var test_template = twig({data: '{{ a * b }}'});
    test_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, (pair.a * pair.b).toString() );
    });
});

test("divide", function() {
    expect(test_data.length);
    var test_template = twig({data: '{{ a / b }}'});
    test_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, (pair.a / pair.b).toString() );
    });
});

test("concat.number", function() {
    expect(test_data.length);
    var test_template = twig({data: '{{ a ~ b }}'});
    test_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, pair.a.toString() + pair.b.toString() );
    });
});

string_data = [
    {a: 'test', b: 'string'},
    {a: 'test', b: ''},
    {a: '', b: 'string'},
    {a: '', b: ''},
]

test("concat.string", function() {
    expect(string_data.length);
    var test_template = twig({data: '{{ a ~ b }}'});
    string_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, pair.a.toString() + pair.b.toString() );
    });
});

module("Combined Expressions");

test("concat", function() {
    equal( twig({data: '{{ "test" ~ a }}'}).render({a:1234}), "test1234" );
    equal( twig({data: '{{ a ~ "test" ~ a }}'}).render({a:1234}), "1234test1234" );
    equal( twig({data: '{{ "this" ~ "test" }}'}).render({a:1234}), "thistest" );
});

test("basic", function() {
    var data = {a: 4.5, b: 10, c: 12,  d: -0.25, e:0, f: 65,  g: 21, h: -0.0002};
    var test_template = twig({data: '{{a/b+c*d-e+f/g*h}}'});
    var output = test_template.render(data);
    var expected = data.a / data.b + data.c * data.d - data.e + data.f / data.g * data.h;
    equal( output, expected.toString() );
});
test("parens", function() {
    var data = {a: 4.5, b: 10, c: 12,  d: -0.25, e:0, f: 65,  g: 21, h: -0.0002};
    var test_template = twig({data: '{{a   /(b+c )*d-(e+f)/(g*h)}}'});
    var output = test_template.render(data);
    var expected = data.a / (data.b + data.c) * data.d - (data.e + data.f) / (data.g * data.h);
    equal( output, expected.toString() );
});

module("Comparison Expressions");

test("lessThen", function() {
    expect(test_data.length);
    var test_template = twig({data: '{{ a < b }}'});
    test_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, (pair.a < pair.b).toString() );
    });
});

test("lessThenOrEqual", function() {
    expect(test_data.length);
    var test_template = twig({data: '{{ a <= b }}'});
    test_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, (pair.a <= pair.b).toString() );
    });
});

test("greaterThen", function() {
    expect(test_data.length);
    var test_template = twig({data: '{{ a > b }}'});
    test_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, (pair.a > pair.b).toString() );
    });
});

test("greaterThenOrEqual", function() {
    expect(test_data.length);
    var test_template = twig({data: '{{ a >= b }}'});
    test_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, (pair.a >= pair.b).toString() );
    });
});

var boolean_data = [
    {a: true, b: true},
    {a: true, b: false},
    {a: false, b: true},
    {a: false, b: false}
];

test("equals", function() {
    expect(boolean_data.length);
    var test_template = twig({data: '{{ a == b }}'});
    boolean_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, (pair.a == pair.b).toString() );
    });
});

test("notEquals", function() {
    expect(boolean_data.length);
    var test_template = twig({data: '{{ a != b }}'});
    boolean_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, (pair.a != pair.b).toString() );
    });
});

test("or", function() {
    expect(boolean_data.length);
    var test_template = twig({data: '{{ a || b }}'});
    boolean_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, (pair.a || pair.b).toString() );
    });
});

test("and", function() {
    expect(boolean_data.length);
    var test_template = twig({data: '{{ a && b }}'});
    boolean_data.forEach(function(pair) {
        var output = test_template.render(pair);
        equal( output, (pair.a && pair.b).toString() );
    });
});

test("not", function() {
    expect(2);
    var test_template = twig({data: '{{ !a }}'});
    equal( test_template.render({a:false}), true.toString() );
    equal( test_template.render({a:true}), false.toString() );
});

module("Logic");

test("if.basic", function() {
    expect(2);
    var test_template = twig({data: '{% if test %}true{% endif%}'});
    equal( test_template.render({test: true}), "true" );
    equal( test_template.render({test: false}), "" );
});

test("if.else", function() {
    expect(2);
    var test_template = twig({data: '{% if test %}true{%else%}false{% endif%}'});
    equal( test_template.render({test: true}), "true" );
    equal( test_template.render({test: false}), "false" );
});

test("if.elseif", function() {
    expect(4);
    var test_template = twig({data: '{% if test %}1{% elseif other %}2{%else%}3{% endif%}'});
    equal( test_template.render({test: true, other:false}), "1" );
    equal( test_template.render({test: true, other:true}), "1" );
    equal( test_template.render({test: false, other:true}), "2" );
    equal( test_template.render({test: false, other:false}), "3" );
});

test("if.nested", function() {
    expect(4);
    var test_template = twig({data: '{% if test %}{% if test2 %}true{% else %}false{% endif%}{% else %}not{% endif%}'});
    equal( test_template.render({test: true, test2: true}), "true" );
    equal( test_template.render({test: true, test2: false}), "false" );
    equal( test_template.render({test: false, test2: true}), "not" );
    equal( test_template.render({test: false, test2: false}), "not" );
});

test("for.basic.array", function() {
    var test_template = twig({data: '{% for value in test %}{{ value }}{% endfor %}'});
    equal( test_template.render({test: [1,2,3,4]}), "1234" );
    equal( test_template.render({test: []}), "" );
});
test("for.key.array", function() {
    var test_template = twig({data: '{% for key,value in test %}{{key}}:{{ value }}{% endfor %}'});
    equal( test_template.render({test: [1,2,3,4]}), "0:11:22:33:4" );
    equal( test_template.render({test: []}), "" );
});

test("for.basic.object", function() {
    var test_template = twig({data: '{% for value in test %}{{ value }}{% endfor %}'});
    equal( test_template.render({test: {one: 1, two: 2, three: 3}}), "123" );
    equal( test_template.render({test: {}}), "" );
});
test("for.key.object", function() {
    var test_template = twig({data: '{% for key, value in test %}{{key}}:{{ value }}{% endfor %}'});
    equal( test_template.render({test: {one: 1, two: 2, three: 3}}), "one:1two:2three:3" );
    equal( test_template.render({test: {}}), "" );
});

test("for.else", function() {
    var test_template = twig({data: '{% for key,value in test %}{{ value }}{% else %}else{% endfor %}'});
    equal( test_template.render({test: [1,2,3,4]}), "1234" );
    equal( test_template.render({test: []}), "else" );
});

test("for.nested", function() {
    var test_template = twig({data: '{% for key,list in test %}{% for val in list %}{{ val }}{%endfor %}.{% else %}else{% endfor %}'});
    equal( test_template.render({test: [[1,2],[3,4],[5,6]]}), "12.34.56." );
    equal( test_template.render({test: []}), "else" );
});

test("set.basic", function() {
    var test_template = twig({data: '{% set key = "chaos" %}{{ key }}' });
    equal( test_template.render(), "chaos" );
});

test("set.complex", function() {
    var test_template = twig({data: '{% set key = "key" %}{% set val = key %}{{ val }}' });
    equal( test_template.render(), "key" );
});

test("set.loop", function() {
    var test_template = twig({data: '{% set key = 0 %}{% for val in [1,2,3,4] %}{% set key = key + val %}{% endfor %}{{ key }}' });
    equal( test_template.render(), "10" );
});

test("filter", function() {
    var test_template = twig({data: '{% filter lower %}TEST{% endfilter %}' });
    equal( test_template.render(), "test" )

    test_template = twig({data: '{% filter lower|reverse %}TEST{% endfilter %}' });
    equal( test_template.render(), "tset" );
});


/* var template = twig({
    data: 'The {{ baked_good }} is a lie.'
});

console.log(
    template.render({baked_good: 'cupcake'})
); */
