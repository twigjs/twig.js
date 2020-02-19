// Settings model and collection
module.declare(
    [
        {backbone: 'vendor/backbone'}
    ]
    , (require, exports, module) => {
        const Backbone = require('backbone');
        const Setting = Backbone.Model.extend({ });
        const Settings = Backbone.Collection.extend({
            model: Setting,
            localStorage: new Backbone.Store('settings')
        });

        exports.Setting = Setting;
        exports.Settings = Settings;
    }
);
