$(function(){
	goToByScroll('.box-thitt');
	var t1,t2,tt,itv;
	var dq = $('#div_question');
	var tn_count_down = $('#tn-count-down');
	var ds = $('#div_score'); // div score
	var dca = $('#div_current_question'); //div current answer
	var dtq = $('#div_total_question'); //div total question

	var lq, law, key_store='';
	if(denc && denc!=''){
		bottons=[{
			caption:'Bắt đầu',
			callback:function(){
				var userInfo = window.userInfo;
				if(userInfo){
					var tnp = 'tn.' + userInfo.uid + '.mvt1';
					var tnk = CryptoJS.SHA256(tnp+'.hpstar').toString();
					denc = CryptoJS.AES.decrypt(denc,tnk).toString(CryptoJS.enc.Utf8);
					if(denc && denc !=''){
						denc = util.parseJson(denc);
						if(denc){
							var rla = function(arr,arr2, n){
								if(arr && arr2){
									if (n <= arr.length) {
										var arr_1 = [];
										var arr_2 = [];
										var clone1 = arr.slice();
										var clone2 = arr2.slice();
										for (i = 0; i < n; i++) {
											var index = Math.floor(Math.random() * clone1.length);
											arr_1.push(clone1[index]);
											arr_2.push(clone2[index]);
											clone1.splice(index, 1);
											clone2.splice(index, 1);
										}
										return {l1:arr_1,l2:arr_2};
									}
									else {
										return null;
									}
								}
								else{
									return null;
								}
							};
							var q = rla(denc.content,denc.answers,denc.play);
							if(q){
								var TimeRun = function(time){
									t2 = time;
									itv = setInterval(function () {
										t2--;
										if (t2 <= 0) {
											//clearInterval(itv);
											EndGame();
										}
										tn_count_down.html(Second2Minute(t2));
									}, 1000);
								};

								var tt = denc.time;
								var i=0,ts=0,ca,cq;
								dtq.text(denc.play);
								var getNextQuestion = function(){
									cq = q.l1.shift();
									ca = q.l2.shift();
									if(cq){
										i++;
										dca.text(i);
										GenQuestion(cq,function(as,cb){
											if(as.toLocaleLowerCase()==ca.toLocaleLowerCase()){
												ts+=10;
												ds.text(ts);
												cb(true);
											}
											else{
												cb(false);
											}
											setTimeout(function(){
												getNextQuestion();
											},1000);
										});
									}
									else{
										EndGame();
									}
								};
								TimeRun(tt);
								getNextQuestion();

								var EndGame = function(){
									clearInterval(itv);
									var bottons=[];
									if(ts<denc.play*10){
										bottons.push({
											caption:'Thi lại',
											callback:function(){
												location.reload();
											}
										});
									}
									else{
										bottons.push({
											caption:'Ok',
											callback:function(){
												//location.reload();
											}
										});
									}
									bottons.push({
										caption:'Thoát',
										callback:function(){
											window.location.href='/';
										}
									});
									TN_POPUP.show('Tổng điểm: ' + ts + '<br/> Thời gian: ' + (tt-t2),'Kết thúc bài thi', null, null,bottons,null,false);
									var data = {score:ts,time:tt-t2};
									var enc = CryptoJS.AES.encrypt(JSON.stringify(data), tnk);
									$.ajax({
										url: window.location.href,
										type: 'POST',
										dataType: "json",
										data:{d:enc.toString()},
										success:function(data){}
									});
								};
							}
							else{
								TN_POPUP.show('Xin lỗi <br/> đề lỗi hãy báo lại với ban quản trị');
							}
							return false;
						}
					}
				}
				window.location.href = '/';
			}
		},{
			caption:'Thoát',
			callback:function(){
				window.location.href='/';
			}
		}];
		TN_POPUP.show('Em hãy chọn đọc câu hỏi và chọn đáp án đúng nhất<br/>Em đã sãn sàng chưa?','Bắt đầu',600,280,bottons,null,false);
	}
	else{
		TN_POPUP.show('không có bài thi cho vòng này <br/>hãy báo lại với ban quản trị');
	}

	var GetDataLocal = function(){
		return {};
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
	};

	var SetDataLocal = function(){
		var date = new Date();
		date.setSeconds(date.getSeconds()+t2);
		value_store.expire = date.getTime();
		util.SaveLocalStore(key_store,value_store);
	};

	var GenQuestion = function(qi,callback){
		var q = qi.question;
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
		dq.html(q);
		for(i=0;i<=3;i++){
			var asi = qi.answer[i];
			var checkbox = $('#answer_' + i);
			checkbox.unbind("click").prop('checked',false).prop('disabled',false);
			checkbox.click(function(){
				$('.css-checkbox').prop('disabled',true);
				var cb = $(this);
				var val = cb.val();
				callback(val,function(result){
					var aa = result? $('<span class="dung"><i class="fa fa-check" style="color:#0f0;" aria-hidden="true"></i><span>'): $('<span class="sai"><i class="fa fa-times" style="color:#f00;" aria-hidden="true"></i><span>');
					cb.parent().append(aa);
					setTimeout(function(){
						aa.remove();
					},1000);
				});
			});

			matchs = asi.match(/\{img:.+\}/gi);
			if (matchs != null) {
				$.each(matchs, function (ix, imgsrc) {
					var src = imgsrc.substr(5, imgsrc.length - 6);
					asi = asi.replace(asi, '<img src="' + src + '"/>');
				});
			}
			matchs = asi.match(/\$(-)?\d*\\\w+\{\d+\}(\{\d+\})?\$/g);
			if (matchs != null) {
				$.each(matchs, function (ix, imgsrc) {
					var src = '/latex/' + encodeURI(imgsrc.replace(/\$/g,''));
					asi = asi.replace(asi, '<img src="' + src + '"/>');
				});
			}
			checkbox.next().html(asi);
		}
	};

	var Second2Minute = function(t){
		var minute = Math.floor(t / 60);
		var second = t - (minute * 60);
		if (minute < 10) minute = '0' + minute;
		if (second < 10) second = '0' + second;
		return minute + ':' + second;
	};
});