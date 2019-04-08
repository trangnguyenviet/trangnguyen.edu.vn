'use strict';
let async = require('async');
let logger = require('tracer').colorConsole();
let express = require('express');
let UsersModel = require('../model/UsersModel');
let util = require('../util/util');

let router = express.Router();

router.get('/', function(req, res) {
	try{
		let redis = req.redis;
		let util = req.util;
		let config = req.config;
		let DbUtil = req.DbUtil;

		let param_render = {
			user: req.tndata.user
		};

		if(req.tndata.user){
			let user_id = req.tndata.user._id;
			if(user_id){
				async.parallel([
					callback => {
						//user info
						GetInfo(redis,config,user_id,function(result){
							param_render.error = result.error;
							param_render.message = result.message;
							param_render.userinfo = result.userinfo;
							//title
							if(result.userinfo){
								param_render.title=result.userinfo.name + ' - ID: ' + result.userinfo._id + ' - Trạng Nguyên';
							}
							else{
								param_render.title='Không tìm thấy thông tin người dùng - Trạng Nguyên';
							}
							callback(null, true);
						});
					},
					callback => {
						DbUtil.GetVip(user_id,function(err,vip_expire){
							if(err){
								logger.error(err);
							}
							else{
								param_render.vip_expire = util.date2String3(vip_expire);
							}
							callback(null, true);
						});
					},
					// callback => {
					//
					// }
				],
				function(list_err,list_result){
					param_render.is_self = true;
					res.render('profiler', param_render);
				});
			}
			else{
				param_render.error=2;
				param_render.message='Không tìm thấy thông tin người dùng';
				res.render('profiler', param_render);
			}
		}
		else{
			//Bạn chưa đăng nhập
			param_render.error=1;
			param_render.message='Bạn chưa đăng nhập';
			res.render('profiler', param_render);
		}
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
	}
});

router.get('/:id?', function(req, res) {
	try{
		let redis = req.redis;
		// let util = req.util;
		// let log = req.log;
		let config = req.config;
		// let dir_root = req.dir_root;

		let param_render = {};

		if(req.params.id){
			let user_id = req.params.id;
			param_render.user_id=user_id;
			if(user_id){
				async.parallel([
					function(callback) {
						//user info
						GetInfo(redis, config, user_id, function(result) {
							param_render=result;
							//title
							if(result && result.userinfo){
								param_render.title=result.userinfo.name + ' - ID: ' + result.userinfo._id + ' - Trạng Nguyên';
							} else {
								param_render.title='Không tìm thấy thông tin người dùng - Trạng Nguyên';
							}
							callback(null, true);
						});
					}
				],
				function(list_err, list_result){
					if (req.tndata.user){
						// param_render.user = req.tndata.user;
						param_render.self_id = req.tndata.user._id;
					}
					param_render.is_self = (param_render.self_id == user_id);
					res.render('profiler', param_render);
				});
			}
			else{
				param_render.error=2;
				param_render.message='Không tìm thấy thông tin người dùng';
				res.render('profiler', param_render);
			}
		}
		else{
			//Bạn chưa đăng nhập
			param_render.error=1;
			param_render.message='Bạn chưa đăng nhập';
			res.render('profiler', param_render);
		}
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
	}
});

function GetInfo(redis,config,user_id,callback_result){
	try{
		let response = {};
		if(user_id>0){
			let key_info = config.redis_key.user_info + user_id;
			redis.get(key_info,function(err,user_info){
				if(err){
					response.error=30000;
					response.message='Hệ thồng đang bận, vui lòng thử lại sau';
					logger.error(err);
					callback_result(response);
				}
				else{
					//user info in cache
					if(user_info){
						response.error=0;
						response.message='';
						response.userinfo = JSON.parse(user_info);
						callback_result(response);
					}
					else{
						//load new user
						UsersModel.findOne({
							_id:user_id,
							deleted: false
						})
						.select('_id name username active vip_expire birthday province_id province_name district_id district_name school_id school_name class_id class_name address created_at')
						.exec(function(err,result){
							if(err){
								response.error=20000;
								response.message='Hệ thống đang bận, vui lòng thử lại sau';
								logger.error(err);
							}
							else{
								if(result){
									response.error=0;
									response.message='';

									result.birthday_view = util.date2String5(result.birthday);
									response.userinfo = result;

									redis.set(key_info,JSON.stringify(result));
									redis.pexpire(key_info,600000);//600s
								}
								else{
									response.error=2;
									response.message='Không tìm thấy thông tin người dùng';
								}
							}
							callback_result(response);
						});
					}
				}
			});
		}
		else{
			callback_result(null);
		}
	}
	catch(e){
		logger.error(e.stack);
	}
}

module.exports = router;