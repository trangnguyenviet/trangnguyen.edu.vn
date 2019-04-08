var Payment;
$(function(){
	Payment = {
		control:{
			ddl_card_type: $('#ddl_card_type'),
			tb_card_number: $('#tb_card_number'),
			tb_card_serial: $('#tb_card_serial'),
			tb_expire_day: $('#tb_expire_day'),
			img_captcha: $('#img_captcha'),
			img_refresh: $('#img_refresh'),
			tb_captcha: $('#tb_captcha'),
			lb_message: $('#lb_message_payment'),
			bt_submit: $('#bt_submit')
		}
	};
	var card_infos={
		VT:{
			number_length: [13,14,15],
			serial_length: [11,12,13,14,15]
		},
		MOBI:{
			number_length: [12,14,15],
			serial_length: [15]
		},
		VINA:{
			number_length: [12,14],
			serial_length: [9,14]
		},
		VNM:{
			number_length: [12],
			serial_length: [11]
		},
		TNCARD:{
			number_length: [12],
			serial_length: [12]
		}
	};

	Payment.control.ddl_card_type.change(function(){
		var control = Payment.control;
		var card_type = control.ddl_card_type.val();
		var card_info = card_infos[card_type];
		if(card_info){
			control.tb_card_number.attr('placeholder','Mã thẻ gồm ' + card_info.number_length.toString() + ' chữ số');
			control.tb_card_serial.attr('placeholder','Mã số serial ' + card_info.serial_length.toString() + ' chữ số');
		}
		else{
			control.tb_card_number.attr('placeholder','Nhập mã thẻ nạp');
			control.tb_card_serial.attr('placeholder','Nhập số serial');
		}
	});

	Payment.control.tb_card_number.ForceNumericOnly();
	Payment.control.tb_card_serial.ForceNumericOnly();

	Payment.control.img_captcha.click(function(){
		change_captcha();
		Payment.control.tb_captcha.focus();
	});
	Payment.control.img_refresh.click(function(){
		change_captcha();
		Payment.control.tb_captcha.focus();
	});
	function change_captcha(){
		Payment.control.img_captcha.attr('src','/captcha.png?tn=' + Math.random());
		Payment.control.tb_captcha.val('');
	}

	Payment.control.bt_submit.click(function(){
		var control = Payment.control;
		var card_type = control.ddl_card_type.val(),
		card_number = control.tb_card_number.val(),
		card_serial = control.tb_card_serial.val(),
		captcha = control.tb_captcha.val();

		if(card_type==''){
			control.lb_message.show().text('Bạn hãy chọn loại thẻ');
			control.ddl_card_type.focus();
			return false;
		}

		if(card_number==''){
			control.lb_message.show().text('Bạn hãy nhập mã thẻ');
			control.tb_card_number.focus();
			return false;
		}

		if(card_serial==''){
			control.lb_message.show().text('Bạn hãy nhập số serial thẻ');
			control.tb_card_serial.focus();
			return false;
		}

		var card_info = card_infos[card_type];
		if(card_info){
			if(card_info.number_length.indexOf(card_number.length)<0){
				control.lb_message.show().text('Mã thẻ gồm ' + card_info.number_length.toString() + ' chữ số');
				control.tb_card_number.focus();
				return false;
			}
			if(card_info.serial_length.indexOf(card_serial.length)<0){
				control.lb_message.show().text('Mã số serial ' + card_info.serial_length.toString() + ' chữ số');
				control.tb_card_serial.focus();
				return false;
			}
		}
		else{
			control.lb_message.show().text('Thẻ này chưa được hỗ trợ');
			return false;
		}

		if(captcha.length!=6){
			control.lb_message.show().text('Bạn hãy nhập mã xác nhận');
			control.tb_captcha.focus();
			return false;
		}

		$.ajax({
			url: "/nop-hoc-phi/card",
			dataType: "json",
			type: 'POST',
			data:{card_type:card_type,card_number:card_number,card_serial:card_serial,captcha:captcha},
			beforeSend: function(xhr) {
				spinner.show();
				control.lb_message.show().text('đang thực hiện...');
				control.bt_submit.prop('disabled',true);
			},
			success:function(data){
				if(data.error==0){
					control.ddl_card_type.val('');
					control.tb_card_number.val('');
					control.tb_card_serial.val('');
					control.lb_message.show().text('Nộp học phí thành công!');
					control.tb_expire_day.val(data.vip_expire);
					TN_POPUP.show(data.message,'Thành công');
				}
				else{
					control.lb_message.show().text(data.message);
					TN_POPUP.show(data.message,'Thông báo');
				}
				control.bt_submit.prop('disabled',false);
			}
		})
		.always(function() {
			spinner.hide();
			change_captcha();
		});

		return false;
	});
});