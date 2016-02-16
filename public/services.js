//var status = require('http-status');

exports.$user = function($http) {
  var s = {};

  s.loadUser = function() {
    $http.
      get('/me').
      success(function(data) {
        s.user = data.user;
      }).
      error(function(data, $status) {
        if ($status > 400) {
          console.log('something went terribly wrong....', $status);
          s.user = null;
        }
      });
  };

  s.loadUser();

  setInterval(s.loadUser, 60 * 60 * 1000);

  return s;
};
