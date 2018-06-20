var Twig = (Twig || require("../twig")).factory(),
    twig = twig || Twig.twig;

describe("Twig.js Loaders ->", function() {
    // Encodings
    describe("custom loader ->", function() {
        it("should define a custom loader", function() {
            Twig.extend(function(Twig) {
                var obj = {
                    templates: {
                        'custom_loader_block': '{% block main %}This lets you {% block data %}use blocks{% endblock data %}{% endblock main %}',
                        'custom_loader_simple': 'the value is: {{ value }}',
                        'custom_loader_include': 'include others from the same loader method - {% include "custom_loader_simple" %}',
                        'custom_loader_complex': '{% extends "custom_loader_block" %} {% block data %}extend other templates and {% include "custom_loader_include" %}{% endblock data %}'
                    },
                    loader: function(location, params, callback, error_callback) {
                        params.data = this.templates[location];
                        params.allowInlineIncludes = true;
                        var template = new Twig.Template(params);
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
        it("should load a simple template from a custom loader", function() {
            twig({
                method: 'custom',
                name: 'custom_loader_simple'
            }).render({value: 'test succeeded'}).should.equal('the value is: test succeeded');
        });
        it("should load a template that includes another from a custom loader", function() {
            twig({
                method: 'custom',
                name: 'custom_loader_include'
            }).render({value: 'test succeeded'}).should.equal('include others from the same loader method - the value is: test succeeded');
        });
        it("should load a template that extends another from a custom loader", function() {
            twig({
                method: 'custom',
                name: 'custom_loader_complex'
            }).render({value: 'test succeeded'}).should.equal('This lets you extend other templates and include others from the same loader method - the value is: test succeeded');
        });
        it("should remove a registered loader", function() {
            Twig.extend(function(Twig) {
                Twig.Templates.unRegisterLoader('custom');
                Twig.Templates.loaders.should.not.have.property('custom');
            });
        });
    });
});
