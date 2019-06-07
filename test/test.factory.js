const Twig = require('../twig');

const FreshTwig = Twig.factory();

describe('Twig.js Factory ->', function () {
    Twig.extendFunction('foo', () => {
        return 'foo';
    });

    FreshTwig.extendFunction('bar', () => {
        return 'bar';
    });

    it('should not have access to extensions on the main Twig object', async function () {
        const fixtOptions = {
            rethrow: true,
            data: '{{ foo() }}'
        };

        const testTemplate1 = await Twig.twig(fixtOptions);
        await testTemplate1.render();

        try {
            const testTemplate2 = await FreshTwig.twig(fixtOptions);
            await testTemplate2.render();
            throw new Error('should have thrown an error');
        } catch (error) {
            error.message.should.equal('foo function does not exist and is not defined in the context');
        }
    });

    it('should not leak extensions to the main Twig object', async function () {
        const fixtOptions = {
            rethrow: true,
            data: '{{ bar() }}'
        };

        const testTemplate1 = await FreshTwig.twig(fixtOptions);
        await testTemplate1.render();

        try {
            const testTemplate2 = await Twig.twig(fixtOptions);
            await testTemplate2.render();
            throw new Error('should have thrown an error');
        } catch (error) {
            error.message.should.equal('bar function does not exist and is not defined in the context');
        }
    });
});
