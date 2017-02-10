angular.module('appointment.controllers', [])
   .controller('AppointmentsCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike) {

        if (typeof $location.search().date == 'undefined'){
            $scope.date =  moment(new Date()).format("YYYY-MM-DD")
        }
        else{
            $scope.date =  $location.search().date
        }
        $scope.viewbleDate = new Date((Date.parse($scope.date))).toString().split(' ').splice(0,4).join(' ');
        $http.get(apiHost+"api/app/appointments.json?date="+$scope.date+"&"+query_access).then(function (response) {
            for (var i = 0; i < response.data.appointments.length; i++) {
                response.data.appointments[i].start_at_time = moment(new Date(response.data.appointments[i].start_at_time)).format('hh:mm A')
            }
            $scope.appointments = response.data.appointments;
        },
        function(err) {
          console.log(err);
          $state.go('app.login');
        }
        );
        $scope.nextDate = function(){
            var date = moment($scope.date).add(1,'day');
            date = date.toDate();
            date = moment(date).format('YYYY-MM-DD');
            $window.location.href = "#/app/appointments?date="+date;
            $window.location.reload()
        }
        $scope.prevDate = function(){
            var date = moment($scope.date).subtract(1,'day');
            date = date.toDate();
            date = moment(date).format('YYYY-MM-DD');
            $window.location.href = "#/app/appointments?date="+date;
            $window.location.reload()
        }

    })

.controller('NewAppointmentCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike) {
    $scope.appointment = {"appointment": {}};
        $scope.appointment.appointment.clinician_id = $scope.access.clinician_id;

        if (typeof $location.search().date == 'undefined'){
            $scope.date =  moment(new Date()).format("YYYY-MM-DD")
        }
        else{
            $scope.date =  $location.search().date
        }

        $http.get(apiHost+"api/app/appointments/new.json?"+query_access).then(function (response) {
                $scope.newAppointmentSetting = response.data;
            },
            function(err) {
                $scope.errorMessageDialog(err);
            }
        );

        $scope.createAppointment = function(){
            $http({
                method: 'POST',
                url: apiHost+'api/app/appointments.json?'+query_access,
                data: $httpParamSerializerJQLike($scope.appointment),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(
                function(res) {
                    if(res.data){
                        $state.go('app.appointments');
                    }
                }
            ).catch(function(res){
                    $scope.errorMessageDialog(res)
                })

        };
        $scope.clinicianChanged = function(selectedClinicianId){
            $http.get(apiHost+"api/app/appointments/new.json?"+query_access+"&clinician_id="+selectedClinicianId).then(function (response) {
                    $scope.newAppointmentSetting = response.data;
                },
                function(err) {
                    $scope.errorMessageDialog(err);
                }
            );
        }
})

    .controller('EditAppointmentCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike, $stateParams) {
        $http.get(apiHost+"api/app/appointments/"+$stateParams.id+".json?"+query_access).then(function (response) {
                $scope.newAppointmentSetting = response.data;
                response.data.appointment.start_at = new Date(response.data.appointment.start_at);
                response.data.appointment.start_time = new Date(response.data.appointment.start_time);
                response.data.appointment.end_time = new Date(response.data.appointment.end_time);
                response.data.appointment.scheduled_until = new Date(response.data.appointment.scheduled_until);
                $scope.appointment = {"appointment": response.data.appointment};
            },
            function(err) {
                console.log(err);
                $state.go('app.login');
            }
        );

        $scope.updateAppointment = function(){
            var access = JSON.parse(localStorage.getItem('access'));
            $http.put(apiHost+"api/app/appointments/"+$stateParams.id+".json?"+query_access,$httpParamSerializerJQLike($scope.appointment), { headers: {'Content-Type': 'application/x-www-form-urlencoded' }})
            .then(
                function(res) {
                    if(res.data){
                        $state.go('app.appointments');
                        $http.get(apiHost+"api/app/appointments.json?date="+$scope.date+"&"+query_access).then(function (response) {
                            $scope.appointments = response.data.appointments;
                        })
                    }
                }
            ).catch(function(res){
                    $scope.errorMessageDialog(res)
                })

        };
    });
