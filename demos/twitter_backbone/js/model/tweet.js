// Tweet Model
module.declare(
    [
        {backbone: 'vendor/backbone'}
    ]
    , (require, exports, module) => {
        const Backbone = require('backbone');
        const Tweet = Backbone.Model.extend({ });

        exports.Tweet = Tweet;
    }
);
