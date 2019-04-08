var spinner;
$(function(){
	spinner = $('#spinner');

	$('a.tn-late-visit').click(function(){
		TN_POPUP.show('Chuyên mục này đang được phát triển<br/>Bạn hãy ghé thăm vào 20/11<br/>-=Xin cảm ơn=-','Xin lỗi');
		return false;
	});

	$('a.must-login').click(function(){
		var a = $(this);
		if(!window.is_login){
			var buttons = [
				{
					caption:'Đăng nhập',
					callback:function(){
						window.next_url = a.attr('href');
						$('.cd-signin').trigger('click');
					},
				},{
					caption:'Bỏ qua',
					callback: function(){
						window.next_url = undefined;
					}
				}
			];
			TN_POPUP.show('Bạn cần phải đăng nhập<br/>trước khi thực hiện thao tác này',null,null,null,buttons);
			return false;
		}
	});

	$('a.exam-not-enable').click(function(){
		var selt = $(this);
		var score = selt.attr('score');
		if(score==''){
			TN_POPUP.show('Bạn chưa qua bài trước');
		}
		else{
			TN_POPUP.show('Bạn đã thi bài này với số điểm: ' + score);
		}
		return false;
	});

	$('a.round-not-open').click(function(){
		TN_POPUP.show('Vòng này chưa được mở');
		return false;
	});

	$('.num-format').each(function(){
		var span = $(this);
		var val = parseInt(span.text());
		val = util.formatNum(val);
		span.text(val);
	});

	logout_event();
	for (var it in $.cookie()) $.removeCookie(it);
});

function logout_event(){
	$('a.confirm-logout').click(function(){
		Confirm("Bạn có muốn thoát không?","Xác nhận",function(result){
			if(result){
				window.location.href='/user/logout';
			}
		});
		return false;
	});
}

$.ajaxSetup({
	//url: '/ajax',
	type: 'GET',
	//cache: true,//false
	timeout: 30000,
	//async: true,
	//dataType: 'json',
	//data: {param1: 'value1'},
	beforeSend: function(xhr){
		xhr.setRequestHeader('x-position', typeof window.position === 'object'? JSON.stringify({accuracy: window.position.accuracy, latitude: window.position.latitude, longitude: window.position.longitude, speed: window.position.speed}): window.position);
		if(spinner) spinner.show();
	},
	statusCode:{
		200:function(){
			//console.log(200);
		},
		404:function(){
			//console.log(404);
		},
		500:function(){
			//console.log(500);
		}
	},
	error:function(xhr,status,error){
		console.log(xhr,status,error);
		ShowMessError(error);
	},
	success:function(result,status,xhr){
		//console.log(result,status,xhr);
	},
	complete: function(xhr,status){
		if(spinner) spinner.hide();
	}
});

function ShowMessError(s){
	var toast = $('.div_msg_error');
	if(s=='') $('.div_msg_error .content').text('Timeout');
	else $('.div_msg_error .content').text(s);
	toast.fadeIn("slow");

	var t = setTime();

	toast.mouseover(function(){
		if(t) clearTimeout(t);
	});

	toast.mouseout(function(){
		t = setTime();
	});

	function setTime(){
		return setTimeout(function(){
			toast.fadeOut("slow");
		},5000);
	}
}

