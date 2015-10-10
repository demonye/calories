'use strict';

/**
 * @ngdoc overview
 * @name calories
 * @description
 * # calories
 *
 * Main module of the application.
 */
angular
  .module('calories', [
    // 'ngCookies',
    'ngSanitize',
    'ng-token-auth',
    'ui.router',
    'restangular',
    'infinite-scroll',
    'xeditable'
  ]);
  /*
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
  */
