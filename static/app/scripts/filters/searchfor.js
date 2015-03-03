'use strict';

/**
 * @ngdoc filter
 * @name weberApp.filter:searchFor
 * @function
 * @description
 * # searchFor
 * Filter in the weberApp.
 */
angular.module('weberApp')
  .filter('searchFor', function () {
    return function (arr, searchString) {

      	if(!searchString){
			return;
		}

		var result = [];
		searchString = searchString.toLowerCase();
		angular.forEach(arr, function(item){
			if(item.title.toLowerCase().indexOf(searchString) !== -1){
				result.push(item);
			}
		});
		return result;
    };
  })


 /*.filter('makeUppercase', function () {
  // function that's invoked each time Angular runs $digest()
  // pass in `item` which is the single Object we'll manipulate
      return function (friends, searchdata) {
        var filtered = []
        if(friends){
            for(var i = 0 ; i < friends.length; i++){
                if(((friends[i]).name.first+(friends[i]).username+(friends[i]).name.last).toString().search(searchdata) > -1
                ){
                    filtered.push(friends[i])
                }
            }
        }
        // return the current `item`, but call `toUpperCase()` on it
        return filtered;
      };
  });*/