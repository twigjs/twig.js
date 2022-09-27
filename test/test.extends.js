const Twig = require('..').factory();

const {twig} = Twig;

describe('Twig.js Extensions ->', function () {
    it('should be able to extend a meta-type tag', function () {
        const flags = {};

        Twig.extend(Twig => {
            Twig.exports.extendTag({
                type: 'flag',
                regex: /^flag\s+(.+)$/,
                next: [],
                open: true,
                compile(token) {
                    const expression = token.match[1];

                    // Compile the expression.
                    token.stack = Reflect.apply(Twig.expression.compile, this, [{
                        type: Twig.expression.type.expression,
                        value: expression
                    }]).stack;

                    delete token.match;
                    return token;
                },
                parse(token, context, _) {
                    const name = Reflect.apply(Twig.expression.parse, this, [token.stack, context]);
                    const output = '';

                    flags[name] = true;

                    return {
                        chain: false,
                        output
                    };
                }
            });
        });

        twig({data: '{% flag \'enabled\' %}'}).render();
        flags.enabled.should.equal(true);
    });

    it('should be able to extend paired tags', function () {
        // Demo data
        const App = {
            user: 'john',
            users: {
                john: {level: 'admin'},
                tom: {level: 'user'}
            }
        };

        Twig.extend(Twig => {
            // Example of extending a tag type that would
            // restrict content to the specified "level"
            Twig.exports.extendTag({
                type: 'auth',
                regex: /^auth\s+(.+)$/,
                next: ['endauth'], // Match the type of the end tag
                open: true,
                compile(token) {
                    const expression = token.match[1];

                    // Turn the string expression into tokens.
                    token.stack = Reflect.apply(Twig.expression.compile, this, [{
                        type: Twig.expression.type.expression,
                        value: expression
                    }]).stack;

                    delete token.match;
                    return token;
                },
                parse(token, context, chain) {
                    const level = Reflect.apply(Twig.expression.parse, this, [token.stack, context]);
                    let output = '';

                    if (App.users[App.currentUser].level === level) {
                        output = this.parse(token.output, context);
                    }

                    return {
                        chain,
                        output
                    };
                }
            });
            Twig.exports.extendTag({
                type: 'endauth',
                regex: /^endauth$/,
                next: [],
                open: false
            });
        });

        const template = twig({data: 'Welcome{% auth \'admin\' %} ADMIN{% endauth %}!'});

        App.currentUser = 'john';
        template.render().should.equal('Welcome ADMIN!');

        App.currentUser = 'tom';
        template.render().should.equal('Welcome!');
    });

    it('should be able to extend the same tag twice, replacing it', function () {
        let result;

        Twig.extend(Twig => {
            Twig.exports.extendTag({
                type: 'noop',
                regex: /^noop$/,
                next: [],
                open: true,
                parse(_) {
                    return {
                        chain: false,
                        output: 'noop1'
                    };
                }
            });
        });

        result = twig({data: '{% noop %}'}).render();
        result.should.equal('noop1');

        Twig.extend(Twig => {
            Twig.exports.extendTag({
                type: 'noop',
                regex: /^noop$/,
                next: [],
                open: true,
                parse(_) {
                    return {
                        chain: false,
                        output: 'noop2'
                    };
                }
            });
        });

        result = twig({data: '{% noop %}'}).render();
        result.should.equal('noop2');
    });

    it('should extend the parent context when extending', function () {
        const template = twig({
            path: 'test/templates/extender.twig',
            async: false
        });

        const output = template.render();

        output.trim().should.equal('ok!');
    });
});
