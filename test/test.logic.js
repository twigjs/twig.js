var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Logic ->", function() {
    describe("{% set key = expression %} ->", function() {
        var test_template = twig({data: '{% set list = _context %}{{ list|json_encode }}'}),
            d = {a: 10, b: 4, c: 2},
            output = test_template.render(d),
            expected = {a: 10, b: 4, c: 2};

        output.should.equal(JSON.stringify(expected));
    });
});
