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
                    $(this.el).html(template.render(
                            this.enhanceModel(this.model.toJSON())
                    ));
                    return this;
                }
                
                // Regex's for matching twitter usernames and web links
                , userRegEx: /\@([a-zA-Z0-9_\-\.]+)/g
                , hashRegex: /#([a-zA-Z0-9_\-\.]+)/g
                , linkRegEx: /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/g
                
                // Enhance the model passed to the template with links
                , enhanceModel: function(model) {
                    model.text = model.text.replace(this.linkRegEx, '<a class="inline_link" href="$1">$1</a>');
                    model.text = model.text.replace(this.hashRegex, '<a class="search_link" href="https://twitter.com/search?q=$1">#$1</a>');
                    model.text = model.text.replace(this.userRegEx, '<a class="twitter_user" user="$1" href="http://twitter.com/$1">@$1</a>');
                    return model;
                }

                // Remove the tweet view from it's container (a FeedView)
                , remove: function() {
                    $(this.el).remove();
                }
            });

        exports.TweetView = TweetView;
    }
);

