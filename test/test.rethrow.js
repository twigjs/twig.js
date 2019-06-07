const path = require('path');
const Twig = require('../twig').factory();

const {twig} = Twig;

describe('Twig.js Rethrow ->', function () {
    it('should throw a "Unable to parse \'missing\'" exception', function () {
        /* eslint-disable-next-line no-use-extend-native/no-use-extend-native */
        (function () {
            twig({
                rethrow: true,
                data: 'include missing template {% missing %}'
            }).render();
        }).should.throw('Unable to parse \'missing\'');
    });

    it('should throw a "Unable to find closing bracket \'%}" exception', function () {
        /* eslint-disable-next-line no-use-extend-native/no-use-extend-native */
        (function () {
            twig({
                rethrow: true,
                data: 'missing closing bracket {% }'
            }).render();
        }).should.throw('Unable to find closing bracket \'%}\' opened near template position 26');
    });

    it('should throw a compile error having its file property set to the file', async function () {
        try {
            await twig({
                path: 'test/templates/error/compile/entry.twig',
                rethrow: true
            });
        } catch (error) {
            error.should.have.property('file', 'test/templates/error/compile/entry.twig');
        }
    });

    it('should throw a parse error having its file property set to the entry file', async function () {
        try {
            const testTemplate = await twig({
                path: 'test/templates/error/parse/in-entry/entry.twig',
                rethrow: true
            });

            await testTemplate.render();
        } catch (error) {
            error.should.have.property('file', 'test/templates/error/parse/in-entry/entry.twig');
        }
    });

    it('should throw a parse error having its file property set to the partial file', async function () {
        try {
            const testTemplate = await twig({
                path: 'test/templates/error/parse/in-partial/entry.twig',
                rethrow: true
            });

            await testTemplate.render();
        } catch (error) {
            error.should.have.property('file', path.join('test/templates/error/parse/in-entry/entry.twig'));
        }
    });
});

