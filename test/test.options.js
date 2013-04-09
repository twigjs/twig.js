var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Optional Functionality ->", function() {
    it("should support inline includes by ID", function() {
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
    });
});

