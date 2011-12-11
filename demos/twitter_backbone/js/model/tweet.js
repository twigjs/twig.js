// Tweet Model
module.declare(
    [
        { backbone: 'vendor/backbone' } 
    ]
    , function(require, exports, module) {
        var Backbone = require("backbone")
            , Tweet = Backbone.Model.extend({ });

        exports.Tweet = Tweet;
    }
);
