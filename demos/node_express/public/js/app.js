// Notebook client code
Twig.cache = true;

(function(window,undefined){
    var base = "/views/"
        api_base = "/api";
    
    crossroads.addRoute('/', function(){
        // Load notes page
        var template = twig({ref: "index"})
            , output = template.render({json:true});
            
        $("#noteApp").html(output);
    });
    
    crossroads.addRoute('/notes', function(){
        // Load notes page
        var template = twig({ref: "notes"})
            , url = api_base + "/notes";
            
        $.getJSON(url, function(data) {
            var output = template.render(data);
            $("#noteApp").html(output);
        });
    });
    
    crossroads.addRoute('/notes/{id}', function(id) {
        // Load notes page
        var template = twig({ref: "note"})
            , error_template = twig({ref: "404"})
            , url = api_base + "/notes/" + id;
            
        $.getJSON(url, function(data) {
            var output;
            if (data.error) {
                output = error_template.render(data);
            } else {
                output = template.render(data);
            }
            $("#noteApp").html(output);
        });
    });
    
    crossroads.addRoute('/add', function(){
        // Load notes page
        var template = twig({ref: "form"})
            , output = template.render({json:true});
            
        $("#noteApp").html(output);
    });
    
    crossroads.addRoute('/edit/{id}', function(id) {
        // Load notes page
        var template = twig({ref: "form"})
            , error_template = twig({ref: "404"})
            , url = api_base + "/notes/" + id;
            
        $.getJSON(url, function(data) {
            var output;
            if (data.error) {
                output = error_template.render(data);
            } else {
                output = template.render(data);
            }
            $("#noteApp").html(output);
        });
    });
    
    // Preload templates
    (function() {
        var loaded = 0
            , count = 5
            , inc_loaded = function() {
                loaded++;
                if (loaded == count) {
                    // Flag as loaded, signal any waiting events
                }
            }
            , pages = {
                "note": "pages/note.twig"
                , "notes": "pages/notes.twig"
                , "index": "pages/index.twig"
                , "form": "pages/note_form.twig"
                , "404": "pages/note_404.twig"
            };
            
        for (id in pages) {
            if (pages.hasOwnProperty(id)) {
                twig({
                    id: id
                    , href: base + pages[id]
                    , load: function() {
                        inc_loaded();
                    }
                }); 
            };
        }
    })();
    
    var History = window.History;
    // Don't bind AJAX events without history support
    if ( !History.enabled ) {
        return false;
    }

    $(function() {
        // Bind to StateChange Event
        History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
            var State = History.getState()
                , hash = State.hash;
            
            console.log(hash);
            // Trigger router
            crossroads.parse(hash);
        });

        // Bind to links
        $("a.ajax_link").live("click", function(event) {
            event.preventDefault();
            var href = $(this).attr("href");
            History.pushState(null, null, href);
        });
    });
})(window);
