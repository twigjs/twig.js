var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Async ->", function() {

    // Add some test functions to work with
    Twig.extendFunction("echoAsync", function(a) {
        return Promise.resolve(a);
    });

    Twig.extendFilter('asyncUpper', function(txt) {
        return Promise.resolve(txt.toUpperCase());
    });

    Twig.extendFilter('rejectAsync', function(txt) {
        return Promise.reject(new Error('async error test'));
    });

    it("should throw when detecting async behaviour in sync mode", function() {
        try {
            return twig({
                data: '{{ echoAsync("hello world") }}'
            }).render();
        } catch(err) {
            err.message.should.equal('You are using Twig.js in sync mode in combination with async extensions.');
        }
    });

    describe("Functions ->", function() {
        it("should handle functions that return promises", function() {
            return twig({
                data: '{{ echoAsync("hello world") }}'
            }).renderAsync()
            .then(function(output) {
                output.should.equal("hello world");
            });
        });
        it("should handle functions that return rejected promises", function() {
            return twig({
                data: '{{ rejectAsync("hello world") }}',
                rethrow: true
            }).renderAsync({
                rejectAsync: function() {
                    return Promise.reject(new Error('async error test'));
                }
            })
            .then(function(output) {
                throw new Error('should not resolve');
            }, function(err) {
                err.message.should.equal('async error test');
            });
        });
    });

    describe("Filters ->", function() {
        it("should handle filters that return promises", function() {
            return twig({
                data: '{{ "hello world"|asyncUpper }}'
            }).renderAsync()
            .then(function(output) {
                output.should.equal("HELLO WORLD");
            });
        });
        it("should handle filters that return rejected promises", function() {
            return twig({
                data: '{{ "hello world"|rejectAsync }}',
                rethrow: true
            }).renderAsync()
            .then(function(output) {
                throw new Error('should not resolve');
            }, function(err) {
                err.message.should.equal('async error test');
            });
        });
    })

    describe("Logic ->", function() {
        it("should handle logic containing async functions", function() {
            return twig({
                data: 'hello{% if incrAsync(10) > 10 %} world{% endif %}'
            }).renderAsync({
                incrAsync: function(nr) {
                    return Promise.resolve(nr + 1);
                }
            })
            .then(function(output) {
                output.should.equal("hello world");
            });
        });
        it("should set variables to return value of promise", function() {
            return twig({
                data: '{% set name = readName() %}hello {{ name }}',
                rethrow: true
            }).renderAsync({
                readName: function() {
                    return Promise.resolve('john');
                }
            })
            .then(function(output) {
                output.should.equal('hello john');
            });
        });
    });

    describe("Macros ->", function() {
        it("should handle macros with async content correctly", function() {
            var tpl = '{% macro test(asyncIn, syncIn) %}{{asyncIn}}-{{syncIn}}{% endmacro %}' +
                '{% import _self as m %}' +
                '{{ m.test(echoAsync("hello"), "world") }}';

            return twig({
                data: tpl
            })
            .renderAsync()
            .then(function(output) {
                output.should.equal('hello-world');
            });
        });
    });

});
