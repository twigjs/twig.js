var twig = require("../../twig")
		, markdown = require("markdown")
    , express = require('express')
    , app = express.createServer();

function error_json(id, message) {
	return {
		status: "error",
		id: id,
		message: message
	}
}

var id_ctr = 4;

var notes = {
    1: {
        title: "Note"
        , text: "These could be your notes. But you would have to turn this demo program into something beautiful."
				, id: 1
    }
    , 2: {
        title: "Templates"
        , text: "Templates are a way of enhancing content with markup. Or really anything that requires the merging of data and display."
				, id: 2
    }
    , 3: {
        title: "Tasks"
        , text: "<ol><li>Wake Up</li><li>Drive to Work</li><li>Work</li><li>Drive Home</li><li>Sleep</li></ol>"
				, id: 3
    }
};

app.configure(function () {
    app.use(express.static(__dirname + '/public'));
		app.use(express.bodyParser());
    app.set('views', __dirname + '/public/views');
    app.set('view engine', 'twig');
    // We don't need express to use a parent "page" layout
    // Twig.js has support for this using the {% extends parent %} tag
    app.set("view options", { layout: false });
});

app.register('twig', twig);

// Provide the "app" view
app.get('/', function(req, res){
  res.render('pages/index', {
    message : "Hello World"
  });
});

app.get('/add', function(req, res) {
  res.render('pages/note_form', {});
});

app.get('/edit/:id', function(req, res) {
  var id = parseInt(req.params.id);
  var note = notes[id];

  res.render('pages/note_form', note);
});

app.get('/notes', function(req, res) {
  res.render('pages/notes', {
    notes : notes
  });
});

app.post('/notes', function(req, res) {
	var title = req.body.title;
	var text = req.body.text;
	var id = req.body.id;
	
	if (title) {
		if (id == "") {
			// Get new ID and increment ID counter
			id = id_ctr;
			id_ctr++;
		}	
		
		// Add note
		var note = {
			title: title
			, text: text
			, id: id
		};
		
		console.log("Adding new note");
		console.log(note);
		
		notes[id] = note;
	}
	
  res.render('pages/notes', {
    notes : notes
  });
});


app.get('/notes/:id', function(req, res) {
  var id = parseInt(req.params.id);
  var note = notes[id];

	if (note) {
		note.markdown = markdown.markdown.toHTML( note.text );
	  res.render('pages/note', note);
	} else {
		res.render('pages/note_404');
	}
});

// RESTFUL endpoint for notes

app.get('/api/notes', function(req, res) {
  res.json({
    notes : notes
  });
});

app.get('/api/notes/:id', function(req, res) {
  var id = parseInt(req.params.id);
  var note = notes[id];

  if (note) {
		note.markdown = markdown.markdown.toHTML( note.text );
  	res.json(note);
  } else {
		res.json(error_json(41, "Unable to find note with id " + id))
  }
});

app.listen(9999);
console.log("Express Twig.js Demo is running on port 9999");

