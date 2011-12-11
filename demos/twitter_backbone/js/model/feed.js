module.declare(
    [
        { backbone: 'vendor/backbone' } 
        , { underscore: 'vendor/underscore' } 
        , { tweet: "js/model/tweet" }
    ],
    function(require, exports, module) {
        var Backbone = require("backbone")
            , _ = require("underscore")._
            , Tweet = require("tweet").Tweet
            , Feed = Backbone.Collection.extend({
                localStorage: new Backbone.Store("tweets")
                , model: Tweet

                , loadUser: function(username) {
                    var that = this;
                    while(this.length > 0) {
                        this.each(function(tweet){
                            tweet.destroy();
                        });
                    }
                    $.getJSON(
                        'https://api.twitter.com/1/statuses/user_timeline.json?callback=?'
                        , {
                            include_entities: "true"
                            , include_rts: "true"
                            , screen_name: username
                        }
                        , function(data) {
                            _.each(data, function(tweet) {
                                var newTweet = that.create(tweet);
                            });
                        }); 
                }
            });
        exports.feed = new Feed;
    }
);
