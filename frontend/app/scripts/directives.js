angular.module('calories')

  .directive('onePasswordInput', function() {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        passwordVar: '=',
        placeholder: '=',
        icon: '='
      },
      template: '<div class="input-group">' +
                '<input type="password" class="form-control" ng-model="passwordVar" placeholder="{{placeholder}}">' +
                '<span class="input-group-addon btn btn-default" ng-click="toggle()">' +
                '<i class="toggle-eye fa fa-eye"></i></span></div>',
      link: function(scope, element, attrs) {
        scope.placeholder = attrs.placeHolder;
        if (attrs.icon) {
          element.find('input').before('<span class="input-group-addon"><i class="fa fa-fw ' + attrs.icon + '"></i></span>');
        }

        scope.toggle = function() {
          var inputElem = element.find('input'),
              iconElem = element.find('i.toggle-eye'),
              currType = inputElem.attr('type');
          if (currType == 'password') {
            inputElem.attr('type', 'text');
            iconElem.removeClass('fa-eye').addClass('fa-eye-slash');
          } else {
            inputElem.attr('type', 'password');
            iconElem.removeClass('fa-eye-slash').addClass('fa-eye');
          }
        };
      }
    };
  });
