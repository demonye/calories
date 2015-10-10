'use strict';

/**
 * @ngdoc function
 * @name calories.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the calories
 */
angular.module('calories')
  .controller('MainCtrl', function ($auth) {
    this.auth = true;   // $auth.validateUser();
  });
