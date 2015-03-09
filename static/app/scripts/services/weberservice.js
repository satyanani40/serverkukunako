'use strict';

/**
 * @ngdoc service
 * @name weberApp.weberService
 * @description
 * # weberService
 * Service in the weberApp.
 */
angular.module('weberApp')
	.filter('highlight', function($sce) {
		return function(text, phrase) {
			if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
				'<span class="highlighted">$1</span>');
			return $sce.trustAsHtml(text);
		};
	})

	.factory('InstanceSearch', function($http, Restangular, $alert, $timeout) {

		var InstanceSearch = function() {
			this.InstancesearchResult = [];
			this.busy = false;
			this.end = false;
			this.page = 1;
			this.query = null;
		};

		InstanceSearch.prototype.getInstancePeoples = function(query){


            self = this;
            this.query = query;

            var req = {
                 method: 'POST',
                 url: '/api/getpeoplenames',
                 headers: {
                   'Content-Type': 'application/json'
                 },
                 data: { page: this.page,
                         query: query.toLowerCase()
                       },
            }
            $http(req).success(function(peoples){
                self.InstancesearchResult = peoples;
				console.log(self.InstancesearchResult)
            }.bind(self));
        };

        InstanceSearch.prototype.nextPage = function() {
            console.log('next page')
            console.log(this.busy, this.end)
            if (this.busy | this.end) return;
			this.busy = true;
			self = this;

            var req = {
                 method: 'POST',
                 url: '/api/getpeoplenames',
                 headers: {
                   'Content-Type': 'application/json'
                 },
                 data: { page: self.page,
                         query: self.query
                       },
            }

            $http(req).success(function(peoples){

                if (peoples.length === 0) {
					self.end = true;
				}

				self.InstancesearchResult.push.apply(self.InstancesearchResult, peoples);
				self.page = self.page + 1;
				self.busy = false;
				console.log(self.InstancesearchResult)
            }.bind(self));

		};
       return InstanceSearch;
    })

	.service('UserService', function($http, Restangular) {
		this.users = [];

		this.get = function(userId) {

			for (var i in this.users) {
				if (this.users[i]._id == userId) {
					return this.users[i];
				}
			}
			var promise = Restangular.one('people',userId).get().$object;
			promise._id = userId;
			this.users.push(promise);
			return promise;
		};
	}).service('CurrentUser1', function($http, Restangular) {
		this.userId = null;
		this.user = null;
		this.reset = function() {
			this.userId = null;
		};

		if (this.userId === null) {
			$http.get('/api/me', {
				headers: {
					'Content-Type': 'application/json'
				}
			}).success(function(userId) {
				this.userId = userId;
				Restangular.one('people', JSON.parse(userId)).get().then(function(user) {
					this.user = user;
				}.bind(this));
			}.bind(this));
		}

	})


	.factory('CurrentUser', function($http,$auth,$q, Restangular) {

            var CurrentUser = function() {

			    this.userId = null;
			    this.user = null;
            }

            CurrentUser.prototype.getUserId = function(){

                    return $http.get('/api/me', {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': $auth.getToken()
                        }
                    }).success(function(userId) {
                        this.userId = userId;
                    }.bind(this));
            };


			CurrentUser.prototype.getCUserDetails = function(userid){

                return Restangular.one('people',JSON.parse(userid)).get({seed:Math.random()});
            };

            return CurrentUser;
    })
    .service('ESClient', function(esFactory) {
		return esFactory({
			host: 'http://127.0.0.1:8000',
			apiVersion: '1.2',
			log: 'trace'
		});
	})
	.factory('InfinitePosts', function($http, Restangular, $alert, $timeout) {
		var InfinitePosts = function(user_obj,authorIds) {
			this.posts = [];
			this.user_obj = user_obj;
			this.busy = false;
			this.page = 1;
			this.loadPostIds = authorIds;
			this.end = false;
            this.params = '{"author": {"$in":'+this.loadPostIds+'}}';

			Restangular.all('posts').getList({
			    where : this.params,
				max_results: 10,
				page: this.page,
				sort: '[("_created",-1)]'
			}).then(function(posts) {
				if (posts.length < 10) {
					this.end = true;
				}
				this.posts.push.apply(this.posts, posts);
				this.page = this.page + 1;
				this.busy = false;
			}.bind(this));

		};

		InfinitePosts.prototype.addPost = function(content,similar_keywords) {

			this.user_obj.all('posts').post({
				author: this.user_obj._id,
				content: content,
				keywords: similar_keywords
			}).then(function(data) {

                this.posts.unshift({
                    author: this.user_obj._id,
                    content: content,
                    _created: new Date(),
                    _id:data._id,
                    _etag: data._etag

				});

				var myAlert = $alert({
					title: 'Successfully Posted! :)',
					placement: 'top',
					type: 'success',
					show: true
				});
				$timeout(function() {
					myAlert.hide();
				}, 5000);

			}.bind(this));
		};

		InfinitePosts.prototype.deletePost = function(post1) {
		    console.log(post1._etag)
			Restangular.one('posts', post1._id).remove({},{
			    'If-Match': (post1._etag).toString()
			})
			.then(function(data) {

			    for(var k in this.posts){
			        if(this.posts[k]._id == post1._id){
			            this.posts.splice(k,1)
			        }
			    }

					/*this.posts.unshift({
					author: this.user_obj._id,
					content: content,
					_created: "a few seconds ago"
					})*/

					console.log("successfully deleted")
			}.bind(this));
		};


		InfinitePosts.prototype.nextPage = function() {
			if (this.busy | this.end) return;
			this.busy = true;

			Restangular.all('posts').getList({
			    where : this.params,
				max_results: 10,
				page: this.page,
				sort: '[("_created",-1)]'
			}).then(function(posts) {
				if (posts.length === 0) {
					this.end = true;
				}
				this.posts.push.apply(this.posts, posts);
				this.page = this.page + 1;
				this.busy = false;
			}.bind(this));
		};
		return InfinitePosts;
	}).factory('SearchActivity', function($http, Restangular, $alert, $timeout) {

		var SearchActivity = function(user_obj) {
			this.searchResult = [];
			this.user_obj = user_obj;
			this.busy = false;
			this.end = false;
			this.page = 1;
		};

		SearchActivity.prototype.getMysearches = function(){

                this.user_obj.all('searchActivity').getList({
                    max_results: 10,
                    page: this.page,
                    sort: '[("_created",-1)]',
                    seed: Math.random()
                }).then(function(data) {
                    console.log('my search')
                    console.log(data)
                    if (data.length < 10) {
					    this.end = true;
				    }

				    this.searchResult.push.apply(this.searchResult,data);
				    this.page = this.page + 1;
				    this.busy = false;
                }.bind(this));

		}

       SearchActivity.prototype.nextPage = function() {
			if (this.busy | this.end) return;
			this.busy = true;
            this.user_obj.all('searchActivity').getList({
                    max_results: 2,
                    page: this.page,
                    sort: '[("_created",-1)]',
                    seed: Math.random()
            }).then(function(data) {
                    if(data.length === 0){
                        this.end = true;
                    }
                    this.searchResult.push.apply(this.searchResult,data);
                    console.log(this.searchResult)
                    this.page = this.page + 1;
				    this.busy = false;
            }.bind(this));
		};

		SearchActivity.prototype.addSearchText = function(content) {
			this.user_obj.all('searchActivity').post({
				author: this.user_obj._id,
				content: content,
			}).then(function(data) {
                this.searchResult.unshift({
                    author: this.user_obj._id,
                    content: content,
                    _id: data._id
                });
			}.bind(this));
		};

		function combine_ids(ids) {
   			return (ids.length ? "\"" + ids.join("\",\"") + "\"" : "");
		}

    return SearchActivity;

	}).factory('MatchMeResults', function($http, Restangular, $alert, $timeout,CurrentUser,$auth,CurrentUser1) {

        function combine_ids(ids) {
   				return (ids.length ? "\"" + ids.join("\",\"") + "\"" : "");
		}

		var  MatchMeResults = function(query) {

			this.total_matches = '';
			this.mresults = [];
			this.matchedids = [];
			this.totalNames = '';
			this.searchNames =[];
			this.busy = true;
			this.page = 1;
			this.end = false;
            var keywords;
            this.param1 = null;
            this.param2 = null;
            this.query = query

            if(this.query){
                keywords = combine_ids(this.query.split(" "));

                this.param1 = '{"$or":[{"keywords": {"$in":['+keywords+']}},{"content":{"$regex":".*'+this.query+'.*"}}]}';
			    this.param2 = '{"author":1}';
                Restangular.all('posts').getList({
				where : this.param1,
				max_results: 10,
				page: this.page,
				embedded : this.param2
				}).then(function(data) {

                   if (data.length < 10) {
                        this.end = true;
    			   }
                   this.mresults.push.apply(this.mresults,data);
                   this.total_matches = data.length;
                   this.page = this.page + 1;
                   this.busy = false;

					/*for(var i=0;i<this.total_matches;i++){
						this.matchedids.push(this.mresults[i]['_id'])
					}*/
				}.bind(this));
            }
		};



		MatchMeResults.prototype.getMatchedNewResults = function(searchPostId) {

			var params = '{"_id":"'+searchPostId+'"}';

			var data = Restangular.one("people",JSON.parse(CurrentUser1.userId)).all('searchActivity').getList({
				where :params,
				sort: '[("_created",-1)]',
				seed : Math.random()
			}).then(function(sResult) {

				var param = '{"_id":{"$in":['+combine_ids(sResult[0].matchedPosts)+']}}';
				var param2 = '{"author":1}';

				var data2 = Restangular.all("posts").getList({
					where: param,
					embedded: param2,
					seed : Math.random()
				}).then(function(data){
					this.total_matches = data.length;
					this.mresults.push.apply(this.mresults,data);
				}.bind(this));

				Restangular.one("searchActivity",searchPostId).patch(
					{newResults:0},{},
					{
						'Content-Type': 'application/json',
						'If-Match': sResult[0]._etag,
						'Authorization': $auth.getToken()
					}
				);

				return data2
            }.bind(this));
            return data
		};


        MatchMeResults.prototype.nextPage = function() {
            console.log("nextpage_this.end"+this.end)

			if ((this.busy | this.end) && this.query) return;
			this.busy = true;

			Restangular.all('posts').getList({
			    where : this.param1,
				max_results: 10,
				page: this.page,
				embedded : this.param2
			}).then(function(data) {
                if (data.length === 0) {
					this.end = true;
				}
				console.log('called infinity scroll')
				this.mresults.push.apply(this.mresults, data);
				this.page = this.page + 1;
				this.busy = false;
			}.bind(this));
		};

		MatchMeResults.prototype.getMatchPeoples = function(searchText) {
			var params = '{"$or":[{"name.first":{"$regex":".*'+searchText+'.*"}},{"name.last":{"$regex":".*'+searchText+'.*"}},'+
			             '{"username":{"$regex":".*'+searchText+'.*"}}]}';
			Restangular.all('people').getList({
				where :params
				}).then(function(data) {
					this.totalNames = data.length;
					this.searchNames.push.apply(this.searchNames,data);
				}.bind(this));
			};
		return MatchMeResults;
	});