'use strict';

/**
 * @ngdoc function
 * @name calories.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the calories
 */
angular.module('calories')
  .controller('ProfileCtrl', function($rootScope, $filter, $timeout, $location,
        djangoAuth, Users, SweetAlert) {
    var self = this,
        currUser = $rootScope.user;
    self.users = [];
    self.profile = {};
    self.editing = {};
    self.newUser = {};
    self.err = {};

    self.reload = function() {
      Users.getList().then(function(data) {
        for (var i=0; i<data.length; i++) {
          var user = data[i];
          if (user.id == currUser.id) {
            self.profile = self.editing = user;
            data.splice(i, 1);
            break;
          }
        }
        self.users = data;
      });
    };

    self.genders = [
      {value: 'M', text: 'Male'},
      {value: 'F', text: 'Female'},
      {value: 'O', text: 'Other'}
    ];

    self.isAdmin = function() {
      return currUser.is_admin;
    };

    self.showGender = function() {
      var selected = $filter('filter') (self.genders, {value: self.profile.gender});
      return (self.profile.gender && selected.length) ? selected[0].text : '';
    };

    self.save = function() {
      self.saveingNewUser = true;
      Users.post(self.newUser).then(function(data) {
        self.saveingNewUser = false;
        self.newUser = {};
        self.err = {};
        toastr.success("New user added!");
        self.reload();
      }, function(resp) {
        toastr.clear();
        self.err = resp.data;
        toastr.error("Failed to create user " + self.newUser.email + "!");
      });
    };

    self.update = function(profile, field, value) {
      var params = {},
          oldValue = profile[field];
      params[field] = value;
      profile.patch(params).then(function(data) {
        toastr.clear();
        toastr.success("User " + data.email + " updated");
        if (profile.id == currUser.id && field == 'display_name') {
          currUser.displayname = data.display_name || data.email;
        }
      }, function(resp) {
        toastr.clear();
        toastr.error("Failed to update user " + profile.email + "!");
        profile[field] = oldValue;
      });
    };

    var _removeUser = function(user) {
      user.remove().then(function(data) {
        toastr.clear();
        toastr.success("User " + user.email + " deleted!");
        self.reload();
      }, function(resp) {
        toastr.clear();
        toastr.error("Failed to delete user " + user.email + "!");
      });
    };

    self.remove = function(profile) {
      SweetAlert.swal({
        title: "Are you sure?",
        text: "You will not be able to recover the user " + profile.email + "!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dd6b55",
        closeOnConfirm: true,
        closeOnCancel: true
      }, function(isConfirm) {
        if (isConfirm)
          _removeUser(profile);
      });
    };

    self.showDetail = function(profile) {
      var scrollTo = angular.element('#setting-detail').offset().top - 60;
      angular.element('html,body').animate({scrollTop: scrollTo});
      self.editing = profile;
    };

    self.showChangePwd = function() {
      self.changePwd = {};
      self.isShowChangePwd = true;
      $timeout(function() {
        angular.element('#old-password').focus();
      }, 0);
    }

    self.saveChangePwd = function() {
      if (self.changePwd.oldPassword == self.changePwd.newPassword) {
        toastr.error('New password is the same as the old!');
        return;
      }

      djangoAuth.changePassword({
        email: $rootScope.user.email,
        old_password: self.changePwd.oldPassword,
        new_password1: self.changePwd.newPassword,
        new_password2: self.changePwd.newPassword
      });
    };

    $rootScope.$on('auth:password-change-success', function () {
      self.isShowChangePwd = false;
    });

    self.reload();

  });
