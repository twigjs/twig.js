const Twig = require('../twig').factory();

const {twig} = Twig;

describe('Twig.js Loader ->', function () {
    it('should load a template from the filesystem asynchronously', async function () {
        const testTemplate = await twig({
            id: 'fs-node-async',
            path: 'test/templates/test.twig'
        });

        // Render the template
        return testTemplate.render({
            test: 'yes',
            flag: true
        }).should.be.fulfilledWith('Test template = yes\n\nFlag set!');
    });
    it('should load a template from the filesystem synchronously', async function () {
        const testTemplate = await twig({
            id: 'fs-node-sync',
            path: 'test/templates/test.twig'
        });

        // Render the template
        return testTemplate.render({
            test: 'yes',
            flag: true
        }).should.be.fulfilledWith('Test template = yes\n\nFlag set!');
    });

    describe('source ->', function () {
        it('should load the non-compiled template source code', async function () {
            const testTemplate = twig({data: '{{ source("test/templates/source.twig") }}'});

            return testTemplate.render().should.be.fulfilledWith('{% if isUserNew == true %}\n    Hello {{ name }}\n{% else %}\n    Welcome back {{ name }}\n{% endif %}\n');
        });

        it('should indicate if there was a problem loading the template if \'ignore_missing\' is false', async function () {
            const testTemplate = twig({data: '{{ source("test/templates/non-existing-source.twig", false) }}'});

            return testTemplate.render().should.be.fulfilledWith('Template "test/templates/non-existing-source.twig" is not defined.');
        });

        it('should NOT indicate if there was a problem loading the template if \'ignore_missing\' is true', async function () {
            const testTemplate = twig({data: '{{ source("test/templates/non-existing-source.twig", true) }}'});

            return testTemplate.render().should.be.fulfilledWith('');
        });
    });
});

describe('Twig.js Include ->', function () {
    it('should load an included template with no context', async function () {
        await twig({
            id: 'include',
            path: 'test/templates/include.twig'
        });

        // Load the template
        const testTemplate = twig({ref: 'include'});
        return testTemplate.render({test: 'tst'}).should.be.fulfilledWith('BeforeTest template = tst\n\nAfter');
    });

    it('should load an included template using relative path', async function () {
        await twig({
            id: 'include-relative',
            path: 'test/templates/include/relative.twig'
        });

        // Load the template
        const testTemplate = twig({ref: 'include-relative'});
        return testTemplate.render().should.be.fulfilledWith('Twig.js!');
    });

    it('should load an included template with additional context', async function () {
        await twig({
            id: 'include-with',
            path: 'test/templates/include-with.twig'
        });

        // Load the template
        const testTemplate = twig({ref: 'include-with'});
        return testTemplate.render({test: 'tst'}).should.be.fulfilledWith('template: before,tst-mid-template: after,tst');
    });

    it('should load an included template with only additional context', async function () {
        await twig({
            id: 'include-only',
            path: 'test/templates/include-only.twig'
        });

        // Load the template
        const testTemplate = twig({ref: 'include-only'});
        return testTemplate.render({test: 'tst'}).should.be.fulfilledWith('template: before,-mid-template: after,');
    });

    it('should skip a nonexistent included template flagged wth \'ignore missing\'', async function () {
        await twig({
            id: 'include-ignore-missing',
            path: 'test/templates/include-ignore-missing.twig'
        });

        const testTemplate = twig({ref: 'include-ignore-missing'});
        return testTemplate.render().should.be.fulfilledWith('ignore-missing');
    });

    it('should fail including a nonexistent included template not flagged wth \'ignore missing\'', async function () {
        try {
            const testTemplate = await twig({
                id: 'include-ignore-missing-missing',
                path: 'test/templates/include-ignore-missing-missing.twig',
                rethrow: true
            });
            await testTemplate.render();
        } catch (error) {
            error.type.should.equal('TwigException');
        }
    });

    it('should fail including a nonexistent included template asynchronously', async function () {
        let testTemplate;
        try {
            testTemplate = await twig({
                id: 'include-ignore-missing-missing-async',
                path: 'test/templates/include-ignore-missing-missing-async.twig',
                rethrow: true
            });
        } catch (error) {
            error.type.should.equal('TwigException');
        } finally {
            (testTemplate === undefined).should.be.true();
        }
    });
});

