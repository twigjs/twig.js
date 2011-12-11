// # Feed View
//
// This is the view module for a Twitter feed.
//

module.declare(
    [
        { backbone: 'vendor/backbone' } 
        , { feed: "js/model/feed" }
        , { tweetView: "js/view/tweetView" }
    ]
    , function (require, exports, module) {
        var feed = require("feed").feed
            , Backbone = require("backbone")
            , TweetView = require("tweetView").TweetView

            // The FeedView is a simple container of TweetViews and therefore
            // doesn't need a template. The ul element provided by the Backbone
            // View is sufficient.
            , FeedView = Backbone.View.extend({
                tagName: "ul"
                , className: "feed"

                , initialize: function() {
                    // Bind to model changes
                    feed.bind('add',   this.addTweet, this);
                    feed.bind('reset', this.addAll,   this);

                    // Load stored tweets from local storage
                    feed.fetch();
                }
                
                // Add a tweet to the view
                //      Creates a new TweetView for the tweet model
                //      and adds it to the FeedView
                , addTweet: function(tweet) {
                    var tweetView = new TweetView({
                        model: tweet
                    });
                    var el = tweetView.render().el;
                    $(this.el).append(el);

                    return this;
                }

                // Handle resets to the model by adding all new elements to the view
                // Existing tweet views will have been removed when their models are
                // destroyed.
                , addAll: function() {
                    var that = this;
                    feed.each(function(tweet){that.addTweet(tweet)});
                }
            });

        exports.FeedView = FeedView;
    }
);
