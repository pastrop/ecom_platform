exports.AddToCartController = function($scope, $http, $user, $timeout) {
  $scope.addToCart = function(product) {
    var obj = { product: product._id, quantity: 1 };
    $user.user.data.cart.push(obj);    
    $http.
      put('/me/cart', { data: { cart: $user.user.data.cart } }).
      success(function(data) {
        $user.loadUser();
        $scope.success = true;

        $timeout(function() {
          $scope.success = false;
        }, 5000);
      });
  };
};

exports.CategoryProductsController = function($scope, $routeParams, $http) {
  var encoded = encodeURIComponent($routeParams.category);

  $scope.price = undefined;

  $scope.handlePriceClick = function() {
    if ($scope.price === undefined) {
      $scope.price = -1;
    } else {
      $scope.price = 0 - $scope.price;
    }
    $scope.load();
  };

  $scope.load = function() {
    var queryParams = { price: $scope.price };
    $http.
      get('/product/category/' + encoded, { params: queryParams }).
      success(function(data) {
        console.log('product/category');
        console.log(data.products);
        $scope.products = data.products;
      });
  };

  $scope.load();

  setTimeout(function() {
    $scope.$emit('CategoryProductsController');
  }, 0);
};

exports.CategoryTreeController = function($scope, $routeParams, $http) {
  var encoded = encodeURIComponent($routeParams.category);
  console.log('CategoryTreeController encoded:',encoded);
  $http.
    get('/category/id/' + encoded).
    success(function(data) {
//      console.log('/category/id/ - data object being sent back');
//      console.log(data);
//      console.log('--------------------------');
//      console.log(data.ancestors);
      $scope.category = data.ancestors;
      $http.
        get('/category/parent/' + encoded).
        success(function(data) {
//          console.log('/category/parent/');
//          console.log(data);
          if(data.categories[0]){$scope.children = data.categories[0].ancestors;}
        });
    });

  setTimeout(function() {
    $scope.$emit('CategoryTreeController');
  }, 0);
};

exports.CheckoutController = function($scope, $user, $http) {
  // For update cart
  $scope.user = $user;
  console.log('CheckoutController print user object: ',$user);
  $scope.updateCart = function() {
    $http.
      put('/me/cart', $user.user).
      success(function(data) {
        console.log('CheckoutController print data object: ',data);
        $scope.updated = true;
      });
  };

  // For checkout
  Stripe.setPublishableKey('pk_test_KVC0AphhVxm52zdsM4WoBstU');

  $scope.stripeToken = {
    number: '4242424242424242',
    cvc: '123',
    exp_month: '12',
    exp_year: '2016'
  };

  $scope.checkout = function() {
    $scope.error = null;
    Stripe.card.createToken($scope.stripeToken, function(status, response) {
      if (status.error) {
        $scope.error = status.error;
        return;
      }

      $http.
        post('/checkout', { stripeToken: response.id }).
        success(function(data) {
          $scope.checkedOut = true;
          $user.user.data.cart = [];
        });
    });
  };
};

exports.NavBarController = function($scope, $user) {
  $scope.user = $user;

  setTimeout(function() {
    $scope.$emit('NavBarController');
  }, 0);
};

exports.ProductDetailsController = function($scope, $routeParams, $http) {
  var encoded = encodeURIComponent($routeParams.id);

  $http.
    get('/product/id/' + encoded).
    success(function(data) {
      var tmp = data.product.category;
//      console.log('/product/id/');
//      console.log(tmp[0].ancestors);
//      console.log(JSON.stringify(tmp));
      $scope.product = data.product;
      $scope.buttons = tmp[0].ancestors;
    });

  setTimeout(function() {
    $scope.$emit('ProductDetailsController');
  }, 0);
};
