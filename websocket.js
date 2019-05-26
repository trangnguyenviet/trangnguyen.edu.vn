'use strict';
const logger = require('tracer').colorConsole(),
	http = require('http'),
	// cookieParser = require('cookie-parser'),
	cluster = require('cluster'),
	net = require('net'),
	path = require('path'),
	os = require('os'),
	utilModule = require('util'),
	sessions = require("client-sessions"),
	config = require('./config/config'),
	util = require('./util/util'),
	// Log = require('./util/log'),
	async = require('async'),
	DbUtils = require('./DbUtil'),
	ConnectMgrs = require('./ConnectMgr');

//********************************mongodb*************************************//
const mongoose = require ("mongoose");
mongoose.connect(config.mongodb.connect);
mongoose.set('debug', config.mongodb.debug);

//********************************redis*************************************//
const redis = require("redis");
const redis_client = redis.createClient(config.redis);

//********************************letiable global*************************************//
const num_processes = os.cpus().length;

//is_user_play_exam_<user_id>
const redis_key = config.redis_key;
// let key_is_user_play_exam = redis_key.is_user_play_exam;

const DbUtil = new DbUtils(redis_client);
const ConnectMgr = new ConnectMgrs(redis_client);

//********************************cluster*************************************//
if (cluster.isMaster) {
	console.log('websocket starting...');

	let workers = [];
	let spawn = function(i) {
		let worker = cluster.fork();
		workers[i] = worker;

		workers[i].on('exit', function(worker, code, signal) {
			console.log('respawning worker', i);
			spawn(i);
		});

		worker.on('message', function(msg) {
			SwitchAction(msg);
		});
	};

	ConnectMgr.clear();

	let worker_index = function(ip, len) {
		if(!ip || ip=='') return 0;

		let s = '';
		for (let i = 0, _len = ip.length; i < _len; i++) {
			if (ip[i] !== '.') {
				s += ip[i];
			}
		}

		return Number(s) % len;
	};

	DbUtil.LoadListParam(function(){
		// Spawn workers.
		for (let i = 0; i < num_processes; i++) {
			spawn(i);
		}

		let server = net.createServer({pauseOnConnect: true}, function(connection){
		let worker = workers[worker_index(connection.remoteAddress, num_processes)];
			worker.send('sticky-session:connection', connection);
		})
		.listen(config.socket_port,config.server_name);

		console.log('websocket server listen %s:%d ',config.server_name,config.socket_port);
	});

	let SwitchAction = function(msg){
		if(msg && msg.action){
			if(msg.action=='set_timeout'){
				set_timeout(msg);
			}
			if(msg.action=='clear_timeout'){
				clear_timeout(msg);
			}
		}
	};

	//
	let list_timeout = {};
	let clear_timeout = function(data){
		// logger.info(data);
		let user_id = data.user_id;
		if(user_id){
			let tOut = list_timeout[user_id];
			if(tOut){
				clearTimeout(tOut);
				delete list_timeout[user_id];
			}
		}
	};

	//data={user_id:1,type_id:1,round_id:1,test:2,timeout:111}
	let set_timeout = function(data){
		// logger.info(data);
		let user_id = data.user_id;
		let type_id = data.type_id;
		let round_id = data.round_id;
		let test = data.test;
		let user_info = data.user_info;

		let redis_key = config.redis_key;
		let objKey = config.redis_key.score_user;

		let key_user_play_exam = utilModule.format(redis_key.user_play_exam,user_id); //user_play_exam_<user_id>
		let key_list_correct_exam = utilModule.format(redis_key.list_correct_exam, user_id); //list_correct_exam_<user_id>
		let key_score_user = utilModule.format(objKey.hash,type_id,round_id,user_id); //score_user_<type_id>_<round_id>_<user_id>
		list_timeout[user_id] = setTimeout(function(){
			async.waterfall([
				function(callback){
					redis_client.ttl(key_user_play_exam,function(err,second){
						if(err){
							logger.error(err);
							callback(err,null);
						}
						else{
							let data = {};
							data.timeLeft = second>0? second-3:0;
							callback(false,data);
						}
					});
				},
				//get data from redis
				function(data,callback){
					// redis_client.hmget(key_user_play_exam,['score','wrongCount','time','user_exam_id'],function(err,result){
					redis_client.hmget(key_user_play_exam,['score','wrongCount','time'],function(err,result){
						if(err){
							logger.error(err);
							callback(err,null);
						}
						else{
							if(result && result.length>0){
								let score = data.score = result[0]?parseInt(result[0]):0;
								data.wrongCount = result[1]?result[1]:0;
								data.time = result[2]? parseInt(result[2]): 1200;
								data.user_exam_id=result[3];//user_exam_id
								callback(false,data);
							}
						}
					});
				},
				//update score round
				function(data, callback){
					//HMSET score_user_<type_id>_<round>_<user_id> score_<test> <score> total_time_<test> <total_time> wrong_<test> wrongCount
					redis_client.hmset(key_score_user,
							objKey.score + test, data.score,
							objKey.total_time + test, (objKey.total_time-data.timeLeft),
							objKey.wrong + test, data.wrongCount
						);
					callback(false,data);
				},
				//update score to rank
				function(data,callback){
					//update time
					redis_client.hset(key_score_user,objKey.total_time + test,(data.time-data.timeLeft));

					if(test == 3){
						DbUtil.UpdateScoreRank(user_info.province_id,user_info.district_id,user_info.school_id,type_id,round_id,user_info.class_id,user_id,function(err,data_round){
							if(err) logger.error(err);
							else{
								if(data_round.total_score>=150){
									//DEL score_user_<type_id>_<round_id>_<user_id>
									redis_client.del(key_score_user);
								}
							}
							callback(false,data);
						});
					}
					else{
						callback(false,data);
					}
				}
			],
			function(){
				//DEL list_correct_exam_<user_id>
				redis_client.del(key_list_correct_exam);

				//user_play_exam_<user_id>
				redis_client.del(key_user_play_exam);
				logger.info('auto end game (timeout)');
			});
		},(data.timeout+3)*1000);
	};
}
else{
	// let cluster_id = cluster.worker.id;
	// let process_id = cluster.worker.process.pid;

	//*********************************server************************************//
	let server = http.Server();
	server.listen(0,'localhost');

	//********************************process*************************************//
	process.on('message', function(message, connection) {
		if (message !== 'sticky-session:connection') {
			return;
		}
		server.emit('connection', connection);

		connection.resume();
	});

	//***********************************game***************************************//
	let WebExam = require('./socket_controller/WebExam');
	let CVTB = require('./socket_controller/CVTB');
	let TVUB = require('./socket_controller/TVUB');
	let PTMC = require('./socket_controller/PTMC');

	//********************************socket.io*************************************//
	let sio = require('socket.io');
	// let sio_redis = require('socket.io-redis');
	let io = new sio(server);
	//io.adapter(sio_redis({host: config.redis.server, port: config.redis.port}));

	let parseCookie = function(str, opt) {
		opt = opt || {};
		let obj = {};
		let pairs = str.split(/[;,] */);
		let dec = opt.decode || decodeURIComponent;

		pairs.forEach(function(pair) {
			let eq_idx = pair.indexOf('=');
			// skip things that don't look like key=value
			if (eq_idx < 0) {
				return;
			}
			let key = pair.substr(0, eq_idx).trim();
			let val = pair.substr(++eq_idx, pair.length).trim();
			// quoted values
			if ('"' == val[0]) {
				val = val.slice(1, -1);
			}
			// only assign once
			if (undefined == obj[key]) {
				try {
					obj[key] = dec(val);
				} catch (e) {
					obj[key] = val;
				}
			}
		});
		return obj;
	};

	io.set('authorization', function (handshakeData, callback) {
		try{
			let session_data;
			if (!handshakeData.headers.cookie && handshakeData.headers.cookie!='') {
				callback({
					status: 'forbidden',
					reason: 'no session',
					source: 'socket_io'
				}, false);
				return false;
			}
			let cookie = parseCookie(handshakeData.headers.cookie);
			let session_string = cookie[config.session_client.cookieName];

			if(session_string && session_string!=''){
				session_data = sessions.util.decode(config.session_client, session_string);
				if(session_data && session_data.content && session_data.content.user && session_data.content.user._id){
					handshakeData.session_data = session_data.content;
					callback(null,true);
				}
				else{
					callback({
						status: 'forbidden',
						reason: 'unauthorized',
						source: 'socket_io'
					}, false);
				}
				return false;
			}
			else{
				callback({
					status: 'forbidden',
					reason: 'unauthorized',
					source: 'socket_io'
				}, false);
				return false;
			}
		}
		catch(e){
			logger.error(e.stack);
		}
	});

	io.sockets.on('connection', function(socket){
		// try{
			let socket_id = socket.id;
			let sHeaders = socket.handshake.headers;
			let ip = sHeaders['x-forwarded-for'] ? sHeaders['x-forwarded-for']: socket.handshake.address;
			let accept_connect = false;

			//console.log('sesstion',socket.client.request.session_data);
			// { ip: '127.0.0.1',
			// 	user:
			// 	 { _id: 1,
			// 		 name: 'Mạc Văn Tân',
			// 		 class_name: 'a',
			// 		 class_id: 1,
			// 		.school_id:xxx,
			// 		 school_name: 'Trường Tiểu học An Sơn',
			// 		 district_id: 276,
			// 		 province_id: 30,
			// 		 username: 'tanmv123' },
			// 	round_id: 1,
			// 	test: 1,
			// 	type_id: 1,
			// 	game_id: 2
			// }

			let session = socket.client.request.session_data;
			let user_id = session.user._id;
			logger.log('New Connect IP: %s | socket Id: %s | user id: %s',ip,socket_id,user_id);

			let tTimeout = setTimeout(function(){
				socket.emit('server-msg',{error: 6,message:'Chất lượng đường truyền internet của bạn quá chậm,<br/> hãy nhấn Ctrl + F5 để tải lại trang'});
				socket.disconnect();
			},8000);

			let data_realy ={
				ip: ip,
				auth: 'MVTHP-2015',
				fb: 'fb/mvt.hp.star',
				key_store: util.MD5('MVT' + user_id + session.type_id + session.round_id + session.test + session.game_id)
			};
			socket.emit('server-ready',data_realy,function(client_post){
				if(client_post){
					clearTimeout(tTimeout);

					let session = socket.client.request.session_data;
					// let user_id = session.user._id;

					let test = session.test;
					let round_id = session.round_id;
					let type_id = session.type_id;
					let game_id = session.game_id;

					const key_user = session.code_exam_school || session.code_exam_district || session.code_exam_province || session.code_exam_national;

					let isFree = type_id !== 4;

					let objKey = redis_key.score_user;

					//is_user_play_exam_<user_id>
					// let key_is_user_play_exam = utilModule.format(redis_key.is_user_play_exam, user_id);

					//user_play_exam_<user_id>
					// let key_user_play_exam = utilModule.format(redis_key.user_play_exam, user_id);

					//list_correct_exam_<user_id>
					// let key_list_correct_exam = utilModule.format(redis_key.list_correct_exam, user_id);

					//score_user_<type_id>_<round_id>_<user_id>
					let key_score_user = utilModule.format(objKey.hash, type_id, round_id, user_id);

					let data_realy = {error: 0, message: ''};

					async.waterfall([
						//check connect
						function(callback){
							let data = {};
							// ConnectMgr.count_connect(user_id,function(err,count){
							// ConnectMgr.GetConnect(user_id,function(err,socket_id_get){
							// 	if(err){
							// 		console.log(err);
							// 		data_realy.error=3000;
							// 		data_realy.message='Server đang bận';
							// 		callback(true,data);
							// 	}
							// 	else{
							// 		if(socket_id_get){
							// 			if(socket_id_get==socket_id){
							// 				callback(false,data);
							// 			}
							// 			else{
							// 				data_realy.error=50;
							// 				data_realy.message='Bạn đang thi ở máy khác hoặc tab khác <br/> Bạn đang vi phạm quy chế thi';
							// 				callback(true,data);
							// 			}
							// 		}
							// 		else{
							// 			callback(false,data);
							// 		}
							// 	}
							// });
							callback(false, data);
						},
						//check exam school | province | national
						function(data,callback) {
							// if(key_user && !util.isOnlyNumber(key_user)){
							// 	key_user = undefined;
							// }

							//thi trường
							if(type_id === 4 && 12 === round_id && config.isEvent12()) {
							// if(type_id === 4 && 13 === round_id && config.isEvent13()) {
							// if(type_id === 4 && 14 === round_id && config.isEvent14()) {
								if(!key_user) {
									data_realy.error = 9996;
									data_realy.error_message = 'Bạn hãy nhập mã thi cấp trường';
									callback(true, null);
								} else {
									callback(false, data);
								}
							} else {
								callback(false, data);
							}

							// thi huyen
							// if(type_id == 4 && 16 == round_id && config.isEvent16()){
							// 	if(!key_user || key_user == ''){
							// 		data_realy.error = 9997;
							// 		data_realy.error_message='Bạn hãy nhập mã thi Hương';
							// 		callback(true, null);
							// 	}
							// 	else{
							// 		callback(false, data);
							// 	}
							// }
							// else{
							// 	callback(false, data);
							// }

							// thi tỉnh
							// if(type_id == 4 && 17 == round_id && config.isEvent17()){
							// if(type_id == 4 && 18 == round_id && config.isEvent18()){
							// 	if(!key_user || key_user == ''){
							// 		data_realy.error = 9998;
							// 		data_realy.error_message='Bạn hãy nhập mã thi Hội';
							// 		callback(true, null);
							// 	}
							// 	else{
							// 		callback(false, data);
							// 	}
							// }
							// else{
							// 	callback(false, data);
							// }

							// thi đình
							// if(type_id == 4 && 19 == round_id && config.isExamNational()){
							// 	if(!key_user || key_user == ''){
							// 		data_realy.error = 9999;
							// 		data_realy.error_message='Bạn hãy nhập mã thi Đình';
							// 		callback(true, null);
							// 	}
							// 	else{
							// 		callback(false, data);
							// 	}
							// }
							// else{
							// 	callback(false, data);
							// }

							// callback(false, data);
						},
						//get param
						function(data,callback){
							let key_current_round = utilModule.format(config.exam.current_round,type_id);
							let key_payment_round = utilModule.format(config.exam.payment_round,type_id);
							DbUtil.GetParamInfo(key_current_round,function(err,current_round){
								if(err){
									console.log(err);
									data_realy.error_message='Server đang bận, vui lòng thử lại sau';
								}
								else{
									if(err){
										data_realy.error=3000;
										data_realy.message='Server đang bận';
										callback(true,data);
									}
									else{
										if(round_id<= parseInt(current_round)){
											DbUtil.GetParamInfo(key_payment_round,function(err,payment_round){
												if(err){
													data_realy.error=3000;
													data_realy.message='Server đang bận';
													callback(true,data);
												}
												else{
													data.payment_round = payment_round;
													callback(false,data); //pass
												}
											});
										}
										else{
											data_realy.error=1000;
											data_realy.message='Vòng này chưa được mở';
											callback(true,data);
										}
									}
								}
							});
						},
						//kiểm tra vòng trước đó (db)
						function(data,callback){
							if(isFree){
								callback(false, data);
							}
							else{
								if(round_id>1){
									DbUtil.GetScoreInfo(user_id,type_id,round_id-1,function(err,score_info){
										if(err) callback(true, data);
										else {
											if(score_info){
												callback(false, data);
											}
											else{
												data_realy.error=50;
												data_realy.message='Bạn chưa thi qua vòng trước';
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
						//check qua vòng hiện tại (db)
						function(data,callback){
							DbUtil.GetScoreInfo(user_id,type_id,round_id,function(err,score_info){
								if(isFree){
									callback(false, data);
								}
								else{
									if(err) callback(true, data);
									else {
										if(score_info){
											data_realy.error=50;
											data_realy.message='Bạn đã thi qua vòng này với sồ điểm: ' + score_info.score;
											data_realy.isFree=isFree;
											callback(true, data);
										}
										else{
											callback(false, data);
										}
									}
								}
							});
						},
						//check bài đang thi (cache)
						function(data,callback){
							DbUtil.GetTimeStamp(user_id,function(err,second){
								if(err){
									console.log(err);
									data_realy.error=3000;
									data_realy.message='Server đang bận';
									callback(true,data);
								}
								else{
									if(second>0){
										DbUtil.GetCurrentExam(user_id,function(err,results){
											if(err){
												data_realy.error=3000;
												data_realy.message='Server đang bận, bạn hãy thử lại sau';
												callback(true, data);
											}
											else{
												if(!results[0] || results[0]==type_id){
													if(results[1] == round_id && results[2] == test){
														data_realy.error=0;
														data_realy.message='ok';
														callback(true,data); //done & break to socket ready => thi lại
													}
													else{
														data_realy.message=utilModule.format('Bạn đang thi vòng khác (vòng: %s)', results[1]);
														callback(true, data);
													}
												}
												else{
													data_realy.message=utilModule.format('Bạn đang thi chủ đề khác (%s)', DbUtil.GetType(results[0]));
													callback(true, data);
												}
											}
										});
									}
									else{
										callback(false,data);
									}
								}
							});
						},
						//kiểm tra điểm vòng hiện tại (cache)
						function(data,callback){
							DbUtil.GetExamRedis(type_id, round_id, user_id,function(err,result){
								if(err){
									console.log(err);
									data_realy.error=30000;
									data_realy.message='Server đang bận, bạn hãy thử lại sau';
									callback(true, data);
								}
								else{
									if(result){
										if(result[0] && result[1] && result[2]){
											if(parseInt(result[0]) + parseInt(result[1]) + parseInt(result[2])<150){
												data.replay = true;
												data_realy.error=0;
												data_realy.message='done';
												callback(true, data);//thi lại vòng
											}
											else{
												if(isFree){
													callback(false, data);
												}
												else{
													//(lưu lại điểm của vòng - do thoát mà chưa lưu lại điểm)
													DbUtil.UpdateScoreRank(type_id, round_id, user_id,function(err,results){
														if(err){
															console.log(err);
															data_realy.error=30000;
															data_realy.message='Server đang bận, bạn hãy thử lại sau';
															callback(true, data);
														}
														else{
															if(results){
																data_realy.error=68;
																data_realy.message= utilModule.format('Bạn đã thi qua vòng này với số điểm %d',results.total_score);
																callback(true, data);
															}
															else{
																//không xảy ra
																data_realy.error=0;
																data_realy.message='Bạn đã thoát khi chưa hoàn thành bài thi';
																callback(true, data);
															}
														}
													});
												}
											}
										}
										else{
											callback(false, data);//chưa thi hết bài
										}
									}
									else{
										//chưa thi
										callback(false, data);
									}
								}
							});
						},
						//check điểm bài trước
						function(data,callback){
							if(isFree){
								callback(false, data);
							}
							else{
								if(test>1){
									//HMGET score_user_<type_id>_<round_id>_<user_id> score_<test-1>
									redis_client.hmget(key_score_user,['score_' + (test-1)],function(err,score){
										if(err){
											console.log(err);
											data_realy.error=3000;
											data_realy.message='Server đang bận';
											callback(true,data);
										}
										else{
											if(score && score[0]>=0){
												callback(false,data); //đã thi bài trước
											}
											else{
												data_realy.error=96;
												data_realy.message='Bạn chưa thi bài trước';
												callback(true,data);
											}
										}
									});
								}
								else{
									callback(false,data);
								}
							}
						},
						//check điểm bài hiện tại
						function(data,callback){
							if(isFree){
								callback(false, data);
							}
							else{
								//HMGET score_user_<type_id>_<round_id>_<user_id> score_<test>
								redis_client.hmget(key_score_user,['score_' + test],function(err,score){
									if(err){
										console.log(err);
										data_realy.error=3000;
										data_realy.message='Server đang bận';
										callback(true,data);
									}
									else{
										if(score && score[0]){
											data_realy.error=96;
											data_realy.message='Trước đó bạn đã thi bài này <br/>với số điểm: ' + score[0];
											callback(true,data);
										}
										else{
											data_realy.error=0;
											data_realy.message='done';
											callback(false,data);//bài hiện tại chưa thi
										}
									}
								});
							}
						},
						//check vip (db)
						function(data,callback){
							if(data.payment_round>0 && round_id>=data.payment_round){
								DbUtil.GetVip(user_id,function(err,vip_expire){
									if(err){
										console.log(err);
										data_realy.error=3000;
										data_realy.message='Server đang bận, vui lòng thử lại sau';
										callback(true, data);
									}
									else{
										if(vip_expire!=null){
											if(vip_expire - new Date() > 0){
												callback(false, data);
											}
											else{
												data_realy.error=2000;
												data_realy.message='Số ngày sử dụng của bạn đã hết,<br/>hãy nộp thêm học phí thể được thi tiếp';
												callback(true, data);
											}
										}
										else{
											data_realy.error=2000;
											data_realy.message='Để thi được vòng này, bạn hãy nộp học phí';
											callback(true, data);
										}
									}
								});
							}
							else{
								callback(false, data);
							}
						}
					],
					function(errs,results){
						socket.emit('socket-ready',data_realy);
						if(data_realy.error!=0){
							console.log('error:',data_realy.error,'=> disconnect');
							socket.disconnect();
						}
						else{
							let process_send = function(data){
								// logger.info(data);
								process.send(data);
							};

							//set code example for socket
							socket.code= util.isOnlyNumber(key_user)? key_user: undefined;

							// let client;
							if(game_id === 0) {
								WebExam(io, socket, redis_client, DbUtil, process_send);
							}
							else if(game_id === 1) {
								CVTB(io, socket, redis_client, DbUtil, process_send);
							}
							else if(game_id === 2) {
								TVUB(io, socket, redis_client, DbUtil, process_send);
							}
							else if(game_id === 4) {
								PTMC(io, socket, redis_client, DbUtil, process_send);
							}

							accept_connect = true;
							// ConnectMgr.SetConnect(user_id,socket_id,function(){
								logger.info('ready: socket id: %s | user: %s | type: %s | round: %s | test: %s | game id: %s | mã thi: %s',socket_id,user_id,type_id,round_id,test,game_id,key_user);
							// logger.info('ready: socket id: %s | user: %s | type: %s | round: %s | test: %s | game id: %s | mã thi: %s',socket_id,user_id,type_id,round_id,test,game_id);
							// });
						}
					});
				}
				else{
					console.log('Client not ready!');
				}
			});

			socket.on('disconnect', function(){
				console.log('Socket disconnect: ',socket_id);
				// if(accept_connect) ConnectMgr.DelConnect(user_id);
			});
		// }
		// catch(ex){
		// 	logger.error(ex.task);
		// }
	});
}

process.on('SIGINT', function () {
	redis_client.unref();
	mongoose.connection.close(function () {
		process.exit(0);
	});
});