/**
 * @description
 * # services
 * Services of the calories
 */

angular.module('calories')

  .factory('Users', function(Restangular) {
    return Restangular.service('users');
  })

  .factory('Meals', function(Restangular) {
    return {
      query: function(user) {
        return Restangular.service('meals', Restangular.one('users', user.id));
      }
    };
  })

  ;
