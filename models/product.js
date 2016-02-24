var mongoose = require('mongoose');
//var Category = require('./category');
var categorySchema = require('./category').categorySchema;

var productSchema = {
  name: { type: String, required: true },
  // Pictures must start with "http://"
  pictures: [{ type: String, match: /^http:\/\//i }],
  price: {
    amount: { type: Number,
              required: true,
              set: function(v) {
                    this.internal.approximatePriceUSD = v;
                    return v;
                  }
    },
    // Only 3 supported currencies for now
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP']
//      required: true
    }
  },
  category: [categorySchema],
  internal: {
    approximatePriceUSD: Number
  }
};

var schema = new mongoose.Schema(productSchema);
var Product = mongoose.model('Product',schema);

var currencySymbols = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£'
};

module.exports.Product = Product;

/*
 * Human-readable string form of price - "$25" rather
 * than "25 USD"
 */
schema.virtual('displayPrice').get(function() {
  return currencySymbols[this.price.currency] +
    '' + this.price.amount;
});

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true }); 



//module.exports.productSchema = productSchema;