$(function(){
	var tb_fullname = $('#tb_fullname');
	var tb_username = $('#tb_username');
	var tb_password = $('#tb_password');
	var tb_repassword = $('#tb_repassword');
	// var tb_email = $('#tb_email');
	// var tb_mobile = $('#tb_mobile');
	var ddl_province = $('#ddl_province');
	var ddl_district = $('#ddl_district');
	var ddl_school = $('#ddl_school');
	var ddl_class = $('#ddl_class');
	var tb_class_name = $('#tb_class_name');
	var tb_birthday = $('#tb_birthday');
	var img_captcha = $('#img_captcha');
	var tb_captcha = $('#tb_captcha');
	var lb_message = $('#lb_message_register');
	var bt_save = $('#bt_save');

	// tb_mobile.ForceNumericOnly();

	tb_fullname.focus();

	tb_birthday.datepicker({dateFormat: "dd/mm/yy"});

	img_captcha.click(function(){
		return reload_captcha();
	});

	function reload_captcha(){
		img_captcha.attr('src','/captcha.png?tn=' + Math.random());
		tb_captcha.val('');
		return false;
	}

	var tLoaddistrict, tLoadSchool;

	ddl_province.change(function(){
		var province_id = parseInt($(this).val());
		if(tLoaddistrict) clearTimeout(tLoaddistrict);
		tLoaddistrict = setTimeout(function(){
			ddl_district.prop('disabled',true).html('<option value="0">Chọn quận/huyện</option>');
			ddl_school.prop('disabled',true).html('<option value="0">Chọn trường</option>');
			if(province_id>0){
				$.ajax({
					url: "/district/api/list/" + province_id,
					dataType: "json",
					//data:{action:'list',id:province_id},
					beforeSend: function( xhr ) {
						spinner.show();
					},
					success:function(data){
						if(data.error===0){
							if(data.content){
								var html='';
								$.each(data.content,function(i,val){
									html+='<option value="' + val._id + '">' + val.name + '</option>'
								});
								ddl_district.append(html);
								ddl_district.prop('disabled', false);
							}
						}
						else{
							ShowMessError(data.message);
						}
					}
				});
			}
		},1000);
	});

	ddl_district.change(function(){
		var district_id = parseInt($(this).val());
		if(tLoadSchool) clearTimeout(tLoadSchool);
		tLoadSchool = setTimeout(function(){
			ddl_school.attr('disabled','disabled').html('<option value="0">Chọn trường</option>');
			if(district_id>0){
				$.ajax({
					url: "/school/api/list/" + district_id,
					dataType: "json",
					//data:{action:'list',id:province_id},
					beforeSend: function( xhr ) {
						spinner.show();
					},
					success:function(data){
						if(data.error==0){
							if(data.content){
								var html='';
								$.each(data.content,function(i,val){
									html+='<option value="' + val._id + '">' + val.name + '</option>'
								});
								ddl_school.append(html);
								ddl_school.prop('disabled', false);
							}
						}
						else{
							ShowMessError(data.message);
						}
					}
				});
			}
		},1000);
	});

	//function validate(fullname,username,password,repassword,email,mobile,province_id,district_id,school_id,class_id,class_name,birthday,captcha){
	function validate(fullname,username,password,repassword,province_id,district_id,school_id,class_id,class_name,birthday,captcha){
		var msg = '';
		//fullname
		if(fullname==''){
			msg = 'Hãy nhập họ tên';
			// tb_fullname.addClass('has-error').next('span').text('Hãy nhập họ tên').addClass('is-visible');
		}
		else if(fullname.length<3 && fullname.length>30){
			if(msg!='') msg +='<br/>';
			msg += 'Họ tên không đúng, phải dài từ 3 đến 30 ký tự';
		}
		else if(!util.isNameVi(fullname)){
			if(msg!='') msg +='<br/>';
			msg += 'Họ tên không đúng, không có ký tự đặc biệt và số';
		}
		//username
		if(username==''){
			if(msg!='') msg +='<br/>';
			msg += 'Hãy nhập tên đăng nhập';
		}
		else if(username.length<6 || username.length>20){
			if(msg!='') msg +='<br/>';
			msg += 'Tên đăng nhập phải &ge; 6 và &le; 20 ký tự và bắt đầu là chữ';
		}
		else if(!util.isUsername(username)){
			if(msg!='') msg +='<br/>';
			msg += 'Tên đăng nhập không được chứa ký tự đặc biệt';
		}

		//pasword
		if(password==''){
			if(msg!='') msg +='<br/>';
			msg += 'Hãy nhập mật khẩu';
		}
		else if(password.length<6 || password.length>30){
			if(msg!='') msg +='<br/>';
			msg += 'Mật khẩu phải từ 6 đến 30 ký tự';
		}
		if(repassword==''){
			if(msg!='') msg +='<br/>';
			msg += 'Hãy nhập lại mật khẩu';
		}
		else if(repassword!=password){
			if(msg!='') msg +='<br/>';
			msg += 'Mật khẩu không trùng khớp';
		}
		// //email
		// if(email==''){
		// 	if(msg!='') msg +='<br/>';
		// 	msg += 'Hãy nhập địa chỉ email';
		// }
		// else if(!util.isEmail(email)){
		// 	if(msg!='') msg +='<br/>';
		// 	msg += 'Định dạng email không đúng';
		// }
		// //mobile
		// if(mobile!=''){
		// 	if(!util.isPhoneNumber(mobile)){
		// 		if(msg!='') msg +='<br/>';
		// 		msg += 'Điện thoại liên hệ hãy nhập số di động';
		// 	}
		// }
		//province
		if(parseInt(province_id)<=0){
			if(msg!='') msg +='<br/>';
			msg += 'Hãy chọn tỉnh/thành phố';
		}
		//district
		if(parseInt(district_id)<=0){
			if(msg!='') msg +='<br/>';
			msg += 'Hãy chọn quận/huyện';
		}
		//school
		if(parseInt(school_id)<=0){
			if(msg!='') msg +='<br/>';
			msg += 'Hãy chọn trường';
		}
		//class
		class_id = parseInt(class_id);
		if(class_id<=0 || class_id >5){
			if(msg!='') msg +='<br/>';
			msg += 'Hãy chọn lớp/khối';
		}
		//birthday
		if(birthday==''){
			if(msg!='') msg +='<br/>';
			msg += 'Hãy chọn ngày sinh';
		}
		else if(!util.isValidDate(birthday)){
			if(msg!='') msg +='<br/>';
			msg += 'Định dạng ngày tháng không đúng';
		}
		//captcha
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

	bt_save.click(function(){
		var fullname = tb_fullname.val();
		var username = tb_username.val();
		var password = tb_password.val();
		var repassword = tb_repassword.val();
		// var email = tb_email.val();
		// var mobile = tb_mobile.val();
		var province_id = ddl_province.val();
		var district_id = ddl_district.val();
		var school_id = ddl_school.val();
		var class_id = ddl_class.val();
		var class_name = tb_class_name.val();
		var birthday = tb_birthday.val();
		var captcha = tb_captcha.val();

		if(!$('#cb_accept').prop('checked')) {
			lb_message.show().text('Vui lòng kiểm tra lại điều khoản');
			return false;
		}

		var msg = validate(fullname,username,password,repassword,province_id,district_id,school_id,class_id,class_name,birthday,captcha);
		if(msg !== '') {
			lb_message.html(msg);
		} else {
			$.ajax({
				url: "/user/register",
				type: 'POST',
				dataType: "json",
				data:{
					fullname: fullname,
					username: username,
					password: password,
					repassword: repassword,
					province_id: province_id,
					district_id: district_id,
					school_id: school_id,
					class_id: class_id,
					class_name: class_name,
					birthday: birthday,
					captcha: captcha,
					position: typeof window.position === 'object'? JSON.stringify({accuracy: window.position.accuracy, latitude: window.position.latitude, longitude: window.position.longitude, speed: window.position.speed}): window.position
				},
				beforeSend: function( xhr ) {
					lb_message.show().text('Đăng thực hiện...');
					spinner.show();
					bt_save.prop('disabled',true);
				},
				success:function(data){
					if(data.error==0){
						var bottons = [
							{
								caption:'Trang chủ',
								callback:function(){
									window.location.href = '/';
								}//,
								//auto_callback: 5000
							}
						];
						TN_POPUP.show('Tạo tài khoản thành công<br/>Hãy quay về trang chủ để đăng nhập và tiếp tục',null,470,215,bottons,null,false);
					}
					else{
						TN_POPUP.show(data.message);
						lb_message.show().text(data.message);
					}
				}
			})
			.always(function() {
				reload_captcha();
				spinner.hide();
				bt_save.prop('disabled', false);
			});
		}
		return false;
	});
});