'use strict';

/**
 * @ngdoc function
 * @name calories.controller:BaseCtrl
 * @description
 * # BaseCtrl
 * Controller of the calories
 */
angular.module('calories')
  .controller('BaseCtrl', function (MyAuth) {
    this.logout = MyAuth.signOut;
  });
