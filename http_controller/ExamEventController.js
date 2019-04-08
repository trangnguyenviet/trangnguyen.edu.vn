'use strict';
const logger = require('tracer').colorConsole(),
	express = require('express'),
	router = express.Router(),
	util = require('../util/util'),
	async = require('async'),
	CryptoJS = require('../util/CryptoJS');

let UserScoreEventModel = require('../model/UserScoreEventModel');
let UserScoreEventRankModel = require('../model/UserScoreEventRankModel');

// router.get('/', function(req, res) {
// 	try{
// 		let param_render = {};

// 		//title
// 		param_render.title='Vui học hè - Trạng Nguyên';

// 		param_render.user=req.tndata.user;
// 		res.render('exam_event', param_render);
// 	}
// 	catch(e){
// 		logger.error(e.stack);
// 	}
// });

router.get('/bang-vang/:name_ko_dau?.:id?/', function(req, res) {
	try{
		let DbUtil = req.DbUtil;

		let param_render = {};

		// param_render.user=req.tndata.user;
		if(req.params.id && util.isOnlyNumber(req.params.id)){
			let id = util.parseInt(req.params.id);
			async.waterfall([
				function(callback) {
					DbUtil.GetExamEventInfo(id,(err,info)=>{
						if(err){
							logger.error(err);
							res.sendStatus('500');
						}
						else{
							if(info){
								param_render.title = 'Xếp hạng ' + info.name + ' - Trạng Nguyên';
								param_render.page_title = 'Bảng xếp hạng sự kiện ' + info.name + ' (cập nhật 1h/lần)';
								param_render.eventname = 'Xếp hạng sự kiện';
								callback(null, info);
							}
							else{
								// res.redirect('/');
								res.sendStatus('404');
							}
						}
					});
				},
				function(data,callback){
					callback(null, data);
				},
			],
			function(list_err,list_result){
				res.render('bang-vang-event', param_render);
			});
		}
		else{
			res.sendStatus('404');
		}
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.post('/bang-vang/:name_ko_dau?.:id?/', function(req, res) {
	try{
		// let redis = req.redis;
		// let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		// let jResponse = {};

		let id = util.parseInt(req.params.id);
		let page_size = 100;
		let class_id = util.parseInt(req.query.lop);
		let page_index = util.parseInt(req.query.trang);

		if(id>0){
			if(class_id<=0 || class_id>6) class_id = 1;
			let jWhere = {
				event_id:id,
				class_id:class_id
			};
			let jResponse = {page_index:page_index,page_size:page_size,class_id: class_id};
			async.parallel([
				function(callback) {
					DbUtil.TopRankEvent(jWhere, page_index, page_size, true, function(err,result){
						if(err){
							logger.error(err);
						}
						else{
							jResponse.content=result.content;
							jResponse.total_rows=result.count;
							callback(err, null);
						}
					});
				}
			],function(list_err,list_result){
				jResponse.error = 0;
				jResponse.message = 'ok';
				res.json(jResponse);
			});
		}
		else{
			res.sendStatus('404');
		}
	}
	catch(e){
		logger.error(e);
	}
});

router.post('/ranktop', function(req, res) {
	try{
		// let redis = req.redis;
		// let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		let jResponse = {};

		let id = util.parseInt(req.body.id);
		let class_id = util.parseInt(req.body.class_id);
		if(id>0){
			let jWhere = {event_id:id};
				if(class_id>0 && class_id<=6) jWhere.class_id = class_id;
				async.parallel([
					function(callback) {
						DbUtil.TopRankEvent(jWhere, 0, 3, false, function(err,result){
							if(err){
								logger.error(err);
							}
							else{
								jResponse.content=result.content;
								callback(err, null);
							}
						});
					}
				],function(list_err,list_result){
					jResponse.error = 0;
					jResponse.message = 'ok';
					res.json(jResponse);
				});
		}
		else{
			res.sendStatus('404');
		}
	}
	catch(e){
		logger.error(e);
	}
});

router.get('/:name?.:id?', function(req, res) {
	try{
		// let redis = req.redis;
		// let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		let param_render = {};

		let id = util.parseInt(req.params.id);
		if(id>0){
			let user = req.tndata.user;
			if(user){
				async.waterfall([
					//get info event
					function(callback) {
						DbUtil.GetExamEventInfo(id,(err,info)=>{
							if(err){
								logger.error(err);
							}
							else{
								let res404 = ()=>{
									res.status(404).render('404', {url: req.url});
								};

								if(info){
									param_render.title = info.name + ' - Trạng Nguyên';
									if(info.active){
										if(info.time_begin && info.time_end){
											//get current time
											let time = Math.floor(new Date()/1000);
											if(time>=info.time_begin){
												if(time<=info.time_end){
													//done
													callback(null, info);
												}
												else{
													//event expired
													res.redirect('/su-kien/bang-vang/' + info.name_ko_dau + '.' + id);
												}
											}
											else{
												res404();
											}
										}
										else{
											//event no expiration
											callback(null, info);
										}
									}
									else{
										//event not active
										res404();
									}
								}
								else{
									//event not found
									res404();
								}
							}
						});
					},
					//get info score
					function(data,callback){
						UserScoreEventRankModel.findOne({
							user_id: user._id,
							event_id: id
						})
						.select('score time')
						.exec((err,info)=>{
							if(err){
								logger.error(err);
							}
							else{
								if(info){
									//Thi tự do + Max điểm-dừng + lưu điểm cuối
									if(data.type==4){
										if(info.score == info.play*(info.spq? info.spq: 10)){
											param_render.error = 10;
											param_render.error_message='Bạn đã đạt ' + info.score + ' điểm, thời gian: ' + info.time;
											callback(true, null);
										}
										else{
											data.score = info.score;
											callback(null, data);
										}
									}
									//thi 1 lần + lưu điểm || thi bằng mã + lưu điểm
									else if(data.type==5 || data.type==6){
										//type not free
										param_render.error = 10;
										param_render.error_message='Bạn đã đạt ' + info.score + ' điểm, thời gian: ' + info.time;
										callback(true, null);
									}
									else{
										//type free
										data.score = info.score;
										callback(null, data);
									}
								}
								else{
									//not play exam
									callback(null, data);
								}
							}
						});
					},
					function(data,callback){
						DbUtil.GetExamEventGame(id,user.class_id,(err,info)=>{
							if(err){
								logger.error(err);
							}
							else{
								if(info){
									let tnp = 'tn.' + user._id + '.mvt1.hpstar';
									let tnk = CryptoJS.SHA256(tnp).toString();
									let encryptedAES = CryptoJS.AES.encrypt(JSON.stringify(info), tnk);
									param_render.data_enc = encryptedAES.toString();
									callback(null, data);
								}
								else{
									param_render.error = 1;
									param_render.error_message='Không có đề thi cho bài này.';
									callback(true, null);
								}
							}
						});
					}
				],
				function(list_err,list_result){
					res.render('exam_event', param_render);
				});
			}
			else{
				res.redirect('/');
			}
		}
		else{
			res.redirect('/');
		}
	}
	catch(e){
		logger.error(e);
	}
});

router.post('/:name?.:id?', function(req, res) {
	try{
		// let redis = req.redis;
		// let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		let id = util.parseInt(req.params.id);
		let jResponse = {
			error: 0,
			message: ''
		};

		if(id>0){
			let user = req.tndata.user;
			if(user){
				async.waterfall([
					//data post
					function(callback){
						let data = {};
						let postContent = req.body.d;
						if(postContent && postContent!=''){
							let tnp = 'tn.' + user._id + '.mvt1.hpstar';
							let tnk = CryptoJS.SHA256(tnp).toString();
							let decrypted = CryptoJS.AES.decrypt(postContent,tnk);
							if(decrypted){
								decrypted = decrypted.toString(CryptoJS.enc.Utf8);
								postContent = util.parseJson(decrypted);
								if(postContent){
									data.postContent = postContent;
									callback(null, data);
								}
							}
							else{
								callback(true, null);
							}
						}
					},
					//get info event
					function(data, callback) {
						DbUtil.GetExamEventInfo(id,(err,info)=>{
							if(err){
								logger.error(err);
							}
							else{
								let res404 = (msg)=>{
									jResponse = {error: 1, message: msg};
									callback(true, data);
								};
								if(info){
									data.event_info = info;
									if(info.active){
										if(info.time_begin && info.time_end){
											//get current time
											let time = Math.floor(new Date()/1000);
											if(time>=info.time_begin){
												if(time<=info.time_end){
													//done
													callback(null, data);
												}
												else{
													//event expired
													res404('Hết thời gian diễn ra sự kiện');
												}
											}
											else{
												res404('Chưa diễn ra sự kiện');
											}
										}
										else{
											//event no expiration
											callback(null, data);
										}
									}
									else{
										//event not active
										res404('sự kiện không còn diễn ra');
									}
								}
								else{
									//event not found
									res404('Không tìm thấy thông tin sự kiện');
								}
							}
						});
					},
					//get exam game
					function(data,callback){
						DbUtil.GetExamEventGame(id,user.class_id,(err,info)=>{
							if(err){
								logger.error(err);
							}
							else{
								if(info){
									data.game_info = info;
									callback(null, data);
								}
								else{
									jResponse = {error: 1, message: 'không tìm thấy bài thi'};
									callback(true, data);
								}
							}
						});
					},
					//get info score
					function(data,callback){
						// logger.info(typeof data.event_info, data.event_info);
						UserScoreEventRankModel.findOne({
							user_id: user._id,
							event_id: id
						})
						.select('score time')
						.exec((err,info)=>{
							if(err){
								logger.error(err);
							}
							else{
								let saveLogScore = (score, time, cb)=>{
									let userScoreEventModel = new UserScoreEventModel({
										event_id: id,
										user_id: user._id,
										score: score,
										time: time
									});
									userScoreEventModel.save((err,info)=>{
										cb(err,info);
									});
								};
								let insertRank = (event_id, user_id, fullname, class_id, score, time, cb)=>{
									let userScoreEventRankModel = new UserScoreEventRankModel({
										event_id: event_id,
										user_id: user_id,
										fullname: fullname,
										class_id: class_id,
										score: score,
										time: time
									});
									userScoreEventRankModel.save(function(err,newInfo){
										cb(err, newInfo);
									});
								};
								let updateRank = (score, time, cb)=>{
									info.score = data.postContent.score;
									info.time = data.postContent.time;
									info.save((err,reply)=>{
										cb(err, reply);
									});
								};

								//has play exam
								if(info){
									let eventType = data.event_info.type;
									// logger.log(data.event_info, data.event_info.type, eventType, eventType==1,eventType==2,eventType==3,eventType==4,eventType==5,eventType==6);
									// logger.info(typeof data.event_info, data.event_info);
									//thi tự do (không lưu điểm)
									if(eventType==1){
										jResponse = {error: 0,message: 'done'};
										callback(true, null);
									}
									//thi tự do + lưu điểm cuối
									else if(eventType==2){
										saveLogScore(data.postContent.score, data.postContent.time, (err, reply)=>{
											if(err){
												logger.error(err, reply);
											}
										});

										//update rank
										updateRank(data.postContent.score, data.postContent.time, (err,reply)=>{
											if(err){
												logger.error(err, reply);
											}
											callback(err, data);
										});
									}
									//thi tự do + lưu điểm cao nhất
									else if(eventType==3){
										let isSave = false;
										if(info.score < data.postContent.score){
											isSave = true;
										}
										else if(info.score == data.postContent.score && info.time > data.postContent.time){
											isSave = true;
										}
										if(isSave){
											saveLogScore(data.postContent.score, data.postContent.time, (err, reply)=>{
												if(err){
													logger.error(err, reply);
												}
											});

											//update rank
											updateRank(data.postContent.score, data.postContent.time, (err,reply)=>{
												if(err){
													logger.error(err, reply);
												}
												callback(err, data);
											});
										}
										else{
											callback(false, data);
										}
									}
									//thi tự do + Max điểm dừng + lưu điểm cuối
									else if(eventType==4){
										if(info.score == data.game_info.play*(data.game_info.spq? data.game_info.spq: 10)){
											jResponse = {error: 10,message: 'Bạn đã thi trước đó với số điểm: ' + info.score + ' điểm, thời gian: ' + info.time};
											callback(true, data);
										}
										else{
											saveLogScore(data.postContent.score, data.postContent.time, (err, reply)=>{
												if(err){
													logger.error(err, reply);
												}
											});

											//update rank
											updateRank(data.postContent.score, data.postContent.time, (err,reply)=>{
												if(err){
													logger.error(err, reply);
												}
												callback(err, data);
											});
										}
									}
									//thi 1 lần + lưu điểm || thi bằng mã + lưu điểm
									else if(eventType==5 || eventType==6){
										jResponse = {error: 10,message: 'Bạn đã thi trước đó với số điểm: ' + info.score + ' điểm, thời gian: ' + info.time};
										callback(true, null);
									}
									else{
										//type free
										logger.info(typeof data.event_info, data.event_info);
										callback(null, data);
									}
								}
								else{
									//not play exam
									saveLogScore(data.postContent.score, data.postContent.time, (err, reply)=>{
										if(err){
											logger.error(err, reply);
										}
									});

									//update rank
									insertRank(id, user._id, user.name, user.class_id, data.postContent.score, data.postContent.time, (err,reply)=>{
										if(err){
											logger.error(err, reply);
										}
										callback(err, data);
									});
								}
							}
						});
					}
				],
				function(list_err,list_result){
					res.json(jResponse);
				});
			}
			else{
				res.status(401).json({error:401});
			}
		}
		else{
			res.status(404).json({error:404});
		}
	}
	catch(e){
		logger.error(e);
	}
});

// router.post('/:name?.:id?/:class_id?', function(req, res) {
// 	try{
// 		let DbUtil = req.DbUtil;
// 		let response={};
//
// 		let id = util.parseInt(req.params.id);
// 		// let class_id = util.parseInt(req.params.class_id);
// 		if(id>0){
// 			let user = req.tndata.user;
// 			if(user){
// 				async.waterfall([
// 					function(callback) {
// 						DbUtil.GetExamEventInfo(id,(err,info)=>{
// 							if(err){
// 								logger.error(err);
// 							}
// 							else{
// 								if(info){
// 									callback(null, info);
// 								}
// 								else{
// 									response.error = 1;
// 									response.message = "Không tìm thấy sự kiện";
// 									callback(true, null);
// 								}
// 							}
// 						});
// 					},
// 					function(data,callback){
// 						DbUtil.GetExamEventGame(id,user.class_id,(err,info)=>{
// 							if(err){
// 								logger.error(err);
// 							}
// 							else{
// 								if(info){
// 									if(data.score && data.score == info.play*10){
// 										response.error = 10;
// 										response.error_message='Bạn đã đạt ' + data.score + ' điểm';
// 										callback(true, null);
// 									}
// 									else{
// 										let tnp = 'tn.' + user._id + '.mvt1.hpstar';
// 										let tnk = CryptoJS.SHA256(tnp).toString();
// 										let encryptedAES = CryptoJS.AES.encrypt(JSON.stringify(info), tnk);
// 										response.data_enc = encryptedAES.toString();
// 										callback(null, info);
// 									}
// 								}
// 								else{
// 									response.error = 1;
// 									response.error_message='Không có đề thi cho bài này.';
// 									callback(true, null);
// 								}
// 							}
// 						});
// 					}
// 				],
// 				function(list_err,list_result){
// 					res.json(response);
// 				});
// 			}
// 			else{
// 				res.json({error: 5, message:''});
// 			}
// 		}
// 		else{
// 			res.json({error: 1, message:''});
// 		}
// 	}
// 	catch(e){
// 		logger.error(e);
// 	}
// });

module.exports = router;