'use strict';
let logger = require('tracer').colorConsole();
let async = require('async');
// let UsersModel = require('../model/UsersModel');
let express = require('express');
let ScoreModel = require('../model/ScoreModel');
let UsersModel = require('../model/UsersModel');
let util = require('../util/util');
// config = require('../config/config');

let router = express.Router();

router.get('/', function(req, res) {
	try{
		let redis = req.redis;
		// let util = req.util;
		// let config = req.config;
		// let dir_root = req.dir_root;
		// let DbUtil = req.DbUtil;

		// let redis_key = config.redis_key;

		// let key_rank = redis_key.rank.type;
		let param_render = {};
		// param_render.user = req.tndata.user;//param_render.user = req.session.user;

		// //title
		param_render.title='Bảng Vàng - Trạng Nguyên';
		res.render('bang-vang', param_render);
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.post('/', function(req, res) {
	try{
		// let util = req.util;
		// let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		DbUtil.CountTopProvince(function(err,list){
			if(err){
				logger.error(err);
			}
			else{
				let jMessage = {
					error:0,
					message:'ok',
					content:list
				};
				res.json(jMessage);
			}
		});
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.post('/national-home', function(req, res) {
	try{
		// let redis = req.redis;
		let util = req.util;
		// let config = req.config;
		let DbUtil = req.DbUtil;

		let jResponse = {};
		let class_id = util.parseInt(req.body.class_id);
		let jWhere = {active: true};
		if(class_id>0 && class_id<=6){
			jWhere.class_id = class_id;
			async.parallel([
				function(callback) {
					DbUtil.TopRank(jWhere, 0, 3, false,function(err,result){
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
				jResponse.message = '';
				res.json(jResponse);
			});
		}
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.post('/province-home', function(req, res) {
	try{
		// let redis = req.redis;
		let util = req.util;
		// let config = req.config;
		let DbUtil = req.DbUtil;

		let jResponse = {};

		let province_id = req.body.province_id;
		if(province_id && util.isOnlyNumber(province_id)){
			province_id = util.parseInt(province_id);
			if(province_id>0){
				let class_id = util.parseInt(req.body.class_id);
				let jWhere = {active: true};
				jWhere.province_id=province_id;
				if(class_id>0 && class_id<=6) jWhere.class_id = class_id;
				async.parallel([
					function(callback) {
						DbUtil.TopRank(jWhere, 0, 3, false, function(err,result){
							if(err){
								logger.error(err);
							}
							else{
								jResponse.content=result.content;
								// jResponse.total_rows=result.count;
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
		}
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.get('/toan-quoc', function(req, res) {
	try{
		// let redis = req.redis;
		// let util = req.util;
		// let log = req.log;
		// let config = req.config;
		// let dir_root = req.dir_root;
		// let DbUtil = req.DbUtil;
		// let redis_key = config.redis_key;

		let param_render ={
			user: req.tndata.user,
			page_title: 'Bảng xếp hạng toàn quốc theo lớp (cập nhật 1h/lần)',
			title: 'Bảng vàng toàn quốc - Trạng Nguyên',
			eventname: 'Xếp hạng toàn quốc'
		};
		res.render('bang-vang-class', param_render);
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.post('/toan-quoc', function(req, res) {
	try{
		// let redis = req.redis;
		let util = req.util;
		// let config = req.config;
		let DbUtil = req.DbUtil;

		let page_size = 100;
		let class_id = util.parseInt(req.query.lop);
		let page_index = util.parseInt(req.query.trang);
		let jWhere = {active: true};
		if(class_id<=0 || class_id>6) class_id = 1;

		let jResponse = {page_index:page_index,page_size:page_size,class_id: class_id};
		jWhere.class_id = class_id;
		async.parallel([
			function(callback) {
				DbUtil.TopRank(jWhere, page_index, page_size, true, function(err,result){
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
			jResponse.message = '';
			res.json(jResponse);
		});
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.get('/tinh-tp', function(req, res) {
	try{
		// let redis = req.redis;
		let util = req.util;
		// let log = req.log;
		let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		// let redis_key = config.redis_key;

		let param_render = {
			user: req.tndata.user,
			page_title: 'Số học sinh dự thi online theo Tỉnh/ TP'
		};
		// param_render.title='Bảng Vàng - Trạng Nguyên';
		let province_id = req.params.tinh;
		if(province_id && util.isOnlyNumber(province_id)){
			province_id = util.parseInt(province_id);
			if(province_id>0){
				param_render.province_id = province_id;
				DbUtil.GetProvinceInfo(province_id,function(err,docs){
					if(err){
						logger.error(err);
						param_render={error:10000,message:'Máy chủ đang bận, vui lòng thử lại sau'};
					}
					else{
						if(docs){
							param_render.province_name = docs;
							param_render.title='Bảng Vàng - ' + docs + ' - Trạng Nguyên';
							res.render('bang-vang-2', param_render);
						}
					}
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
		logger.error(e.stack);
	}
});

router.post('/tinh-tp', function(req, res) {
	try{
		// let redis = req.redis;
		let util = req.util;
		// let config = req.config;
		let DbUtil = req.DbUtil;

		let page_size = 100;
		let province_id = util.parseInt(req.query.tinh);
		let class_id = util.parseInt(req.query.lop);
		let page_index = util.parseInt(req.query.trang);
		let jWhere = {active: true};
		if(class_id>0 && class_id<=6){
			let jResponse = {page_index:page_index,page_size:page_size,class_id: class_id, province_id: province_id};
			jWhere.class_id = class_id;
			async.parallel([
				function(callback) {
					DbUtil.TopRank(jWhere, page_index, page_size, true, function(err,result){
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
				jResponse.message = '';
				res.json(jResponse);
			});
		}
	}
	catch(e){
		logger.error(e.stack);
	}
});

//province
router.get('/:tinh', function(req, res) {
	try{
		// let redis = req.redis;
		let util = req.util;
		// let log = req.log;
		// let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		// let redis_key = config.redis_key;

		let param_render = {
			user:req.tndata.user,
			page_title: 'Số học sinh dự thi online theo Tỉnh/ TP'
		};

		let province_id = req.params.tinh;
		if(province_id && util.isOnlyNumber(province_id)){
			province_id = util.parseInt(province_id);
			if(province_id>0){
				param_render.province_id = province_id;
				DbUtil.GetProvinceInfo(province_id,function(err,docs){
					if(err){
						logger.error(err);
						param_render={error:10000,message:'Máy chủ đang bận, vui lòng thử lại sau'};
					}
					else{
						if(docs){
							param_render.province_name = docs;
							param_render.title='Bảng Vàng - ' + docs + ' - Trạng Nguyên';
							res.render('bang-vang-2', param_render);
						}
					}
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
		logger.error(e.stack);
	}
});

router.post('/:tinh', function(req, res) {
	try{
		// let redis = req.redis;
		// let util = req.util;
		// let log = req.log;
		// let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		let province_id = req.params.tinh;
		if(province_id && util.isOnlyNumber(province_id)){
			province_id = util.parseInt(province_id);
			if(province_id>0){
				let jResponse ={province_id:province_id,prefix:'/'+province_id};
				async.waterfall([
					function(callback) {
						DbUtil.CountTopDistrict(province_id,function(err,data){
							if(err){
								logger.error(err);
							}
							else{
								jResponse.content=data;
							}
							callback(err,null);
						})
					}
				],function(list_err,list_result){
					jResponse.error = 0;
					jResponse.message = 'ok';
					res.json(jResponse);
				});
			}
		}
	}
	catch(e){
		logger.error(e.stack);
	}
});
//end province

//district
router.get('/:tinh/:huyen', function(req, res) {
	try{
		// let redis = req.redis;
		let util = req.util;
		// let log = req.log;
		// let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;
		// let redis_key = config.redis_key;

		let param_render = {
			user:req.tndata.user
		};

		// param_render.title='Bảng Vàng - Trạng Nguyên';

		let province_id = req.params.tinh;
		let district_id = req.params.huyen;
		if(province_id && util.isOnlyNumber(province_id) && district_id && util.isOnlyNumber(district_id)){
			province_id = util.parseInt(province_id);
			district_id = util.parseInt(district_id);
			if(province_id>0 && district_id>0){
				param_render.province_id = province_id;
				param_render.district_id = district_id;
				async.waterfall([
					function(callback) {
						DbUtil.GetProvinceInfo(province_id,function(err,docs){
							if(err){
								logger.error(err);
								param_render={error:10000,message:'Máy chủ đang bận, vui lòng thử lại sau'};
							}
							else{
								if(docs){
									param_render.province_name = docs;
								}
							}
							callback(err,null);
						});
					},
					function(data,callback){
						DbUtil.GetDistrictInfo(district_id,function(err,docs){
							if(err){
								logger.error(err);
								param_render={error:10000,message:'Máy chủ đang bận, vui lòng thử lại sau'};
							}
							else{
								if(docs){
									param_render.district_name = docs;
								}
							}
							callback(err,null);
						});
					}
				],
				function(){
					if(param_render.error!=0){
						param_render.title='Bảng Vàng - ' + param_render.district_name + ' - ' + param_render.province_name + ' - Trạng Nguyên';
						param_render.page_title='Số học sinh dự thi theo quận/huyện';
						res.render('bang-vang-2', param_render);
					}
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
		logger.error(e.stack);
	}
});

router.post('/:tinh/:huyen', function(req, res) {
	try{
		// let redis = req.redis;
		// let util = req.util;
		// let log = req.log;
		// let config = req.config;
		// let dir_root = req.dir_root;
		// let DbUtil = req.DbUtil;

		let province_id = req.params.tinh;
		let district_id = req.params.huyen;
		if(province_id && util.isOnlyNumber(province_id) && district_id && util.isOnlyNumber(district_id)){
			province_id = util.parseInt(province_id);
			district_id = util.parseInt(district_id);
			if(province_id>0 && district_id>0){
				let jResponse ={province_id:province_id,prefix:'/'+province_id+'/'+district_id};
				async.waterfall([
					function(callback) {
						/*ScoreModel.db.db.eval("rank_count_top_school(" + district_id + ")",function(err,list){
							if(err){
								logger.error(err);
							}
							else{
								// jResponse.content=list._firstBatch;
								jResponse.content=list._batch?list._batch:list._firstBatch;
							}
							callback(err,null);
						});*/

						UsersModel.aggregate([
						{
							$match:{
								district_id:district_id,
								active: true
							}
						},{
							$group: {
									_id:{
										id: "$school_id",
										name: "$school_name"
									},
									count: {$sum: 1}
								}
							}
						],(err, results)=>{
							if(err){
								logger.error(err);
							}
							else{
								jResponse.content = results;
							}
							callback(err,null);
						});
					}
				],function(){
					jResponse.error = 0;
					jResponse.message = 'ok';
					res.json(jResponse);
				});
			}
		}
	}
	catch(e){
		logger.error(e.stack);
	}
});
//end district

//school
router.get('/:tinh/:huyen/:truong', function(req, res) {
	try{
		// let redis = req.redis;
		let util = req.util;
		// let log = req.log;
		// let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		// let redis_key = config.redis_key;

		let param_render = {
			user: req.tndata.user
		};

		let province_id = req.params.tinh;
		let district_id = req.params.huyen;
		let school_id = req.params.truong;
		if(province_id && util.isOnlyNumber(province_id) && district_id && util.isOnlyNumber(district_id) && school_id && util.isOnlyNumber(school_id)){
			province_id = util.parseInt(province_id);
			district_id = util.parseInt(district_id);
			school_id = util.parseInt(school_id);
			if(province_id>0 && district_id>0 && school_id>0){
				param_render.province_id = province_id;
				param_render.district_id = district_id;
				param_render.school_id = school_id;
				async.waterfall([
					function(callback) {
						DbUtil.GetProvinceInfo(province_id,function(err,docs){
							if(err){
								logger.error(err);
								param_render={error:10000,message:'Máy chủ đang bận, vui lòng thử lại sau'};
							}
							else{
								if(docs){
									param_render.province_name = docs;
								}
							}
							callback(err,null);
						});
					},
					function(data,callback){
						DbUtil.GetDistrictInfo(district_id,function(err,docs){
							if(err){
								logger.error(err);
								param_render={error:10000,message:'Máy chủ đang bận, vui lòng thử lại sau'};
							}
							else{
								if(docs){
									param_render.district_name = docs;
								}
							}
							callback(err,null);
						});
					},
					function(data,callback){
						DbUtil.GetSchoolInfo(school_id,function(err,docs){
							if(err){
								logger.error(err);
								param_render={error:10000,message:'Máy chủ đang bận, vui lòng thử lại sau'};
							}
							else{
								if(docs){
									param_render.school_name = docs;
								}
							}
							callback(err,null);
						});
					}
				],
				function(){
					if(param_render.error!=0){
						param_render.title='Bảng Vàng - ' + param_render.school_name + ' - ' + param_render.district_name + ' - ' + param_render.province_name + ' - Trạng Nguyên';
						param_render.page_title='Số học sinh dự thi theo trường';
						res.render('bang-vang-3', param_render);
					}
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
		logger.error(e.stack);
	}
});

router.post('/:tinh/:huyen/:truong', function(req, res) {
	try{
		// let redis = req.redis;
		let util = req.util;
		// let log = req.log;
		let config = req.config;
		let DbUtil = req.DbUtil;
		// let redis_key = config.redis_key;

		let province_id = req.params.tinh;
		let district_id = req.params.huyen;
		let school_id = req.params.truong;
		if(province_id && util.isOnlyNumber(province_id) && district_id && util.isOnlyNumber(district_id) && school_id && util.isOnlyNumber(school_id)){
			province_id = util.parseInt(province_id);
			district_id = util.parseInt(district_id);
			school_id = util.parseInt(school_id);
			if(province_id>0 && district_id>0 && school_id>0){
				let page_index = util.parseInt(req.query.trang);
				let class_id = util.parseInt(req.query.lop);
				let jResponse = {page_index:page_index,page_size:config.page_size_user};
				let jWhere = {school_id:school_id,active: true};
				if(class_id>0 && class_id<=6) jWhere.class_id = class_id;
				async.parallel([
					function(callback) {
						DbUtil.TopScoreSchool(jWhere,page_index,config.page_size_user,function(err,result){
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
		}
	}
	catch(e){
		logger.error(e.stack);
	}
});
//end school

module.exports = router;