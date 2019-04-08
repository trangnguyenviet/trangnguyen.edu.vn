$(function(){
	// var score_toan = $('#score_toan');
	// var score_tienganh = $('#score_tienganh');
	// var score_cuoituan = $('#score_cuoituan');
	var score_tiengviet = $('#score_tiengviet');

	$('#show_syntax').click(function(){
		TN_POPUP.show('Hãy soạn tin nhắn với cú pháp:<br/>TNV ' + user_id + '<br/>Gửi đến 8130 để kích hoạt tài khoản','Kích hoạt tài khoản');
	});

	var span_birth = $('#span_birth');
	var birth = span_birth.text();
	if(birth!=''){
		span_birth.text(util.dateShow(new Date(birth)));
	}

	var user_id = $('#user_id').text();

	$('#bt_pay').click(function(){
		var buttons = [{
			caption:'Thẻ điện thoại',
			callback:function(){
				window.location.href = '/nop-hoc-phi/';
			}
		},{
			caption:'Ngân hàng',
			callback:function(){
				window.location.href = '/nop-hoc-phi-ngan-hang/';
			}
		}];
		TN_POPUP.show('Chọn hình thức thanh toán','Tùy chọn',null,null,buttons);
		return false;
	});

	$.ajax({
		url: "/user/score/" + user_id,
		type: 'POST',
		dataType: "json",
		// data:{},
		beforeSend: function( xhr ) {
			spinner.show();
		},
		success:function(data){
			if(data.error==0){
				if(data.content){
					var leng = data.content.length;
					if(leng>0){
						// var html_toan='',html_tienganh='',html_cuoituan='',html_tiengviet='';
						var html_tiengviet='';
						for(var i = 0; i<leng; i++){
							var item = data.content[i];
							// if(item.type_id==1){
							// 	html_toan+=getHtmlItem(item);
							// }
							// if(item.type_id==2){
							// 	html_tienganh+=getHtmlItem(item);
							// }
							// if(item.type_id==3){
							// 	html_cuoituan+=getHtmlItem(item);
							// }
							if(item.type_id==4){
								html_tiengviet+=getHtmlItem(item);
							}
						}
						// if(html_toan!='') score_toan.find('tbody').html(html_toan);
						// else score_toan.find('tbody tr td').text('Chưa qua vòng thi nào');
						// if(html_tienganh!='')score_tienganh.find('tbody').html(html_tienganh);
						// else score_tienganh.find('tbody tr td').text('Chưa qua vòng thi nào');
						// if(html_cuoituan!='')score_cuoituan.find('tbody').html(html_cuoituan);
						// else score_cuoituan.find('tbody tr td').text('Chưa qua vòng thi nào');
						if(html_tiengviet!='')score_tiengviet.find('tbody').html(html_tiengviet);
						else score_tiengviet.find('tbody tr td').text('Chưa qua vòng thi nào');
					}
					else{
						// score_toan.find('tbody tr td').text('Chưa qua vòng thi nào');
						// score_tienganh.find('tbody tr td').text('Chưa qua vòng thi nào');
						// score_cuoituan.find('tbody tr td').text('Chưa qua vòng thi nào');
						score_tiengviet.find('tbody tr td').text('Chưa qua vòng thi nào');
					}
					// if(data.rank_type_1!=undefined && data.rank_type_1!=null) score_toan.find('.rank-country').text(data.rank_type_1+1);
					// if(data.rank_type_2!=undefined && data.rank_type_2!=null) score_tienganh.find('.rank-country').text(data.rank_type_2+1);
					// if(data.rank_type_3!=undefined && data.rank_type_3!=null) score_cuoituan.find('.rank-country').text(data.rank_type_3+1);
					if(data.rank_type_4!=undefined && data.rank_type_4!=null) score_tiengviet.find('.rank-country').text(data.rank_type_4+1);
				}
			}
			else{
				//nothing
			}
		}
	})
	.always(function() {
		spinner.hide();
	});

	function getHtmlItem(item){
		var html='';
		html+='<tr>';
		html+='<td>' + item.round_id + '</td>';
		html+='<td>' + item.luot + '</td>';
		html+='<td>' + item.score + '</td>';
		html+='<td title="' + item.time + ' Giây">' + util.Second2Minute(item.time) + '</td>';
		html+='<td title="' + util.date2String(new Date(item.created_at)) + '">' + util.date2String3(new Date(item.created_at)) + '</td>';
		html+='</tr>';
		return html;
	}
});