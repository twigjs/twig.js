const Twig = require('../twig').factory();

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
});

