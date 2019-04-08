'use strict';
let logger = require('tracer').colorConsole();
let express = require('express');
let util = require('../util/util');
let router = express.Router();

router.get('/', function(req, res) {
	try{
		let param_render = {};

		//title
		param_render.title='Trạng Nguyên - Đăng ký thành viên';

		util.execFun([
			function(callback) {
				//thành phồ
				callback(null, true);
			},
			function(callback) {
				//captcha
				callback(null, true);
			},
			function(callback) {
				//tin giáo dục
				callback(null, true);
			},
			function(callback) {
				//phụ huynh tuyệt vời
				callback(null, true);
			}
		],function(list_err,list_result){
			//console.log(list_err);
			//console.log(list_result);
			res.render('fogot_password', param_render);
		});
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
	}
});

module.exports = router;