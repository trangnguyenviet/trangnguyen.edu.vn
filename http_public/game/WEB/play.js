$(function () {
	TN_POPUP.show('Đang kết nối với máy chủ...','Kết nối',null,null,null,false);
	var g;
	var accept_connect = true;
	var is_end_game = false;
	var t1,t2,itv;
	var div_questions = $('#div_questions');
	var tn_count_down = $('#tn-count-down');
	var bt_endgame = $('#bt_endgame');
	var list_question;
	var key_store;
	var value_store={};
	// var socket = io(window.socket_exam);
	var socket = io();
	socket.on('connect', function(){
		TN_POPUP.hide();
	});

	socket.on('server-ready', function(data,callback){
		callback({'client-ready': true,width:screen.width,height:screen.height});
		key_store = data.key_store;
	});

	socket.on('server-msg', function(data){
		accept_connect = false;
		TN_POPUP.show(data.message);
	});

	socket.on('socket-ready', function(data){
		if(data.error==0){
			if(g==undefined){
				g={};
				bottons=[{
					caption:'Bắt đầu',
					callback:function(){
						socket.emit('getdata', {a:'mvt',b:'2015'},function(mess){
							if(mess.error==0){
								SetData(mess.data,function(){
									SetStart();
								});
							}
							else{
								accept_connect = false;
								TN_POPUP.show(mess.message);
							}
						});
					}
				},
				{
					caption:'Thoát',
					callback:function(){
						window.location.href='/';
					}
				}];
				TN_POPUP.show('Em hãy đọc kỹ câu hỏi và ĐIỀN vào chỗ trống hoặc CHỌN 1 trong 4 đáp án cho sẵn. Nếu CHỌN đáp án em hãy click chuột vào ô tròn trước đáp án. Nếu ĐIỀN vào chỗ trống, em hãy ĐIỀN chữ cái, từ, số, ký hiệu toán học, hoặc phép tính. Chú ý, phân số em ĐIỀN theo dạng a/b.Nếu là số thập phân em dùng dấu chấm, ví dụ 1.25 và sau khi làm xong 10 câu hỏi em ấn nút nộp bài.<br/>Bạn đã sẵn sàng chưa?','Bắt đầu',600,280,bottons,null,false);
			}
		}
		else{
			accept_connect = false;
			TN_POPUP.show(data.error_message,'Cảnh báo',null,null,null,null,false);
			socket.close();
		}
	});

	function GetDataLocal(){
		try{
			var data = util.ReadLocalStore(key_store,'');
			if(data && data!=''){
				var store_value = JSON.parse(data);
				if(store_value){
					var date = new Date();
					if(store_value.expire<date.getTime()){
						util.DelLocalStore(key_store);
						return {};
					}
					else{
						return store_value;
					}
				}
			}
			return {};
		}
		catch(e){
			console.error(e);
			return {};
		}
	}

	function SetDataLocal(){
		var date = new Date();
		date.setSeconds(date.getSeconds()+t2);
		value_store.expire = date.getTime();
		util.SaveLocalStore(key_store,value_store);
	}

	function SetData(data,callback){
		t1 = data.timeLeft || data.time;
		var iplay = data.play;
		value_store = GetDataLocal();
		if (data.content) {
			list_question = data.content;
			var html='';
			$.each(list_question, function (index, item) {
				html += '<div class="cauhoi">';
				html += '<p class="tn-question-id"> Câu hỏi ' + (index+1) + ': <span style="float: right;" id="as-'+index+'"></span></p>';
				var q = item.question;
				var store_obj = value_store[index];
				if (item.type == undefined || item.type == "1") {
					var matchs = q.match(/\{img:.+\}/gi);
					if (matchs != null) {
						$.each(matchs, function (i, val) {
							var src = val.substr(5, val.length - 6);
							q = q.replace(val, '<img src="' + src + '"/>');
						});
					}
					matchs = q.match(/\$(-)?\d*\\\w+\{\d+\}(\{\d+\})?\$/g);
					if (matchs != null) {
						$.each(matchs, function (i, val) {
							var src = '/latex/' + encodeURI(val.replace(/\$/g,''));
							q = q.replace(val, '<img src="' + src + '"/>');
						});
					}
					var vals = (store_obj && store_obj.type==1)?store_obj.value:null;
					html += '<p class="tn-question">' + q + '</p>';
					html+='<p class="tn-answer tn-answer-image">'
					$.each(item.answer, function (i, val) {
						html+='<span>';
						if(vals && vals==i) html += '<input qid="'+index+'" id="answer_' + index + '_' + i + '" name="answer_' + index + '" type="radio" value="' + i + '" checked/>';
						else html += '<input qid="'+index+'" id="answer_' + index + '_' + i + '" name="answer_' + index + '" type="radio" value="' + i + '" />';
						matchs = val.match(/\{img:.+\}/gi);
						if (matchs != null) {
							$.each(matchs, function (ix, imgsrc) {
								var src = imgsrc.substr(5, imgsrc.length - 6);
								val = val.replace(val, '<img src="' + src + '"/>');
							});
						}
						matchs = val.match(/\$(-)?\d*\\\w+\{\d+\}(\{\d+\})?\$/g);
						if (matchs != null) {
							$.each(matchs, function (ix, imgsrc) {
								var src = '/latex/' + encodeURI(imgsrc.replace(/\$/g,''));
								val = val.replace(val, '<img src="' + src + '"/>');
							});
						}

						html += '<label for="answer_' + index + '_' + i + '"><span></span>' + val + '</label>';
						html+='</span>';
					});
					html+='</p>'
				}
				if (item.type == "2") {
					var matchs = q.match(/\{\}/gi);
					var vals = (store_obj && store_obj.type==2)?store_obj.value:'';
					if (matchs != null) {
						$.each(matchs, function (i, val) {
							q = q.replace(val, '<input qid="'+index+'" type="text" value="'+vals+'" class="answer_input_' + index + '"/>');
						});
						matchs = q.match(/\{img:.+\}/gi);
						if (matchs != null) {
							$.each(matchs, function (i, val) {
								var src = val.substr(5, val.length - 6);
								q = q.replace(val, '<img src="' + src + '"/>');
							});
						}
						matchs = q.match(/\$(-)?\d*\\\w+\{\d+\}(\{\d+\})?\$/g);
						if (matchs != null) {
							$.each(matchs, function (i, val) {
								var src = '/latex/' + encodeURI(val.replace(/\$/g,''));
								q = q.replace(val, '<img src="' + src + '"/>');
							});
						}

						html += '<p class="tn-question">' + q + '</p>';
					}
					else {
						html += '<p class="tn-question"><span style="color:red">#Error</span></p>';
					}
				}
				html += '</div>';
			});
			div_questions.html(html);
			div_questions.find('.cauhoi input[type="text"]').change(function(){
				var input = $(this);
				var qid = input.attr('qid');
				value_store[qid]={
					value:input.val(),
					type:2
				};
				SetDataLocal();
			});
			div_questions.find('.cauhoi input[type="radio"]').click(function(){
				var input = $(this);
				var qid = input.attr('qid');
				value_store[qid]={
					value:input.val(),
					type:1
				};
				SetDataLocal();
			});
		}
		TimeRun(t1);

		if(callback && typeof callback=='function'){
			callback();
		}
	}

	function SetStart(){
		TN_POPUP.hide();
	}

	socket.on('onData', function(mess){
		if(mess.error==0){
			SetData(mess.data);
		}
		else{
			TN_POPUP.show(mess.message);
		}
	});

	socket.on('onStart', function(){
		SetStart();
	});

	socket.on('onEnd', function(mess){
		is_end_game = true;
		if(mess.data_round){
			var data_round = mess.data_round;
			var html = '';
			if(data_round.luot>1) html +='Lượt thi: ' + data_round.luot + '<br/>';
			html += 'Tổng điểm: ' + data_round.total_score + '<br/>';
			html += 'Tổng thời gian: ' + data_round.total_time + '<br/>';
			if(data_round.round_info && data_round.round_info.length>0){
				var round_info = mess.data_round.round_info;
				for(i=0;i<round_info.length;i++){
					html += 'Bài: ' + (i+1) + '- Điểm: ' + round_info[i].score + ' - Thời gian: ' + round_info[i].total_time + '<br/>';
				}
			}

			var bottons = [];
			if(mess.pass_round){
				bottons.push({
					caption:'Thi tiếp',
					callback:function(){
						window.location.href='../vong-' + (mess.round_id + 1) + '/bai-1';
					}
				});
				html += '(Bạn được thi vòng tiếp theo)';
			}
			else{
				bottons.push({
					caption:'Thi lại',
					callback:function(){
						window.location.href='bai-1';
					}
				});
				html += '(Bạn chưa qua vòng này)';
			}
			/*bottons.push({
				caption:'Đáp án',
				callback:function(){
					TN_POPUP.hide();
					if(mess.pass_round){
						bt_endgame.text('Thi tiếp').unbind('click').click(function(){
							window.location.href='../vong-' + (mess.round_id + 1) + '/bai-1';
						});
					}
					else{
						bt_endgame.text('Thi lại').unbind('click').click(function(){
							window.location.href='bai-1';
						});
					}
				}
			});*/
			bottons.push({
				caption:'Thoát',
				callback:function(){
					window.location.href='/';
				}
			});
			TN_POPUP.show(html,'Thông tin vòng thi ' + mess.round_id,400,280,bottons,null,false);
		}
		else{
			var html = 'Bạn thi được: ' + mess.score + ' điểm<br/>';
			html += 'Thời gian: ' + Second2Minute(mess.time-mess.timeLeft);
			var bottons = [
			{
				caption:'Thi tiếp',
				callback:function(){
					window.location.href=mess.next_url;
				}
			},
			/*{
				caption:'Đáp án',
				callback:function(){
					TN_POPUP.hide();
					bt_endgame.text('Thi tiếp').unbind('click').click(function(){
						window.location.href=mess.next_url;
					});
				}
			}*/];
			TN_POPUP.show(html,null,null,null,bottons,null,false);
		}
	});

	socket.on('disconnect', function(){
		if(accept_connect && !is_end_game) TN_POPUP.show('Đã ngắt kết nối với máy chủ...','Lỗi kết nối',null,null,null,null,false);
	});

	bt_endgame.click(function(){
		return NopBai();
	});

	function NopBai() {
		if(!accept_connect) return false;
		clearInterval(itv);
		var answers = [];
		$.each(list_question, function (index, question) {
			var answer='';
			if (question.type == undefined || question.type == "1") {
				var selected = $("input[type='radio'][name='answer_" + index + "']:checked");
				if (selected.length > 0) {
					answer=selected.val();
				}
			}
			if (question.type == "2") {
				var answer = $('.answer_input_' + index).val();
			}
			answers.push(answer);
		});
		socket.emit('submitAnswer', {answers:answers},function(mess){
			if(mess.error) TN_POPUP.show(mess.message,null,null,null,null,null,false);
			else{
				util.DelLocalStore(key_store);
				/*if(mess.list_answer){
					var list_answer = mess.list_answer;
					var length = list_question.length;
					for(i=0;i<length;i++){
						$('#as-' + i).text(list_answer[i]?'(Đúng)':'(sai)');
					}
					div_questions.find('input').prop('disabled',true);
				}*/
			}
		});
		return false;
	}

	function TimeRun(time) {
		t2 = time;
		itv = setInterval(function () {
			t2--;
			if (t2 <= 0) {
				clearInterval(itv);
				bt_endgame.click();
			}
			tn_count_down.html(Second2Minute(t2));
		}, 1000);
	}
});

function Second2Minute(t) {
	var minute = Math.floor(t / 60);
	var second = t - (minute * 60);
	if (minute < 10) minute = '0' + minute;
	if (second < 10) second = '0' + second;
	return minute + ':' + second;
}