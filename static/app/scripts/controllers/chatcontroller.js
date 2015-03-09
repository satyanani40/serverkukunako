angular.module('weberApp')
.controller('chatbarcontroller', function($scope, $auth, CurrentUser1,
                                          $http,$rootScope,SearchActivity,FriendsNotific,
                                          $document, Restangular,ChatActivity){

    // -----nav bar methods-----

    // nav search bar methods
     $http.get('/api/me', {
            headers: {
                'Content-Type': 'application/json'
            }
    }).success(function(userId) {

            // popup notifications code
            $scope.menuOpened = false;
            $scope.messageOpened = false;

            $scope.messageMenu = function(event) {
                $scope.messageOpened = !($scope.messageOpened);
                event.stopPropagation();
            };

            $scope.menuMenu = function(event) {
                $scope.menuOpened = !($scope.menuOpened);
                event.stopPropagation();
            };

            window.onclick = function() {
                if ($scope.menuOpened) {
                  $scope.menuOpened = false;
                  console.log("========dewduywegdfywef")

                // You should let angular know about the update that you have made, so that it can refresh the UI
                  $scope.$apply();
                }

                if ($scope.messageOpened) {
                  $scope.messageOpened = false;

                // You should let angular know about the update that you have made, so that it can refresh the UI
                  $scope.$apply();
                }

            };
            // popup notitications code end

            var date = new Date()

            this.userId = userId;
            Restangular.one('people', JSON.parse(userId)).get().then(function(user) {

                this.user = user;
                $scope.chatdivnotification = [];

                $scope.chatactivity = new ChatActivity(user);
                $scope.loadLatestMessages = function(){
                    //console.log('load message')
                    $scope.chatactivity.loadLatestMessages();
                }

                 if(user.friends.length !== 0){
                    $scope.chatactivity.getChatFriends().then(function(data){
                        $scope.chatusers = data;
                    });
                 }

                var socket = io.connect('http://127.0.0.1:8000');

                socket.on('connect', function() {
                    socket.emit('connect', {data: user._id});
                });


                socket.on('join_status', function(msg) {
                    if(msg.data){
                        console.log('successfully joined into room');
                    }
                });

                socket.on('receive_messages', function(msg) {
                    console.log('message received')
                    new_message = {}

                    var details = JSON.parse(sessionStorage.getItem(msg.senderid));

                    if(user._id == msg.senderid){

                    }
                    else if(user._id != msg.senderid){
                        console.log('yes from receiver')
                        // no chat rooms opened push message into latest Notifications
                        if(sessionStorage.getItem(msg.senderid) == null){
                            console.log('no chat div opened')
                            $scope.chatactivity.pushLatestMessage(msg)

                        }
                        console.log('yes chat room opened')
                         new_message = {
                                  sender :{
                                    name:{
                                        first:details.name
                                    },
                                    picture :{
                                        medium:details.image

                                    },
                                    _id:msg.senderid
                                  },

                                  receiver:{
                                    _id:msg.receiverid
                                  },
                                  message:msg.message
                         }

                         if(JSON.parse(sessionStorage.getItem(msg.senderid)).minimize){
                                $scope.chatdivnotification.push({ id:msg.senderid,message: true})
                         }

                          $scope.chatactivity.pushMessage(msg.senderid, new_message);
                          $scope.$apply(function(){
                            $scope.chatactivity.messages = $scope.chatactivity.messages;
                          });

                         msg = null;
                    }else{}

                });

                // sending and pushing message
                $scope.send_message = function(text, Recept){

                    var pushNewMessage = {
                        sender :{
                            name:{
                                first:user.name.first
                            },
                            picture :{
                                medium:user.picture.medium

                            },
                            _id:user._id
                        },

                        receiver:{
                            _id:Recept
                        },

                        message:text,
                        _created: new Date()
                    }

                    $scope.chatactivity.pushMessage(Recept, pushNewMessage);

                    //$scope.chatactivity.messages = data;

                    socket.emit('send_message', {receiverid: Recept, senderid :user._id  ,message: text});
                    $scope.chatactivity.sendMessage(Recept, text);

                }

                var getValue = function(){
                    return sessionStorage.length;
                }

                var getData = function(){
                  var json = [];
                  $.each(sessionStorage, function(i, v){
                     json.push(angular.fromJson(v));
                  });
                  return json;
                }

                // display divs on page load
                /*function display_divs(){
                   $rootScope.previous_divs = getData();
                   var count = 270;
                   for(k in $rootScope.previous_divs){
                        $rootScope.previous_divs[k].right = count;
                        count = count+315;
                        socket.emit('connect', {data: $rootScope.previous_divs[k].id});
                   }
                   $rootScope.previous_divs;
                }*/

                function loadintodivs(){

                    var chatrooms = getData();
                    for(k in  chatrooms){
                        console.log(chatrooms[k])
                        $scope.chatactivity.loadMessages(user._id, chatrooms[k].id, chatrooms[k]);
                   }

                }


                 // opens new chat room
                 $scope.openchatroom = function(id){

                    if(!(sessionStorage.getItem(id))){
                        // check room alredy open

                        var json = {};
                        Restangular.one('people', id).get({seed: Math.random()})
                        .then(function(data){
                            console.log('person deatils')
                            console.log(data)
                            json = {
                                name:data.name.first,
                                id: data._id,
                                image:data.picture.medium,
                                minimize:false,
                                maximize:true,
                                right:0,
                                height:'414px'
                            }

                            sessionStorage.setItem(id, JSON.stringify(json));
                            socket.emit('connect', {data:id});
                            // load messages into new open chat room
                            $scope.chatactivity.loadMessages(user._id, id, json);
                        });

                    }
                 }

                 // closing open div
                 $scope.close_div = function(id){
                    for(k in $scope.chatactivity.messages){
                        if($scope.chatactivity.messages[k].id == id){
                            // remove get chat room
                            $scope.chatactivity.messages.splice(k,1)
                        }
                    }
                    // remove from chat room
                    sessionStorage.removeItem(id);
                 }

                 $scope.MessageNotifcations = function(){
                   $scope.chatactivity.getMessageNotifcations();
                 }


                $scope.makeMessagesSeen = function(senderid){
                    $scope.chatactivity.makeMessagesSeen(senderid);
                }

                $scope.checknotific = function(id){
                       for(k in $scope.chatdivnotification){

                           if($scope.chatdivnotification[k].id == id && $scope.chatdivnotification[k].message == true){
                             return true
                             }else{
                                //console.log("not equal")
                             }
                       }
                }
                    //display_divs();
                    loadintodivs();
                    $scope.MessageNotifcations();
            });
    });




})

