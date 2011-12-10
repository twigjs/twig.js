// Settings model and collection
module.declare(function(require, exports, module) {
    var Setting = Backbone.Model.extend({
    });

    var Settings = Backbone.Collection.extend({
        model: Setting
        , localStorage: new Store("settings")
    })

    exports.Setting = Setting;
    exports.Settings = Settings;
});
