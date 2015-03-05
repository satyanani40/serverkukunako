'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:NavbarCtrl
 * @description
 * # NavbarCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.directive('navbar', function () {
    return {
        restrict: 'A', //This menas that it will be used as an attribute and NOT as an element. I don't like creating custom HTML elements
        replace: true,
        templateUrl: "/static/app/views/navbar.html",
        controller:function ($scope, $auth, CurrentUser, $alert,$rootScope,
                             $location,$http,Restangular,ChatActivity,
                             SearchActivity,FriendsNotific,friendsActivity) {

        var params = '{"username":1,"email":1,"name":{"first":1,"last":1},"picture":{"large":1,"medium":1,"thumbnail":1}}';

        var searchFriends = Restangular.all('people').getList({
            projection : params,
            seed : Math.random()
        });

        searchFriends.then(function(database_people){
            $scope.searchPeoples = database_people;
            console.log('===search peoeples====')
            console.log($scope.searchPeoples[0].email)
        });

        $scope.searchP = function(){
            $scope.filtered = []
            if($scope.searchPeoples && $scope.searchPeople){
                for(var i = 0 ; i < $scope.searchPeoples.length; i++){
                    if(
                    (($scope.searchPeoples[i]).name.first+
                    ($scope.searchPeoples[i]).username+
                    ($scope.searchPeoples[i]).name.last+
                    ($scope.searchPeoples[i].email))
                    .toString().search($scope.searchPeople) > -1
                    ){
                        $scope.filtered.push($scope.searchPeoples[i])
                    }
                }
            }
        }

          $scope.menuOpened = false;
          $scope.messageOpened = false;

          $scope.messageMenu = function(event) {


            $scope.messageOpened = !($scope.messageOpened);
            event.stopPropagation();

          };


          $scope.toggleMenu = function(event) {
              $scope.menuOpened = !($scope.menuOpened);

          // Important part in the implementation
          // Stopping event propagation means window.onclick won't get called when someone clicks
          // on the menu div. Without this, menu will be hidden immediately
              event.stopPropagation();
          };

          window.onclick = function() {
              if ($scope.menuOpened) {
                  $scope.menuOpened = false;

            // You should let angular know about the update that you have made, so that it can refresh the UI
                  $scope.$apply();
              }

              if ($scope.messageOpened) {
                  $scope.messageOpened = false;

            // You should let angular know about the update that you have made, so that it can refresh the UI
                  $scope.$apply();
              }

          };

        $scope.dropdown = [{
            "text": "Settings",
            "href": "#/settings"
        },{
            "text": "Logout",
            "click": "logout()"
        }];

        $scope.logout = function() {
            //CurrentUser.reset();
            $auth.logout();
            $location.path("/login");
        };

        $scope.isAuthenticated = function() {
            return $auth.isAuthenticated();
        };


			$http.get('/api/me', {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': $auth.getToken()
				}
			}).success(function(user_id) {

				Restangular.one('people',JSON.parse(user_id)).get({seed: Math.random()}).then(function(user) {
				$scope.currentUser = user;

                console.log('========datetime==========')
                var today = new Date()
                console.log(today)
                 var anotherDate = new Date("Mon, 02 Mar 2000 10:38:01")
                console.log(anotherDate)
                anotherDate.setDate(anotherDate.getDate() + 5);
                console.log(anotherDate)

                if(today > anotherDate){
                    console.log('createdfirst')
                }else{
                    console.log('created last')

                }
                // chat activity





				var requested_peoples = [];
				var accepted_peoples = [];

				function get_friend_notifications(currentUser){
					var notific = new FriendsNotific(currentUser);
					notific.then(function(data){

							accepted_peoples = [];
							var currentuser = data
							var k = null;
							for (k in currentuser.notifications){
								if(currentuser.notifications[k].seen == false){
									requested_peoples.push(currentuser.notifications[k].friend_id)
								}
							}

							k= null;
							for (k in currentuser.accept_notifications){
								if(currentuser.accept_notifications[k].seen == false){
									accepted_peoples.push(currentuser.accept_notifications[k].accepted_id)
								}
							}


							if(requested_peoples.length+accepted_peoples.length > 0){

								if(!(currentUser.all_seen)){
									$scope.newnotific = requested_peoples.length+accepted_peoples.length
								}else{
									$scope.newnotific = null;
								}

							}else{
								$scope.newnotific = null;
							}
					});
				}


				get_friend_notifications(user);

				var source = new EventSource('/stream/'+user._id);

				source.onmessage = function (event) {

					data = JSON.parse(event.data)
					if(parseInt(data.searchNotific)){
     					$scope.searchActivity = new SearchActivity(user);
     				}

     				if(parseInt(data.friendsnotifc)){
     					$http.get('/api/me', {
							headers: {
								'Content-Type': 'application/json',
								'Authorization': $auth.getToken()
							}
						}).success(function(user_id) {
							Restangular.one('people',JSON.parse(user_id)).get({seed: Math.random()}).then(function(user) {
									get_friend_notifications(user);
							});

						});
					}
				};

  				$scope.getNewNotifcations = function(){
					$scope.newnotific = null;
  					$http.get('/api/me', {
						headers: {
							'Content-Type': 'application/json',
							'Authorization': $auth.getToken()
						}
					}).success(function(user_id) {

						Restangular.one('people',JSON.parse(user_id)).get({seed: Math.random()}).then(function(user) {
								var anotific = [];
								var reqnotific = [];
								var k = null;
								for(k in user.accept_notifications){
									user.accept_notifications[k].seen = true
									anotific.push(user.accept_notifications[k].accepted_id)
								}

								k = null;

								for(k in user.notifications){
									user.notifications[k].seen = true
									reqnotific.push(user.notifications[k].friend_id)
								}

								user.patch(
								{	'all_seen':true,
									'accept_notifications':user.accept_notifications,
									'notifications': user.notifications
								}
								).then(function(data){
								    console.log('updated accept notifications')
								});
									var params = '{"_id": {"$in":["'+(reqnotific).join('", "') + '"'+']}}'
									Restangular.all('people').getList({
										where : params,
										seed: Math.random()
									}).then(function(response){
										$scope.rpeoples = response;
									});

									var params = '{"_id": {"$in":["'+(anotific).join('", "') + '"'+']}}'
									Restangular.all('people').getList({
										where : params,
										seed: Math.random()
									}).then(function(resposne){
										$scope.apeoples = resposne;
									});

							});
						});
					}

			});
		});
	}
  }
});