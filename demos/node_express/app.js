var twig = require("../../twig"),
    app = require('express').createServer();

app.configure(function () {
    app.set('view engine', 'twig');
    // We don't need express to use a parent "page" layout
    app.set("view options", { layout: false });
});

app.register('twig', twig);

// Provide the "app" view
app.get('/', function(req, res){
  res.render('pages/index', {
    message : "Hello World"
  });
});

app.listen(9999);
console.log("Express Twig.js Demo is running on port 9999");

