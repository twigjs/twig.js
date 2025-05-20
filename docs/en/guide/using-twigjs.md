# Basic Usage


## Node Usage



### Usage without Express

If you don't want to use Express, you can render a template with the following method:

```js
Twig.renderFile("./path/to/someFile.twig", { foo: "bar" }, (err, html) => {
  html; // compiled string
});
```

### Usage with Express

Twig.js is compatible with Express 2 and 3 and can be setup with the following code:

#### Express 2

`app.js`

```js
var twig = require("twig"),
  app = require("express").createServer();

app.configure(function() {
  app.set("view engine", "twig");
  app.set("view options", { layout: false });

  // This section is optional and used to configure twig.
  app.set("twig options", {
    strict_variables: false
  });
});

app.register("twig", twig);

app.get("/", function(req, res) {
  res.render("index", {
    message: "Hello World"
  });
});

app.listen(9999);
```

#### Express 3

`app.js`

```js
var express = require("express"),
  app = express();

app.configure(function() {
  app.set("views", __dirname + "/views");
  app.set("view engine", "twig");

  // This section is optional and can be used to configure twig.
  app.set("twig options", {
    strict_variables: false
  });
});

app.get("/", function(req, res) {
  res.render("index", {
    message: "Hello World"
  });
});

app.listen(9999);
```

#### views/index.twig

```twig
Message of the moment: <b>{{ message }}</b>
```

## Browser Usage
From the browser, Twig.js can be used with inline templates or templates loaded from AJAX.

### Inline Templates

```js
var template = Twig.twig({
    id: "list", // id is optional, but useful for referencing the template later
    data: "{% for value in list %}{{ value }}, {% endfor %}"
});

var output = template.render({
    list: ["one", "two", "three"]
});

// output = "one, two, three, "
```
If an id is provided when you create a template, you can reference the template anywhere else in your application by using the ref parameter:

```js
// Elsewhere in your application
var output = Twig.twig({ ref: "list" }).render({
    list: ["a", "b", "c"]
});

// output = "a, b, c, "
```

### AJAX Templates

Templates can also be loaded via ajax by setting the href parameter in the twig() options.


__templates/posts.twig__

```twig
{% for post in posts %}
    <article>
        <header>
            <h1>{{ post.title }}</h1>
        </header>
        <p>{{ post.body }}</p>
    </article>
{% endfor %}
```

__app.js__

```js
var template = twig({
    id: "posts",
    href: "templates/posts.twig",
    // for this example we'll block until the template is loaded
    async: false

    // The default is to load asynchronously, and call the load function
    //   when the template is loaded.

    // load: function(template) { }
});
```

Once you've loaded templates, you can access them via their id and render them when you have data.



```js
posts = { ... }; // data from somewhere like an AJAX callback

// render the template
var postsHTML = twig({ ref: "posts" }).render(posts);

// Display the rendered template
document.getElementById("posts").innerHTML = postsHTML;
```



### Namespaces

```js
var template = Twig.twig({
    data: 'your-template',
    namespaces: { 'my-project': 'path/to/views/folder/' }
}).render();
```

When referencing another template, instead of using the relative path you can use the namespaces that were previously defined.


Ex:

```twig
{# your-template.twig #}
{% extends "my-project::template.twig" %}
```

The "my-project::" will now point to "path/to/views/folder/". It works with the `@` sign too:

```twig
{% include '@my-project/template.twig' %}
```