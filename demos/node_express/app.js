const twig = require('twig');
const {_} = require('underscore');
	 const markdown = require('markdown');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Generate some
function error_json(id, message) {
    return {
        error: true,
		 id,
		 message,
		 json: true
    };
}

function update_note(body) {
    const {title} = body;
    const {text} = body;
    let {id} = body;

    if (title) {
    	if (id == '') {
    		// Get new ID and increment ID counter
    		id = id_ctr;
    		id_ctr++;
    	}

    	notes[id] = {
    		title,
    		 text,
    		 id
    	};

    	console.log('Adding/Updating note');
    	console.log(notes[id]);
    }
}

// Some test data to pre-populate the notebook with
var id_ctr = 4;
var notes = {
    1: {
        title: 'Note',
        text: 'These could be your **notes**.\n\nBut you would have to turn this demo program into something beautiful.',
        id: 1
    },
    2: {
        title: 'Templates',
        text: 'Templates are a way of enhancing content with markup. Or really anything that requires the merging of data and display.',
        id: 2
    },
    3: {
        title: 'Tasks',
        text: '* Wake Up\n* Drive to Work\n* Work\n* Drive Home\n* Sleep',
        id: 3
    }
};

app.use(express.static(__dirname + '/public'));
app.use(bodyParser());
app.set('views', __dirname + '/public/views');
app.set('view engine', 'twig');
// We don't need express to use a parent "page" layout
// Twig.js has support for this using the {% extends parent %} tag
app.set('view options', {layout: false});

// Routing for the notebook

app.get('/', (req, res) => {
    res.render('pages/index', {
        message: 'Hello World'
    });
});

app.get('/add', (req, res) => {
    res.render('pages/note_form', {});
});

app.get('/edit/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const note = notes[id];

    res.render('pages/note_form', note);
});

app.all('/notes', (req, res) => {
    update_note(req.body);

    res.render('pages/notes', {
        notes
    });
});

app.all('/notes/:id', (req, res) => {
    update_note(req.body);

    const id = parseInt(req.params.id);
    const note = notes[id];

    if (note) {
        note.markdown = markdown.markdown.toHTML(note.text);
	    res.render('pages/note', note);
    } else {
        res.render('pages/note_404');
    }
});

// RESTFUL endpoint for notes

app.get('/api/notes', (req, res) => {
    res.json({
        notes,
        json: true
    });
});

app.get('/api/notes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const note = notes[id];

    if (note) {
        note.markdown = markdown.markdown.toHTML(note.text);
  	    res.json(_.extend({
  	        json: true
  	    }, note));
    } else {
        res.json(error_json(41, 'Unable to find note with id ' + id));
    }
});

const port = process.env.PORT || 9999;
const host = process.env.IP || '0.0.0.0';

app.listen(port, host);

console.log('Express Twig.js Demo is running on ' + host + ':' + port);

