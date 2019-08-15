angular.module('appointment.controllers', [])
   .controller('AppointmentsCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike,$ionicLoading, $ionicPlatform) {

        if (typeof $location.search().date == 'undefined'){
            $scope.date =  moment(new Date())
        }
        else{
            $scope.date =  $location.search().date
            $scope.date = moment($scope.date,"YYYY-MM-DD")
        }
        $scope.viewbleDate = new Date((Date.parse($scope.date))).toString().split(' ').splice(0,4).join(' ');

        $scope.formatted_date =  moment($scope.date).format("YYYY-MM-DD");

        $scope.timezone_offset = new Date().getTimezoneOffset();

        $scope.time = {};

        $scope.is_active = true

        var day = $scope.date.format("dddd").toLowerCase();

        $ionicLoading.show();
        var events = [];
        $http.get(apiHost+"api/app/appointments.json?date="+$scope.formatted_date+"&timezone_offset="+$scope.timezone_offset+"&"+$scope.query_access).then(function (response) {
            for (var i = 0; i < response.data.appointments.length; i++) {
                response.data.appointments[i].start_at_time = moment(new Date(response.data.appointments[i].start_at_time))._d
                response.data.appointments[i].end_at_time = moment(new Date(response.data.appointments[i].end_at_time))._d
                response.data.appointments[i].service_code = response.data.appointments[i].service_code == 'Calendar Event' ? 'Calendar' : response.data.appointments[i].service_code
                var json = {id: response.data.appointments[i].id,
                  title: response.data.appointments[i].patient_name,
                  description: "&nbsp;&nbsp;"+response.data.appointments[i].service_code + "&nbsp;&nbsp;" + response.data.appointments[i].location,
                  start: response.data.appointments[i].start_at_time,
                  end: response.data.appointments[i].end_at_time,
                  service_code: response.data.appointments[i].service_code,
                  is_group_appointment:response.data.appointments[i].is_group_appointment
                }
                events.push(json);
            }
            $scope.appointments = response.data.appointments;
            $scope.time.start_time = moment(response.data.work_hour["start_"+day]).format("HH:mm:ss")
            $scope.time.end_time = moment(response.data.work_hour["end_"+day]).format("HH:mm:ss")

            $scope.is_active = response.data.work_hour["show_"+day]

            console.log($scope.is_active)

            $ionicLoading.hide();

                $('#calendar').fullCalendar({
                    header: false,
                    footer: false,
                    defaultView: 'agendaDay',
                    defaultDate: $scope.date,
                    navLinks: false,
                    contentHeight: 'auto',
                    editable: false,
                    eventLimit: false,
                    minTime: $scope.time.start_time,
                    maxTime: $scope.time.end_time,
                    events: events ,
                    eventColor: "rgba(163,220,114,0.4)",
                    eventRender: function(event, element) {
                      if(event.service_code == 'Missed') {
                        element.css('backgroundColor', '#FFCCCB');
                      }
                      else if(event.service_code == '') {
                        element.css('backgroundColor', '#D3D3D3');
                      }

                      if(event.is_group_appointment){
                        element.css('backgroundColor', 'rgba(173,216,230,0.4)');
                      }
                        element.find('.fc-title').append(event.description);
                    },
                    viewRender: function(view, element) {
                        element.find('.fc-day-header').hide();
                        element.find(".fc-unselectable:first").hide();
                        element.find("hr.fc-widget-header").hide();
                        if(!$scope.is_active) {
                          $('#calendar').find("tr").addClass("deactivated");
                        } else {
                          $('#calendar').find("tr").removeClass("deactivated");
                        }

                    },
                    eventClick: function(calEvent, jsEvent, view) {
                        $window.location.href = "#/app/appointments/" + calEvent.id;
                    },
                    eventAfterRender: function (event, element, view) {
                        if (element.hasClass('fc-short')) {
                            element.removeClass('fc-short').addClass('fc-custom')
                        }
                    }
                });

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

.controller('NewAppointmentCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike,$ionicLoading,$ionicScrollDelegate) {
        $scope.appointment = {"appointment": {}};
        $scope.isCalenderEvent = false;
        $scope.units_options = [1,2,3,4,5,6,7,8,9,10,11,12];
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
                $ionicLoading.hide();
            },
            function(err) {
                console.log(err)
                $ionicLoading.hide();
                $scope.errorMessageDialog(err);
            }
        );

        $scope.errorMessages = []
        $scope.startTimeOfDay = null
        $scope.endTimeOfDay = null

        $scope.timeOfTheDay = function(date,time){
           time = moment(time).format('ha');
           time = moment((date.format("YYYY-MM-DD") + ' ' + time),"YYYY-MM-DD ha");
           return time;
         };

         $scope.calculateStartAndEndOfDay = function(startTimeOfDay, endTimeOfDay, date){
             date = moment(date)
             startTimeOfDay = $scope.timeOfTheDay(date, startTimeOfDay)
             $scope.startTimeOfDay = startTimeOfDay.subtract(1, 'second');
             $scope.endTimeOfDay = $scope.timeOfTheDay(date, endTimeOfDay)
           };


          $scope.getOverlappedAppointment = function(appointment){
            var scheduled_until = "";
            if(appointment.frequency != "One Time"){
              scheduled_until = appointment.scheduled_until;
              scheduled_until = moment(scheduled_until).utc().format();
            }

            var start_at = moment(appointment.start_at).utc().format();
            var end_at = moment(appointment.end_at).utc().format();
            $ionicLoading.show();
            var existingAppointments = $.ajax({
              type: "GET",
              url: apiHost+"/api/app/appointments/overlapped?"+$scope.query_access+"&id="+appointment.id+"&clinician_id="+appointment.clinician_id+"&start_at="+start_at+"&end_at="+end_at+"&scheduled_until="+scheduled_until+"&frequency="+appointment.frequency,
              async: false
            }).responseText;
            $ionicLoading.hide();

            return JSON.parse(existingAppointments)['appointments'][0];
          },

            $scope.handleOverlappedAppointment = function(appointment){
            if(appointment.patient_id == null && appointment.therapy_group_id == null) {
              return true
            }

            console.log("1st time ")
           // console.log(appointment)

            var existingAppointment = $scope.getOverlappedAppointment(appointment);

              console.log(existingAppointment)

            if(existingAppointment && appointment.location_id && existingAppointment.location_id != appointment.location_id){
              alert("You already have an appointment for this date and time at a different location.");
              return false;
            }
            if(existingAppointment && (existingAppointment.location_id == appointment.location_id || !appointment.location_id)){
              return confirm("You already have an appointment for this date and time at this location. Still want to proceed?");
            }
            return true;
          },




        $scope.createAppointment = function(){

            var calenderEvent = $scope.isCalenderEvent
            var appointment = jQuery.extend(true, {}, $scope.appointment.appointment)

            if ($scope.checkAppointmentErrors(appointment,calenderEvent)) {
               return false;
            }

            //console.log($scope.appointment.appointment)

            var start_time = appointment.start_time.toTimeString().split(" ")[0];
            var end_time = appointment.end_time.toTimeString().split(" ")[0];
            var start_at = appointment.start_at.toDateString();
            appointment.start_at = start_at + " " + start_time
            appointment.end_at = start_at + " " + end_time


            var dayName = moment(appointment.start_at).format('dddd').toLowerCase();
            var startOfDay = moment($scope.newAppointmentSetting.work_hour.all_clinicians_work_hours["clinician_"+appointment.clinician_id]["start_"+dayName]);
            var endOfDay = moment($scope.newAppointmentSetting.work_hour.all_clinicians_work_hours["clinician_"+appointment.clinician_id]["end_"+dayName]);
            $scope.calculateStartAndEndOfDay(startOfDay,endOfDay, appointment.start_at);
            var slotNotAvailable = !moment(appointment.start_at).isBetween($scope.startTimeOfDay,$scope.endTimeOfDay);
            var dayNotAvailable = $scope.newAppointmentSetting.work_hour.all_clinicians_turn_off_days["clinician_"+appointment.clinician_id].indexOf(moment(appointment.start_at).day()) > -1


            if(dayNotAvailable && !calenderEvent ){
              alert("This day is not available.")
              return false;
            }
            else if(slotNotAvailable && !calenderEvent ) {
              alert("This slot is not available.")
              return false;
            }

          if(!$scope.handleOverlappedAppointment(appointment)){
             return false;
          }

            $ionicLoading.show();

            $http({
                method: 'POST',
                url: apiHost+'api/app/appointments.json?'+$scope.query_access,
                data: $httpParamSerializerJQLike({"appointment": appointment}),
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

        $scope.checkAppointmentErrors = function(appointment,calenderEvent) {
         $scope.errorMessages = []
         if(appointment.clinician_id == null && !calenderEvent) {
           $scope.errorMessages.push("Must Select a Clinician")
         }
         if(appointment.patient_id == null && !calenderEvent) {
           $scope.errorMessages.push("Must Select a Client")
         }
         if(appointment.procedure_code_modifier_id == null) {
           $scope.errorMessages.push("Must Select a Code Modifier")
         }
         if(appointment.service_code_id == null) {
           $scope.errorMessages.push("Must Select a Type")
         }
         if(appointment.location_id == null) {
           $scope.errorMessages.push("Must Select a Location")
         }
         if(appointment.start_at == null) {
           $scope.errorMessages.push("Date can not be blank")
         }
         if(appointment.start_time == null) {
           $scope.errorMessages.push("Time can not be blank")
         }
         if(appointment.end_time == null) {
           $scope.errorMessages.push("Until can not be blank")
         }
         if(appointment.frequency == null) {
           $scope.errorMessages.push("Must Select Frequency")
         }

         if($scope.errorMessages.length > 0) {
           $("div.error-messages").show();
           $ionicScrollDelegate.scrollTop();
           return true
         }
         else {
           return false
         }

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
                        $scope.payer = "Private Pay"
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
            console.log($scope.isCalenderEvent)
        }
})

    .controller('EditAppointmentCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike, $stateParams, $ionicLoading, $ionicModal,$ionicScrollDelegate) {

        $ionicModal.fromTemplateUrl('modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.units_options = [1,2,3,4,5,6,7,8,9,10,11,12];

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
                $scope.getPayer();

                $ionicLoading.hide();
            },
            function(err) {
                $ionicLoading.hide();
                $scope.errorMessageDialog(err)
            }
        );
        $scope.errorMessages = []
        $scope.startTimeOfDay = null
        $scope.endTimeOfDay = null

        $scope.timeOfTheDay = function(date,time){
          time = moment(time).format('ha');
          time = moment((date.format("YYYY-MM-DD") + ' ' + time),"YYYY-MM-DD ha");
          return time;
        };

        $scope.calculateStartAndEndOfDay = function(startTimeOfDay, endTimeOfDay, date){
          date = moment(date)
          startTimeOfDay = $scope.timeOfTheDay(date, startTimeOfDay)
          $scope.startTimeOfDay = startTimeOfDay.subtract(1, 'second');
          $scope.endTimeOfDay = $scope.timeOfTheDay(date, endTimeOfDay)
        };

      $scope.getOverlappedAppointment = function(appointment){
        var scheduled_until = "";
        if(appointment.frequency != "One Time"){
          scheduled_until = appointment.scheduled_until;
          scheduled_until = moment(scheduled_until).utc().format();
        }

        var start_at = moment(appointment.start_at).utc().format();
        var end_at = moment(appointment.end_at).utc().format();
        $ionicLoading.show();
        var existingAppointments = $.ajax({
          type: "GET",
          url: apiHost+"/api/app/appointments/overlapped?"+$scope.query_access+"&id="+appointment.id+"&clinician_id="+appointment.clinician_id+"&start_at="+start_at+"&end_at="+end_at+"&scheduled_until="+scheduled_until+"&frequency="+appointment.frequency,
          async: false
        }).responseText;

        $ionicLoading.hide()

        return JSON.parse(existingAppointments)['appointments'][0];
      },

        $scope.handleOverlappedAppointment = function(appointment){
          if(appointment.patient_id == null && appointment.therapy_group_id == null) {
            return true
          }
          console.log("2st time ")
          var existingAppointment = $scope.getOverlappedAppointment(appointment);

          if(existingAppointment && appointment.location_id && existingAppointment.location_id != appointment.location_id){
            alert("You already have an appointment for this date and time at a different location.");
            return false;
          }
          if(existingAppointment && (existingAppointment.location_id == appointment.location_id || !appointment.location_id)){
            return confirm("You already have an appointment for this date and time at this location. Still want to proceed?");
          }
          return true;
        },


        $scope.updateAppointment = function(){

          var calenderEvent = $scope.isCalenderEvent
          var appointment = jQuery.extend(true, {}, $scope.appointment.appointment)

          if ($scope.checkAppointmentErrors(appointment,calenderEvent)) {
            return false;
          }

          console.log($scope.appointment.appointment)

          var start_time = appointment.start_time.toTimeString().split(" ")[0];
          var end_time = appointment.end_time.toTimeString().split(" ")[0];
          var start_at = appointment.start_at.toDateString();
          appointment.start_at = start_at + " " + start_time
          appointment.end_at = start_at + " " + end_time

          $scope.appointment.appointment.start_at = start_at + " " + start_time
          $scope.appointment.appointment.end_at = start_at + " " + end_time


          var dayName = moment(appointment.start_at).format('dddd').toLowerCase();
          var startOfDay = moment($scope.newAppointmentSetting.work_hour.all_clinicians_work_hours["clinician_"+appointment.clinician_id]["start_"+dayName]);
          var endOfDay = moment($scope.newAppointmentSetting.work_hour.all_clinicians_work_hours["clinician_"+appointment.clinician_id]["end_"+dayName]);
          $scope.calculateStartAndEndOfDay(startOfDay,endOfDay, appointment.start_at);
          var slotNotAvailable = !moment(appointment.start_at).isBetween($scope.startTimeOfDay,$scope.endTimeOfDay);
          var dayNotAvailable = $scope.newAppointmentSetting.work_hour.all_clinicians_turn_off_days["clinician_"+appointment.clinician_id].indexOf(moment(appointment.start_at).day()) > -1


          if(dayNotAvailable && !calenderEvent ){
            alert("This day is not available.")
            return false;
          }
          else if(slotNotAvailable && !calenderEvent ) {
            alert("This slot is not available.")
            return false;
          }

          if(!$scope.handleOverlappedAppointment(appointment)){
            return false;
          }

          $ionicLoading.show();

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

        $scope.checkAppointmentErrors = function(appointment) {
           $scope.errorMessages = []
           if(appointment.clinician_id == null) {
             $scope.errorMessages.push("Must Select a Clinician")
           }
           if(appointment.patient_id == null) {
             $scope.errorMessages.push("Must Select a Client")
           }
           if(appointment.procedure_code_modifier_id == null) {
             $scope.errorMessages.push("Must Select a Code Modifier")
           }
           if(appointment.service_code_id == null) {
             $scope.errorMessages.push("Must Select a Type")
           }
           if(appointment.location_id == null) {
             $scope.errorMessages.push("Must Select a Location")
           }
           if(appointment.start_at == null) {
             $scope.errorMessages.push("Date can not be blank")
           }
           if(appointment.start_time == null) {
             $scope.errorMessages.push("Time can not be blank")
           }
           if(appointment.end_time == null) {
             $scope.errorMessages.push("Until can not be blank")
           }
           if(appointment.frequency == null) {
             $scope.errorMessages.push("Must Select Frequency")
           }

           if($scope.errorMessages.length > 0) {
             $("div.error-messages").show();
             $ionicScrollDelegate.scrollTop();
             return true
           }
           else {
             return false
           }

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
            if($scope.appointment.appointment.patient_id != null) {
            $ionicLoading.show();
            $http.get(apiHost+"/api/app/patient_providers.json?patient_id="+$scope.appointment.appointment.patient_id+"&"+$scope.query_access).then(function (response) {
                    var patient_providers = response.data.patient_providers;
                    if(patient_providers.length > 0){
                        $scope.payer = patient_providers[0].name;
                    }
                    else{
                        $scope.payer = "Private Pay"
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
