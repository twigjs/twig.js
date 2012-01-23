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
                    var that = this
                        , request;
                    while(this.length > 0) {
                        this.each(function(tweet){
                            tweet.destroy();
                        });
                    }
                    request = $.ajax({
                        url: 'https://api.twitter.com/1/statuses/user_timeline.json?callback=?'
                        , dataType: 'json'
                        , data: {
                            include_entities: "true"
                            , include_rts: "true"
                            , screen_name: username
                        }
                    });

                    request.done(function(data) {
                        _.each(data, function(tweet) {
                            var newTweet = that.create(tweet);
                        });
                    });

                    request.error(function(jqXHR, status) {
                        alert("Unable to load tweets, error:\n" + status);
                    });
                }
            });
        exports.feed = new Feed;
    }
);
