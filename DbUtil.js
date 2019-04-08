'use strict';
let logger = require('tracer').colorConsole();
let async = require('async');
let utilModule = require('util');
const util = require('./util/util');
let UsersModel = require('./model/UsersModel');
let ExamModel = require('./model/ExamModel');
let UserExamModel = require('./model/UserExamModel');
let ScoreModel = require('./model/ScoreModel');
let ParamsModel = require('./model/ParamsModel');
let NewsModel = require('./model/NewsModel');
let LessonModel = require('./model/LessonModel');

let ProvinceModel = require('./model/ProvinceModel');
let DestrictModel = require('./model/DistrictModel');
let SchoolModel = require('./model/SchoolModel');

let GameTypeModel = require('./model/GameTypeModel');
let GameModel = require('./model/GameModel');

let VideoTypeModel = require('./model/VideoTypeModel');
let VideoModel = require('./model/VideoModel');

let ExamEventModel = require('./model/ExamEventModel');
let ExamEventTypeModel = require('./model/ExamEventTypeModel');
let UserScoreEventRankModel = require('./model/UserScoreEventRankModel');
let config = require('./config/config');

function DbUtil(redis){
	this.redis = redis;
	// this.LoadListParam();
	// this.LoadListUser();
}

DbUtil.prototype.GetType = function(type_id) {
	if(type_id == 1) return 'Luyện tập Toán';
	if(type_id == 2) return 'Luyện tập English';
	if(type_id == 3) return 'Luyện Tiếng Việt';
	if(type_id == 4) return 'Tiếng Việt';
};

DbUtil.prototype.GetJsGame = function(game_id) {
	if(game_id == 1) {
		return '<script src="https://static.trangnguyen.edu.vn/game/CVTB/scripts/boot.js"></script><script src="https://static.trangnguyen.edu.vn/game/CVTB/scripts/preload.js"></script><script src="https://static.trangnguyen.edu.vn/game/CVTB/scripts/home.js"></script><script src="https://static.trangnguyen.edu.vn/game/CVTB/scripts/game.js"></script><script src="https://static.trangnguyen.edu.vn/game/CVTB/scripts/end.js"></script><script src="https://static.trangnguyen.edu.vn/socket.io/socket.io.js"></script><script src="https://static.trangnguyen.edu.vn/game/CVTB/scripts/play.js?v=1.1"></script>';
	} else if(game_id == 2) {
		return '<script src="https://static.trangnguyen.edu.vn/game/TVUB/scripts/boot.js"></script><script src="https://static.trangnguyen.edu.vn/game/TVUB/scripts/preload.js"></script><script src="https://static.trangnguyen.edu.vn/game/TVUB/scripts/home.js"></script><script src="https://static.trangnguyen.edu.vn/game/TVUB/scripts/game.js"></script><script src="https://static.trangnguyen.edu.vn/game/TVUB/scripts/end.js"></script><script src="/socket.io/socket.io.js"></script><script src="https://static.trangnguyen.edu.vn/game/TVUB/scripts/play.js?v=1.1"></script>';
	} else if(game_id == 4) {
		return '<script src="https://static.trangnguyen.edu.vn/game/PTMC/scripts/boot.js"></script><script src="https://static.trangnguyen.edu.vn/game/PTMC/scripts/preload.js"></script><script src="https://static.trangnguyen.edu.vn/game/PTMC/scripts/home.js"></script><script src="https://static.trangnguyen.edu.vn/game/PTMC/scripts/game.js"></script><script src="https://static.trangnguyen.edu.vn/game/PTMC/scripts/end.js"></script><script src="/socket.io/socket.io.js"></script><script src="https://static.trangnguyen.edu.vn/game/PTMC/scripts/play.js?v=1.1"></script>';
	} else {
		return '<script>$(function(){TN_POPUP.show(\'Game này không có hoặc đang phát triển\');});</script>';
	}
};

DbUtil.prototype.GetCookie = function(session_id,callback){
	let key = 'sess:' + session_id;
	this.redis.get(key,function(err,data){
		if(callback) callback(err,data?JSON.parse(data):null);
	});
};

//********************************user*************************************//
DbUtil.prototype.LoadListUser = function(callback_result){
	callback_result(true);
	let self = this;

	// let key = config.redis_key.list_user;
	UsersModel.count({
		deleted: false,
		banned: false,
		active: true
	},function(err,count){
		if(err) {
			logger.error(err,count);
			if(callback_result) callback_result(err, false);
		} else {
			self.redis.set(config.redis_key.count_member, count + 336850 + 766378 + 4932);
			// if(count){
			// 	let page_size = 20000;
			// 	let page_count = Math.floor(count / page_size);
			// 	if(count % page_size!=0) page_count++;
			// 	let i = 0;
			// 	load();
			// 	function load(){
			// 		loadData(i,page_size,function(page){
			// 			i++;
			// 			if(i<page_count-1){
			// 				// console.log('i = %d | page_size = %d => next',i,page_count);
			// 				load();
			// 			}
			// 			else{
			// 				// console.log('i = %d | page_size = %d => end',i,page_count);
			// 				if(callback_result) callback_result(null,true);
			// 			}
			// 		});
			// 	}

			// 	function loadData(page_index,page_size,callback){
			// 		UsersModel.find()
			// 		.select('username')
			// 		.skip(page_index*page_size)
			// 		.limit(page_size)
			// 		.exec(function(err,list_users){
			// 			if(err){
			// 				logger.error(err);
			// 				callback(page_index);
			// 			}
			// 			else{
			// 				if(list_users && list_users.length>0){
			// 					let arr = [];
			// 					let length = list_users.length;
			// 					for(let i=0;i<length;i++){
			// 						arr.push(list_users[i].username);
			// 					}
			// 					//self.redis.sadd(key,arr,function(error, result) {
			// 					addList(arr,function(error, result){
			// 						if(error){
			// 							// logger.error('[USER] load list error!');
			// 							callback(page_index);
			// 						}
			// 						else{
			// 							// logger.info('[USER] load list done!');
			// 							callback(page_index);
			// 						}
			// 					});
			// 				}
			// 			}
			// 		});
			// 	}
			// 	function addList(arr,callback){
			// 		self.redis.sadd(key,arr,function(error, result) {
			// 			if(callback) callback(error,result);
			// 		});
			// 	}
			// }
			// else{
			// 	if(callback_result) callback_result(null,true);
			// }
		}
	});
};

DbUtil.prototype.CheckExistsUser = function(username, callback){
	// let key = config.redis_key.list_user;
	// this.redis.sismember(key,username,function(error, result) {
	// 	if(error){
	// 		logger.error(error);
	// 		if(callback) callback(error,null);
	// 	}
	// 	else{
	// 		if(callback) callback(null,result>0);
	// 	}
	// });

	UsersModel.count({username}, function(err, count) {
		if(callback) callback(null, count > 0);
	});
};

DbUtil.prototype.AddListUser = function(username, callback) {
	// let key = config.redis_key.list_user;
	// this.redis.sadd(key,username,function(error, result) {
	// 	if(error){
	// 		logger.error(err);
	// 		if(callback) callback(false);
	// 	}
	// 	else{
	// 		if(callback) callback(true);
	// 	}
	// });
	if(callback) callback(true);
};

DbUtil.prototype.CheckActive = function(user_id, callback) {
	let self = this;
	let key = 'use_active_' + user_id;
	self.redis.get(key, function(err, value) {
		if (err) {
			if (callback) callback(err, value);
		} else {
			if (value) {
				if (callback) callback(null, value == 'true');
			} else {
				get_data(user_id, function (err, info) {
					if(err) callback(err, info);
					else{
						if(info) {
							callback(err, info.active);
							self.redis.set(key, info.active, 'EX', 60); //30s
						} else {
							callback(err, false);
						}
					}
				});
			}
		}
	});
	function get_data(user_id, callback) {
		UsersModel.findOne({
			_id: user_id,
			deleted: false
		})
		.select('active')
		.exec((err,info) => {
			callback(err,info);
		});
	}
};

DbUtil.prototype.GetUserActive = function(user_id, callback) {
	UsersModel.findOne({
		_id: user_id,
		deleted: false
	})
	.select('_id username active mobile vip_expire')
	.exec((err, info) => {
		callback(err,info);
	});
};

DbUtil.prototype.CountMobile = function(mobile, callback) {
	UsersModel.count({mobile}, function(err, count) {
		callback(err, count);
	});
};

DbUtil.prototype.getUserByMobile = async (mobile) => {
	return await UsersModel.findOne({deleted: false, mobile}).select('_id username banned active').exec();
};

DbUtil.prototype.changePassword = async (id, password) => {
	return await UsersModel.update({
		deleted: false,
		_id: id
	}, {
		$set: {
			password
		}
	}, {
		multi: false,
		upsert: false
	});
};

