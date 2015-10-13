'use strict';

/**
 * @ngdoc function
 * @name calories.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the calories
 */
angular.module('calories')
  .controller('ProfileCtrl', function($rootScope, $filter, Restangular) {
    var self = this,
        user = Restangular.one('users', $rootScope.user.id).get();
    self.profile = {};
    user.then(function(data) {
        self.profile = data;
      });

    self.genders = [
      {value: 'M', text: 'Male'},
      {value: 'F', text: 'Female'},
      {value: 'O', text: 'Other'}
    ];

    self.showGender = function() {
      var selected = $filter('filter') (self.genders, {value: self.profile.gender});
      return (self.profile.gender && selected.length) ? selected[0].text : '';
    };

    self.update = function(profile, field, value) {
      self.profile[field] = value;
      self.profile.put().then(function(data) {
        toastr.clear();
        toastr.success('Profile updated');
      });
    };

  });
