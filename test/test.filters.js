const Twig = require('../twig').factory();

const {twig} = Twig;

describe('Twig.js Filters ->', function () {
    // Encodings
    describe('url_encode ->', function () {
        it('should encode URLs', function () {
            const testTemplate = twig({data: '{{ "http://google.com/?q=twig.js"|url_encode() }}'});
            testTemplate.render().should.equal('http%3A%2F%2Fgoogle.com%2F%3Fq%3Dtwig.js');
        });
        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|url_encode() }}'});
            testTemplate.render().should.equal('');
        });
        it('should handle empty strings', function () {
            const testTemplate = twig({data: '{{ ""|url_encode() }}'});
            testTemplate.render().should.equal('');
        });
        it('should handle special characters', function () {
            const data = {foo: '<foo> \\&"\'.,-_?/Ķä€台北[]{}\t\r\n\b\u0080'};
            const testTemplate = twig({data: '{{ foo|url_encode() }}'});
            testTemplate.render(data).should.equal('%3Cfoo%3E%20%5C%26%22%27.%2C-_%3F%2F%C4%B6%C3%A4%E2%82%AC%E5%8F%B0%E5%8C%97%5B%5D%7B%7D%09%0D%0A%08%C2%80');
        });
        it('should encode objects to url', function () {
            const testTemplate = twig({data: '{{ ({ a: "customer@example.com", b: { c: 123, d: [1, 2, 3] } })|url_encode }}'});
            testTemplate.render().should.equal('a=customer%40example.com&amp;b%5Bc%5D=123&amp;b%5Bd%5D%5B0%5D=1&amp;b%5Bd%5D%5B1%5D=2&amp;b%5Bd%5D%5B2%5D=3');
        });
    });
    describe('json_encode ->', function () {
        it('should encode strings to json', function () {
            const testTemplate = twig({data: '{{ test|json_encode }}'});
            testTemplate.render({test: 'value'}).should.equal('"value"');
        });
        it('should encode numbers to json', function () {
            const testTemplate = twig({data: '{{ test|json_encode }}'});
            testTemplate.render({test: 21}).should.equal('21');
        });
        it('should encode arrays to json', function () {
            const testTemplate = twig({data: '{{ [1,"b",3]|json_encode }}'});
            testTemplate.render().should.equal('[1,"b",3]');
        });
        it('should encode objects to json', function () {
            const testTemplate = twig({data: '{{ {"a":[1,"b",3]}|json_encode }}'});
            testTemplate.render().should.equal('{"a":[1,"b",3]}');
        });
        it('should retain key order in an object', function () {
            twig({data: '{{ { "foo": 1, "bar": 2, "baz": 3 }|json_encode }}'}).render().should.equal('{"foo":1,"bar":2,"baz":3}');
        });
        it('should not add additional information to objects', function () {
            twig({data: '{{ { "foo": 1, "bar": [1, 2, 3], "baz": { "a": "a", "b": "b" } }|json_encode }}'}).render().should.equal('{"foo":1,"bar":[1,2,3],"baz":{"a":"a","b":"b"}}');
        });
        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|json_encode }}'});
            testTemplate.render().should.equal('null');
        });
        it('should encode dates correctly', function () {
            const testTemplate = twig({data: '{{ test|json_encode }}'});
            const data = {a: new Date('2011-10-10')};
            testTemplate.render({test: data}).should.equal('{"a":"2011-10-10T00:00:00.000Z"}');
        });
    });

    // String manipulation
    describe('upper ->', function () {
        it('should convert text to uppercase', function () {
            const testTemplate = twig({data: '{{ "hello"|upper }}'});
            testTemplate.render().should.equal('HELLO');
        });
        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|upper }}'});
            testTemplate.render().should.equal('');
        });
    });
    describe('lower ->', function () {
        it('should convert text to lowercase', function () {
            const testTemplate = twig({data: '{{ "HELLO"|lower }}'});
            testTemplate.render().should.equal('hello');
        });
        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|lower }}'});
            testTemplate.render().should.equal('');
        });
    });
    describe('capitalize ->', function () {
        it('should capitalize the first word in a string', function () {
            const testTemplate = twig({data: '{{ "hello world"|capitalize }}'});
            testTemplate.render().should.equal('Hello world');

            const testTemplate2 = twig({data: '{{ "HELLO WORLD"|capitalize }}'});
            testTemplate2.render().should.equal('Hello world');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|capitalize }}'});
            testTemplate.render().should.equal('');
        });
    });
    describe('title ->', function () {
        it('should capitalize all the words in a string', function () {
            const testTemplate = twig({data: '{{ "hello world"|title }}'});
            testTemplate.render().should.equal('Hello World');

            const testTemplate2 = twig({data: '{{ "HELLO WORLD"|title }}'});
            testTemplate2.render().should.equal('Hello World');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|title }}'});
            testTemplate.render().should.equal('');
        });
    });

    // String/Object/Array check
    describe('length ->', function () {
        it('should determine the length of a string', function () {
            const testTemplate = twig({data: '{{ "test"|length }}'});
            testTemplate.render().should.equal('4');
        });
        it('should determine the length of an array', function () {
            const testTemplate = twig({data: '{{ [1,2,4,76,"tesrt"]|length }}'});
            testTemplate.render().should.equal('5');
        });
        it('should determine the length of an object', function () {
            const testTemplate = twig({data: '{{ {"a": "b", "c": "1", "test": "test"}|length }}'});
            testTemplate.render().should.equal('3');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|length }}'});
            testTemplate.render().should.equal('0');
        });
    });

    // Array/object manipulation
    describe('sort ->', function () {
        it('should sort an array', function () {
            let testTemplate = twig({data: '{{ [1,5,2,7]|sort }}'});
            testTemplate.render().should.equal('1,2,5,7');

            testTemplate = twig({data: '{{ ["test","abc",2,7]|sort }}'});
            testTemplate.render().should.equal('2,7,abc,test');
        });
        it('should sort an object', function () {
            let testTemplate = twig({data: '{% set obj =  {\'c\': 1,\'d\': 5,\'t\': 2,\'e\':7}|sort %}{% for key,value in obj|sort %}{{key}}:{{value}} {%endfor %}'});
            testTemplate.render().should.equal('c:1 t:2 d:5 e:7 ');

            testTemplate = twig({data: '{% set obj = {\'m\':\'test\',\'z\':\'abc\',\'a\':2,\'y\':7} %}{% for key,value in obj|sort %}{{key}}:{{value}} {%endfor %}'});
            testTemplate.render().should.equal('a:2 y:7 z:abc m:test ');

            testTemplate = twig({data: '{% set obj = {\'z\':\'abc\',\'a\':2,\'y\':7,\'m\':\'test\'} %}{% for key,value in obj|sort %}{{key}}:{{value}} {%endfor %}'});
            testTemplate.render().should.equal('a:2 y:7 z:abc m:test ');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{% set obj = undef|sort %}{% for key, value in obj|sort %}{{key}}:{{value}}{%endfor%}'});
            testTemplate.render().should.equal('');
        });
    });
    describe('reverse ->', function () {
        it('should reverse an array', function () {
            const testTemplate = twig({data: '{{ ["a", "b", "c"]|reverse }}'});
            testTemplate.render().should.equal('c,b,a');
        });
        it('should reverse an object', function () {
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|reverse }}'});
            testTemplate.render().should.equal('');
        });
    });
    describe('keys ->', function () {
        it('should return the keys of an array', function () {
            const testTemplate = twig({data: '{{ ["a", "b", "c"]|keys }}'});
            testTemplate.render().should.equal('0,1,2');
        });
        it('should return the keys of an object', function () {
            let testTemplate = twig({data: '{{ {"a": 1, "b": 4, "c": 5}|keys }}'});
            testTemplate.render().should.equal('a,b,c');

            testTemplate = twig({data: '{{ {"0":"a", "1":"b", "2":"c"}|keys }}'});
            testTemplate.render().should.equal('0,1,2');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|keys }}'});
            testTemplate.render().should.equal('');
        });

        it('should handle empty strings', function () {
            const testTemplate = twig({data: '{{ ""|keys }}'});
            testTemplate.render().should.equal('');
        });
    });
    describe('merge ->', function () {
        it('should merge two objects into an object', function () {
            // Object merging
            const testTemplate = twig({data: '{% set obj= {"a":"test", "b":"1"}|merge({"b":2,"c":3}) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}'});
            testTemplate.render().should.equal('a:test b:2 c:3 ');
        });
        it('should merge two arrays into and array', function () {
            // Array merging
            const testTemplate = twig({data: '{% set obj= ["a", "b"]|merge(["c", "d"]) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}'});
            testTemplate.render().should.equal('0:a 1:b 2:c 3:d ');
        });
        it('should merge an object and an array into an object', function () {
            // Mixed merging
            let testTemplate = twig({data: '{% set obj= ["a", "b"]|merge({"a": "c", "3":4}, ["c", "d"]) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}'});
            testTemplate.render().should.equal('0:a 1:b 3:4 4:c 5:d a:c ');

            // Mixed merging(2)
            testTemplate = twig({data: '{% set obj= {"1":"a", "a":"b"}|merge(["c", "d"]) %}{% for key in obj|keys %}{{key}}:{{obj[key]}} {%endfor %}'});
            testTemplate.render().should.equal('1:a a:b 2:c 3:d ');
        });
    });
    describe('join ->', function () {
        it('should join all values in an object', function () {
            const testTemplate = twig({data: '{{ {"a":"1", "b": "b", "c":test}|join("-") }}'});
            testTemplate.render({test: 't'}).should.equal('1-b-t');
        });
        it('should joing all values in an array', function () {
            let testTemplate = twig({data: '{{ [1,2,4,76]|join }}'});
            testTemplate.render().should.equal('12476');
            testTemplate = twig({data: '{{ [1+ 5,2,4,76]|join("-" ~ ".") }}'});
            testTemplate.render().should.equal('6-.2-.4-.76');
        });
        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|join }}'});
            testTemplate.render().should.equal('');
        });
        it('should handle empty strings', function () {
            const testTemplate = twig({data: '{{ ""|join }}'});
            testTemplate.render().should.equal('');
        });
    });

    // Other
    describe('default ->', function () {
        it('should not provide the default value if a key is defined and not empty', function () {
            const testTemplate = twig({data: '{{ var|default("Not Defined") }}'});
            testTemplate.render({var: 'value'}).should.equal('value');
        });

        it('should provide a default value if a key is not defined', function () {
            const testTemplate = twig({data: '{{ var|default("Not Defined") }}'});
            testTemplate.render().should.equal('Not Defined');
        });

        it('should provide a default value if a value is empty', function () {
            let testTemplate = twig({data: '{{ ""|default("Empty String") }}'});
            testTemplate.render().should.equal('Empty String');

            testTemplate = twig({data: '{{ var.key|default("Empty Key") }}'});
            testTemplate.render({var: {}}).should.equal('Empty Key');
        });

        it('should provide a default value of \'\' if no parameters are passed and a default key is not defined', function () {
            const testTemplate = twig({data: '{{ var|default }}'});
            testTemplate.render().should.equal('');
        });

        it('should provide a default value of \'\' if no parameters are passed and a value is empty', function () {
            let testTemplate = twig({data: '{{ ""|default }}'});
            testTemplate.render().should.equal('');

            testTemplate = twig({data: '{{ var.key|default }}'});
            testTemplate.render({var: {}}).should.equal('');
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
        it('should recognize timestamps', function () {
            const template = twig({data: '{{ 27571323556|date("d/m/Y @ H:i:s") }}'});
            const date = new Date(27571323556000); // 13/09/2843 @ 08:59:16 EST

            template.render().should.equal(stringDate(date));
        });

        it('should recognize timestamps, when they are passed as string', function () {
            const template = twig({data: '{{ "27571323556"|date("d/m/Y @ H:i:s") }}'});
            const date = new Date(27571323556000); // 13/09/2843 @ 08:59:16 EST

            template.render().should.equal(stringDate(date));
        });

        it('should recognize string date formats', function () {
            const template = twig({data: '{{ "Tue Aug 14 08:52:15 +0000 2007"|date("d/m/Y @ H:i:s") }}'});
            const date = new Date(1187081535000); // 14/08/2007 @ 04:52:15 EST

            template.render().should.equal(stringDate(date));
        });

        it('should escape words and characters in the date format (twig:data)]', function () {
            const template = twig({data: '{{ "1970-01-01 00:00:00"|date("F jS \\a\\t g:ia") }}'});

            template.render().should.equal('January 1st at 12:00am');
        });

        it('should escape words and characters in the date format (twig:ref)]', function () {
            twig({
                id: 'escape-date-format',
                path: 'test/templates/escape-date-format.twig',
                async: false
            });

            // Load the template
            twig({ref: 'escape-date-format'}).render({}).should.equal('January 1st at 12:00am');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|date("d/m/Y @ H:i:s") }}'});
            const date = new Date();
            testTemplate.render().should.equal(stringDate(date));
        });

        it('should handle empty strings', function () {
            const testTemplate = twig({data: '{{ ""|date("d/m/Y @ H:i:s") }}'});
            const date = new Date();
            testTemplate.render().should.equal(stringDate(date));
        });

        it('should work with no parameters', function () {
            const testTemplate = twig({data: '{{ 27571323556|date }}'});
            testTemplate.render().should.equal(twig({data: '{{ 27571323556|date("F j, Y H:i") }}'}).render());
        });
    });

    describe('replace ->', function () {
        it('should replace strings provided in a map', function () {
            const template = twig({data: '{{ "I like %this% and %that%. Seriously, I like %this% and %that%."|replace({"%this%": foo, "%that%": "bar"}) }}'});
            template.render({foo: 'foo'}).should.equal('I like foo and bar. Seriously, I like foo and bar.');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|replace }}'});
            testTemplate.render().should.equal('');
        });

        it('should handle empty strings', function () {
            const testTemplate = twig({data: '{{ ""|replace }}'});
            testTemplate.render().should.equal('');
        });
    });

    describe('format ->', function () {
        it('should replace formatting tags with parameters', function () {
            const template = twig({data: '{{ "I like %s and %s."|format(foo, "bar") }}'});
            template.render({foo: 'foo'}).should.equal('I like foo and bar.');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|format }}'});
            testTemplate.render().should.equal('');
        });

        it('should handle empty strings', function () {
            const testTemplate = twig({data: '{{ ""|format }}'});
            testTemplate.render().should.equal('');
        });

        it('should handle positive leading sign without padding', function () {
            const template = twig({data: '{{ "I like positive numbers like %+d."|format(123) }}'});
            template.render({foo: 'foo'}).should.equal('I like positive numbers like +123.');
        });

        it('should handle negative leading sign without padding', function () {
            const template = twig({data: '{{ "I like negative numbers like %+d."|format(-123) }}'});
            template.render({foo: 'foo'}).should.equal('I like negative numbers like -123.');
        });

        it('should handle positive leading sign with padding zero', function () {
            const template = twig({data: '{{ "I like positive numbers like %+05d."|format(123) }}'});
            template.render({foo: 'foo'}).should.equal('I like positive numbers like +0123.');
        });

        it('should handle negative leading sign with padding zero', function () {
            const template = twig({data: '{{ "I like negative numbers like %+05d."|format(-123) }}'});
            template.render({foo: 'foo'}).should.equal('I like negative numbers like -0123.');
        });

        it('should handle positive leading sign with padding space', function () {
            const template = twig({data: '{{ "I like positive numbers like %+5d."|format(123) }}'});
            template.render({foo: 'foo'}).should.equal('I like positive numbers like  +123.');
        });

        it('should handle negative leading sign with padding space', function () {
            const template = twig({data: '{{ "I like negative numbers like %+5d."|format(-123) }}'});
            template.render({foo: 'foo'}).should.equal('I like negative numbers like  -123.');
        });
    });

    describe('striptags ->', function () {
        it('should remove tags from a value', function () {
            const template = twig({data: '{{ "<p>Test paragraph.</p><!-- Comment --> <a href=\\"#fragment\\">Other text</a>"|striptags }}'});
            template.render().should.equal('Test paragraph. Other text');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|striptags }}'});
            testTemplate.render().should.equal('');
        });

        it('should handle empty strings', function () {
            const testTemplate = twig({data: '{{ ""|striptags }}'});
            testTemplate.render().should.equal('');
        });
    });

    describe('escape ->', function () {
        it('should convert unsafe characters to HTML entities', function () {
            const template = twig({data: '{{ "<p>Test paragraph.</p><!-- Comment --> <a href=\'#fragment\'>Other text</a>"|escape }}'});
            template.render().should.equal('&lt;p&gt;Test paragraph.&lt;/p&gt;&lt;!-- Comment --&gt; &lt;a href=&#039;#fragment&#039;&gt;Other text&lt;/a&gt;');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|escape }}'});
            testTemplate.render().should.equal('');
        });

        it('should handle empty strings', function () {
            const testTemplate = twig({data: '{{ ""|escape }}'});
            testTemplate.render().should.equal('');
        });

        it('should not escape twice if autoescape is on', function () {
            twig({
                autoescape: true,
                data: '{{ value|escape }}'
            }).render({
                value: '<test>&</test>'
            }).should.equal('&lt;test&gt;&amp;&lt;/test&gt;');
        });

        it('should handle the strategy parameter', function () {
            const data = {foo: '<foo> \\&"\'.,-_?/Ķä€台北[]{}\t\r\n\b\u0080'};
            let testTemplate;

            testTemplate = twig({data: 'Default: {{ foo|escape }}'});
            testTemplate.render(data).should.equal('Default: &lt;foo&gt; \\&amp;&quot;&#039;.,-_?/Ķä€台北[]{}\t\r\n\b\u0080');

            testTemplate = twig({data: 'html: {{ foo|escape("html") }}'});
            testTemplate.render(data).should.equal('html: &lt;foo&gt; \\&amp;&quot;&#039;.,-_?/Ķä€台北[]{}\t\r\n\b\u0080');

            testTemplate = twig({data: 'js: {{ foo|escape("js") }}'});
            testTemplate.render(data).should.equal('js: \\x3Cfoo\\x3E\\x20\\x5C\\x26\\x22\\x27.,\\x2D_\\x3F\\x2F\\u0136\\u00E4\\u20AC\\u53F0\\u5317\\x5B\\x5D\\x7B\\x7D\\x9\\xD\\xA\\x8\\u0080');

            testTemplate = twig({data: 'css: {{ foo|escape("css") }}'});
            testTemplate.render(data).should.equal('css: \\3C foo\\3E \\20 \\5C \\26 \\22 \\27 \\2E \\2C \\2D \\5F \\3F \\2F \\136 \\E4 \\20AC \\53F0 \\5317 \\5B \\5D \\7B \\7D \\9 \\D \\A \\8 \\80 ');

            testTemplate = twig({data: 'url: {{ foo|escape("url") }}'});
            testTemplate.render(data).should.equal('url: %3Cfoo%3E%20%5C%26%22%27.%2C-_%3F%2F%C4%B6%C3%A4%E2%82%AC%E5%8F%B0%E5%8C%97%5B%5D%7B%7D%09%0D%0A%08%C2%80');

            testTemplate = twig({data: 'html_attr: {{ foo|escape("html_attr") }}'});
            testTemplate.render(data).should.equal('html_attr: &lt;foo&gt;&#x20;&#x5C;&amp;&quot;&#x27;.,-_&#x3F;&#x2F;&#x0136;&#x00E4;&#x20AC;&#x53F0;&#x5317;&#x5B;&#x5D;&#x7B;&#x7D;&#x09;&#x0D;&#x0A;&#xFFFD;&#x0080;');
        });

        it('should escape strategy != \'html\' if autoescape is on', function () {
            twig({
                autoescape: true,
                data: '{{ value|escape("js") }}'
            }).render({
                value: '<test>&</test>'
            }).should.equal('\\x3Ctest\\x3E\\x26\\x3C\\x2Ftest\\x3E');
        });

        it('should not escape twice if autoescape is not html', function () {
            twig({
                autoescape: 'js',
                data: '{{ value|escape("js") }}'
            }).render({
                value: '<test>&</test>'
            }).should.equal('\\x3Ctest\\x3E\\x26\\x3C\\x2Ftest\\x3E');
        });

        it('should escape twice if escape strategy is different from autoescape option', function () {
            twig({
                autoescape: 'css',
                data: '{{ value|escape("js") }}\n{{ value|escape }}'
            }).render({
                value: '<test>&</test>'
            }).should.equal('\\5C x3Ctest\\5C x3E\\5C x26\\5C x3C\\5C x2Ftest\\5C x3E\n\\26 lt\\3B test\\26 gt\\3B \\26 amp\\3B \\26 lt\\3B \\2F test\\26 gt\\3B ');
        });
    });

    describe('e ->', function () {
        it('should alias escape function with e', function () {
            const template = twig({data: '{{ "<p>Test paragraph.</p><!-- Comment --> <a href=\'#fragment\'>Other text</a>"|e }}'});
            template.render().should.equal('&lt;p&gt;Test paragraph.&lt;/p&gt;&lt;!-- Comment --&gt; &lt;a href=&#039;#fragment&#039;&gt;Other text&lt;/a&gt;');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|e }}'});
            testTemplate.render().should.equal('');
        });

        it('should not escape twice if autoescape is on', function () {
            const template = twig({
                autoescape: true,
                data: '{{ value|e }}'
            });
            template.render({
                value: '<test>&</test>'
            }).should.equal('&lt;test&gt;&amp;&lt;/test&gt;');
        });
    });

    describe('nl2br ->', function () {
        it('should convert newlines into html breaks', function () {
            const template = twig({data: '{{ test|nl2br }}'});
            template.render({test: 'Line 1\r\nLine 2\nLine 3\rLine 4\n\n'})
                .should.equal('Line 1<br />\nLine 2<br />\nLine 3<br />\nLine 4<br />\n<br />\n');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|nl2br }}'});
            testTemplate.render().should.equal('');
        });

        it('should handle empty strings', function () {
            const testTemplate = twig({data: '{{ ""|nl2br }}'});
            testTemplate.render().should.equal('');
        });

        it('should not escape br tags if autoescape is on', function () {
            twig({
                autoescape: true,
                data: '{{ test|nl2br }}'
            }).render({
                test: '<test>Line 1\nLine2</test>'
            }).should.equal('&lt;test&gt;Line 1<br />\nLine2&lt;/test&gt;');
        });
    });

    describe('truncate ->', function () {
        it('should truncate string to default size(20) and add default separator', function () {
            const template = twig({data: '{{ test|truncate }}'});
            template.render({test: '01234567890123456789012345678901234567890123456789'}).should.equal('012345678901234567890123456789...');
        });

        it('should truncate string to custom size(10) and add default separator', function () {
            const template = twig({data: '{{ test|truncate(10) }}'});
            template.render({test: '01234567890123456789012345678901234567890123456789'}).should.equal('0123456789...');
        });

        it('should truncate string to custom size(15) with preserve and add default separator', function () {
            const template = twig({data: '{{ test|truncate(15, true) }}'});
            template.render({test: '0123456789 0123456789 0123456789 0123456789 0123456789'}).should.equal('0123456789 0123456789...');
        });

        it('should truncate string to custom size(15) with preserve and add custom(*) separator', function () {
            const template = twig({data: '{{ test|truncate(15, true, "*") }}'});
            template.render({test: '0123456789 0123456789 0123456789 0123456789 0123456789'}).should.equal('0123456789 0123456789*');
        });
    });

    describe('trim ->', function () {
        it('should trim whitespace from strings', function () {
            const template = twig({data: '{{ test|trim }}'});
            template.render({test: '\r\n Test\n  '}).should.equal('Test');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|trim }}'});
            testTemplate.render().should.equal('');
        });

        it('should handle empty strings', function () {
            const testTemplate = twig({data: '{{ ""|trim }}'});
            testTemplate.render().should.equal('');
        });

        it('should not autoescape', function () {
            const template = twig({data: '{{ test|trim }}'});
            template.render({test: '\r\n <a href="">Test</a>\n  '}).should.equal('<a href="">Test</a>');
        });
    });

    describe('number_format ->', function () {
        it('should round to nearest integer if no parameters', function () {
            const template = twig({data: '{{ 1234.56|number_format }}'});
            template.render().should.equal('1,235');
        });
        it('should have customizable precision', function () {
            const template = twig({data: '{{ 1234.567890123|number_format(4) }}'});
            template.render().should.equal('1,234.5679');
        });
        it('should have a customizable decimal seperator', function () {
            const template = twig({data: '{{ 1234.567890123|number_format(2,",") }}'});
            template.render().should.equal('1,234,57');
        });
        it('should have a customizable thousands seperator', function () {
            const template = twig({data: '{{ 1234.5678|number_format(2,","," ") }}'});
            template.render().should.equal('1 234,57');
        });
        it('should handle blank seperators', function () {
            const template = twig({data: '{{ 1234.5678|number_format(2,"","") }}'});
            template.render().should.equal('123457');
        });

        it('should handle undefined', function () {
            const testTemplate = twig({data: '{{ undef|number_format }}'});
            testTemplate.render().should.equal('0');
        });
    });

    describe('slice ->', function () {
        it('should slice a string', function () {
            const testTemplate = twig({data: '{{ \'12345\'|slice(1, 2) }}'});
            testTemplate.render().should.equal('23');
        });
        it('should slice a string to the end', function () {
            const testTemplate = twig({data: '{{ \'12345\'|slice(2) }}'});
            testTemplate.render().should.equal('345');
        });
        it('should slice a string from the start', function () {
            const testTemplate = twig({data: '{{ \'12345\'|slice(null, 2) }}'});
            testTemplate.render().should.equal('12');
        });
        it('should slice a string from a negative offset', function () {
            const testTemplate = twig({data: '{{ \'12345\'|slice(-2, 1) }}'});
            testTemplate.render().should.equal('4');
        });
        it('should slice a string from a negative offset to end of string', function () {
            const testTemplate = twig({data: '{{ \'12345\'|slice(-2) }}'});
            testTemplate.render().should.equal('45');
        });

        it('should slice an array', function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5]|slice(1, 2)|join(\',\') }}'});
            testTemplate.render().should.equal('2,3');
        });
        it('should slice an array to the end', function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5]|slice(2)|join(\',\') }}'});
            testTemplate.render().should.equal('3,4,5');
        });
        it('should slice an array from the start', function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5]|slice(null, 2)|join(\',\') }}'});
            testTemplate.render().should.equal('1,2');
        });
        it('should slice an array from a negative offset', function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5]|slice(-2, 1)|join(\',\') }}'});
            testTemplate.render().should.equal('4');
        });
        it('should slice an array from a negative offset to the end of the array', function () {
            const testTemplate = twig({data: '{{ [1, 2, 3, 4, 5]|slice(-4)|join(\',\') }}'});
            testTemplate.render().should.equal('2,3,4,5');
        });
    });

    describe('abs ->', function () {
        it('should convert negative numbers to its absolute value', function () {
            const testTemplate = twig({data: '{{ \'-7.365\'|abs }}'});
            testTemplate.render().should.equal('7.365');
        });
        it('should not alter absolute numbers', function () {
            const testTemplate = twig({data: '{{ 95|abs }}'});
            testTemplate.render().should.equal('95');
        });
    });

    describe('first ->', function () {
        '';
        it('should return first item in array', function () {
            const testTemplate = twig({data: '{{ [\'a\', \'b\', \'c\', \'d\']|first }}'});
            testTemplate.render().should.equal('a');
        });
        it('should return first member of object', function () {
            const testTemplate = twig({data: '{{ { item1: \'a\', item2: \'b\', item3: \'c\', item4: \'d\'}|first }}'});
            testTemplate.render().should.equal('a');
        });
        it('should not fail when passed empty obj, arr or str', function () {
            let testTemplate;

            testTemplate = twig({data: '{{ {}|first }}'});
            testTemplate.render().should.equal('');

            testTemplate = twig({data: '{{ []|first }}'});
            testTemplate.render().should.equal('');

            testTemplate = twig({data: '{{ myemptystr|first }}'});
            testTemplate.render({myemptystr: ''}).should.equal('');
        });
        it('should return first character in string', function () {
            const testTemplate = twig({data: '{{ \'abcde\'|first }}'});
            testTemplate.render().should.equal('a');
        });
    });

    describe('split ->', function () {
        it('should split string with a separator', function () {
            const testTemplate = twig({data: '{{ \'one-two-three\'|split(\'-\') }}'});
            testTemplate.render().should.equal('one,two,three');
        });
        it('should split string with a separator and positive limit', function () {
            const testTemplate = twig({data: '{{ \'one-two-three-four-five\'|split(\'-\', 3) }}'});
            testTemplate.render().should.equal('one,two,three-four-five');
        });
        it('should split string with a separator and negative limit', function () {
            const testTemplate = twig({data: '{{ \'one-two-three-four-five\'|split(\'-\', -2) }}'});
            testTemplate.render().should.equal('one,two,three');
        });
        it('should split with empty separator', function () {
            const testTemplate = twig({data: '{{ \'123\'|split(\'\') }}'});
            testTemplate.render().should.equal('1,2,3');
        });
        it('should split with empty separator and limit', function () {
            const testTemplate = twig({data: '{{ \'aabbcc\'|split(\'\', 2) }}'});
            testTemplate.render().should.equal('aa,bb,cc');
        });
    });

    describe('batch ->', function () {
        it('should work with arrays that require filling (with fill specified)', function () {
            const testTemplate = twig({data: '{{ [\'a\', \'b\', \'c\', \'d\', \'e\', \'f\', \'g\']|batch(3, \'x\') }}'});
            testTemplate.render().should.equal('a,b,c,d,e,f,g,x,x');
        });
        it('should work with arrays that require filling (without fill specified)', function () {
            const testTemplate = twig({data: '{{ [\'a\', \'b\', \'c\', \'d\', \'e\', \'f\', \'g\']|batch(3) }}'});
            testTemplate.render().should.equal('a,b,c,d,e,f,g');
        });
        it('should work with arrays that do not require filling (with fill specified)', function () {
            const testTemplate = twig({data: '{{ [\'a\', \'b\', \'c\', \'d\', \'e\', \'f\']|batch(3, \'x\') }}'});
            testTemplate.render().should.equal('a,b,c,d,e,f');
        });
        it('should work with arrays that do not require filling (without fill specified)', function () {
            const testTemplate = twig({data: '{{ [\'a\', \'b\', \'c\', \'d\', \'e\', \'f\']|batch(3) }}'});
            testTemplate.render().should.equal('a,b,c,d,e,f');
        });
        it('should return an empty result for an empty array', function () {
            const testTemplate = twig({data: '{{ []|batch(3, \'x\') }}'});
            testTemplate.render().should.equal('');
        });
    });

    describe('last ->', function () {
        it('should return last character in string', function () {
            const testTemplate = twig({data: '{{ \'abcd\'|last }}'});
            testTemplate.render().should.equal('d');
        });
        it('should return last item in array', function () {
            const testTemplate = twig({data: '{{ [\'a\', \'b\', \'c\', \'d\']|last }}'});
            testTemplate.render().should.equal('d');
        });
        it('should return last item in a sorted object', function () {
            const testTemplate = twig({data: '{{ {\'m\':1, \'z\':5, \'a\':3}|sort|last }}'});
            testTemplate.render().should.equal('5');
        });
    });

    describe('raw ->', function () {
        it('should output the raw value if autoescape is on', function () {
            const template = twig({
                autoescape: true,
                data: '{{ value|raw }}'
            });
            template.render({
                value: '<test>&</test>'
            }).should.equal('<test>&</test>');
        });

        it('should output the raw value if autoescape is off', function () {
            const template = twig({
                autoescape: false,
                data: '{{ value|raw }}'
            });
            template.render({
                value: '<test>&</test>'
            }).should.equal('<test>&</test>');
        });

        it('should output an empty string', function () {
            const template = twig({data: '{{ value|raw }}'});
            template.render({value: ''}).should.equal('');
            template.render({}).should.equal('');
        });

    });

    describe('round ->', function () {
        it('should round up (common)', function () {
            const testTemplate = twig({data: '{{ 2.7|round }}'});
            testTemplate.render().should.equal('3');
        });
        it('should round down (common)', function () {
            const testTemplate = twig({data: '{{ 2.1|round }}'});
            testTemplate.render().should.equal('2');
        });
        it('should truncate input when input decimal places exceeds precision (floor)', function () {
            const testTemplate = twig({data: '{{ 2.1234|round(3, \'floor\') }}'});
            testTemplate.render().should.equal('2.123');
        });
        it('should round up (ceil)', function () {
            const testTemplate = twig({data: '{{ 2.1|round(0, \'ceil\') }}'});
            testTemplate.render().should.equal('3');
        });
        it('should truncate precision when a negative precision is passed (common)', function () {
            const testTemplate = twig({data: '{{ 21.3|round(-1)}}'});
            testTemplate.render().should.equal('20');
        });
        it('should round up and truncate precision when a negative precision is passed (ceil)', function () {
            const testTemplate = twig({data: '{{ 21.3|round(-1, \'ceil\')}}'});
            testTemplate.render().should.equal('30');
        });
        it('should round down and truncate precision when a negative precision is passed (floor)', function () {
            const testTemplate = twig({data: '{{ 21.3|round(-1, \'ceil\')}}'});
            testTemplate.render().should.equal('30');
        });
    });

    describe('spaceless ->', function () {
        it('should spaceless', function () {
            const testTemplate = twig({data: '{{ \'<div>\n    <b>b</b>   <i>i</i>\n</div>\'|spaceless }}'});
            testTemplate.render().should.equal('<div><b>b</b><i>i</i></div>');
        });
    });

    it('should chain', function () {
        const testTemplate = twig({data: '{{ ["a", "b", "c"]|keys|reverse }}'});
        testTemplate.render().should.equal('2,1,0');
    });
});
