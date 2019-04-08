'use strict';

const logger = require('tracer').colorConsole();
const async = require('async');
const util = require('../util/util');
const utilModule = require('util');
// let ExamModel = require('../model/ExamModel');
// let UserExamModel = require('../model/UserExamModel');
// let ScoreModel = require('../model/ScoreModel');
const config = require('../config/config');
const RabbitMq = require('../services/RabbitMq');

function SocketClient(io,socket,redis,DbUtil,process_send){
	const session = socket.client.request.session_data;
	let is_end_game = false;
	const user_info = session.user;
	const user_id = user_info._id;

	const test = session.test;
	const round_id = session.round_id;
	const type_id = session.type_id;
	// let game_id = session.game_id;
	const isFree = type_id !== 4;
	const code = socket.code;

	// let user_exam_id;
	let score;
	let total_time;

	let t_endgame;

	//this.session = session;
	//this._id = session.user._id;
	//this.socket = socket;
	//this.io = io;
	//logger.error('cookie socket:',socket.request.headers.cookie);
	//let self = this;
	//let is_servicing = true;

	const redis_key = config.redis_key;
	const objKey = config.redis_key.score_user;

	//is_user_play_exam_<user_id>
	// let key_is_user_play_exam = utilModule.format(redis_key.is_user_play_exam, user_id);

	//user_play_exam_<user_id>
	let key_user_play_exam = utilModule.format(redis_key.user_play_exam, user_id);

	//list_correct_exam_<user_id>
	let key_list_correct_exam = utilModule.format(redis_key.list_correct_exam, user_id);

	//score_user_<type_id>_<round_id>_<user_id>
	let key_score_user = utilModule.format(objKey.hash, type_id, round_id, user_id);

	socket.on('getdata', function(data_req,result_callback){
		// if(!is_servicing){
		// 	return;
		// }
		let response = {};
		//logger.error('getdata-data',data);
		async.waterfall([
			function(callback){
				redis.ttl(key_user_play_exam,function(err,second){
					if(err){
						logger.error(err);
						callback(true,null);
					}
					else{
						//logger.error('second',second);
						if(second>0 && second-3>0){
							second-=3;
							//get old exam
							async.waterfall([
								function(callback){
									// redis.hmget(key_user_play_exam,['type_id','class_id','round_id','test','score','wrongCount','currentIndex','time','user_exam_id'],function(err,result){
									redis.hmget(key_user_play_exam,['type_id','class_id','round_id','test','score','wrongCount','currentIndex','time','user_exam_info'],function(err,result){
										if(err){
											response.error=30000;
											response.message='Server đang bận, vui lòng thử lại sau';
											callback(true,null);
										}
										else{
											if(result && result.length>0){
												let data={};
												data.type_id=result[0];
												data.class_id=result[1];
												data.round_id=result[2];
												data.test=result[3];
												data.score=result[4];
												data.wrongCount=result[5];
												data.currentIndex=result[6];
												data.time=result[7];
												// user_exam_id = data.user_exam_id = result[8];
												data.exam_content = result[8]?JSON.parse(result[8]):[];
												callback(false,data);
											}
											else{
												response.error=30000;
												response.message='Server đang bận, vui lòng thử lại sau';
												callback(true,null);
											}
										}
									});
								},
								function(data,callback){
									response.data={
										play: 10,
										content: data.exam_content,
										time: data.time,
										timeLeft: second,
										currentIndex: data.currentIndex,
										wrongCount: data.wrongCount,
										currentScore: parseInt(data.score)
									};
									response.error=0;
									response.message='done';
									callback(false,null);
								},
								function(data,callback){
									//set auto end game
									if(!isFree){
										process_send({action:'clear_timeout',user_id:user_id});
										process_send({
											action:'set_timeout',
											type_id:type_id,
											round_id:round_id,
											test:test,
											user_id:user_id,
											timeout:second,
											user_info:user_info
										});
									}
									callback(false,data);
								}
							],
							function(){
								callback(true,null);
							});
							//end get old exam
						}
						else{
							//get new exam
							let data = {};
							callback(false,data);
						}
					}
				});
			},
			//get new exam
			function(data,callback){
				DbUtil.GetExamInfo(type_id,user_info.class_id,round_id,test,function(err,exam_info){
					if(err){
						logger.error(err);
						response.error=20000;
						response.message='Server đang bận, vui lòng thử lại sau';
						callback(true,null);
					}
					else{
						if(exam_info){
							let data_result = exam_info;

							//trộn đề
							let question = util.RandomListArray(exam_info.content,exam_info.answers,exam_info.play);

							if(question!=null){
								data.exam_info = exam_info;
								data.arr_answer = question.list_2;
								data.content = data_result.content = question.list_1;
								data_result.timeLeft = data_result.time;
								data_result.currentIndex=0;
								data_result.wrongCount=0;
								data_result.answers=undefined;

								//result_callback({error:0,message:'done',data:data_result});//=>user play
								response.data = data_result;
								callback(false,data);

								// log
								RabbitMq.publish('history-exam', {
									action: 'addQuestion',
									info: {
										user_id,
										round_id,
										test_id: test,
										game_id: 2,
										questions: data.content,
										answers_correct: data.arr_answer,
										answers_user: []
									}
								});
							}
							else{
								//đề lỗi
								response.error=50;
								response.message='Xin lỗi <br/> đề lỗi hãy báo lại với ban quản trị';
								callback(true,data);
							}
						}
						else{
							//không có bài thi cho vòng này
							response.error=50;
							response.message='không có bài thi cho vòng này';
							callback(true,data);
						}
					}
				});
			},
			//set key_score_user
			function(data,callback){
				if(test==1){
					//clear data score
					redis.hkeys(key_score_user,function(err,list_key){
						if(list_key && list_key.length>0){
							for(let i=0;i<list_key.length;i++){
								let key = list_key[i];
								if(key!=objKey.luot){
									redis.hdel(key_score_user,key);
								}
							}
						}
					});
					//HINCREBY score_user_<type_id>_<round>_<user_id> luot 1
					redis.hincrby(key_score_user,objKey.luot,1);//tăng lượt thi của vòng
				}
				//HMSET score_user_<type_id>_<round>_<user_id> score_<test> 0 total_time_<test> <time_exam> wrong_<test> 0
				redis.hmset(key_score_user,
					objKey.score + test, 0,
					objKey.total_time + test, data.exam_info.time,
					objKey.wrong + test, 0
				);
				callback(false,data);
			},
			//DEL list_correct_exam_<user_id>
			function(data,callback){
				redis.del(key_list_correct_exam,function(err){
					if(err){
						response.error=30000;
						response.message='Server đang bận, vui lòng thử lại sau';
						callback(true,null);
					}
					else{
						callback(false,data);
					}
				});
			},
			//RPUSH list_correct_exam_<user_id> [arr_answer]
			function(data,callback){
				let multi = redis.multi();
				let arr_answer = data.arr_answer;
				for (let i=0; i<arr_answer.length; i++) {
					multi.rpush(key_list_correct_exam, arr_answer[i]);
				}
				multi.exec(function(errors, results) {
					if(errors){
						response.error=30000;
						response.message='Server đang bận, vui lòng thử lại sau';
						callback(true,null);
					}
					else{
						//set expire key: list_correct_exam_<user_id>
						//PEXPIRE list_correct_exam_<user_id> <time_exam>
						redis.pexpire(key_list_correct_exam,(data.exam_info.time+3) * 1000);
						callback(false,data);
					}
				});
			},
			//save info playing user exam - user_play_exam_<user_id>
			function(data,callback){
				//HMSET user_play_exam_<user_id> type_id <type_id> class_id <user.class_id> round_id <round_id> test <test> score 0 wrongCount 0 currentIndex 0 time <time_exam> user_exam_id <user_exam_id>
				// redis.hmset(key_user_play_exam,'type_id',type_id,'class_id',session.user.class_id,'round_id',round_id,'test',test,'score',0,'wrongCount',0,'currentIndex',0,'time',data.exam_info.time,'user_exam_id',data.user_exam_id,function(err,result){
				redis.hmset(key_user_play_exam,'type_id',type_id,'class_id',session.user.class_id,'round_id',round_id,'test',test,'score',0,'wrongCount',0,'currentIndex',0,'time',data.exam_info.time,'user_exam_info',JSON.stringify(data.content),function(err,result){
					if(err){
						response.error=30000;
						response.message='Server đang bận, vui lòng thử lại sau';
						callback(true,null);
					}
					else{
						//set expire key: user_play_exam_<user_id>
						//PEXPIRE user_play_exam_<user_id> <time_exam>
						redis.pexpire(key_user_play_exam,(data.exam_info.time + 3) * 1000);
						response.error=0;
						response.message='done';
						callback(false,data);

						if(!isFree){
							process_send({action:'clear_timeout',user_id:user_id});
							process_send({
								action:'set_timeout',
								type_id:type_id,
								round_id:round_id,
								test:test,
								user_id:user_id,
								timeout:data.exam_info.time,
								user_info:user_info
							});
						}
					}
				});
			}
		],
		function(errs,results){
			result_callback(response);
		});
	});

	socket.on('submitAnswer', function(data_req,result_callback){
		try{
			let response = {};
			//HINCRBY user_play_exam_<user_id> currentIndex 1
			redis.hincrby(key_user_play_exam,'currentIndex',1,function(err,index){
				if(err){
					logger.error(err);
					response.error=30000;
					response.message='Server đang bận, vui lòng thử lại sau';
					callback(true,null);
				}
				else{
					//LPOP list_correct_exam_<user_id>
					redis.lpop(key_list_correct_exam,function(err, result) {
						if(err){
							logger.error(err);
							response.error=30000;
							response.message='Server đang bận, vui lòng thử lại sau';
							callback(true,null);
						} else {
							let is_correct = false;

							if(data_req.answer!=null && data_req.answer!=undefined && result!=undefined && data_req.answer.toLocaleLowerCase() == result.toLocaleLowerCase()){
								is_correct = true;
								result_callback(is_correct);
								//HINCRBY user_play_exam_<user_id> score 10
								redis.hincrby(key_user_play_exam,'score',10);
							} else {
								is_correct = false;
								result_callback(is_correct);
								redis.hincrby(key_user_play_exam,'wrongCount',1);
							}

							// log
							RabbitMq.publish('history-exam', {
								action: 'pushAnswers',
								user_id,
								round_id,
								test_id: test,
								answer: {
									user: data_req &&  data_req.answer? data_req.answer: '',
									correct: result? result.toLocaleLowerCase(): '',
									is_correct
								}
							});
						}
					});
				}
				if(index==10){
					end_game();
				}
			});
		}
		catch(err){
			//result_callback(false);
			logger.error("[TVUB] error =>>>",err);
		}
	});

	function end_game(){
		if(!is_end_game){
			is_end_game = true;
		}
		else return;

		if(t_endgame){
			clearTimeout(t_endgame);
			t_endgame = undefined;
		}
		let data_result = {};
		data_result.round_id = round_id;
		async.waterfall([
			function(callback){
				redis.ttl(key_user_play_exam,function(err,second){
					if(err){
						logger.error(err);
						callback(true,null);
					}
					else{
						let data = {};
						data_result.timeLeft = data.timeLeft = second>0? second-3:0;
						callback(false,data);
					}
				});
			},
			//get data from redis
			function(data,callback){
				// redis.hmget(key_user_play_exam,['score','wrongCount','time','user_exam_id'],function(err,result){
				redis.hmget(key_user_play_exam,['score','wrongCount','time'],function(err,result){
					if(err){
						logger.error(err);
						callback(true,null);
					}
					else{
						if(result && result.length>0){
							score = data.score = data_result.score=result[0]?parseInt(result[0]):0;
							data.wrongCount = data_result.wrongCount=result[1]?result[1]:0;
							total_time = data_result.time = data.time = result[2]? parseInt(result[2]): 1200;
							// data.user_exam_id=result[3];//user_exam_id
							callback(false,data);
						}
					}
				});
			},
			//update score round
			function(data, callback){
				//HMSET score_user_<type_id>_<round>_<user_id> score_<test> <score> total_time_<test> <total_time> wrong_<test> wrongCount
				redis.hmset(key_score_user,
						objKey.score + test, data.score,
						objKey.total_time + test, (total_time-data.timeLeft),
						objKey.wrong + test, data.wrongCount
					);
				callback(false,data);
			},
			//update score to rank
			function(data,callback){
				//update time
				redis.hset(key_score_user,objKey.total_time + test,(data.time-data.timeLeft));

				if(test == 3){
					DbUtil.UpdateScoreRank(user_info.province_id,user_info.district_id,user_info.school_id,type_id,round_id,user_info.class_id,user_id,code,function(err,data_round){
						if(err) logger.error(err);
						else{
							if(data_round.total_score>=150){
								data_result.pass_round= true;
								data_result.next_url='../vong-' + (round_id+1) + '/bai-1';

								//DEL score_user_<type_id>_<round_id>_<user_id>
								redis.del(key_score_user);
							}
							else{
								data_result.pass_round= false;
							}
							data_result.data_round = data_round;
						}
						callback(false,data);
					});
				}
				else{
					data_result.next_url='bai-' + (test+1);
					callback(false,data);
				}
			}
		],
		function(){
			socket.emit('onEnd',data_result);

			//DEL list_correct_exam_<user_id>
			redis.del(key_list_correct_exam);

			//user_play_exam_<user_id>
			redis.del(key_user_play_exam);

			socket.disconnect();
			if(!isFree) process_send({action:'clear_timeout',user_id:user_id});

			// log
			RabbitMq.publish('history-exam', {
				action: 'Update',
				user_id,
				round_id,
				test_id: test,
				info: {
					score: data_result.score,
					time: data_result.time - data_result.timeLeft
				}
			});
		});
	}

	socket.on('onEnd', function(data_req,callback){
		try{
			//logger.error('data_req',data_req,user_exam_id);
			callback({error:0, message: 'done'});
			end_game();
		}
		catch(e){
			logger.error(e);
		}
	});
}

module.exports = SocketClient;