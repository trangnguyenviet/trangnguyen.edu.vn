'use strict';
let logger = require('tracer').colorConsole();
let express = require('express');
let ProvinceModel = require('../model/ProvinceModel');

const router = express.Router();

router.get('/', function(req, res) {
	try{
		let redis = req.redis;
		let util = req.util;
		let log = req.log;
		let config = req.config;

		let param_render = {};
		//if(req.session.user){
		if(req.tndata.user){
			res.redirect('/');
			return;
		}

		//title
		param_render.title='Trạng Nguyên - Đăng ký thành viên';

		// res.send('Đã đến mùa thi các cấp, hệ thống tạm dừng đăng ký tài khoản, đến giờ này các cháu đã có tài khoản riêng.');
		// return;

		// let bLimit = true;

		// let date = new Date();
		// if((date.getHours()==19 && date.getMinutes()>=30) || date.getHours()==20){
		// 	// bLimit = true;
		// 	res.render('register_limit', param_render);
		// }
		// // else if(config.IsExamDistrict()){
		// // 	bLimit = true;
		// // 	res.render('register_limit_exam', param_render);
		// // }
		// // else if(config.IsExamProvince()){
		// // 	// bLimit = true;
		// // 	res.render('register_limit_exam', param_render);
		// // }
		// else if(config.IsExamNational()){
		// 	// bLimit = true;
		// 	res.render('register_limit_exam', param_render);

		if (config.isEvent12()) {
		// if (config.isEvent15()) {
		// if (config.isEvent17()) {
		// if (config.isEvent18()) {
		// if(config.isExamNational()) {
			res.render('register_limit_exam', param_render);
		} else {
			util.execFun([
				function(callback) {
					// lấy list thành phồ
					redis.get(config.redis_key.province,function(err,data) {
						if(err) {
							log.error('register province: ' + err);
						} else {
							if(data) {
								param_render.provinces = util.parseJson(data);
								callback(null, true);
							} else {
								ProvinceModel.find({}).select('_id name').exec(function(err,data) {
									if(err) {
										//response.error=err;
										//response.message=err;
										log.error('register province: ' + err);
									} else {
										param_render.provinces = data;
										callback(null, true);

										//save cache
										redis.set(config.redis_key.province,JSON.stringify(data));
									}
								});
							}
						}
					});
				},
				// function(callback) {
				// 	//captcha
				// 	callback(null, true);
				// },
				// function(callback) {
				// 	//tin giáo dục
				// 	callback(null, true);
				// },
				// function(callback) {
				// 	//phụ huynh tuyệt vời
				// 	callback(null, true);
				// }
			],function(list_err,list_result){
				//console.log(list_err);
				//console.log(list_result);
				//console.log(param_render.provinces);

				res.render('register', param_render);
			});
		}
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
		res.sendStatus(500);
	}
});

module.exports = router;