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
        $scope.provider = {"provider": {}};
        $scope.billing_setting = {"billing_setting": {}};
        $scope.patient.patient.clinician_id = $scope.access.clinician_id;
        $scope.isInsuranceShowbale = false;

        $scope.genderOptions = ["Male", "Female"];
        $scope.homephonemessageOptions = ["No Messages", "Voice Messages"];
        $scope.preferredphoneOptions = ["Home", "Mobile"];


        $http.get(apiHost + "api/app/patients/new.json?"+query_access).then(function (response) {
                $scope.newPatientSetting = response.data;
            },
            function (err) {
                console.log(err);
                $state.go('app.login');
            }
        );

        $scope.createPatient = function () {
            json = {"patient": $scope.patient.patient, "provider": $scope.provider.provider, "billing_setting": $scope.billing_setting}
            $http({
                method: 'POST',
                url: apiHost + 'api/app/patients.json?'+query_access,
                data: $httpParamSerializerJQLike(json),
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
        $scope.selectedBillingType = function(){
            $scope.isInsuranceShowbale = event.target.options[event.target.selectedIndex].text == 'Insurance Billing'
        }

    })

    .controller('EditPatientCtrl', function ($scope, $http, $location, $state, $window, $httpParamSerializerJQLike, $stateParams) {
        $scope.genderOptions = ["Male", "Female"];
        $scope.homephonemessageOptions = ["No Messages", "Voice Messages"];
        $scope.preferredphoneOptions = ["Home", "Mobile"];
        var access = JSON.parse(localStorage.getItem('access'));
        $http.get(apiHost + "api/app/patients/" + $stateParams.id + ".json?"+query_access).then(function (response) {
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
            $http.put(apiHost + "api/app/patients/" + $stateParams.id + ".json?"+query_access, $httpParamSerializerJQLike($scope.patient), { headers: {'Content-Type': 'application/x-www-form-urlencoded' }})
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
