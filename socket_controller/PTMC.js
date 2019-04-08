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
	const user_info = session.user;
	const user_id = user_info._id;

	let is_end_game = false;

	const test = session.test;
	const round_id = session.round_id;
	const type_id = session.type_id;
	// let game_id = session.game_id;
	const isFree = type_id !== 4;
	const code = socket.code;

	// let user_exam_id;
	let score;
	let total_time;
	let answers_count;

	let t_endgame;

	const redis_key = config.redis_key;
	const objKey = config.redis_key.score_user;

	//is_user_play_exam_<user_id>
	// let key_is_user_play_exam = utilModule.format(redis_key.is_user_play_exam, user_id);

	//user_play_exam_<user_id>
	let key_user_play_exam = utilModule.format(redis_key.user_play_exam, user_id);

	//list_correct_exam_<user_id>
	let key_list_correct_exam = utilModule.format(redis_key.list_correct_exam, user_id);

	//list_current_answers_<user_id>
	let key_list_current_answers = 'list_current_answers_' + user_id;

	//score_user_<type_id>_<round_id>_<user_id>
	let key_score_user = utilModule.format(objKey.hash, type_id, round_id, user_id);

	socket.on('getdata', function(data_req,result_callback){
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
						if(second-3>0){
							second-=3;
							//get old exam
							async.waterfall([
								function(callback){
									//redis.hmget(key_user_play_exam,['type_id','class_id','round_id','test','score','wrongCount','currentIndex','time','user_exam_id'],function(err,result){
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
								//get list current answers
								function(data,callback){
									redis.smembers(key_list_current_answers,function(err,list_answers){
										if(err){
											response.error=30000;
											response.message='Server đang bận, vui lòng thử lại sau';
											callback(true,null);
										}
										else{
											data.currentAnswers = list_answers;
											callback(false,data);
										}
									});
								},
								//select exams
								function(data,callback){
									response.data={
										play: 10,
										content: data.exam_content,
										time: data.time,
										timeLeft: second,
										currentIndex: data.currentIndex,
										wrongCount: data.wrongCount,
										currentScore: parseInt(data.score),
										currentAnswers: data.currentAnswers
									};
									response.error=0;
									response.message='done';
									callback(false,data);
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
							let collection_answers = [];
							let collection_index = [];

							let contents = util.RandomArray(exam_info.content,exam_info.play);
							for(let i = 0; i <contents.length;i++){
								collection_answers = collection_answers.concat(contents[i]);
								for(let j=0;j<2;j++){//2=contents[i].length
									collection_index.push(i);
								}
							}
							let questions = util.RandomListArray(collection_answers,collection_index,collection_answers.length);
							answers_count = collection_answers.length;
							if(questions!=null){
								let data_result = {};
								data.content = data_result.content=questions.list_1;
								data_result.timeLeft  = data_result.time = exam_info.time;
								data_result.currentAnswers=[];
								data_result.currentScore=0;
								data_result.play = exam_info.play;

								data.exam_info = exam_info;
								data.arr_answer = questions.list_2;
								// logger.error(questions.list_2);
								//data.content = data_result.content = question.list_1;

								data_result.currentIndex=0;
								data_result.wrongCount=0;
								//data_result.answers=undefined;

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
										game_id: 4,
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
			// //save to user exam
			function(data,callback){
				//DEL list_correct_exam_<user_id>
				redis.del(key_list_correct_exam);
				//DEL list_current_answers_<user_id>
				redis.del(key_list_current_answers);
				callback(false,data);
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
				//redis.hmset(key_user_play_exam,'type_id',type_id,'class_id',session.user.class_id,'round_id',round_id,'test',test,'score',0,'wrongCount',0,'currentIndex',0,'time',data.exam_info.time,'user_exam_id',data.user_exam_id,function(err,result){
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

						//set timeout auto end game
						// t_endgame = setTimeout(function(){
						// 	logger.trace('[PTMC] auto end game');
						// 	end_game();
						// },data.exam_info.time*1000);
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
			//logger.error(data_req);
			if(util.isOnlyNumber(data_req.index_1) && util.isOnlyNumber(data_req.index_2)){
				let index_1 = parseInt(data_req.index_1);
				let index_2 = parseInt(data_req.index_2);
				if(index_1 >= 0 && index_2>=0){
					let response = {};
					async.waterfall([
						function(callback){
							//SISMEMBER list_current_answers_<user_id> <index_1>
							redis.sismember(key_list_current_answers,index_1,function(err,is_exist){
								if(err){
									logger.error(err);
									response.error=30000;
									response.message='Server đang bận, vui lòng thử lại sau';
									callback(true,null);
								}
								else{
									if(is_exist==0){
										let data = {};
										callback(false,data);
									}
									else{
										response.value = false;
										callback(true,null);
									}
								}
							});
						},
						function(data,callback){
							//SISMEMBER list_current_answers_<user_id> <index_2>
							redis.sismember(key_list_current_answers,index_2,function(err,is_exist){
								if(err){
									logger.error(err);
									response.error=30000;
									response.message='Server đang bận, vui lòng thử lại sau';
									callback(true,null);
								}
								else{
									if(is_exist==0){
										callback(false,data);
									}
									else{
										response.value = false;
										callback(true,null);
									}
								}
							});
						},
						function(data,callback){
							//lindex list_correct_exam_<user_id>
							redis.lindex(key_list_correct_exam,index_1,function(err,result){
								if(err){
									logger.error(err);
									response.error=30000;
									response.message='Server đang bận, vui lòng thử lại sau';
									callback(true,null);
								}
								else{
									data.value_1=result;
									callback(false,data);
								}
							});
						},
						function(data,callback){
							//lindex list_correct_exam_<user_id>
							redis.lindex(key_list_correct_exam,index_2,function(err,result){
								if(err){
									logger.error(err);
									response.error=30000;
									response.message='Server đang bận, vui lòng thử lại sau';
									callback(true,null);
								}
								else{
									data.value_2=result;
									callback(false,data);
								}
							});
						},
						function(data,callback){
							if(data.value_1 == data.value_2){
								//HINCRBY user_play_exam_<user_id> score 10
								redis.hincrby(key_user_play_exam,'score',10,function(err,score){
									if(err) logger.error(err);
									else if(score==100) end_game();
								});

								//SADD list_current_answers_<user_id> <index_1>
								redis.sadd(key_list_current_answers,index_1)
								//SADD list_current_answers_<user_id> <index_2>
								redis.sadd(key_list_current_answers,index_2,function(){
									redis.scard(key_list_current_answers,function(err,count){
										if(answers_count==count){
											logger.trace('[PTMC] end game hết câu hỏi');
											end_game();
										}
									});
								});
								response.value = true;
								callback(false,data);
							}
							else{
								redis.hincrby(key_user_play_exam,'wrongCount',1,function(err,err_count){
									if(err_count>=4){
										logger.trace('[PTMC] end game lỗi >= 4');
										end_game();
									}
								});
								response.value = false;
								callback(false,data);
							}
						}
					],
					function(){
						result_callback(response);

						// log
						RabbitMq.publish('history-exam', {
							action: 'pushAnswers',
							user_id,
							round_id,
							test_id: test,
							answer: {
								index_1,
								index_2,
								is_correct: response.value
							}
						});
					});
				}
			}
		}
		catch(ex){
			logger.error(ex);
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

			redis.del(key_list_current_answers);
			socket.disconnect();
			if(!isFree) process_send({action:'clear_timeout',user_id:user_id});

			// log
			console.log(data_result);
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

	socket.on('disconnect', function(){
		if(t_endgame){
			clearTimeout(t_endgame);
		}
	});
}

module.exports = SocketClient;