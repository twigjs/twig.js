// # Tweet View
//
// The view for a single Tweet
//

module.declare(
    [
        { backbone: 'vendor/backbone' } 
        , { twig: "vendor/twig" }
        , { tweet: "js/model/tweet" }
    ]
    , function (require, exports, module) {
        var Backbone = require("backbone")
            , twig = require("twig").twig
        
            // Load the template for a "Tweet"
            //     This template only needs to be loaded once. It will be compiled at
            //     load time and can be rendered separately for each Tweet.
            , template = twig({
                href: 'templates/tweet.twig'
                , async: false
            })
            
            , TweetView = Backbone.View.extend({
                tagName: "li"
                , className: "tweet"

                // Create the Tweet view
                , initialize: function() {
                    // Re-render the tweet if the backing model changes
                    this.model.bind('change', this.render, this);

                    // Remove the Tweet if the backing model is removed.
                    this.model.bind('destroy', this.remove, this);
                }

                // Render the tweet Twig template with the contents of the model
                , render: function() {
                    // Pass in an object representing the Tweet to serve as the
                    // render context for the template and inject it into the View.
                    $(this.el).html(template.render(this.model.toJSON()));
                    return this;
                }

                // Remove the tweet view from it's container (a FeedView)
                , remove: function() {
                    $(this.el).remove();
                }
            });

        exports.TweetView = TweetView;
    }
);

