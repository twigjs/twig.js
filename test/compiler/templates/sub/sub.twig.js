module.declare([{twig: 'vendor/twig'}], (require, exports, module) => {
    const {twig} = require('twig');
    exports.template = twig({id: 'templates/sub/sub.twig', data: [{type: 'raw', value: 'I\'m a '}, {type: 'output', stack: [{type: 'Twig.expression.type.variable', value: 'type', match: ['type']}]}, {type: 'raw', value: '\n'}], precompiled: true});
});
