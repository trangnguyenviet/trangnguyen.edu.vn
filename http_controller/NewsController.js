'use strict';
let async = require('async');
let logger = require('tracer').colorConsole();
let utilModule = require('util');
let express = require('express');
let NewsModel = require('../model/NewsModel');
let router = express.Router();

router.get('/', function(req, res) {
	let redis = req.redis;
	let util = req.util;
	let config = req.config;

	try{
		let baseUrl = req.baseUrl;
		let category_obj = config.category.get_id[baseUrl];
		if(category_obj){
			let page_index = util.parseInt(req.query.trang);

			let key_cache = utilModule.format(config.redis_key.list_news, category_obj.id,page_index);
			let param_render = {
				sendStatus:200,
				baseUrl:baseUrl,
				base_name:category_obj.name
			};
			redis.get(key_cache,function(err,data){
				if(err){
					logger.error(err);
					res.sendStatus('500');
				}
				else{
					if(data){
						param_render=JSON.parse(data);
						// param_render.user = req.tndata.user;//param_render.user = req.session.user;
						res.render('list_news', param_render);
					}
					else{
						async.waterfall([
							function(callback){
								let data= {};
								NewsModel.count({
									parent_id: category_obj.id,
									deleted: false,
									active: true
								},function(err,count){
									if(err){
										logger.error(err);
										param_render.sendStatus=500;
										callback(err, data);
									}
									else{
										data.count = count?count:0;
										callback(null, data);
									}
								});
							},
							function(data,callback){
								if(data.count>0){
									let page_size = config.category.list_news_size;
									data.page_size = page_size;
									NewsModel.find({
										parent_id: category_obj.id,
										deleted: false,
										active: true
									})
									.select('_id name name_ko_dau thumb description created_at')
									.sort({sort:1,created_at:-1})
									.skip(page_size*page_index).limit(page_size)
									.exec(function(err,results){
										if(err){
											logger.error(err);
											param_render.sendStatus=500;
											callback(err, data);
										}
										else{
											if(results){
												param_render.title= category_obj.name + ' - Trạng Nguyên';
												param_render.name = category_obj.name;
												for(let i=0;i<results.length;i++){
													let info = results[i];
													if(info.created_at){
														info.created_atx = util.date2String4(info.created_at);
														delete info.created_at;
													}
												}
												param_render.list = results;
												callback(null, data);
											}
											else{
												callback(null, data);
											}
										}
									});
								}
								else{
									callback(null, data);
								}
							},
							function(data,callback){
								if(data.count>0){
									param_render.page_html = util.GenPageHtmlNews(data.count,data.page_size,page_index,'page pageA pageA06','current',8,'GoPage',baseUrl);
								}
								else{
									param_render.page_html = null;
								}
								callback(null, data);
							},
							function(data,callback){
								redis.set(key_cache,JSON.stringify(param_render));
								callback(null, data);
							}
						],
						function(){
							if(param_render.sendStatus==200){
								res.render('list_news', param_render);
							}
							else{
								res.sendStatus(param_render.sendStatus);
							}
						});
					}
				}
			});
		}
		else{
			res.sendStatus('400');
			logger.error('Không có thông tin category %s',baseUrl);
		}
	}
	catch(e){
		logger.error(e);
		res.sendStatus('500');
	}
});

