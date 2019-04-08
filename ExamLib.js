'use strict';
let async = require('async');
let utilModule = require('util');
// let CryptoJS = require('./util/CryptoJS');

module.exports = {
	SelectRound: function(req, res, exam_config){
		// let redis = req.redis;
		let config = req.config;
		let DbUtil = req.DbUtil;

		let type_id = exam_config.id;
		let round = req.params.round;
		let isFree = exam_config.free;

		if(round){
			round = parseInt(round);
			if(round>=1 && round<=exam_config.max_round){
				let param_render = {};
				let baseUrl = req.baseUrl;
				// param_render.round = round;
				param_render.title=utilModule.format('%s - Vòng %d - Trạng Nguyên', exam_config.name, round);
				param_render.page_name = exam_config.name;
				param_render.is_free = exam_config.free;
				let user = req.tndata.user;
				if(user) {
					param_render.user=user;
					let user_id = user._id;
					// let redis_key = config.redis_key;

					let key_current_round = utilModule.format(config.exam.current_round,exam_config.id);
					let key_payment_round =  utilModule.format(config.exam.payment_round,exam_config.id);
					//DbUtil.GetListParam([key_current_round,key_payment_round],function(err,param_map){
					DbUtil.GetParamInfo(key_current_round,function(err,current_round){
						if(err) {
							param_render.error_message='Server đang bận, vui lòng thử lại sau';
						} else {
							//current round
							// let current_round = param_map[key_current_round];
							if(current_round!=undefined){
								if(round<= parseInt(current_round)){
									DbUtil.GetParamInfo(key_payment_round,function(err,payment_round){
										if(err) {
											param_render.error_message='Server đang bận, vui lòng thử lại sau';
										} else {
											// let payment_round = param_map[key_payment_round]? parseInt(param_map[key_payment_round]):0;
											async.waterfall([
												//check active account
												callback =>{
													let data = {};
													if(config.use_active_account){
														DbUtil.CheckActive(user_id, (err, result)=>{
															if(err){
																param_render.error_message='Server đang bận, vui lòng thử lại sau';
															} else {
																if(result){
																	callback(err, data);
																} else {
																	param_render.error = 1111;
																	//param_render.error_message='Tài khoản chưa được kích hoạt.<br/>Gửi thư điện tử với tiêu đề "Kích hoạt ID ' + user_id + '" gửi đến địa chỉ hotro@trangnguyen.edu.vn<br/>Để kích hoạt tài khoản.<br/>Lưu ý: Học sinh chỉ được sử dụng 1 email để kích hoạt.';
																	param_render.error_message='Tài khoản chưa được kích hoạt.<br/>Soạn tin nhắn theo cú pháp.<br/><strong>TNV ' + user_id + '</strong> gửi tới số điện thoại <strong>8130</strong><br/>Để kích hoạt tài khoản.<br/>Lưu ý: Học sinh chỉ được sử dụng 1 tài khoản. Nếu 2 tài khoản sẽ bị khóa';
																	callback(true, data);
																}
															}
														});
													} else {
														callback(null, data);
													}
												},
												//kiểm tra vòng trước đó
												function(data, callback){
													if(isFree){
														callback(false, data);
													} else {
														if(round > 1) {
															DbUtil.GetScoreInfo(user_id,type_id,round-1,function(err,score_info) {
																if(err) callback(true, data);
																else {
																	if(score_info){
																		callback(false, data);
																	} else {
																		param_render.error_message='Bạn chưa thi qua vòng trước';
																		callback(true, data);
																	}
																}
															});
														}
														else{
															callback(false, data);
														}
													}
												},
												//check qua vòng hiện tại
												function(data,callback){
													if(isFree){
														callback(false, data);
													} else {
														DbUtil.GetScoreInfo(user_id,type_id,round,function(err,score_info){
															if(err) callback(true, data);
															else {
																if(score_info){
																	param_render.error_message='Bạn đã thi qua vòng này với sồ điểm: ' + score_info.score;
																	callback(true, data);
																} else {
																	callback(false, data);
																}
															}
														});
													}
												},
												//check điểm vòng hiện tại (cache).
												function(data,callback){
													if(isFree){
														callback(false, data);
													} else {
														DbUtil.GetExamRedis(type_id, round, user_id, function(err,results){
															if(err){
																// console.log('7==========>',err);
																param_render.error_message='Server đang bận, bạn hãy thử lại sau';
																callback(true, null);
															} else {
																if(results) data.score = results;
																callback(false, data);
															}
														});
													}
												},

												//check exam school | district | province | national
												function(data,callback) {
													//school
													if(type_id === 4 && (round === 12 || round === 13 || round === 14)) {
														if(config.isEvent12()) {
															let key_user = req.tndata.code_exam_school;
															if(!key_user) {
																param_render.error = 9996;
																param_render.error_message='Bạn hãy nhập mã thi cấp trường';
																callback(true, null);
															} else {
																callback(false, data);
															}
														} else {
															callback(false, data);
														}
													} else {
														callback(false, data);
													}

													// province
													// if(type_id === 4 && (round === 17 || round === 18)) {
													// 	if(config.IsExamProvince()) {
													// 		let key_user = req.tndata.code_exam_province;
													// 		let key_get = req.tndata.code_exam_province;
													// 		//console.log(key_user,key_get);
													// 		if(key_user==undefined || key_user!=key_get){
													// 			param_render.error = 9999;
													// 			param_render.error_message='Bạn hãy nhập mã thi cấp tỉnh';
													// 			callback(true, null);
													// 		}
													// 		else{
													// 			callback(false, data);
													// 		}
													// 	}
													// 	else{
													// 		callback(false, data);
													// 	}
													// }

													// // national
													// if(type_id === 4 && round === 19 && config.isExamNational()) {
													// 	let key_user = req.tndata.code_exam_national;
													// 	if(!key_user){
													// 		param_render.error = 9999;
													// 		param_render.error_message='Bạn hãy nhập mã thi Đình';
													// 		callback(true, null);
													// 	} else {
													// 		callback(false, data);
													// 	}
													// } else {
													// 	callback(false, data);
													// }
												},

												//check bài đang thi
												function(data,callback){
													if(isFree){
														callback(false, data);
													}
													else{
														//['type_id','round_id','test']
														DbUtil.GetCurrentExam(user_id,function(err,results){
															if(err){
																param_render.error_message='Server đang bận, bạn hãy thử lại sau';
																callback(true, null);
															} else {
																if(!results[0] || results[0]==type_id){
																	if(!results[1] || results[1]==round){
																		data.current_test = results[2]?parseInt(results[2]):undefined;//=> dang thi vong xxx
																		callback(false, data);
																	} else {
																		param_render.error_message=utilModule.format('Bạn đang thi vòng khác (vòng: %s)', results[1]);
																		callback(true, null);
																	}
																} else {
																	param_render.error_message=utilModule.format('Bạn đang thi chủ đề khác (%s)', DbUtil.GetType(results[0]));
																	callback(true, data);
																}
															}
														});
													}
												},
												//check vip
												function(data,callback){
													if(payment_round>0 && round>=payment_round){
														DbUtil.GetVip(user_id,function(err,vip_expire){
															if(err){
																// console.log('3==========>',err);
																param_render.error_message='Server đang bận, vui lòng thử lại sau';
																callback(true, null);
															}
															else{
																if(vip_expire!=null){
																	if(vip_expire - new Date() > 0){
																		callback(false, data);
																	}
																	else{
																		param_render.error = 8888;
																		param_render.error_message='Số ngày sử dụng của bạn đã hết,<br/>hãy nộp thêm học phí thể được thi tiếp';
																		callback(true, null);
																	}
																}
																else{
																	param_render.error = 8888;
																	param_render.error_message='Để thi được vòng này, bạn hãy nộp học phí';
																	callback(true, null);
																}
															}
														});
													}
													else{
														callback(false, data);
													}
												},
												//param for render
												function(data,callback) {
													// console.log('66');
													let exam_lists = [];
													if(data.current_test && isFree==false){
														for(let i = 1; i<=3;i++){
															let score = 0;
															if(data.score && data.score[i-1]) score =parseInt(data.score[i-1]);
															let bai = {
																name: 'Bài ' + i,
																score: score,
																enable: (i==data.current_test),
																url: baseUrl + '/vong-' + round + '/bai-' + i
															};
															exam_lists.push(bai);
														}
													} else {
														let current_test;
														for(let i = 1; i<=3;i++){
															let score = '';
															if(data.score && data.score[i-1]){
																score =parseInt(data.score[i-1]);
															}
															else if(!current_test){
																current_test = i;
															}
															let bai = {
																name: 'Bài ' + i,
																score: score,
																enable: (current_test==i),
																url: baseUrl + '/vong-' + round + '/bai-' + i
															};
															exam_lists.push(bai);
														}
													}
													param_render.exam_lists=exam_lists;
													callback(false, data);
												}
											],
											function(errs,results){
												//tin hướng dẫn
												let path = '/huong-dan';
												// DbUtil.GetListNewsNoPage(path,function(err,results){
												DbUtil.GetListNewsTop(path, 4, function(err,results){
													param_render.path_news = path;
													param_render.list_news = results;
													res.render('select_exam', param_render);
												});
											});
										}
									});
								}
								else res.redirect('/');
							}
							else res.redirect('/');
						}
					});
				}
				else res.redirect('/');
			}
			else res.redirect('/');
		}
		else res.redirect('/');
	},

	SelectTest: function(req, res, exam_config){
		// let redis = req.redis;
		let util = req.util;
		// let log = req.log;
		let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		// let exam_config = config.exam_tiengviet;
		let type_id = exam_config.id;
		let round = req.params.round;
		let test = req.params.test;
		let isFree = exam_config.free;

		if(round && test && util.isOnlyNumber(round) && util.isOnlyNumber(test)){
			round = parseInt(round);
			test = parseInt(test);
			if(round>=1 && round<=exam_config.max_round && test>=1 && test<=3){
				let param_render = {};
				//title
				param_render.title=utilModule.format('%s - Vòng %d - Bài %d - Trạng Nguyên', exam_config.name, round, test);
				param_render.page_name=exam_config.name;
				param_render.is_free = exam_config.free;
				//user info
				let user = req.tndata.user;
				if(user){
					param_render.user=user;
					let user_id = user._id;
					let key_current_round = utilModule.format(config.exam.current_round,exam_config.id);
					let key_payment_round =  utilModule.format(config.exam.payment_round,exam_config.id);
					// DbUtil.GetListParam([key_current_round,key_payment_round],function(err,param_map){
					DbUtil.GetParamInfo(key_current_round,function(err,current_round){
						if(err){
							param_render.error_message='Server đang bận, vui lòng thử lại sau';
							callback(true, null);
						}
						else{
							//current round
							// let current_round = param_map[key_current_round];
							if(current_round!=undefined && current_round!=null){
								if(round<= parseInt(current_round)){
									DbUtil.GetParamInfo(key_payment_round,function(err,payment_round){
										if(err){
											param_render.error_message='Server đang bận';
											callback(true,null);
										}
										else{
											async.waterfall([
												//check active account
												callback =>{
													let data = {};
													if(config.use_active_account){
														DbUtil.CheckActive(user_id, (err, result)=>{
															if(err){
																param_render.error_message='Server đang bận, vui lòng thử lại sau';
															}
															else{
																if(result){
																	callback(err, data);
																}
																else{
																	param_render.error = 1111;
																	param_render.error_message='Tài khoản chưa được kích hoạt.<br/>Soạn tin nhắn theo cú pháp.<br/><strong>TNV ' + user_id + '</strong> gửi tới số điện thoại <strong>8130</strong><br/>Để kích hoạt tài khoản.<br/>Lưu ý: Học sinh chỉ được sử dụng 1 tài khoản. Nếu 2 tài khoản sẽ bị khóa';
																	//param_render.error_message='Tài khoản chưa được kích hoạt.<br/>Gửi thư điện tử với tiêu đề "Kích hoạt ID ' + user_id + '" gửi đến địa chỉ hotro@trangnguyen.edu.vn<br/>Để kích hoạt tài khoản.<br/>Lưu ý: Học sinh chỉ được sử dụng 1 email để kích hoạt.';
																	callback(true, data);
																}
															}
														});
													}
													else{
														callback(null, data);
													}
												},
												//kiểm tra điểm vòng trước
												function(data, callback){
													if(isFree){
														callback(false, data);
													}
													else{
														if(round>1){
															DbUtil.GetScoreInfo(user_id,type_id,round-1,function(err,score_info){
																if(err) callback(true, data);
																else {
																	if(score_info){
																		callback(false, data);
																	}
																	else{
																		param_render.error_message='Bạn chưa thi qua vòng trước';
																		callback(true, data);
																	}
																}
															});
														}
														else{
															callback(false, data);
														}
													}
												},
												//kiểm tra điểm vòng hiện tại
												function(data,callback){
													if(isFree){
														callback(false, data);
													}
													else{
														DbUtil.GetScoreInfo(user_id,type_id,round,function(err,score_info){
															if(err) callback(true, data);
															else {
																if(score_info){
																	param_render.error_message='Bạn đã thi qua vòng này với số điểm: ' + score_info.score;
																	callback(true, data);
																}
																else{
																	callback(false, data);
																}
															}
														});
													}
												},
												//check vip
												function(data,callback){
													if(payment_round>0 && round>=payment_round){
														DbUtil.GetVip(user_id,function(err,vip_expire){
															if(err){
																param_render.error_message='Server đang bận, vui lòng thử lại sau';
																callback(true, null);
															}
															else{
																if(vip_expire !=null){
																	if((vip_expire - new Date) > 0){
																		callback(false, data);
																	}
																	else{
																		param_render.error = 8888;
																		param_render.error_message='Số ngày sử dụng của bạn đã hết,<br/>hãy nộp thêm học phí thể được thi tiếp';
																		callback(true, null);
																	}
																}
																else{
																	param_render.error = 8888;
																	param_render.error_message='Để thi được vòng này, bạn hãy nộp học phí';
																	callback(true, null);
																}
															}
														});
													}
													else{
														callback(false, data);
													}
												},

												//check exam school
												function(data, callback) {
													// if(type_id == 4 && [12, 13, 14].indexOf(round)>=0 && (config.IsEvent12() || config.IsEvent13() || config.IsEvent14())){
													// if(type_id == 4 && (12 == round && config.IsEvent12()) && (13 == round && config.IsEvent13()) && (14 == round && config.IsEvent14())){
													// if(type_id == 4 && 14 == round && config.IsEvent14()){
													if(type_id === 4 && 12 === round && config.isEvent12()){
													// if(type_id == 4 && 13 == round && config.isEvent13()){
													// if(type_id == 4 && 14 == round && config.isEvent14()){
														const key_user = req.tndata.code_exam_school;
														if(!key_user){
															param_render.error = 9996;
															param_render.error_message='Bạn hãy nhập mã thi cấp trường';
															callback(true, null);
														}
														else{
															callback(false, data);
														}
													}
													else{
														callback(false, data);
													}
												},

												//check exam district
												// function(data,callback){
												// 	// if(type_id == 4 && 15 == round && config.isEvent15()){
												// 	if(type_id == 4 && 16 == round && config.isEvent16()){
												// 		let key_user = req.tndata.code_exam_district;
												// 		if(!key_user || key_user == ''){
												// 			param_render.error = 9997;
												// 			param_render.error_message='Bạn hãy nhập mã thi Hương';
												// 			callback(true, null);
												// 		}
												// 		else{
												// 			callback(false, data);
												// 		}
												// 	}
												// 	else{
												// 		callback(false, data);
												// 	}
												// },

												// //check exam province
												// function(data,callback) {
												// 	// if(type_id == 4 && 17 == round && config.isEvent17()){
												// 	if(type_id == 4 && 18 == round && config.isEvent18()){
												// 		let key_user = req.tndata.code_exam_province;
												// 		if(!key_user || key_user == ''){
												// 			param_render.error = 9998;
												// 			param_render.error_message='Bạn hãy nhập mã thi Hội';
												// 			callback(true, null);
												// 		}
												// 		else{
												// 			callback(false, data);
												// 		}
												// 	}
												// 	else{
												// 		callback(false, data);
												// 	}
												// },

												// //check example national
												// function(data,callback) {
												// 	if(type_id == 4 && round==19 && config.isExamNational()){
												// 		let key_user = req.tndata.code_exam_national;
												// 		if(!key_user || key_user==''){
												// 			param_render.error = 9999;
												// 			param_render.error_message='Bạn hãy nhập mã thi Đình';
												// 			callback(true, null);
												// 		}
												// 		else{
												// 			callback(false, data);
												// 		}
												// 	}
												// 	else{
												// 		callback(false, data);
												// 	}
												// },

												//get game id
												function(data,callback){
													DbUtil.GetGameId(type_id,user.class_id,round,test,function(err,game_id){
														if(err){
															param_render.error_message='Server đang bận, vui lòng thử lại sau';
															callback(true, null);
														}
														else{
															if(game_id!=undefined && game_id!=null){
																param_render.game_id = game_id;
																param_render.socket_exam = config.socket_exam;

																req.tndata.round_id = round;
																req.tndata.test = test;
																req.tndata.type_id = exam_config.id;
																req.tndata.game_id = game_id;
																callback(false,game_id);
															}
															else{
																param_render.error_message='Bài này chưa có đề thi. BTC đang cập nhật đề thi.';
																callback(true,null);
															}
														}
													});
												},
												//example client process
												// function(game_id,callback){
												// 	if(isFree){
												// 		// if(game_id==0){
												// 			let tnp = user_id + '.tn.' + game_id;
												// 			let tnk = CryptoJS.SHA256(tnp).toString();
												// 			DbUtil.GetExamInfo(type_id,user.class_id,round,test,(err,exam_info)=>{
												// 				if(err){
												// 					callback(err,null);
												// 				}
												// 				else{
												// 					if(exam_info){
												// 						let encryptedAES = CryptoJS.AES.encrypt(JSON.stringify(exam_info), tnk);
												// 						param_render.data_enc = encryptedAES.toString();
												// 						param_render.type_id = type_id;
												// 						param_render.round_id = round;
												// 						param_render.test_id = test;
												// 						// param_render.exam_info = exam_info;
												// 					}
												// 					else{
												// 						param_render.data_enc='';
												// 					}
												// 					callback(false,null);
												// 				}
												// 			});
												// 		// }
												// 		// else{
												// 		// 	callback(false,null);
												// 		// }
												// 	}
												// 	else{
												// 		callback(false,null);
												// 	}
												// }
												//end example client process
											],
											function(){
												if(param_render.game_id==0){
													res.render('web_exam', param_render);
												}
												else{
													param_render.JsFile = DbUtil.GetJsGame(param_render.game_id);
													param_render['game_id_'+param_render.game_id] = true;
													res.render('game_exam', param_render);
												}
											});
										}
									});
								}
								else res.redirect('/');
							}
							else{
								param_render.error=30000;
								param_render.error_message='không có thông tin cấu hình';
								res.render('game_exam', param_render);
							}
						}
					});
				}
				else res.redirect('/');
			}
			else res.redirect('/');
		}
		else res.redirect('/');
	}
};