var TN_POPUP={
	control:{
		div:$('#modal-message'),
		title: $('#modal-message .modal-title'),
		content: $('#modal-message .tn-popup-content'),
		footer: $('#modal-message .tn-popup-footer')
	},
	modal: $('#modal-message').modal({
		show: false,
		keyboard: true,
		backdrop: 'static'
	}),
	show: function(content,title,width,height,buttons,timeout,bgclick){
		if(TN_POPUP.tClose){
			clearTimeout(TN_POPUP.tClose);
			delete TN_POPUP.tClose;
		}
		TN_POPUP.control.content.html(content);
		TN_POPUP.control.title.text(title || 'Thông báo');

		var $footer = TN_POPUP.control.footer.html('');
		if(buttons && buttons.length>0){
			for(var i=0;i<buttons.length;i++){
				button = buttons[i];
				var s_auto = button.auto_callback?'auto-callback="true"':'';
				$button = $('<a href="javascript:void(0);" ' + s_auto + ' btn-index="' + i + '" class="btn btn-red" style="min-width: 100px; display: inline-block; margin: 0 5px;">' + button.caption + '</a>');
				if(button.auto_callback){
					button.timeout = setTimeout(function(){
						var btn_index = parseInt($('.tn-btn-popup[auto-callback=true]').attr('btn-index'));
						var callback = buttons[btn_index].callback;
						if(callback) callback();
						TN_POPUP.hide();
					},button.auto_callback);
				}
				$button.click(function(){
					if(button.timeout) clearTimeout(button.timeout);
					var btn_index = parseInt($(this).attr('btn-index'));
					var callback = buttons[btn_index].callback;
					if(callback) callback();
					TN_POPUP.hide();
				});
				$footer.append($button);
			}
			if(TN_POPUP.timeout){
				clearTimeout(TN_POPUP.timeout);
				TN_POPUP.timeout=undefined;
			}
			if(timeout){
				TN_POPUP.timeout = setTimeout(function(){
					TN_POPUP.hide();
				},timeout);
			}
		}
		else{
			$botton_default = $('<a href="javascript:void(0);" class="btn btn-red"  style="min-width: 100px; display: inline-block; margin: 0 5px;">Ok</a>');
			$botton_default.click(function(){
				TN_POPUP.hide();
			});
			$footer.append($botton_default);
		}
		if(!TN_POPUP.control.div.is(':visible')) TN_POPUP.modal.modal('show');
	},
	hide: function(){
		TN_POPUP.tClose = setTimeout(function(){
			TN_POPUP.modal.modal('hide');
		},200);
	}
};
$(function(){
	TN_POPUP.control={
		div:$('#modal-message'),
		title: $('#modal-message .modal-title'),
		content: $('#modal-message .tn-popup-content'),
		footer: $('#modal-message .tn-popup-footer')
	};
	TN_POPUP.modal = $('#modal-message').modal({
		show: false,
		keyboard: true,
		backdrop: 'static'
	});
});

window.Confirm = function(message,title,callback){
	var buttons = [
		{
			caption:'Đồng ý',
			callback:function(){
				callback(true);
			}
		},
		{
			caption:'Hủy',
			callback:function(){
				callback(false);
			}
		}
	];
	TN_POPUP.show(message,title,null,null,buttons);
};

function goToByScroll(id){
	id = id.replace("link", "");
	$('html,body').animate({scrollTop: $(id).offset().top},'slow');
}

jQuery.fn.ForceNumericOnly = function(){
	return this.each(function(){
		$(this).keydown(function(e){
			var key = e.charCode || e.keyCode || 0;
			// allow backspace, tab, delete, enter, arrows, numbers and keypad numbers ONLY
			// home, end, period, and numpad decimal
			return (
				key == 8 ||
				key == 9 ||
				key == 13 ||
				key == 46 ||
				key == 110 ||
				key == 190 ||
				(key >= 35 && key <= 40) ||
				(key >= 48 && key <= 57) ||
				(key >= 96 && key <= 105));
		});
	});
};

function SortArray(arr,field,asc){
	if(arr && arr.length>0){
		var length = arr.length;
		var arr_temp = [];
		for(var i=0;i<length;i++){
			var val=arr[0][field];
			var index=0;
			for(j=1;j<length-i;j++){
				var item = arr[j];
				if(asc){
					if(val>item[field]){
						val = item[field];
						index = j;
					}
				}
				else{
					if(val<item[field]){
						val = item[field];
						index = j;
					}
				}
			}
			arr_temp.push(arr[index]);
			arr.splice(index,1);
		}
		return arr_temp;
	}
	return null;
}

var Urllib = {
	encode: function(a) {
		return encodeURIComponent(a);
	},
	decode: function(a) {
		return decodeURIComponent(a);
	},
	GetQueryString: function() {
		var a = [],hash;
		var b = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for (var i = 0; i < b.length; i++) {
			hash = b[i].split('=');
			a.push(hash[0]);
			a[hash[0]] = unescape(hash[1]);
		}
		return a;
	},
	getIsMobileClient: function(a) {
		var b = navigator.userAgent.toLowerCase();
		var c = ['android', "windows ce", 'blackberry', 'palm', 'mobile'];
		for (var i = 0; i < c.length; i++) {
			if (b.indexOf(c[i]) > -1) {
				return (a) ? (c[i].toUpperCase() == a.toUpperCase()) : true;
			}
		}
		return false;
	}
};

$(document).on("keydown", function (e) {
	if (e.which === 8 && !$(e.target).is("input, textarea")) {
		e.preventDefault();
	}
});

if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(position){window.position = position.coords;}, function(err) {window.position = -1});
} else {
	window.position = 0
}