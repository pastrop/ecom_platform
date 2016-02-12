var mongoose = require('mongoose');

var categorySchema = {
  _id: { type: String },
  parent: {
    type: String,
    ref: 'Category'
  },
  ancestors: [{
    type: String,
    ref: 'Category'
  }]
};
var Category_Schema = new mongoose.Schema(categorySchema);
var Category = mongoose.model('Category', Category_Schema);

module.exports.Category = Category;
module.exports.categorySchema = categorySchema;
module.exports.stuff = 'some stupid stuff';

//Fix module exports later

//exports.Category = Category
//exports.categorySchema = categorySchema

//module.exports = Category;
