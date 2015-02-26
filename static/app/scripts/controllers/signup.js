'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:SignupCtrl
 * @description
 * # SignupCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.controller('SignupCtrl', function($scope, $auth, $location, $alert) {
		$scope.registerUser = function() {
			$auth.signup({
				email: $scope.formData.email,
				password: $scope.formData.password,
				firstname: $scope.formData.firstname,
				lastname: $scope.formData.lastname,
				username: $scope.formData.firstname+$scope.formData.lastname
			}).then(function(response) {
				console.log(response.data);
				$location.path('/email_details/'+$scope.formData.email);
			}, function(error) {
				$scope.error = error;
				/*$alert({
					title: 'Registration Failed: ',
					content: error.data.error,
					placement: 'top',
					type: 'danger',
					show: true
				});*/
			});
		};
	}).directive('validPasswordC', function () {
		return {
			require: 'ngModel',
			link: function (scope, elm, attrs, ctrl) {
				ctrl.$parsers.unshift(function (viewValue, $scope) {
					var noMatch = viewValue != scope.myForm.password.$viewValue
					ctrl.$setValidity('noMatch', !noMatch)
				})
			}
		}
	})
	.directive('replacesignup', function ($compile) {
		return {
			restrict: 'E',
			replace: true,
			link: function (scope, element, attrs) {
				element.click(function(){
				   var html ='<image src="/static/app/images/pleasewait.gif" style="width:;">';
				   var e =$compile(html)(scope);
				   element.replaceWith(e);
				});
			}
		};
	});