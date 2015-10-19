'use strict';

/**
 * @ngdoc function
 * @name calories.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the calories
 */
angular.module('calories')
  .controller('MainCtrl', function ($rootScope, $timeout, $filter, Restangular) {
    var self = this,
        currUser = $rootScope.user,
        _nextPage = 1;
    self.showFilter = false;
    self.loading = false;
    self.dates = [];
    self.meals = [];
    self.closeOthers = true;
    self.dt = {
      from: {opened: false, value: ""},
      to: {opened: false, value: ""}
    };
    self.tm = {
      from: {opened: false, value: ""},
      to: {opened: false, value: ""}
    };
    self.dateOptions = { startingDay: 1 };

    self.sumDayCal = function(d) {
      var total = 0;
      self.meals[d].map(function(m) {
        total += m.calorie;
      });
      if (total >= currUser.cal_per_day) {
        var elem = angular.element('[calorie-date="' + d + '"]');
        elem.attr('panel-class', 'panel-danger')
          .removeClass('panel-success')
          .addClass('panel-danger');
      }
      return total;
    };

    self.nextPage = function() {
      if (self.loading)
        return;

      self.loading = true;
      Restangular.all('meals').getList({page: _nextPage}).then(function(data) {
        data.map(function(m) {
          var dtstr = $filter('date')(m.meal_time, 'MMM dd, yyyy');
          if (self.dates.indexOf(dtstr) == -1) {
            self.dates.push(dtstr);
            self.meals[dtstr] = [m];
          } else {
            self.meals[dtstr].push(m);
          }
        });
        _nextPage += 1;
        self.loading = false;
      }, function(resp) {
        $timeout(function() {
          self.loading = false;
        }, 5000);
      });
    };

    self.nextPage();
  });
