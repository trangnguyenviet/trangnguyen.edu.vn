'use strict';
let logger = require('tracer').colorConsole();
let async = require('async');
let express = require('express');
// let fs = require('fs');
// let path = require('path');
let mongoose = require ("mongoose");
let PaymentModel = require('../model/PaymentModel');
let BankLogModel = require('../model/BankLogModel');
let router = express.Router();
// let utilModule = require('util');
let request = require('request');

router.get('/', function(req, res) {
	try{
		// let redis = req.redis;
		const util = req.util;
		// let log = req.log;
		const config = req.config;
		// let dir_root = req.dir_root;
		const DbUtil = req.DbUtil;

		let param_render = {};
		param_render.title='Nộp học phí - Trạng Nguyên';
		param_render.vip_expire = 'Bạn chưa nộp học phí';

		let obj = config.bank_pay.expire_day;
		param_render.orders = Object.keys(obj).reduce(function(arr,key) {
			arr.push({
				money: key,
				moneyShow: (key/1000),
				day: obj[key]
			});
			return arr;
		},[]);

		if(req.tndata.user){
			let user_id = req.tndata.user._id;
			if(user_id){
				// param_render.user = req.tndata.user;
				DbUtil.GetVip(user_id,function(err,vip_expire){
					if(err){
						param_render.error = 30000;
						param_render.message = 'Server đang bận, vui lòng thử lại sau';
					} else {
						if(vip_expire){
							param_render.vip_expire = util.date2String3(vip_expire);
						}
					}
					res.render('pay_bank', param_render);
				});
			} else {
				param_render.error=2;
				param_render.message='Không tìm thấy thông tin người dùng';
				res.render('pay_bank', param_render);
			}
		} else {
			//Bạn chưa đăng nhập
			param_render.error=1;
			param_render.message='Bạn chưa đăng nhập';
			res.render('pay_bank', param_render);
		}
	} catch(e) {
		// console.log(e);
		logger.error(e.stack);
	}
});

