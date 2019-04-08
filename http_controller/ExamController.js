'use strict';
let logger = require('tracer').colorConsole();
let express = require('express');
let util = require('../util/util');
let router = express.Router();

router.get('/', function(req, res) {
	try{
		let param_render = {};

		//title
		param_render.title='Trạng Nguyên - Bài thi';

		util.execFun([
			function(callback) {
				//user info
				// param_render.user=req.tndata.user;//param_render.user=req.session.user;
				callback(null, true);
			},
			function(callback) {
				//Bài 1, 2, 3
				callback(null, true);
			}
		],function(list_err,list_result){
			// console.log(list_err);
			// console.log(list_result);
			res.render('select_exam', param_render);
		});
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
	}
});

router.get('/web', function(req, res) {
	try{
		let param_render = {};

		//title
		param_render.title='Bài giảng xxx- Trạng Nguyên';
		param_render.page_name='Bài giảng';

		util.execFun([
			function(callback) {
				//user info
				// param_render.user=req.tndata.user;
				callback(null, true);
			},
			function(callback) {
				//Nội dung
				param_render.subject = 'Tiếng Việt';
				param_render.round = 19;
				callback(null, true);
			}
		],
		function(list_err,list_result){
			//res.cookie('cookieName','1234567890', { maxAge: 90000, httpOnly: true });//cookie expire
			//res.cookie('cookieName1','1234567890');//session cookie
			res.render('web_exam', param_render);
		});
	}
	catch(e){
		// console.log(e);
		logger.error(e);
	}
});

router.get('/game', function(req, res) {
	try{
		let param_render = {};

		//title
		param_render.title='Bài giảng xxx- Trạng Nguyên';
		param_render.page_name='Bài giảng';

		util.execFun([
			function(callback) {
				//user info
				param_render.user_info={};
				param_render.user_info.is_login=true;
				param_render.user_info.id=123456;
				param_render.user_info.class_id='4';
				param_render.user_info.class_name='4D';
				param_render.user_info.avatar='/images/avatar.png';
				param_render.user_info.name='Phạm Đỗ Hưng';
				param_render.user_info.school_name='Trường năng khiếu dân tộc thiểu số.';
				callback(null, true);
			},
			function(callback) {
				//Nội dung
				param_render.subject = 'Tiếng Việt';
				param_render.round = 19;
				callback(null, true);
			}
		],
		function(list_err,list_result){
			//console.log(list_err);
			//console.log(list_result);
			res.render('game_exam', param_render);
		});
	}
	catch(e){
		// console.log(e);
		logger.error(e);
	}
});

module.exports = router;