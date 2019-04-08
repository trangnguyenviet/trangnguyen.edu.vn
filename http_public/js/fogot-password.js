$(function(){
	var tb_username = $('#tb_username');
	var img_captcha = $('#img_captcha');
	var tb_captcha = $('#tb_captcha');
	var lb_message = $('#lb_message');
	var bt_save = $('#bt_save');

	img_captcha.click(function(){
		return reload_captcha();
	});
	
	function reload_captcha(){
		img_captcha.attr('src','/captcha.png?tn=' + Math.random());
		tb_captcha.val('');
		return false;
	}

	bt_save.click(function(){
		var username = tb_username.val();
		var captcha = tb_captcha.val();
		var msg = validate(username,captcha);
		if(msg!=''){
			lb_message.html(msg);
		}
		else{
			$.ajax({
				url: "/user/fogot",
				type: 'POST',
				dataType: "json",
				data:{username:username,captcha:captcha},
				beforeSend: function( xhr ) {
					lb_message.show().text('Đăng thực hiện...');
					spinner.show();
					bt_save.attr('disabled','disabled');
				},
				success:function(data){
					if(data.error==0){
						tb_username.val('');
						TN_POPUP.show('Thông tin cấp lại mật khẫu được gửi vào email: ' + data.email);
					}
					else{
						TN_POPUP.show(data.message);
					}
				}
			})
			.always(function() {
				reload_captcha();
				spinner.hide();
				bt_save.removeAttr('disabled');
				lb_message.text('');
			});
		}
		return false;
	});

	function validate(username,captcha){
		var msg = '';
		if(username==''){
			msg = 'Hãy nhập tên đăng nhập';
		}
		else if(username.length<6 || username.length>20){
			msg = 'Tên đăng nhập phải &ge; 6 và &le; 20 ký tự và bắt đầu là chữ';
		}
		else if(!util.isUsername(username)){
			msg = 'Tên đăng nhập không được chứa ký tự đặc biệt';
		}
		if(captcha==''){
			if(msg!='') msg +='<br/>';
			msg += 'Hãy nhập mã xác nhận';
		}
		else if(captcha.length!=6){
			if(msg!='') msg +='<br/>';
			msg += 'Mã xác nhận phải có 6 ký tự';
		}
		return msg;
	}
});