DbUtil.prototype.GetVip = function(user_id, callback) {
	UsersModel.findOne({
		_id: user_id,
		deleted: false
	})
	.select('vip_expire')
	.exec(function(err, info) {
		if(err) {
			if(callback) callback(err, null);
		} else {
			if(callback) {
				if(info) callback(null, info.vip_expire);
				else callback(null, null);
			}
		}
	});
};

DbUtil.prototype.SetVip = function(user_id, vip_expire, callback) {
	UsersModel.update({
		_id: user_id,
		deleted: false
	}, {
		$set: {vip_expire: vip_expire}
	}, {
		multi: false,
		upsert: false
	}, function(err, info) {
		if(err){
			if(callback) callback(err, null);
		} else {
			if(callback) {
				if(info) callback(null, info);
				else callback(null, null);
			}
		}
	});
};

// DbUtil.prototype.AddVip = function(user_id,vip_expire,callback){
// 	UsersModel.db.db.eval('AddVipDay('+user_id+','+vip_expire+')',function(err){
// 		if(err){
// 			logger.error(err);
// 		}
// 		if(typeof callback ==='function') callback(err, true);
// 	});
// };

DbUtil.prototype.AddVip = function(user_id, vip_day, callback) {
	let self = this;
	self.GetVip(user_id, function(err, vip_expire) {
		if(err) {
			logger.error(err);
			callback(err, null);
		} else {
			let expire_day,today = new Date();
			if(vip_expire) {
				if(vip_expire - today > 0) {
					expire_day = vip_expire.setDate(vip_expire.getDate() + vip_day);
				} else {
					expire_day = today.setDate(today.getDate() + vip_day);
				}
			} else {
				expire_day = today.setDate(today.getDate() + vip_day);
			}
			expire_day = new Date(expire_day);
			self.SetVip(user_id, expire_day, function(err, data_result) {
				callback(err, data_result);
			});
		}
	});
};

DbUtil.prototype.GetRank = function(type_id, list_user_id ,callback) {
	let self = this;
	let key = 'list_user_rank_' + type_id + '_';
	let key_list = key + list_user_id.join(',');

	self.redis.get(key_list, function(err, list_users) {
		if(err){
			if(callback) {
				get_data(list_user_id, function(err, list_users) {
					callback(err, list_users);
				});
			}
		} else {
			if(list_users) {
				if(callback) callback(null, JSON.parse(list_users));
			} else {
				get_data(list_user_id, function(err, list_users) {
					if(callback) callback(err, list_users);
					if(list_users) {
						self.redis.set(key_list, JSON.stringify(list_users));
					}
				});
				self.redis.keys(key + '*', function (err, keys) {
					if (err) return logger.error(err);
					for(let i = 0, len = keys.length; i < len; i++) {
						self.redis.del(keys[i]);
					}
				});
			}
		}
	});

	function get_data(list_user_id, callback) {
		UsersModel.find({
			_id:{
				'$in':list_user_id
			},
			deleted: false,
			active: true
		})
		.select('_id name class_id school_name')
		.exec(function(err,list_user_info){
			if(err) {
				callback(err, null);
			} else {
				if(list_user_info && list_user_info.length > 0)
					callback(null, list_user_info);
				else
					callback(null, true);
			}
		});
	}
};

DbUtil.prototype.CountRankUsers = function(callback) {
	let self = this;
	let key = 'count-rank';
	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) callback(JSON.parse(data_cache));
		} else {
			if(data_cache) {
				if(callback) callback(JSON.parse(data_cache));
			} else {
				get_data(function(jMessage) {
					if(callback) callback(jMessage);
					if(jMessage) {
						self.redis.set(key, JSON.stringify(jMessage), 'EX', 3600);//3600s
						// self.redis.pexpire(key,3600000);//3600s
					}
				});
			}
		}
	});

	function get_data(callback_data) {
		let jMessage = {};
		async.parallel([
			function(callback) {
				// mongoose.connection.db.eval("count_top_province(5)",function(err,list){
				/*UsersModel.db.db.eval("count_top_province(8)",function(err,list){
					if(err){
						logger.error(err);
					}
					else{
						// logger.info(list);
						jMessage.count_top_province = list._batch?list._batch:list._firstBatch;
					}
					callback(err, true);
				});*/
				UsersModel.aggregate([
					{
						$match: {
							active: true,
							banned: false
						}
					},{
						$group: {
							_id:{
								province_id: "$province_id",
								province_name: "$province_name"
							},
							count: {$sum: 1}
						}
					},{
						$sort:{count:-1}
					},
					{
						$limit: 8
					}
				], (err, results) => {
					if(err) {
						logger.error(err);
					}
					else{
						jMessage.count_top_province = results;
					}
					callback(err, true);
				});
			},
			function(callback) {
				// mongoose.connection.db.eval("count_top_school(5)",function(err,list){
				/*UsersModel.db.db.eval("count_top_school(8)",function(err,list){
					if(err){
						logger.error(err);
					}
					else{
						// logger.info(list);
						jMessage.count_top_school = list._batch?list._batch:list._firstBatch;
					}
					callback(err, true);
				});*/
				UsersModel.aggregate([
					{
						$match: {
							active: true,
							banned: false
						}
					},{
						$group: {
							_id:{
								school_id: "$school_id",
								school_name: "$school_name"
							},
							count: {$sum: 1}
						}
					},{
						$sort:{count:-1}
					},
					{
						$limit: 8
					}
				], (err,results) => {
					if(err){
						logger.error(err);
					}
					else{
						jMessage.count_top_school = results;
					}
					callback(err, true);
				});
			},
			function(callback) {
				// mongoose.connection.db.eval("count_top_class()",function(err,list){
				/*UsersModel.db.db.eval("count_top_class()",function(err,list){
					if(err){
						logger.error(err);
					}
					else{
						jMessage.count_top_class = list._batch?list._batch:list._firstBatch;
					}
					callback(err, true);
				});*/
				UsersModel.aggregate([
					{
						$match: {
							active: true,
							banned: false
						}
					},{
						$group: {
							_id:"$class_id",
							count: {$sum: 1}
						}
					}
				], (err,results)=>{
					if(err){
						logger.error(err);
					}
					else{
						jMessage.count_top_class = results;
					}
					callback(err, true);
				});
			}
		],
		function(){
			jMessage.error = 0;
			jMessage.message = 'ok';
			callback_data(jMessage);
		});
	}
};

DbUtil.prototype.GetCurrentRound = function(id,type_id,callback){
	let self = this;
	let key = utilModule.format(config.exam.user_current_round, id, type_id);

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(id, type_id, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, data_cache);
			} else {
				get_data(id, type_id, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, data_db, 'EX', 120);//120s
						// self.redis.pexpire(key,120000);//120s
					}
				});
			}
		}
	});

	function get_data(id, type_id, callback) {
		UsersModel.findOne({
			_id: id,
			deleted: false
		})
		.select('current_round_' + type_id)
		.exec(function(err, info) {
			if(err) {
				if(callback) callback(err, null);
			} else {
				if(callback) {
					if(info) {
						callback(null, info['current_round_' + type_id]);
					} else {
						callback(null, null);
					}
				}
			}
		});
	}
};

DbUtil.prototype.UpdateCurrentRound = function(id, type_id) {
	let self = this;
	let key = utilModule.format(config.exam.user_current_round, id, type_id);
	self.redis.del(key);
};

DbUtil.prototype.CountTopProvince = function(callback) {
	let self = this;
	let key = 'count_top_province';

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db), 'EX', 3600);//3600s
						// self.redis.pexpire(key,3600000);//3600s
					}
				});
			}
		}
	});

	function get_data(callback){
		// ScoreModel.db.db.eval("count_top_province(100)",function(err,list){
		// 	if(err){
		// 		if(callback) callback(err,null);
		// 	}
		// 	else{
		// 		if(callback) callback(err,list._batch?list._batch:list._firstBatch);
		// 	}
		// });
		UsersModel.aggregate([
			{
				$match: {
					active: true,
					banned: false
				}
			},{
				$group: {
					_id:{
						province_id: "$province_id",
						province_name: "$province_name"
					},
					count: {$sum: 1}
				}
			},{
				$sort:{count: -1}
			}
		], (err,results) => {
			if(err){
				logger.error(err);
			}
			else{
				if(callback) callback(err, results);
			}
		});
	}
};

DbUtil.prototype.CountTopDistrict = function(province_id, callback) {
	let self = this;
	let key = 'rank_count_top_district-' + province_id;

	self.redis.get(key,function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(province_id, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db), 'EX', 1800);//1800s
						// self.redis.pexpire(key,1800000);//1800s
					}
				});
			}
		}
	});

	function get_data(province_id, callback) {
		/*ScoreModel.db.db.eval("rank_count_top_district(" + province_id + ")",function(err,list){
			if(err){
				logger.error(err);
			}
			else{
				if(callback) callback(err,list._batch?list._batch:list._firstBatch);
			}
		});*/
		UsersModel.aggregate([
			{
				$match: {
					province_id: province_id,
					active: true,
					banned: false
				}
			},{
				$group: {
					_id:{
						id: "$district_id",
						name: "$district_name"
					},
					count: {$sum: 1}
				}
			}
		],(err, results) => {
			callback(err, results);
		});
	}
};

