angular.module('appointment.controllers', [])
   .controller('AppointmentsCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike) {
        if (typeof $location.search().date == 'undefined'){
            $scope.date =  moment(new Date()).format("YYYY-MM-DD")
        }
        else{
            $scope.date =  $location.search().date
        }
        $scope.viewbleDate = new Date((Date.parse($scope.date))).toString().split(' ').splice(0,4).join(' ');
        var access = JSON.parse(localStorage.getItem('access'));
        $http.get(apiHost+"api/app/appointments.json?date="+$scope.date+"&token="+access.token+"&email="+access.email).then(function (response) {
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
        var access = JSON.parse(localStorage.getItem('access'));
        $http.get(apiHost+"api/app/appointments/new.json?token="+access.token+"&email="+access.email).then(function (response) {
                $scope.newAppointmentSetting = response.data;
            },
            function(err) {
                console.log(err);
                $state.go('app.login');
            }
        );

        $scope.createAppointment = function(){
            var access = JSON.parse(localStorage.getItem('access'));
            $http({
                method: 'POST',
                url: apiHost+'api/app/appointments.json?token='+access.token+"&email="+access.email,
                data: $httpParamSerializerJQLike($scope.appointment),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(
                function(res) {
                    if(res.data){
                        $state.go('app.appointments');
                    }
                },
                function(err) {
                    console.log(err);
                }
            );

        };
})

    .controller('EditAppointmentCtrl', function($scope,$http,$location,$state,$window, $httpParamSerializerJQLike, $stateParams) {
        var access = JSON.parse(localStorage.getItem('access'));
        $http.get(apiHost+"api/app/appointments/"+$stateParams.id+".json?token="+access.token+"&email="+access.email).then(function (response) {
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
            $http.put(apiHost+"api/app/appointments/"+$stateParams.id+".json?token="+access.token+"&email="+access.email,$httpParamSerializerJQLike($scope.appointment), { headers: {'Content-Type': 'application/x-www-form-urlencoded' }})
            .then(
                function(res) {
                    if(res.data){
                        $state.go('app.appointments');
                    }
                },
                function(err) {
                    console.log(err);
                }
            );

        };
    });
