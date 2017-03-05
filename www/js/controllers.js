angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http,$httpParamSerializerJQLike,$state, $ionicSideMenuDelegate,$window,$ionicHistory,$location) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
        var access = JSON.parse(localStorage.getItem('access'));
        $scope.access = access;

        if(access != null){
            query_access = "token="+$scope.access.token+"&email="+$scope.access.email;
        }

        if(access == null &&  window.location.href.split("#")[1] != "/app/login"){
            $window.location.href = "#/app/login";
            $window.location.reload()
        }

        $scope.$on('$ionicView.enter', function(){
            $ionicSideMenuDelegate.canDragContent(false);
        });

        $scope.logout = function(){
            localStorage.setItem('access',null);
            $window.location.href = "#/app/login";
            $window.location.reload()
        }

        $scope.errorMessageDialog = function(response){
            if(response.data){
                alert(response.data.errors.join("\n"));
            }
            else{
                alert("Something went wrong");
            }

        }

        $scope.go = function ( path ) {
            $location.path( path );
        };

        $scope.showVersion = function(){
            alert("Therapymate\nVersion: 1.0.0")
        }

        $(function(){
            $("body").delegate(".masked_input", "focus", function(){
                $(this).inputmask("999-999-9999");

            });
            $("body").delegate(".masked_input_dob", "focus", function(){
                $(this).inputmask("m/d/y");
            });

        });



})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {

});