DbUtil.prototype.TopScoreClass = function(class_id, top, callback) {
	let self = this;
	let key = 'top_score_class-' + class_id + '-' + top;

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(class_id, top, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				if(callback) {
					get_data(class_id, top, function(err, data_db) {
						callback(err, data_db);
						if(data_db) {
							self.redis.set(key, JSON.stringify(data_db), 'EX', 1800);//1800s
							// self.redis.pexpire(key,1800000);//1800s
						}
					});
				}
			}
		}
	});

	function get_data(class_id, top, callback) {
		UsersModel.find({
			class_id:class_id,
			deleted: false,
			active: true
		})
		.select('_id name birthday class_id class_name province_name district_name school_name birthday')
		.sort({total_score_4: -1, total_time_4: 1, current_round_4: 1})
		// .skip(page_size*page_index)
		.limit(top)
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

DbUtil.prototype.TopScoreSchool = function(jWhere, page_index, page_size, callback) {
	let self = this;
	self.TopRank(jWhere, page_index, page_size, true, (err, jResponse) => {
		if(callback) callback(err, jResponse);
	});
};

DbUtil.prototype.TopRank = function(jWhere, page_index, page_size, bCount, callback_result) {
	let self = this;
	let key = 'toprank-' + page_index + '-' + bCount + '-' + util.getKeyCache(jWhere);

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback_result) {
				get_data(function(err, data_db) {
					callback_result(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback_result) callback_result(null, JSON.parse(data_cache));
			} else {
				let jResponse = {};
				async.parallel([
					function(callback) {
						get_data(jWhere, function(err, data_db) {
							jResponse.content = data_db;
							callback(null, true);
						});
					}, function(callback) {
						if(bCount) {
							count_data(jWhere, function(err, count) {
								jResponse.count = count;
								callback(null, true);
							});
						} else {
							callback(null, true);
						}
					}
				],function(list_err, list_result) {
					if(callback_result) callback_result(err, jResponse);
					if(jResponse.content) {
						self.redis.set(key, JSON.stringify(jResponse), 'EX', 3600);//3600s
						// self.redis.pexpire(key,3600000);//3600s
					}
				});
			}
		}
	});

	function count_data(jWhere, callback) {
		jWhere.deleted = false;
		jWhere.banned = false;
		jWhere.active = true;

		UsersModel.count(jWhere, function(err, count) {
			if(err) {
				logger.error(err);
			} else {
				callback(err, count);
			}
		});
	}

	function get_data(jWhere, callback) {
		jWhere.deleted = false;
		jWhere.banned = false;
		jWhere.active = true;

		UsersModel.find(jWhere)
		.select('_id name birthday class_id class_name current_round_4 total_score_4 total_time_4')
		.sort({total_score_4: -1, total_time_4: 1, current_round_4: 1})
		.skip(page_size * page_index)
		.limit(page_size)
		.exec(function(err, list) {
			if(err) {
				logger.error(err);
			} else {
				callback(err, list);
			}
		});
	}
};

