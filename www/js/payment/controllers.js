angular.module('payment.controllers', [])
    .controller('PaymentsCtrl', function ($scope, $http, $location, $state, $window, $httpParamSerializerJQLike, $ionicLoading) {
        var access = JSON.parse(localStorage.getItem('access'));
        $ionicLoading.show()
        $http.get(apiHost + "api/app/payments.json?date=" + $scope.date + "&token=" + access.token + "&email=" + access.email).then(function (response) {
                $scope.payments = response.data.payments;
                $ionicLoading.hide();
                setInterval(function(){
                    if ($(".filter-table").length == 0 ) {
                        $("table#payment_list").filterTable({label: '', placeholder: 'Search..', ignoreClass: 'payment_header'});
                    }
                }, 200)
            },
            function (err) {
                $ionicLoading.hide();
                console.log(err);
                $state.go('app.login');
            }
        );
        $scope.doRefresh = function(){
            $window.location.href = "#/app/payments";
            $window.location.reload();
        }
        $scope.$on('$viewContentLoaded', function(){
            $('table#payment_list').filterTable();
        });
    })

    .controller('NewPaymentCtrl', function ($scope, $http, $location, $state, $window, $httpParamSerializerJQLike,$ionicLoading,$ionicPopup) {
        $scope.payment = {"payment": {}};
        $scope.selectedPatient = { "credits": 0}
        $scope.unpaidInvoices = []
        $scope.payment.payment.clinician_id = $scope.access.clinician_id;
        $scope.payment.payment.currency = 'usd';
        $scope.payment.payment.preferred_credit_card = 'Visa';

        $ionicLoading.show();
        $http.get(apiHost + "api/app/payments/new.json?"+$scope.query_access).then(function (response) {
                $scope.newPaymentSetting = response.data;
                $ionicLoading.hide()
            },
            function (err) {
                $ionicLoading.hide()
                $scope.errorMessageDialog(err);
            }
        );

        $scope.createPayment = function () {

          console.log($scope.payment.payment)

          return false;

            $scope.payment.payment.mobilephone = angular.element(document.getElementById('mobile_phone')).val();
            $scope.payment.payment.homephone = angular.element(document.getElementById('home_phone')).val();
            $scope.payment.payment.date_of_birth = angular.element(document.getElementById('dob')).val();
            if ($scope.payment.payment.date_of_birth == null || $scope.payment.payment.date_of_birth == "" || moment($scope.payment.payment.date_of_birth)._d == "Invalid Date"){
                $ionicPopup.alert({
                    title: 'Error',
                    template: "<center><strong>DOB is invalid</strong></center>"
                });
                return false;
            }

            json = {"payment": $scope.payment.payment, "provider": $scope.provider.provider, "billing_setting": $scope.billing_setting}
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: apiHost + 'api/app/payments.json?'+$scope.query_access,
                data: $httpParamSerializerJQLike(json),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(
                function (res) {
                    if (res.data) {
                        $ionicLoading.hide();
                        $window.location.href = "#/app/payments";
                        $window.location.reload();
                    }
                }
            ).catch(function(res){
                    $ionicLoading.hide();
                    $scope.errorMessageDialog(res)
                })

        };
        $scope.selectedBillingType = function(){
            $scope.isInsuranceShowbale = event.target.options[event.target.selectedIndex].text == 'Insurance'
            $scope.isCashShowbale = event.target.options[event.target.selectedIndex].text == 'Private Pay'
        };

      $scope.patientChanged = function(selectedPatientId){
        $ionicLoading.show();
        $http.get(apiHost+"api/app/invoices.json?"+$scope.query_access+"&patient_unpaid=true&patient_id="+selectedPatientId).then(function (response) {
            $scope.unpaidInvoices = response.data.invoices;
            $scope.selectedPatient = response.data.patient;



            for (var i = 0; i < $scope.unpaidInvoices.length; i++) {
              $scope.unpaidInvoices[i].invoice_date = moment($scope.unpaidInvoices[i].invoice_date).format("MM/DD/YYYY");
              $scope.unpaidInvoices[i].amount = Math.abs($scope.unpaidInvoices[i].pt_balance || $scope.unpaidInvoices[i].ins_balance)
            }

            $ionicLoading.hide();
          },
          function(err) {
            $ionicLoading.hide();
            $scope.errorMessageDialog(err);
          }
        );
      };

      $scope.amountChanged = function(changedAmount) {
        console.log(changedAmount);
        console.log($('body').length);
      };



    })

    .controller('ShowPaymentCtrl', function ($scope, $http, $location, $state, $window, $httpParamSerializerJQLike, $stateParams, $ionicLoading, $ionicPopup) {
        var access = JSON.parse(localStorage.getItem('access'));
        $ionicLoading.show();
        $http.get(apiHost + "api/app/payments/" + $stateParams.id + ".json?"+$scope.query_access).then(function (response) {
                $scope.newPaymentSetting = response.data;
                response.data.payment.payment_date = moment(response.data.payment.payment_date).format("MM/DD/YYYY")
                for (var i = 0; i < response.data.payment.invoices.length; i++) {
                  response.data.payment.invoices[i].service_date = moment(response.data.payment.invoices[i].service_date).format("MM/DD/YYYY")
                }

                $scope.payment = {"payment": response.data.payment};
                $ionicLoading.hide();
            },
            function (err) {
                $ionicLoading.hide();
                $scope.errorMessageDialog(err);
            }
        );

        $scope.makeEditable = function(){
            $scope.editable = true;
        };
    });
