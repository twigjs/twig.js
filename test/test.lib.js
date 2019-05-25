const lib = require('../src/twig.lib');

describe('Twig.js Lib ->', function () {
    const twigTest = {};
    const libTwig = lib(twigTest).lib;

    it('should allow extending', function () {
        const src = {
            one: 1,
            two: 2
        };
        const add = {
            three: 3,
            one: 4
        };
        libTwig.extend(src, add).should.eql({
            one: 4,
            two: 2,
            three: 3
        });
    });

    it('should allow extending null', function () {
        const src = {
            one: 1,
            two: 2
        };
        libTwig.extend(src, null).should.eql({
            one: 1,
            two: 2
        });
    });
});
