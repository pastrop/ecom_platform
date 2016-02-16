var app = require('./server_ecom_test');
var express = require('express');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var Category = require('./models/category').Category;
var Product = require('./models/product').Product;
var User = require('./models/user').User;
var URL_ROOT = 'http://localhost:8080';
var PRODUCT_ID = '000000000000000000000001'; // test product

var users = [{
  profile: {
    username: 'vkarpov15',
    picture: 'http://pbs.twimg.com/profile_images/550304223036854272/Wwmwuh2t.png'
  },
  data: {
    oauth: 'invalid',
    cart: []
  }
}];

chai.use(chaiHttp);

describe('server', function() {
  var server;

  before(function() {
    server = app().listen(8080, function(){
    console.log('Listening on port 8080');    
    });

  });  

  after(function() {
    server.close();
  });
// Clean up the Database
    beforeEach(function(done) {
    // Make don't clean the categories
      Product.remove({}, function(error) {
        User.remove({}, function(error) {
          done();
        });
      });
  });


    beforeEach(function(done) {
    var categories = [
      { _id: 'Electronics' },
      { _id: 'Laptops', parent: 'Electronics' },
      { _id: 'Bacon' }
    ];

    var products = [
      {
        _id: PRODUCT_ID,
        name: 'Asus Zenbook Prime',
        category: { _id: 'Laptops', ancestors: ['Electronics', 'Laptops'] },
        price: {
          amount: 2000,
          currency: 'USD'
        }
      },
      {
        name: 'Flying Pigs Farm Pasture Raised Pork Bacon',
        category: { _id: 'Bacon', ancestors: ['Bacon'] },
        price: {
          amount: 20,
          currency: 'USD'
        }
      }
    ];


    Category.create(categories, function(error) {

      Product.create(products, function(error) {

        User.create(users, function(error) {

          done();
        });
      });
    });
  });


  it('prints out "Beware of the Power of the Force...." when user goes to /starwars', function(done) {
      chai.request(server).get('/starwars').end(function(error, res) {
//      assert.ifError(error);
      res.should.have.status(200);
      res.text.should.be.equal("Beware of the Power of the Force....");
      done();
    });
  });

//real test cases

  it('can load a category by id', function(done) {
    // Create a single category
    Category.create({ _id: 'notebook' }, function(error, doc) {
      var url = '/category/id/notebook';
      // Make an HTTP request to localhost:8080/category/id/phones
      chai.request(server).get(url).end(function(error, res) {
        var result= res.body._id;
        // And make sure we got { _id: 'notebooks' } back
        result.should.be.equal('notebook');
        done();
      });
    });
  });  

//checking the cart functionality:
/*  it('can save users cart', function(done) {
    console.log('users', users);
    var url = '/me/cart';
    chai.request(server).
      put(url).
      send({
        data: {
          cart: [{ product: PRODUCT_ID, quantity: 1 }]
        }
      }).
      end(function(error, res) {
//        assert.ifError(error);
        res.should.have.status(201);
        User.findOne({}, function(error, user) {

          user[0].data.cart.length.should.be.equal(1);
          user[0].data.cart[0].product.should.be.equal(PRODUCT_ID);
          user[0].data.cart[0].quantity.should.be.equal(1);
          done();
        });
      });
  });*/


});





