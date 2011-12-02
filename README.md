# About

Twig.js is a pure JavaScript implementation of the Twig PHP templating language
(<http://twig.sensiolabs.org/>)

The goal is to provide a library that is compatible with both browsers and server side containers such as node.js.

Twig.js is currently a work in progress and supports a limited subset
of the Twig templating language (with more coming).

Documentation is available in the [twig.js wiki](https://github.com/justjohn/twig.js/wiki) on Github.

Supported tags:

* extends / use / block (with browser based ajax loading)
* if / elseif / else / endif
* for / else / endfor
* set

A limited set of filters are supported (with more coming) and most of the expression syntax is implemented.

Supported filters:

upper, lower, capitalize, title, length, reverse, sort, keys, url_encode, join, default, json_encode, merge

# Node Usage

Twig.js can be installed with NPM

    npm install twig

You can include twig in your app with

    var twig = require('twig');

Twig is also compatable with express. You can create an express app using
the twig templating language by setting the view engine to twig.

## app.js

```js
var twig = require("twig"),
    app = require('express').createServer();

app.configure(function () {
    app.set('view engine', 'twig');
    app.set("view options", { layout: false });
});

app.register('twig', twig);

app.get('/', function(req, res){
  res.render('index', {
    message : "Hello World"
  });
});

app.listen(9999);
```

## views/index.twig

```html
Message of the moment: <b>{{ message }}</b>
```

# Browser Usage

Include twig.js or twig.min.js in your page, then:

```js
var template = twig({
    data: 'The {{ baked_good }} is a lie.'
});

console.log(
    template.render({baked_good: 'cupcake'})
);
// outputs: "The cupcake is a lie."
```

# Tests

There are two sets of tests available for Twig.js. The node tests are written in [Mocha][mocha] and can be invoked with `make test`. There are also browser tests written in [QUnit][qunit] that are in the `qtests` directory. These will eventually be replaced with the Mocha tests, but for now are still the best way to test browser compatability.

# License

Twig.js is available under a [BSD 2-Clause license][bsd-2], see the LICENSE file for more information.

# Acknowledgments

1. The JavaScript fills in src/twig.fills.js are from <https://developer.mozilla.org/> and
used under a [Creative Commons Attribution-ShareAlike 2.5 License][cc-by-sa-2.5]

2. The build script makes use of [Google's Closure Compiler](http://code.google.com/closure/compiler/)
which is used under an [Apache License Version 2.0][apache-2.0]

[bsd-2]:        http://www.opensource.org/licenses/BSD-2-Clause
[cc-by-sa-2.5]: http://creativecommons.org/licenses/by-sa/2.5/ "Creative Commons Attribution-ShareAlike 2.5 License"
[apache-2.0]:   http://www.apache.org/licenses/ "Apache License Version 2.0"
[mocha]:        http://visionmedia.github.com/mocha/
[qunit]:        http://docs.jquery.com/QUnit
