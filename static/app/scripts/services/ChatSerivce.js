angular.module('weberApp')

    .factory('ChatActivity', function($http, Restangular,$auth) {

        var ChatActivity = function(currentuser){
            this.currentuser = currentuser;
            this.chatfriends = null;
            this.messages = [];
            this.messageNotifc = [];
            this.latestMessages = [];
        }

        ChatActivity.prototype.getChatFriends = function(){

            if (this.currentuser.friends.length !== 0) {
                var params = '{"_id": {"$in":["'+(this.currentuser.friends).join('", "') + '"'+']}}';
                var data = Restangular.all('people').getList({where :params});
                return data;
            }

        };

        // sending message
        ChatActivity.prototype.sendMessage = function( receiverid, text){

            this.receiverid = receiverid;
            self = this;
            Restangular.all('chat/sendmessage').post({
                'sender':this.currentuser._id,
                'receiver': this.receiverid,
                'message': text,
                'seen': false
            }).then(function(data){
                //console.log(data)
            });
        }

        ChatActivity.prototype.loadMessages = function(user1, user2, roomdetails){
            console.log(roomdetails)
            var self = this;
            params =  '{ "$or" : ['+
                    '{ "$and" : [ { "sender" : "'+user1+'" }, { "receiver" : "'+user2+'" } ] },'+
                    '{ "$and" : [ { "sender" : "'+user2+'" }, { "receiver": "'+user1+'" }  ] }'+
                ']}';

            var params2 = '{"sender":1,"receiver":1}'

            Restangular.all('messages').getList({
                where:params,
                embedded:params2,
                seed:Math.random()
            }).then(function(response){
                console.log('loading messages at service')
                //console.log(response)
                self.messages.push.apply(self.messages,[{id:user2,details:roomdetails,messages:response}]);
                console.log(self.messages)
            }.bind(self));
        }

        ChatActivity.prototype.pushMessage = function(receiverid, message){
            for(k in this.messages){

                if(this.messages[k].id == receiverid){
                   console.log('pushed message')
                   console.log(this.messages[k].id)
                   console.log(receiverid)
                   this.messages[k].messages.push(message)
                   console.log(this.messages[k])
                }
            }
        }

        ChatActivity.prototype.pushLatestMessage = function(msg){
            this.messageNotifc.push.apply(this.messageNotifc,[msg]);
            console.log(this.messageNotifc)
        }

        ChatActivity.prototype.getMessageNotifcations= function(){
            var where_param = '{"$and":[{"receiver":"'+this.currentuser._id+'"},{"seen":false}]}';
            //var sort_param = '[("_created",-1)]';
            var embedded_param = '{"sender":1,"receiver":1}';
            var self = this;
            Restangular.all('messages').getList({
                where: where_param,
                embedded: embedded_param,
                seed:Math.random()
            }).then(function(data){
                self.messageNotifc.push.apply(self.messageNotifc, data);
            }.bind(self))
        }



        ChatActivity.prototype.loadLatestMessages = function(){

            var params = null;
            if(this.messageNotifc.length){
                params = '{ "$and" : [ { "timestamp":{"$gt": '+this.currentuser.lastmessageseen +' }},'+
                                       '{ "receiver" : "'+this.currentuser._id+'" }, { "seen" : '+false+' } ] }';
            }else{
                params =  '{ "$and" : [ { "timestamp":{"$gt": '+this.currentuser.lastmessageseen +' }},'+
                                       '{ "receiver" : "'+this.currentuser._id+'" }] }';
            }

            var sort_param = '[("_created",-1)]';
            var embedded_param = '{"sender":1,"receiver":1}';
            var self = this;

            Restangular.all('updatetimestamp').post({
                timestamp:this.currentuser.lastmessageseen,
                userid:this.currentuser._id
            }).then(function(data){
                console.log(data)
            });

            Restangular.all('messages').getList({
                where: params,
                embedded: embedded_param,
                sort:sort_param,
                max_results: 10,
                seed:Math.random()
            }).then(function(data){
                self.latestMessages.push.apply(self.latestMessages, data);
                console.log(self.latestMessages)
                if(self.messageNotifc.length){
                    self.makeMessagesSeen(self.latestMessages);
                    self.messageNotifc = []
                }

            }.bind(self))
        }

        ChatActivity.prototype.makeMessagesSeen = function(latestMessages){
            var messageids = []
            for(x in latestMessages){
                messageids.push(latestMessages[x]._id)
            }
            if(messageids.length){
                Restangular.all('updateMessageSeen').post({
                    messageids: messageids
                }).then(function(data){
                    console.log('--------updated messages seen status----------')
                    console.log(data)
                });

            }
        }

        ChatActivity.prototype.makeRoomMessagesSeen = function(senderid){
            var self = this;
            for(k in self.latestMessages){
                if(self.latestMessages[k].sender._id == senderid  &&
                   self.latestMessages[k].receiver._id == self.currentuser._id &&
                   self.latestMessages[k].seen == false
                ){
                    Restangular.one("messages",self.latestMessages[k]._id).patch(
                        {seen:true},{},
                        {
                            'Content-Type': 'application/json',
                            'If-Match': self.latestMessages[k]._etag,
                            'Authorization': $auth.getToken()
                        }).then(function(data){
                            self.latestMessages.splice(k,1);
                        });
                }
            }
        }




    return ChatActivity;
    });
