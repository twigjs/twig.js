// Twig.debug = true;

module("Filters");

test("filter.url_encode", function() {
    var test_template = twig({data: '{{ "http://google.com/?q=twig.js"|url_encode() }}' });
    equal( test_template.render(), "http%3A%2F%2Fgoogle.com%2F%3Fq%3Dtwig.js" );
});

test("filter.upper", function() {
    var test_template = twig({data: '{{ "hello"|upper }}' });
    equal( test_template.render(), "HELLO" );
});

test("filter.lower", function() {
    var test_template = twig({data: '{{ "HELLO"|lower }}' });
    equal( test_template.render(), "hello" );
});

test("filter.capitalize", function() {
    var test_template = twig({data: '{{ "hello world"|capitalize }}' });
    equal( test_template.render(), "Hello world" );
});

test("filter.title", function() {
    var test_template = twig({data: '{{ "hello world"|title }}' });
    equal( test_template.render(), "Hello World" );
});

test("filter.sort.array", function() {
    var test_template = twig({data: '{{ [1,5,2,7]|sort }}' });
    equal( test_template.render(), "1,2,5,7" );

    test_template = twig({data: '{{ ["test","abc",2,7]|sort }}' });
    equal( test_template.render(), "2,7,abc,test" );
});

test("filter.sort.object", function() {
    var test_template = twig({data: "{% set obj =  {'c': 1,'d': 5,'t': 2,'e':7}|sort %}{% for key,value in obj|sort %}{{key}}:{{value}} {%endfor %}" });
    equal( test_template.render(), "c:1 t:2 d:5 e:7 " );

    test_template = twig({data: "{% set obj = {'m':'test','z':'abc','a':2,'y':7} %}{% for key,value in obj|sort %}{{key}}:{{value}} {%endfor %}" });
    equal( test_template.render(), "a:2 y:7 z:abc m:test " );
});

test("filter.reverse.array", function() {
    var test_template = twig({data: '{{ ["a", "b", "c"]|reverse }}' });
    equal( test_template.render(), "c,b,a" );
});

test("filter.keys.array", function() {
    var test_template = twig({data: '{{ ["a", "b", "c"]|keys }}' });
    equal( test_template.render(), "0,1,2" );
});

test("filter.keys.reverse", function() {
    var test_template = twig({data: '{{ ["a", "b", "c"]|keys|reverse }}' });
    equal( test_template.render(), "2,1,0" );
});

test("filter.keys.object", function() {
    var test_template = twig({data: '{{ {"0":"a", "1":"b", "2":"c"}|keys }}' });
    equal( test_template.render(), "0,1,2" );
});

test("filter.length", function() {
    // Test string length
    var test_template = twig({data: '{{ "test"|length }}' });
    equal( test_template.render(), 4 );

    // Test array length
    test_template = twig({data: '{{ [1,2,4,76,"tesrt"]|length }}' });
    equal( test_template.render(), 5 );

    // Test object length
    test_template = twig({data: '{{ {"a": "b", "c": "1", "test": "test"}|length }}' });
    equal( test_template.render(), 3 );
});

test("filter.join.object", function() {
    var test_template = twig({data: '{{ {"a":"1", "b": "b", "c":test}|join("-") }}' });
    equal( test_template.render({"test": "t"}), "1-b-t" );
});

test("filter.join.array", function() {
    var test_template = twig({data: '{{ [1,2,4,76]|join }}' });
    equal( test_template.render(), "12476" );
    test_template = twig({data: '{{ [1+ 5,2,4,76]|join("-" ~ ".") }}' });
    equal( test_template.render(), "6-.2-.4-.76" );
});


test("filter.default", function() {
    var test_template = twig({data: '{{ var|default("Not Defined") }}' });
    equal( test_template.render(), "Not Defined" );

    test_template = twig({data: '{{ ""|default("Empty String") }}' });
    equal( test_template.render(), "Empty String" );

    test_template = twig({data: '{{ var.key|default("Empty Key") }}' });
    equal( test_template.render({'var':{}}), "Empty Key" );
});

test("filter.json_encode", function() {
    var test_template = twig({data: '{{ {"a":[1,"b",3]}|json_encode }}' });
    equal( test_template.render(), '{"a":["1","b","3"]}' );

    test_template = twig({data: '{{ test|json_encode }}' });
    equal( test_template.render({test:'value'}), '"value"' );
});

test("filter.merge", function() {
    // Object merging
    var test_template = twig({data: '{% set obj= {"a":"test", "b":"1"}|merge({"b":2,"c":3}) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}' });
    equal( test_template.render(), 'a:test b:2 c:3 ' );

    // Array merging
    test_template = twig({data: '{% set obj= ["a", "b"]|merge(["c", "d"]) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}' });
    equal( test_template.render(), '0:a 1:b 2:c 3:d ' );

    // Mixed merging
    test_template = twig({data: '{% set obj= ["a", "b"]|merge({"a": "c", "3":4}, ["c", "d"]) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}' });
    equal( test_template.render(), '0:a 1:b 3:4 4:c 5:d a:c ' );

    // Mixed merging(2)
    test_template = twig({data: '{% set obj= {"1":"a", "a":"b"}|merge(["c", "d"]) %}{% for key in obj|keys %}{{key}}:{{obj[key]}} {%endfor %}' });
    equal( test_template.render(), '1:a a:b 2:c 3:d ' );
});


