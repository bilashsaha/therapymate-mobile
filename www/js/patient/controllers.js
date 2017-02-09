angular.module('patient.controllers', [])
    .controller('PatientsCtrl', function ($scope, $http, $location, $state, $window, $httpParamSerializerJQLike) {
        var access = JSON.parse(localStorage.getItem('access'));
        $http.get(apiHost + "api/app/patients.json?date=" + $scope.date + "&token=" + access.token + "&email=" + access.email).then(function (response) {
                $scope.patients = response.data.patients;
            },
            function (err) {
                console.log(err);
                $state.go('app.login');
            }
        );
    })

    .controller('NewPatientCtrl', function ($scope, $http, $location, $state, $window, $httpParamSerializerJQLike) {
        $scope.patient = {"patient": {}};
        $scope.genderOptions = ["Male", "Female"];
        $scope.homephonemessageOptions = ["No Messages", "Voice Messages"];
        $scope.preferredphoneOptions = ["Home", "Mobile"];


        var access = JSON.parse(localStorage.getItem('access'));
        $http.get(apiHost + "api/app/patients/new.json?token=" + access.token + "&email=" + access.email).then(function (response) {
                $scope.newPatientSetting = response.data;
            },
            function (err) {
                console.log(err);
                $state.go('app.login');
            }
        );

        $scope.createPatient = function () {
            var access = JSON.parse(localStorage.getItem('access'));
            $http({
                method: 'POST',
                url: apiHost + 'api/app/patients.json?token=' + access.token + "&email=" + access.email,
                data: $httpParamSerializerJQLike($scope.patient),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(
                function (res) {
                    if (res.data) {
                        $state.go('app.patients');
                    }
                }
            ).catch(function(res){
                    $scope.errorMessageDialog(res)
                })

        };
    })

    .controller('EditPatientCtrl', function ($scope, $http, $location, $state, $window, $httpParamSerializerJQLike, $stateParams) {
        $scope.genderOptions = ["Male", "Female"];
        $scope.homephonemessageOptions = ["No Messages", "Voice Messages"];
        $scope.preferredphoneOptions = ["Home", "Mobile"];
        var access = JSON.parse(localStorage.getItem('access'));
        $http.get(apiHost + "api/app/patients/" + $stateParams.id + ".json?token=" + access.token + "&email=" + access.email).then(function (response) {
                $scope.newPatientSetting = response.data;
                response.data.patient.date_of_birth = new Date(response.data.patient.date_of_birth);
                $scope.patient = {"patient": response.data.patient};
            },
            function (err) {
                console.log(err);
                $state.go('app.login');
            }
        );

        $scope.updatePatient = function () {
            var access = JSON.parse(localStorage.getItem('access'));
            $http.put(apiHost + "api/app/patients/" + $stateParams.id + ".json?token=" + access.token + "&email=" + access.email, $httpParamSerializerJQLike($scope.patient), { headers: {'Content-Type': 'application/x-www-form-urlencoded' }})
                .then(
                function (res) {
                    if (res.data) {
                        $state.go('app.patients');
                    }
                }
            ).catch(function(res){
                    $scope.errorMessageDialog(res)
                })

        };
    });
