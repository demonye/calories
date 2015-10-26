'use strict';

angular.module('calories')
  .service('djangoAuth', function djangoAuth($q, $http, $cookies, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var service = {
        /* START CUSTOMIZATION HERE */
        // Change this to point to your Django REST Auth API
        // e.g. /api/rest-auth  (DO NOT INCLUDE ENDING SLASH)
        API_URL: '',
        // Set use_session to true to use Django sessions to store security token.
        // Set use_session to false to store the security token locally and transmit it as a custom header.
        use_session: true,
        /* END OF CUSTOMIZATION */
        authenticated: null,
        authPromise: null,

        request: function(method, _url, data, params) {
            // Let's retrieve the token from the cookie, if available
            // Continue
            var deferred = $q.defer(),
                url = this.API_URL + _url
                self = this;
            // Fire the request, as configured.
            $http({
                url: url,
                withCredentials: this.use_session,
                method: method.toUpperCase(),
                params: params || {},
                data: data || {}
            })
            .success(function(data, status, headers, config) {
                deferred.resolve(data, status);
            })
            .error(function(data, status, headers, config) {
                // console.log("error syncing with: " + url);
                // Set request status
                if (data) {
                    data.status = status;
                }
                if (status == 0) {
                    if (data == "") {
                        data = {status: 0, non_field_errors: ["Could not connect. Please try again."]};
                    }
                    // or if the data is null, then there was a timeout.
                    if (data == null) {
                        // Inject a non field error alerting the user
                        // that there's been a timeout error.
                        data = {status: 0, non_field_errors: ["Server timed out. Please try again."]};
                    }
                }
                deferred.reject(data, status, headers, config);
            });
            return deferred.promise;
        },

        _emit: function(ev, data) {
          $rootScope.$broadcast(ev, data);
        },
        _logged_in: function(ev, data) {
          if (!djangoAuth.use_session && data.key) {
            $http.defaults.headers.common.Authorization = 'Token ' + data.key;
            $cookies.token = data.key;
          }
          djangoAuth.authenticated = true;
          this._emit(ev, data);
        },
        _not_logged_in(ev, data) {
          delete $http.defaults.headers.common.Authorization;
          delete $cookies.token;
          djangoAuth.authenticated = false;
          console.log(data);
          this._emit(ev, data);
        },

        register: function(data) {
          // data: email, password1, password2
          var self = this;
          return self.request('post', '/registration/', data).then(
              function(data) { self._emit('auth:registration-email-success', data); },
              function(data) { self._emit('auth:registration-email-error', data); }
            );
        },
        verify: function(data) {
          // data: key
          var self = this;
          return self.request('post', '/registration/verify-email/', data).then(
              function(data) { self._emit('auth:email-confirmation-success', data); },
              function(data) { self._emit('auth:email-confirmation-error', data); }
            );
        },
        _login: function(data) {
          var self = this;
          return self.request('post', '/login/', data);
        },
        login: function(data) {
          // data: email, password
          var self = this;
          return self._login(data).then(
              function(data) { self._logged_in('auth:login-success', data); },
              function(data) { self._not_logged_in('auth:login-error', data); }
            )
        },
        logout: function() {
          var self = this;
          return self.request('post', '/logout/').then(
            function(data) { self._not_logged_in('auth:logout-success'); },
            function(data) { self._emit("auth:logout-error", data); }
          );
        },
        changePassword: function(data) {
          // data: old_password, new_password1, new_password2
          var self = this,
              form = data;
          return self.request('post', '/password/change/', data).then(
            function(data) {
              self._emit('auth:password-change-success', data);
              self._login({email: form.email, password: form.new_password1});
            },
            function(data) { self._emit('auth:password-change-error', data); }
          );
        },
        resetPassword: function(data) {
          // data: email
          var self = this,
              email = data.email;
          return self.request('post', '/password/reset/', data).then(
            function(data) { data.email = email; self._emit('auth:password-reset-request-success', data); },
            function(data) { self._emit('auth:password-reset-request-error', data); }
          );
        },
        confirmReset: function(data) {
          // data: uid, token, new_password1, new_password2
          var self = this;
          return self.request('post', '/password/reset/confirm/', data).then(
            function(data) { self._emit('auth:password-reset-confirm-success', data); },
            function(data) { self._emit('auth:password-reset-confirm-error', data); }
          );
        },
        profile: function() {
          var self = this;
          return self.request('get', '/user/').then(
            function(data) { self._emit('auth:validation-success', data); },
            function(data) { self._not_logged_in('auth:validation-error', data); }
          );
        },
        updateProfile: function(data) {
          var self = this;
          return self.request('patch', '/user/', data).then(
              function(data) { self._emit('auth:account-update-success', data); },
              function(data) { self._emit('auth:account-update-error', data); }
            );
        },
        authenticationStatus: function(restrict, force) {
            // Set restrict to true to reject the promise if not logged in
            // Set to false or omit to resolve when status is known
            // Set force to true to ignore stored value and query API
            restrict = restrict || false;
            force = force || false;
            if (this.authPromise == null || force) {
                this.authPromise = this.request('get', '/user/');
            }
            var da = this;
            var getAuthStatus = $q.defer();
            if (this.authenticated != null && !force) {
                // We have a stored value which means we can pass it back right away.
                if (this.authenticated == false && restrict) {
                    getAuthStatus.reject("User is not logged in.");
                } else {
                    getAuthStatus.resolve();
                }
            } else {
                // There isn't a stored value, or we're forcing a request back to
                // the API to get the authentication status.
                this.authPromise.then(function() {
                    da.authenticated = true;
                    getAuthStatus.resolve();
                }, function() {
                    da.authenticated = false;
                    if (restrict) {
                        getAuthStatus.reject("User is not logged in.");
                    } else {
                        getAuthStatus.resolve();
                    }
                });
            }
            return getAuthStatus.promise;
        },

        initialize: function(url, sessions) {
            this.API_URL = url;
            this.use_session = sessions;
            return this.authenticationStatus();
        }
    }
    return service;
  });