DbUtil.prototype.TopRankEvent = function(jWhere, page_index, page_size, bCount, callback_result){
	let self = this;
	let key = 'toprank_event-' + page_index + bCount + '-' + util.getKeyCache(jWhere);

	self.redis.get(key,function(err, data_cache) {
		if(err) {
			if(callback_result) {
				get_data(function(err, data_db) {
					callback_result(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback_result) callback_result(null, JSON.parse(data_cache));
			} else {
				let jResponse = {};
				async.parallel([
					function(callback) {
						get_data(jWhere, function(err, data_db) {
							jResponse.content = data_db;
							callback(null, true);
						});
					}, function(callback) {
						if(bCount) {
							count_data(jWhere, function(err, count) {
								jResponse.count = count;
								callback(null, true);
							});
						} else {
							callback(null, true);
						}
					}
				],function(list_err, list_result) {
					if(callback_result) callback_result(err, jResponse);
					if(jResponse.content) {
						self.redis.set(key, JSON.stringify(jResponse), 'EX', 3600);//3600s
						// self.redis.pexpire(key,3600000);//3600s
					}
				});
			}
		}
	});

	function count_data(jWhere, callback) {
		UserScoreEventRankModel.count(jWhere, function(err, count) {
			if(err) {
				logger.error(err);
			} else {
				callback(err, count);
			}
		});
	}

	function get_data(jWhere, callback) {
		UserScoreEventRankModel.find(jWhere)
		.select('user_id fullname class_id score time')
		.sort({score: -1, time: 1})
		.skip(page_size * page_index)
		.limit(page_size)
		.exec(function(err, list) {
			if(err) {
				logger.error(err);
			} else {
				callback(err, list);
			}
		});
	}
};

//********************************payment*************************************//
DbUtil.prototype.PaymentCountMiss = function(user_id, callback){
	let self = this;
	let key = utilModule.format(config.payment.key_miss, user_id);
	self.redis.get(key,function(err, count) {
		if(callback) callback(err, count? count: 0);
	});
};

DbUtil.prototype.PaymentIncrMiss = function(user_id, callback) {
	let self = this;
	let key = utilModule.format(config.payment.key_miss, user_id);
	self.redis.incr(key, function(err, count) {
		if(callback) callback(err, count);
	});
	self.redis.pexpire(key, config.payment.ttl_miss);
};

DbUtil.prototype.PaymentClearMiss = function(user_id,callback){
	let self = this;
	let key = utilModule.format(config.payment.key_miss,user_id);
	self.redis.del(key,function(err,reply){
		if(callback) callback(err,reply); //reply = 0 - not exists | 1 - exists
	});
};

//********************************address*************************************//
DbUtil.prototype.GetListProvince = function(callback) {
	let self = this;
	let key = config.redis_key.province;
	self.redis.get(key, function(err, info) {
		if(err) {
			get_data(function(err, info) {
				callback(err, info);
			});
		} else {
			if(info) {
				callback(null, JSON.parse(info));
			} else {
				get_data(function(err, info) {
					callback(err, info);
					if(info) {
						self.redis.set(key, JSON.stringify(info));
					}
				});
			}
		}
	});

	function get_data(callback) {
		ProvinceModel.find({}).select('_id name').exec((err, list) => {
			callback(err, list);
		});
	}
};

DbUtil.prototype.GetProvinceInfo = function(id, callback) {
	if(id){
		let self = this;
		let key = utilModule.format(config.redis_key.province_info, id);
		self.redis.get(key, function(err, info) {
			if(err){
				get_data(id, function(err, info) {
					if(callback) callback(err, info);
				});
			} else {
				if(info) {
					if(callback) callback(null, info);
				} else {
					get_data(id, function(err, info) {
						if(callback) callback(err, info);
						if(info) {
							self.redis.set(key, info, 'EX', 300);
							// self.redis.pexpire(key,300000);
						}
					});
				}
			}
		});
	} else {
		if(callback) callback(true, null);
	}

	function get_data(id, callback) {
		ProvinceModel.findOne({_id: id}).select('name').exec(function(err, docs) {
			if(err) {
				callback(err, null);
			} else {
				if(docs) {
					callback(null, docs.name);
				} else {
					callback(null, null);
				}
			}
		});
	}
};

DbUtil.prototype.GetDistrictInfo = function(id, callback) {
	if(id) {
		let self = this;
		let key = utilModule.format(config.redis_key.district_info, id);
		self.redis.get(key, function(err, info) {
			if(err) {
				get_data(id, function(err, info) {
					if(callback) callback(err, info);
				});
			} else {
				if(info) {
					if(callback) callback(null, info);
				} else {
					get_data(id, function(err, info) {
						if(callback) callback(err, info);
						if(info) {
							self.redis.set(key, info, 'EX', 300);
							// self.redis.pexpire(key,300000);
						}
					});
				}
			}
		});
	} else {
		if(callback) callback(true, null);
	}

	function get_data(id, callback) {
		DestrictModel.findOne({_id: id}).select('name').exec(function(err, docs) {
			if(err) {
				callback(err, null);
			} else {
				if(docs) {
					callback(null, docs.name);
				} else {
					callback(null, null);
				}
			}
		});
	}
};

DbUtil.prototype.GetSchoolInfo = function(id, callback) {
	if(id) {
		let self = this;
		let key = utilModule.format(config.redis_key.school_info, id);
		self.redis.get(key, function(err, info){
			if(err) {
				get_data(id, function(err, info) {
					if(callback) callback(err,info);
				});
			} else {
				if(info) {
					if(callback) callback(null, info);
				} else {
					get_data(id, function(err, info) {
						if(callback) callback(err, info);
						if(info) {
							self.redis.set(key, info, 'EX', 300);
							// self.redis.pexpire(key,300000);
						}
					});
				}
			}
		});
	} else {
		if(callback) callback(true, null);
	}

	function get_data(id, callback) {
		SchoolModel.findOne({_id: id}).select('name').exec(function(err, docs) {
			if(err) {
				callback(err, null);
			} else {
				if(docs) {
					callback(null, docs.name);
				} else {
					callback(null, null);
				}
			}
		});
	}
};

//********************************news*************************************//
DbUtil.prototype.ListNews = function(category_id, page_size, page_index, callback) {
	let self = this;

	let key_cache = utilModule.format(config.redis_key.list_news, category_id, page_index, page_size);
	self.redis.get(key_cache, function(err, data) {
		if(err) {
			callback(err, null);
		} else {
			if(data) {
				let data_cache = JSON.parse(data);
				callback(null, data_cache);
			} else {
				NewsModel.find({
					deleted: false,
					active: true,
					parent_id:category_id
				})
				.select('_id name name_ko_dau thumb')
				.sort({sort: 1})
				.skip(page_index * page_size)
				.limit(page_size)
				.exec(function(err, results) {
					if(err) {
						callback(err, null);
					} else {
						self.redis.set(key_cache, JSON.stringify(results), 'EX', 600);
						// self.redis.pexpire(key_cache,600000); //600s
						callback(null, results);
					}
				});
			}
		}
	});
};

DbUtil.prototype.ListRandomNews = function(category_id, page_size, skip, callback) {
	// let self = this;
	NewsModel.find({
		deleted: false,
		active: true,
		parent_id:category_id
	})
	.select('_id name name_ko_dau thumb')
	.sort({sort: 1})
	.skip(skip)
	.limit(page_size)
	.exec(function(err, results){
		if(err) {
			callback(err, null);
		} else {
			callback(null, results);
		}
	});
};

DbUtil.prototype.CountListNews = function(category_id, callback) {
	let self = this;

	let key_cache = utilModule.format(config.redis_key.count_list_news, category_id);
	self.redis.get(key_cache, function(err, iCount) {
		if(err) {
			callback(err, null);
		} else {
			if(iCount) {
				callback(null, iCount);
			} else {
				NewsModel.count({
					deleted: false,
					active: true,
					parent_id: category_id
				},function(err, iCount){
					if(err){
						callback(err, 0);
					} else {
						self.redis.set(key_cache, iCount, 'EX', 600);
						// self.redis.pexpire(key_cache,600000); //600s
						callback(null, iCount);
					}
				});
			}
		}
	});
};

DbUtil.prototype.GetListNewsHome = function(path, limit, callback) {
	let self = this;
	let category_obj = config.category.get_id[path];
	if(!category_obj) {
		callback(true, null);
	} else {
		let key_cache = utilModule.format(config.redis_key.list_news, category_obj.id, 'home', 0);
		self.redis.get(key_cache,function(err, data) {
			if(err) {
				callback(err, null);
			} else {
				if(data) {
					let data_cache = JSON.parse(data);
					callback(null, data_cache);
				} else {
					NewsModel.find({
						deleted: false,
						active: true,
						parent_id: category_obj.id
					})
					.select('_id name name_ko_dau')
					.sort({sort: 1, created_at: -1})
					.skip(0)
					.limit(limit)
					.exec(function(err, results) {
						if(err) {
							callback(err, null);
						} else {
							if(results && results.length > 0) {
								callback(null, results);
							} else {
								callback(null, null);
							}
							self.redis.set(key_cache, JSON.stringify(results));
						}
					});
				}
			}
		});
	}
};

DbUtil.prototype.GetListNewsHomeImage = function(path, limit, callback) {
	let self = this;
	let category_obj = config.category.get_id[path];
	if(!category_obj) {
		callback(true, null);
	} else {
		let key_cache = utilModule.format(config.redis_key.list_news, category_obj.id, 'home', 0);
		self.redis.get(key_cache, function(err, data) {
			if(err) {
				callback(err, null);
			} else {
				if(data) {
					let data_cache = JSON.parse(data);
					callback(null, data_cache);
				} else {
					NewsModel.find({
						deleted: false,
						active: true,
						parent_id: category_obj.id
					})
					.select('_id name name_ko_dau thumb description')
					.sort({sort: 1, created_at: -1})
					.skip(0)
					.limit(limit)
					.exec(function(err, results) {
						if(err) {
							callback(err, null);
						} else {
							self.redis.set(key_cache, JSON.stringify(results));
							callback(null, results);
						}
					});
				}
			}
		});
	}
};

DbUtil.prototype.GetListNewsNoPage = function(path, callback) {
	let self = this;
	let category_obj = config.category.get_id[path];
	if(!category_obj) {
		callback(true, null);
	} else {
		let key_cache = utilModule.format(config.redis_key.list_news, category_obj.id, '$', 0);
		self.redis.get(key_cache, function(err, data) {
			if(err) {
				callback(err, null);
			} else {
				if(data) {
					let data_cache = JSON.parse(data);
					callback(null, data_cache);
				} else {
					NewsModel.find({
						deleted: false,
						active: true,
						parent_id: category_obj.id
					})
					.select('_id name name_ko_dau')
					.sort({sort:1,created_at:-1})
					// .skip(0).limit(limit)
					.exec(function(err, results) {
						if(err) {
							callback(err, null);
						} else {
							self.redis.set(key_cache, JSON.stringify(results));
							callback(null, results);
						}
					});
				}
			}
		});
	}
};

DbUtil.prototype.GetListNewsTop = function(path, top, callback) {
	let self = this;
	let category_obj = config.category.get_id[path];
	if(!category_obj) {
		callback(true, null);
	} else {
		let key_cache = utilModule.format(config.redis_key.list_news, category_obj.id, 'top', top);
		self.redis.get(key_cache, function(err, data) {
			if(err) {
				callback(err, null);
			} else {
				if(data) {
					let data_cache = JSON.parse(data);
					callback(null, data_cache);
				} else {
					NewsModel.find({
						deleted: false,
						active: true,
						parent_id: category_obj.id
					})
					.select('_id name name_ko_dau')
					.sort({sort: 1, created_at: -1})
					.skip(0)
					.limit(top)
					.exec(function(err, results) {
						if(err) {
							callback(err, null);
						} else {
							self.redis.set(key_cache, JSON.stringify(results));
							callback(null, results);
						}
					});
				}
			}
		});
	}
};
//********************************exam*************************************//
DbUtil.prototype.checkExitExam = function(type_id, class_id, round_id, test, callback) {
	let self = this;
	let exam_info = utilModule.format(config.redis_key.exam_info, type_id, class_id, round_id, test);
	self.redis.hmget(exam_info, ['exist'], function(err, results) {
		if(err) {
			get_data(type_id, class_id, round_id, test, function(err, count) {
				if(callback) callback(err, count);
			});
		} else {
			if(count && count[0]) {
				if(callback) callback(null, parseInt(count[0]) > 0);
			} else {
				get_data(type_id, class_id, round_id, test, function(err, count) {
					if(callback) callback(err, count);
					self.redis.hmset(exam_info, 'exist', count);
				});
			}
		}
	});

	function get_data(type_id, class_id, round_id, test, callback) {
		ExamModel.count({
			type_id: type_id,
			class_id: class_id,
			round_id: round_id,
			test: test
		}, function(err, count) {
			if(callback) {
				if(err) callback(false);
				else callback(count > 0);
			}
		});
	}
};

DbUtil.prototype.GetGameId = function(type_id, class_id, round_id, test, callback) {
	let self = this;
	let exam_info = utilModule.format(config.redis_key.exam_info, type_id, class_id, round_id, test);
	self.redis.hmget(exam_info, ['game_id'], function(err, game_id) {
		if(err) {
			get_data(type_id, class_id, round_id, test, function(err, game_id) {
				if(callback) callback(err, game_id);
			});
		} else {
			if(game_id && game_id[0]) {
				if(callback) callback(null, parseInt(game_id[0]));
			} else {
				get_data(type_id, class_id, round_id, test, function(err, game_id) {
					if(callback) callback(err, game_id);
					self.redis.hmset(exam_info, 'game_id', game_id);
				});
			}
		}
	});

	function get_data(type_id, class_id, round_id, test, callback) {
		ExamModel.findOne({
			type_id: type_id,
			class_id: class_id,
			round_id: round_id,
			test: test
		})
		.select('game_id')
		.exec(function(err, exam_info) {
			if(err) {
				if(callback) callback(err, null);
			} else {
				if(callback) {
					if(exam_info) callback(null, exam_info.game_id);
					else callback(null, null);
				}
			}
		});
	}
};

DbUtil.prototype.GetExamInfo = function(type_id, class_id, round_id, test, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.exam_info, type_id, class_id, round_id, test);
	self.redis.hmget(key, ['info'], function(err, info) {
		if(err) {
			get_data(type_id, class_id, round_id, test, function(err, infodb) {
				if(callback) callback(err, infodb);
			});
		} else {
			if(info && info[0]) {
				if(callback) {
					let data = JSON.parse(info[0]);
					callback(null, data);
				}
			} else {
				get_data(type_id, class_id, round_id, test, function(err, infodb) {
					self.redis.hmset(key, 'info', JSON.stringify(infodb));
					if(callback) callback(err, infodb);
				});
			}
		}

		function get_data(type_id, class_id, round_id, test, callbackDb) {
			ExamModel.findOne({
				type_id: type_id,
				class_id: class_id,
				round_id: round_id,
				test: test
			})
			.select('_id play time game_id answers content')
			.exec(function(err, exam_info) {
				// if(err){
				// 	if(callback) callback(err,null);
				// }
				// else{
				// 	if(callback){
				// 		if(exam_info) callback(null,exam_info);
				// 		else callback(null,null);
				// 	}
				// }
				// logger.info('[EXAM] DB =>>>>>>>>>',exam_info);
				callbackDb(err, exam_info);
			});
		}
	});
};

DbUtil.prototype.GetExamPreInfo = function(user_exam_id, callback) {
	UserExamModel.findOne({
		_id: user_exam_id
	})
	.select('content')//nội dung bài thi
	.sort({_id: -1})
	//.skip(i_from).limit(page_size)
	.exec(function(err, user_exam_info) {
		if(err) {
			if(callback) callback(err, null);
		} else {
			if(callback) {
				if(user_exam_info) callback(null, user_exam_info);
				else callback(null, null);
			}
		}
	});
};

DbUtil.prototype.SaveUserExam = function(user_id, time, content, answers, callback) {
	let key = utilModule.format(config.redis_key.config.redis_key.user_exam_info, user_id);
	let exam_info = {
		//time: time,
		content: content,
		answers: answers,
	};
	this.redis.set(key, JSON.stringify(exam_info), function(err) {
		if(callback) callback(err);
	});
	// let userExamModel = new UserExamModel();
	// userExamModel.type_id = type_id;
	// userExamModel.user_id = user_id;
	// userExamModel.exam_id=exam_id;
	// userExamModel.class_id=class_id;
	// userExamModel.score=0;
	// userExamModel.time = time;
	// userExamModel.round_id=round_id;
	// userExamModel.test=test;
	// userExamModel.content=data.content;
	// userExamModel.answers = answers;
	// userExamModel.save(function(err,user_exam_info){
	// 	if(err){
	// 		if(callback) callback(err,0);
	// 	}
	// 	else{
	// 		if(callback){
	// 			if(user_exam_info) callback(null,user_exam_info._id);
	// 			else callback(null,0);
	// 		}
	// 	}
	// });
};

DbUtil.prototype.LoadUserExam = function(user_id, callback) {
	let key = utilModule.format(config.redis_key.user_exam_info, user_id);
	this.redis.get(key, function(err, info) {
		if(err) {
			if(callback) callback(err, null);
		} else if(callback) {
			if(info) {
				callback(null, JSON.parse(err));
			} else {
				callback(null, null);
			}
		}
	});
};

DbUtil.prototype.DeleteUserExam = function(user_id, callback) {
	let key = utilModule.format(config.redis_key.user_exam_info, user_id);
	this.redis.del(key, function(err, reply) {
		if(callback) callback(err, reply); //reply = 0 - not exists | 1 - exists
	});
};

//exam redis
DbUtil.prototype.GetCurrentExam = function(user_id, callback) {
	let key_user_play_exam = utilModule.format(config.redis_key.user_play_exam, user_id);
	this.redis.hmget(key_user_play_exam, ['type_id', 'round_id', 'test'], function(err, results) {
		if(err) {
			if(callback) callback(err, null);
		} else {
			if(callback) {
				if(results) callback(null, results);
				else callback(null, null);
			}
		}
	});
};

DbUtil.prototype.GetPreExam = function(user_id, callback) {
	let key_user_play_exam = utilModule.format(config.redis_key.user_play_exam, user_id);
	this.redis.hmget(key_user_play_exam, ['type_id', 'class_id', 'round_id', 'test', 'score', 'wrongCount', 'currentIndex', 'time', 'user_exam_id'], function(err, results) {
		if(err) {
			if(callback) callback(err, null);
		} else {
			if(callback) {
				if(results) callback(null, results);
				else callback(null, null);
			}
		}
	});
};

DbUtil.prototype.GetTimeStamp = function(user_id, callback) {
	let key_user_play_exam = utilModule.format(config.redis_key.user_play_exam, user_id);
	this.redis.ttl(key_user_play_exam, function(err, second) {
		if(err) {
			if(callback) callback(err, null);
		} else {
			if(callback) {
				if(second -3 > 0) {
					second -= 3;
					callback(null, second);
				} else {
					callback(null, null);
				}
			}
		}
	});
};

//save info playing user exam
DbUtil.prototype.SavePlayingExam = function(user_id, type_id, class_id, round_id, test, time, callback) {
	let key_user_play_exam = utilModule.format(config.redis_key.user_play_exam, user_id);
	//HMSET user_play_exam_<user_id> type_id <type_id> class_id <user.class_id> round_id <round_id> test <test> score 0 wrongCount 0 currentIndex 0 time <time_exam> user_exam_id <user_exam_id>
	this.redis.hmset(key_user_play_exam,
		'type_id', type_id,
		'class_id', class_id,
		'round_id', round_id,
		'test', test,
		'score', 0,
		'wrongCount', 0,
		'currentIndex', 0,
		'time', time,
		'user_exam_id', data.user_exam_id,
		function(err, results) {
		if(err) {
			if(callback) callback(err, null);
		} else {
			if(callback) {
				if(results) callback(null, results);
				else callback(null, null);
			}
			// //set expire key: user_play_exam_<user_id>
			// //PEXPIRE user_play_exam_<user_id> <time_exam>
			// this.redis.pexpire(key_user_play_exam,(time + 3) * 1000);
			// response.error=0;
			// response.message='done';
			// callback(false,data);

			//set timeout auto end game
			// t_endgame = setTimeout(function(){
			// 	console.log('--------------------auto end game----------------------');
			// 	end_game();
			// },time*1000);
		}
	});
};

//********************************score*************************************//
DbUtil.prototype.GetScoreInfo = function(user_id, type_id, round_id, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.score_user.score_info, type_id, round_id, user_id);

	self.redis.get(key,function(err, info) {
		if(err) {
			get_data(type_id, round_id, user_id, function(err, info) {
				if(callback) callback(err, info);
			});
		} else {
			if(info) {
				if(callback) {
					callback(null, JSON.parse(info));
				}
			} else {
				get_data(type_id, round_id, user_id, function(err, info) {
					if(callback) callback(err, info);
					self.redis.set(key, JSON.stringify(info), 'EX', 5);
					// self.redis.pexpire(key,5000);
				});
			}
		}
	});

	function get_data(type_id, round_id, user_id, callback) {
		ScoreModel.findOne({
			user_id: user_id,
			type_id: type_id,
			round_id: round_id
		})
		.select('_id time score')
		.exec(function(err, score_info) {
			if(err) {
				if(callback) callback(err, null);
			} else {
				if(callback) {
					if(score_info) callback(null, score_info);
					else callback(null, null);
				}
			}
		});
	}
};

