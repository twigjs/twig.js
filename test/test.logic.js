const Twig = require('..').factory();

const {twig} = Twig;

describe('Twig.js Logic ->', function () {
    describe('set ->', function () {
        it('should define variable', function () {
            twig({
                data: '{% set list = _context %}{{ list|json_encode }}'
            }).render({a: 10, b: 4, c: 2}).should.equal(JSON.stringify({a: 10, b: 4, c: 2}));
        });
    });

    describe('if ->', function () {
        it('should ignore spaces', function () {
            twig({data: '{% if (1 == 1) %}true{% endif %}'}).render().should.equal('true');
            twig({data: '{% if(1 == 1) %}true{% endif %}'}).render().should.equal('true');
        });
    });

    describe('elseif ->', function () {
        it('should ignore spaces', function () {
            twig({data: '{% if (1 == 2) %}false{% elseif (1 == 1) %}true{% endif %}'}).render().should.equal('true');
            twig({data: '{% if (1 == 2) %}false{% elseif(1 == 1) %}true{% endif %}'}).render().should.equal('true');
        });
    });
});
