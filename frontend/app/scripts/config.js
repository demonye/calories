'use strict';

angular.module('calories')

.constant('ApiEndpoint', {
  url: '/api/v1'
})

.config(function($stateProvider, $urlMatcherFactoryProvider, ApiEndpoint,
      $urlRouterProvider, RestangularProvider, $authProvider) {

  $authProvider.configure({apiUrl: ApiEndpoint.url});
  RestangularProvider.setBaseUrl(ApiEndpoint.url);
  /*
  RestangularProvider.setRequestSuffix('.json');
  */
  RestangularProvider.addResponseInterceptor(function (data, operation) {
    var extractedData;
    if (operation === 'getList' && !angular.isArray(data)) {
      extractedData = data.results;
      delete data.results;
      extractedData.meta = data;
    } else {
      extractedData = data;
    }
    return extractedData;
  });
  toastr.options = {
    "closeButton": true
  };

  $urlMatcherFactoryProvider.strictMode(false);
  $urlRouterProvider.otherwise("/index/404");
  $urlRouterProvider.when('', '/index/meals');

  $stateProvider
    .state('index', {
      abstract: true,
      url: "/index",
      templateUrl: "views/common.html",
      resolve: {
        auth: function($auth, $state) {
          return $auth.validateUser().catch(function(ev, reason) {
            $state.go('index.login');
          });
        }
      }
    })
    .state('index.login', {
      url: "/login",
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })
    .state('index.register', {
      url: "/register",
      templateUrl: 'views/register.html',
      controller: 'RegisterCtrl'
    })
    .state('index.meals', {
      url: "/meals",
      templateUrl: 'views/meals.html',
      controller: 'MealCtrl'
    })
    .state('index.settings', {
      url: "/settings",
      templateUrl: 'views/settings.html',
      controller: 'SettingCtrl'
    })
    .state('index.404', {
      url: "/404",
      templateUrl: 'views/404.html'
    });
});
