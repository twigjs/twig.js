const Twig = require('../..').factory();

const {twig} = Twig;

describe('Twig.js Namespaces ->', function () {
    it('should support namespaces defined with ::', function (done) {
        twig({
            namespaces: {test: 'templates/namespaces/'},
            path: 'templates/namespaces_coloncolon.twig',
            load(template) {
                // Render the template
                template.render({
                    test: 'yes',
                    flag: true
                }).should.equal('namespaces');

                done();
            }
        });
    });

    it('should support namespaces defined with :: and without slash at the end of the path', function (done) {
        twig({
            namespaces: {test: 'templates/namespaces'},
            path: 'templates/namespaces_coloncolon.twig',
            load(template) {
                // Render the template
                template.render({
                    test: 'yes',
                    flag: true
                }).should.equal('namespaces');

                done();
            }
        });
    });

    it('should support namespaces defined with @', function (done) {
        twig({
            namespaces: {test: 'templates/namespaces/'},
            path: 'templates/namespaces_@.twig',
            load(template) {
                // Render the template
                template.render({
                    test: 'yes',
                    flag: true
                }).should.equal('namespaces');

                done();
            }
        });
    });

    it('should support namespaces defined with @ and without slash at the end of the path', function (done) {
        twig({
            namespaces: {test: 'templates/namespaces'},
            path: 'templates/namespaces_@.twig',
            load(template) {
                // Render the template
                template.render({
                    test: 'yes',
                    flag: true
                }).should.equal('namespaces');

                done();
            }
        });
    });

    it('should support non-namespaced includes with namespaces configured', function (done) {
        twig({
            namespaces: {test: 'templates/namespaces/'},
            path: 'templates/namespaces_without_namespace.twig',
            load(template) {
                // Render the template
                template.render({
                    test: 'yes',
                    flag: true
                }).should.equal('namespaces\nnamespaces');

                done();
            }
        });
    });

    it('should support multiple namespaces', function (done) {
        twig({
            namespaces: {
                one: 'templates/namespaces/one/',
                two: 'templates/namespaces/two/'
            },
            path: 'templates/namespaces_multiple.twig',
            load(template) {
                // Render the template
                template.render({
                    test: 'yes',
                    flag: true
                }).should.equal('namespace one\nnamespace two');

                done();
            }
        });
    });
});
