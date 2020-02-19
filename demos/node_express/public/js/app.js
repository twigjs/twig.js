// Notebook client code
Twig.cache = true;

(function (window, undefined) {
    const base = '/views/';
    api_base = '/api';

    crossroads.addRoute('/', () => {
        // Load notes page
        const template = twig({ref: 'index'});
        const output = template.render({json: true});

        $('#noteApp').html(output);
    });

    crossroads.addRoute('/notes', () => {
        // Load notes page
        const template = twig({ref: 'notes'});
        const url = api_base + '/notes';

        $.getJSON(url, data => {
            const output = template.render(data);
            $('#noteApp').html(output);
        });
    });

    crossroads.addRoute('/notes/{id}', id => {
        // Load notes page
        const template = twig({ref: 'note'});
        const error_template = twig({ref: '404'});
        const url = api_base + '/notes/' + id;

        $.getJSON(url, data => {
            let output;
            if (data.error) {
                output = error_template.render(data);
            } else {
                output = template.render(data);
            }

            $('#noteApp').html(output);
        });
    });

    crossroads.addRoute('/add', () => {
        // Load notes page
        const template = twig({ref: 'form'});
        const output = template.render({json: true});

        $('#noteApp').html(output);
    });

    crossroads.addRoute('/edit/{id}', id => {
        // Load notes page
        const template = twig({ref: 'form'});
        const error_template = twig({ref: '404'});
        const url = api_base + '/notes/' + id;

        $.getJSON(url, data => {
            let output;
            if (data.error) {
                output = error_template.render(data);
            } else {
                output = template.render(data);
            }

            $('#noteApp').html(output);
        });
    });

    // Preload templates
    (function () {
        let loaded = 0;
        const count = 5;
        const inc_loaded = function () {
            loaded++;
            if (loaded == count) {
                // Flag as loaded, signal any waiting events
            }
        };

        const pages = {
            note: 'pages/note.twig',
            notes: 'pages/notes.twig',
            index: 'pages/index.twig',
            form: 'pages/note_form.twig',
            404: 'pages/note_404.twig'
        };

        for (id in pages) {
            if (pages.hasOwnProperty(id)) {
                twig({
                    id,
                    href: base + pages[id],
                    load() {
                        inc_loaded();
                    }
                });
            }
        }
    })();

    const {History} = window;
    // Don't bind AJAX events without history support
    if (!History.enabled) {
        return false;
    }

    $(() => {
        // Bind to StateChange Event
        History.Adapter.bind(window, 'statechange', () => { // Note: We are using statechange instead of popstate
            const State = History.getState();
            const {hash} = State;

            console.log(hash);
            // Trigger router
            crossroads.parse(hash);
        });

        // Bind to links
        $('a.ajax_link').live('click', function (event) {
            event.preventDefault();
            const href = $(this).attr('href');
            History.pushState(null, null, href);
        });
    });
})(window);
