Twig.debug = true;

var test_data = [
    {a: 10, b: 15},
    {a: 0, b: 0},
    {a: 1, b: 11},
    {a: 10444, b: 0.5},
    {a: 1034, b: -53},
    {a: -56, b: -1.7},
    {a: 34, b: 0},
    {a: 14, b: 14}
]

// Expression tests
module("Basic Expressions");

test("expression.add", function() {
    expect(test_data.length);
    test_data.forEach(function(pair) {
        var add_test = twig({data: '{{ a + b }}'})
        var output = add_test.render(pair);
        equal( output, (pair.a + pair.b).toString() );
    });
});

test("expression.subtract", function() {
    //expect(test_data.length);
    test_data.forEach(function(pair) {
        var add_test = twig({data: '{{ a - b }}'})
        var output = add_test.render(pair);
        equal( output, (pair.a - pair.b).toString() );
    });
});

test("expression.multiply", function() {
    //expect(test_data.length);
    test_data.forEach(function(pair) {
        var add_test = twig({data: '{{ a * b }}'})
        var output = add_test.render(pair);
        equal( output, (pair.a * pair.b).toString() );
    });
});

test("expression.divide", function() {
    //expect(test_data.length);
    test_data.forEach(function(pair) {
        var add_test = twig({data: '{{ a / b }}'})
        var output = add_test.render(pair);
        equal( output, (pair.a / pair.b).toString() );
    });
});

test("expression.lessThan", function() {
    //expect(test_data.length);
    test_data.forEach(function(pair) {
        var add_test = twig({data: '{{ a < b }}'})
        var output = add_test.render(pair);
        equal( output, (pair.a < pair.b).toString() );
    });
});

test("expression.lessThanOrEqual", function() {
    //expect(test_data.length);
    test_data.forEach(function(pair) {
        var add_test = twig({data: '{{ a <= b }}'})
        var output = add_test.render(pair);
        equal( output, (pair.a <= pair.b).toString() );
    });
});

test("expression.greatedThan", function() {
    //expect(test_data.length);
    test_data.forEach(function(pair) {
        var add_test = twig({data: '{{ a > b }}'})
        var output = add_test.render(pair);
        equal( output, (pair.a > pair.b).toString() );
    });
});

test("expression.greatedThanOrEqual", function() {
    //expect(test_data.length);
    test_data.forEach(function(pair) {
        var add_test = twig({data: '{{ a >= b }}'})
        var output = add_test.render(pair);
        equal( output, (pair.a >= pair.b).toString() );
    });
});

var interesting = twig({
    data: '{% if interesting %}\n\
                Nothing of interest in here\n\
           {% else %}\n\
                Just keep looking, ater all you said {{ interesting }}.\n\
           {% endif %}'
});
console.log(interesting);
console.log(interesting.render({interesting: false}));


/* var example = twig({
    html: 'The {{ baked_good }} is a lie. {{ 12.5 + 10 / (2 - 4) + 6.5}} == 14.<br /> 123 % 4 = {{ 123 % 4 }}'
});
console.log(example); */
