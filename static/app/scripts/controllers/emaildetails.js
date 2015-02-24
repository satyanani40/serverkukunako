'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:EmailDetailsCtrl
 * @description
 * # EmailDetailsCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.controller('EmailDetailsCtrl', function($http, Restangular, $scope, $auth, $alert, $location, $routeParams) {

        var element = $routeParams.userId;
        console.log(element)

        // Simple POST request example (passing data) :
        /*$http.get('/api/people/'+element).
          success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            console.log(data);
            $scope.user = data;
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });

          console.log($scope.user);*/

          var em = Restangular.one('people',element).get().then(function(user) {
              $scope.user = user;
              console.log($scope.user)



            });





	});