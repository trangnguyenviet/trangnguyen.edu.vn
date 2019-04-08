'use strict';
let logger = require('tracer').colorConsole();
let async = require('async');
let express = require('express');
let fs = require('fs');
let path = require('path');
let mongoose = require ("mongoose");
let router = express.Router();
// let utilModule = require('util');
let request = require('request');
let ExampleCodeModel = require('../model/ExampleCodeModel');

router.get('/', function(req, res) {
	try{
		// let redis = req.redis;
		// let util = req.util;
		let config = req.config;
		// let DbUtil = req.DbUtil;

		if(config.isExamNational()){
			let param_render = {error:0,message:''};
			param_render.title='Nhập mã thi đình - Trạng Nguyên';

			if(req.tndata.user){
				let key_get = req.tndata.code_exam_national;
				if(key_get && key_get!=''){
					param_render.error=2;
					param_render.message='Bạn đã nhập code, không cần nhập nữa.';
					res.redirect('/tieng-viet');
				}
				else{
					res.render('code_exam_national', param_render);
				}
			}
			else{
				//Bạn chưa đăng nhập
				param_render.error=1;
				param_render.message='Bạn chưa đăng nhập';
				res.render('code_exam_national', param_render);
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

router.post('/', function(req, res) {
	let message_out = {};
	try{
		let data = {};
		async.waterfall([
			(callback)=>{
				if(req.tndata.user){
					data.user_id = req.tndata.user._id;
					callback(false,data);
				}
				else{
					message_out.error=1;
					message_out.message='Bạn chưa đăng nhập';
					callback(true,data);
				}
			},
			(data, callback)=>{
				let body = req.body;
				data.code = body.code;
				let captcha = data.captcha = body.captcha;
				if(captcha){
					callback(false,data);
				}
				else{
					message_out.error = 3;
					message_out.message = 'Đã hết phiên làm việc - hãy load lại mã xác nhận';
					callback(true,data);
				}
			},
			(data, callback)=>{
				if(data.captcha == req.tndata.captcha){
					callback(false,data);
				}
				else{
					message_out.error = 4;
					message_out.message = 'Mã xác nhận không đúng';
					callback(true,data);
				}
			},
			(data,callback)=>{
				ExampleCodeModel.findOne({
					_id: data.code,
					type: 'national',
					active: true
				})
					.select('province_id class_id begin_use end_use')
					.exec((err,code_info)=>{
						if(err){
							message_out.error=20000;
							message_out.message="server đang bận, bạn hãy thử lại sau";
							logger.error(err);
						}
						else{
							if(code_info){
								if(!code_info.class_id || code_info.class_id == 0 || code_info.class_id == req.tndata.user.class_id) {
									let date = new Date();
									let timestamp = Math.floor(date.getTime()/1000);
									if(timestamp>=code_info.begin_use){
										if(timestamp<=code_info.end_use){
											req.tndata.code_exam_national = data.code;
											message_out.error = 0;
											message_out.message = 'Nhập mã thành công, bạn có thể vào thi Đình';
										}
										else{
											message_out.error = 4;
											message_out.message = 'Mã thi quá hạn sử dụng';
										}
									}
									else{
										message_out.error = 4;
										message_out.message = 'Mã thi chưa đến giờ sử dụng';
									}
								} else {
									message_out.error = 5;
									message_out.message = 'Mã thi không sử dụng cho lớp của bạn';
								}
							}
							else{
								message_out.error = 3;
								message_out.message = 'Mã thi không đúng';
							}
						}
						callback(err,data);
					});
			}
		], ()=>{
			req.tndata.captcha=null;
			res.json(message_out);
		});
	}
	catch(e){
		logger.error(e);
		// message_out.error=10000;
		// message_out.message="server đang bận, bạn hãy thử lại sau";
	}
});
module.exports = router;