DbUtil.prototype.GetListScore = function(user_id, callback) {
	ScoreModel.find({
		user_id: user_id
	})
	.select('type_id round_id score time luot created_at')
	.sort({type_id: 1, round_id: 1})
	.exec(function(err, scoreList) {
		if(err) {
			if(callback) callback(err, null);
		} else {
			if(callback) {
				if(scoreList) callback(null, scoreList);
				else callback(null, null);
			}
		}
	});
};

// //save score user
// DbUtil.prototype.SaveScoreUser = function(user_id,type_id,round_id,total_score,time,luot,callback){
// 	let scoreModel = new ScoreModel();
// 	scoreModel.user_id=user_id;
// 	scoreModel.type_id=type_id;
// 	scoreModel.round_id=round_id;
// 	scoreModel.score=total_score;
// 	scoreModel.time=time;
// 	scoreModel.luot=luot;
// 	scoreModel.save(function(err,scoreInfo){
// 		if(err){
// 			if(callback) callback(err,null);
// 		}
// 		else{
// 			if(callback){
// 				if(scoreInfo) callback(null,scoreInfo);
// 				else callback(null,null);
// 			}
// 		}
// 	});
// };

//score redis
DbUtil.prototype.GetExamRedis = function(type_id, round_id, user_id, callback) {
	let key_score_user = utilModule.format(config.redis_key.score_user.hash, type_id, round_id, user_id);//score_user_1_19_123: olympic toan, vong 19, user: 123
	this.redis.hmget(key_score_user,['score_1', 'score_2', 'score_3'], function(err, results) {
		if(err) {
			if(callback) callback(err, null);
		} else {
			if(callback) {
				if(results[0] || results[1] || results[2]){
					callback(null, results)
				} else callback(null, null);
			}
		}
	});
};

