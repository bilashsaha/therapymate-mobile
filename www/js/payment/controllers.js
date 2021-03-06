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
        $scope.showCredit = false;
        $scope.unpaidInvoices = []
        $scope.payment.payment.clinician_id = $scope.access.clinician_id;
        $scope.payment.payment.currency = 'usd';
        $scope.payment.payment.preferred_credit_card = 'Visa';
        $scope.patientPaymentMethods = [];
        $scope.cardTypes = [];
        $scope.patient_new_payment_method = {"patient_new_payment_method":{}}

        var style = {
          base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '15px',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        };

        if ($scope.access.stripe_publishable_api_key) {
          console.log($scope.access.stripe_publishable_api_key)
          $scope.stripe = Stripe($scope.access.stripe_publishable_api_key);
          var elements = $scope.stripe.elements();
          $scope.card = elements.create('card', {style: style});
        }

        $ionicLoading.show();
        $http.get(apiHost + "api/app/payments/new.json?"+$scope.query_access).then(function (response) {
                $scope.newPaymentSetting = response.data;
                if($scope.stripe) {
                  $scope.card.mount('#new_card');
                }
                $ionicLoading.hide()
            },
            function (err) {
                $ionicLoading.hide()
                $scope.errorMessageDialog(err);
            }
        );

        $scope.createPayment = function () {

          if ($scope.checkPaymentErrors($scope.payment.payment)) {
            return false;
          }

          var hasError = false
          $ionicLoading.show();


          var payment_invoice_events = []
          $(".event_amount").each(function(){
            if (Number($(this).val()) > 0 ) {
              payment_invoice_events.push({invoice_id:$(this).attr('invoice_id'),amount:$(this).val()})
            }
          })
          $scope.payment.payment.payment_invoice_events = payment_invoice_events
          if($scope.payment.payment.use_credit){
            $scope.payment.payment.credit = $scope.selectedPatient.credits;
          }

          if ($('#payment_type option:selected').text() == "Credit Card" && $scope.newPaymentSetting.show_stripe) {
            if($('.patient_payment_method:checked').val() == 'new_card') {
              var $form = $('#new_payment');
              var extraDetails = {
                name: $form.find('#payment_patient_payment_method_cardholder_name').val(),
                address_line1: $form.find('#payment_patient_payment_method_address_line1').val(),
                address_line2: $form.find('#payment_patient_payment_method_address_line2').val(),
                address_city: $form.find('#payment_patient_payment_method_address_city').val(),
                address_state: $form.find('#payment_patient_payment_method_address_state').val(),
                address_zip: $form.find('#payment_patient_payment_method_address_zip').val(),
              };

              $scope.stripe.createToken($scope.card, extraDetails).then(function(result) {
                if (result.error) {
                  hasError = true
                  alert(result.error.message)
                } else {
                  var token = result.token;
                  $scope.payment.payment.stripe_card_token = token.id
                  $scope.processPayment();
                }
              });
            } else {
              $scope.payment.payment.patient_payment_method_id = $('.patient_payment_method:checked').val()
              $scope.processPayment();
            }
            if(hasError){
              alert("An error occured processing your card!")
              return false
            }
          } else {
            $scope.processPayment();
          }
        };


      $scope.processPayment = function() {
        json = {"payment": $scope.payment.payment, "patient_new_payment_method": $scope.patient_new_payment_method.patient_new_payment_method}
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
      }




        $scope.selectedBillingType = function(){
            $scope.isInsuranceShowbale = event.target.options[event.target.selectedIndex].text == 'Insurance'
            $scope.isCashShowbale = event.target.options[event.target.selectedIndex].text == 'Private Pay'
        };


      $scope.patientChanged = function(selectedPatientId){
        $ionicLoading.show();
        $http.get(apiHost+"api/app/invoices.json?"+$scope.query_access+"&patient_unpaid=true&patient_id="+selectedPatientId).then(function (response) {
            $scope.unpaidInvoices = response.data.invoices;
            $scope.selectedPatient = response.data.patient;
            $scope.patientPaymentMethods = response.data.patient_payment_methods;
            $scope.cardTypes = response.data.card_types;
            for (var i = 0; i < $scope.unpaidInvoices.length; i++) {
              $scope.unpaidInvoices[i].invoice_date = moment($scope.unpaidInvoices[i].invoice_date).format("MM/DD/YYYY");
              $scope.unpaidInvoices[i].amount = Math.abs($scope.unpaidInvoices[i].pt_balance || $scope.unpaidInvoices[i].ins_balance)
            }
            $scope.showCredit = $scope.selectedPatient.credits > 0
            $ionicLoading.hide();
          },
          function(err) {
            $ionicLoading.hide();
            $scope.errorMessageDialog(err);
          }
        );
      };

      $scope.amountChanged = function(changedAmount) {
        amountWatcher(false);
      };

      $scope.invoiceAmountChanged = function(changedAmount) {
        invoiceWatcher(false);
      };

      $scope.checkPaymentErrors = function(payment) {
        $scope.errorMessages = []
        if(payment.patient_id == null) {
          $scope.errorMessages.push("Must Select a Client")
        }
        if(payment.payment_date == null) {
          $scope.errorMessages.push("Date can not be blank")
        }
        if(payment.payment_type_id == null) {
          $scope.errorMessages.push("Must Select a Type")
        }
        if(payment.payment_class_id == null) {
          $scope.errorMessages.push("Must Select a Class")
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

      $scope.goToPayments = function () {
        $window.location.href = "#/app/payments";
        $window.location.reload();
      }

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
