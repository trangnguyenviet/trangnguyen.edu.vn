var Payment;
$(function(){
	Payment = {
		control:{
			ddl_money: $('#ddl_money'),
			img_captcha: $('#img_captcha'),
			img_refresh: $('#img_refresh'),
			tb_captcha: $('#tb_captcha'),
			lb_message: $('#lb_message_payment'),
			bt_submit: $('#bt_submit')
		}
	};
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
		var money = control.ddl_money.val(),
		captcha = control.tb_captcha.val();
		money = parseInt(money);
		if(isNaN(money)){
			control.lb_message.show().text('Bạn hãy chọn thời gian ôn luyện');
			control.ddl_money.focus();
			return false;
		}
		if(captcha.length!=6){
			control.lb_message.show().text('Bạn hãy nhập mã xác nhận');
			control.tb_captcha.focus();
			return false;
		}
		$.ajax({
			url: window.location.href,
			dataType: "json",
			type: 'POST',
			data:{money:money,captcha:captcha},
			beforeSend: function( xhr ) {
				spinner.show();
				control.lb_message.show().text('đang thực hiện...');
				control.bt_submit.prop('disabled',true);
			},
			success:function(data){
				if(data.error==0){
					window.location.href = data.checkout_url;
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