DbUtil.prototype.SetInitScore = function(type_id, round_id, test, time, user_id, callback){
	let key_score_user = utilModule.format(config.redis_key.score_user.hash, type_id, round_id, user_id);//score_user_1_19_123: olympic toan, vong 19, user: 123
	if(test == 1) {
		//clear data score
		this.redis.hkeys(key_score_user, function(err, list_key) {
			if(list_key && list_key.length > 0) {
				for(let i=0; i < list_key.length; i++) {
					let key = list_key[i];
					if(key != 'luot') {
						redis.hdel(key_score_user, key);
					}
				}
			}
		});
		//HINCREBY score_user_<type_id>_<round>_<user_id> luot 1
		this.redis.hincrby(key_score_user, 'luot', 1);//tăng lượt thi của vòng
	}
	//HMSET score_user_<type_id>_<round>_<user_id> score_<test> 0 total_time_<test> <time_exam> wrong_<test> 0
	this.redis.hmset(key_score_user,
		'score_' + test, 0,
		'totaltime_' + test, time,
		'wrong_' + test, 0
	);
	callback(false,data);
};

let update_scores = function(user_id, type_id, callback_result) {
	let data = {};
	async.parallel([
		(callback) => {
			ScoreModel.aggregate([
				{
					$match:{
						user_id: user_id,
						type_id: type_id
					}
				},{
					$group:{
						_id:"$user_id",
						total_score:{$sum:"$score"},
						total_time:{$sum:"$time"}
					}
				}
			],(err, results) => {
				if(err) {
					logger.error(err);
				} else {
					data.total_score = results[0].total_score;
					data.total_time = results[0].total_time;
					callback(null, true);
				}
			});
		},
		(callback) => {
			ScoreModel.find({
				user_id: user_id,
				type_id: type_id
			})
			.select('round_id')
			.sort({round_id:-1})
			.limit(1)
			.exec((err, score_info) => {
				if(err) {
					logger.error(err);
				} else {
					if(score_info) data.max_round = score_info[0].round_id;
					else data.max_round = 0;
					callback(null, true);
				}
			});
		}
	], (errs, list_result) => {
		let set_data={};
		set_data["total_score_" + type_id] = data.total_score;
		set_data["total_time_" + type_id] = data.total_time;
		set_data["current_round_" + type_id] = data.max_round;

		UsersModel.update({_id: user_id}, {
			$set: set_data
		}, {
			multi: false,
			upsert: false
		}, (err, reply) => {
			if(err) {
				logger.error(err);
			} else {
				callback_result(err, data);
			}
		});
	});
};

DbUtil.prototype.UpdateScoreRank = function(province_id, district_id, school_id, type_id, round_id, class_id, user_id, code, callback_result) {
	code = (code && code.length == 6 && util.isInt(code))? code: null;
	try {
		let isFree = type_id != 4;
		let self = this;
		let key_score_user = utilModule.format(config.redis_key.score_user.hash, type_id, round_id, user_id);//score_user_1_19_123: olympic toan, vong 19, user: 123
		self.redis.hmget(key_score_user, ['score_1', 'score_2', 'score_3', 'luot', 'totaltime_1', 'totaltime_2', 'totaltime_3'], function(err, results) {
			if(err) {
				if(callback) callback(err, null);
			} else {
				//total score this round
				let total_score = parseInt(results[0]) + parseInt(results[1]) + parseInt(results[2]);
				let total_time= parseInt(results[4]) + parseInt(results[5]) + parseInt(results[6]);
				let luot = results[3]? parseInt(results[3]): 1;

				if(total_score > 300) total_score = 1;

				async.waterfall([
					function(callback) {
						if(total_score >= 150 || total_score == 1 || (code && code != '')) {
							//save score user
							self.GetScoreInfo(user_id, type_id, round_id, function(err, score_info) {
								if(err) {
									logger.error(err);
									callback(err, null);
								} else {
									if(!score_info) {
										if(isFree) {
											callback(null, {});
										} else {
											let scoreModel = new ScoreModel({
												//alias: type_id + '-' + round_id + '-' + user_id,
												user_id: user_id,
												type_id: type_id,
												round_id: round_id,
												score: total_score,
												time: total_time,
												luot: luot,
												code: code
											});
											scoreModel.save(function(err, info) {
												if(err) {
													logger.error(err);
												} else {
													let score_rank = 0;
													// let time_rank = 0;
													let key_rank_type = utilModule.format(config.redis_key.rank.type, type_id);
													//self.redis.zscore(key_rank_type,user_id,function(err,sum_score){
													//ScoreModel.db.db.eval("update_scores("+user_id+","+type_id+")",function(err,sum_score_info){
													update_scores(user_id, type_id, (err, sum_score_info) => {
														//console.log(err,sum_score_info); => { total_score: 300, total_time: 50, max_round: 1 }
														if(err) logger.error(err);
														else{
															// if(sum_score_info){
															// 	score_rank = Math.floor(sum_score);
															// 	time_rank = 1/(sum_score-score_rank);
															// }
															// score_rank+= (total_score+1/(total_time+time_rank));
															if(sum_score_info) {
																score_rank += sum_score_info.total_score + 1 / sum_score_info.total_time;

																//rank type
																self.redis.zadd(key_rank_type, score_rank, user_id);

																//rank province
																let key_rank_province = utilModule.format(config.redis_key.rank.province, type_id, province_id);
																self.redis.zadd(key_rank_province, score_rank, user_id);

																//rank district
																let key_rank_district = utilModule.format(config.redis_key.rank.district, type_id, district_id);
																self.redis.zadd(key_rank_district, score_rank, user_id);

																//rank school
																let key_rank_school = utilModule.format(config.redis_key.rank.school, type_id, school_id);
																self.redis.zadd(key_rank_school, score_rank, user_id);

																//rank class
																let key_rank_class = utilModule.format(config.redis_key.rank.xclass, type_id, class_id);
																self.redis.zadd(key_rank_class, score_rank, user_id);
															}
														}
													});
												}
												callback(err, info);
											});
										}
									} else {
										callback(true, null);
									}
								}
							});
						} else {
							//clear data score in cache
							self.redis.hkeys(key_score_user, function(err, list_key) {
								if(list_key && list_key.length > 0) {
									for(let i=0; i < list_key.length; i++) {
										let key = list_key[i];
										if(key != 'luot') {
											self.redis.hdel(key_score_user, key);
										}
									}
								}
							});
							callback(true, null);
						}
					}, function(data, callback) {
						if(!isFree) {
							//del info round pre
							let key = utilModule.format(config.redis_key.score_user.score_info, type_id, round_id - 1, user_id);
							self.redis.del(key);

							key = utilModule.format(config.redis_key.score_user.score_info, type_id, round_id, user_id);
							let info = {
								_id: data._id,
								time: data.time,
								score: data.score
							};
							self.redis.set(key,JSON.stringify(info), 'EX', 5);
							// self.redis.pexpire(key,5000);
						}
						callback(null, null);
					}
				], function() {
					if(callback_result) {
						callback_result(null, {
							type_id: type_id,
							round_id: round_id,
							luot: results[3],
							total_score: total_score,
							total_time: total_time,
							round_info: [
								{
									score: results[0],
									total_time: results[4]
								},
								{
									score: results[1],
									total_time: results[5]
								},
								{
									score: results[2],
									total_time: results[6]
								},
							]
						});
					}
					else{
						logger.debug('no callback');
					}
					self.UpdateCurrentRound(user_id, type_id)
				});
			}
		});
	} catch(e) {
		logger.error(e.task);
	}
};

//********************************param*************************************//
DbUtil.prototype.LoadListParam = function(callback) {
	let self = this;
	ParamsModel.find({})
	.select('_id value').exec(function(err, list) {
		if(err) {
			if(callback) callback(err, null);
		} else {
			if(list && list.length > 0) {
				let map={};
				for(let i = 0; i < list.length; i++) {
					let param_obj = list[i];
					let key = param_obj._id;
					let value = param_obj.value;
					map[key] = value;
					self.redis.hmset(config.redis_key.param_global, key, value);
				}
				if(callback) callback(null, map);
			} else if(callback) callback(null, null);
		}
	});
};

// DbUtil.prototype.GetListParam = function(list_id,callback){
// 	let self = this;
// 	self.redis.hmget(config.redis_key.param_global,list_id,function(err,values){
// 		if(err){
// 			GetList(list_id,function(err,map){
// 				callback(err,map);
// 			});
// 		}
// 		else{
// 			if(values && values.length>0){
// 				map={};
// 				for(let i=0;i<values.length;i++){
// 					map[list_id[i]] = values[i];
// 				}
// 				if(callback) callback(null,map);
// 			}
// 			else if(callback) callback(null,null);
// 		}
// 	});

