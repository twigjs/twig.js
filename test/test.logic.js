const Twig = require('../twig').factory();

const {twig} = Twig;

const {mapTestDataToAssertions} = require('./helpers')(twig);

describe('Twig.js Logic ->', function () {
    describe('set ->', function () {
        it('should define variable', async function () {
            const testTemplate = twig({
                data: '{% set list = _context %}{{ list|json_encode }}'
            });
            return testTemplate.render({a: 10, b: 4, c: 2}).should.be.fulfilledWith(JSON.stringify({a: 10, b: 4, c: 2}));
        });
    });

    describe('if ->', function () {
        it('should ignore spaces', function () {
            return mapTestDataToAssertions(
                [
                    '{% if (1 == 1) %}true{% endif %}',
                    '{% if(1 == 1) %}true{% endif %}'
                ],
                ['true', 'true']
            );
        });
    });

    describe('elseif ->', function () {
        it('should ignore spaces', function () {
            return mapTestDataToAssertions(
                [
                    '{% if (1 == 2) %}false{% elseif (1 == 1) %}true{% endif %}',
                    '{% if (1 == 2) %}false{% elseif(1 == 1) %}true{% endif %}'
                ],
                ['true', 'true']
            );
        });
    });
});
