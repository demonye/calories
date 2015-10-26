angular.module('calories')

  .directive('onePasswordInput', function() {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        passwordVar: '=',
        placeholder: '=',
        enterAction: '&',
        icon: '='
      },
      template: '<div class="input-group">' +
                '<input type="password" class="form-control" ng-keyup="$event.keyCode == 13 && enterAction()" ng-model="passwordVar" placeholder="{{placeholder}}">' +
                '<span class="input-group-addon btn btn-default" ng-click="toggle()">' +
                '<i class="toggle-eye fa fa-eye"></i></span></div>',
      link: function(scope, element, attrs) {
        var inputElem = element.find('input'),
            iconElem = element.find('i.toggle-eye');

        scope.placeholder = attrs.placeHolder;
        if (attrs.icon) {
          inputElem.before('<span class="input-group-addon"><i class="fa fa-fw ' + attrs.icon + '"></i></span>');
        }

        scope.toggle = function() {
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
