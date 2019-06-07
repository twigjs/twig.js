const Twig = require('../twig').factory();

const {twig} = Twig;

describe('Twig.js Namespaces ->', function () {
    it('should support namespaces defined with ::', async function () {
        const testTemplate = await twig({
            namespaces: {test: 'test/templates/namespaces/'},
            path: 'test/templates/namespaces_coloncolon.twig'
        });

        // Render the template
        return testTemplate.render({
            test: 'yes',
            flag: true
        }).should.be.fulfilledWith('namespaces');
    });

    it('should support namespaces defined with :: and  without slash at the end of path', async function () {
        const testTemplate = await twig({
            namespaces: {test: 'test/templates/namespaces'},
            path: 'test/templates/namespaces_coloncolon.twig'
        });

        // Render the template
        return testTemplate.render({
            test: 'yes',
            flag: true
        }).should.be.fulfilledWith('namespaces');
    });

    it('should support namespaces defined with @', async function () {
        const testTemplate = await twig({
            namespaces: {test: 'test/templates/namespaces/'},
            path: 'test/templates/namespaces_@.twig'
        });

        // Render the template
        return testTemplate.render({
            test: 'yes',
            flag: true
        }).should.be.fulfilledWith('namespaces');
    });

    it('should support namespaces defined with @ and  without slash at the end of path', async function () {
        const testTemplate = await twig({
            namespaces: {test: 'test/templates/namespaces'},
            path: 'test/templates/namespaces_@.twig'
        });

        return testTemplate.render({
            test: 'yes',
            flag: true
        }).should.be.fulfilledWith('namespaces');
    });

    it('should support non-namespaced includes with namespaces configured', async function () {
        const testTemplate = await twig({
            namespaces: {test: 'test/templates/namespaces/'},
            path: 'test/templates/namespaces_without_namespace.twig'
        });

        // Render the template
        return testTemplate.render({
            test: 'yes',
            flag: true
        }).should.be.fulfilledWith('namespaces\nnamespaces');
    });

    it('should support multiple namespaces', async function () {
        const testTemplate = await twig({
            namespaces: {
                one: 'test/templates/namespaces/one/',
                two: 'test/templates/namespaces/two/'
            },
            path: 'test/templates/namespaces_multiple.twig'
        });

        // Render the template
        return testTemplate.render({
            test: 'yes',
            flag: true
        }).should.be.fulfilledWith('namespace one\nnamespace two');
    });
});
