// Twig.debug = true;

module("Filters");

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

test("filter.reverse.array", function() {
    var test_template = twig({data: '{{ ["a", "b", "c"]|reverse }}' });
    equal( test_template.render(), "c,b,a" );
});

test("filter.keys.array", function() {
    var test_template = twig({data: '{{ ["a", "b", "c"]|keys }}' });
    equal( test_template.render(), "0,1,2" );
});

test("filter.keys.mixed", function() {
    var test_template = twig({data: '{{ ["a", "b", "c"]|keys|reverse }}' });
    equal( test_template.render(), "2,1,0" );
});