router.post('/', function(req, res) {
	try{
		// let redis = req.redis;
		let util = req.util;
		let config = req.config;
		// let DbUtil = req.DbUtil;
		let message_out = {};
		if(req.tndata.user){
			let user = req.tndata.user;
			let user_id = user._id;
			if(user_id){
				let body = req.body;
				let money = body.money;
				let captcha = body.captcha;

				logger.warn('[payment bank]: id: %s | captcha: %s | (%s)', user_id, captcha, money);
				if(captcha) {
					if(captcha === req.tndata.captcha){
						let bank_pay = config.bank_pay;
						if(bank_pay.expire_day[money]){

							let payment_id = new mongoose.Types.ObjectId();
							let id = payment_id.toString();

							let merchant_pass = bank_pay.merchant_pass;
							let request_obj = JSON.parse(JSON.stringify(bank_pay.send_order));
							request_obj.url = bank_pay.url;
							let form = request_obj.form;
							let func = form.func, //'sendOrder',
							version = form.version, //'1.0',
							merchant_id = form.merchant_id = bank_pay.merchant_id,//'40021',
							merchant_account = form.merchant_account = bank_pay.merchant_account,//'nganluong.trangnguyen@gmail.com',
							order_code = form.order_code = id,
							total_amount = form.total_amount = money,
							currency = form.currency,//'vnd',
							language = form.language,//'vi',
							return_url = form.return_url = form.return_url + '/' + id,
							cancel_url = form.cancel_url = form.cancel_url + '/' + id,
							notify_url = form.notify_url = form.notify_url + '/' + id,
							buyer_fullname = form.buyer_fullname = user.name || '',//'',
							order_description = form.order_description,//'',
							buyer_email = form.buyer_email = user.email || 'az@trangnguyen.edu.vn',//'',
							buyer_mobile = form.buyer_mobile = user.mobile || '0466668786',
							buyer_address = form.buyer_address;
							form.checksum = util.MD5(func + '|' + version + '|' + merchant_id + '|' + merchant_account + '|' + order_code + '|' + total_amount + '|' + currency + '|' + language + '|' + return_url + '|' + cancel_url + '|' + notify_url + '|' + buyer_fullname + '|' + buyer_email + '|' + buyer_mobile + '|' + buyer_address + '|' + merchant_pass);

							logger.info('Bank Pay notify_url:', notify_url);

							request(request_obj, function (error, response, content) {
								if(error) {
									logger.error(error);
									message_out.error = 20001;
									message_out.message = 'kết nối cổng thanh toán không thành công, bạn hãy thử lại sau';
								} else {
									if(response && response.statusCode === 200) {
										content = util.parseJson(content);
										if(content && content.response_code === '00') {
											message_out.error = 0;
											message_out.message = '';
											message_out.checkout_url = content.checkout_url;

											let payment_info = new PaymentModel({
												_id: payment_id,
												user_id: user_id,
												type: 'bank',
												// res_statusCode: response.statusCode,
												token_code: content.token_code
											});
											payment_info.save(function(err, info){
												if(err) logger.error(err);
											});
										} else {
											logger.error(content);
											message_out.error = 20003;
											message_out.message = 'Cổng thanh toán chưa sẵn sàng';
										}
									} else {
										message_out.error = 20002;
										message_out.message = 'Cổng thanh toán chưa sẵn sàng';
									}
								}
								req.tndata.captcha = null;
								res.json(message_out);
								logger.trace(message_out.message);
							});
						} else {
							message_out.error = 3;
							message_out.message = 'không có mệnh gía này';
							req.tndata.captcha = null;
							res.json(message_out);
							logger.trace(message_out.message);
						}
					} else {
						message_out.error = 3;
						message_out.message = 'Mã xác nhận không đúng';
						req.tndata.captcha = null;
						res.json(message_out);
						logger.trace(message_out.message);
					}
				} else {
					message_out.error = 3;
					message_out.message = 'Đã hết phiên làm việc - hãy load lại mã xác nhận';
					req.tndata.captcha = null;
					res.json(message_out);
					logger.trace(message_out.message);
				}
			} else {
				message_out.error = 2;
				message_out.message = 'Không có thông tin người dùng';
				req.tndata.captcha = null;
				res.json(message_out);
				logger.trace(message_out.message);
			}
		} else {
			//Bạn chưa đăng nhập
			message_out.error = 1;
			message_out.message = 'Bạn chưa đăng nhập';
			req.tndata.captcha = null;
			res.json(message_out);
			logger.trace(message_out.message);
		}
	} catch(e) {
		if(!res.headersSent){
			message_out.error = 10000;
			message_out.message = "server đang bận, bạn hãy thử lại sau";
		}
		logger.error(e);
	}
	// finally{
	// 	req.tndata.captcha=null;
	// 	res.json(message_out);
	// 	logger.trace(message_out.message);
	// }
});

