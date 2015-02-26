'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.controller('MainCtrl', function($scope, $auth, Restangular, InfinitePosts, $alert, $http, CurrentUser, UserService) {
		$scope.UserService = UserService;

		$http.get('/api/me', {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': $auth.getToken()
			}
		}).success(function(user_id) {
			Restangular.one('people',JSON.parse(user_id)).get({seed:Math.random()}).then(function(user) {
				$scope.user = user;
				$scope.infinitePosts = new InfinitePosts(user);

                if (user.friends.length !== 0) {

				    var params = '{"_id": {"$in":["'+($scope.user.friends).join('", "') + '"'+']}}';

					Restangular.all('people').getList({where :params}).then(function(friend) {
						$scope.friends = friend;
					});
				}
			});
		});
	})
	.directive('replacepostbutton', function ($compile, CurrentUser, Restangular) {
        return {
            restrict: 'E',
            replace: true,
            link: function (scope, element, attrs) {
            	console.log("====replace button====")
            },
            controller:function($scope, $http, $element, $attrs, $transclude, $routeParams){

            	$scope.submit_post = function(){
            	
            		console.log("===after post button clicked====")

            		var html ='<image src="/static/app/images/pleasewait.gif" style="width:;">';
                    $element.html(html);
                    $compile($element.contents())($scope);

					$http({
						url: '/similarwords',
						method: "GET",
						params: {new_post: $scope.new_post}
					})
					.success(function(similarwords) {

						$scope.infinitePosts.addPost($scope.new_post,similarwords);
						$scope.new_post = '';
						
						console.log("======after submit response=======")

						html = '<button ng-click="submit_post()" type="submit" class="btn btn-success btn-block btn-sm">Post</button>'
						var e =$compile(html)($scope);
						$element.replaceWith(e);

					});
				};
            }
        };
    });