'use strict';
let utilModule = require('util');
let config = require('./config/config');

function ConnectMgr(redis){
	this.redis = redis;
}

// ConnectMgr.prototype.count_connect_exam = function(user_id,callback){
// 	this.redis.get(config.redis_key.count_connect_exam,function(err,count){
// 		if(callback) callback(err,count?count:0);
// 	});
// };

// ConnectMgr.prototype.count_connect = function(user_id,callback){
// 	this.redis.get(utilModule.format(config.redis_key.is_user_play_exam,user_id),function(err,count){
// 		if(callback) callback(err,count?count:0);
// 	});
// };

// ConnectMgr.prototype.incr_connect = function(user_id,callback){
// 	this.redis.incr(utilModule.format(config.redis_key.is_user_play_exam,user_id),function(err,count){
// 		if(callback) callback(err,count);
// 	});
// };

// ConnectMgr.prototype.decr_connect = function(user_id,callback){
// 	this.redis.decr(utilModule.format(config.redis_key.is_user_play_exam,user_id),function(err,count){
// 		if(callback) callback(err,count);
// 	});
// 	// this.redis.decr(config.redis_key.count_connect_exam);
// };

// ConnectMgr.prototype.delete_count = function(user_id,callback){
// 	this.redis.del(utilModule.format(config.redis_key.is_user_play_exam,user_id),function(err, reply) {
// 		if(callback) callback(err,reply);
// 	});
// };

// ConnectMgr.prototype.set_connect = function(user_id,n,callback){
// 	this.redis.set(utilModule.format(config.redis_key.is_user_play_exam,user_id),n);
// };

ConnectMgr.prototype.GetConnect = function(user_id,callback){
	let key = utilModule.format(config.redis_key.is_user_play_exam,user_id);
	this.redis.get(key,function(err,value){
		if(callback) callback(err,value);
	});
};

ConnectMgr.prototype.SetConnect = function(user_id,socket_id,callback){
	let key = utilModule.format(config.redis_key.is_user_play_exam,user_id);
	this.redis.set(key,socket_id,function(err,reply){
		if(callback) callback(err,reply);
	});
};

ConnectMgr.prototype.DelConnect = function(user_id,callback){
	let key = utilModule.format(config.redis_key.is_user_play_exam,user_id);
	this.redis.del(key,function(err,reply){
		if(callback) callback(err,reply);
	});
};

ConnectMgr.prototype.clear = function(){
	let self = this;
	this.redis.keys(utilModule.format(config.redis_key.is_user_play_exam,'*'), function (err, keys) {
		if (err) return console.log(err);
		for(let i = 0, len = keys.length; i < len; i++) {
			self.redis.del(keys[i]);
		}
	});
	// this.redis.keys(utilModule.format(config.redis_key.count_connect_exam_type,'*'), function (err, keys) {
	// 	if (err) return console.log(err);
	// 	for(let i = 0, len = keys.length; i < len; i++) {
	// 		this.redis.del(keys[i]);
	// 	}
	// });
	// this.redis.del(config.redis_key.count_connect_exam);
};

// ConnectMgr.prototype.incr_connect_type = function(type_id,callback){
// 	this.redis.incr(utilModule.format(config.redis_key.count_connect_exam_type,type_id),function(err,count){
// 		if(callback) callback(err,count);
// 	});
// };

// ConnectMgr.prototype.decr_connect_type = function(type_id,callback){
// 	this.redis.decr(utilModule.format(config.redis_key.count_connect_exam_type,type_id),function(err,count){
// 		if(callback) callback(err,count);
// 	});
// };

// ConnectMgr.prototype.count_connect_type = function(type_id,callback){
// 	this.redis.get(utilModule.format(config.redis_key.count_connect_exam_type,type_id),function(err,count){
// 		if(callback) callback(err,count?count:0);
// 	});
// };

module.exports = ConnectMgr;