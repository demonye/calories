'use strict';

/**
 * @ngdoc function
 * @name calories.controller:BaseCtrl
 * @description
 * # BaseCtrl
 * Controller of the calories
 */
angular.module('calories')
  .controller('BaseCtrl', function ($rootScope, $state, $auth, $http, ApiEndpoint) {
    this.logout = function() {
      $http.post(ApiEndpoint.url + '/auth/logout/').success(function(resp) {
        $auth.invalidateTokens();
        $rootScope.$broadcast('auth:logout-success');
      }).error(function(resp) {
        $auth.invalidateTokens();
        $rootScope.$broadcast('auth:logout-error', resp);
      });
    };
  });
