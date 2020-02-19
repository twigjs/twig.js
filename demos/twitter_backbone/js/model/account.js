module.declare(
    [
        {backbone: 'vendor/backbone'}
    ]
    , (require, exports, module) => {
        const Backbone = require('backbone');
        const Account = Backbone.Model.extend({ });

        return Account;
    }
);
