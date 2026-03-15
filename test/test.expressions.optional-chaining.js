const Twig = require('..').factory();

const {twig} = Twig;

describe('Twig.js Expression -> Optional Chaining (?.) ->', function () {
    describe('Basic property access ->', function () {
        it('should return undefined when accessing property of null', function () {
            const testTemplate = twig({data: '{{ a?.prop }}'});
            const output = testTemplate.render({a: null});

            output.should.equal('');
        });

        it('should return undefined when accessing property of undefined', function () {
            const testTemplate = twig({data: '{{ a?.prop }}'});
            const output = testTemplate.render({a: undefined});

            output.should.equal('');
        });

        it('should return property value when object exists', function () {
            const testTemplate = twig({data: '{{ a?.prop }}'});
            const output = testTemplate.render({a: {prop: 'value'}});

            output.should.equal('value');
        });

        it('should return undefined when property does not exist', function () {
            const testTemplate = twig({data: '{{ a?.prop }}'});
            const output = testTemplate.render({a: {other: 'value'}});

            output.should.equal('');
        });
    });

    describe('Nested property access ->', function () {
        it('should return value when all levels exist', function () {
            const testTemplate = twig({data: '{{ a?.b?.c?.d }}'});
            const output = testTemplate.render({a: {b: {c: {d: 'deep'}}}});

            output.should.equal('deep');
        });

        it('should stop at first null and return undefined', function () {
            const testTemplate = twig({data: '{{ a?.b?.c?.d }}'});
            const output = testTemplate.render({a: {b: null, c: {d: 'deep'}}});

            output.should.equal('');
        });

        it('should stop at first undefined and return undefined', function () {
            const testTemplate = twig({data: '{{ a?.b?.c?.d }}'});
            const output = testTemplate.render({a: {b: {c: undefined, d: 'deep'}}});

            output.should.equal('');
        });

        it('should stop at undefined in nested chain', function () {
            const testTemplate = twig({data: '{{ a?.b?.c }}'});
            const output = testTemplate.render({a: {b: undefined}});

            output.should.equal('');
        });

        it('should handle deeply nested chains (5 levels)', function () {
            const testTemplate = twig({data: '{{ a?.b?.c?.d?.e }}'});
            const output = testTemplate.render({a: {b: {c: {d: {e: 'deep'}}}}});

            output.should.equal('deep');
        });

        it('should stop at null in deeply nested chains', function () {
            const testTemplate = twig({data: '{{ a?.b?.c?.d?.e }}'});
            const output = testTemplate.render({a: {b: {c: null, d: {e: 'deep'}}}});

            output.should.equal('');
        });
    });

    describe('Array element access ->', function () {
        it('should return element when index exists', function () {
            const testTemplate = twig({data: '{{ a?.[0] }}'});
            const output = testTemplate.render({a: ['first', 'second', 'third']});

            output.should.equal('first');
        });

        it('should return undefined when accessing out of bounds', function () {
            const testTemplate = twig({data: '{{ a?.[10] }}'});
            const output = testTemplate.render({a: ['first', 'second']});

            output.should.equal('');
        });

        it('should return undefined when accessing negative index', function () {
            const testTemplate = twig({data: '{{ a?.[-1] }}'});
            const output = testTemplate.render({a: ['first', 'second']});

            output.should.equal('');
        });

        it('should return undefined when accessing non-numeric index', function () {
            const testTemplate = twig({data: '{{ a?.["test"] }}'});
            const output = testTemplate.render({a: ['first', 'second']});

            output.should.equal('');
        });

        it('should return undefined when array is null', function () {
            const testTemplate = twig({data: '{{ a?.[0] }}'});
            const output = testTemplate.render({a: null});

            output.should.equal('');
        });

        it('should return undefined when array is undefined', function () {
            const testTemplate = twig({data: '{{ a?.[0] }}'});
            const output = testTemplate.render({a: undefined});

            output.should.equal('');
        });

        it('should work with nested arrays', function () {
            const testTemplate = twig({data: '{{ a?.[0]?.[1] }}'});
            const output = testTemplate.render({a: [[1, 2, 3], [4, 5, 6]]});

            output.should.equal('2');
        });

        it('should stop at null in nested arrays', function () {
            const testTemplate = twig({data: '{{ a?.[0]?.[1] }}'});
            const output = testTemplate.render({a: [null, [4, 5, 6]]});

            output.should.equal('');
        });

        it('should stop at undefined in nested arrays', function () {
            const testTemplate = twig({data: '{{ a?.[0]?.[1] }}'});
            const output = testTemplate.render({a: [undefined, [4, 5, 6]]});

            output.should.equal('');
        });
    });

    describe('Method calls ->', function () {
        it('should call method when object exists', function () {
            const testTemplate = twig({data: '{{ a?.toUpperCase() }}'});
            const output = testTemplate.render({a: 'hello'});

            output.should.equal('HELLO');
        });

        it('should support optional call method when object exists', function () {
            const testTemplate = twig({data: '{{ a?.toUpperCase?.() }}'});
            const output = testTemplate.render({a: 'hello'});

            output.should.equal('HELLO');
        });

        it('should return undefined when object is null', function () {
            const testTemplate = twig({data: '{{ a?.toUpperCase() }}'});
            const output = testTemplate.render({a: null});

            output.should.equal('');
        });

        it('should return undefined when object is undefined', function () {
            const testTemplate = twig({data: '{{ a?.toUpperCase() }}'});
            const output = testTemplate.render({a: undefined});

            output.should.equal('');
        });

        it('should return undefined when method does not exist', function () {
            const testTemplate = twig({data: '{{ a?.nonExistentMethod() }}'});
            const output = testTemplate.render({a: 'hello'});

            output.should.equal('');
        });

        it('should support optional call syntax on a missing method', function () {
            const testTemplate = twig({data: '{{ a.toCamelCase?.() }}'});
            const output = testTemplate.render({a: 'hello'});

            output.should.equal('');
        });

        it('should work with nested method calls', function () {
            const testTemplate = twig({data: '{{ a?.b?.c?.toUpperCase() }}'});
            const output = testTemplate.render({a: {b: {c: 'hello'}}});

            output.should.equal('HELLO');
        });

        it('should stop at null in nested method calls', function () {
            const testTemplate = twig({data: '{{ a?.b?.c?.toUpperCase() }}'});
            const output = testTemplate.render({a: {b: null, c: 'hello'}});

            output.should.equal('');
        });

        it('should work with method that takes parameters', function () {
            const testTemplate = twig({data: '{{ a?.replace("e", "3") }}'});
            const output = testTemplate.render({a: 'hello'});

            output.should.equal('h3llo');
        });

        it('should work with built-in functions after optional chaining', function () {
            const testTemplate = twig({data: '{{ a?.length }}'});
            const output = testTemplate.render({a: 'hello'});

            output.should.equal('5');
        });

        it('should work with array methods', function () {
            const testTemplate = twig({data: '{{ a?.slice(0, 1) }}'});
            const output = testTemplate.render({a: ['first', 'second', 'third']});

            output.should.equal('first');
        });

        it('should return undefined when array method called on null', function () {
            const testTemplate = twig({data: '{{ a?.slice?.length }}'});
            const output = testTemplate.render({a: null});

            output.should.equal('');
        });

        it('should work with array method on nested array', function () {
            const testTemplate = twig({data: '{{ a?.[0]?.slice(1) }}'});
            const output = testTemplate.render({a: ['abc', 'def', 'ghi']});

            output.should.equal('bc');
        });
    });

    describe('Filters after optional chaining ->', function () {
        it('should apply filter when object exists', function () {
            const testTemplate = twig({data: '{{ a?.value | upper }}'});
            const output = testTemplate.render({a: {value: 'hello'}});

            output.should.equal('HELLO');
        });

        it('should return undefined when object is null', function () {
            const testTemplate = twig({data: '{{ a?.value | upper }}'});
            const output = testTemplate.render({a: null});

            output.should.equal('');
        });

        it('should apply filter on array elements', function () {
            const testTemplate = twig({data: '{{ a?.[0] | upper }}'});
            const output = testTemplate.render({a: ['hello', 'world']});

            output.should.equal('HELLO');
        });

        it('should return undefined when array is null', function () {
            const testTemplate = twig({data: '{{ a?.[0] | upper }}'});
            const output = testTemplate.render({a: null});

            output.should.equal('');
        });

        it('should work with nested optional chaining and filters', function () {
            const testTemplate = twig({data: '{{ a?.b?.c | upper }}'});
            const output = testTemplate.render({a: {b: {c: 'hello'}}});

            output.should.equal('HELLO');
        });

        it('should stop at null in nested optional chaining with filters', function () {
            const testTemplate = twig({data: '{{ a?.b?.c | upper }}'});
            const output = testTemplate.render({a: {b: null, c: 'hello'}});

            output.should.equal('');
        });

        it('should apply default filter after optional chaining', function () {
            const testTemplate = twig({data: '{{ a?.value | default("N/A") }}'});
            const output = testTemplate.render({a: {value: 'hello'}});

            output.should.equal('hello');
        });

        it('should use default filter value when optional chaining returns undefined', function () {
            const testTemplate = twig({data: '{{ a?.value | default("N/A") }}'});
            const output = testTemplate.render({a: null});

            output.should.equal('N/A');
        });
    });

    describe('Combination of optional chaining ->', function () {
        it('should work with property and method call', function () {
            const testTemplate = twig({data: '{{ a?.b?.toUpperCase() }}'});
            const output = testTemplate.render({a: {b: 'hello'}});

            output.should.equal('HELLO');
        });

        it('should work with array and property access', function () {
            const testTemplate = twig({data: '{{ a?.[0]?.prop }}'});
            const output = testTemplate.render({a: [{prop: 'value'}]});

            output.should.equal('value');
        });

        it('should work with array and method call', function () {
            const testTemplate = twig({data: '{{ a?.[0]?.toUpperCase() }}'});
            const output = testTemplate.render({a: ['hello']});

            output.should.equal('HELLO');
        });

        it('should handle empty string gracefully', function () {
            const testTemplate = twig({data: '{{ a?.b?.c }}'});
            const output = testTemplate.render({a: {b: {c: ''}}});

            output.should.equal('');
        });

        it('should handle zero value', function () {
            const testTemplate = twig({data: '{{ a?.b?.c }}'});
            const output = testTemplate.render({a: {b: {c: 0}}});

            output.should.equal('0');
        });

        it('should handle false value', function () {
            const testTemplate = twig({data: '{{ a?.b?.c }}'});
            const output = testTemplate.render({a: {b: {c: false}}});

            output.should.equal('false');
        });

        it('should handle number value', function () {
            const testTemplate = twig({data: '{{ a?.b?.c }}'});
            const output = testTemplate.render({a: {b: {c: 42}}});

            output.should.equal('42');
        });

        it('should handle boolean true value', function () {
            const testTemplate = twig({data: '{{ a?.b?.c }}'});
            const output = testTemplate.render({a: {b: {c: true}}});

            output.should.equal('true');
        });

        it('should handle null value', function () {
            const testTemplate = twig({data: '{{ a?.b?.c }}'});
            const output = testTemplate.render({a: {b: {c: null}}});

            output.should.equal('');
        });

        it('should handle undefined value', function () {
            const testTemplate = twig({data: '{{ a?.b?.c }}'});
            const output = testTemplate.render({a: {b: {c: undefined}}});

            output.should.equal('');
        });
    });

    describe('Optional chaining with if conditions ->', function () {
        it('should work in conditional context', function () {
            const testTemplate = twig({data: '{% if a?.b?.c %}exists{% else %}empty{% endif %}'});
            const output = testTemplate.render({a: {b: {c: 'yes'}}});

            output.should.equal('exists');
        });

        it('should work with if condition for undefined', function () {
            const testTemplate = twig({data: '{% if a?.b?.c %}exists{% else %}empty{% endif %}'});
            const output = testTemplate.render({a: {b: {c: undefined}}});

            output.should.equal('empty');
        });

        it('should work with if condition for null', function () {
            const testTemplate = twig({data: '{% if a?.b?.c %}exists{% else %}empty{% endif %}'});
            const output = testTemplate.render({a: {b: {c: null}}});

            output.should.equal('empty');
        });

        it('should work with if condition for empty string', function () {
            const testTemplate = twig({data: '{% if a?.b?.c %}exists{% else %}empty{% endif %}'});
            const output = testTemplate.render({a: {b: {c: ''}}});

            output.should.equal('empty');
        });

        it('should work with if condition for zero (treated as falsy)', function () {
            const testTemplate = twig({data: '{% if a?.b?.c %}exists{% else %}empty{% endif %}'});
            const output = testTemplate.render({a: {b: {c: 0}}});

            output.should.equal('empty');
        });

        it('should work with if condition for false', function () {
            const testTemplate = twig({data: '{% if a?.b?.c %}exists{% else %}empty{% endif %}'});
            const output = testTemplate.render({a: {b: {c: false}}});

            output.should.equal('empty');
        });

        it('should work with if condition for true', function () {
            const testTemplate = twig({data: '{% if a?.b?.c %}exists{% else %}empty{% endif %}'});
            const output = testTemplate.render({a: {b: {c: true}}});

            output.should.equal('exists');
        });

        it('should work with if condition for nested null', function () {
            const testTemplate = twig({data: '{% if a?.b?.c %}exists{% else %}empty{% endif %}'});
            const output = testTemplate.render({a: {b: null}});

            output.should.equal('empty');
        });

        it('should work with nested if conditions', function () {
            const testTemplate = twig({data: '{% if a?.b %}has b{% else %}no b{% endif %} {% if a?.c %}has c{% else %}no c{% endif %}'});
            const output = testTemplate.render({a: {b: 'yes', c: 'yes'}});

            output.should.equal('has b has c');
        });

        it('should work with nested if conditions with null', function () {
            const testTemplate = twig({data: '{% if a?.b %}has b{% else %}no b{% endif %} {% if a?.c %}has c{% else %}no c{% endif %}'});
            const output = testTemplate.render({a: {b: 'yes', c: null}});

            output.should.equal('has b no c');
        });
    });

    describe('Optional chaining with null-coalescing operator ->', function () {
        it('should work with null-coalescing operator', function () {
            const testTemplate = twig({data: '{{ a?.b ?? "default" }}'});
            const output = testTemplate.render({a: {b: 'value'}});

            output.should.equal('value');
        });

        it('should use default when optional chaining returns undefined', function () {
            const testTemplate = twig({data: '{{ a?.b ?? "default" }}'});
            const output = testTemplate.render({a: null});

            output.should.equal('default');
        });

        it('should work with nested null-coalescing', function () {
            const testTemplate = twig({data: '{{ a?.b?.c ?? "default" }}'});
            const output = testTemplate.render({a: {b: {c: 'value'}}});

            output.should.equal('value');
        });

        it('should use default when nested chain has null', function () {
            const testTemplate = twig({data: '{{ a?.b?.c ?? "default" }}'});
            const output = testTemplate.render({a: {b: null}});

            output.should.equal('default');
        });

        it('should use default when nested chain has undefined', function () {
            const testTemplate = twig({data: '{{ a?.b?.c ?? "default" }}'});
            const output = testTemplate.render({a: {b: undefined}});

            output.should.equal('default');
        });

        it('should work with multiple optional chaining and null-coalescing', function () {
            const testTemplate = twig({data: '{{ a?.b?.c?.d ?? "default" }}'});
            const output = testTemplate.render({a: {b: {c: {d: 'value'}}}});

            output.should.equal('value');
        });

        it('should use default when deeply nested chain has null', function () {
            const testTemplate = twig({data: '{{ a?.b?.c?.d ?? "default" }}'});
            const output = testTemplate.render({a: {b: {c: null}}});

            output.should.equal('default');
        });

        it('should work with null-coalescing on array access', function () {
            const testTemplate = twig({data: '{{ a?.[0] ?? "default" }}'});
            const output = testTemplate.render({a: ['value']});

            output.should.equal('value');
        });

        it('should use default when array access is null', function () {
            const testTemplate = twig({data: '{{ a?.[0] ?? "default" }}'});
            const output = testTemplate.render({a: [null]});

            output.should.equal('default');
        });

        it('should work with chained null-coalescing', function () {
            const testTemplate = twig({data: '{{ a?.b ?? c?.d ?? "default" }}'});
            const output = testTemplate.render({a: {b: 'value'}, c: {d: 'fallback'}});

            output.should.equal('value');
        });

        it('should use second default when first optional chaining returns value', function () {
            const testTemplate = twig({data: '{{ a?.b ?? c?.d ?? "default" }}'});
            const output = testTemplate.render({a: {b: 'value'}, c: null});

            output.should.equal('value');
        });

        it('should use second default when first optional chaining returns undefined', function () {
            const testTemplate = twig({data: '{{ a?.b ?? c?.d ?? "default" }}'});
            const output = testTemplate.render({a: {b: undefined}, c: {d: 'fallback'}});

            output.should.equal('fallback');
        });

        it('should use final default when all optional chaining return undefined', function () {
            const testTemplate = twig({data: '{{ a?.b ?? c?.d ?? "default" }}'});
            const output = testTemplate.render({a: null, c: null});

            output.should.equal('default');
        });
    });

    describe('Optional chaining with ternary operator ->', function () {
        it('should work with ternary operator', function () {
            const testTemplate = twig({data: '{{ a?.b ? "exists" : "does not exist" }}'});
            const output = testTemplate.render({a: {b: 'value'}});

            output.should.equal('exists');
        });

        it('should work with ternary for undefined', function () {
            const testTemplate = twig({data: '{{ a?.b ? "exists" : "does not exist" }}'});
            const output = testTemplate.render({a: null});

            output.should.equal('does not exist');
        });

        it('should work with ternary for null', function () {
            const testTemplate = twig({data: '{{ a?.b ? "exists" : "does not exist" }}'});
            const output = testTemplate.render({a: {b: null}});

            output.should.equal('does not exist');
        });

        it('should work with ternary for zero (treated as falsy)', function () {
            const testTemplate = twig({data: '{{ a?.b ? "exists" : "does not exist" }}'});
            const output = testTemplate.render({a: {b: 0}});

            output.should.equal('does not exist');
        });

        it('should work with ternary for false (falsy)', function () {
            const testTemplate = twig({data: '{{ a?.b ? "exists" : "does not exist" }}'});
            const output = testTemplate.render({a: {b: false}});

            output.should.equal('does not exist');
        });

        it('should work with ternary for true (truthy)', function () {
            const testTemplate = twig({data: '{{ a?.b ? "exists" : "does not exist" }}'});
            const output = testTemplate.render({a: {b: true}});

            output.should.equal('exists');
        });

        it('should work with ternary for empty string (falsy)', function () {
            const testTemplate = twig({data: '{{ a?.b ? "exists" : "does not exist" }}'});
            const output = testTemplate.render({a: {b: ''}});

            output.should.equal('does not exist');
        });

        it('should work with ternary for empty array (falsy)', function () {
            const testTemplate = twig({data: '{{ a?.b ? "exists" : "does not exist" }}'});
            const output = testTemplate.render({a: {b: []}});

            output.should.equal('does not exist');
        });

        it('should work with ternary for empty object (truthy)', function () {
            const testTemplate = twig({data: '{{ a?.b ? "exists" : "does not exist" }}'});
            const output = testTemplate.render({a: {b: {}}});

            output.should.equal('exists');
        });
    });

    describe('Optional chaining with computed property access ->', function () {
        it('should work with computed property access', function () {
            const testTemplate = twig({data: '{{ a?.["key"] }}'});
            const output = testTemplate.render({a: {key: 'value'}});

            output.should.equal('value');
        });

        it('should work with dynamic key in computed property access', function () {
            const testTemplate = twig({data: '{{ a?.[key] }}'});
            const output = testTemplate.render({a: {prop: 'value'}, key: 'prop'});

            output.should.equal('value');
        });

        it('should stop at null in computed property access', function () {
            const testTemplate = twig({data: '{{ a?.[key] }}'});
            const output = testTemplate.render({a: null, key: 'prop'});

            output.should.equal('');
        });

        it('should stop at undefined in computed property access', function () {
            const testTemplate = twig({data: '{{ a?.[key] }}'});
            const output = testTemplate.render({a: undefined, key: 'prop'});

            output.should.equal('');
        });

        it('should work with computed property in nested chain', function () {
            const testTemplate = twig({data: '{{ a?.[key]?.[nested] }}'});
            const output = testTemplate.render({a: {prop: {test: 'value'}}, key: 'prop', nested: 'test'});

            output.should.equal('value');
        });

        it('should work with computed property accessing array', function () {
            const testTemplate = twig({data: '{{ a?.[index] }}'});
            const output = testTemplate.render({a: ['first', 'second', 'third'], index: 1});

            output.should.equal('second');
        });
    });

    describe('Strict variables mode with optional chaining ->', function () {
        it('should throw error for missing key in strict mode', function () {
            const testTemplate = twig({data: '{{ a?.b }}', options: {strictVariables: true}});
            try {
                testTemplate.render({a: {}});
            } catch (error) {
                error.message.should.match(/does not exist/);
            }
        });

        it('should not throw for null in strict mode', function () {
            const testTemplate = twig({data: '{{ a?.b }}', options: {strictVariables: true}});
            const output = testTemplate.render({a: null});

            output.should.equal('');
        });

        it('should not throw for undefined in strict mode', function () {
            const testTemplate = twig({data: '{{ a?.b }}', options: {strictVariables: true}});
            const output = testTemplate.render({a: undefined});

            output.should.equal('');
        });

        it('should not throw for null in nested chain in strict mode', function () {
            const testTemplate = twig({data: '{{ a?.b?.c }}', options: {strictVariables: true}});
            const output = testTemplate.render({a: {b: null}});

            output.should.equal('');
        });

        it('should not throw for undefined in nested chain in strict mode', function () {
            const testTemplate = twig({data: '{{ a?.b?.c }}', options: {strictVariables: true}});
            const output = testTemplate.render({a: {b: undefined}});

            output.should.equal('');
        });
    });

    describe('Optional chaining in loops ->', function () {
        it('should work in for loop', function () {
            const testTemplate = twig({data: '{% for item in a?.items %}{{ item }},{% endfor %}'});
            const output = testTemplate.render({a: {items: ['a', 'b', 'c']}});

            output.should.equal('a,b,c,');
        });

        it('should handle null in for loop', function () {
            const testTemplate = twig({data: '{% for item in a?.items %}{{ item }},{% endfor %}'});
            const output = testTemplate.render({a: {items: null}});

            output.should.equal('');
        });

        it('should handle undefined in for loop', function () {
            const testTemplate = twig({data: '{% for item in a?.items %}{{ item }},{% endfor %}'});
            const output = testTemplate.render({a: {items: undefined}});

            output.should.equal('');
        });

        it('should work with nested optional chaining in for loop', function () {
            const testTemplate = twig({data: '{% for item in a?.items %}{{ item?.name }},{% endfor %}'});
            const output = testTemplate.render({a: {items: [{name: 'first'}, {name: 'second'}]}});

            output.should.equal('first,second,');
        });

        it('should handle null items in for loop', function () {
            const testTemplate = twig({data: '{% for item in a?.items %}{{ item?.name }},{% endfor %}'});
            const output = testTemplate.render({a: {items: [null, {name: 'second'}]}});

            output.should.equal(',second,');
        });
    });
});
