angular.element(document).ready(function(){
  if($('#payment_patient_payment_method_id option').length > 2){
    first_card = $('#payment_patient_payment_method_id option')[2].value;
    $('#payment_patient_payment_method_id').val(first_card);
    $('#payment_patient_payment_method_id').trigger('chosen:updated');
  }
  $('.submit_payment_button').on('click', function(e){
  	if($('#payment_payment_class_id').val() == "" && $('#payment_type').val() == ""){
  		e.preventDefault();
  		$('.error_required').show();
  	} else if($('#payment_payment_class_id').val() == ""){
  		e.preventDefault();
  		$('.error_type').hide();
  		$('.error_class').show();
  	} else if($('#payment_type').val() == ""){
  		e.preventDefault();
  		$('.error_class').hide();
  		$('.error_type').show();
  	} else {
	  	showLoadingBar();
	    if ($('#payment_type option:selected').text() === 'Credit Card' && $('#clinician_stripe_publishable_key').val().length > 0 && $('.patient_payment_method:checked').val() == 'new_card'){
	    	e.preventDefault();

        var $form = $('#new_payment');
        var extraDetails = {
          name: $form.find('#payment_patient_payment_method_cardholder_name').val(),
          address_line1: $form.find('#payment_patient_payment_method_address_line1').val(),
          address_line2: $form.find('#payment_patient_payment_method_address_line2').val(),
          address_city: $form.find('#payment_patient_payment_method_address_city').val(),
          address_state: $form.find('#payment_patient_payment_method_address_state').val(),
          address_zip: $form.find('#payment_patient_payment_method_address_zip').val(),
        };

        stripe.createToken(card, extraDetails).then(function(result) {
          if (result.error) {
            $('.loading_bar').fadeOut('fast', function(){
              $('.submit_payment_button').fadeIn();
            });
            $('.submit_payment_button').prop('disabled', false);

            $form.find('#card_error').text(result.error.message).show();
          } else {
            var token = result.token;
            $("#payment_stripe_card_token").val(token.id);
            $form.get(0).submit();
          }
        });

	    } else {
	    	var $form = $('#new_payment');
        $form.append($("<input type='hidden' />").attr("name", $(this)[0].name).attr("value", $(this)[0].value))
        $form.get(0).submit();
	    }
	  }
  });

  updateInvoiceAmount();
  $('#use_credit').on('click', function(){
    updateInvoiceAmount();
  });

  updatePaymentType();

  stripeResponseHandler = function(status, response){
	  var $form = $('#new_payment');

	  if (response.error) {
	    this.showSubmitButton();
	    $form.find('.payment-errors').text(response.error.message);
	  } else {
	    var token = response.id;
	    $("#payment_stripe_card_token").val(token);
	    $form.get(0).submit();
	  }
	};

	showLoadingBar = function(){
		$('.submit_payment_button').prop('disabled', true);
    $('.submit_payment_button').hide();
    $('.loading_bar').show();
  };

  showSubmitButton = function(){
    $('.loading_bar').fadeOut('fast', function(){
      $('.submit_payment_button').fadeIn();
    });
    $('.submit_payment_button').prop('disabled', false);
  };

});

function updatePaymentType(){
	value = $("#payment_type option:selected").html();
  toggleUnallocatedCredit(false);
	if(value == "Check" || value == "Cash"){
		$("#payment_number").show();
	} else {
		$("#payment_number").hide();
	}
  if(value == "Credit Card"){
    if($("#show_stripe").val() == "true") {
      $('#pref_credit_card').hide();
      $("#payment_number").hide();
      $('#card_fields').show();
    }
  else {
      $('#pref_credit_card').show();
      $("#payment_number").show();
      $('#card_fields').hide();
    }
    updatePaymentMethod();
  }
}

function updatePaymentMethod(){
  value = $(".patient_payment_method:checked").val();
  if(value == "new_card"){
    $("#new_credit_card").show();
  } else {
    $("#new_credit_card").hide();
  }
}

