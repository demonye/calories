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
      self.applyFilter(false);
    };

    self.toggleDate = function(d) {
      self.showDate[d] = !self.showDate[d];
    };

    var oldItem = new (function() {
      var _id, _date;

      this.put = function(id, date) {
        _id = id;
        _date = date;
      };
      this.date = function() {
        return _date;
      };
      this.idx = function() {
        var items = self.meals[_date],
            len = items.length;
        for (var i=0; i<len; i++) {
          if (items[i].id == _id) {
            return i;
          }
        }
        return -1
      };
    })();

    self.editingMeal = function(m) {
      var mealTime = new Date(m.meal_date_str + 'T' + m.meal_time_str + ':00');
      mealTime.setTime(mealTime.getTime() + mealTime.getTimezoneOffset()*60*1000);
      oldItem.put(m.id, m.meal_date_str);
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

    self.applyFilter = function(filtering) {
      self.meals = self.dates = [];
      self.filter.isFiltering = filtering == undefined ? true : filtering;
      var params = {
        from_date: $filter('date')(self.filter.from_date, 'yyyy-MM-dd'),
        to_date: $filter('date')(self.filter.to_date, 'yyyy-MM-dd'),
        from_time: $filter('date')(self.filter.from_time, 'HH:mm'),
        to_time: $filter('date')(self.filter.to_time, 'HH:mm')
      };
      self.loadMore(params);
    };

    self.clearFilter = function() {
      self.filter = {
        from_date: "",
        to_date: "",
        from_date: "",
        to_time: "",
        isFiltering: false
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

    self.showNewMeal = function() {
      self.addNewMeal = true;
      $timeout(function() {
        angular.element('input[name=meal_date]').focus();
      }, 0);
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
          self.meals[dtstr] = [data];
        }
        if (self.dates.indexOf(dtstr) == -1) {
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
        var date = oldItem.date(),
            idx = oldItem.idx();
        if (idx >= 0)
          self.meals[date][idx] = m;
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
        var date = oldItem.date(),
            idx = oldItem.idx();
        if (idx >= 0)
          self.meals[date].splice(idx, 1);
        if (self.meals[date].length == 0) {
          var idx = self.dates.indexOf(date);
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

    self.deleteMeal = function(m, ev) {
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
          oldItem.put(m.id, m.meal_date_str);
          _removeMeal(m);
        }
      });
    };
  });
