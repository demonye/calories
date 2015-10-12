'use strict';

/**
 * @ngdoc function
 * @name calories.controller:AuthCtrl
 * @description
 * # AuthCtrl
 * Controller of the calories
 */
angular.module('calories')

  .controller('AuthCtrl', function ($scope) {
    $scope.authTitle = "";
  })

  .controller('LoginCtrl', function($rootScope, $scope, $state, $auth, $http, ApiEndpoint) {
    $scope.$parent.authTitle = "Login";
    var self = this;
    self.loginForm = {};

    self.submitLoginForm = function() {
      if (/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(self.loginForm.username)) {
        self.loginForm.email = self.loginForm.username;
        delete self.loginForm.username;
      }
      $auth.submitLogin(self.loginForm)
        .then(function(resp) {
          delete self.loginForm.password;
          $rootScope.user = self.loginForm;
        });
    };
    self.showRegisterForm = function() {
      $state.go('auth.register');
    };
    self.showResetPasswordForm = function() {
      $state.go('auth.reset-password');
    };
  })

  .controller('RegisterCtrl', function($scope, $state, $auth) {
    $scope.$parent.authTitle = "Register";
    var self = this;
    self.registerForm = {};

    self.submitRegisterForm = function() {
      console.log(self.registerForm);
    };
    self.showLoginForm = function() {
      $state.go('auth.login');
    };
  })

  .controller('ResetPasswordCtrl', function($scope, $state, $auth) {
    $scope.$parent.authTitle = "Reset Password";
    var self = this;
    self.resetForm = {};

    self.sendResetEmail = function() {
      console.log(self.resetForm);
    };
    self.showLoginForm = function() {
      $state.go('auth.login');
    };
  })

  .controller('ChangePasswordCtrl', function($scope, $state, $auth) {
    $scope.$parent.authTitle = "Change Password";
    var self = this;
    self.changeForm = {};
    self.submitChangeForm = function() {
      console.log(self.changeForm);
    };
  })
  ;

