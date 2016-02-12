var Item = require('../models/item');

exports.save = function(name, callback, errback) {
    Item.create({ name: name }, function(err, item) {
        if (err) {
            errback(err);
            return;
        }
        console.log("item module in services: saved "+"name: "+item.name+" _id: "+item._id);
        callback(item);
    });
};

exports.list = function(callback, errback) {
    Item.find(function(err, items) {
        if (err) {
            errback(err);
            return;
        }
//        console.log(items);
        callback(items);
    });
};

exports.listone = function(id, callback, errback) {
    Item.findByIdAndRemove(id, function(err, item) {
        if (err) {
            errback(err);
            return;
        }
        console.log ('In Service Module: DELETED!!!!!!!!!!')

        callback();
    });
};
exports.change = function(id, name, callback, errback) {
    Item.findOneAndUpdate(id,{name: name}, function(err, item) {
        console.log('id '+ id);
        console.log('name '+ name);

        if (err) {
            errback(err);
            console.log ('Error!');
            return;
        }
        
       
        callback(item);
    });
};