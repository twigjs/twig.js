const Twig = require('..').factory();

const {twig} = Twig;

describe('Twig.js Optional Functionality ->', function () {
    it('should support inline includes by ID', function () {
        twig({
            id: 'other',
            data: 'another template'
        });

        const template = twig({
            allowInlineIncludes: true,
            data: 'template with {% include "other" %}'
        });
        const output = template.render();

        output.should.equal('template with another template');
    });

    describe('should throw an error when `strict_variables` set to `true`', function () {
        const variable = twig({
            rethrow: true,
            strict_variables: true,
            data: '{{ test }}'
        });

        const object = twig({
            rethrow: true,
            strict_variables: true,
            data: '{{ test.10 }}'
        });

        const array = twig({
            rethrow: true,
            strict_variables: true,
            data: '{{ test[10] }}'
        });

        it('For undefined variables', function () {
            try {
                variable.render();
                throw new Error('should have thrown an error.');
            } catch (error) {
                error.message.should.equal('Variable "test" does not exist.');
            }
        });

        it('For empty objects', function () {
            try {
                object.render({test: {}});
                throw new Error('should have thrown an error.');
            } catch (error) {
                error.message.should.equal('Key "10" does not exist as the object is empty.');
            }
        });

        it('For undefined object keys', function () {
            try {
                object.render({test: {1: 'value', 2: 'value', 3: 'value'}});
                throw new Error('should have thrown an error.');
            } catch (error) {
                error.message.should.equal('Key "10" for object with keys "1, 2, 3" does not exist.');
            }
        });

        it('For empty arrays', function () {
            try {
                array.render({test: []});
                throw new Error('should have thrown an error.');
            } catch (error) {
                error.message.should.equal('Key "10" does not exist as the array is empty.');
            }
        });

        it('For undefined array keys', function () {
            try {
                array.render({test: [1, 2, 3]});
                throw new Error('should have thrown an error.');
            } catch (error) {
                error.message.should.equal('Key "10" for array with keys "0, 1, 2" does not exist.');
            }
        });
    });

    describe('should not throw an error when `strict_variables` set to `true`', function () {
        const filter = twig({
            rethrow: true,
            strict_variables: true,
            data: '{{ test|default }}'
        });

        const nullcoalescing = twig({
            rethrow: true,
            strict_variables: true,
            data: '{{ test ?? \'test\' }}'
        });

        const test = twig({
            rethrow: true,
            strict_variables: true,
            data: '{% if test is defined %}{% endif %}'
        });

        it('For undefined variables with default filter', function () {
            filter.render();
        });

        it('For undefined variables with ?? operator', function () {
            nullcoalescing.render();
        });

        it('For undefined variables with defined test', function () {
            test.render();
        });
    });
});