router.post('/', function(req, res) {
	let redis = req.redis;
	let util = req.util;
	let config = req.config;

	try{
		let baseUrl = req.baseUrl;
		let category_obj = config.category.get_id[baseUrl];
		if(category_obj){
			let page_index = util.parseInt(req.query.trang);

			let key_cache = utilModule.format(config.redis_key.list_news, category_obj.id,page_index);
			let param_render = {sendStatus:200,baseUrl:baseUrl,base_name:category_obj.name};
			redis.get(key_cache,function(err,data){
				if(err){
					logger.error(err);
					res.sendStatus('500');
				}
				else{
					if(data){
						param_render=JSON.parse(data);
						// param_render.user = req.tndata.user;//param_render.user = req.session.user;
						res.render('list_news', param_render);
					}
					else{
						async.waterfall([
							function(callback){
								let data= {};
								NewsModel.count({
									parent_id: category_obj.id,
									deleted: false,
									active: true
								},function(err,count){
									if(err){
										logger.error(err);
										param_render.sendStatus=500;
										callback(err, data);
									}
									else{
										data.count = count?count:0;
										callback(null, data);
									}
								});
							},
							function(data,callback){
								if(data.count>0){
									let page_size = config.category.list_news_size;
									data.page_size = page_size;
									NewsModel.find({
										parent_id: category_obj.id,
										deleted: false,
										active: true
									})
									.select('_id name name_ko_dau thumb description created_at')
									.sort({sort:1,created_at:-1})
									.skip(page_size*page_index).limit(page_size)
									.exec(function(err,results){
										if(err){
											logger.error(err);
											param_render.sendStatus=500;
											callback(err, data);
										}
										else{
											if(results){
												param_render.title= category_obj.name + ' - Trạng Nguyên';
												param_render.name = category_obj.name;
												for(let i=0;i<results.length;i++){
													let info = results[i];
													if(info.created_at){
														info.created_atx = util.date2String4(info.created_at);
													}
												}

												param_render.list = results;
												callback(null, data);
											}
											else{
												callback(null, data);
											}
										}
									});
								}
								else{
									callback(null, data);
								}
							},
							function(data,callback){
								if(data.count>0){
									param_render.page_html = util.GenPageHtmlNews(data.count,data.page_size,page_index,'page pageA pageA06','current',6,baseUrl);
								}
								else{
									param_render.page_html = null;
								}
								callback(null, data);
							},
							function(data,callback){
								redis.set(key_cache,JSON.stringify(param_render));
								callback(null, data);
							}
						],
						function(){
							if(param_render.sendStatus==200){
								// console.log(param_render);
								// param_render.user = req.tndata.user;//param_render.user = req.session.user;
								param_render.baseUrl = baseUrl;
								res.render('list_news', param_render);
							}
							else{
								res.sendStatus(param_render.sendStatus);
							}
						});
					}
				}
			});
		}
		else{
			res.sendStatus('400');
			logger.error('Không có thông tin category %s',baseUrl);
		}
		// res.render('list_news');
	}
	catch(e){
		logger.error(e.stack);
		res.sendStatus('500');
	}
});

router.get('/:rewrite?.:id?', function(req, res) {
	let redis = req.redis;
	let util = req.util;
	let config = req.config;

	try{
		let baseUrl = req.baseUrl;
		let category_obj = config.category.get_id[baseUrl];
		if(category_obj && req.params.id && util.isOnlyNumber(req.params.id)){
			let new_id = util.parseInt(req.params.id);
			let key_cache = utilModule.format(config.redis_key.news, new_id);
			let param_render = {baseUrl:baseUrl,base_name:category_obj.name};

			redis.get(key_cache,function(err,data){
				if(err){
					logger.error(err);
					res.sendStatus('500');
				}
				else{
					if(data){
						param_render=JSON.parse(data);
						param_render.icount = 0;
						let key_count = utilModule.format(config.redis_key.count_read_news, new_id);
						redis.incr(key_count,function(err,count){
							if(err) console.log(err);
							else param_render.icount = count;
							// param_render.user = req.tndata.user;//param_render.user = req.session.user;
							res.render('news_detail', param_render);
						});
					}
					else{
						async.waterfall([
							function(callback){
								let data={};
								NewsModel.findOne({
									_id: new_id,
									deleted: false,
									active: true
								})
								.select('_id name parent_id parent_name description content created_at tags')
								.exec(function(err,result){
									if(err){
										logger.error(err);
										res.sendStatus('500');
									}
									else{
										if(result){
											param_render._id=new_id;
											param_render.title=result.name + ' - Trạng Nguyên';
											param_render.name = result.name;
											param_render.parent_name=result.parent_name;
											param_render.content = result.content;
											param_render.tags = result.tags;
											param_render.description = result.description;
											if(result.created_at){
												param_render.created_atx = util.date2String4(result.created_at);
												delete result.created_at;
											}
											data.parent_id = result.parent_id;
											callback(null,data);
										}
										else{
											res.sendStatus('404');
										}
									}
								});
							},
							//get list other
							function(data,callback){
								NewsModel.find({
									parent_id: data.parent_id,
									deleted: false,
									active: true,
									_id: {$ne:new_id}
								})
								.select('_id name name_ko_dau')
								.sort({sort:1,created_at:-1})
								// .skip(page_size*page_index)
								.limit(8)
								.exec(function(err,results){
									if(err){
										logger.error(err);
										res.sendStatus('500');
									}
									else{
										if(results){
											param_render.others = results;
										}
										callback(null, data);
									}
								});
							},
							function(data,callback){
								redis.set(key_cache,JSON.stringify(param_render),function(){
									callback(null, data);
								});
							},
							function(data,callback){
								param_render.icount = 0;
								let key_count = utilModule.format(config.redis_key.count_read_news, new_id);
								redis.incr(key_count,function(err,count){
									if(err) console.log(err);
									else param_render.icount = count;
									callback(err, data);
								});
							}
						],
						function(){
							// param_render.user = req.tndata.user;//param_render.user = req.session.user;
							res.render('news_detail', param_render);
						});
					}
				}
			});
		}
		else{
			res.sendStatus('404');
		}
	}
	catch(e){
		logger.error(e.stack);
		res.sendStatus('500');
	}
});

module.exports = router;