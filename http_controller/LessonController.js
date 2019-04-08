'use strict';
let async = require('async');
let logger = require('tracer').colorConsole();
let express = require('express');
let utilModule = require('util');
let util = require('../util/util');

let router = express.Router();

router.get('/', function(req, res) {
	try{
		let redis = req.redis;
		let config = req.config;
		let DbUtil = req.DbUtil;

		let param_render = {};
		// let user = req.tndata.user;
		// if(user){
		// 	let user_id = user._id;
		// 	if(user_id){
				// param_render.user = req.tndata.user;
				let baseUrl = req.baseUrl;
				param_render.baseUrl=baseUrl;
				let type_id = 0;
				if(baseUrl=='/hoc-online-toan'){
					type_id = 1;
					param_render.title='Học toán online - Trạng Nguyên';
					param_render.subjects='Toán';
				}
				else if(baseUrl=='/hoc-online-tieng-anh'){
					type_id = 2;
					param_render.title='Học Tiếng Anh online - Trạng Nguyên';
					param_render.subjects='Tiếng Anh';
				}
				else if(baseUrl=='/hoc-online-tieng-viet'){
					type_id = 3;
					param_render.title='Học Tiếng Việt online - Trạng Nguyên';
					param_render.subjects='Tiếng Việt';
				}
				if(type_id>0){
					//let class_id = user.class_id;
					async.waterfall([
						function(callback){
							DbUtil.LessionNew(type_id,function(err,lesson_info){
								if(err){
									logger.error(err);
								}
								else{
									if(lesson_info){
										param_render.lesson_info = lesson_info;
										// param_render.fb_comment = config.domain + '/lesson/' + lesson_info._id;
										callback(false,lesson_info._id);
									}
									else{
										callback(true,null);
									}
								}
							});
						},
						function(id,callback){
							param_render.icount = 0;
							let key_count = utilModule.format(config.redis_key.count_read_lesson, id);
							redis.incr(key_count,function(err,count){
								if(err) console.log(err);
								else param_render.icount = count;
								callback(false,id);
							});
						},
						// function(id,callback){
						// 	DbUtil.ListLession(type_id,class_id,10,0,id,function(err,list){
						// 		if(err){
						// 			logger.error(err);
						// 		}
						// 		else{
						// 			param_render.list_lesson = list;
						// 			callback(false,null);
						// 		}
						// 	});
						// }
					],function(){
						res.render('lesson', param_render);
					});
				}
				else{
					res.redirect('/');
				}
		// 	}
		// 	else{
		// 		res.redirect('/');
		// 	}
		// }
		// else{
		// 	res.redirect('/');
		// }
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.get('/list-other', function(req, res) {
	try{
		let page_index = util.parseInt(req.query.trang);
		// let config = req.config;
		let DbUtil = req.DbUtil;

		let page_size = 10;

		let param_render = {
			page_index:page_index,
			page_size:page_size,
			error:0,
			message:'done'
		};
		// let user = req.tndata.user;
		// if(user){
		// 	let user_id = user._id;
		// 	if(user_id){
				// param_render.user = user;
				let baseUrl = req.baseUrl;
				param_render.baseUrl=baseUrl;
				let type_id = 0;
				if(baseUrl=='/hoc-online-toan'){
					type_id = 1;
				}
				else if(baseUrl=='/hoc-online-tieng-anh'){
					type_id = 2;
				}
				else if(baseUrl=='/hoc-online-tieng-viet'){
					type_id = 3;
				}
				if(type_id>0){
					//let class_id = user.class_id;
					async.parallel([
						function(callback){
							DbUtil.ListLession(type_id,page_size,page_index,0,function(err,list){
								if(err){
									logger.error(err);
								}
								else{
									param_render.content = list;
									callback(false,null);
								}
							});
						},
						function(callback){
							DbUtil.CountListLessonOther(type_id,function(err,iCount){
								if(err){
									logger.error(err);
								}
								else{
									param_render.total_rows=iCount;
									callback(false,null);
								}
							});
						}
					],function(){
						res.json(param_render);
					});
				}
				else{
					res.json({error:2,message:'Không tồn tại môn học này',baseUrl:baseUrl});
				}
		// 	}
		// 	else{
		// 		res.json({error:1,message:'bạn chưa đăng nhập'});
		// 	}
		// }
		// else{
		// 	res.json({error:1,message:'bạn chưa đăng nhập'});
		// }
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.get('/:name_ko_dau?.:id?', function(req, res) {
	try{
		let redis = req.redis;
		let config = req.config;
		let DbUtil = req.DbUtil;

		let param_render = {};
		// let user = req.tndata.user;
		// if(user){
		// 	let user_id = user._id;
		// 	if(user_id){
				// param_render.user = req.tndata.user;
				let baseUrl = req.baseUrl;
				param_render.baseUrl=baseUrl;
				let type_id = 0;
				let id = util.parseInt(req.params.id);
				if(baseUrl=='/hoc-online-toan'){
					type_id = 1;
					param_render.title='Học toán online - Trạng Nguyên';
					param_render.subjects='Toán';
				}
				else if(baseUrl=='/hoc-online-tieng-anh'){
					type_id = 2;
					param_render.title='Học Tiếng Anh online - Trạng Nguyên';
					param_render.subjects='Tiếng Anh';
				}
				else if(baseUrl=='/hoc-online-tieng-viet'){
					type_id = 3;
					param_render.title='Học Tiếng Việt online - Trạng Nguyên';
					param_render.subjects='Tiếng Việt';
				}
				if(type_id>0 && id>0){
					//let class_id = user.class_id;
					async.waterfall([
						function(callback){
							DbUtil.LessionInfo(id,function(err,lesson_info){
								if(err){
									logger.error(err);
								}
								else{
									if(lesson_info){
										param_render.lesson_info = lesson_info;
										// param_render.fb_comment = config.domain + '/lesson/' + lesson_info._id;
										callback(false,lesson_info._id);
									}
									else{
										callback(true,id);
									}
								}
							});
						},
						function(id,callback){
							param_render.icount = 0;
							let key_count = utilModule.format(config.redis_key.count_read_lesson, id);
							redis.incr(key_count,function(err,count){
								if(err) console.log(err);
								else param_render.icount = count;
								callback(false,id);
							});
						}
					],function(){
						res.render('lesson', param_render);
					});
				}
				else{
					res.redirect('/');
					// console.log(req.params);
				}
		// 	}
		// 	else{
		// 		res.redirect('/');
		// 	}
		// }
		// else{
		// 	res.redirect('/');
		// }
	}
	catch(e){
		logger.error(e.stack);
	}
});

module.exports = router;