'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.controller('MainCtrl', function($scope, $auth, $socket, Restangular, InfinitePosts, $alert,
	                                 $http, CurrentUser, UserService, fileUpload) {

	    console.log("--------calling main.js ------------------")

		$scope.UserService = UserService;



        var handleFileSelect=function(evt) {
            var file=evt.currentTarget.files[0];
            console.log('file is ' + JSON.stringify(file));
            var uploadUrl = "/fileUpload";
            fileUpload.uploadFileToUrl(file, uploadUrl,$scope.user);
            console.log("----------testing upload image------------")
            console.log($scope.uploaded);
        };
        angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);


		$http.get('/api/me', {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': $auth.getToken()
			}
		}).success(function(user_id) {
			Restangular.one('people',JSON.parse(user_id)).get({seed:Math.random()}).then(function(user) {
				$scope.user = user;



				var loadPostIds = angular.copy(user.friends)
                loadPostIds.push(user._id)
                loadPostIds = "[\"" + loadPostIds.join("\",\"") + "\"]";
				$scope.infinitePosts = new InfinitePosts(user, loadPostIds);

                if (user.friends.length !== 0) {

				    var params = '{"_id": {"$in":["'+($scope.user.friends).join('", "') + '"'+']}}';

					Restangular.all('people').getList({where :params}).then(function(friend) {
						$scope.friends = friend;
					});
				}

				$scope.submit_post = function(){

					$http({
						url: '/similarwords',
						method: "GET",
						params: {new_post: $scope.new_post}
					})
					.success(function(similarwords) {

					$scope.infinitePosts.addPost($scope.new_post,similarwords);
					$scope.new_post = '';
					});
				};
				$scope.test = function(){
				    console.log('ha')
				}
                $socket.on('postNotifications', function(data){

                    if(data.data.postnotific){

                        if(user.friends.indexOf(data.author) == -1){
                            console.log('no a friend')
                        }else if(user.friends.indexOf(data.author != -1) && data.postid != 'undefined'){
                            $scope.infinitePosts.loadNotificPost(data.postid, data.author)
                        }else{
                            console.log('nothing to do')
                        }
                    }
                });


			});
		});
	})
	.directive('confirmdelete', function ($compile, CurrentUser, Restangular, $routeParams, friendsActivity) {
        return {
            restrict: 'E',
            replace: true,
            link: function (scope, element, attrs) {},
            controller:function($scope, $http, $route, $element, $attrs, $transclude){

                function checkdeletepost(post_id){
                    var status = false;
                    var post = null;

                    for(var k in $scope.infinitePosts.posts){
                        if($scope.infinitePosts.posts[k]._id == post_id &&
                            $scope.infinitePosts.posts[k].author == $scope.user._id){
                                status = true;
                                post =  $scope.infinitePosts.posts[k];
                            }

                    }
                    return ({status:status, post:post});
                }

                $scope.deletediv = function(get_post_id){
                    var html ='<a class="pull-right" ng-click="confirm_delete(\''+get_post_id+'\')" style="cursor:pointer;font-size:12px">Confirm Delete?</a>';
                    $element.html(html);
                    $compile($element.contents())($scope);


                }

                $scope.confirm_delete = function(get_post_id){

                    console.log("============confirm delete=====")
                    console.log(checkdeletepost(get_post_id))
                    var result = checkdeletepost(get_post_id);

                    if(result.status){
                        $scope.infinitePosts.deletePost(result.post)
                    }
                    else{
                        console.log(" faild in check post id with author")
                    }
                }
            }
        };
    });