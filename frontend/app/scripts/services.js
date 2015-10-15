angular.module('calories')

  .service('MyAuth', function($rootScope, $auth, $http, $cookies) {

    this.submitLogin = function(params, opts) {
      return $http.post($auth.apiUrl() + $auth.getConfig().emailSignInPath, params)
        .success(function(resp) {
          $auth.setConfigName(opts.config);
          authData = $auth.getConfig(opts.config).handleLoginResponse(resp, $auth);
          $auth.handleValidAuth(authData);
          $rootScope.$broadcast('auth:login-success', $auth.user);
        })
        .error(function(resp) {
          $auth.rejectDfd({
            reason: 'unauthorized',
            errors: ['Invalid credentials']
          });
          $rootScope.$broadcast('auth:login-error', resp);
        });
    };

    this.signOut  = function() {
      return $http.post($auth.apiUrl() + $auth.getConfig().signOutUrl)
        .success(function(resp) {
          $auth.invalidateTokens();
          $rootScope.$broadcast('auth:logout-success');
        })
        .error(function(resp) {
          $auth.invalidateTokens();
          $rootScope.$broadcast('auth:logout-error', resp);
        });
    };

    this.updatePassword = function(params) {
      return $http.post($auth.apiUrl() + $auth.getConfig().passwordUpdatePath, params)
        .success(function(resp) {
          $rootScope.$broadcast('auth:password-change-success', resp);
          $auth.mustResetPassword = false;
        })
        .error(function(resp) {
          $rootScope.$broadcast('auth:password-change-error', resp);
        });
    };

  });
