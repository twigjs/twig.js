// # Application JS file
//
// Launch the application.
//

module.declare(
    [
        { settings: "js/model/settings" }
        , { appView: "js/view/appView" }
    ]
    , function (require, exports, module) {
        var Settings = require("settings").Settings
            , AppView = require("appView").AppView

            // Models
            , settingId = 0
            , settings = new Settings;

        // Load from local storage
        settings.fetch();
        
        var setting = settings.get(settingId),
            username = null;

        // Initialize the settings model with a username
        if (!setting || !setting.get("username")) {
            username = prompt("Please enter a twitter username:");
            setting = settings.create({
                "id": settingId
                , "username": username
            });
            setting.save();
        }

        // Create the view and kick off the application
        var appView = new AppView({
            model: setting
        });

        $("body").append(appView.el);
    }
);

