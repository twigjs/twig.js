const Twig = require('../twig').factory();

const {twig} = Twig;

describe('Twig.js Optional Functionality ->', function () {
    it('should support inline includes by ID', async function () {
        twig({
            id: 'other',
            data: 'another template'
        });

        const template = twig({
            allowInlineIncludes: true,
            data: 'template with {% include "other" %}'
        });
        return template.render().should.be.fulfilledWith('template with another template');
    });
});

