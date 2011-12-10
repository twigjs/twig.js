// # Application View
//
// This module contains the view component for the main app.
// It also serves double duty as the application controller.
//
// The template is loaded from templates/app.twig
//

module.declare(
    [
        { twig: "vendor/twig" }
        , { feed: "js/model/feed" }
        , { feedView: "js/view/feedView" }
    ]
    , function (require, exports, module) {
        var twig = require("twig").twig
            , feed = require("feed").feed

            // The application template
            , template = twig({
                href: 'templates/app.twig'
                , async: false
            })
            
            , FeedView = require("feedView").FeedView
            , feedView = new FeedView

            , AppView = Backbone.View.extend({
                tagName: "div"
                , className: "app"

                // Bind to the buttons in the template
                , events: {
                    "click .reloadTweets": "reload"
                    , "click .changeUser": "changeUser"
                }

                // Initialize the Application
                , initialize: function() {
                    this.model.bind("change", this.changeSettings, this);
                    this.feedView = feedView;
                    this.changeSettings();
                }

                // Render the template with the contents of the Setting model
                , render: function() {
                    $(this.el).html(template.render(this.model.toJSON()));

                    this.$(".feedContainer").html(this.feedView.el);
                }

                // Trigger the feed Collection to refresh the twitter feed
                , reload: function() {
                    var username = this.model.get("username");
                    feed.loadUser(username);
                }

                // Update the Setting model associated with this AppView
                //      The change event will trigger a redraw
                , changeUser: function() {
                    var username = prompt("Please enter a twitter username:");
                    this.model.set({
                        username: username
                    });
                    this.model.save();
                }

                // Handle change events from the Setting model
                //      Renders the view and triggers a reload of the feed
                , changeSettings: function() {
                    this.render();
                    this.reload();
                }
            });
            
        exports.AppView = AppView;
    }
);
