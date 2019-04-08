'use strict';
const async = require('async');
const logger = require('tracer').colorConsole();
const express = require('express');
const utilModule = require('util');
let NewsModel = require('../model/NewsModel');
const util = require('../util/util');

let router = express.Router();

const category_id = 12;

router.get('/', function(req, res) {
	try{
		// let DbUtil = req.DbUtil;

		let param_render = {};

		//title
		param_render.title='Truyện cười - Trạng Nguyên';
		// param_render.page_name='Olympic';

		async.parallel([
			function(callback) {
				//user info
				// param_render.user=req.tndata.user;//param_render.user=req.session.user;
				callback(null, true);
			},
			// function(callback) {
			// 	DbUtil.ListCategoryVideo((err,list)=>{
			// 		if(err){
			// 			logger.error(err);
			// 		}
			// 		else{
			// 			param_render.list_category=list;
			// 			callback(null, true);
			// 		}
			// 	});
			// }
		],
		function(list_err,list_result){
			res.render('jokes_list', param_render);
		});
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.post('/list/?', function(req, res) {
	try{
		let DbUtil = req.DbUtil;
		let page_index = util.parseInt(req.query.trang);
		let page_size = 16;

		let param_render = {
			page_index:page_index,
			page_size:page_size,
			error:0,
			message:'done'
		};

		async.parallel([
			function(callback) {
				DbUtil.ListNews(category_id,page_size,page_index,(err,list)=>{
					if(err){
						logger.error(err);
					}
					else{
						param_render.content=list;
						callback(null, true);
					}
				});
			},
			function(callback) {
				DbUtil.CountListNews(category_id,(err,iCount)=>{
					if(err){
						logger.error(err);
					}
					else{
						param_render.total_rows=iCount;
						callback(null, true);
					}
				});
			}
		],
		function(list_err,list_result){
			res.json(param_render);
		});
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.post('/list-other', function(req, res) {
	try{
		let DbUtil = req.DbUtil;

		let page_index = util.parseInt(req.query.trang);
		let page_size = 4;

		let param_render = {
			page_index:page_index,
			page_size:page_size,
			error:0,
			message:'done'
		};

		async.parallel([
			function(callback) {
				DbUtil.ListNews(category_id,page_size,page_index,(err,list)=>{
					if(err){
						logger.error(err);
					}
					else{
						param_render.content=list;
						callback(null, true);
					}
				});
			},
			function(callback) {
				DbUtil.CountListNews(category_id,(err,iCount)=>{
					if(err){
						logger.error(err);
					}
					else{
						param_render.total_rows=iCount;
						callback(null, true);
					}
				});
			}
		],
		function(list_err,list_result){
			res.json(param_render);
		});
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.get('/:name_ko_dau?.:id?', function(req, res) {
	try{
		const redis = req.redis;
		// const DbUtil = req.DbUtil;
		const config = req.config;

		let param_render = {};
		// param_render.user = req.tndata.user;
		let id = util.parseInt(req.params.id);

		let key_cache = utilModule.format(config.redis_key.news, id);

		redis.get(key_cache,function(err,data){
			if(err){
				logger.error(err);
				res.sendStatus('500');
			}
			else{
				if(data){
					param_render = util.parseJson(data);
					// param_render.user = req.tndata.user;
					res.render('jokes_detail', param_render);
				}
				else{
					NewsModel.findOne({
						_id: id,
						deleted: false,
						active: true
					})
					.select('_id name content tags')
					.exec(function(err,result){
						if(err){
							logger.error(err);
							res.sendStatus('500');
						}
						else{
							if(result){
								param_render.info={
									_id:id,
									//title:result.name + ' - Trạng Nguyên',
									name: result.name,
									content: result.content,
									tags: result.tags,
								};
								param_render.title=result.name + ' - Trạng Nguyên';

								redis.set(key_cache, JSON.stringify(param_render));
								redis.pexpire(key_cache, 600000);//600s

								// param_render.user = req.tndata.user;
								res.render('jokes_detail', param_render);
							}
							else{
								res.sendStatus('404');
							}
						}
					});
				}
			}
		});
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.post('/random-list', function(req, res) {
	try{
		let DbUtil = req.DbUtil;
		let page_size = 6;
		let param_render = {
			error:0,
			message:'done'
		};

		async.waterfall([
			function(callback) {
				DbUtil.CountListNews(category_id,(err,iCount)=>{
					if(err){
						logger.error(err);
					}
					else{
						param_render.total_rows=iCount;
						callback(null, iCount);
					}
				});
			},
			function(iCount,callback) {
				let skip = (iCount-page_size>0)? Math.floor((Math.random() * (iCount-page_size))):0;
				DbUtil.ListRandomNews(category_id,page_size,skip,(err,list)=>{
					if(err){
						logger.error(err);
					}
					else{
						param_render.content=list;
						callback(null, true);
					}
				});
			}
		],
		function(list_err,list_result){
			res.json(param_render);
		});
	}
	catch(e){
		logger.error(e.stack);
	}
});

module.exports = router;