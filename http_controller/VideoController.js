'use strict';
const async = require('async');
const logger = require('tracer').colorConsole();
const express = require('express');
const util = require('../util/util');

let router = express.Router();

router.get('/', function(req, res) {
	try{
		let DbUtil = req.DbUtil;

		let param_render = {};

		//title
		param_render.title='Video - Trạng Nguyên';
		// param_render.page_name='Olympic';

		async.parallel([
			function(callback) {
				//user info
				// param_render.user=req.tndata.user;//param_render.user=req.session.user;
				callback(null, true);
			},
			function(callback) {
				DbUtil.ListCategoryVideo((err,list)=>{
					if(err){
						logger.error(err);
					}
					else{
						param_render.list_category=list;
						callback(null, true);
					}
				});
			}
		],
		function(list_err,list_result){
			res.render('list_video', param_render);
		});
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.post('/list/:category_id', function(req, res) {
	try{
		let DbUtil = req.DbUtil;

		let category_id = req.params.category_id;
		if(category_id && util.isOnlyNumber(category_id)){
			category_id = util.parseInt(category_id);
			let page_index = util.parseInt(req.query.trang);
			let page_size = 8;

			let param_render = {
				category_id:category_id,
				page_index:page_index,
				page_size:page_size,
				error:0,
				message:'done'
			};

			async.parallel([
				function(callback) {
					DbUtil.ListVideo(category_id,page_size,page_index,(err,list)=>{
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
					DbUtil.CountListVideo(category_id,(err,iCount)=>{
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
				DbUtil.ListAllVideo(page_size,page_index,(err,list)=>{
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
				DbUtil.CountAllVideo((err,iCount)=>{
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
		// let redis = req.redis;
		// let config = req.config;
		let DbUtil = req.DbUtil;

		let param_render = {
			user: req.tndata.user,
			baseUrl: req.baseUrl
		};
		// let type_id = 0;
		let id = util.parseInt(req.params.id);
		DbUtil.VideoInfo(id,function(err,info){
			if(err){
				logger.error(err);
			}
			else{
				if(info){
					param_render.info = info;
					res.render('video_detail', param_render);
				}
				else{
					res.sendStatus('404');
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

		// let page_index = util.parseInt(req.query.trang);
		let page_size = 6;

		let param_render = {
			// page_index:page_index,
			// page_size:page_size,
			error:0,
			message:'done'
		};

		async.waterfall([
			function(callback) {
				DbUtil.CountAllVideo((err,iCount)=>{
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
				DbUtil.ListRandomVideo(page_size,skip,(err,list)=>{
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