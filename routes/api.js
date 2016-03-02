var express = require('express');
var bodyparser = require('body-parser');
var Category = require('../models/category').Category;
var Product = require('../models/product').Product;
var User = require('../models/user').User;
var Stripe = require('stripe')('Stripe - api');
var _ = require('underscore');
//var auth = ('./auth').auth;

var stuff = require('../models/category').stuff;//this is just a test line
var userstuff = require('../models/user').userstuff;//this is just a test line

//Here is another test fixture:
var user = { //this is a totally fake user to be used if there is not logged in user - Test only!!!
  profile: {
    username: 'testuser',
    picture: 'http://pbs.twimg.com/profile_images/550304223036854272/Wwmwuh2t.png'
  },
  data: {
    oauth: 'invalid',
    cart: []
  }
};

var api = express.Router();

api.use(bodyparser.json());

api.get('/starwars', function(request, response) {
    response.send("Beware of the Power of the Force....");
//    console.log('checking auth');
});

  api.get('/category/id/:id', function(req, res) {
//    console.log(req.params.id);
      Category.findOne({ _id: req.params.id }, function(error, category) {
//        console.log('got into API');
        if (error) {
          return res.
            status('FUCKING INTERNAL_SERVER_ERROR');
        }
        if (!category) {
//          console.log('no category');
          return res.
            status(404).
            json({ error: 'Not found-no such category dude' });
        }
//        res.json({ category: category });
        res.json(category);
      });
    }
  );

  api.get('/category/parent/:id', function(req, res) {
      Category.
        find({ parent: req.params.id }).
        sort({ _id: 1 }).
        exec(function(error, categories) {
          if (error) {
            return res.
              status('FUCKING INTERNAL_SERVER_ERROR');
          }
          res.json({ categories: categories });
        });
    }
  );
//New Code - Looking for products

  api.get('/product/category/:id', function(req, res) {
      Product.
        find({ 'category._id': req.params.id }, function(error, products) {
//          console.log('got into Product API and printed stuff', req.params.id);
          if (error) {
            return res.status('FUCKING INTERNAL_SERVER_ERROR LOOKING FOR A PRODUCT');
          }
          res.json({ products: products });
//         res.json(products); 
        });
    }
  ); 

    api.get('/product/id/:id',function(req, res) {
//      console.log(req.params.id);
      Product.findOne({ _id: req.params.id },handleOne.bind(null, 'product', res));
  });
//here comes authentication crap*************************

  var passport = require('passport');
  var FacebookStrategy = require('passport-facebook').Strategy;

  // High level serialize/de-serialize configuration for passport
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id : id }).
      exec(done);
  });

  // Facebook-specific
  passport.use(new FacebookStrategy(
    {
      clientID: 927630150619529,
      clientSecret: '5f7cbce1a79d4d1bac6aea1deae6ab88',
      callbackURL: 'http://localhost:8080/auth/facebook/callback'
//      callbackURL: 'http://localhost:8080/'
    },
    function(accessToken, refreshToken, profile, done) {
//      if (!profile.emails || !profile.emails.length) {
//        return done('No emails associated with this account!');
//      }
      console.log('auth data', profile.id.toString());
      User.findOneAndUpdate(
        { 'data.oauth': profile.id },
        {
          $set: {
            'profile.username': profile.displayName
//            'profile.picture': 'http://graph.facebook.com/' +
//              profile.id.toString() + '/picture?type=large'
          }
        },
        { 'new': true, upsert: true, runValidators: true },
        function(error, user) {
          done(error, user);
        });
    }));

  // Express middlewares
  api.use(require('express-session')({
    secret: 'this is a secret'
  }));
  api.use(passport.initialize());
  api.use(passport.session());

  // Express routes for auth
  api.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] }));

//    api.get('/',
    api.get('/auth/facebook/callback',  
    passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/fail' }),
    function(req, res) {   
      console.log('Welcome, ' + req.user.profile.username);
      res.send('Welcome, ' + req.user.profile.username);
//       res.redirect('/');
       
    });
//end of authentication ****************************************************

// User / User-card piece

  api.get('/me', function(req, res) { //User handle
    if (!req.user) {    
      return res.json({ error: 'Not logged in' });

    }
//    console.log('/me handle - data.cart.product: ', data.cart.product);

    req.user.populate({ path: 'data.cart.product', model: 'Product' },
      handleOne.bind(null, 'user', res));
  });

    api.put('/me/cart', function(req, res) {
      try {
//        if(!req.user){//test user - test fixture only!!!!! 
//          req.user = user; 
//          console.log(req.user);
//        }
        var cart = req.body.data.cart; 
        console.log('api /me/cart handle - cart content: ', cart);
      } catch(e) {
        return res.
//          status(status.BAD_REQUEST).
          json({ error: 'No cart specified!' });
      }

      req.user.data.cart = cart;
      console.log('print in api.js line 167: req.user',req.user.profile.username);
      User.findOneAndUpdate({"profile.username": req.user.profile.username},{"data.cart": req.user.data.cart},{upsert: true, 'new': true},function(error, user) { //this doesn't really work, save method has issues
        if (error) {
          return res.
//            status(status.INTERNAL_SERVER_ERROR).
            json({ error: error.toString() });
        }        
        console.log('api inside findOneAndUpdate: ', user);
        return res.json({ user: user });
      });
    });

  api.post('/checkout', function(req, res) {
      if (!req.user) {
        return res.
//          status(status.UNAUTHORIZED).
          json({ error: 'Not logged in' });
      }

      // Populate the products in the user's cart
      req.user.populate({ path: 'data.cart.product', model: 'Product' }, function(error, user) {

        // Sum up the total price in USD
        var totalCostUSD = 0;
        console.log ('/checkout handle populate function cart content: ', user.data.cart)
        _.each(user.data.cart, function(item) {
//          console.log('***inside _.each function in checkout: ', item.product.internal.approximatePriceUSD);
          totalCostUSD += item.product.internal.approximatePriceUSD *item.quantity;
//          console.log('***inside _.each function in checkout totalCostUSD: ',totalCostUSD);
        });

        // And create a charge in Stripe corresponding to the price
        Stripe.charges.create(
          {
            // Stripe wants price in cents, so multiply by 100 and round up
            amount: Math.ceil(totalCostUSD * 100),
            currency: 'usd',
            source: req.body.stripeToken,
            description: 'Example charge'
          },
          function(err, charge) {
            if (err && err.type === 'StripeCardError') {
              return res.
                status(status.BAD_REQUEST).
                json({ error: err.toString() });
            }
            if (err) {
              console.log(err);
              return res.
                status(status.INTERNAL_SERVER_ERROR).
                json({ error: err.toString() });
            }

            req.user.data.cart = [];
            req.user.save(function() {
              // Ignore any errors - if we failed to empty the user's
              // cart, that's not necessarily a failure

              // If successful, return the charge id
              return res.json({ id: charge.id });
            });
          });
      });
    });//end of checkout



module.exports = api;

function handleOne(property, res, error, result) {
  if (error) {
    return res.
//      status(status.INTERNAL_SERVER_ERROR).
      json({ error: error.toString() });
  }
  if (!result) {
    return res.
//      status(status.NOT_FOUND).
      json({ error: 'Not found - me/cart handle' });
  }

  var json = {};
  json[property] = result;
  res.json(json);
}