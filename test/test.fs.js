const Twig = require('..').factory();

const {twig} = Twig;

describe('Twig.js Loader ->', function () {
    it('should load a template from the filesystem asynchronously', function (done) {
        twig({
            id: 'fs-node-async',
            path: 'test/templates/test.twig',
            load(template) {
                // Render the template
                template.render({
                    test: 'yes',
                    flag: true
                }).should.equal('Test template = yes\n\nFlag set!');

                done();
            }
        });
    });
    it('should load a template from the filesystem synchronously', function () {
        const template = twig({
            id: 'fs-node-sync',
            path: 'test/templates/test.twig',
            async: false
        });
        // Render the template
        template.render({
            test: 'yes',
            flag: true
        }).should.equal('Test template = yes\n\nFlag set!');
    });

    describe('source ->', function () {
        it('should load the non-compiled template source code', function () {
            twig({data: '{{ source("test/templates/source.twig") }}'})
                .render()
                .should
                .equal('{% if isUserNew == true %}\n    Hello {{ name }}\n{% else %}\n    Welcome back {{ name }}\n{% endif %}\n');
        });

        it('should indicate if there was a problem loading the template if \'ignore_missing\' is false', function () {
            twig({data: '{{ source("test/templates/non-existing-source.twig", false) }}'})
                .render()
                .should
                .equal('Template "test/templates/non-existing-source.twig" is not defined.');
        });

        it('should NOT indicate if there was a problem loading the template if \'ignore_missing\' is true', function () {
            twig({data: '{{ source("test/templates/non-existing-source.twig", true) }}'})
                .render()
                .should
                .equal('');
        });
    });
});

describe('Twig.js Include ->', function () {
    it('should load an included template with no context', function () {
        twig({
            id: 'include',
            path: 'test/templates/include.twig',
            async: false
        });

        // Load the template
        twig({ref: 'include'}).render({test: 'tst'}).should.equal('BeforeTest template = tst\n\nAfter');
    });

    it('should load an included template using relative path', function () {
        twig({
            id: 'include-relative',
            path: 'test/templates/include/relative.twig',
            async: false
        });

        // Load the template
        twig({ref: 'include-relative'}).render().should.equal('Twig.js!');
    });

    it('should load the first template when passed an array', function () {
        twig({
            id: 'include-array',
            path: 'test/templates/include-array.twig',
            async: false
        });

        // Load the template
        twig({ref: 'include-array'}).render({test: 'tst'}).should.equal('BeforeTest template = tst\n\nAfter');
    });

    it('should load the second template when passed an array where the first value does not exist', function () {
        twig({
            id: 'include-array-second-exists',
            path: 'test/templates/include-array-second-exists.twig',
            async: false
        });

        // Load the template
        twig({ref: 'include-array'}).render({test: 'tst'}).should.equal('BeforeTest template = tst\n\nAfter');
    });

    it('should load an included template with additional context', function () {
        twig({
            id: 'include-with',
            path: 'test/templates/include-with.twig',
            async: false
        });

        // Load the template
        twig({ref: 'include-with'}).render({test: 'tst'}).should.equal('template: before,tst-mid-template: after,tst');
    });

    it('should load an included template with only additional context', function () {
        twig({
            id: 'include-only',
            path: 'test/templates/include-only.twig',
            async: false
        });

        // Load the template
        twig({ref: 'include-only'}).render({test: 'tst'}).should.equal('template: before,-mid-template: after,');
    });

    it('should skip a nonexistent included template flagged wth \'ignore missing\'', function () {
        twig({
            id: 'include-ignore-missing',
            path: 'test/templates/include-ignore-missing.twig',
            async: false
        });

        twig({ref: 'include-ignore-missing'}).render().should.equal('ignore-missing');
    });

    it('should fail including a nonexistent included template not flagged wth \'ignore missing\'', function () {
        try {
            twig({
                id: 'include-ignore-missing-missing',
                path: 'test/templates/include-ignore-missing-missing.twig',
                async: false,
                rethrow: true
            }).render();
        } catch (error) {
            error.type.should.equal('TwigException');
        }
    });

    it('should fail including a nonexistent included template asynchronously', function (done) {
        twig({
            id: 'include-ignore-missing-missing-async',
            path: 'test/templates/include-ignore-missing-missing-async.twig',
            async: true,
            load(template) {
                template.should.not.exist();
                done();
            },
            error(err) {
                err.type.should.equal('TwigException');
                done();
            },
            rethrow: true
        });
    });

    it('should include paths with trailing or leading whitespace', function () {
        twig({
            'data': 'path has leading whitespace',
            'id': ' path/with/leading/whitespace.twig',
        });
        twig({
            'data': 'path has trailing whitespace',
            'id': 'path/with/trailing/whitespace.twig ',
        });

        twig({
            'allowInlineIncludes': true,
            'data': "{% include ' path/with/leading/whitespace.twig' %} - {% include 'path/with/trailing/whitespace.twig ' %}",
        }).render().trim().should.equal('path has leading whitespace - path has trailing whitespace');
    });

    it('should not include paths without trailing or leading whitespace', function () {
        twig({
            'data': 'path has no leading whitespace',
            'id': 'path/without/leading/whitespace.twig',
        });
        twig({
            'data': 'path has no trailing whitespace',
            'id': 'path/without/trailing/whitespace.twig',
        });

        (function () {
            twig({
                'allowInlineIncludes': true,
                'data': "{% include ' path/without/leading/whitespace.twig' %}",
                'rethrow': true,
            }).render();
        }).should.throw(/Unable to find template file/);

        (function () {
            twig({
                'allowInlineIncludes': true,
                'data': "{% include 'path/without/trailing/whitespace.twig ' %}",
                'rethrow': true,
            }).render();
        }).should.throw(/Unable to find template file/);
    });
});

describe('Twig.js Extends ->', function () {
    it('should load the first template when passed an array', function () {
        const template = twig({
            path: 'test/templates/extender-array.twig',
            async: false
        });

        const output = template.render();
        output.trim().should.equal('Hello, world!');
    });

    it('should load the second template when passed an array where the first value does not exist', function () {
        const template = twig({
            path: 'test/templates/extender-array-second-exists.twig',
            async: false
        });

        const output = template.render();
        output.trim().should.equal('Hello, world!');
    });

    it('should silently fail when passed an array with no templates that exist', function () {
        const template = twig({
            path: 'test/templates/extender-array-none-exist.twig',
            async: false
        });

        const output = template.render();
        output.trim().should.equal('Nothing to see here');
    });
});
