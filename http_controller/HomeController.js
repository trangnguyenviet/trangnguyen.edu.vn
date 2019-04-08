'use strict';
let logger = require('tracer').colorConsole();
let async = require('async');
let utilModule = require('util');
let express = require('express');
// let util = require('../util/util');

let router = express.Router();

/*GET home page*/
router.get('/', function(req, res) {
	try{
		let redis = req.redis;
		let util = req.util;
		// let log = req.log;
		let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		// let redis_key = config.redis_key;

		// let key_rank = redis_key.rank.type;
		let param_render = {user: req.tndata.user};

		//title
		param_render.title='Trạng Nguyên - Học trực tuyến - Thi Trực Tiếp - Tiếng Việt, Olympic Toán - Tiếng Anh - Phát triển trí thông minh đa diện';

		let toan_config = config.exam_olympic_toan;
		let english_config = config.exam_olympic_english;
		let cuoituan_config = config.exam_olympic_tiengviet;
		let exam_khoahoc_tunhien = config.exam_khoahoc_tunhien;
		let exam_su_dia_xahoi = config.exam_su_dia_xahoi;
		let exam_iq_toan_tienganh = config.exam_iq_toan_tienganh;

		let key_current_round_toan = utilModule.format(config.exam.current_round,toan_config.id);
		let key_current_round_english = utilModule.format(config.exam.current_round,english_config.id);
		let key_current_round_cuoituan = utilModule.format(config.exam.current_round,cuoituan_config.id);
		let key_khoahoc_tunhien = utilModule.format(config.exam.current_round,exam_khoahoc_tunhien.id);
		let key_su_dia_xahoi = utilModule.format(config.exam.current_round,exam_su_dia_xahoi.id);
		let key_iq_toan_tienganh = utilModule.format(config.exam.current_round,exam_iq_toan_tienganh.id);

		async.parallel([
			//class 1
			function(callback){
				DbUtil.TopScoreClass(1,1,function(err,data){
					if(err){
						logger.error(err);
					}
					else{
						param_render.top_class_1 = data?data[0]:null;
					}
					callback(null, true);
				});
			},
			//class 2
			function(callback){
				DbUtil.TopScoreClass(2,1,function(err,data){
					if(err){
						logger.error(err);
					}
					else{
						param_render.top_class_2 = data?data[0]:null;
					}
					callback(null, true);
				});
			},
			//class 3
			function(callback){
				DbUtil.TopScoreClass(3,1,function(err,data){
					if(err){
						logger.error(err);
					}
					else{
						param_render.top_class_3 = data?data[0]:null;
					}
					callback(null, true);
				});
			},
			//class 4
			function(callback){
				DbUtil.TopScoreClass(4,1,function(err,data){
					if(err){
						logger.error(err);
					}
					else{
						param_render.top_class_4 = data?data[0]:null;
					}
					callback(null, true);
				});
			},
			//class 5
			function(callback){
				DbUtil.TopScoreClass(5,1,function(err,data){
					if(err){
						logger.error(err);
					}
					else{
						param_render.top_class_5 = data?data[0]:null;
					}
					callback(null, true);
				});
			},
			//news
			function(callback) {
				//tin tức giáo dục
				let path = '/tin-giao-duc';
				DbUtil.GetListNewsHome(path,8,function(err,results){
					if(err){
						logger.error(err);
					}
					else{
						param_render.list_news_giaoduc = results;
					}
					callback(null, true);
				});
			},
			// function(callback) {
			// 	//tin tức ban tổ chức
			// 	let path = '/tin-tu-ban-to-chuc';
			// 	DbUtil.GetListNewsHome(path,8,function(err,results){
			// 		if(err){
			// 			logger.error(err);
			// 		}
			// 		else{
			// 			param_render.list_news_bantochuc = results;
			// 		}
			// 		callback(null, true);
			// 	});
			// },
			function(callback){
				DbUtil.GetParamInfo(key_current_round_toan,function(err,value){
					toan_config.current_round=value;
					param_render.exam_olympic_toan=toan_config;
					callback(null, value);
				});
			},
			function(callback){
				DbUtil.GetParamInfo(key_current_round_english,function(err,value){
					english_config.current_round=value;
					param_render.exam_olympic_english=english_config;
					callback(null, value);
				});
			},
			function(callback){
				DbUtil.GetParamInfo(key_current_round_cuoituan,function(err,value){
					cuoituan_config.current_round=value;
					param_render.exam_olympic_cuoituan=cuoituan_config;
					callback(null, value);
				});
			},
			//new
			function(callback){
				DbUtil.GetParamInfo(key_khoahoc_tunhien,function(err,value){
					exam_khoahoc_tunhien.current_round=value;
					param_render.exam_khoahoc_tunhien=exam_khoahoc_tunhien;
					callback(null, value);
				});
			},
			function(callback){
				DbUtil.GetParamInfo(key_su_dia_xahoi,function(err,value){
					exam_su_dia_xahoi.current_round=value;
					param_render.exam_su_dia_xahoi=exam_su_dia_xahoi;
					callback(null, value);
				});
			},
			function(callback){
				DbUtil.GetParamInfo(key_iq_toan_tienganh,function(err,value){
					exam_iq_toan_tienganh.current_round=value;
					param_render.exam_iq_toan_tienganh=exam_iq_toan_tienganh;
					callback(null, value);
				});
			},
			//provinces
			function(callback){
				redis.get(config.redis_key.province,function(err,data){
					if(err){
						logger.error('register province: ' + err);
					}
					else{
						if(data){
							param_render.provinces = util.parseJson(data);
							callback(null, true);
						}
						else{
							let ProvinceModel = require('../model/ProvinceModel');
							ProvinceModel.find({}).select('_id name').exec(function(err,data){
								if(err){
									logger.error('register province: ' + err);
								}
								else{
									param_render.provinces = data;
									callback(null, true);
									redis.set(config.redis_key.province,JSON.stringify(data));
								}
							});
						}
					}
				});
			},
			callback => {
				let key = config.redis_key.count_member;
				redis.get(key,(err,count)=>{
					if(err){
						param_render.total_member=0;
						callback(null, true);
						logger.error(err);
					}
					else{
						if(count){
							param_render.total_member=count;
							callback(null, true);
						}
						else{
							//load db
							let UsersModel = require('../model/UsersModel');
							UsersModel.count({},(err,count)=>{
								if(err){
									param_render.total_member=0;
									callback(null, true);
									logger.error(err);
								}
								else{
									param_render.total_member=count;
									callback(null, true);
									redis.set(key,count);
								}
							});
						}
					}
				});
			}
		],function(){
			res.render('home', param_render);
		});
	}
	catch(e){
		logger.error(e.stack);
	}
});

module.exports = router;