function checkDecimal(value, element){
  var ex = new RegExp(/^[0-9]+(\.[0-9]{1,2})?$/);
  if(typeof value === 'undefined'){value = 0}
  if(ex.test(value)==false){
    if(!(value.split('.').length == 2 && value.indexOf('.') == value.length-1)){
      value = value.substring(0,value.length - 1);
      if(value == 0){
        $(element).val("");
      } else {
      	$(element).val(value);
      }
    }
  }
}

function amountWatcher(){
  var useCredit = $('div.checkbox-input-hidden input[type="checkbox"]').prop('checked')
  if(useCredit){
    var invoices_total = parseFloat($('#payment_amount').val() || 0) + parseFloat($('#credit').val() || 0);
  } else {
    var invoices_total = $('#payment_amount').val();
  }

  $('.event_amount').each(function(index){
      current_amount = parseFloat($(this).parent().prev().find('.pat_bal').text().replace("$", ""));
      if(invoices_total <= current_amount){
      	if(invoices_total == 0) {
      		$(this).val("");
      	} else {
        	$(this).val(invoices_total);
       	}
      } else {
        $(this).val(current_amount);
      }
      invoices_total = (Math.round((parseFloat(invoices_total) - parseFloat(this.value)) * 100)/100) || 0;
  });
  updateCreditRow(invoices_total);
}

function updateCreditRow(credit){
  if (credit > 0){
    $('#credit_row').show();
    $('#remaining_credit').text(accounting.formatMoney(credit));
  } else {
    $('#credit_row').hide();
  }
}

function invoiceWatcher(){
  var useCredit = $('div.checkbox-input-hidden input[type="checkbox"]').prop('checked')
  var invoices_total = 0;
  if(useCredit){ invoices_total -= parseFloat($('#credit').val() || 0); }
  $('.event_amount').each(function(index){
    checkDecimal($(this).val(), this);
    if(this.name == "payment[credit]"){
      invoices_total += (Math.round(parseFloat($(this).val()) * 100)/100) || 0;
    } else {
    	input_amount = Math.round(parseFloat($(this).val()) * 100)/100;
    	current_amount = Math.round(parseFloat($(this).parent().prev().find('.pat_bal').text().replace("$", "").replace(",", "")) * 100)/100;
    	if(input_amount > current_amount){
        $(this).val(current_amount);
        input_amount = current_amount;
      }
      invoices_total += (Math.round(parseFloat(input_amount) * 100)/100) || 0;
    }
  });
  checkDecimal($("[name='payment[credit]']").val(), $("[name='payment[credit]']"));
  credit = (Math.round((parseFloat($("[name='payment[credit]']").val())) * 100) / 100) || 0;
  $("[name='payment[credit]']").val(credit);
  $("[name='payment[credit]']").parent().prev().text("$"+credit);
  invoices_total = Math.round(invoices_total * 100) / 100;
  $('#payment_amount').val(invoices_total);
  updateCreditRow(0);
}

function toggleUnallocatedCredit(show){
  if($('#payment_amount').val() == "" && show == true){
    $.each($('#payment_type > option:contains(Credit)'), function(i, o){
      if (o.text == "Credit"){
        $(o).prop('selected', true).show();
      }
    });
    $('#payment_type').trigger("chosen:updated");
    $('#payment_amount').parents('.form-group').hide();
    $('#payment_prompt').show();
  } else {
    $('#payment_amount').parents('.form-group').show();
    $.each($('#payment_type > option:contains(Credit)'), function(i, o){
      if ($(o).text == "Credit"){
        $(o).hide();
      }
    });
    $('#payment_type').trigger("chosen:updated");
    $('#payment_prompt').hide();
  }
}

function updateInvoiceAmount(){
  useCredit = $('#use_credit').is(':checked');
  $("#payment_type").find("option[label='Credit']").attr("selected","selected")
  toggleUnallocatedCredit(useCredit);
  amountWatcher(useCredit);
  $('#payment_amount').unbind().on('keyup', function(){
    var value = $(this).val();
    checkDecimal(value, this);
    amountWatcher(useCredit);
  });
  $('.event_amount').unbind().on('keyup', function(e){
    if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 16) return;
    var value = $(this).val();
    if(value >= 0){
      checkDecimal(value, this);
    }
    invoiceWatcher(useCredit);
  });
}