// 	function GetList(list_id,callback){
// 		ParamsModel.find({
// 			_id:{
// 				'$in':list_id
// 			}
// 		})
// 		.select('_id value').exec(function(err,list){
// 			if(err){
// 				if(callback) callback(err,null);
// 			}
// 			else{
// 				if(list && list.length>0){
// 					map={};
// 					for(let i=0;i<list.length;i++){
// 						let param_obj = list[i];
// 						map[param_obj._id] = param_obj.value;
// 					}
// 					if(callback) callback(null,map);
// 				}
// 				else if(callback) callback(null,null);
// 			}
// 		});
// 	}
// };

DbUtil.prototype.GetParamInfo = function(key, callback) {
	let self = this;
	self.redis.hmget(config.redis_key.param_global, key, function(err, value) {
		if(err) {
			getParam(key, function(err, value) {
				if(callback) callback(err, value);
			});
		} else {
			if(value) {
				if(callback)callback(err, value[0]);
			} else {
				getParam(key, function(err, value) {
					if(callback) callback(err, value);
					self.redis.hmset(config.redis_key.param_global, key, value);
				});
			}
		}
	});

	function getParam(key, callback) {
		ParamsModel.findOne({_id: key}).select('value').exec(function(err, result) {
			if(err) {
				if(callback) callback(err, null);
			} else {
				if(callback) {
					if(result) callback(null, result.value);
					else callback(null, null);
				}
			}
		});
	}
};

