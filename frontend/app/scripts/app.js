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
    'ngCookies',
    'ngSanitize',
    'ng-token-auth',
    'ui.router',
    'restangular',
    'infinite-scroll',
    'xeditable',
    'ui.bootstrap',
    'oitozero.ngSweetAlert'
  ]);
