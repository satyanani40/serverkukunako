angular.module('weberApp')
    .controller('indexCtrl', function($auth,$rootScope,$scope) {
        $rootScope.isAuthenticated = function() {
            return $auth.isAuthenticated();
        };
        $rootScope.isloggin = $auth.isAuthenticated();
        console.log($rootScope.isloggin)
});