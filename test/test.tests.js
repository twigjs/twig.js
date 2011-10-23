// Twig.debug = true;
// Twig.trace = true;

module("Filters");

test("empty", function() {
    // String
    equal( twig({data: '{{ "" is empty }}'}).render(), "true" );
    equal( twig({data: '{{ "test" is empty }}'}).render(), "false" );
    // Array
    equal( twig({data: '{{ [] is empty }}'}).render(), "true" );
    equal( twig({data: '{{ ["1"] is empty }}'}).render(), "false" );
    // Object
    equal( twig({data: '{{ {} is empty }}'}).render(), "true" );
    equal( twig({data: '{{ {"a":"b"} is empty }}'}).render(), "false" );

    equal( twig({data: '{{ {"a":"b"} is not empty }}'}).render(), "true" );
});

test("odd", function() {
    // String
    equal( twig({data: '{{ (1 + 4) is odd }}'}).render(), "true" );
    equal( twig({data: '{{ 6 is odd }}'}).render(), "false" );
});

test("even", function() {
    // String
    equal( twig({data: '{{ (1 + 4) is even }}'}).render(), "false" );
    equal( twig({data: '{{ 6 is even }}'}).render(), "true" );
});

test("defined", function() {
    // String
    equal( twig({data: '{{ key is defined }}'}).render(), "false" );
    equal( twig({data: '{{ key is defined }}'}).render({key: "test"}), "true" );
});

test("none", function() {
    // String
    equal( twig({data: '{{ key is none }}'}).render(), "false" );
    equal( twig({data: '{{ key is none }}'}).render({key: "test"}), "false" );
    equal( twig({data: '{{ key is none }}'}).render({key: null}), "true" );
});
