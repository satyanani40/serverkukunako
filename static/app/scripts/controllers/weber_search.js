'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:WeberSearchCtrl
 * @description
 * # WeberSearchCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
    .controller('WeberSearchCtrl', function($scope, $auth, Restangular,
	 										InfinitePosts, $alert, $http,$location,
	 										CurrentUser, UserService,CurrentUser1,$rootScope,
	 										SearchActivity, $routeParams, MatchMeResults) {

	 	/* login functionality code goes here*/
        $scope.submitLogin = function() {
            console.log("-------------------------")
            console.log($scope.login_email)
            console.log($scope.login_password)
			$auth.login({
				email: $scope.login_email,
				password: $scope.login_password
			}).then(function(response) {
				$auth.setToken(response.data.token);
				$rootScope.isloggin = true;
				//$location.path('/home');
			}, function(error) {
				$scope.error = error.data.error;
				/*$alert({
					title: 'Login Failed: ',
					content: error.data.error,
					placement: 'top',
					type: 'danger',
					show: true
				});*/
			});
		};

        /* end of login functionality*/




        function combine_ids(ids) {
   				return (ids.length ? "\"" + ids.join("\",\"") + "\"" : "");
		}

        $scope.query = $routeParams.query;
        $scope.matchResults = new MatchMeResults($routeParams.query);
        store_search_text($routeParams.query);

        function store_search_text(searchText){
            if(!($scope.user)){
                $scope.currentuserobj = new CurrentUser();
                $scope.currentuserobj.getUserId()
                .then(function(){
                    if($scope.currentuserobj.userId != 'undefined'){
                        $scope.currentuserobj.getCUserDetails($scope.currentuserobj.userId)
                        .then(function(user){
                           $scope.user = user;
                           $scope.searchActivity = new SearchActivity(user)
                           $scope.searchActivity.addSearchText(searchText);
                        });
                    };
                });
            }else{
                $scope.searchActivity = new SearchActivity($scope.user)
                $scope.searchActivity.addSearchText(searchText);
            }
        }

		$scope.UserService = UserService;
        $scope.CurrentUser = CurrentUser1;
        $rootScope.loggeduser = CurrentUser1;

        $scope.isAuthenticated = function() {
            return $auth.isAuthenticated();
        };

        $scope.logout = function() {
            $auth.logout();
            $location.path("/search");
        };
        $scope.showNoResults = false;

        $scope.perfomSearch = function(){
            $scope.showNoResults = !($scope.showNoResults);
            if($scope.query && ($routeParams.query == $scope.query)){
                //$scope.matchResults = new MatchMeResults($scope.query);
            }else if($scope.query){

                $routeParams.query = $scope.query;
                $location.path('search/' + $routeParams.query);

            }
            else{
                //$scope.query = '';
                //$scope.matchResults.mresults = null;
            }
        }

	})



    /*$scope.loadNewResullts = function(searchId){
        var matchResults = new MatchMeResults();
        matchResults.getMatchedNewResults(searchId).then(function() {
                $scope.matchmeresults = matchResults;
        });
    };*/


	/*.directive('myDirective', function(){
            return function(scope, element, attrib){
            element.bind('click', function(){
                //scope.loadNewResullts(element[0].id);
                //$('#notific'+element[0].id).css({"display":"none"});
            });
        };
    })*/

    .directive('seefulltextdirective', function ($compile, CurrentUser, Restangular, $routeParams, friendsActivity) {
        return {
            restrict: 'E',
            replace: true,
            link: function (scope, element, attrs) {
                console.log("=====call seefulltextdirective======")
            },
            controller:function($scope, $http, $route, $element, $attrs, $transclude){

                $scope.hide_text = function(){
                    var html ='<p></p>';
                    $element.html(html);
                    $compile($element.contents())($scope);
                }
            }
        };
    })
    .directive('focus',function($timeout) {
        return {
            scope : {
                trigger : '@focus'
            },
            link : function(scope, element) {
                scope.$watch('trigger', function(value) {
                    if (value === "true") {
                        $timeout(function() {
                            element[0].focus();
                        });
                    }
                });
            }
        };
     });
