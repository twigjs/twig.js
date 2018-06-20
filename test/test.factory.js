var Twig = (Twig || require("../twig")),
    FreshTwig = Twig.factory();

describe("Twig.js Factory ->", function() {

    Twig.extendFunction("foo", function() {
        return 'foo';
    });

    FreshTwig.extendFunction("bar", function() {
        return 'bar';
    });

    it("should not have access to extensions on the main Twig object", function() {
        var fixt_options = {
            rethrow: true,
            data: '{{ foo() }}'
        };

        Twig.twig(fixt_options).render();

        try {
            FreshTwig.twig(fixt_options).render();
            throw new Error('should have thrown an error');
        } catch(err) {
            err.message.should.equal('foo function does not exist and is not defined in the context');
        }
    });

    it("should not leak extensions to the main Twig object", function() {
        var fixt_options = {
            rethrow: true,
            data: '{{ bar() }}'
        };

        FreshTwig.twig(fixt_options).render();

        try {
            Twig.twig(fixt_options).render();
            throw new Error('should have thrown an error');
        } catch(err) {
            err.message.should.equal('bar function does not exist and is not defined in the context');
        }
    });
});
