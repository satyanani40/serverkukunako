'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.controller('SettingsCtrl',
	    function($route, $location, $scope, $auth, Restangular, InfinitePosts, $alert, $http, CurrentUser, UserService) {


		$scope.UserService = UserService;
		$http.get('/api/me', {
			headers: {
				'Content-Type': 'application/json',
                'Authorization':$auth.getToken()
			}
		}).success(function(user_id) {
		    console.log(user_id)
		    console.log(JSON.parse(user_id))
			var passReq = Restangular.one("people", JSON.parse(user_id)).get({seed:Math.random()}).then(function(result) {
              $scope.user = result;
              console.log("hai")
              console.log($scope.user)

            });
            console.log($scope.user)


            $scope.size='small';
            $scope.type='circle';
            $scope.imageDataURI='';
            $scope.resImageDataURI='';
            $scope.resImgFormat='image/png';
            $scope.resImgQuality=1;
            $scope.selMinSize=100;
            $scope.resImgSize=200;
            //$scope.aspectRatio=1.2;
            $scope.onChange=function($dataURI) {
              console.log('onChange fired');
              console.log($dataURI)
            };
            $scope.onLoadBegin=function() {
              console.log('onLoadBegin fired');
            };
            $scope.onLoadDone=function() {
              console.log('onLoadDone fired');
            };
            $scope.onLoadError=function() {
              console.log('onLoadError fired');
            };
            var handleFileSelect=function(evt) {
              var file=evt.currentTarget.files[0];
              console.log(file);
              var reader = new FileReader();
              reader.onload = function (evt) {
                $scope.$apply(function($scope){
                  $scope.imageDataURI=evt.target.result;
                  console.log("============after base encoding the image===========")
                  console.log($scope.imageDataURI);
                });
              };
              reader.readAsDataURL(file);
            };
            angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
            $scope.$watch('resImageDataURI',function(){
                console.log('Res image', $scope.resImageDataURI);
                console.log("its just testing the encoding base64")


            });

            $scope.uploadFile = function(){

                var Get_upload_details = Restangular.one('people', $scope.user._id).get({seed:Math.random()});
                    Get_upload_details.then(function(response){
                    $scope.user = response;

                    $scope.user.picture.large = $scope.imageDataURI;
                    $scope.user.picture.medium = $scope.resImageDataURI;
                    $scope.user.picture.thumbnail = $scope.resImageDataURI;

                    console.log("=========before patch of upload========")

                    $scope.user.patch({
                        'picture':{
                            'large':$scope.imageDataURI,
                            'medium':$scope.resImageDataURI,
                            'thumbnail':$scope.resImageDataURI
                        }
                    }).then(function(response){

                        console.log("=====after patch========")
                        console.log(response)
                    });
                });

            }



            $scope.updateUsername = function() {

                var Get_User_details = Restangular.one('people', $scope.user._id).get({seed:Math.random()});
                    Get_User_details.then(function(response){
                    $scope.user = response;

                    $scope.user.username = $scope.u_username;
                    console.log("=========before patch========")

                    $scope.user.patch({

                        'username':$scope.u_username

                    }).then(function(response){

                        console.log("=====after patch========")
                        console.log(response)
                    });
                });
			};

			$scope.updateFirstLastName = function() {

			    var Get_first_last_details = Restangular.one('people', $scope.user._id).get({seed:Math.random()});
                    Get_first_last_details.then(function(response){
                    $scope.user = response;

                    $scope.user.name.first = $scope.edit_first_name;
                    $scope.user.name.last = $scope.edit_last_name;

                    console.log("=========before patch========")

                    $scope.user.patch({
                        'name':{
                            'first':$scope.edit_first_name,
                            'last':$scope.edit_last_name
                        }
                    }).then(function(response){

                        console.log("=====after patch========")
                        console.log(response)
                    });
                });
			};

			$scope.updateEmail = function() {

			    var Get_first_last_details = Restangular.one('people', $scope.user._id).get({seed:Math.random()});
                    Get_first_last_details.then(function(response){
                    $scope.user = response;

                    $scope.user.username = $scope.u_username;
                    console.log("=========before patch========")

                    $scope.user.patch({
                        'email':$scope.u_email
                    }).then(function(response){

                        console.log("=====after patch========")
                        console.log(response)
                    });
                });
			};

			$scope.updatePassword = function() {
			    console.log("==========update password=========")
			    console.log($scope.user.username)

			    $http.post('/settingschangepassword',
                    {
                        user_name:$scope.user.username,
                        old_password:$scope.old_password,
                        new_password:$scope.pw1
                    }).
                    success(function(data, status, headers, config) {
                        console.log("====return data====")
                        console.log(data)
                        $scope.get_hash_new_password = data;

                        console.log("=======get hashed password====")
                        console.log($scope.get_hash_new_password)

                        var Get_password_details = Restangular.one('people', $scope.user._id).get({seed:Math.random()});

                        Get_password_details.then(function(response){
                        $scope.user = response;

                        console.log("=====user details===");
                        console.log($scope.user);
                        $scope.user.patch({
                            'password':$scope.get_hash_new_password,
                            'password_test':$scope.pw1
                        }).then(function(response){
                            // this callback will be called asynchronously
                            // when the response is available

                            console.log("===after patch=====");
                            console.log(response);
                        });
                    });


                });


			};

			$scope.updateInterests = function() {

			    var Get_interests_details = Restangular.one('people', $scope.user._id).get({seed:Math.random()});
                    Get_interests_details.then(function(response){
                    $scope.user = response;
                    console.log("=========before patch========")

                    var data = ($scope.interests.toString()).split(",");

                    for(var k in data){
                        $scope.user.interests.push(data[k]);
                    }
                    $scope.user.interests = $scope.user.interests;
                    $scope.user.patch({
                        'interests':$scope.user.interests
                    }).then(function(response){

                        console.log("===after interests patch=====");
                        console.log(response);

                    });
                });
			};

			$scope.updatechangelocation = function() {

			    var Get_location_details = Restangular.one('people', $scope.user._id).get({seed:Math.random()});
                    Get_location_details.then(function(response){
                    $scope.user = response;
                    console.log("=========before patch========")

                    $scope.user.location.state = $scope.location_state;
                    $scope.user.location.city = $scope.location_city;
                    $scope.user.location.street = $scope.location_street;
                    $scope.user.patch({
                        'location':{
                            'state':$scope.location_state,
                            'city':$scope.location_city,
                            'street':$scope.location_street
                        }
                    }).then(function(response){

                        console.log("===after location patch=====");
                        console.log(response);

                    });
                });
			};

			$scope.updatechangestudy = function() {

			    var Get_study_details = Restangular.one('people', $scope.user._id).get({seed:Math.random()});
                    Get_study_details.then(function(response){
                    $scope.user = response;
                    console.log("=========before patch========")

                    $scope.user.study.intermediate = $scope.study_intermediate;
                    $scope.user.study.graduate = $scope.study_graduate;
                    $scope.user.patch({
                        'study':{
                            'intermediate':$scope.study_intermediate,
                            'graduate':$scope.study_graduate
                        }
                    }).then(function(response){

                        console.log("===after study patch=====");
                        console.log(response);

                    });
                });
			};

			$scope.updatechangephone = function() {

			    var Get_phone_details = Restangular.one('people', $scope.user._id).get({seed:Math.random()});
                    Get_phone_details.then(function(response){
                    $scope.user = response;
                    console.log("=========before patch========")

                    $scope.user.phone = $scope.phone_number;
                    $scope.user.patch({
                        'phone':$scope.phone_number
                    }).then(function(response){

                        console.log("===after phone number patch=====");
                        console.log(response);

                    });
                });
			};

            $scope.updatechangemovies = function() {

			    var Get_interests_details = Restangular.one('people', $scope.user._id).get({seed:Math.random()});
                    Get_interests_details.then(function(response){
                    $scope.user = response;
                    console.log("=========before patch========")

                    var data = ($scope.movies.toString()).split(",");

                    for(var k in data){
                        $scope.user.movies.push(data[k]);
                    }

                    $scope.user.movies = $scope.user.movies;

                    $scope.user.patch({
                        'movies':$scope.user.movies
                    }).then(function(response){

                        console.log("===after interests patch=====");
                        console.log(response);

                    });
                });
			};



        });




	})

	.directive('pwCheck', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    // console.info(elem.val() === $(firstPassword).val());
                    ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
                });
            });
        }
    }
}]);