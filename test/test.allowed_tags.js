var Twig = (Twig || require("../twig")).factory(),
    twig = twig || Twig.twig;

describe("Twig.js striptags filter arguments", function() {
    it("should apply allowed_tags argument", function() {
    	var content = '<a href="#">linktest</a> <b>boldtest</b> <p>paragraphtest</p>';

        var template = twig({
                data: 'template with {{content|striptags("<a>,<b>,<p>")}}'
            }),
            output = template.render({content: content});

        output.should.equal('template with <a href="#">linktest</a> <b>boldtest</b> <p>paragraphtest</p>');
    });

    it("should remove tags if no argument passed", function() {
    	var content = '<a href="#">linktest</a> <b>boldtest</b> <p>paragraphtest</p>';

        var template = twig({
                data: 'template with {{content|striptags}}'
            }),
            output = template.render({content: content});

        output.should.equal("template with linktest boldtest paragraphtest");
    });
});
