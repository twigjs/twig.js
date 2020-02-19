// # Application JS file
//
// Launch the application.
//

module.declare(
    [
        {settings: 'js/model/settings'},
        {appView: 'js/view/appView'}
    ]
    , (require, exports, module) => {
        const {Settings} = require('settings');
        const {AppView} = require('appView')

            // Models
            ; const settingId = 0;
        const settings = new Settings();

        // Load from local storage
        settings.fetch();

        let setting = settings.get(settingId);
        let username = null;

        // Initialize the settings model with a username
        if (!setting || !setting.get('username')) {
            username = prompt('Please enter a twitter username:');
            setting = settings.create({
                id: settingId,
                username
            });
            setting.save();
        }

        // Create the view and kick off the application
        const appView = new AppView({
            model: setting
        });

        $('body').append(appView.el);
    }
);

