'use strict';
let logger = require('tracer').colorConsole();
let async = require('async');
let express = require('express');
let utilModule = require('util');

let ExamLib = require('../ExamLib');

let router = express.Router();

router.get('/', function(req, res) {
	// let redis = req.redis;
	// let util = req.util;
	// let log = req.log;
	let config = req.config;
	// let dir_root = req.dir_root;
	let DbUtil = req.DbUtil;

	let param_render = {};

	//title
	param_render.title='Luyện tập, ôn thi - Trạng Nguyên';
	param_render.page_name='Luyện tập';

	// param_render.user=req.tndata.user;//param_render.user=req.session.user;

	let toan_config = config.exam_olympic_toan;
	let english_config = config.exam_olympic_english;
	let exam_olympic_tiengviet = config.exam_olympic_tiengviet;

	let key_current_round_toan = utilModule.format(config.exam.current_round,toan_config.id);
	let key_current_round_english = utilModule.format(config.exam.current_round,english_config.id);
	let key_current_round_cuoituan = utilModule.format(config.exam.current_round,exam_olympic_tiengviet.id);

	// DbUtil.GetListParam([key_current_round_toan,key_current_round_english,key_current_round_cuoituan],function(err,param_map){
	// 	if(err){
	// 		res.sendStatus(500);
	// 		console.log(err);
	// 	}
	// 	else{
	// 		toan_config.current_round=param_map[key_current_round_toan];
	// 		param_render.exam_olympic_toan=toan_config;

	// 		english_config.current_round=param_map[key_current_round_english];
	// 		param_render.exam_olympic_english=english_config;

	// 		cuoituan_config.current_round=param_map[key_current_round_cuoituan];
	// 		param_render.exam_olympic_cuoituan=cuoituan_config;

	// 		res.render('olympic', param_render);
	// 	}
	// });
	
	async.parallel([
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
		}
	],
	function(err, results){
		res.render('olympic', param_render);
	});
});

router.get('/toan/vong-:round', function(req, res) {
	try{
		let config = req.config;
		ExamLib.SelectRound(req, res, config.exam_olympic_toan);
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
		res.sendStatus(500);
	}
});

router.get('/toan/vong-:round/bai-:test', function(req, res) {
	try{
		let config = req.config;
		ExamLib.SelectTest(req, res, config.exam_olympic_toan);
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
	}
});

router.get('/tieng-anh/vong-:round', function(req, res) {
	try{
		let config = req.config;
		ExamLib.SelectRound(req, res, config.exam_olympic_english);
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
		res.sendStatus(500);
	}
});

router.get('/tieng-anh/vong-:round/bai-:test', function(req, res) {
	try{
		let config = req.config;
		ExamLib.SelectTest(req, res, config.exam_olympic_english);
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
	}
});

router.get('/tieng-viet/vong-:round', function(req, res) {
	try{
		let config = req.config;
		ExamLib.SelectRound(req, res, config.exam_olympic_cuoituan);
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
		res.sendStatus(500);
	}
});

router.get('/tieng-viet/vong-:round/bai-:test', function(req, res) {
	try{
		let config = req.config;
		ExamLib.SelectTest(req, res, config.exam_olympic_cuoituan);
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
	}
});

module.exports = router;