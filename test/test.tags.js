var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Tags ->", function() {

    it("should support spaceless", function() {
        twig({
        	data: "{% spaceless %}<div>\n    <b>b</b>   <i>i</i>\n</div>{% endspaceless %}"
        }).render().should.equal(
        	"<div><b>b</b><i>i</i></div>"
        );
    });

});