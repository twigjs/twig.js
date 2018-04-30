var TwigCompiler = requireUncached('../twig');
var Twig = requireUncached('../twig.production');

describe('Twig.js Production bundle ->', function() {
    it('should be able to render compiled templates', function() {
        var compiled = TwigCompiler.twig({
            id: 'test1',
            data: '{% if value %}{{ value | upper }}{% endif %}'
        });
        Twig.twig({
            id: compiled.id,
            data: compiled.tokens,
            precompiled: true
        }).render({
            value: 'Hello world'
        }).should.equal('HELLO WORLD');
    });
});
