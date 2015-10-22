'use strict';

/**
 * @ngdoc function
 * @name calories.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the calories
 */
angular.module('calories')
  .controller('MainCtrl', function ($rootScope, $timeout, $filter, Users, Meals, Restangular, SweetAlert) {
    var self = this,
        currUser = $rootScope.user,
        prevDate;

    self.dateOptions = { startingDay: 1 };
    self.timeOptions = { timeFormat: 'H:i' };
    self.calories = {};
    self.showDate = {};
    self.editing = {};
    self.origMeal = {};

    Users.getList().then(function(data) {
      self.users = data;
      for (var i=0; i<data.length; i++) {
        if (currUser.id == data[i].id) {
          self.dispUser = data[i];
          self.clearFilter();
          break;
        }
      }
    });

    self.displayName = function(u) {
      return u.display_name || u.email;
    };

    self.changeDispUser = function(u) {
      self.applyFilter();
    };

    self.toggleDate = function(d) {
      self.showDate[d] = !self.showDate[d];
    };

    self.editingMeal = function(m, idx) {
      var mealTime = new Date(m.meal_date_str + 'T' + m.meal_time_str + ':00');
      mealTime.setTime(mealTime.getTime() + mealTime.getTimezoneOffset()*60*1000);
      self.origMeal[m.id] = {date: m.meal_date_str, idx: idx};
      self.editing[m.id] = Restangular.copy(m);
      self.editing[m.id].meal_time = mealTime;
    };

    self.sumDateCal = function(d) {
      var total = 0;
      self.meals[d].map(function(m) {
        total += m.calorie;
      });
      self.calories[d] = total;
      return total;
    };

    self.successOrDanger = function(d) {
      return (self.calories[d] >= self.dispUser.cal_per_day) ? 'panel-danger' : 'panel-success';
    };

    self.loadMore = function(params) {
      if (params == undefined) {
        params = {};
        if (prevDate)
          params.to_date =  prevDate;
      }
      self.loading = true;
      if (self.dispUser) {
        Meals.query(self.dispUser).getList(params).then(function(data) {
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
      }
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

    self.closeEditing = function(mid) {
      delete self.editing[mid];
    };

    self.addMeal = function(meal) {
      meal.meal_date_str = $filter('date')(meal.meal_date_str, 'yyyy-MM-dd');
      meal.meal_time_str = $filter('date')(meal.meal_time, 'HH:mm');
      delete meal.meal_time;
      meal.user = self.dispUser.url;
      Meals.query(self.dispUser).post(meal).then(function(data) {
        var dtstr = data.meal_date_str;
        self.addNewMeal = false;
        if (self.meals[dtstr]) {
          self.meals[dtstr].push(data);
        } else {
          self.meals[dtstr] = data;
        }
        if (!self.dates[dtstr]) {
          self.dates.push(dtstr);
        }
        self.showDate[dtstr] = true;
        self.newMeal = {};
        toastr.clear();
        toastr.success("Meal added!");
      }, function(resp) {
        toastr.clear();
        toastr.error("Failed to add meal: " + resp);
      });
    };

    self.saveMeal = function(meal) {
      var tm = meal.meal_time;
      meal.meal_time_str = $filter('date')(tm, 'HH:mm');
      meal.put().then(function(m) {
        var orig = self.origMeal[m.id];
        self.meals[orig.date][orig.idx] = m;
        toastr.clear();
        toastr.success("Meal updated!");
        self.closeEditing(m.id);
      }, function(resp) {
        toastr.clear();
        toastr.error("Failed to update meal: " + resp);
      });
    };

    var _removeMeal = function(meal) {
      var mid = meal.id;
      meal.remove().then(function() {
        var orig = self.origMeal[mid];
        self.meals[orig.date].splice(orig.idx, 1);
        if (self.meals[orig.date].length == 0) {
          var idx = self.dates.indexOf(orig.date);
          if (idx >= 0)
            self.dates.splice(idx, 1);
        }
        toastr.clear();
        toastr.success("Meal deleted!");
      }, function(resp) {
        toastr.clear();
        toastr.error("Failed to delete meal: " + resp);
      });
    };

    self.deleteMeal = function(m, idx, ev) {
      ev.stopPropagation();
      SweetAlert.swal({
        title: "Are you sure?",
        text: "You will not be able to recover the meal!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dd6b55",
        closeOnConfirm: true,
        closeOnCancel: true
      }, function(isConfirm) {
        if (isConfirm) {
          self.origMeal[m.id] = {date: m.meal_date_str, idx: idx};
          _removeMeal(m);
        }
      });
    };
  });
