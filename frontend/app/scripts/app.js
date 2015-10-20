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
    'ui.router',
    'restangular',
    'infinite-scroll',
    'xeditable',
    'ui.bootstrap',
    'ui.timepicker',
    'datePicker',
    'oitozero.ngSweetAlert'
  ]);
