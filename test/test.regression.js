var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Regression Tests ->", function() {
    it("\#47 should not match variables starting with not", function() {
        // Define and save a template
        twig({data: '{% for note in notes %}{{note}}{% endfor %}'}).render({notes:['a', 'b', 'c']}).should.equal("abc");
    });
});

