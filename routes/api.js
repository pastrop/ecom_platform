var express = require('express');
var bodyparser = require('body-parser');
var Category = require('../models/category').Category;
var Product = require('../models/product').Product;
var User = require('../models/user').User;
//var auth = ('./auth').auth;

var stuff = require('../models/category').stuff;//this is just a test line
var userstuff = require('../models/user').userstuff;//this is just a test line


var api = express.Router();

api.use(bodyparser.json());

api.get('/starwars', function(request, response) {
    response.send("Beware of the Power of the Force....");
//    console.log('checking auth');
});

  api.get('/category/id/:id', function(req, res) {
    console.log(req.params.id);
      Category.findOne({ _id: req.params.id }, function(error, category) {
        console.log('got into API');
        if (error) {
          return res.
            status('FUCKING INTERNAL_SERVER_ERROR');
        }
        if (!category) {
          console.log('no category');
          return res.
            status(404).
            json({ error: 'Not found-no such category dude' });
        }
        res.json({ category: category });
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
        findOne({ 'category._id': req.params.id }, function(error, products) {
          console.log('got into Product API and printed stuff', userstuff);
          if (error) {
            return res.status('FUCKING INTERNAL_SERVER_ERROR LOOKING FOR A PRODUCT');
          }
          res.json({ products: products });
//         res.json(products); 
        });
    }
  ); 
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
            'profile.username': profile.emails[0].value,
            'profile.picture': 'http://graph.facebook.com/' +
              profile.id.toString() + '/picture?type=large'
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

  api.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/fail' }),
    function(req, res) {
      res.send('Welcome, ' + req.user.profile.username);
    });
//end of authentication ****************************************************

module.exports = api;