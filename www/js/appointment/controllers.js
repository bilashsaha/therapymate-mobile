angular.module('appointment.controllers', [])
   .controller('AppointmentsCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike,$ionicLoading) {

        if (typeof $location.search().date == 'undefined'){
            $scope.date =  moment(new Date())
        }
        else{
            $scope.date =  $location.search().date
            $scope.date = moment($scope.date)
        }
        $scope.viewbleDate = new Date((Date.parse($scope.date))).toString().split(' ').splice(0,4).join(' ');

        $scope.formatted_date =  moment($scope.date).format("YYYY-MM-DD");

        $scope.timezone_offset = new Date().getTimezoneOffset();

        $ionicLoading.show();
        $http.get(apiHost+"api/app/appointments.json?date="+$scope.formatted_date+"&timezone_offset="+$scope.timezone_offset+"&"+$scope.query_access).then(function (response) {
            for (var i = 0; i < response.data.appointments.length; i++) {
                response.data.appointments[i].start_at_time = moment(new Date(response.data.appointments[i].start_at_time)).format('hh:mmA')
                response.data.appointments[i].end_at_time = moment(new Date(response.data.appointments[i].end_at_time)).format('hh:mmA')
                response.data.appointments[i].service_code = response.data.appointments[i].service_code == 'Calendar Event' ? 'Calendar' : response.data.appointments[i].service_code
            }
            $scope.appointments = response.data.appointments;
            $ionicLoading.hide();
        },
        function(err) {
          $ionicLoading.hide();
          console.log(err);
          //localStorage.setItem('access',null);
          //$state.go('app.login');
        }
        );
        $scope.nextDate = function(){
            var date = $scope.date.add(1,'day');
            date = moment(date).format('YYYY-MM-DD');
            $window.location.href = "#/app/appointments?date="+date+"&timezone_offset="+$scope.timezone_offset;
            $window.location.reload()
        }
        $scope.prevDate = function(){
            var date = $scope.date.subtract(1,'day');
            date = moment(date).format('YYYY-MM-DD');
            $window.location.href = "#/app/appointments?date="+date+"&timezone_offset="+$scope.timezone_offset;
            $window.location.reload()
        }

    })

