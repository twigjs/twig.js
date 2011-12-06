var twig = require("../../twig"),
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

