const Twig = require('..').factory();

const {twig} = Twig;

describe('Twig.js Loaders ->', function () {
    // Encodings
    describe('custom loader ->', function () {
        it('should define a custom loader', function () {
            Twig.extend(Twig => {
                const obj = {
                    templates: {
                        customLoaderBlock: '{% block main %}This lets you {% block data %}use blocks{% endblock data %}{% endblock main %}',
                        customLoaderSimple: 'the value is: {{ value }}',
                        customLoaderInclude: 'include others from the same loader method - {% include "customLoaderSimple" %}',
                        customLoaderComplex: '{% extends "customLoaderBlock" %} {% block data %}extend other templates and {% include "customLoaderInclude" %}{% endblock data %}'
                    },
                    loader(location, params, callback, _) {
                        params.data = this.templates[location];
                        params.allowInlineIncludes = true;
                        const template = new Twig.Template(params);
                        if (typeof callback === 'function') {
                            callback(template);
                        }

                        return template;
                    }
                };
                Twig.Templates.registerLoader('custom', obj.loader, obj);
                Twig.Templates.loaders.should.have.property('custom');
            });
        });
        it('should load a simple template from a custom loader', function () {
            twig({
                method: 'custom',
                name: 'customLoaderSimple'
            }).render({value: 'test succeeded'}).should.equal('the value is: test succeeded');
        });
        it('should load a template that includes another from a custom loader', function () {
            twig({
                method: 'custom',
                name: 'customLoaderInclude'
            }).render({value: 'test succeeded'}).should.equal('include others from the same loader method - the value is: test succeeded');
        });
        it('should load a template that extends another from a custom loader', function () {
            twig({
                method: 'custom',
                name: 'customLoaderComplex'
            }).render({value: 'test succeeded'}).should.equal('This lets you extend other templates and include others from the same loader method - the value is: test succeeded');
        });
        it('should remove a registered loader', function () {
            Twig.extend(Twig => {
                Twig.Templates.unRegisterLoader('custom');
                Twig.Templates.loaders.should.not.have.property('custom');
            });
        });
    });
});
