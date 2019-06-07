const path = require('path');
const awaity = require('awaity');
const Twig = require('../twig').factory();

const {twig} = Twig;

const {mapTestDataToAssertions} = require('./helpers')(twig);

describe('Twig.js Functions ->', function () {
    // Add some test functions to work with
    Twig.extendFunction('echo', a => {
        return a;
    });
    Twig.extendFunction('square', a => {
        return a * a;
    });
    Twig.extendFunction('list', (...args) => {
        return Array.prototype.slice.call(args);
    });
    Twig.extendFunction('include', function (_) {
        (typeof this).should.equal('object');
        this.should.not.equal(global, 'function should not be called on global');
        (typeof this.context).should.equal('object');

        return 'success';
    });

    it('should allow you to define a function', async function () {
        const testTemplate = twig({data: '{{ square(a) }}'});
        return testTemplate.render({a: 4}).should.be.fulfilledWith('16');
    });
    it('should chain with other expressions', async function () {
        const testTemplate = twig({data: '{{ square(a) + 4 }}'});
        return testTemplate.render({a: 4}).should.be.fulfilledWith('20');
    });
    it('should chain with filters', async function () {
        const testTemplate = twig({data: '{{ echo(a)|default("foo") }}'});
        return testTemplate.render().should.be.fulfilledWith('foo');
    });
    it('should work in for loop expressions', async function () {
        const testTemplate = twig({data: '{% for i in list(1, 2, 3) %}{{ i }},{% endfor %}'});
        return testTemplate.render().should.be.fulfilledWith('1,2,3,');
    });
    it('should be able to differentiate between a function and a variable', async function () {
        const testTemplate = twig({data: '{{ square ( square ) + square }}'});
        return testTemplate.render({square: 2}).should.be.fulfilledWith('6');
    });
    it('should work with boolean operations', async function () {
        const testTemplate = twig({data: '{% if echo(true) or echo(false) %}yes{% endif %}'});
        return testTemplate.render().should.be.fulfilledWith('yes');
    });

    it('should call function on template instance', async function () {
        const macro = '{% macro testMacro(data) %}success{% endmacro %}';
        const tpl = '{% import "testMacro" as m %}{{ m.testMacro({ key: include() }) }}';

        twig({data: macro, id: 'testMacro'});
        const testTemplate = twig({data: tpl, allowInlineIncludes: true});
        return testTemplate.render().should.be.fulfilledWith('success');
    });

    it('should execute functions passed as context values', async function () {
        const testTemplate = twig({
            data: '{{ value }}'
        });

        return testTemplate.render({
            value() {
                return 'test';
            }
        }).should.be.fulfilledWith('test');
    });
    it('should execute functions passed as context values with this mapped to the context', async function () {
        const testTemplate = twig({
            data: '{{ value }}'
        });

        return testTemplate.render({
            test: 'value',
            value() {
                return this.test;
            }
        }).should.be.fulfilledWith('value');
    });
    it('should execute functions passed as context values with arguments', async function () {
        const testTemplate = twig({
            data: '{{ value(1, "test") }}'
        });

        return testTemplate.render({
            value(a, b, c) {
                return a + '-' + b + '-' + (c === undefined ? 'true' : 'false');
            }
        }).should.be.fulfilledWith('1-test-true');
    });
    it('should execute functions passed as context value parameters with this mapped to the context', async function () {
        const testTemplate = twig({
            data: '{{ value }}'
        });

        return testTemplate.render({
            test: 'value',
            value() {
                return this.test;
            }
        }).should.be.fulfilledWith('value');
    });

    it('should execute functions passed as context object parameters', async function () {
        const testTemplate = twig({
            data: '{{ obj.value }}'
        });

        return testTemplate.render({
            obj: {
                test: 'value',
                value() {
                    return this.test;
                }
            }
        }).should.be.fulfilledWith('value');
    });
    it('should execute functions passed as context object parameters with arguments', async function () {
        const testTemplate = twig({
            data: '{{ obj.value(1, "test") }}'
        });

        return testTemplate.render({
            obj: {
                test: 'value',
                value(a, b, c) {
                    return a + '-' + b + '-' + this.test + '-' + (c === undefined ? 'true' : 'false');
                }
            }
        }).should.be.fulfilledWith('1-test-value-true');
    });

    it('should execute functions passed as context object parameters', async function () {
        const testTemplate = twig({
            data: '{{ obj["value"] }}'
        });

        return testTemplate.render({
            obj: {
                value() {
                    return 'test';
                }
            }
        }).should.be.fulfilledWith('test');
    });
    it('should execute functions passed as context object parameters with arguments', async function () {
        const testTemplate = twig({
            data: '{{ obj["value"](1, "test") }}'
        });

        return testTemplate.render({
            obj: {
                value(a, b, c) {
                    return a + '-' + b + '-' + (c === undefined ? 'true' : 'false');
                }
            }
        }).should.be.fulfilledWith('1-test-true');
    });

    describe('Built-in Functions ->', function () {
        describe('range ->', function () {
            it('should work over a range of numbers', async function () {
                const testTemplate = twig({data: '{% for i in range(0, 3) %}{{ i }},{% endfor %}'});
                return testTemplate.render().should.be.fulfilledWith('0,1,2,3,');
            });
            it('should work over a range of letters', async function () {
                const testTemplate = twig({data: '{% for i in range("a", "c") %}{{ i }},{% endfor %}'});
                return testTemplate.render().should.be.fulfilledWith('a,b,c,');
            });
            it('should work with an interval', async function () {
                const testTemplate = twig({data: '{% for i in range(1, 15, 3) %}{{ i }},{% endfor %}'});
                return testTemplate.render().should.be.fulfilledWith('1,4,7,10,13,');
            });

            it('should work with .. invocation', function () {
                return mapTestDataToAssertions(
                    [
                        '{% for i in 0..3 %}{{ i }},{% endfor %}',
                        '{% for i in "a" .. "c" %}{{ i }},{% endfor %}'
                    ],
                    [
                        '0,1,2,3,',
                        'a,b,c,'
                    ]
                );
            });
        });
        describe('cycle ->', function () {
            it('should cycle through an array of values', async function () {
                const testTemplate = twig({data: '{% for i in range(0, 3) %}{{ cycle(["odd", "even"], i) }};{% endfor %}'});
                return testTemplate.render().should.be.fulfilledWith('odd;even;odd;even;');
            });
        });
        describe('date ->', function () {
            function pad(num) {
                return num < 10 ? '0' + num : num;
            }

            function stringDate(date) {
                return pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear() +
                                         ' @ ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
            }

            it('should understand timestamps', async function () {
                const date = new Date(946706400 * 1000);
                const testTemplate = twig({data: '{{ date(946706400)|date("d/m/Y @ H:i:s") }}'});
                return testTemplate.render().should.be.fulfilledWith(stringDate(date));
            });
            it('should understand relative dates', async function () {
                return mapTestDataToAssertions(
                    [
                        '{{ date("+1 day") > date() }}',
                        '{{ date("-1 day") > date() }}'
                    ],
                    [
                        'true',
                        'false'
                    ]
                );
            });
            it('should support \'now\' as a date parameter', async function () {
                const testTemplate = twig({data: '{{ date("now") }}'});
                return testTemplate.render().should.be.fulfilledWith(new Date().toString());
            });
            it('should understand exact dates', async function () {
                const date = new Date('June 20, 2010 UTC');

                const testTemplate = twig({data: '{{ date("June 20, 2010 UTC")|date("d/m/Y @ H:i:s") }}'});
                return testTemplate.render().should.be.fulfilledWith(stringDate(date));
            });
        });
        describe('dump ->', function () {
            const EOL = '\n';
            it('should output formatted number', async function () {
                const testTemplate = twig({data: '{{ dump(test) }}'});
                return testTemplate.render({test: 5}).should.be.fulfilledWith('number(5)' + EOL);
            });
            it('should output formatted string', async function () {
                const testTemplate = twig({data: '{{ dump(test) }}'});
                return testTemplate.render({test: 'String'}).should.be.fulfilledWith('string(6) "String"' + EOL);
            });
            it('should output formatted boolean', async function () {
                const testTemplate = twig({data: '{{ dump(test) }}'});
                return testTemplate.render({test: true}).should.be.fulfilledWith('bool(true)' + EOL);
            });
            it('should output formatted null', async function () {
                const testTemplate = twig({data: '{{ dump(test) }}'});
                return testTemplate.render({test: null}).should.be.fulfilledWith('NULL' + EOL);
            });
            it('should output formatted object', async function () {
                const testTemplate = twig({data: '{{ dump(test) }}'});
                return testTemplate.render({test: {}}).should.be.fulfilledWith('object(0) {' + EOL + '}' + EOL);
            });
            it('should output formatted array', async function () {
                const testTemplate = twig({data: '{{ dump(test) }}'});
                return testTemplate.render({test: []}).should.be.fulfilledWith('object(0) {' + EOL + '}' + EOL);
            });
            it('should output formatted undefined', async function () {
                const testTemplate = twig({data: '{{ dump(test) }}'});
                return testTemplate.render({test: undefined}).should.be.fulfilledWith('undefined' + EOL);
            });
        });

        describe('block ->', function () {
            it('should render the content of blocks', async function () {
                const testTemplate = twig({data: '{% block title %}Content - {{ val }}{% endblock %} Title: {{ block("title") }}'});

                return testTemplate.render({val: 'test'}).should.be.fulfilledWith('Content - test Title: Content - test');
            });

            it('shouldn\'t escape the content of blocks twice', async function () {
                const testTemplate = twig({
                    autoescape: true,
                    data: '{% block test %}{{ val }}{% endblock %} {{ block("test") }}'
                });

                return testTemplate.render({
                    val: 'te&st'
                }).should.be.fulfilledWith('te&amp;st te&amp;st');
            });
        });

        describe('attribute ->', function () {
            it('should access attribute of an object', async function () {
                const testTemplate = twig({data: '{{ attribute(obj, key) }}'});

                return testTemplate.render({
                    obj: {name: 'Twig.js'},
                    key: 'name'
                }).should.be.fulfilledWith('Twig.js');
            });

            it('should call function of attribute of an object', async function () {
                const testTemplate = twig({data: '{{ attribute(obj, key, params) }}'});

                return testTemplate.render({
                    obj: {
                        name(first, last) {
                            return first + '.' + last;
                        }
                    },
                    key: 'name',
                    params: ['Twig', 'js']
                }).should.be.fulfilledWith('Twig.js');
            });

            it('should return undefined for missing attribute of an object', async function () {
                const testTemplate = twig({data: '{{ attribute(obj, key, params) }}'});

                return testTemplate.render({
                    obj: {
                        name(first, last) {
                            return first + '.' + last;
                        }
                    },
                    key: 'missing',
                    params: ['Twig', 'js']
                }).should.be.fulfilledWith('');
            });

            it('should return element of an array', async function () {
                const testTemplate = twig({data: '{{ attribute(arr, 0) }}'});

                return testTemplate.render({
                    arr: ['Twig', 'js']
                }).should.be.fulfilledWith('Twig');
            });

            it('should return undef for array beyond index size', async function () {
                const testTemplate = twig({data: '{{ attribute(arr, 100) }}'});

                return testTemplate.render({
                    arr: ['Twig', 'js']
                }).should.be.fulfilledWith('');
            });
        });
        describe('template_from_string ->', function () {
            it('should load a template from a string', async function () {
                const testTemplate = twig({data: '{% include template_from_string("{{ value }}") %}'});

                return testTemplate.render({
                    value: 'test'
                }).should.be.fulfilledWith('test');
            });
            it('should load a template from a variable', async function () {
                const testTemplate = twig({data: '{% include template_from_string(template) %}'});

                return testTemplate.render({
                    template: '{{ value }}',
                    value: 'test'
                }).should.be.fulfilledWith('test');
            });
        });

        describe('random ->', function () {
            this.timeout(500);

            it('should return a random item from a traversable or array', async function () {
                const arr = 'bcdefghij'.split('');

                const templates = [];
                for (let i = 1; i <= 1000; i++) {
                    templates.push(
                        twig({data: '{{ random(arr) }}'})
                    );
                }

                return awaity.map(templates, async testTemplate => {
                    const result = await testTemplate.render({arr});
                    arr.should.containEql(result);
                });
            });

            it('should return a random character from a string', async function () {
                const str = 'abcdefghij';

                const templates = [];
                for (let i = 1; i <= 1000; i++) {
                    templates.push(
                        twig({data: '{{ random(str) }}'})
                    );
                }

                return awaity.map(templates, async testTemplate => {
                    const result = await testTemplate.render({str});
                    str.should.containEql(result);
                });
            });

            it('should return a random integer between 0 and the integer parameter', function () {
                const templates = [];
                for (let i = 1; i <= 1000; i++) {
                    templates.push(
                        twig({data: '{{ random(10) }}'})
                    );
                }

                return awaity.map(templates, async testTemplate => {
                    const result = await testTemplate.render();
                    result.should.be.within(0, 10);
                });
            });

            it('should return a random integer between 0 and 2147483647 when no parameters are passed', function () {
                const templates = [];
                for (let i = 1; i <= 1000; i++) {
                    templates.push(
                        twig({data: '{{ random() }}'})
                    );
                }

                return awaity.map(templates, async testTemplate => {
                    const result = await testTemplate.render();
                    result.should.be.within(0, 2147483647);
                });
            });
        });

        describe('min, max ->', function () {
            it('should support the \'min\' function', async function () {
                return mapTestDataToAssertions(
                    [
                        '{{ min(2, 1, 3, 5, 4) }}',
                        '{{ min([2, 1, 3, 5, 4]) }}',
                        '{{ min({2:"two", 1:"one", 3:"three", 5:"five", 4:"four"}) }}'
                    ],
                    [
                        '1',
                        '1',
                        'five'
                    ]
                );
            });

            it('should support the \'max\' function', async function () {
                return mapTestDataToAssertions(
                    [
                        '{{ max([2, 1, 3, 5, 4]) }}',
                        '{{ max(2, 1, 3, 5, 4) }}',
                        '{{ max({2:"two", 1:"one", 3:"three", 5:"five", 4:"four"}) }}'
                    ],
                    [
                        '5',
                        '5',
                        'two'
                    ]
                );
            });
        });

        describe('source ->', function () {
            it('should allow loading an absolute path', async function () {
                const testTemplate = twig({data: '{{ source("' + path.join(__dirname, '/templates/simple.twig') + '") }}'});
                return testTemplate.render().should.be.fulfilledWith('Twig.js!');
            });

            it('should allow loading relative paths', async function () {
                const testTemplate = twig({data: '{{ source("test/templates/simple.twig") }}'});
                return testTemplate.render().should.be.fulfilledWith('Twig.js!');
            });
        });
    });
});
