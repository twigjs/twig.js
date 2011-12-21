var twig = require("../../twig")
    , express = require('express')
    , app = express.createServer();

var notes = {
    1: {
        title: "Notes"
        , text: "These could be your notes. But you would have to turn this demo program into something beautiful."
    }
    , 2: {
        title: "Templates"
        , text: "Templates are a way of enhancing content with markup. Or really anything that requires the merging of data and display."
    }
};

app.configure(function () {
    app.use(express.static(__dirname + '/public'));
    app.set('views', __dirname + '/public/views');
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

app.get('/notes', function(req, res) {
  var json = req.param("json");

  if (json) {
    res.json({
      notes : notes
    });
  } else {
    res.render('pages/notes', {
      notes : notes
    });
  }
});


app.get('/notes/:id', function(req, res) {
  var json = req.param("json");
  var id = parseInt(req.params.id);
  var note = notes[id];

  if (json) {
    res.json(note);
  } else {
    res.render('pages/note', note);
  }
});

app.listen(9999);
console.log("Express Twig.js Demo is running on port 9999");

