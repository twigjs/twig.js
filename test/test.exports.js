var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Exports __express ->", function() {
    /* otherwise express will return it as JSON, see: https://github.com/twigjs/twig.js/pull/348 for more information */
    it("should return a string (and not a String)", function(done) {
    	var flags = {};

    	Twig.__express('test/templates/test.twig', {
          "settings": {
            "twig options": {
              "autoescape": "html"
            }
          }
    	}, function(err, response) {
            var responseType = (typeof response);
            responseType.should.equal('string');
            done();
        });
    });
});
