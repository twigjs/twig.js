// # Application View
//
// This module contains the view component for the main app.
// It also serves double duty as the application controller.
//
// The template is loaded from templates/app.twig
//

module.declare(
    [
        {backbone: 'vendor/backbone'},
        {twig: 'vendor/twig'},
        {feed: 'js/model/feed'},
        {feedView: 'js/view/feedView'}
    ]
    , (require, exports, module) => {
        const {twig} = require('twig');
        const Backbone = require('backbone');
        const {feed} = require('feed')

            // The application template
            ; const template = twig({
            href: 'templates/app.twig',
            async: false
        });
        const {FeedView} = require('feedView');
        const feedView = new FeedView();
        const AppView = Backbone.View.extend({
            tagName: 'div',
            className: 'app',

            // Bind to the buttons in the template
            events: {
                'click .reloadTweets': 'reload',
                'click .changeUser': 'changeUser',
                'click .twitter_user': 'twitterLink'
            },

            // Initialize the Application
            initialize() {
                this.model.bind('change', this.changeSettings, this);
                this.feedView = feedView;
                this.changeSettings();
            },

            // Render the template with the contents of the Setting model
            render() {
                $(this.el).html(template.render(this.model.toJSON()));

                this.$('.feedContainer').html(this.feedView.el);
            },

            // Trigger the feed Collection to refresh the twitter feed
            reload() {
                const username = this.model.get('username');
                feed.loadUser(username);
            },

            // Update the Setting model associated with this AppView
            //      The change event will trigger a redraw
            changeUser() {
                const username = prompt('Please enter a twitter username:');
                this.model.set({
                    username
                });
                this.model.save();
            },

            twitterLink(e) {
                const username = $(e.target).attr('user');
                if (username) {
                    this.model.set({
                        username
                    });
                    this.model.save();
                }

                e.preventDefault();
                e.stopPropagation();
            },

            // Handle change events from the Setting model
            //      Renders the view and triggers a reload of the feed
            changeSettings() {
                this.render();
                this.reload();
            }
        });

        exports.AppView = AppView;
    }
);
