const {factory} = require('../twig');

let twig;

describe('Twig.js Blocks ->', function () {
    beforeEach(function () {
        twig = factory().twig;
    });

    describe('"extends" tag and inheritance', function () {
        it('"extends" applies recursively to grand-parents', function () {
            twig({
                id: 'grand-parent.twig',
                data: '{% block content %}grand-parent.twig{% endblock%}'
            });
            twig({
                id: 'parent.twig',
                data: '{% extends "grand-parent.twig" %}'
            });

            twig({
                allowInlineIncludes: true,
                data: '{% extends "parent.twig" %}{% block content %}main.twig > {{ parent() }}{% endblock %}'
            }).render().should.equal('main.twig > grand-parent.twig');
        });
    });
});
