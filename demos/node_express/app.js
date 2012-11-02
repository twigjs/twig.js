var twig = require("../../twig")
    , _ = require("underscore")._
	, markdown = require("markdown")
    , express = require('express')
    , app = express.createServer();

// Generate some
function error_json(id, message) {
	return {
		error: true
		, id: id
		, message: message
		, json: true
	}
}

function update_note(body) {
    var title = body.title;
    var text = body.text;
    var id = body.id;

    if (title) {
    	if (id == "") {
    		// Get new ID and increment ID counter
    		id = id_ctr;
    		id_ctr++;
    	}

    	notes[id] = {
    		title: title
    		, text: text
    		, id: id
    	};

    	console.log("Adding/Updating note");
    	console.log(notes[id]);
    }

}

// Some test data to pre-populate the notebook with
var id_ctr = 4;
var notes = {
    1: {
        title: "Note"
        , text: "These could be your **notes**.\n\nBut you would have to turn this demo program into something beautiful."
				, id: 1
    }
    , 2: {
        title: "Templates"
        , text: "Templates are a way of enhancing content with markup. Or really anything that requires the merging of data and display."
				, id: 2
    }
    , 3: {
        title: "Tasks"
        , text: "* Wake Up\n* Drive to Work\n* Work\n* Drive Home\n* Sleep"
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

// Routing for the notebook

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

app.all('/notes', function(req, res) {
  update_note(req.body);

  res.render('pages/notes', {
    notes : notes
  });
});

app.all('/notes/:id', function(req, res) {
  update_note(req.body);

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
    , json: true
  });
});

app.get('/api/notes/:id', function(req, res) {
  var id = parseInt(req.params.id);
  var note = notes[id];

  if (note) {
		note.markdown = markdown.markdown.toHTML( note.text );
  	    res.json(_.extend({
  	        json: true
  	    }, note));
  } else {
		res.json(error_json(41, "Unable to find note with id " + id))
  }
});

var port = process.env.PORT || 9999,
    host = process.env.IP   || "0.0.0.0";

app.listen(port, host);

console.log("Express Twig.js Demo is running on " + host + ":" + port);

