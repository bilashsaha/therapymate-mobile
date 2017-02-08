angular.module('login.controllers', [])
   .controller('LoginCtrl', function($scope, $ionicModal, $timeout, $http,$httpParamSerializerJQLike,$state,$window) {
        // Perform the login action when the user submits the login form
        $scope.loginData = {};
        var access = localStorage.getItem('access');
        if(access && access.token){
            $window.location.href = "#/app/appointments";
            $window.location.reload()
        }

        $scope.doLogin = function() {
            $http({
                method: 'POST',
                url: apiHost+'api/app/sessions.json',
                data: $httpParamSerializerJQLike($scope.loginData),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(
                function(res) {
                    if(res.data){
                        localStorage.setItem('access', JSON.stringify(res.data));
                        $window.location.href = "#/app/appointments";
                        $window.location.reload()
                    }
                },
                function(err) {
                    alert("Invalid username or password!")
                }
            );

        };


    });
