angular.module('patient.controllers', [])
    .controller('PatientsCtrl', function ($scope, $http, $location, $state, $window, $httpParamSerializerJQLike, $ionicLoading) {
        var access = JSON.parse(localStorage.getItem('access'));
        $ionicLoading.show()
        $http.get(apiHost + "api/app/patients.json?date=" + $scope.date + "&token=" + access.token + "&email=" + access.email).then(function (response) {
                $scope.patients = response.data.patients;
                $ionicLoading.hide();
            },
            function (err) {
                $ionicLoading.hide();
                console.log(err);
                $state.go('app.login');
            }
        );
    })

    .controller('NewPatientCtrl', function ($scope, $http, $location, $state, $window, $httpParamSerializerJQLike,$ionicLoading) {
        $scope.patient = {"patient": {}};
        $scope.provider = {"provider": {}};
        $scope.billing_setting = {"billing_setting": {}};
        $scope.patient.patient.clinician_id = $scope.access.clinician_id;
        $scope.isInsuranceShowbale = false;

        $scope.genderOptions = ["Male", "Female"];
        $scope.homephonemessageOptions = ["No Messages", "Voice Messages"];
        $scope.preferredphoneOptions = ["Home", "Mobile"];


        $ionicLoading.show();
        $http.get(apiHost + "api/app/patients/new.json?"+query_access).then(function (response) {
                $scope.newPatientSetting = response.data;
                $ionicLoading.hide()
            },
            function (err) {
                $ionicLoading.hide()
                $scope.errorMessageDialog(err);
            }
        );

        $scope.createPatient = function () {
            $scope.patient.patient.mobilephone = angular.element(document.getElementById('mobile_phone')).val();
            $scope.patient.patient.homephone = angular.element(document.getElementById('home_phone')).val();
            $scope.patient.patient.date_of_birth = angular.element(document.getElementById('dob')).val();

            json = {"patient": $scope.patient.patient, "provider": $scope.provider.provider, "billing_setting": $scope.billing_setting}
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: apiHost + 'api/app/patients.json?'+query_access,
                data: $httpParamSerializerJQLike(json),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(
                function (res) {
                    if (res.data) {
                        $ionicLoading.hide();
                        $window.location.href = "#/app/patients";
                        $window.location.reload();
                    }
                }
            ).catch(function(res){
                    $ionicLoading.hide();
                    $scope.errorMessageDialog(res)
                })

        };
        $scope.selectedBillingType = function(){
            $scope.isInsuranceShowbale = event.target.options[event.target.selectedIndex].text == 'Insurance Billing'
        }

    })

    .controller('EditPatientCtrl', function ($scope, $http, $location, $state, $window, $httpParamSerializerJQLike, $stateParams, $ionicLoading) {
        $scope.genderOptions = ["Male", "Female"];
        $scope.homephonemessageOptions = ["No Messages", "Voice Messages"];
        $scope.preferredphoneOptions = ["Home", "Mobile"];
        var access = JSON.parse(localStorage.getItem('access'));
        $ionicLoading.show();
        $http.get(apiHost + "api/app/patients/" + $stateParams.id + ".json?"+query_access).then(function (response) {
                $scope.newPatientSetting = response.data;
                $scope.patient = {"patient": response.data.patient};
                $ionicLoading.hide();
            },
            function (err) {
                $ionicLoading.hide();
                $scope.errorMessageDialog(err);
            }
        );

        $scope.updatePatient = function () {
            $scope.patient.patient.mobilephone = angular.element(document.getElementById('mobile_phone')).val();
            $scope.patient.patient.homephone = angular.element(document.getElementById('home_phone')).val();
            $scope.patient.patient.date_of_birth = angular.element(document.getElementById('dob')).val();


            var access = JSON.parse(localStorage.getItem('access'));
            $ionicLoading.show();
            $http.put(apiHost + "api/app/patients/" + $stateParams.id + ".json?"+query_access, $httpParamSerializerJQLike($scope.patient), { headers: {'Content-Type': 'application/x-www-form-urlencoded' }})
                .then(
                function (res) {
                    if (res.data) {
                        $ionicLoading.hide();
                        $window.location.href = "#/app/patients";
                        $window.location.reload()
                    }
                }
            ).catch(function(res){
                    $ionicLoading.hide();
                    $scope.errorMessageDialog(res)
                })

        };
    });
