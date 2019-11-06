angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http,$httpParamSerializerJQLike,$state, $ionicSideMenuDelegate,$window,$ionicHistory,$location, $ionicPopup, $ionicPlatform) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
        var access = JSON.parse(localStorage.getItem('access'));
        $scope.access = access;
        $scope.selectedDate = null;
        $scope.isAndroid =  $ionicPlatform.is('Android');

        if(access != null){
            $scope.query_access = "token="+$scope.access.token+"&email="+$scope.access.email;
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
            $scope.access = null
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

        $scope.goToNewAppointment = function(){
          $state.go('app.new_appointments');
        }


        $scope.goToDate = function(selectedDate){
          var year = selectedDate.getFullYear();
          var month = selectedDate.getMonth()+1;
          var day = selectedDate.getDate();
          var timeZoneOffset = new Date().getTimezoneOffset();
          $window.location.href = "#/app/appointments?date="+year+"-"+month+"-"+day+"&timezone_offset=-"+timeZoneOffset;
          $window.location.reload()
        }

        $scope.go = function ( path ) {
            $location.path( path );
        };

        $scope.showVersion = function(){
            $ionicPopup.alert({
                title: 'Therapymate',
                template: "<center><strong>Version: 2.0.9</strong></center>"
            });

        }

        Array.prototype.removeValue = function(name, value){
            var array = $.map(this, function(v,i){
                return v[name] === value ? null : v;
            });
            this.length = 0; //clear original array
            this.push.apply(this, array); //push all elements except the one we want to delete
        }



})
