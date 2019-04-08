'use strict';
let logger = require('tracer').colorConsole();
let express = require('express');
let util = require('../util/util');

let router = express.Router();

router.get('/', function(req, res) {
	try{
		let param_render = {};

		//title
		param_render.title='Bài giảng - Trạng Nguyên';
		param_render.page_name='Olympic';

		util.execFun([
			function(callback){
				//user info
				// param_render.user=req.tndata.user;//param_render.user=req.session.user;
				callback(null, true);
			},
			function(callback){
				//olympic toán
				callback(null, true);
			},
			function(callback){
				//olympic tiếng anh
				callback(null, true);
			},
			function(callback){
				//olympic tiếng việt
				callback(null, true);
			}
		],
		function(list_err,list_result){
			//console.log(list_err);
			//console.log(list_result);
			res.render('birthday', param_render);
		});
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
	}
});

module.exports = router;