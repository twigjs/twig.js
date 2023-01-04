const Twig = require('..').factory();

describe('Twig.js Exports __express ->', function () {
    /* Otherwise express will return it as JSON, see: https://github.com/twigjs/twig.js/pull/348 for more information */
    it('should return a string (and not a String)', function (done) {
        Twig.__express('test/templates/test.twig', {
            settings: {
                'twig options': {
                    autoescape: 'html'
                }
            }
        }, (err, response) => {
            (err === null).should.be.true();

            const responseType = (typeof response);
            responseType.should.equal('string');
            done();
        });
    });

    it('should allow async rendering', function (done) {
        Twig.__express('test/templates/test-async.twig', {
            settings: {
                'twig options': {
                    allowAsync: true
                }
            },
            /* eslint-disable-next-line camelcase */
            hello_world() {
                return Promise.resolve('hello world');
            }
        }, (err, response) => {
            if (err) {
                return done(err);
            }

            try {
                const responseType = (typeof response);
                responseType.should.equal('string');
                response.should.equal('hello world\n');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});

describe('renderFile', function () {
    it('should allow error handling on missing paths', function () {
        Twig.renderFile('this/path/does/not/exist.twig', undefined, function (err, html) {
            console.log(err, html);
        });
    });
});
