var Twig = (Twig || require("../twig")).factory(),
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

    it("should allow async rendering", function(done) {
        var flags = {};

        Twig.__express('test/templates/test-async.twig', {
          "settings": {
            "twig options": {
              "allow_async": true
            }
          },
          "hello_world": function() {
            return Promise.resolve('hello world');
          }
        }, function(err, response) {
            if (err)
                return done(err);

            try {
                var responseType = (typeof response);
                responseType.should.equal('string');
                response.should.equal('hello world\n');
                done();
            } catch(err) { done(err); }
        });
    });
});