.directive('confirmmessagetrash', function ($compile, CurrentUser, Restangular, $routeParams, friendsActivity) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attrs) {
            console.log("=====call confirmmessagetrash======")
        },
        controller:function($scope, $http, $route, $element, $attrs, $transclude){

            $scope.confirm_trash = function(){
                var html ='<a class="pull-right" ng-click="confirm_trash()" style="color:#fff;cursor:pointer;font-size:12px">Confirm Delete?</a>';
                $element.html(html);
                $compile($element.contents())($scope);



            }

        }
    };
})
.directive('chatbar', function () {

    return {
        restrict: 'A', //This menas that it will be used as an attribute and NOT as an element. I don't like creating custom HTML elements
        replace: true,
        templateUrl: "/static/app/views/chat.html",
        controller: 'chatbarcontroller'

    }

})



.directive('matchpersonroom', function ($compile) {
    return {
        restrict: 'A',
        replace: true,
        link: function ($scope, element, attrs) {},
        controller: "chatbarcontroller"
    };
})


.directive('scroll', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {},
     controller : function($scope, $element){
         this.setElement = function(ele){
            $element[0].scrollTop = ($element[0].scrollTop+ele.getBoundingClientRect().top+16);
         }
     }
      /*scope.$watchCollection(attr.scroll, function(newVal) {
        $timeout(function() {
         console.log('time out')
         console.log(element[0].scrollTop)
         console.log(element[0].scrollHeight)
         element[0].scrollTop = element[0].scrollHeight;
         console.log(element[0].scrollTop)
        });
      });*/
}
})
.directive('scrollitem', function($timeout) {
  return {
     require : "^scroll",
    link: function(scope, element, attr, scrollCtrl) {
        //console.log(element[0].height)
        scrollCtrl.setElement(element[0]);
      /*scope.$watchCollection(attr.scroll, function(newVal) {
        $timeout(function() {
         console.log('time out')
         console.log(element[0].scrollTop)
         console.log(element[0].scrollHeight)
         element[0].scrollTop = element[0].scrollHeight;
         console.log(element[0].scrollTop)
        });
      });*/


    }
  }
});