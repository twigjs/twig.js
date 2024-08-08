# Extending twig.js With Custom Tags

Extending twig.js with new tag types is handled differently than filters or functions, since tags require access to the internal twig.js parsers. This means you have to do the extension through the `Twig.extends` function, which allows access to the internal Twig object.


```js
Twig.extend(function(Twig) {
    // In the context of this functions, Twig new refers to the internal Twig object.
    // this allows access to functionality that is normally not exposed.
    // The external Twig object is available as Twig.exports

    ... extend tags here ...
    Twig.exports.extendTag({...});
});
```
There are two different ways to use tags in twig.js: single tags, or sets of tags (ie. start/end tags).

To see examples of each type, you can take a look at this test: [https://github.com/justjohn/twig.js/blob/master/test/test.extends.js](https://github.com/justjohn/twig.js/blob/master/test/test.extends.js)

---
The first example of extending twig.js is to create a tag that passes a value from the template to the application.

The syntax we'll use is '{% flag "ajax" %}'

```js
// place to keep flags
var flags = {};

// expose the internal Twig object for extension
Twig.extend(function(Twig) {
    Twig.exports.extendTag({
        // unique name for tag type
        type: "flag",
        // regex match for tag (flag white-space anything)
        regex: /^flag\s+(.+)$/,
        // this is a standalone tag and doesn't require a following tag
        next: [ ],
        open: true,

        // runs on matched tokens when the template is loaded. (once per template)
        compile: function (token) {
            var expression = token.match[1];

            // Compile the expression. (turns the string into tokens)
            token.stack = Twig.expression.compile.apply(this, [{
                type:  Twig.expression.type.expression,
                value: expression
            }]).stack;

            delete token.match;
            return token;
        },

        // Runs when the template is rendered
        parse: function (token, context, chain) {
            // parse the tokens into a value with the render context
            var name = Twig.expression.parse.apply(this, [token.stack, context]),
                output = '';

            flags[name] = true;

            return {
                chain: false,
                output: output
            };
        }
    });
});

var template = twig({data:"{% flag 'enabled' %}"}).render();

flags.enabled.should.equal(true);
```


Tags can also be created and chained together. The following example shows how you could use {% auth 'level' %}...{% endauth %} tags to limit content to certain users.

```js
// demo data
var App = {
    user: "john",
    users: {
        john: {level: "admin"},
        tom: {level: "user"}
    }
};

Twig.extend(function(Twig) {
    // example of extending a tag type that would
    // restrict content to the specified "level"
    Twig.exports.extendTag({
        // unique name for tag type
        type: "auth",
        // regex for matching tag
        regex: /^auth\s+(.+)$/,

        // what type of tags can follow this one.
        next: ["endauth"], // match the type of the end tag
        open: true,
        compile: function (token) {
            var expression = token.match[1];

            // turn the string expression into tokens.
            token.stack = Twig.expression.compile.apply(this, [{
                type:  Twig.expression.type.expression,
                value: expression
            }]).stack;

            delete token.match; // cleanup
            return token;
        },
        parse: function (token, context, chain) {
            var level = Twig.expression.parse.apply(this, [token.stack, context]),
                output = "";

            // check level of current user
            if (App.users[App.currentUser].level == level) {
                output = Twig.parse.apply(this, [token.output, context]);
            }

            return {
                chain: chain,
                output: output
            };
        }
    });

    // a matching end tag type
    Twig.exports.extendTag({
        type: "endauth",
        regex: /^endauth$/,
        next: [ ],
        open: false
    });
});

var template = twig({data:"Welcome{% auth 'admin' %} ADMIN{% endauth %}!"});

App.currentUser = "john";
template.render().should.equal("Welcome ADMIN!");

App.currentUser = "tom";
template.render().should.equal("Welcome!");
```

