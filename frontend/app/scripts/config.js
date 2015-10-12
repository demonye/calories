'use strict';

angular.module('calories')

.constant('ApiEndpoint', {
  // url: 'http://localhost:8000/api/v1'
  url: '/api/v1'
})

.config(function($stateProvider, $urlMatcherFactoryProvider, ApiEndpoint,
      $urlRouterProvider, $httpProvider, RestangularProvider, $authProvider) {

  // $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $authProvider.configure({
    apiUrl: ApiEndpoint.url,
    emailSignInPath: '/auth/login/',
    signOutUrl: '/auth/logout/'
  });
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
    .state('index', {
      abstract: true,
      url: "/index",
      templateUrl: "views/common.html",
      resolve: {
        auth: function($auth, $state) {
          return $auth.validateUser().catch(function(ev, reason) {
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
      controller: 'ProfileCtrl as profile'
    })
    .state('index.404', {
      url: "/404",
      templateUrl: 'views/404.html'
    });
})

.run(function($rootScope, $state) {
  $rootScope.$on('auth:login-success', function(ev, resp) {
    $state.go('index.main');
  });

  $rootScope.$on('auth:login-error', function(ev, reason) {
    toastr.error('Login failed: ' + reason.errors);
  });

  $rootScope.$on('auth:logout-success', function(ev) {
    $state.go('auth.login');
  });

  $rootScope.$on('auth:logout-error', function(ev, reason) {
    toastr.error('Logout failed: ' + reason.errors);
  });

  $rootScope.$on('auth:registration-email-success', function (ev, message) {
    toastr.success("A registration email was sent to " + message.email);
  });

  $rootScope.$on('auth:registration-email-error', function (ev, reason) {
    toastr.error("Registration failed: " + reason.errors);
  });

  $rootScope.$on('auth:email-confirmation-success', function (ev, user) {
    toastr.success("Welcome, " + user.email + ". Your account has been verified.");
    $rootScope.user = user;
    $state.go('index.main');
  });

  $rootScope.$on('auth:email-confirmation-error', function (ev, reason) {
    toastr.error("Registration failed: " + reason.errors);
    toastr.error("There was an error with your registration.");
  });

  $rootScope.$on('auth:password-reset-request-success', function (ev, data) {
    toastr.success("Password reset instructions were sent to " + data.email);
  });

  $rootScope.$on('auth:password-reset-request-error', function (ev, reason) {
    toastr.error("Password reset request failed: " + reason.errors[0]);
  });

  $rootScope.$on('auth:password-reset-confirm-success', function () {
    toastr.success("Your password reset has been confirmed!");
    $state.go('auth.reset-password');
  });

  $rootScope.$on('auth:password-reset-confirm-error', function (ev, reason) {
    toastr.error("Unable to verify your account. Please try again.");
  });

  $rootScope.$on('auth:password-change-success', function (ev) {
    toastr.success("Your password has been successfully updated!");
  });

  $rootScope.$on('auth:password-change-error', function (ev, reason) {
    toastr.error("Password change failed: " + reason.errors.full_messages);
  });

  $rootScope.$on('auth:account-update-success', function (ev) {
    toastr.success("Your account has been successfully updated!");
  });

  $rootScope.$on('auth:account-update-error', function (ev, reason) {
    toastr.error("Account update failed: " + reason.errors.full_messages);
  });

  $rootScope.$on('auth:account-destroy-success', function (ev) {
    toastr.success("Your account has been successfully destroyed!");
  });

  $rootScope.$on('auth:account-destroy-error', function (ev, reason) {
    toastr.error("Account deletion failed: " + reason.errors.full_messages);
  });

  $rootScope.$on('auth:session-expired', function (ev) {
    toastr.warning('Session has expired');
  });
})
;
