var Twig = (Twig || require("../twig")).factory(),
    twig = twig || Twig.twig;

describe("Twig.js Verbatim ->", function () {

    it("should return raw content", function () {
        twig({data: '{% verbatim %}{{ variable }}{% endverbatim %}'}).render({ 'variable': 42 }).should.equal('{{ variable }}');
    });

});
