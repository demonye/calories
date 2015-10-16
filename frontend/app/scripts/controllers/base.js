'use strict';

/**
 * @ngdoc function
 * @name calories.controller:BaseCtrl
 * @description
 * # BaseCtrl
 * Controller of the calories
 */
angular.module('calories')
  .controller('BaseCtrl', function (djangoAuth) {
    this.logout = function() {
      djangoAuth.logout();
    };
  });
