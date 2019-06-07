const Twig = require('../twig').factory();

const {twig} = Twig;

const {mapTestDataToAssertions} = require('./helpers')(twig);

describe('Twig.js Filters ->', function () {
    // Encodings
    describe('url_encode ->', function () {
        it('should encode URLs', async function () {
            const testTemplate = twig({data: '{{ "http://google.com/?q=twig.js"|url_encode() }}'});
            return testTemplate.render().should.be.fulfilledWith('http%3A%2F%2Fgoogle.com%2F%3Fq%3Dtwig.js');
        });
        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|url_encode() }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });
        it('should handle special characters', async function () {
            const data = {foo: '<foo> \\&"\'.,-_?/Ķä€台北[]{}\t\r\n\b\u0080'};
            const testTemplate = twig({data: '{{ foo|url_encode() }}'});
            return testTemplate.render(data).should.be.fulfilledWith('%3Cfoo%3E%20%5C%26%22%27.%2C-_%3F%2F%C4%B6%C3%A4%E2%82%AC%E5%8F%B0%E5%8C%97%5B%5D%7B%7D%09%0D%0A%08%C2%80');
        });
        it('should encode objects to url', async function () {
            const testTemplate = twig({data: '{{ ({ a: "customer@example.com", b: { c: 123, d: [1, 2, 3] } })|url_encode }}'});
            return testTemplate.render().should.be.fulfilledWith('a=customer%40example.com&amp;b%5Bc%5D=123&amp;b%5Bd%5D%5B0%5D=1&amp;b%5Bd%5D%5B1%5D=2&amp;b%5Bd%5D%5B2%5D=3');
        });
    });
    describe('json_encode ->', function () {
        it('should encode strings to json', async function () {
            const testTemplate = twig({data: '{{ test|json_encode }}'});
            return testTemplate.render({test: 'value'}).should.be.fulfilledWith('"value"');
        });
        it('should encode numbers to json', async function () {
            const testTemplate = twig({data: '{{ test|json_encode }}'});
            return testTemplate.render({test: 21}).should.be.fulfilledWith('21');
        });
        it('should encode arrays to json', async function () {
            const testTemplate = twig({data: '{{ [1,"b",3]|json_encode }}'});
            return testTemplate.render().should.be.fulfilledWith('[1,"b",3]');
        });
        it('should encode objects to json', async function () {
            const testTemplate = twig({data: '{{ {"a":[1,"b",3]}|json_encode }}'});
            return testTemplate.render().should.be.fulfilledWith('{"a":[1,"b",3]}');
        });
        it('should retain key order in an object', async function () {
            const testTemplate = twig({data: '{{ { "foo": 1, "bar": 2, "baz": 3 }|json_encode }}'});
            return testTemplate.render().should.be.fulfilledWith('{"foo":1,"bar":2,"baz":3}');
        });
        it('should not add additional information to objects', async function () {
            const testTemplate = twig({data: '{{ { "foo": 1, "bar": [1, 2, 3], "baz": { "a": "a", "b": "b" } }|json_encode }}'});
            return testTemplate.render().should.be.fulfilledWith('{"foo":1,"bar":[1,2,3],"baz":{"a":"a","b":"b"}}');
        });
        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|json_encode }}'});
            return testTemplate.render().should.be.fulfilledWith('null');
        });
        it('should encode dates correctly', async function () {
            const testTemplate = twig({data: '{{ test|json_encode }}'});
            const data = {a: new Date('2011-10-10')};
            return testTemplate.render({test: data}).should.be.fulfilledWith('{"a":"2011-10-10T00:00:00.000Z"}');
        });
    });

    // String manipulation
    describe('upper ->', function () {
        it('should convert text to uppercase', async function () {
            const testTemplate = twig({data: '{{ "hello"|upper }}'});
            return testTemplate.render().should.be.fulfilledWith('HELLO');
        });
        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|upper }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });
    });
    describe('lower ->', function () {
        it('should convert text to lowercase', async function () {
            const testTemplate = twig({data: '{{ "HELLO"|lower }}'});
            return testTemplate.render().should.be.fulfilledWith('hello');
        });
        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|lower }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });
    });
    describe('capitalize ->', function () {
        it('should capitalize the first word in a string', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ "hello world"|capitalize }}',
                    '{{ "HELLO WORLD"|capitalize }}'
                ],
                ['Hello world', 'Hello world']
            );
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|capitalize }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });
    });
    describe('title ->', function () {
        it('should capitalize all the words in a string', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ "hello world"|title }}',
                    '{{ "HELLO WORLD"|title }}'
                ],
                ['Hello World', 'Hello World']
            );
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|title }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });
    });

    // String/Object/Array check
    describe('length ->', function () {
        it('should determine the length of a string', async function () {
            const testTemplate = twig({data: '{{ "test"|length }}'});
            return testTemplate.render().should.be.fulfilledWith('4');
        });
        it('should determine the length of an array', async function () {
            const testTemplate = twig({data: '{{ [1,2,4,76,"tesrt"]|length }}'});
            return testTemplate.render().should.be.fulfilledWith('5');
        });
        it('should determine the length of an object', async function () {
            const testTemplate = twig({data: '{{ {"a": "b", "c": "1", "test": "test"}|length }}'});
            return testTemplate.render().should.be.fulfilledWith('3');
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|length }}'});
            return testTemplate.render().should.be.fulfilledWith('0');
        });
    });

    // Array/object manipulation
    describe('sort ->', function () {
        it('should sort an array', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ [1,5,2,7]|sort }}',
                    '{{ ["test","abc",2,7]|sort }}'
                ],
                ['1,2,5,7', '2,7,abc,test']
            );
        });
        it('should sort an object', async function () {
            return mapTestDataToAssertions(
                [
                    '{% set obj =  {\'c\': 1,\'d\': 5,\'t\': 2,\'e\':7}|sort %}{% for key,value in obj|sort %}{{key}}:{{value}} {%endfor %}',
                    '{% set obj = {\'m\':\'test\',\'z\':\'abc\',\'a\':2,\'y\':7} %}{% for key,value in obj|sort %}{{key}}:{{value}} {%endfor %}',
                    '{% set obj = {\'z\':\'abc\',\'a\':2,\'y\':7,\'m\':\'test\'} %}{% for key,value in obj|sort %}{{key}}:{{value}} {%endfor %}'
                ],
                [
                    'c:1 t:2 d:5 e:7 ',
                    'a:2 y:7 z:abc m:test ',
                    'a:2 y:7 z:abc m:test '
                ]
            );
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{% set obj = undef|sort %}{% for key, value in obj|sort %}{{key}}:{{value}}{%endfor%}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });
    });
    describe('reverse ->', function () {
        it('should reverse an array', async function () {
            const testTemplate = twig({data: '{{ ["a", "b", "c"]|reverse }}'});
            return testTemplate.render().should.be.fulfilledWith('c,b,a');
        });
        it('should reverse an object', async function () {
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|reverse }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });
    });
    describe('keys ->', function () {
        it('should return the keys of an array', async function () {
            const testTemplate = twig({data: '{{ ["a", "b", "c"]|keys }}'});
            return testTemplate.render().should.be.fulfilledWith('0,1,2');
        });
        it('should return the keys of an object', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ {"a": 1, "b": 4, "c": 5}|keys }}',
                    '{{ {"0":"a", "1":"b", "2":"c"}|keys }}'
                ],
                ['a,b,c', '0,1,2']
            );
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|keys }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });
    });
    describe('merge ->', function () {
        it('should merge two objects into an object', async function () {
            // Object merging
            const testTemplate = twig({data: '{% set obj= {"a":"test", "b":"1"}|merge({"b":2,"c":3}) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}'});
            return testTemplate.render().should.be.fulfilledWith('a:test b:2 c:3 ');
        });
        it('should merge two arrays into and array', async function () {
            // Array merging
            const testTemplate = twig({data: '{% set obj= ["a", "b"]|merge(["c", "d"]) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}'});
            return testTemplate.render().should.be.fulfilledWith('0:a 1:b 2:c 3:d ');
        });
        it('should merge an object and an array into an object', async function () {
            return mapTestDataToAssertions(
                [
                    // Mixed merging
                    '{% set obj= ["a", "b"]|merge({"a": "c", "3":4}, ["c", "d"]) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}',
                    // Mixed merging(2)
                    '{% set obj= {"1":"a", "a":"b"}|merge(["c", "d"]) %}{% for key in obj|keys %}{{key}}:{{obj[key]}} {%endfor %}'
                ],
                ['0:a 1:b 3:4 4:c 5:d a:c ', '1:a a:b 2:c 3:d ']
            );
        });
    });
    describe('join ->', function () {
        it('should join all values in an object', async function () {
            const testTemplate = twig({data: '{{ {"a":"1", "b": "b", "c":test}|join("-") }}'});
            return testTemplate.render({test: 't'}).should.be.fulfilledWith('1-b-t');
        });
        it('should joing all values in an array', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ [1,2,4,76]|join }}',
                    '{{ [1+ 5,2,4,76]|join("-" ~ ".") }}'
                ],
                ['12476', '6-.2-.4-.76']
            );
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|join }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });
    });

    // Other
    describe('default ->', function () {
        it('should not provide the default value if a key is defined and not empty', async function () {
            const testTemplate = twig({data: '{{ var|default("Not Defined") }}'});
            return testTemplate.render({var: 'value'}).should.be.fulfilledWith('value');
        });

        it('should provide a default value if a key is not defined', async function () {
            const testTemplate = twig({data: '{{ var|default("Not Defined") }}'});
            return testTemplate.render().should.be.fulfilledWith('Not Defined');
        });

        it('should provide a default value if a value is empty', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ ""|default("Empty String") }}',
                    '{{ var.key|default("Empty Key") }}'
                ],
                ['Empty String', 'Empty Key']
            );
        });

        it('should provide a default value of \'\' if no parameters are passed and a default key is not defined', async function () {
            const testTemplate = twig({data: '{{ var|default }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });

        it('should provide a default value of \'\' if no parameters are passed and a value is empty', async function () {
            return mapTestDataToAssertions(
                [
                    '{{ ""|default }}',
                    '{{ var.key|default }}'
                ],
                ['', ''],
                [undefined, {var: {}}]
            );
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

        // NOTE: these tests are currently timezone dependent
        it('should recognize timestamps', async function () {
            const testTemplate = twig({data: '{{ 27571323556|date("d/m/Y @ H:i:s") }}'});
            const date = new Date(27571323556000); // 13/09/2843 @ 08:59:16 EST

            return testTemplate.render().should.be.fulfilledWith(stringDate(date));
        });

        it('should recognize timestamps, when they are passed as string', async function () {
            const testTemplate = twig({data: '{{ "27571323556"|date("d/m/Y @ H:i:s") }}'});
            const date = new Date(27571323556000); // 13/09/2843 @ 08:59:16 EST

            return testTemplate.render().should.be.fulfilledWith(stringDate(date));
        });

        it('should recognize string date formats', async function () {
            const testTemplate = twig({data: '{{ "Tue Aug 14 08:52:15 +0000 2007"|date("d/m/Y @ H:i:s") }}'});
            const date = new Date(1187081535000); // 14/08/2007 @ 04:52:15 EST

            return testTemplate.render().should.be.fulfilledWith(stringDate(date));
        });

        it('should escape words and characters in the date format (twig:data)]', async function () {
            const testTemplate = twig({data: '{{ "1970-01-01 00:00:00"|date("F jS \\a\\t g:ia") }}'});

            return testTemplate.render().should.be.fulfilledWith('January 1st at 12:00am');
        });

        it('should escape words and characters in the date format (twig:ref)]', async function () {
            await twig({
                id: 'escape-date-format',
                path: 'test/templates/escape-date-format.twig'
            });

            // Load the template
            const testTemplate = twig({ref: 'escape-date-format'});
            return testTemplate.render({}).should.be.fulfilledWith('January 1st at 12:00am');
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|date("d/m/Y @ H:i:s") }}'});
            const date = new Date();
            return testTemplate.render().should.be.fulfilledWith(stringDate(date));
        });

        it('should handle empty strings', async function () {
            const testTemplate = twig({data: '{{ ""|date("d/m/Y @ H:i:s") }}'});
            const date = new Date();
            return testTemplate.render().should.be.fulfilledWith(stringDate(date));
        });

        it('should work with no parameters', async function () {
            const testTemplate = twig({data: '{{ 27571323556|date }}'});
            const expectedTemplate = twig({data: '{{ 27571323556|date("F j, Y H:i") }}'});
            const t = await expectedTemplate.render();
            return testTemplate.render().should.be.fulfilledWith(t);
        });
    });

    describe('replace ->', function () {
        it('should replace strings provided in a map', async function () {
            const testTemplate = twig({data: '{{ "I like %this% and %that%. Seriously, I like %this% and %that%."|replace({"%this%": foo, "%that%": "bar"}) }}'});
            return testTemplate.render({foo: 'foo'}).should.be.fulfilledWith('I like foo and bar. Seriously, I like foo and bar.');
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|replace }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });
    });

    describe('format ->', function () {
        it('should replace formatting tags with parameters', async function () {
            const testTemplate = twig({data: '{{ "I like %s and %s."|format(foo, "bar") }}'});
            return testTemplate.render({foo: 'foo'}).should.be.fulfilledWith('I like foo and bar.');
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|format }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });

        it('should handle positive leading sign without padding', async function () {
            const testTemplate = twig({data: '{{ "I like positive numbers like %+d."|format(123) }}'});
            return testTemplate.render({foo: 'foo'}).should.be.fulfilledWith('I like positive numbers like +123.');
        });

        it('should handle negative leading sign without padding', async function () {
            const testTemplate = twig({data: '{{ "I like negative numbers like %+d."|format(-123) }}'});
            return testTemplate.render({foo: 'foo'}).should.be.fulfilledWith('I like negative numbers like -123.');
        });

        it('should handle positive leading sign with padding zero', async function () {
            const testTemplate = twig({data: '{{ "I like positive numbers like %+05d."|format(123) }}'});
            return testTemplate.render({foo: 'foo'}).should.be.fulfilledWith('I like positive numbers like +0123.');
        });

        it('should handle negative leading sign with padding zero', async function () {
            const testTemplate = twig({data: '{{ "I like negative numbers like %+05d."|format(-123) }}'});
            return testTemplate.render({foo: 'foo'}).should.be.fulfilledWith('I like negative numbers like -0123.');
        });

        it('should handle positive leading sign with padding space', async function () {
            const testTemplate = twig({data: '{{ "I like positive numbers like %+5d."|format(123) }}'});
            return testTemplate.render({foo: 'foo'}).should.be.fulfilledWith('I like positive numbers like  +123.');
        });

        it('should handle negative leading sign with padding space', async function () {
            const testTemplate = twig({data: '{{ "I like negative numbers like %+5d."|format(-123) }}'});
            return testTemplate.render({foo: 'foo'}).should.be.fulfilledWith('I like negative numbers like  -123.');
        });
    });

    describe('striptags ->', function () {
        it('should remove tags from a value', async function () {
            const testTemplate = twig({data: '{{ "<p>Test paragraph.</p><!-- Comment --> <a href=\\"#fragment\\">Other text</a>"|striptags }}'});
            return testTemplate.render().should.be.fulfilledWith('Test paragraph. Other text');
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|striptags }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });
    });

    describe('escape ->', function () {
        it('should convert unsafe characters to HTML entities', async function () {
            const testTemplate = twig({data: '{{ "<p>Test paragraph.</p><!-- Comment --> <a href=\'#fragment\'>Other text</a>"|escape }}'});
            return testTemplate.render().should.be.fulfilledWith('&lt;p&gt;Test paragraph.&lt;/p&gt;&lt;!-- Comment --&gt; &lt;a href=&#039;#fragment&#039;&gt;Other text&lt;/a&gt;');
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|escape }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });

        it('should not escape twice if autoescape is on', async function () {
            const testTemplate = twig({
                autoescape: true,
                data: '{{ value|escape }}'
            });

            return testTemplate.render({
                value: '<test>&</test>'
            }).should.be.fulfilledWith('&lt;test&gt;&amp;&lt;/test&gt;');
        });

        it('should handle the strategy parameter', async function () {
            const data = {foo: '<foo> \\&"\'.,-_?/Ķä€台北[]{}\t\r\n\b\u0080'};

            return mapTestDataToAssertions(
                [
                    'Default: {{ foo|escape }}',
                    'html: {{ foo|escape("html") }}',
                    'js: {{ foo|escape("js") }}',
                    'css: {{ foo|escape("css") }}',
                    'url: {{ foo|escape("url") }}',
                    'html_attr: {{ foo|escape("html_attr") }}'
                ],
                [
                    'Default: &lt;foo&gt; \\&amp;&quot;&#039;.,-_?/Ķä€台北[]{}\t\r\n\b\u0080',
                    'html: &lt;foo&gt; \\&amp;&quot;&#039;.,-_?/Ķä€台北[]{}\t\r\n\b\u0080',
                    'js: \\x3Cfoo\\x3E\\x20\\x5C\\x26\\x22\\x27.,\\x2D_\\x3F\\x2F\\u0136\\u00E4\\u20AC\\u53F0\\u5317\\x5B\\x5D\\x7B\\x7D\\x9\\xD\\xA\\x8\\u0080',
                    'css: \\3C foo\\3E \\20 \\5C \\26 \\22 \\27 \\2E \\2C \\2D \\5F \\3F \\2F \\136 \\E4 \\20AC \\53F0 \\5317 \\5B \\5D \\7B \\7D \\9 \\D \\A \\8 \\80 ',
                    'url: %3Cfoo%3E%20%5C%26%22%27.%2C-_%3F%2F%C4%B6%C3%A4%E2%82%AC%E5%8F%B0%E5%8C%97%5B%5D%7B%7D%09%0D%0A%08%C2%80',
                    'html_attr: &lt;foo&gt;&#x20;&#x5C;&amp;&quot;&#x27;.,-_&#x3F;&#x2F;&#x0136;&#x00E4;&#x20AC;&#x53F0;&#x5317;&#x5B;&#x5D;&#x7B;&#x7D;&#x09;&#x0D;&#x0A;&#xFFFD;&#x0080;'
                ],
                data
            );
        });

        it('should escape strategy != \'html\' if autoescape is on', async function () {
            const testTemplate = twig({
                autoescape: true,
                data: '{{ value|escape("js") }}'
            });

            return testTemplate.render({
                value: '<test>&</test>'
            }).should.be.fulfilledWith('\\x3Ctest\\x3E\\x26\\x3C\\x2Ftest\\x3E');
        });

        it('should not escape twice if autoescape is not html', async function () {
            const testTemplate = twig({
                autoescape: 'js',
                data: '{{ value|escape("js") }}'
            });

            return testTemplate.render({
                value: '<test>&</test>'
            }).should.be.fulfilledWith('\\x3Ctest\\x3E\\x26\\x3C\\x2Ftest\\x3E');
        });

        it('should escape twice if escape strategy is different from autoescape option', async function () {
            const testTemplate = twig({
                autoescape: 'css',
                data: '{{ value|escape("js") }}\n{{ value|escape }}'
            });

            return testTemplate.render({
                value: '<test>&</test>'
            }).should.be.fulfilledWith('\\5C x3Ctest\\5C x3E\\5C x26\\5C x3C\\5C x2Ftest\\5C x3E\n\\26 lt\\3B test\\26 gt\\3B \\26 amp\\3B \\26 lt\\3B \\2F test\\26 gt\\3B ');
        });
    });

    describe('e ->', function () {
        it('should alias escape function with e', async function () {
            const testTemplate = twig({data: '{{ "<p>Test paragraph.</p><!-- Comment --> <a href=\'#fragment\'>Other text</a>"|e }}'});
            return testTemplate.render().should.be.fulfilledWith('&lt;p&gt;Test paragraph.&lt;/p&gt;&lt;!-- Comment --&gt; &lt;a href=&#039;#fragment&#039;&gt;Other text&lt;/a&gt;');
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|e }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });

        it('should not escape twice if autoescape is on', async function () {
            const testTemplate = twig({
                autoescape: true,
                data: '{{ value|e }}'
            });
            return testTemplate.render({
                value: '<test>&</test>'
            }).should.be.fulfilledWith('&lt;test&gt;&amp;&lt;/test&gt;');
        });
    });

    describe('nl2br ->', function () {
        it('should convert newlines into html breaks', async function () {
            const testTemplate = twig({data: '{{ test|nl2br }}'});
            return testTemplate.render({
                test: 'Line 1\r\nLine 2\nLine 3\rLine 4\n\n'
            }).should.be.fulfilledWith('Line 1<br />\nLine 2<br />\nLine 3<br />\nLine 4<br />\n<br />\n');
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|nl2br }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });

        it('should not escape br tags if autoescape is on', async function () {
            const testTemplate = twig({
                autoescape: true,
                data: '{{ test|nl2br }}'
            });

            return testTemplate.render({
                test: '<test>Line 1\nLine2</test>'
            }).should.be.fulfilledWith('&lt;test&gt;Line 1<br />\nLine2&lt;/test&gt;');
        });
    });

    describe('truncate ->', function () {
        it('should truncate string to default size(20) and add default separator', async function () {
            const testTemplate = twig({data: '{{ test|truncate }}'});
            return testTemplate.render({test: '01234567890123456789012345678901234567890123456789'}).should.be.fulfilledWith('012345678901234567890123456789...');
        });

        it('should truncate string to custom size(10) and add default separator', async function () {
            const testTemplate = twig({data: '{{ test|truncate(10) }}'});
            return testTemplate.render({test: '01234567890123456789012345678901234567890123456789'}).should.be.fulfilledWith('0123456789...');
        });

        it('should truncate string to custom size(15) with preserve and add default separator', async function () {
            const testTemplate = twig({data: '{{ test|truncate(15, true) }}'});
            return testTemplate.render({test: '0123456789 0123456789 0123456789 0123456789 0123456789'}).should.be.fulfilledWith('0123456789 0123456789...');
        });

        it('should truncate string to custom size(15) with preserve and add custom(*) separator', async function () {
            const testTemplate = twig({data: '{{ test|truncate(15, true, "*") }}'});
            return testTemplate.render({test: '0123456789 0123456789 0123456789 0123456789 0123456789'}).should.be.fulfilledWith('0123456789 0123456789*');
        });
    });

    describe('trim ->', function () {
        it('should trim whitespace from strings', async function () {
            const testTemplate = twig({data: '{{ test|trim }}'});
            return testTemplate.render({test: '\r\n Test\n  '}).should.be.fulfilledWith('Test');
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|trim }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });

        it('should not autoescape', async function () {
            const testTemplate = twig({data: '{{ test|trim }}'});
            return testTemplate.render({test: '\r\n <a href="">Test</a>\n  '}).should.be.fulfilledWith('<a href="">Test</a>');
        });
    });

    describe('number_format ->', function () {
        it('should round to nearest integer if no parameters', async function () {
            const testTemplate = twig({data: '{{ 1234.56|number_format }}'});
            return testTemplate.render().should.be.fulfilledWith('1,235');
        });
        it('should have customizable precision', async function () {
            const testTemplate = twig({data: '{{ 1234.567890123|number_format(4) }}'});
            return testTemplate.render().should.be.fulfilledWith('1,234.5679');
        });
        it('should have a customizable decimal seperator', async function () {
            const testTemplate = twig({data: '{{ 1234.567890123|number_format(2,",") }}'});
            return testTemplate.render().should.be.fulfilledWith('1,234,57');
        });
        it('should have a customizable thousands seperator', async function () {
            const testTemplate = twig({data: '{{ 1234.5678|number_format(2,","," ") }}'});
            return testTemplate.render().should.be.fulfilledWith('1 234,57');
        });
        it('should handle blank seperators', async function () {
            const testTemplate = twig({data: '{{ 1234.5678|number_format(2,"","") }}'});
            return testTemplate.render().should.be.fulfilledWith('123457');
        });

        it('should handle undefined', async function () {
            const testTemplate = twig({data: '{{ undef|number_format }}'});
            return testTemplate.render().should.be.fulfilledWith('0');
        });
    });

    describe('slice ->', function () {
        it('should slice a string', async function () {
            const testTemplate = twig({data: '{{ \'12345\'|slice(1, 2) }}'});
            return testTemplate.render().should.be.fulfilledWith('23');
        });
        it('should slice a string to the end', async function () {
            const testTemplate = twig({data: '{{ \'12345\'|slice(2) }}'});
            return testTemplate.render().should.be.fulfilledWith('345');
        });
        it('should slice a string from the start', async function () {
            const testTemplate = twig({data: '{{ \'12345\'|slice(null, 2) }}'});
            return testTemplate.render().should.be.fulfilledWith('12');
        });
        it('should slice a string from a negative offset', async function () {
            const testTemplate = twig({data: '{{ \'12345\'|slice(-2, 1) }}'});
            return testTemplate.render().should.be.fulfilledWith('4');
        });
        it('should slice a string from a negative offset to end of string', async function () {
            const testTemplate = twig({data: '{{ \'12345\'|slice(-2) }}'});
            return testTemplate.render().should.be.fulfilledWith('45');
        });

        it('should slice an array', async function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5]|slice(1, 2)|join(\',\') }}'});
            return testTemplate.render().should.be.fulfilledWith('2,3');
        });
        it('should slice an array to the end', async function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5]|slice(2)|join(\',\') }}'});
            return testTemplate.render().should.be.fulfilledWith('3,4,5');
        });
        it('should slice an array from the start', async function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5]|slice(null, 2)|join(\',\') }}'});
            return testTemplate.render().should.be.fulfilledWith('1,2');
        });
        it('should slice an array from a negative offset', async function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5]|slice(-2, 1)|join(\',\') }}'});
            return testTemplate.render().should.be.fulfilledWith('4');
        });
        it('should slice an array from a negative offset to the end of the array', async function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5]|slice(-4)|join(\',\') }}'});
            return testTemplate.render().should.be.fulfilledWith('2,3,4,5');
        });
    });

    describe('abs ->', function () {
        it('should convert negative numbers to its absolute value', async function () {
            const testTemplate = twig({data: '{{ \'-7.365\'|abs }}'});
            return testTemplate.render().should.be.fulfilledWith('7.365');
        });
        it('should not alter absolute numbers', async function () {
            const testTemplate = twig({data: '{{ 95|abs }}'});
            return testTemplate.render().should.be.fulfilledWith('95');
        });
    });

    describe('first ->', function () {
        it('should return first item in array', async function () {
            const testTemplate = twig({data: '{{ [\'a\', \'b\', \'c\', \'d\']|first }}'});
            return testTemplate.render().should.be.fulfilledWith('a');
        });
        it('should return first member of object', async function () {
            const testTemplate = twig({data: '{{ { item1: \'a\', item2: \'b\', item3: \'c\', item4: \'d\'}|first }}'});
            return testTemplate.render().should.be.fulfilledWith('a');
        });
        it('should not fail when passed empty obj, arr or str', async function () {
            return mapTestDataToAssertions(
                ['{{ {}|first }}', '{{ []|first }}', '{{ myemptystr|first }}'],
                ['', '', ''],
                [undefined, undefined, {myemptystr: ''}]
            );
        });
        it('should return first character in string', async function () {
            const testTemplate = twig({data: '{{ \'abcde\'|first }}'});
            return testTemplate.render().should.be.fulfilledWith('a');
        });
    });

    describe('split ->', function () {
        it('should split string with a separator', async function () {
            const testTemplate = twig({data: '{{ \'one-two-three\'|split(\'-\') }}'});
            return testTemplate.render().should.be.fulfilledWith('one,two,three');
        });
        it('should split string with a separator and positive limit', async function () {
            const testTemplate = twig({data: '{{ \'one-two-three-four-five\'|split(\'-\', 3) }}'});
            return testTemplate.render().should.be.fulfilledWith('one,two,three-four-five');
        });
        it('should split string with a separator and negative limit', async function () {
            const testTemplate = twig({data: '{{ \'one-two-three-four-five\'|split(\'-\', -2) }}'});
            return testTemplate.render().should.be.fulfilledWith('one,two,three');
        });
        it('should split with empty separator', async function () {
            const testTemplate = twig({data: '{{ \'123\'|split(\'\') }}'});
            return testTemplate.render().should.be.fulfilledWith('1,2,3');
        });
        it('should split with empty separator and limit', async function () {
            const testTemplate = twig({data: '{{ \'aabbcc\'|split(\'\', 2) }}'});
            return testTemplate.render().should.be.fulfilledWith('aa,bb,cc');
        });
    });

    describe('batch ->', function () {
        it('should work with arrays that require filling (with fill specified)', async function () {
            const testTemplate = twig({data: '{{ [\'a\', \'b\', \'c\', \'d\', \'e\', \'f\', \'g\']|batch(3, \'x\') }}'});
            return testTemplate.render().should.be.fulfilledWith('a,b,c,d,e,f,g,x,x');
        });
        it('should work with arrays that require filling (without fill specified)', async function () {
            const testTemplate = twig({data: '{{ [\'a\', \'b\', \'c\', \'d\', \'e\', \'f\', \'g\']|batch(3) }}'});
            return testTemplate.render().should.be.fulfilledWith('a,b,c,d,e,f,g');
        });
        it('should work with arrays that do not require filling (with fill specified)', async function () {
            const testTemplate = twig({data: '{{ [\'a\', \'b\', \'c\', \'d\', \'e\', \'f\']|batch(3, \'x\') }}'});
            return testTemplate.render().should.be.fulfilledWith('a,b,c,d,e,f');
        });
        it('should work with arrays that do not require filling (without fill specified)', async function () {
            const testTemplate = twig({data: '{{ [\'a\', \'b\', \'c\', \'d\', \'e\', \'f\']|batch(3) }}'});
            return testTemplate.render().should.be.fulfilledWith('a,b,c,d,e,f');
        });
        it('should return an empty result for an empty array', async function () {
            const testTemplate = twig({data: '{{ []|batch(3, \'x\') }}'});
            return testTemplate.render().should.be.fulfilledWith('');
        });
    });

    describe('last ->', function () {
        it('should return last character in string', async function () {
            const testTemplate = twig({data: '{{ \'abcd\'|last }}'});
            return testTemplate.render().should.be.fulfilledWith('d');
        });
        it('should return last item in array', async function () {
            const testTemplate = twig({data: '{{ [\'a\', \'b\', \'c\', \'d\']|last }}'});
            return testTemplate.render().should.be.fulfilledWith('d');
        });
        it('should return last item in a sorted object', async function () {
            const testTemplate = twig({data: '{{ {\'m\':1, \'z\':5, \'a\':3}|sort|last }}'});
            return testTemplate.render().should.be.fulfilledWith('5');
        });
    });

    describe('raw ->', function () {
        it('should output the raw value if autoescape is on', async function () {
            const testTemplate = twig({
                autoescape: true,
                data: '{{ value|raw }}'
            });
            return testTemplate.render({
                value: '<test>&</test>'
            }).should.be.fulfilledWith('<test>&</test>');
        });

        it('should output the raw value if autoescape is off', async function () {
            const testTemplate = twig({
                autoescape: false,
                data: '{{ value|raw }}'
            });
            return testTemplate.render({
                value: '<test>&</test>'
            }).should.be.fulfilledWith('<test>&</test>');
        });
    });

    describe('round ->', function () {
        it('should round up (common)', async function () {
            const testTemplate = twig({data: '{{ 2.7|round }}'});
            return testTemplate.render().should.be.fulfilledWith('3');
        });
        it('should round down (common)', async function () {
            const testTemplate = twig({data: '{{ 2.1|round }}'});
            return testTemplate.render().should.be.fulfilledWith('2');
        });
        it('should truncate input when input decimal places exceeds precision (floor)', async function () {
            const testTemplate = twig({data: '{{ 2.1234|round(3, \'floor\') }}'});
            return testTemplate.render().should.be.fulfilledWith('2.123');
        });
        it('should round up (ceil)', async function () {
            const testTemplate = twig({data: '{{ 2.1|round(0, \'ceil\') }}'});
            return testTemplate.render().should.be.fulfilledWith('3');
        });
        it('should truncate precision when a negative precision is passed (common)', async function () {
            const testTemplate = twig({data: '{{ 21.3|round(-1)}}'});
            return testTemplate.render().should.be.fulfilledWith('20');
        });
        it('should round up and truncate precision when a negative precision is passed (ceil)', async function () {
            const testTemplate = twig({data: '{{ 21.3|round(-1, \'ceil\')}}'});
            return testTemplate.render().should.be.fulfilledWith('30');
        });
        it('should round down and truncate precision when a negative precision is passed (floor)', async function () {
            const testTemplate = twig({data: '{{ 21.3|round(-1, \'ceil\')}}'});
            return testTemplate.render().should.be.fulfilledWith('30');
        });
    });

    it('should chain', async function () {
        const testTemplate = twig({data: '{{ ["a", "b", "c"]|keys|reverse }}'});
        return testTemplate.render().should.be.fulfilledWith('2,1,0');
    });
});