//********************************lesson*************************************//
DbUtil.prototype.LessionInfo = function(id, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.lesson_info, id);

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(id, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(id, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db));
						// self.redis.pexpire(key,1800000);//1800s
					}
				});
			}
		}
	});

	function get_data(id, callback) {
		LessonModel.findOne({
			_id: id,
			deleted: false
		})
		.select('_id name video_type url name_ko_dau thumb description content duration_view i_view i_like total_like')
		// .sort({sort:1})
		// .skip(page_size*page_index)
		// .limit(page_size)
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

// DbUtil.prototype.LessionNew = function(type_id,class_id,callback){
// 	let self = this;
// 	let key = utilModule.format(config.redis_key.lesson_new,type_id,class_id);

// 	self.redis.get(key,function(err,data_cache){
// 		if(err){
// 			if(callback){
// 				get_data(type_id,class_id,function(err,data_db){
// 					callback(err,data_db);
// 				});
// 			}
// 		}
// 		else{
// 			if(data_cache){
// 				if(callback) callback(null,JSON.parse(data_cache));
// 			}
// 			else{
// 				get_data(type_id,class_id,function(err,data_db){
// 					if(callback) callback(err,data_db);
// 					if(data_db){
// 						self.redis.set(key,JSON.stringify(data_db));
// 						// self.redis.pexpire(key,1800000);//1800s
// 					}
// 				});
// 			}
// 		}
// 	});

// 	function get_data(type_id,class_id,callback){
// 		LessonModel.findOne({
// 			parent_id: type_id,
// 			class_id: class_id,
// 			deleted: false
// 		})
// 		.select('_id name video_type url name_ko_dau thumb description content duration_view i_view i_like total_like')
// 		.sort({sort:1})
// 		// .skip(page_size*page_index)
// 		// .limit(page_size)
// 		.exec(function(err,list){
// 			callback(err, list);
// 		});
// 	}
// };

DbUtil.prototype.LessionNew = function(type_id, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.lesson_new, type_id);

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(type_id, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(type_id, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db));
						// self.redis.pexpire(key,1800000);//1800s
					}
				});
			}
		}
	});

	function get_data(type_id, callback) {
		LessonModel.findOne({
			parent_id: type_id,
			deleted: false
		})
		.select('_id name video_type url name_ko_dau thumb description content duration_view i_view i_like total_like')
		.sort({sort: 1})
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

// DbUtil.prototype.ListLession = function(type_id,class_id,page_size,page_index,id,callback){
// 	let self = this;
// 	let key = utilModule.format(config.redis_key.list_lesson,type_id,class_id,page_size,page_index,id);

// 	self.redis.get(key,function(err,data_cache){
// 		if(err){
// 			if(callback){
// 				get_data(type_id,class_id,page_size,page_index,id,function(err,data_db){
// 					callback(err,data_db);
// 				});
// 			}
// 		}
// 		else{
// 			if(data_cache){
// 				if(callback) callback(null,JSON.parse(data_cache));
// 			}
// 			else{
// 				get_data(type_id,class_id,page_size,page_index,id,function(err,data_db){
// 					if(callback) callback(err,data_db);
// 					if(data_db){
// 						self.redis.set(key,JSON.stringify(data_db));
// 						// self.redis.pexpire(key,1800000);//1800s
// 					}
// 				});
// 			}
// 		}
// 	});

// 	function get_data(type_id,class_id,page_size,page_index,id,callback){
// 		LessonModel.find({
// 			_id: {$ne: id},
// 			parent_id: type_id,
// 			class_id:class_id,
// 			deleted: false
// 		})
// 		.select('_id name name_ko_dau thumb description duration_view i_view')
// 		.sort({sort:1})
// 		.skip(page_size*page_index)
// 		.limit(page_size)
// 		.exec(function(err,list){
// 			callback(err, list);
// 		});
// 	}
// };

DbUtil.prototype.ListLession = function(type_id, page_size, page_index, id, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.list_lesson, type_id, page_size, page_index, id);

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(type_id, page_size, page_index, id, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(type_id, page_size, page_index, id, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db));
						// self.redis.pexpire(key,1800000);//1800s
					}
				});
			}
		}
	});

	function get_data(type_id, page_size, page_index, id, callback) {
		LessonModel.find({
			_id: {$ne: id},
			parent_id: type_id,
			//class_id:class_id,
			deleted: false
		})
		.select('_id name name_ko_dau thumb description duration_view i_view')
		.sort({sort: 1})
		.skip(page_size * page_index)
		.limit(page_size)
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

// DbUtil.prototype.CountListLessonOther = function(type_id,class_id,callback){
// 	let self = this;
// 	let key = utilModule.format(config.redis_key.list_lesson_other,type_id,class_id);

// 	self.redis.get(key,function(err,data_cache){
// 		if(err){
// 			if(callback){
// 				get_data(type_id,class_id,function(err,iCount){
// 					callback(err,iCount);
// 				});
// 			}
// 		}
// 		else{
// 			if(data_cache){
// 				if(callback) callback(null,data_cache);
// 			}
// 			else{
// 				get_data(type_id,class_id,function(err,iCount){
// 					if(callback) callback(err,iCount);
// 					if(iCount){
// 						self.redis.set(key,iCount);
// 						self.redis.pexpire(key,300000);//300s
// 					}
// 				});
// 			}
// 		}
// 	});

// 	function get_data(type_id,class_id,callback){
// 		LessonModel.count({
// 			parent_id: type_id,
// 			class_id:class_id,
// 			deleted: false
// 		},function(err,iCount){
// 			callback(err, iCount);
// 		});
// 	}
// };

DbUtil.prototype.CountListLessonOther = function(type_id, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.count_lesson_other, type_id, 0);

	self.redis.get(key,function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(type_id, function(err, iCount) {
					callback(err, iCount);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, data_cache);
			} else {
				get_data(type_id, function(err, iCount) {
					if(callback) callback(err, iCount);
					if(iCount) {
						self.redis.set(key, iCount, 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(type_id, callback) {
		LessonModel.count({
			parent_id: type_id,
			//class_id:class_id,
			deleted: false
		},function(err, iCount){
			callback(err, iCount);
		});
	}
};

//********************************game*************************************//
DbUtil.prototype.ListCategoryGame = function(callback) {
	let self = this;
	let key = config.redis_key.category_game;

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db));
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(callback){
		GameTypeModel.find({
			active: true
		})
		.select('_id name name_ko_dau')
		.sort({sort: 1})
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

DbUtil.prototype.ListGame = function(category_id, page_size, page_index, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.list_game, category_id, page_size, page_index);

	self.redis.get(key,function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(category_id, page_size, page_index, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(category_id, page_size, page_index, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db));
						// self.redis.pexpire(key,1800000);//1800s
					}
				});
			}
		}
	});

	function get_data(category_id, page_size, page_index, callback) {
		GameModel.find({
			category_id: category_id,
			active: true,
			// deleted: false
		})
		.select('_id name name_ko_dau type_id thumb')
		.sort({sort: 1})
		.skip(page_size * page_index)
		.limit(page_size)
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

DbUtil.prototype.ListAllGame = function(page_size, page_index, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.list_all_game, page_size, page_index);

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(page_size, page_index, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(page_size, page_index, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db), 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(page_size, page_index, callback) {
		GameModel.find({
			// category_id: category_id,
			active: true,
			// deleted: false
		})
		.select('_id name name_ko_dau type_id thumb')
		.sort({sort: 1})
		.skip(page_size * page_index)
		.limit(page_size)
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

DbUtil.prototype.ListRandomGame = function(page_size, skip, callback) {
	// let self = this;
	// let key = utilModule.format(config.redis_key.list_all_game,page_size,page_index);

	// self.redis.get(key,function(err,data_cache){
	// 	if(err){
	// 		if(callback){
	// 			get_data(page_size,page_index,function(err,data_db){
	// 				callback(err,data_db);
	// 			});
	// 		}
	// 	}
	// 	else{
	// 		if(data_cache){
	// 			if(callback) callback(null,JSON.parse(data_cache));
	// 		}
	// 		else{
	// 			get_data(page_size,page_index,function(err,data_db){
	// 				if(callback) callback(err,data_db);
	// 				if(data_db){
	// 					self.redis.set(key,JSON.stringify(data_db));
	// 					self.redis.pexpire(key,300000);//300s
	// 				}
	// 			});
	// 		}
	// 	}
	// });

	// function get_data(page_size,page_index,callback){
		GameModel.find({
			active: true,
		})
		.select('_id name name_ko_dau type_id thumb')
		.sort({sort: 1})
		.skip(skip)
		.limit(page_size)
		.exec(function(err, list) {
			callback(err, list);
		});
	// }
};

DbUtil.prototype.CountListGame = function(category_id, callback){
	let self = this;
	let key = utilModule.format(config.redis_key.count_list_game, category_id);

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(category_id, function(err, iCount) {
					callback(err, iCount);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, data_cache);
			} else {
				get_data(category_id, function(err, iCount) {
					if(callback) callback(err, iCount);
					if(iCount) {
						self.redis.set(key, iCount, 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(type_id, callback){
		GameModel.count({
			category_id: category_id,
			active: true,
			// deleted: false
		},function(err, iCount) {
			callback(err, iCount);
		});
	}
};

DbUtil.prototype.GameInfo = function(id, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.game_info, id);

	self.redis.get(key,function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(id, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(id, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db));
						// self.redis.pexpire(key,1800000);//1800s
					}
				});
			}
		}
	});

	function get_data(id, callback) {
		GameModel.findOne({
			_id: id,
			active: true
		})
		.select('_id name name_ko_dau url thumb description content tags')
		// .sort({sort:1})
		// .skip(page_size*page_index)
		// .limit(page_size)
		.exec(function(err, list){
			callback(err, list);
		});
	}
};

DbUtil.prototype.CountAllGame = function(callback) {
	let self = this;
	let key = config.redis_key.count_all_game;

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(function(err, iCount) {
					callback(err, iCount);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, data_cache);
			} else {
				get_data(function(err, iCount) {
					if(callback) callback(err, iCount);
					if(iCount) {
						self.redis.set(key, iCount, 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(callback) {
		GameModel.count({
			active: true,
		},function(err, iCount) {
			callback(err, iCount);
		});
	}
};

//********************************video*************************************//
DbUtil.prototype.ListCategoryVideo = function(callback) {
	let self = this;
	let key = config.redis_key.category_video;

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db), 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(callback) {
		VideoTypeModel.find({
			active: true
		})
		.select('_id name name_ko_dau')
		.sort({sort: 1})
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

DbUtil.prototype.ListVideo = function(parent_id, page_size, page_index, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.list_video, parent_id, page_size, page_index);

	self.redis.get(key,function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(parent_id, page_size, page_index, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(parent_id, page_size, page_index, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db), 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(parent_id, page_size, page_index, callback) {
		VideoModel.find({
			parent_id: parent_id,
			active: true,
			deleted: false
		})
		.select('_id name name_ko_dau thumb')
		.sort({sort: 1})
		.skip(page_size * page_index)
		.limit(page_size)
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

DbUtil.prototype.ListAllVideo = function(page_size, page_index, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.list_all_video, page_size, page_index);

	self.redis.get(key,function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(page_size, page_index, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(page_size, page_index, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db), 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(page_size, page_index, callback) {
		VideoModel.find({
			// parent_id: parent_id,
			active: true,
			deleted: false
		})
		.select('_id name name_ko_dau thumb')
		.sort({sort: 1})
		.skip(page_size * page_index)
		.limit(page_size)
		.exec(function(err, list){
			callback(err, list);
		});
	}
};

DbUtil.prototype.ListRandomVideo = function(page_size, skip, callback) {
	// let self = this;
	// let key = utilModule.format(config.redis_key.list_all_game,page_size,page_index);

	// self.redis.get(key,function(err,data_cache){
	// 	if(err){
	// 		if(callback){
	// 			get_data(page_size,page_index,function(err,data_db){
	// 				callback(err,data_db);
	// 			});
	// 		}
	// 	}
	// 	else{
	// 		if(data_cache){
	// 			if(callback) callback(null,JSON.parse(data_cache));
	// 		}
	// 		else{
	// 			get_data(page_size,page_index,function(err,data_db){
	// 				if(callback) callback(err,data_db);
	// 				if(data_db){
	// 					self.redis.set(key,JSON.stringify(data_db));
	// 					self.redis.pexpire(key,300000);//300s
	// 				}
	// 			});
	// 		}
	// 	}
	// });

	// function get_data(page_size,page_index,callback){
		VideoModel.find({
			active: true,
			deleted: false
		})
		.select('_id name name_ko_dau thumb')
		.sort({sort: 1})
		.skip(skip)
		.limit(page_size)
		.exec(function(err, list) {
			callback(err, list);
		});
	// }
};

DbUtil.prototype.CountListVideo = function(parent_id, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.count_list_video, parent_id);

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(parent_id, function(err, iCount) {
					callback(err, iCount);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, data_cache);
			} else {
				get_data(parent_id, function(err, iCount) {
					if(callback) callback(err, iCount);
					if(iCount) {
						self.redis.set(key, iCount, 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(parent_id, callback) {
		VideoModel.count({
			parent_id: parent_id,
			active: true,
			deleted: false
		},function(err, iCount) {
			callback(err, iCount);
		});
	}
};

DbUtil.prototype.VideoInfo = function(id, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.video_info, id);

	self.redis.get(key,function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(id, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(id, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db), 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(id, callback) {
		VideoModel.findOne({
			_id: id,
			active: true,
			deleted: false
		})
		.select('_id name name_ko_dau video_type url thumb description content tags')
		// .sort({sort:1})
		// .skip(page_size*page_index)
		// .limit(page_size)
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

DbUtil.prototype.CountAllVideo = function(callback) {
	let self = this;
	let key = config.redis_key.count_all_video;

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(function(err, iCount) {
					callback(err, iCount);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, data_cache);
			} else {
				get_data(function(err, iCount) {
					if(callback) callback(err, iCount);
					if(iCount) {
						self.redis.set(key, iCount, 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(callback) {
		VideoModel.count({
			active: true,
			deleted: false
		},function(err, iCount) {
			callback(err, iCount);
		});
	}
};

//********************************exam event*************************************//
DbUtil.prototype.GetListExamEvent = function(callback) {
	let self = this;
	//let key = utilModule.format(config.redis_key.video_info,id);
	let key = config.redis_key.exam_event_list;

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db), 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(callback) {
		ExamEventTypeModel.findOne({
			active: true
		})
		.select('_id name name_ko_dau')
		// .sort({sort:1})
		// .skip(page_size*page_index)
		// .limit(page_size)
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

DbUtil.prototype.GetExamEventInfo = function(id, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.exam_event_info, id);

	self.redis.get(key,function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(id, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(id, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db), 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(id, callback) {
		ExamEventTypeModel.findOne({
			_id: id,
			active: true
		})
		.select('_id name name_ko_dau active time_begin time_end type')
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

DbUtil.prototype.GetExamEventGame = function(type_id, class_id, callback) {
	let self = this;
	let key = utilModule.format(config.redis_key.exam_event_game, type_id, class_id);

	self.redis.get(key, function(err, data_cache) {
		if(err) {
			if(callback) {
				get_data(type_id, class_id, function(err, data_db) {
					callback(err, data_db);
				});
			}
		} else {
			if(data_cache) {
				if(callback) callback(null, JSON.parse(data_cache));
			} else {
				get_data(type_id, class_id, function(err, data_db) {
					if(callback) callback(err, data_db);
					if(data_db) {
						self.redis.set(key, JSON.stringify(data_db), 'EX', 300);
						// self.redis.pexpire(key,300000);//300s
					}
				});
			}
		}
	});

	function get_data(type_id, class_id, callback) {
		ExamEventModel.findOne({
			type_id: type_id,
			class_id: class_id
		})
		.select('_id game_id play time spq answers content')
		.exec(function(err, list) {
			callback(err, list);
		});
	}
};

module.exports = DbUtil;