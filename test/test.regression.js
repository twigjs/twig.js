var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Regression Tests ->", function() {
    it("\#47 should not match variables starting with not", function() {
        // Define and save a template
        twig({data: '{% for note in notes %}{{note}}{% endfor %}'}).render({notes:['a', 'b', 'c']}).should.equal("abc");
    });

    it("\#56 functions work inside parentheses", function() {
        // Define and save a template
        Twig.extendFunction('custom', function(value) {
            return true;
        });

        twig({data: '{% if (custom("val") and custom("val")) %}out{% endif %}'}).render({}).should.equal("out");
    });

    it("\#83 Support for trailing commas in arrays", function() {
        twig({data: '{{ [1,2,3,4,] }}'}).render().should.equal("1,2,3,4");
    });

    it("\#83 Support for trailing commas in objects", function() {
        twig({data: '{{ {a:1, b:2, c:3, } }}'}).render();
    });
});
