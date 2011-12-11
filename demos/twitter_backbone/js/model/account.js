module.declare(
    [
        { backbone: 'vendor/backbone' }
    ]
    , function(require, exports, module) {
        var Backbone = require('backbone')
            , Account = Backbone.Model.extend({ });

        return Account;
    }
);
