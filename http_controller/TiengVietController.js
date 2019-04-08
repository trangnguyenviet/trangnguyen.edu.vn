'use strict';
let logger = require('tracer').colorConsole();
let async = require('async');
let express = require('express');
let utilModule = require('util');
let util = require('../util/util');

let ExamLib = require('../ExamLib');

let router = express.Router();

router.get('/', function(req, res) {
	try{
		// let redis = req.redis;
		let config = req.config;
		let DbUtil = req.DbUtil;

		let param_render = {};

		//title
		param_render.title='Thi Tiếng Việt - Trạng Nguyên';
		param_render.page_name='Thi Tiếng Việt';

		let exam_config = config.exam_tiengviet;

		// param_render.user=req.tndata.user;//param_render.user=req.session.user;

		async.parallel([
			function(callback){
				if(req.tndata.user){
					let user_id = req.tndata.user._id;
					DbUtil.GetCurrentRound(user_id,4,function(err,round_id){
						if(err){
							logger.error(err);
							res.sendStatus(500);
						}
						else{
							// logger.info(round_id);
							param_render.user_current_round=round_id?round_id:'Chưa qua vòng nào';
						}
						callback(null,true);
					});
				}
				else{
					callback(null,true);
				}
			},
			function(callback){
				DbUtil.GetParamInfo(utilModule.format(config.exam.current_round,exam_config.id),function(err,current_round){
					if(err){
						logger.error(err);
						res.sendStatus(500);
					}
					else{
						exam_config.current_round=current_round;
						param_render.exam_info=exam_config;
					}
					callback(null,true);
				});
			}
		],
		function(){
			res.render('tiengviet', param_render);
		});
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.get('/vong-:round', function(req, res) {
	try{
		let config = req.config;
		ExamLib.SelectRound(req, res, config.exam_tiengviet);
	}
	catch(e){
		logger.error(e.stack);
		res.sendStatus(500);
	}
});

router.get('/vong-:round/bai-:test', function(req, res) {
	try{
		let config = req.config;
		ExamLib.SelectTest(req, res, config.exam_tiengviet);
	}
	catch(e){
		logger.error(e.stack);
	}
});

module.exports = router;