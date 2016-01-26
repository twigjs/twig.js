var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Loaders ->", function() {
    // Encodings
    describe("custom loader ->", function() {
        it("should define a custom loader", function() {
            Twig.extend(function(Twig) {
                var obj = {
                    test: 'with scope',
                    loader: function(location, params, callback, error_callback) {
                        params.data = 'the value is: {{ value }} - ' + this.test;
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
        it("should load a template from a custom loader", function() {
            var test_template = twig({method: 'custom'});
            test_template.render({value: 'test succeeded'}).should.equal('the value is: test succeeded - with scope');
        });
        it("should remove a registered loader", function() {
            Twig.extend(function(Twig) {
                Twig.Templates.unRegisterLoader('custom');
                Twig.Templates.loaders.should.not.have.property('custom');
            });
        });
    });
});
