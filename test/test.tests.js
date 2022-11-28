const Twig = require('..').factory();

const {twig} = Twig;

describe('Twig.js Tests ->', function () {
    describe('empty test ->', function () {
        it('should identify numbers as not empty', function () {
            // Number
            twig({data: '{{ 1 is empty }}'}).render().should.equal('false');
            twig({data: '{{ 0 is empty }}'}).render().should.equal('false');
        });

        it('should identify empty strings', function () {
            // String
            twig({data: '{{ "" is empty }}'}).render().should.equal('true');
            twig({data: '{{ "test" is empty }}'}).render().should.equal('false');
        });

        it('should identify empty arrays', function () {
            // Array
            twig({data: '{{ [] is empty }}'}).render().should.equal('true');
            twig({data: '{{ ["1"] is empty }}'}).render().should.equal('false');
        });

        it('should identify empty objects', function () {
            // Object
            twig({data: '{{ {} is empty }}'}).render().should.equal('true');
            twig({data: '{{ {"a":"b"} is empty }}'}).render().should.equal('false');
            twig({data: '{{ {"a":"b"} is not empty }}'}).render().should.equal('true');
        });
    });

    describe('odd test ->', function () {
        it('should identify a number as odd', function () {
            twig({data: '{{ (1 + 4) is odd }}'}).render().should.equal('true');
            twig({data: '{{ 6 is odd }}'}).render().should.equal('false');
        });
    });

    describe('even test ->', function () {
        it('should identify a number as even', function () {
            twig({data: '{{ (1 + 4) is even }}'}).render().should.equal('false');
            twig({data: '{{ 6 is even }}'}).render().should.equal('true');
        });
    });

    describe('divisible by test ->', function () {
        it('should determine if a number is divisible by the given number', function () {
            twig({data: '{{ 5 is divisible by(3) }}'}).render().should.equal('false');
            twig({data: '{{ 6 is divisible by(3) }}'}).render().should.equal('true');
        });

        it('should support the old version without space for backwards compatibility', function () {
            twig({data: '{{ 5 is divisibleby(3) }}'}).render().should.equal('false');
            twig({data: '{{ 6 is divisibleby(3) }}'}).render().should.equal('true');
        });
    });

    describe('defined test ->', function () {
        it('should identify a key as defined if it exists in the render context', function () {
            twig({data: '{{ key is defined }}'}).render().should.equal('false');
            twig({data: '{{ key is defined }}'}).render({key: 'test'}).should.equal('true');
            const context = {
                key: {
                    foo: 'bar',
                    nothing: null
                },
                nothing: null
            };
            twig({data: '{{ key.foo is defined }}'}).render(context).should.equal('true');
            twig({data: '{{ key.bar is defined }}'}).render(context).should.equal('false');
            twig({data: '{{ key.foo.bar is defined }}'}).render(context).should.equal('false');
            twig({data: '{{ foo.bar is defined }}'}).render(context).should.equal('false');
            twig({data: '{{ nothing is defined }}'}).render(context).should.equal('true');
            twig({data: '{{ key.nothing is defined }}'}).render(context).should.equal('true');
        });
    });

    describe('none test ->', function () {
        it('should identify a key as none if it exists in the render context and is null', function () {
            twig({data: '{{ key is none }}'}).render().should.equal('false');
            twig({data: '{{ key is none }}'}).render({key: 'test'}).should.equal('false');
            twig({data: '{{ key is none }}'}).render({key: null}).should.equal('true');
            twig({data: '{{ key is null }}'}).render({key: null}).should.equal('true');
        });
    });

    describe('`sameas` backwards compatibility with `same as`', function () {
        it('should identify the exact same type as true', function () {
            twig({data: '{{ true is sameas(true) }}'}).render().should.equal('true');
            twig({data: '{{ a is sameas(1) }}'}).render({a: 1}).should.equal('true');
            twig({data: '{{ a is sameas("test") }}'}).render({a: 'test'}).should.equal('true');
            twig({data: '{{ a is sameas(true) }}'}).render({a: true}).should.equal('true');
        });
        it('should identify the different types as false', function () {
            twig({data: '{{ false is sameas(true) }}'}).render().should.equal('false');
            twig({data: '{{ true is sameas(1) }}'}).render().should.equal('false');
            twig({data: '{{ false is sameas("") }}'}).render().should.equal('false');
            twig({data: '{{ a is sameas(1) }}'}).render({a: '1'}).should.equal('false');
        });
    });

    describe('same as test ->', function () {
        it('should identify the exact same type as true', function () {
            twig({data: '{{ true is same as(true) }}'}).render().should.equal('true');
            twig({data: '{{ a is same as(1) }}'}).render({a: 1}).should.equal('true');
            twig({data: '{{ a is same as("test") }}'}).render({a: 'test'}).should.equal('true');
            twig({data: '{{ a is same as(true) }}'}).render({a: true}).should.equal('true');
        });
        it('should identify the different types as false', function () {
            twig({data: '{{ false is same as(true) }}'}).render().should.equal('false');
            twig({data: '{{ true is same as(1) }}'}).render().should.equal('false');
            twig({data: '{{ false is same as("") }}'}).render().should.equal('false');
            twig({data: '{{ a is same as(1) }}'}).render({a: '1'}).should.equal('false');
        });
    });

    describe('iterable test ->', function () {
        const data = {
            foo: [],
            traversable: 15,
            obj: {},
            val: 'test'
        };

        it('should fail on non-iterable data types', function () {
            twig({data: '{{ val is iterable ? \'ok\' : \'ko\' }}'}).render(data).should.equal('ko');
            twig({data: '{{ val is iterable ? \'ok\' : \'ko\' }}'}).render({val: null}).should.equal('ko');
            twig({data: '{{ val is iterable ? \'ok\' : \'ko\' }}'}).render({}).should.equal('ko');
        });

        it('should pass on iterable data types', function () {
            twig({data: '{{ foo is iterable ? \'ok\' : \'ko\' }}'}).render(data).should.equal('ok');
            twig({data: '{{ obj is iterable ? \'ok\' : \'ko\' }}'}).render(data).should.equal('ok');
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

        it('should pass when test.runme returns 19', function () {
            twig({data: '{{test.runme()}}'}).render({test: foobar}).should.equal('19');
        });

        it('should pass when test.test returns 123', function () {
            twig({data: '{{test.test}}'}).render({test: foobar}).should.equal('123');
        });
    });
});
