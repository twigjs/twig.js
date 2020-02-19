module.declare(
    [
        {backbone: 'vendor/backbone'},
        {underscore: 'vendor/underscore'},
        {tweet: 'js/model/tweet'}
    ],
    (require, exports, module) => {
        const Backbone = require('backbone');
        const {_} = require('underscore');
        const {Tweet} = require('tweet');
        const Feed = Backbone.Collection.extend({
            localStorage: new Backbone.Store('tweets'),
            model: Tweet,

            loadUser(username) {
                const that = this;
                let request;
                while (this.length > 0) {
                    this.each(tweet => {
                        tweet.destroy();
                    });
                }

                request = $.ajax({
                    url: 'https://api.twitter.com/1/statuses/user_timeline.json?callback=?',
                    dataType: 'json',
                    data: {
                        include_entities: 'true',
                        include_rts: 'true',
                        screen_name: username
                    }
                });

                request.done(data => {
                    _.each(data, tweet => {
                        const newTweet = that.create(tweet);
                    });
                });

                request.error((jqXHR, status) => {
                    alert('Unable to load tweets, error:\n' + status);
                });
            }
        });
        exports.feed = new Feed();
    }
);
