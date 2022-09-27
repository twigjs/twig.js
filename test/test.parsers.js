const Twig = require('..').factory();

describe('Twig.js Parsers ->', function () {
    describe('custom parser ->', function () {
        it('should define a custom parser', function () {
            Twig.extend(Twig => {
                const parser = function (params) {
                    return '[CUSTOM PARSER] ' + params.data;
                };

                Twig.Templates.registerParser('custom', parser);
                Twig.Templates.parsers.should.have.property('custom');
            });
        });

        it('should run the data through the custom parser', function () {
            Twig.extend(Twig => {
                const params = {
                    data: 'This is a test template.'
                };
                const template = Twig.Templates.parsers.custom(params);

                template.should.equal('[CUSTOM PARSER] This is a test template.');
            });
        });

        it('should remove a registered parser', function () {
            Twig.extend(Twig => {
                Twig.Templates.unRegisterParser('custom');
                Twig.Templates.parsers.should.not.have.property('custom');
            });
        });
    });
});