.controller('NewAppointmentCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike,$ionicLoading) {
    $scope.appointment = {"appointment": {}};
        $scope.isCalenderEvent = false;
        $scope.display_procedure_code_modifiers = false;
        $scope.payer = "";
        $scope.procedure_code_modifiers = [];
        $scope.appointment.appointment.clinician_id = $scope.access.clinician_id;
        $scope.appointment.appointment.units = 1;
        $scope.appointment.appointment.start_time = new Date("1970-01-01 "+(new Date().getHours()+1)+":00:00");

        if (typeof $location.search().date == 'undefined'){
            $scope.date =  moment(new Date()).format("YYYY-MM-DD")
        }
        else{
            $scope.date =  $location.search().date
        }


        $ionicLoading.show();
        $http.get(apiHost+"api/app/appointments/new.json?"+$scope.query_access).then(function (response) {
                $scope.newAppointmentSetting = response.data;
                $scope.getDisplayProcedureCodeModifiers($scope.appointment.appointment.clinician_id)
                $scope.newAppointmentSetting.units_options = [1,2,3,4,5,6,7,8,9,10,11,12]
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

            if($scope.appointment.appointment.scheduled_until){
                $scope.appointment.appointment.scheduled_until = new Date(new Date($scope.appointment.appointment.scheduled_until).toISOString());
            }

            $http({
                method: 'POST',
                url: apiHost+'api/app/appointments.json?'+$scope.query_access,
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
            $http.get(apiHost+"api/app/appointments/new.json?"+$scope.query_access+"&clinician_id="+selectedClinicianId).then(function (response) {
                    $scope.newAppointmentSetting = response.data;
                    $scope.display_procedure_code_modifiers = false;
                    $scope.getDisplayProcedureCodeModifiers(selectedClinicianId)
                    $ionicLoading.hide();
                },
                function(err) {
                    $ionicLoading.hide();
                    $scope.errorMessageDialog(err);
                }
            );
        };

        $scope.getDisplayProcedureCodeModifiers = function(clinician_id){
            for(var i in $scope.newAppointmentSetting.clinicians)
            {
                if($scope.newAppointmentSetting.clinicians[i].id == clinician_id){
                    $scope.display_procedure_code_modifiers =   $scope.newAppointmentSetting.clinicians[i].display_procedure_code_modifiers
                    $scope.procedure_code_modifiers = $scope.newAppointmentSetting.clinicians[i].procedure_code_modifiers
                    break;
                }
            }
        }

        $scope.getPayer = function(){
            $ionicLoading.show();

            $http.get(apiHost+"/api/app/patient_providers.json?patient_id="+$scope.appointment.appointment.patient_id+"&"+$scope.query_access).then(function (response) {
                    var patient_providers = response.data.patient_providers;
                    if(patient_providers.length > 0){
                        $scope.payer = patient_providers[0].name;
                    }
                    else{
                        $scope.payer = "Cash Pay"
                    }

                    console.log($scope.payer)
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
            $scope.isCalenderEvent = event.target.options[event.target.selectedIndex].text == 'Calendar Event';
        }
})

    .controller('EditAppointmentCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike, $stateParams, $ionicLoading, $ionicModal) {

        $ionicModal.fromTemplateUrl('modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });



        $scope.choice = {"val":"A"};

        $ionicLoading.show();
        $http.get(apiHost+"api/app/appointments/"+$stateParams.id+".json?"+$scope.query_access).then(function (response) {
                $scope.newAppointmentSetting = response.data;
                response.data.appointment.start_at = moment(response.data.appointment.start_at).local().toDate();
                console.log(response.data.appointment.start_at)
                response.data.appointment.start_time = new Date(response.data.appointment.start_time);
                response.data.appointment.end_time = new Date(response.data.appointment.end_time);
                response.data.appointment.scheduled_until = new Date(response.data.appointment.scheduled_until);
                $scope.appointment = {"appointment": response.data.appointment};
                $scope.isCalenderEvent = $scope.appointment.appointment.patient_id == null;
                $scope.getDisplayProcedureCodeModifiers($scope.appointment.appointment.clinician_id)
                $scope.newAppointmentSetting.units_options = [1,2,3,4,5,6,7,8,9,10,11,12]
                $scope.getPayer();

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

            if($scope.appointment.appointment.scheduled_until){
                $scope.appointment.appointment.scheduled_until = new Date(new Date($scope.appointment.appointment.scheduled_until).toISOString());
            }

            var access = JSON.parse(localStorage.getItem('access'));
            $http.put(apiHost+"api/app/appointments/"+$stateParams.id+".json?"+$scope.query_access,$httpParamSerializerJQLike($scope.appointment), { headers: {'Content-Type': 'application/x-www-form-urlencoded' }})
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
            $scope.isCalenderEvent = event.target.options[event.target.selectedIndex].text == 'Calendar Event';
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
        };
        $scope.hideModal = function(){
            $scope.modal.hide();
        }
        $scope.showModal = function(){
            $scope.modal.show();
        }

        $scope.delete = function(){
            if($scope.appointment.appointment.frequency != 'One Time'){
                $scope.modal.show();
                $ionicLoading.show();
                var url = "";
                if($scope.choice.val == 'A'){
                    url = apiHost+"api/app/appointments/"+$stateParams.id+".json?";
                }
                else{
                    url = apiHost+"api/app/appointments/"+$stateParams.id+"/destroy_all.json?";
                }

            }
            else{
                url = apiHost+"api/app/appointments/"+$stateParams.id+".json?";
                if(!confirm("Are you sure?")){
                    return;
                }
                $ionicLoading.show();
            }


            var access = JSON.parse(localStorage.getItem('access'));
            $http.delete(url+$scope.query_access,$httpParamSerializerJQLike($scope.appointment), { headers: {'Content-Type': 'application/x-www-form-urlencoded' }})
                .then(
                function(res) {
                    $ionicLoading.hide();
                    $window.location.href = "#/app/appointments";
                    $window.location.reload();
                }
            ).catch(function(res){
                    $ionicLoading.hide();
                    $scope.errorMessageDialog(res)
                })
        }


        $scope.getDisplayProcedureCodeModifiers = function(clinician_id){
            for(var i in $scope.newAppointmentSetting.clinicians)
            {
                if($scope.newAppointmentSetting.clinicians[i].id == clinician_id){
                    $scope.display_procedure_code_modifiers =   $scope.newAppointmentSetting.clinicians[i].display_procedure_code_modifiers
                    $scope.procedure_code_modifiers = $scope.newAppointmentSetting.clinicians[i].procedure_code_modifiers
                    break;
                }
            }
        }

        $scope.getPayer = function(){
            $ionicLoading.show();

            $http.get(apiHost+"/api/app/patient_providers.json?patient_id="+$scope.appointment.appointment.patient_id+"&"+$scope.query_access).then(function (response) {
                    var patient_providers = response.data.patient_providers;
                    if(patient_providers.length > 0){
                        $scope.payer = patient_providers[0].name;
                    }
                    else{
                        $scope.payer = "Cash Pay"
                    }

                    console.log($scope.payer)
                    $ionicLoading.hide();
                },
                function(err) {
                    $ionicLoading.hide();
                    $scope.errorMessageDialog(err);
                }
            );
        }

    })

    .controller('MissedAppointmentCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike, $stateParams, $ionicLoading) {
        $scope.missed_appointment_note = {"missed_appointment_note": {}};
        $scope.sign_this_form = {};
        $ionicLoading.show();
        var access = JSON.parse(localStorage.getItem('access'));
        $http.get(apiHost+"api/app/missed_appointment_notes/new.json?appointment_id="+$stateParams.id+"&"+$scope.query_access,$httpParamSerializerJQLike($scope.appointment), { headers: {'Content-Type': 'application/x-www-form-urlencoded' }})
            .then(
            function(res) {
                $scope.missedAppointmentSetting = res.data;
                $scope.missed_appointment_note.missed_appointment_note.cancellation_fee = res.data.cancellation_fee
                $ionicLoading.hide();
            }
        ).catch(function(res){
                $ionicLoading.hide();
                $scope.errorMessageDialog(res)
            });

        $scope.createMissedAppointment = function(){
            $ionicLoading.show();
            json = {"missed_appointment_note": $scope.missed_appointment_note.missed_appointment_note, "sign_this_form": $scope.sign_this_form.sign_this_form}
            $http({
                method: 'POST',
                url: apiHost + 'api/app/missed_appointment_notes.json?appointment_id='+$stateParams.id+"&"+$scope.query_access,
                data: $httpParamSerializerJQLike(json),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(
                function (res) {
                    if (res.data) {
                        $ionicLoading.hide();
                        $window.location.href = "#/app/appointments";
                        $window.location.reload();
                    }
                }
            ).catch(function(res){
                    $ionicLoading.hide();
                    $scope.errorMessageDialog(res)
                })
        }
    })
