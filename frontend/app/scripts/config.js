'use strict';

angular.module('calories')

.constant('ApiEndpoint', {
  // url: 'http://localhost:8000/api/v1'
  url: '/api/v1'
})

.config(function($stateProvider, $urlMatcherFactoryProvider, ApiEndpoint,
      $urlRouterProvider, $httpProvider, RestangularProvider) {

  // $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
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

  $urlMatcherFactoryProvider.strictMode(false);
  $urlRouterProvider.otherwise("/index/404");
  $urlRouterProvider.when('', '/index/main');

  $stateProvider
    .state('auth', {
      abstract: true,
      url: "/auth",
      templateUrl: "views/auth.html"
    })
    .state('auth.login', {
      url: "/login",
      templateUrl: 'views/login.html',
      parent: 'auth',
      controller: 'LoginCtrl as login'
    })
    .state('auth.register', {
      url: "/register",
      templateUrl: 'views/register.html',
      controller: 'RegisterCtrl as register'
    })
    .state('auth.register-confirm', {
      url: "/register-confirm/{key}",
      templateUrl: 'views/register-confirm.html',
      controller: 'ConfirmRegisterCtrl as confirm_reg'
    })
    .state('auth.change-password', {
      url: "/change-password",
      templateUrl: 'views/change-password.html',
      controller: 'ChangePasswordCtrl as change'
    })
    .state('auth.reset-password', {
      url: "/reset-password",
      templateUrl: 'views/reset-password.html',
      controller: 'ResetPasswordCtrl as reset'
    })
    .state('auth.reset-confirm', {
      url: "/reset-confirm/{uid}/{token}",
      templateUrl: 'views/reset-confirm.html',
      controller: 'ConfirmResetCtrl as confirm_reset'
    })
    .state('index', {
      abstract: true,
      url: "/index",
      templateUrl: "views/common.html",
      resolve: {
        auth: function(djangoAuth, $state) {
          return djangoAuth.profile().then(angular.noop,
              function(resp, status) {
                $state.go('auth.login');
              });
        }
      }
    })
    .state('index.main', {
      url: "/main",
      templateUrl: 'views/main.html',
      controller: 'MainCtrl as main'
    })
    .state('index.profile', {
      url: "/profile",
      templateUrl: 'views/profile.html',
      controller: 'ProfileCtrl as prof'
    })
    .state('index.404', {
      url: "/404",
      templateUrl: 'views/404.html'
    });
})

.run(function($rootScope, $state, $cookies, $http, djangoAuth, ApiEndpoint, editableOptions) {
  djangoAuth.initialize(ApiEndpoint.url + '/auth', false);
  editableOptions.theme = 'bs3';
  toastr.options = {
    "closeButton": true
  };
  if ($cookies.token) {
    $http.defaults.headers.common.Authorization = 'Token ' + $cookies.token;
  }

  $rootScope.$on('auth:login-success', function(ev, resp) {
    toastr.clear();
    $state.go('index.main');
  });

  $rootScope.$on('auth:login-error', function(ev, resp) {
    toastr.clear();
    toastr.error('Login failed: ' + resp.non_field_errors);
  });

  $rootScope.$on('auth:validation-success', function(ev, resp) {
    $rootScope.user = resp;
  });

  $rootScope.$on('auth:validation-error', function(ev, resp) {
    $state.go('auth.login');
  });

  $rootScope.$on('auth:logout-success', function() {
    $state.go('auth.login');
  });

  $rootScope.$on('auth:logout-error', function(ev, resp) {
    toastr.clear();
    toastr.error('Logout failed: ' + resp.non_field_errors);
  });

  $rootScope.$on('auth:registration-email-success', function (ev, message) {
    toastr.clear();
    toastr.success("A registration email was sent to " + message.email);
  });

  $rootScope.$on('auth:registration-email-error', function (ev, resp) {
    toastr.clear();
    if (resp.email)
      toastr.error("Registration failed: " + resp.email[0]);
    else if (resp.non_field_errors)
      toastr.error("Registration failed: " + resp.non_field_errors);
  });

  $rootScope.$on('auth:email-confirmation-success', function (ev, resp) {
    $state.go('index.main');
    toastr.clear();
    toastr.success("Welcome, your account has been verified.");
  });

  $rootScope.$on('auth:email-confirmation-error', function (ev, resp) {
    toastr.clear();
    toastr.error("There was an error with your registration.");
  });

  $rootScope.$on('auth:password-reset-request-success', function (ev, data) {
    console.log(data);
    toastr.clear();
    toastr.success("Password reset instructions were sent to " + data.email);
  });

  $rootScope.$on('auth:password-reset-request-error', function (ev, resp) {
    toastr.clear();
    toastr.error("Password reset request failed: " + resp.non_field_errors);
  });

  $rootScope.$on('auth:password-reset-confirm-success', function () {
    toastr.clear();
    toastr.success("Your password reset has been confirmed!");
    $state.go('auth.login');
  });

  $rootScope.$on('auth:password-reset-confirm-error', function (ev, resp) {
    toastr.clear();
    toastr.error("Unable to verify your account. Please try again.");
  });

  $rootScope.$on('auth:password-change-success', function (ev) {
    toastr.clear();
    toastr.success("Your password has been successfully updated!");
  });

  $rootScope.$on('auth:password-change-error', function (ev, resp) {
    toastr.clear();
    var err = resp.old_password;
    toastr.error("Password change failed: " + err);
  });

  $rootScope.$on('auth:account-update-success', function (ev) {
    toastr.clear();
    toastr.success("Your account has been successfully updated!");
  });

  $rootScope.$on('auth:account-update-error', function (ev, resp) {
    toastr.clear();
    toastr.error("Account update failed: " + resp.non_field_errors);
  });

  $rootScope.$on('auth:session-expired', function (ev) {
    toastr.clear();
    toastr.warning('Session has expired');
  });
})
;
