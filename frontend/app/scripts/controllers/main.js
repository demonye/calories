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
        prevDate;

    self.dateOptions = { startingDay: 1 };

    self.sumDateCal = function(d) {
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

    self.loadMore = function(params) {
      if (params == undefined) {
        params = {};
        if (prevDate)
          params.to_date =  prevDate;
      }
      self.loading = true;
      Restangular.all('meals').getList(params).then(function(data) {
        data.map(function(m) {
          var dtstr = m.meal_date_str;
          if (self.dates.indexOf(dtstr) == -1) {
            self.dates.push(dtstr);
            self.meals[dtstr] = [m];
          } else {
            self.meals[dtstr].push(m);
          }
        });
        if (data.length == 0) {
          $timeout(function() {
            self.loading = false;
            self.noMore = true;
          }, 0);
        } else {
          self.loading = false;
          prevDate = data.meta.prev_date;
        }
      });
    };

    self.applyFilter = function() {
      self.filter.from_date = $filter('date')(self.filter.from_date, 'yyyy-MM-dd');
      self.filter.to_date = $filter('date')(self.filter.to_date, 'yyyy-MM-dd');
      self.filter.from_time = $filter('date')(self.filter.from_time, 'HH:mm');
      self.filter.to_time = $filter('date')(self.filter.to_time, 'HH:mm');
      self.meals = self.dates = [];
      self.loadMore(self.filter);
    };

    self.clearFilter = function() {
      self.filter = {
        from_date: "",
        to_date: "",
        from_date: "",
        to_time: ""
      };
      prevDate = null;
      self.loading = false;
      self.noMore = false;
      self.dates = [];
      self.meals = [];

      self.loadMore();
    };

    self.clearFilter();
  });
