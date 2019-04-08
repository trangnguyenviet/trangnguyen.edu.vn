var USER={};
$(function(){
	var $form_modal = $('.cd-user-modal'),
		$form_login = $form_modal.find('#cd-login'),
		$form_signup = $form_modal.find('#cd-signup'),
		$form_forgot_password = $form_modal.find('#cd-reset-password'),
		$form_modal_tab = $('.cd-switcher'),
		$tab_login = $form_modal_tab.children('li').eq(0).children('a'),
		$tab_signup = $form_modal_tab.children('li').eq(1).children('a'),
		$forgot_password_link = $form_login.find('.cd-form-bottom-message a'),
		$back_to_login_link = $form_forgot_password.find('.cd-form-bottom-message a'),
		$main_nav = $('.main-nav'),
		$add_like = $('.add-like');

	var tb_username = $('#signin-email');
	var tb_password = $('#signin-password');
	var lb_message = $('#lb_message_login');

	USER.show_modal = function(event){
		if($(event.target).is($main_nav)){
			// on mobile open the submenu
			$(this).children('ul').toggleClass('is-visible');
		} else {
			// on mobile close submenu
			$main_nav.children('ul').removeClass('is-visible');
			//show modal layer
			$form_modal.addClass('is-visible');
			//show the selected form
			($(event.target).is('.cd-signup')) ? signup_selected() : login_selected();

			tb_username.val('');
			tb_password.val('');
			lb_message.text('');
			setTimeout(function(){
				tb_username.focus();
			},200);
		}
		return false;
	};
	//open modal
	$main_nav.find('.btn-dn').click(function(event){
		return USER.show_modal(this);
	});

	$main_nav.find('.cd-signin').click(function(event){
		return USER.show_modal(this);
	});

	$add_like.click(function(event){
		if( $(event.target).is($add_like) ) {
			// on mobile open the submenu
			$(this).children('ul').toggleClass('is-visible');
		} else {
			// on mobile close submenu
			$add_like.children('ul').removeClass('is-visible');
			//show modal layer
			$form_modal.addClass('is-visible');
			//show the selected form
			$(event.target).is('.cd-signup') ? signup_selected() : login_selected();
		}
		return false;
	});

	//close modal
	$('.cd-user-modal').click(function(event){
		if( $(event.target).is($form_modal) || $(event.target).is('.cd-close-form') ) {
			$form_modal.removeClass('is-visible');
		}
		return false;
	});
	//close modal when clicking the esc keyboard button
	$(document).keyup(function(event){
		if(event.which=='27'){
			$form_modal.removeClass('is-visible');
		}
		return false;
	});

	//switch from a tab to another
	$form_modal_tab.click(function(event){
		event.preventDefault();
		( $(event.target).is( $tab_login ) ) ? login_selected() : signup_selected();
		return false;
	});

	//hide or show password
	$('.hide-password').click(function(){
		var $this= $(this),
			$password_field = $this.prev('input');
		('password' == $password_field.attr('type') ) ? $password_field.attr('type', 'text') : $password_field.attr('type', 'password');
		('Hide' == $this.text() ) ? $this.text('Show') : $this.text('Hide');
		//focus and move cursor to the end of input field
		$password_field.putCursorAtEnd();
		return false;
	});

	//show forgot-password form
	$forgot_password_link.click(function(event){
		event.preventDefault();
		forgot_password_selected();
		return false;
	});

	//back to login from the forgot-password form
	$back_to_login_link.click(function(event){
		event.preventDefault();
		login_selected();
		return false;
	});

	function login_selected(){
		$form_login.addClass('is-selected');
		$form_signup.removeClass('is-selected');
		$form_forgot_password.removeClass('is-selected');
		$tab_login.addClass('selected');
		$tab_signup.removeClass('selected');
	}

	function signup_selected(){
		$form_login.removeClass('is-selected');
		$form_signup.addClass('is-selected');
		$form_forgot_password.removeClass('is-selected');
		$tab_login.removeClass('selected');
		$tab_signup.addClass('selected');
	}

	function forgot_password_selected(){
		$form_login.removeClass('is-selected');
		$form_signup.removeClass('is-selected');
		$form_forgot_password.addClass('is-selected');
	}

	//REMOVE THIS - it's just to show error messages
	$form_login.find('input[type="submit"]').click(function(event){
		event.preventDefault();

		tb_username.next('span').removeClass('is-visible');
		tb_password.next('span').removeClass('is-visible');
		if(validate_login(tb_username,tb_password)){
			$.ajax({
				url: "/user/login",
				type: 'POST',
				dataType: "json",
				data:{
					username: tb_username.val(),
					password:tb_password.val(),
					position: typeof window.position === 'object'? JSON.stringify({accuracy: window.position.accuracy, latitude: window.position.latitude, longitude: window.position.longitude, speed: window.position.speed}): window.position
				},
				beforeSend: function(xhr){
					lb_message.text('Đang kiểm tra thông tin...');
					spinner.show();
				},
				success:function(data){
					if(data.error===0){
						lb_message.text('Đăng nhập thành công');
						var user = data.user;
						if(user){
							window.is_login=true;
							if(window.Raven) Raven.setUserContext({id: user._id, class_id: user.class_id});
							var user_info = $('#user_info');
							user_info.html('');
							$('#user-info').html('<ul class="navuserled"> <li>ID: '+user._id+' |</li> <li>Lớp: '+user.class_id+' |</li> <li class="dropdown"><a href="/tai-khoan" class="dropdown-toggle" data-toggle="dropdown"> <strong>'+user.name+'</strong></a> <ul class="dropdown-menu"><li><a href="/tai-khoan"><i class="fa fa-user"></i> Tài khoản</a></li><li><a href="/user/logout"><i class="fa fa-sign-out"></i> Thoát</a></li> </ul> </li> </ul>');
							$('.box-support').after('<div class="fb-page" data-href="https://www.facebook.com/trangnguyen.edu.vn/" data-small-header="true" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="true"><blockquote cite="https://www.facebook.com/trangnguyen.edu.vn/" class="fb-xfbml-parse-ignore"><a href="https://www.facebook.com/trangnguyen.edu.vn/"></a></blockquote></div>');
							logout_event();
							$('.col-mobile').html('<ul class="navuser"> <li class="dropdown"><a href="/tai-khoan" class="dropdown-toggle" data-toggle="dropdown"><img src="/avatar/'+user._id+'" alt=""/> xin chào:<strong>' + user.name + '</strong></a> <ul class="dropdown-menu"> <li><a href="/tai-khoan"><i class="fa fa-user"></i> Thông tin tài khoản</a></li> <li><a href="/tai-khoan/doi-mat-khau"><i class="fa fa-key"></i> Đổi mật khẩu</a></li> <li><a href="/user/logout"><i class="fa fa-sign-out"></i> Thoát</a></li> </ul></li> </ul>')
							setTimeout(function(){
								$form_modal.removeClass('is-visible');
								// if(data.is_event_16){
								// 	TN_POPUP.show("Vui tết thiếu nhi<br/> bạn đã được tặng 16 ngày ôn luyện","Tết thiếu nhi");
								// }
								if(window.next_url) window.location.href = window.next_url;
							},1000);
						}
						else{
							lb_message.text('không có dữ liệu tài khoản');
						}
					}
					else{
						lb_message.text(data.message);
					}
				}
			})
			.always(function(){
				spinner.hide();
			});
		}
		return false;
	});

	function validate_login(tb_username,tb_password){
		var username = tb_username.val();
		var password = tb_password.val();
		if(username==''){
			tb_username.addClass('has-error').next('span').text('Hãy nhập tên đăng nhập').addClass('is-visible');
			return false;
		}
		else{
			if(username.length<6 || username.length>20){
				tb_username.addClass('has-error').next('span').text('Tên đăng nhập phải từ 6 đền 20 ký tự').addClass('is-visible');
				return false;
			}
			else if(!util.isUsername(username)){
				tb_username.addClass('has-error').next('span').text('Tên đăng nhập không được chứa ký tự đặc biệt và bắt đầu là chữ').addClass('is-visible');
				return false;
			}
		}
		if(password==''){
			tb_password.addClass('has-error').next().next('span').text('Hãy nhập mật khẩu').addClass('is-visible');
			return false;
		}
		else{
			if(password.length<6 || password.length>30){
				tb_password.addClass('has-error').next().next('span').text('Mật khẩu phải từ 6 đến 30 ký tự').addClass('is-visible');
				return false;
			}
		}
		return true;
	}
});

//credits http://css-tricks.com/snippets/jquery/move-cursor-to-end-of-textarea-or-input/
jQuery.fn.putCursorAtEnd = function() {
	return this.each(function() {
		// If this function exists...
		if (this.setSelectionRange) {
			// ... then use it (Doesn't work in IE)
			// Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
			var len = $(this).val().length * 2;
			this.setSelectionRange(len, len);
		} else {
			// ... otherwise replace the contents with itself
			// (Doesn't work in Google Chrome)
			$(this).val($(this).val());
		}
	});
};