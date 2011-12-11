// Settings model and collection
module.declare(
    [
        { backbone: 'vendor/backbone' } 
    ]
    , function(require, exports, module) {
        var Backbone = require("backbone")
            , Setting = Backbone.Model.extend({ })
            , Settings = Backbone.Collection.extend({
                model: Setting
                , localStorage: new Backbone.Store("settings")
            });

        exports.Setting = Setting;
        exports.Settings = Settings;
    }
);
