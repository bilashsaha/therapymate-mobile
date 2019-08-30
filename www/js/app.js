// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var db = null;
var app = angular.module('starter',
    [
        'ngCordova',
        'ionic',
        'starter.controllers',
        'appointment.controllers',
        'login.controllers',
        'patient.controllers',
        'payment.controllers',
        'ui.mask'
    ])

    .run(function ($ionicPlatform,$ionicPopup) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)

            if(window.Connection) {
                if(navigator.connection.type == Connection.NONE) {
                    $ionicPopup.confirm({
                        title: "Internet Disconnected",
                        content: "The internet is disconnected on your device."
                    })
                        .then(function(result) {
                            if(!result) {
                                ionic.Platform.exitApp();
                            }
                        });
                }
            }

            try{
            db = window.openDatabase({name: 'therapymate.db', location: 'default',estimatedSize: 1*1024*1024}, function(){}, function(){},function(){});
            db.transaction(function (tx) {
              tx.executeSql("CREATE TABLE IF NOT EXISTS users (email text, password text)");
              //tx.executeSql("INSERT INTO users VALUES('hola@kola.com','molaaa')";
            });
}
catch(err){
alert("Error");
}


            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $stateProvider

            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })

            .state('app.search', {
                url: '/search',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/search.html'
                    }
                }
            })

            .state('app.appointments', {
                url: '/appointments',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/appointments.html',
                        controller: 'AppointmentsCtrl'
                    }
                }
            })

            .state('app.payments', {
              url: '/payments',
              views: {
                'menuContent': {
                  templateUrl: 'templates/payment/payments.html',
                  controller: 'PaymentsCtrl'
                }
              }
            })

          .state('app.new_payment', {
            url: '/payments/new',
            views: {
              'menuContent': {
                templateUrl: 'templates/payment/new.html',
                controller: 'NewPaymentCtrl'
              }
            }
          })


          .state('app.show_payments', {
            url: '/payments/:id',
            views: {
              'menuContent': {
                templateUrl: 'templates/payment/show.html',
                controller: 'ShowPaymentCtrl'
              }
            }
          })



            .state('app.patients', {
                url: '/patients',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/patient/patients.html',
                        controller: 'PatientsCtrl'
                    }
                }
            })

            .state('app.new_patient', {
                url: '/patients/new',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/patient/new_patient.html',
                        controller: 'NewPatientCtrl'
                    }
                }
            })

            .state('app.edit_patient', {
                url: '/patients/:id',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/patient/edit_patient.html',
                        controller: 'EditPatientCtrl'
                    }
                }
            })

            .state('app.new_appointments', {
                url: '/appointments/new',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/new_appointment.html',
                        controller: 'NewAppointmentCtrl'
                    }
                }
            })

            .state('app.browse', {
                url: '/browse',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/browse.html'
                    }
                }
            })
            .state('app.playlists', {
                url: '/playlists',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/playlists.html',
                        controller: 'PlaylistsCtrl'
                    }
                }
            })

            .state('app.edit_appointments', {
                url: '/appointments/:id',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/edit_appointment.html',
                        controller: 'EditAppointmentCtrl'
                    }
                }
            })
            .state('app.missed_appointment', {
                url: '/appointments/missed/:id',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/missed_appointment.html',
                        controller: 'MissedAppointmentCtrl'
                    }
                }
            })
            .state('app.login', {
                url: '/login',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/login');
        $ionicConfigProvider.backButton.previousTitleText(false);
    });

//var apiHost = 'https://www.therapymate.com/';
//var apiHost = 'https://therapymate-staging.herokuapp.com/';
//var apiHost = 'https://therapymate.net/';
var apiHost = 'http://192.168.0.107:3000/';
