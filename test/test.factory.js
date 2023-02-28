const Twig = require('..');

const FreshTwig = Twig.factory();

describe('Twig.js Factory ->', function () {
    Twig.extendFunction('foo', () => {
        return 'foo';
    });

    FreshTwig.extendFunction('bar', () => {
        return 'bar';
    });

    it('should have the correct VERSION in twig.factory.js', function () {
        // Twig.js embeds the version number in twig.factory.js to
        // allow checking against Twig.VERSION. We should check to
        // make sure the package.json version is the same.
        const pkg = require('../package.json');
        Twig.VERSION.should.not.be.null();
        Twig.VERSION.should.equal(pkg.version);
    });

    it('should not have access to extensions on the main Twig object', function () {
        const fixtOptions = {
            rethrow: true,
            data: '{{ foo() }}'
        };

        Twig.twig(fixtOptions).render();

        try {
            FreshTwig.twig(fixtOptions).render();
            throw new Error('should have thrown an error');
        } catch (error) {
            error.message.should.equal('foo function does not exist and is not defined in the context');
        }
    });

    it('should not leak extensions to the main Twig object', function () {
        const fixtOptions = {
            rethrow: true,
            data: '{{ bar() }}'
        };

        FreshTwig.twig(fixtOptions).render();

        try {
            Twig.twig(fixtOptions).render();
            throw new Error('should have thrown an error');
        } catch (error) {
            error.message.should.equal('bar function does not exist and is not defined in the context');
        }
    });
});
