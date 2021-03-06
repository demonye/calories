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

  .controller('LoginCtrl', function($rootScope, $scope, $state, $cookies, djangoAuth, ApiEndpoint) {
    $scope.$parent.authTitle = "Login";
    var self = this;
    self.form = $cookies.getObject('loginForm') || {};

    self.submit = function() {
      if (self.form.remember) {
        $cookies.putObject('loginForm', self.form);
      } else {
        $cookies.remove('loginForm');
      }
      djangoAuth.login(self.form);
    };
    angular.element('input[name=email]').focus();
  })

  .controller('RegisterCtrl', function($scope, $state, djangoAuth) {
    $scope.$parent.authTitle = "Register";
    var self = this;
    self.form = {};

    self.submit = function() {
      self.form.password2 = self.form.password1;
      djangoAuth.register(self.form);
    };
    angular.element('input[name=email]').focus();
  })

  .controller('ConfirmRegisterCtrl', function($scope, $state, djangoAuth) {
    self.form = $state.params;
    djangoAuth.verify(self.form);
  })

  .controller('ResetPasswordCtrl', function($scope, $state, djangoAuth) {
    $scope.$parent.authTitle = "Reset Password";
    var self = this;
    self.form = {};

    self.submit = function() {
      djangoAuth.resetPassword(self.form);
    };
    angular.element('input[name=email]').focus();
  })

  .controller('ConfirmResetCtrl', function($scope, $state, djangoAuth) {
    $scope.$parent.authTitle = "Input New Password";
    var self = this;
    self.form = $state.params;

    self.submit = function() {
      self.form.new_password2 = self.form.new_password1;
      djangoAuth.confirmReset(self.form);
    };
  })
  ;

