var Item = require('../models/item');

exports.run = function(callback, errback) {
    Item.create({name: 'Broad beans'},
                {name: 'Tomatoes'},
                {name: 'Peppers'}, function(err, items) {
        if (err) {
            errback(err);
            return;
        }
        callback(items);
    });
};

exports.run_banana = function(callback, errback) {
    Item.create({name: 'Banana'}, function(err, item) {
        if (err) {
            errback(err);
            return;
        }
        callback(item);
    });
};

exports.run_banana_kill = function(callback, errback) {
    Item.findByNameAndRemove({name: 'Banana'}, function(err, item) {
        if (err) {
            errback(err);
            return;
        }
        callback(item);
    });
};

if (require.main === module) {
    require('./connect');
    exports.run(function() {
        var mongoose = require('mongoose');
        mongoose.disconnect();
    }, function(err) {
        console.error(err);
    });
}