var mongoose = require('mongoose');

var userSchema ={
  profile: {
    username: {
      type: String,
      required: true,
      lowercase: true
    },
    picture: {
      type: String,
//      required: true,
      match: /^http:\/\//i
    }
  },
  data: {
    oauth: { type: String, required: true },
    cart: [{
      product: {
        type: mongoose.Schema.Types.ObjectId
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1
      }
    }]
  }
};

var User_Schema = new mongoose.Schema(userSchema);
var User = mongoose.model('User', User_Schema);

module.exports.User = User;
module.exports.userstuff = 'some stupid users';
//module.exports.userSchema = User_Schema;

//module.exports.set('toObject', { virtuals: true });
//module.exports.set('toJSON', { virtuals: true });
