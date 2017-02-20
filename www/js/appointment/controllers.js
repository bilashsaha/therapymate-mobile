angular.module('appointment.controllers', [])
   .controller('AppointmentsCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike,$ionicLoading) {

        if (typeof $location.search().date == 'undefined'){
            $scope.date =  moment(new Date())
        }
        else{
            $scope.date =  $location.search().date + " " + new Date().toTimeString();
            $scope.date = moment($scope.date)
        }
        $scope.localDate = $scope.date
        $scope.viewbleDate = new Date((Date.parse($scope.date))).toString().split(' ').splice(0,4).join(' ');


        $scope.date =  moment($scope.date).utc().format("YYYY-MM-DD"); //moment($scope.date).utc().format("YYYY-MM-DD");
        $ionicLoading.show();
        $http.get(apiHost+"api/app/appointments.json?date="+$scope.date+"&"+query_access).then(function (response) {
            for (var i = 0; i < response.data.appointments.length; i++) {
                response.data.appointments[i].start_at_time = moment(new Date(response.data.appointments[i].start_at_time)).format('hh:mm A')
            }
            $scope.appointments = response.data.appointments;
            $ionicLoading.hide();
        },
        function(err) {
            $ionicLoading.hide();
          console.log(err);
          $state.go('app.login');
        }
        );
        $scope.nextDate = function(){
            var date = $scope.localDate.add(1,'day');
            date = moment(date).format('YYYY-MM-DD');
            $window.location.href = "#/app/appointments?date="+date;
            $window.location.reload()
        }
        $scope.prevDate = function(){
            var date = $scope.localDate.subtract(1,'day');
            date = moment(date).format('YYYY-MM-DD');
            $window.location.href = "#/app/appointments?date="+date;
            $window.location.reload()
        }

    })

.controller('NewAppointmentCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike,$ionicLoading) {
    $scope.appointment = {"appointment": {}};
        $scope.isCalenderEvent = false;
        $scope.appointment.appointment.clinician_id = $scope.access.clinician_id;

        if (typeof $location.search().date == 'undefined'){
            $scope.date =  moment(new Date()).format("YYYY-MM-DD")
        }
        else{
            $scope.date =  $location.search().date
        }

        $ionicLoading.show();
        $http.get(apiHost+"api/app/appointments/new.json?"+query_access).then(function (response) {
                $scope.newAppointmentSetting = response.data;
                $ionicLoading.hide();
            },
            function(err) {
                $ionicLoading.hide();
                $scope.errorMessageDialog(err);
            }
        );

        $scope.createAppointment = function(){
            $ionicLoading.show();
            var start_time = $scope.appointment.appointment.start_time.toTimeString().split(" ")[0];
            var end_time = $scope.appointment.appointment.end_time.toTimeString().split(" ")[0];
            var start_at = $scope.appointment.appointment.start_at.toDateString();
            $scope.appointment.appointment.start_at = start_at + " " + start_time
            $scope.appointment.appointment.end_at = start_at + " " + end_time
            $scope.appointment.appointment.start_at = new Date(new Date($scope.appointment.appointment.start_at).toISOString());
            $scope.appointment.appointment.end_at = new Date(new Date($scope.appointment.appointment.end_at).toISOString());
            $http({
                method: 'POST',
                url: apiHost+'api/app/appointments.json?'+query_access,
                data: $httpParamSerializerJQLike($scope.appointment),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(
                function(res) {
                    if(res.data){
                        $ionicLoading.hide();
                        $window.location.href = "#/app/appointments";
                        $window.location.reload()
                    }
                }
            ).catch(function(res){
                    $ionicLoading.hide();
                    $scope.errorMessageDialog(res)
                })

        };
        $scope.clinicianChanged = function(selectedClinicianId){
            $ionicLoading.show();
            $http.get(apiHost+"api/app/appointments/new.json?"+query_access+"&clinician_id="+selectedClinicianId).then(function (response) {
                    $scope.newAppointmentSetting = response.data;
                    $ionicLoading.hide();
                },
                function(err) {
                    $ionicLoading.hide();
                    $scope.errorMessageDialog(err);
                }
            );
        }
        $scope.startTimeChanged = function(startTime){
            var duration = 0;
            for (i=0;i< $scope.newAppointmentSetting.service_codes.length; i++){
              if($scope.appointment.appointment.service_code_id == $scope.newAppointmentSetting.service_codes[i].id){
                duration = $scope.newAppointmentSetting.service_codes[i].duration;
                break;
              }
            }
            var endTime = moment(startTime).add(duration,"minutes");
            $scope.appointment.appointment.end_time = endTime._d;
        }
        $scope.resetForm = function(){
            $scope.isCalenderEvent = event.target.options[event.target.selectedIndex].text == 'Calender';
        }
})

    .controller('EditAppointmentCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike, $stateParams, $ionicLoading) {
        $ionicLoading.show();
        $http.get(apiHost+"api/app/appointments/"+$stateParams.id+".json?"+query_access).then(function (response) {
                $scope.newAppointmentSetting = response.data;
                response.data.appointment.start_at = moment(response.data.appointment.start_at).local().toDate();
                console.log(response.data.appointment.start_at)
                response.data.appointment.start_time = new Date(response.data.appointment.start_time);
                response.data.appointment.end_time = new Date(response.data.appointment.end_time);
                response.data.appointment.scheduled_until = new Date(response.data.appointment.scheduled_until);
                $scope.appointment = {"appointment": response.data.appointment};
                $scope.isCalenderEvent = $scope.appointment.patient_id == null;
                $ionicLoading.hide();
            },
            function(err) {
                $ionicLoading.hide();
                $scope.errorMessageDialog(err)
            }
        );

        $scope.updateAppointment = function(){
            $ionicLoading.show();
            var start_time = $scope.appointment.appointment.start_time.toTimeString().split(" ")[0];
            var end_time = $scope.appointment.appointment.end_time.toTimeString().split(" ")[0];
            var start_at = $scope.appointment.appointment.start_at.toDateString();
            $scope.appointment.appointment.start_at = start_at + " " + start_time
            $scope.appointment.appointment.end_at = start_at + " " + end_time
            $scope.appointment.appointment.start_at = new Date(new Date($scope.appointment.appointment.start_at).toISOString());
            $scope.appointment.appointment.end_at = new Date(new Date($scope.appointment.appointment.end_at).toISOString());
            var access = JSON.parse(localStorage.getItem('access'));
            $http.put(apiHost+"api/app/appointments/"+$stateParams.id+".json?"+query_access,$httpParamSerializerJQLike($scope.appointment), { headers: {'Content-Type': 'application/x-www-form-urlencoded' }})
            .then(
                function(res) {
                    if(res.data){
                        $ionicLoading.hide();
                        $window.location.href = "#/app/appointments";
                        $window.location.reload();
                    }
                }
            ).catch(function(res){
                    $ionicLoading.hide();
                    $scope.errorMessageDialog(res)
                })

        };
        $scope.resetForm = function(){
            $scope.isCalenderEvent = event.target.options[event.target.selectedIndex].text == 'Calender';
        }
    });
