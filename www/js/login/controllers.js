angular.module('login.controllers', [])
   .controller('LoginCtrl', function($scope, $ionicModal, $timeout, $http,$httpParamSerializerJQLike,$state,$window,$location, $ionicLoading) {
        // Perform the login action when the user submits the login form
        $scope.loginData = {};
        $scope.users = [];
        if($scope.access && $scope.access.token){
            $ionicLoading.show();
            $window.location.href = "#/app/appointments";
            $window.location.reload();
        }

        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM users', [], function (tx, results) {
                $scope.users = [];
                var len = results.rows.length, i;
                for (i = 0; i < len; i++) {
                    $scope.users.push(results.rows.item(i))
                }
            });

        });


        $scope.doLogin = function() {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: apiHost+'api/app/sessions.json',
                data: $httpParamSerializerJQLike($scope.loginData),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(
                function(res) {
                    if(res.data){
                        localStorage.setItem('access', JSON.stringify(res.data));

                        var email = $scope.loginData.username;
                        var password = $scope.loginData.password;

                        db.transaction(function (tx) {
                            tx.executeSql("SELECT * FROM users where email=?", [email], function (tx, results) {
                                if(results.rows.length <= 0){
                                    tx.executeSql('INSERT INTO users (email, password) VALUES (?, ?)', [email, password]);
                                }
                                else{
                                    tx.executeSql("UPDATE users set email=?,password=? WHERE email=?", [email, password, email]);
                                }
                            });

                        });

                        $ionicLoading.hide();
                        $window.location.href = "#/app/appointments";
                        $window.location.reload();
                    }
                },
                function(err) {
                    $ionicLoading.hide();
                    alert("Invalid username or password!")
                }
            );

        };


    });
