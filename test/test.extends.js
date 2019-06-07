const Twig = require('../twig').factory();

const {twig} = Twig;

describe('Twig.js Extensions ->', function () {
    it('should be able to extend a meta-type tag', async function () {
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
                    token.stack = Twig.expression.compile.apply(this, [{
                        type: Twig.expression.type.expression,
                        value: expression
                    }]).stack;

                    delete token.match;
                    return token;
                },
                async parse(token, context, _) {
                    const name = await Twig.expression.parse.apply(this, [token.stack, context]);
                    const output = '';

                    flags[name] = true;

                    return {
                        chain: false,
                        output
                    };
                }
            });
        });

        const testTemplate = twig({data: '{% flag \'enabled\' %}'});
        await testTemplate.render();
        flags.enabled.should.equal(true);
    });

    it('should be able to extend paired tags', async function () {
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
                    token.stack = Twig.expression.compile.apply(this, [{
                        type: Twig.expression.type.expression,
                        value: expression
                    }]).stack;

                    delete token.match;
                    return token;
                },
                async parse(token, context, chain) {
                    const level = await Twig.expression.parse.apply(this, [token.stack, context]);
                    let output = '';

                    if (App.users[App.currentUser].level === level) {
                        output = await this.parse(token.output, context);
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

        let result;
        App.currentUser = 'john';
        result = await template.render();
        result.should.equal('Welcome ADMIN!');

        App.currentUser = 'tom';
        result = await template.render();
        result.should.be.equal('Welcome!');
    });

    it('should be able to extend the same tag twice, replacing it', async function () {
        let testTemplate;
        let result;

        Twig.extend(Twig => {
            Twig.exports.extendTag({
                type: 'noop',
                regex: /^noop$/,
                next: [],
                open: true,
                async parse(_) {
                    return {
                        chain: false,
                        output: 'noop1'
                    };
                }
            });
        });

        testTemplate = twig({data: '{% noop %}'});
        result = await testTemplate.render();
        result.should.equal('noop1');

        Twig.extend(Twig => {
            Twig.exports.extendTag({
                type: 'noop',
                regex: /^noop$/,
                next: [],
                open: true,
                async parse(_) {
                    return {
                        chain: false,
                        output: 'noop2'
                    };
                }
            });
        });

        testTemplate = twig({data: '{% noop %}'});
        result = await testTemplate.render();
        result.should.equal('noop2');
    });

    it('should extend the parent context when extending', async function () {
        const testTemplate = await twig({
            path: 'test/templates/extender.twig'
        });

        const output = await testTemplate.render();

        output.trim().should.equal('ok!');
    });
});