router.get('/notify/:id?', function(req, res) {
	logger.info('BANK NOTIFY', req.params.id, req.body); //BANK NOTIFY 5a02423f9007b706f1a29c55 {}
	try{
		// let redis = req.redis;
		let util = req.util;
		let config = req.config;
		let DbUtil = req.DbUtil;
		let message_out = {};

		let id = req.params.id;
		if(mongoose.Types.ObjectId.isValid(id)){
			let _id = new mongoose.Types.ObjectId(id);
			PaymentModel.findOne({
				_id: _id,
				is_check: false
			})
			.select('user_id token_code')
			.exec((err,info)=>{
				if(err){
					logger.error(err);
					res.json({
						error:10000,
						message:'server busy'
					});
				} else {
					if(info && info.token_code){
						let user_id = info.user_id;
						let token_code = info.token_code;
						let bank_pay = config.bank_pay;
						let request_obj = JSON.parse(JSON.stringify(bank_pay.check_order));
						request_obj.url = bank_pay.url;
						let form = request_obj.form;

						let func = form.func,
						version = form.version,
						merchant_id = form.merchant_id = bank_pay.merchant_id;
						form.token_code = token_code;
						let merchant_pass = bank_pay.merchant_pass;
						form.checksum = util.MD5(func+ '|' + version + '|' + merchant_id + '|' + token_code + '|' + merchant_pass);

						request(request_obj, function (error, response, content) {
							if(error){
								logger.error(error);
								message_out.error = 20001;
								message_out.message = 'kết nối cổng thanh toán không thành công';
							} else {
								if(response && response.statusCode === 200) {
									logger.info(content);
									/*
									{"response_code":"00","receiver_email":"nganluong.trangnguyen@gmail.com","order_code":"5a02423f9007b706f1a29c55","total_amount":3000,"currency":"VND","language":"vi","return_url":"http:\/\/test.trangnguyen.edu.vn\/nop-hoc-phi-ngan-hang\/done\/5a02423f9007b706f1a29c55","cancel_url":"http:\/\/test.trangnguyen.edu.vn\/nop-hoc-phi-ngan-hang\/cancel\/5a02423f9007b706f1a29c55","notify_url":"http:\/\/test.trangnguyen.edu.vn\/nop-hoc-phi-ngan-hang\/notify\/5a02423f9007b706f1a29c55","buyer_fullname":"M\u1ea1c V\u0103n T\u00e2n","buyer_email":"macvantan@gmail.com","buyer_mobile":"0978412903","buyer_address":"x\u00f3m 4, l\u00e0ng Ph\u00fa \u0110\u00f4, M\u1ef9 \u0110\u00ecnh - T\u1eeb Li\u00eam - H\u00e0 N\u1ed9i","transaction_id":32123288,"transaction_status":4,"transaction_amount":3000,"transaction_currency":"vnd","transaction_escrow":0}
									*/
									const order_res = util.parseJson(content);

									//save log
									const bankLogModel = new BankLogModel({
										user_id,
										body: order_res
									});
									bankLogModel.save((err) => {if(err) logger.error(err);});
									//end save log

									if(order_res) {
										let update_data = {
											is_check: true,
											res_statusCode: response.statusCode,
											bank_code: order_res.response_code
										};

										if(order_res.response_code === '00') {
											let amout = order_res.total_amount;
											update_data.amout = amout;

											let vip_day = bank_pay.expire_day[amout];

											DbUtil.AddVip(user_id, vip_day, (err, reply) => {
												if(err) {
													logger.error(err);
												} else {
													logger.info('done:', user_id, amout, vip_day);
												}
											});
										}

										PaymentModel.update({
											_id: _id
										},{
											$set: update_data
										},(err,reply) => {
											//
										});
									} else {
										logger.error('content not json format',content);
									}
								}
							}
							res.json({
								error: 0,
								message: "done"
							});
						});
					} else {
						res.json({
							error: 2,
							message: 'giao dịch không tồn tại hoặc đã thanh toán xong'
						});
					}
				}
			});
		} else {
			res.json({
				error: 1,
				message: 'id không hợp lệ'
			});
		}
	} catch(e) {
		if(!res.headersSent) {
			res.json({
				error: 10000,
				message: "server đang bận, bạn hãy thử lại sau"
			});
		}
		logger.error(e);
	}
});

router.get('/done/:id?', function(req, res) {
	logger.info('BANK DONE', req.params.id, req.body); //5a02423f9007b706f1a29c55 {}
	try{
		res.redirect(301, '/nop-hoc-phi-ngan-hang');
	} catch(e) {
		if(!res.headersSent){
			res.json({
				error:10000,
				message: "server đang bận, bạn hãy thử lại sau"
			});
		}
		logger.error(e);
	}
});

router.get('/cancel/:id?', function(req, res) {
	logger.info('BANK CANCEL', req.params.id, req.body, res.query);
	try{
		res.redirect(301, '/nop-hoc-phi-ngan-hang');
	} catch(e) {
		if(!res.headersSent) {
			res.json({
				error: 10000,
				message: "server đang bận, bạn hãy thử lại sau"
			});
		}
		logger.error(e);
	}
});

module.exports = router;