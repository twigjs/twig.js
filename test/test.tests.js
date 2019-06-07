const Twig = require('../twig').factory();

const {twig} = Twig;

const {mapTestDataToAssertions} = require('./helpers')(twig);

describe('Twig.js Tests ->', function () {
    describe('empty test ->', function () {
        it('should identify numbers as not empty', async function () {
            // Number
            return mapTestDataToAssertions(
                ['{{ 1 is empty }}', '{{ 0 is empty }}'],
                ['false', 'false']
            );
        });

        it('should identify empty strings', async function () {
            // String
            return mapTestDataToAssertions(
                ['{{ "" is empty }}', '{{ "test" is empty }}'],
                ['true', 'false']
            );
        });

        it('should identify empty arrays', async function () {
            // Array
            return mapTestDataToAssertions(
                ['{{ [] is empty }}', '{{ ["1"] is empty }}'],
                ['true', 'false']
            );
        });

        it('should identify empty objects', async function () {
            // Object
            return mapTestDataToAssertions(
                [
                    '{{ {} is empty }}',
                    '{{ {"a":"b"} is empty }}',
                    '{{ {"a":"b"} is not empty }}'
                ],
                ['true', 'false', 'true']
            );
        });
    });

    describe('odd test ->', function () {
        it('should identify a number as odd', function () {
            return mapTestDataToAssertions(
                ['{{ (1 + 4) is odd }}', '{{ 6 is odd }}'],
                ['true', 'false']
            );
        });
    });

    describe('even test ->', function () {
        it('should identify a number as even', function () {
            return mapTestDataToAssertions(
                ['{{ (1 + 4) is even }}', '{{ 6 is even }}'],
                ['false', 'true']
            );
        });
    });

    describe('divisibleby test ->', function () {
        it('should determine if a number is divisible by the given number', function () {
            return mapTestDataToAssertions(
                ['{{ 5 is divisibleby(3) }}', '{{ 6 is divisibleby(3) }}'],
                ['false', 'true']
            );
        });
    });

    describe('defined test ->', function () {
        it('should identify a key as defined if it exists in the render context', async function () {
            const context = {
                key: {
                    foo: 'bar',
                    nothing: null
                },
                nothing: null
            };

            return Promise.all([
                mapTestDataToAssertions(
                    '{{ key is defined }}',
                    ['false', 'true'],
                    [undefined, {key: 'test'}]
                ),
                mapTestDataToAssertions(
                    [
                        '{{ key.foo is defined }}',
                        '{{ key.bar is defined }}',
                        '{{ key.foo.bar is defined }}',
                        '{{ foo.bar is defined }}',
                        '{{ nothing is defined }}',
                        '{{ key.nothing is defined }}'
                    ],
                    ['true', 'false', 'false', 'false', 'true', 'true'],
                    context
                )
            ]);
        });
    });

    describe('none test ->', function () {
        it('should identify a key as none if it exists in the render context and is null', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ key is none }}',
                    '{{ key is none }}',
                    '{{ key is none }}',
                    '{{ key is null }}'
                ],
                ['false', 'false', 'true', 'true'],
                [undefined, {key: 'test'}, {key: null}, {key: null}]
            );
        });
    });

    describe('`sameas` backwards compatibility with `same as`', function () {
        it('should identify the exact same type as true', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ true is sameas(true) }}',
                    '{{ a is sameas(1) }}',
                    '{{ a is sameas("test") }}',
                    '{{ a is sameas(true) }}'
                ],
                ['true', 'true', 'true', 'true'],
                [undefined, {a: 1}, {a: 'test'}, {a: true}]
            );
        });
        it('should identify the different types as false', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ false is sameas(true) }}',
                    '{{ true is sameas(1) }}',
                    '{{ false is sameas("") }}',
                    '{{ a is sameas(1) }}'
                ],
                ['false', 'false', 'false', 'false'],
                [undefined, undefined, undefined, {a: '1'}]
            );
        });
    });

    describe('same as test ->', async function () {
        it('should identify the exact same type as true', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ true is same as(true) }}',
                    '{{ a is same as(1) }}',
                    '{{ a is same as("test") }}',
                    '{{ a is same as(true) }}'
                ],
                ['true', 'true', 'true', 'true'],
                [undefined, {a: 1}, {a: 'test'}, {a: true}]
            );
        });
        it('should identify the different types as false', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ false is same as(true) }}',
                    '{{ true is same as(1) }}',
                    '{{ false is same as("") }}',
                    '{{ a is same as(1) }}'
                ],
                ['false', 'false', 'false', 'false'],
                [undefined, undefined, undefined, {a: '1'}]
            );
        });
    });

    describe('iterable test ->', function () {
        const data = {
            foo: [],
            traversable: 15,
            obj: {},
            val: 'test'
        };

        it('should fail on non-iterable data types', async function () {
            return mapTestDataToAssertions(
                '{{ val is iterable ? \'ok\' : \'ko\' }}',
                ['ko', 'ko', 'ko'],
                [data, {val: null}, {}]
            );
        });

        it('should pass on iterable data types', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ foo is iterable ? \'ok\' : \'ko\' }}',
                    '{{ obj is iterable ? \'ok\' : \'ko\' }}'
                ],
                ['ok', 'ok'],
                data
            );
        });
    });

    describe('Context test ->', function () {
        class Foo {
            constructor(a) {
                this.x = {
                    test: a
                };
                this.y = 9;
            }

            get test() {
                return this.x.test;
            }

            runme() {
                // This is out of context when runme() is called from the view
                return '1' + this.y;
            }
        }

        const foobar = new Foo('123');

        it('should pass when test.runme returns 19', async function () {
            const testTemplate = twig({data: '{{test.runme()}}'});
            return testTemplate.render({test: foobar}).should.be.fulfilledWith('19');
        });

        it('should pass when test.test returns 123', async function () {
            const testTemplate = twig({data: '{{test.test}}'});
            return testTemplate.render({test: foobar}).should.be.fulfilledWith('123');
        });
    });
});
