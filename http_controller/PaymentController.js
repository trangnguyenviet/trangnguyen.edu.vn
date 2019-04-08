'use strict';

let logger = require('tracer').colorConsole();
let async = require('async');
let express = require('express');
// let fs = require('fs');
// let path = require('path');
// let mongoose = require ("mongoose");
let router = express.Router();
let utilModule = require('util');
let PaymentModel = require('../model/PaymentModel');
let CardNumberModel = require('../model/CardNumberModel');
let SmsLogModel = require('../model/SmsLogModel');

let request = require('request');

router.get('/', function(req, res) {
	try{
		// let redis = req.redis;
		let util = req.util;
		// let log = req.log;
		// let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		let param_render = {};
		param_render.title='Nộp học phí - Trạng Nguyên';
		param_render.vip_expire = 'Bạn chưa nộp học phí';

		if(req.tndata.user){
			let user_id = req.tndata.user._id;
			if(user_id){
				// param_render.user = req.tndata.user;
				DbUtil.GetVip(user_id,function(err,vip_expire){
					if(err){
						param_render.error = 30000;
						param_render.message = 'Server đang bận, vui lòng thử lại sau';
					}
					else{
						if(vip_expire){
							param_render.vip_expire = util.date2String3(vip_expire);
						}
					}
					res.render('payment', param_render);
				});
			}
			else{
				param_render.error=2;
				param_render.message='Không tìm thấy thông tin người dùng';
				res.render('payment', param_render);
			}
		}
		else{
			//Bạn chưa đăng nhập
			param_render.error=1;
			param_render.message='Bạn chưa đăng nhập';
			res.render('payment', param_render);
		}
	}
	catch(e){
		// console.log(e);
		logger.error(e.stack);
	}
});

router.post('/card', function(req, res) {
	try{
		// let redis = req.redis;
		let util = req.util;
		// let log = req.log;
		let config = req.config;
		// let dir_root = req.dir_root;
		let DbUtil = req.DbUtil;

		let message_out = {};

		if(req.tndata.user){
			let user_id = req.tndata.user._id;
			if(user_id){
				let body = req.body;
				let card_type = body.card_type;
				let card_number = body.card_number;
				let card_serial = body.card_serial;
				let captcha = body.captcha;

				logger.warn('[payment]: id: %s | captcha: %s | (%s) %s - %s',user_id,captcha,card_type,card_number,card_serial);
				if(captcha){
					if(captcha == req.tndata.captcha){
						DbUtil.PaymentCountMiss(user_id,function(err,count){
							if(err){
								message_out.error = 4;
								message_out.message = 'Server đang bận, vui lòng thử lại sau';
								req.tndata.captcha=null;
								res.json(message_out);
							}
							else{
								if(count<config.payment.allow_miss_count){
									async.waterfall([
										function(callback){
											let data = {};
											if(card_type && config.payment.card[card_type]){
												data.card = config.payment.card[card_type];
												callback(false,data);
											}
											else{
												message_out.error = 3;
												message_out.message = 'hãy chọn loại thẻ';
												callback(true,data);
											}
										},
										function(data,callback){
											if(card_number && card_number!=''){
												card_number = card_number.replace(/[- ]/gi,'');
												if(util.isOnlyNumber(card_number)){
													callback(false,data);
												}
												else{
													message_out.error = 3;
													message_out.message = 'mã thẻ phải là số';
													callback(true,data);
												}
											}
											else{
												message_out.error = 3;
												message_out.message = 'hãy nhập mã thẻ';
												callback(true,data);
											}
										},
										//check length card number
										function(data,callback){
											if(data.card.number_length.indexOf(card_number.length)>=0){
												callback(false,data);
											}
											else{
												message_out.error = 3;
												message_out.message = 'Mã thẻ phải là ' + data.card.number_length.toString() + ' chữ số';
												callback(true,data);
											}
										},
										function(data,callback){
											if(card_serial && card_serial!=''){
												card_serial = card_serial.replace(/[- ]/gi,'');
												if(util.isOnlyNumber(card_serial)){
													callback(false,data);
												}
												else{
													message_out.error = 3;
													message_out.message = 'Số serial phải là số';
													callback(true,data);
												}
											}
											else{
												message_out.error = 3;
												message_out.message = 'hãy nhập số serial thẻ';
												callback(true,data);
											}
										},
										//check length serial
										function(data,callback){
											if(data.card.serial_length.indexOf(card_serial.length)>-1){
												callback(false,data);
											}
											else{
												message_out.error = 3;
												message_out.message = 'Serial thẻ phải là ' + data.card.serial_length.toString() + ' chữ số';
												callback(true,data);
											}
										},
										//get new payment id
										// function(data,callback){
										// 	mongoose.connection.db.eval("getNextSequence('payments')",function(err,new_id){
										// 		if(err){
										// 			message_out.error = 30000;
										// 			message_out.message = 'Server đang bận, vui lòng thử lại sau';
										// 			callback(true,data);
										// 		}
										// 		else{
										// 			data.payment_id = new_id;
										// 			callback(false,data);
										// 		}
										// 	});
										// },
										//init object request
										function(data,callback){
											if(card_type=='TNCARD'){
												/*
												db.cards.findAndModify({
													query: {
														active: true,
														serial: '521863567363',
														is_used: false,
														number: '557607214046'
													},
													fields: {_id: 1, day: 1, money: 1},
													new: true,
													upsert: false,
													update: {$set:{
														is_used: true,
														used_at: new Date(),
														user_used: 79
													}}
												})
												*/
												CardNumberModel.findOneAndUpdate({
													active: true,
													serial: card_serial,
													is_used: false,
													number: card_number
												},{
													$set:{
														is_used: true,
														used_at: new Date(),
														user_used: user_id
													}
												},{
													new: true,
													upsert: false
												})
												// CardNumberModel.findOne({
												// 	active: true,
												// 	serial: card_serial,
												// 	is_used: false,
												// 	number: card_number
												// })
												.select('day money')
												.exec((err,info)=>{
													if(err){
														logger.error(err);
													}
													else{
														let payment_info = new PaymentModel();
														payment_info.card_number = card_number;
														payment_info.card_serial = card_serial;
														payment_info.network = card_type;
														if(info){
															payment_info.done = true;
															payment_info.amout = info.money;
															payment_info.tn_amout = info.money;
															payment_info.res_body = '00';

															data.vip_day = info.day;
															data.card_amout = info.money;

															// //update card
															// info.is_used = true;
															// info.used_at = new Date();
															// info.user_used = user_id;
															// info.save((err,reply)=>{
															// 	if(err){
															// 		logger.error(err,reply);
															// 	}
															// 	logger.error(err,reply);
															// });
														}
														else{
															payment_info.res_body = '10';
															payment_info.done = false;
														}
														// payment_info._id = data.payment_id;
														payment_info.user_id = user_id;
														payment_info.type = card_type;
														payment_info.save((err,info)=>{
															if(err) logger.error(err);
														});
														callback(false,data);
													}
												});
											}
											else{
												let request_obj = config.payment.request;
												request_obj.form.pin_card = card_number;
												request_obj.form.card_serial = card_serial;
												request_obj.form.type_card = card_type;
												// request_obj.form.ref_code = data.payment_id;
												request_obj.form.client_fullname = '';
												request_obj.form.client_email = '';
												request_obj.form.client_mobile = user_id;

												// Start the request
												request(request_obj, function (error, response, body) {
													// body = '00|40021|quynh.nguyen@trangnguyen.edu.vn|0326323850513|32080418281|VIETTEL|1||||20000|16000|12818511';
													let payment_info = new PaymentModel();
													if(!error) {
														let array_body = null;
														if(body) {
															array_body = body.split(/\|/gi);
															data.array_body = array_body;
															let res_status = array_body[0];
															// payment_info.res_status = res_status;
															let obj_status = config.payment.status[res_status];
															data.obj_status = obj_status;
															if(obj_status){
																let customer_done = obj_status.customer_done;
																payment_info.done = customer_done;
																if(customer_done) {
																	payment_info.card_number = array_body[3];
																	payment_info.card_serial = array_body[4];
																	payment_info.network = array_body[5];
																	payment_info.amout = array_body[10];
																	payment_info.tn_amout = array_body[11];
																	payment_info.transaction_id = array_body[12];
																}
															}
														}
														if(response && response.statusCode) payment_info.res_statusCode = response.statusCode;
													} else {
														logger.error(error);
													}

													payment_info.res_error = error;
													// payment_info._id = data.payment_id;
													payment_info.user_id = user_id;
													payment_info.form = request_obj.form;
													payment_info.res_body = body;
													payment_info.type = 'card';
													payment_info.save(function(err, info) {
														if(err) logger.error(err,info);
														// logger.info(info);
													});
													callback(false, data);
												});
											}
										},
										//analytics body
										function(data, callback) {
											function addVipDay(vip_day, card_amout,callback_result){
												DbUtil.GetVip(user_id,function(err,vip_expire){
													if(err){
														message_out.error = 30000;
														message_out.message = 'Server đang bận, vui lòng thử lại sau<br/>(Thẻ đã bị trừ, hãy liên hệ với admin để kiểm tra lại)';
														callback(true, data);
													} else {
														let expire_day, today = new Date();
														if(vip_expire) {
															if(vip_expire - today > 0){
																expire_day = vip_expire.setDate(vip_expire.getDate()+vip_day);
															} else {
																expire_day = today.setDate(today.getDate()+vip_day);
															}
														} else {
															expire_day = today.setDate(today.getDate()+vip_day);
														}

														expire_day = new Date(expire_day);

														DbUtil.SetVip(user_id,expire_day,function(err,data_result){
															// console.log(err,data_result);
															if(err) {
																message_out.error = 30000;
																message_out.message = 'Server đang bận, vui lòng thử lại sau (thẻ đã bị trừ, hãy liên hệ với admin để kiểm tra lại)';
																callback_result();
																logger.error(err);
															} else {
																message_out.error = 0;
																message_out.message = utilModule.format('Nạp thẻ thành công. Bạn vừa nạp thẻ mệnh giá: %d, bạn được cộng: %d ngày học.',card_amout,vip_day);
																message_out.vip_expire = util.date2String3(expire_day);
																callback_result();
															}
														});
													}
												});
											};

											if(card_type === 'TNCARD') {
												if(data.vip_day){
													addVipDay(data.vip_day, data.card_amout, ()=>{
														callback(true,data);
													});
												} else {
													message_out.error = 3;
													message_out.message = 'Thẻ không đúng hoặc đã được sử dụng.';
													callback(true,data);
												}
											} else {
												if(data.array_body) {
													let obj_status = data.obj_status;
													if(obj_status && obj_status.customer_done){
														let array_body = data.array_body;
														let card_amout = parseInt(array_body[10]);
														let vip_day = config.payment.expire_day[card_amout];

														// //check khuyến mãi 2-5/9
														// let date = new Date();
														// if(date.getMonth()==8 && (date.getDate()>=2 && date.getDate()<=5) && card_amout>=100000){
														// 	vip_day = vip_day * 2;
														// }
														// //end check khuyến mãi

														addVipDay(vip_day, card_amout, ()=>{
															callback(true,data);
														});
													} else {
														message_out.error = 40000;
														// message_out.message = obj_status.CusMsg;
														message_out.message = 'Thanh toán không thành công';
														callback(true,data);
													}
												} else {
													message_out.error = 3;
													message_out.message = 'Kênh thanh toán chưa sẵn sàng';
													callback(true,data);
												}
											}
										}
									],
									function(){
										req.tndata.captcha = null;
										if(message_out.error === 0) {
											DbUtil.PaymentClearMiss(user_id);
										} else {
											DbUtil.PaymentIncrMiss(user_id);
										}
										res.json(message_out);
										logger.trace(message_out.message);
									});
								} else {
									message_out.error = 8;
									message_out.message = 'Bạn đã nhập sai quá ' + config.payment.allow_miss_count + ' lần, tài khoản của bạn bị khóa nộp phí, 15 phút sau hãy thử lại';
									req.tndata.captcha=null;
									res.json(message_out);
									logger.trace(message_out.message);
								}
							}
						});
					} else {
						message_out.error = 3;
						message_out.message = 'Mã xác nhận không đúng';
						req.tndata.captcha=null;
						res.json(message_out);
						logger.trace(message_out.message);
					}
				} else {
					message_out.error = 3;
					message_out.message = 'Đã hết phiên làm việc - hãy load lại mã xác nhận';
					req.tndata.captcha=null;
					res.json(message_out);
					logger.trace(message_out.message);
				}
			} else {
				message_out.error = 2;
				message_out.message = 'Không có thông tin người dùng';
				req.tndata.captcha=null;
				res.json(message_out);
				logger.trace(message_out.message);
			}
		} else {
			//Bạn chưa đăng nhập
			message_out.error=1;
			message_out.message='Bạn chưa đăng nhập';
			req.tndata.captcha=null;
			res.json(message_out);
			logger.trace(message_out.message);
		}
	} catch(e) {
		message_out.error=10000;
		message_out.message="server đang bận, bạn hãy thử lại sau";
		req.tndata.captcha=null;
		res.json(message_out);
		logger.error(e.stack);
	}
});

router.post('/sms', function(req, res) {
	try{
		let util = req.util;
		let body = req.body;
		let DbUtil = req.DbUtil;
		let ip = req.headers['x-forwarded-for']? req.headers['x-forwarded-for']: req.connection.remoteAddress;
		logger.info(ip,'POST:',body,'Query:',req.query);

		//save log
		let smsLogModel = new SmsLogModel({body});
		smsLogModel.save((err)=>{if(err) logger.error(err);});
		//end save log

		// let function = body.function;
		let reciver_email = util.toString(body.reciver_email,'');
		let transaction_id = util.toString(body.transaction_id,'');
		let price = util.toString(body.price,'');
		let amount = util.toString(body.amount,'');
		let fee = util.toString(body.fee,'');
		let ref_code = util.toString(body.ref_code,'');
		let keyword = util.toString(body.keyword,'');
		let service_id = util.toString(body.service_id,'');
		let message = util.toString(body.message,'');
		let client_mobile = util.toString(body.client_mobile,'');
		let telco = util.toString(body.telco,'');
		let checksum = util.toString(body.checksum,'');
		let MerchantPass = 'd7857ea388daaa6f418f10007b53ece5';
		let makiemtra = util.MD5(reciver_email + "|" + transaction_id + "|" + price + "|" + amount + "|" + fee + "|" + ref_code + "|" + keyword + "|" + service_id + "|" + message + "|" + client_mobile + "|" + telco + "|" + MerchantPass);

		if(checksum === makiemtra) {
			if(util.isOnlyNumber(ref_code)) {
				let user_id = util.parseInt(ref_code);
				if(user_id > 0) {
					DbUtil.GetUserActive(user_id, (err, user_info) => {
						if(err) {
							res.send('0|' + new Buffer('(trangnguyen.edu.vn) he thong dang ban, vui long thu lai sau').toString('base64'));
						} else {
							if(user_info) {
								if(user_info.active) {
									//user da active
									res.send('1|' + new Buffer('(trangnguyen.edu.vn) user co id: ' + user_id + ' da kich hoat, moi hoc sinh vao LUYEN TAP truoc khi thi. Can ho tro xin goi: 024.6666.8786.').toString('base64'));
								} else {
									if(user_info.mobile && user_info.mobile !== '') {
										res.send('1|' + new Buffer('(trangnguyen.edu.vn) user co id: ' + user_id + ' da vi pham quy che, neu co thac mac xin goi 024.6666.8786').toString('base64'));
									} else {
										DbUtil.CountMobile(client_mobile, (err, count)=>{
											if(err) {
												res.send('0|' + new Buffer('(trangnguyen.edu.vn) he thong dang ban, vui long thu lai sau').toString('base64'));
											} else {
												if(count === 0) {
													//save data
													user_info.active = true;
													user_info.mobile = client_mobile;
													//vip expire
													// let vip_day = 2;
													// let vip_expire = user_info.vip_expire, today = new Date();
													// if(vip_expire){
													// 	if(vip_expire - today > 0){
													// 		vip_expire = vip_expire.setDate(vip_expire.getDate()+vip_day);
													// 	}
													// 	else{
													// 		vip_expire = today.setDate(today.getDate()+vip_day);
													// 	}
													// }
													// else{
													// 	vip_expire = today.setDate(today.getDate()+vip_day);
													// }
													// user_info.vip_expire = new Date(vip_expire);
													//end vip expire
													user_info.save((err, reply) => {
														if(err){
															res.send('0|' + new Buffer('(trangnguyen.edu.vn) he thong dang ban, vui long thu lai sau').toString('base64'));
														} else {
															//res.send('1|' + new Buffer('(trangnguyen.edu.vn) thong bao ID ' + user_id + ' da duoc KICK HOAT va VAO THI. BTC tang hs ' + vip_day + ' ngay LUYEN TAP 6 mon hoc tai: hoc.trangnguyen.edu.vn. Ho tro: 024.6666.8786.').toString('base64'));
															res.send('1|' + new Buffer('(trangnguyen) thong bao ID ' + user_id + ' da duoc KICK HOAT va VAO THI. hay vao LUYEN TAP tai: hoc.trangnguyen.edu.vn de co ket qua cao nhat. Ho tro: 024.6666.8786').toString('base64'));
														}
													});
												} else {
													//sdt da kich hoat cho id khac
													res.send('1|' + new Buffer('(trangnguyen.edu.vn) xin loi SDT ' + client_mobile + ' da duoc su dung cho ID khac, 1 SDT chi su dung kich hoat cho 1 ID. Can ho tro xin goi: 024.6666.8786.').toString('base64'));
												}
											}
										});
									}
								}
							} else {
								//user not exists
								res.send('1|' + new Buffer('(trangnguyen.edu.vn) xin loi ID ' + user_id + ' khong co trong he thong. Can ho tro xin goi: 024.6666.8786.').toString('base64'));
							}
						}
					});
				} else {
					//sai cú pháp
					res.send('1|' + new Buffer('(trangnguyen.edu.vn) cu phap sai. De kich hoat tai khoan soan: "TNV id" gui 8055, vi du: id la 123, soan: "TNV 123" gui 8055. Ho tro:024.6666.8786.').toString('base64'));
				}
			} else {
				//sai cú pháp
				res.send('1|' + new Buffer('(trangnguyen.edu.vn) cu phap sai. De kich hoat tai khoan soan: "TNV id" gui 8055, vi du: id la 123, soan: "TNV 123" gui 8055. Ho tro:024.6666.8786.').toString('base64'));
			}

			/*
			{ reciver_email: 'nganluong.trangnguyen@gmail.com',
				transaction_id: '5355854',
				price: '1000',
				amount: '7500',
				fee: '2500',
				ref_code: 'id 13699',
				keyword: 'TNV',
				service_id: '8055',
				message: 'tnv id 13699',
				client_mobile: '0964335688',
				telco: 'VITTEL',
				checksum: 'e716cb54854da2c5c7560a1f3c129942',
				fnc: 'function' }
			*/
		} else {
			res.send('0');
		}
	} catch(e) {
		logger.error(e);
	}
});

router.post('/vtc-sms', function(req, res) {
	try{
		const util = req.util;
		const body = req.body;
		// const DbUtil = req.DbUtil;
		const ip = req.headers['x-forwarded-for']? req.headers['x-forwarded-for']: req.connection.remoteAddress;
		logger.info(ip,'POST:',body,'Query:',req.query);

		//save log
		const smsLogModel = new SmsLogModel({body});
		smsLogModel.save((err) => {if(err) logger.error(err);});
		//end save log

		//Function: MoListener
		const cpId = util.toString(body.cpId, ''); //định danh bên vtc
		const moId = util.toString(body.moId, ''); //Mã ID của bản tin MO
		const msisdn = util.toString(body.msisdn, ''); //sđt khách hàng
		const telco = util.toString(body.telco, ''); //nhà mạng
		const shortCode = util.toString(body.shortCode, ''); //đầu số
		const commandCode = util.toString(body.commandCode, ''); //command code TNV
		const message = util.toString(body.message, ''); //nội dung sms đã được encode base64
		const requestTime = util.toString(body.requestTime, ''); //yyyyMMddHHmmss
		const mode = util.toString(body.mode, ''); //REAL hoặc FW
		const sign = util.toString(body.sign, ''); //MD5(cpId + privatekey + moId + msisdn + telco + shortCode + commandCode + message + requestTime + mode)
		
		//TRANGNGUYEN / abc87d298sa368
		const privatekey = 'abc87d298sa368';
		const makiemtra = util.MD5(`${cpId}${privatekey}${moId}${msisdn}${telco}${shortCode}${commandCode}${message}${requestTime}${mode}`);
		if(sign === makiemtra) {
			/*res.json({
				Code: 0,
				Result: 'Success',
				MTs: [{
					Charging: 1,
					Message: 'ket noi thanh cong: ' + msisdn,
					ContentType: 'TEXT'
				}]
			})*/
			// const ref_code = Buffer.from(message, 'base64').toString("ascii").split(/ /g)[1];
			const ref_code = Buffer.from(message, 'base64').toString("ascii");
			const client_mobile = (msisdn.indexOf('84') === 0)? '0' + msisdn.substring(2): msisdn;

			switch (shortCode) {
				case '8030':
					getUsername(req, res, ref_code, client_mobile);
					break;
				case '8130':
					activeAccount(req, res, ref_code, client_mobile);
					break;
				// case '8330':
				// 	reActiveAccount(req, res, ref_code, client_mobile);
				case '8530':
					changePassword(req, res, ref_code, client_mobile);
					break;
				default:
					res.json({
						Code: 1,
						Result: 'error',
						MTs: [{
							Charging: 1,
							Message: '(TRANGNGUYEN) Sai dau so, TrangNguyen sd cac dau so:\n8030: lay ten dang nhap\n8130 kich hoat tk\n8330: kich hoat lai tk\n8530: lay ten dang nhap va mat khau'.substring(0, 160),
							ContentType: 'TEXT'
						}]
					});
			}
		} else {
			res.json({
				Code: 1,
				Result: 'error',
				MTs: [{
					Charging: 0,
					Message: 'ket noi khong thanh cong',
					ContentType: 'TEXT'
				}]
			});
		}
	} catch(e) {
		logger.error(e);
	}
});

/** Process SMS 8030
 * @param req
 * @param res
 * @param ref_code
 * @param client_mobile
 * @returns {Promise<void>}
 */
const getUsername = async (req, res, ref_code, client_mobile) => {
	const DbUtil = req.DbUtil;

	try {
		const userInfo = await DbUtil.getUserByMobile(client_mobile);
		if(userInfo) {
			if(!userInfo.banned) {
				res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen) Thong tin tai khoan cua ban:\nId: ${userInfo._id}\nUsername: ${userInfo.username}\nKich hoat: ${userInfo.active? 'Ok': 'Chua'}\nHotro: 024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
			} else {
				res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen) Tai khoan nay dang bi chan do vi pham.\nHo tro: 024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
			}
		} else {
			res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: '(trangnguyen) Khong tim thay tai khoan nao kich hoat bang SDT nay.\nVui long su dung SDT khac'.substring(0, 160), ContentType: 'TEXT'}] })
		}
	} catch(e) {
		logger.error(e);
		res.json({Code: 0, Result: 'Success', MTs: [{Charging: 0, Message: '(trangnguyen) He thong dang ban, vui long thu lai sau\nEmail: hotro@trangnguyen.edu.vn\nMobile: 024.6666.8786'.substring(0, 160), ContentType: 'TEXT'}] })
	}
};

/**
 * Process SMS 8130
 * @param req
 * @param res
 * @param ref_code
 * @param client_mobile
 */
const activeAccount = (req, res, ref_code, client_mobile) => {
	const util = req.util;
	const DbUtil = req.DbUtil;

	try {
		const id = ref_code.split(/ /g)[1];
		if(id && util.isOnlyNumber(id)) {
			const user_id = util.parseInt(id);
			if(user_id > 0) {
				DbUtil.GetUserActive(user_id, (err, user_info) => {
					if(err) {
						res.json({Code: 1, Result: 'error', MTs: [{Charging: 1, Message: `(trangnguyen.edu.vn) he thong dang ban, vui long thu lai sau`, ContentType: 'TEXT'}] })
					} else {
						if(user_info) {
							if(user_info.active) {
								//user da active
								res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen.edu.vn) user co id: ${user_id} da kich hoat, moi hoc sinh vao LUYEN TAP truoc khi thi.\nCan ho tro xin goi: 024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
							} else {
								if(user_info.mobile && user_info.mobile !== '') {
									res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen.edu.vn) user co id: {user_id} da vi pham quy che. Thac mac xin lien he:\Email: hotro@trangnguyen.edu.vn\nMobile: 024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
								} else {
									DbUtil.CountMobile(client_mobile, (err, count) => {
										if(err){
											//res.send('0|' + new Buffer('(trangnguyen.edu.vn) he thong dang ban, vui long thu lai sau').toString('base64'));
											res.json({Code: 1, Result: 'error', MTs: [{Charging: 1, Message: `(trangnguyen.edu.vn) he thong dang ban, vui long thu lai sau, lien he voi BTC qua\nEmail: hotro@trangnguyen.edu.vn\nHo tro: 024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
										} else {
											if(count === 0) {
												//save data
												user_info.active = true;
												user_info.mobile = client_mobile;
												user_info.save((err, reply) => {
													if(err) {
														res.json({Code: 1, Result: 'error', MTs: [{Charging: 1, Message: '(trangnguyen.edu.vn) he thong dang ban, vui long thu lai sau', ContentType: 'TEXT'}] })
													} else {
														res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen) kich hoat tk thanh cong\n Id: ${user_id}\nUsername: ${user_info.username}\nVao LUYEN TAP: hoc.trangnguyen.edu.vn de co ket qua cao nhat.\nHo tro: 024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
													}
												});
											} else {
												//sdt da kich hoat cho id khac
												res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen.edu.vn) xin loi SDT ${client_mobile} da sd cho ID khac, 1 SDT chi sd kich hoat cho 1 ID.\nCan ho tro xin lien he:\nMobile: 024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
											}
										}
									});
								}
							}
						} else {
							//user not exists
							res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen.edu.vn) xin loi ID ${user_id} khong co trong he thong.\nCan ho tro xin goi: 024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
						}
					}
				});
			} else {
				//sai cú pháp
				res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen.edu.vn) cu phap sai.\nDe kich hoat tai khoan soan: "TNV id" gui 8130,\nVi du: id la 123, soan: "TNV 123" gui 8130.\nHo tro: 024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
			}
		} else {
			//sai cú pháp
			res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen.edu.vn) cu phap sai.\nDe kich hoat tai khoan soan: "TNV id" gui 8130,\nvi du: id la 123, soan: "TNV 123" gui 8130.\nHo tro:024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
		}
	} catch(e) {
		logger.error(e);
		res.json({Code: 0, Result: 'Success', MTs: [{Charging: 0, Message: `(trangnguyen) He thong dang ban, vui long thu lai sau, lien he voi BTC qua\nEmail: hotro@trangnguyen.edu.vn\nHo tro: 024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
	}
};

/**
 * Process SMS 8330
 * @param req
 * @param res
 * @param ref_code
 * @param client_mobile
 */
const reActiveAccount = async (req, res, ref_code, client_mobile) => {
	// const util = req.util;
	const DbUtil = req.DbUtil;

	try {
		const userInfo = await DbUtil.getUserByMobile(client_mobile);
		if(userInfo) {
			if(!userInfo.banned) {
				userInfo.active = true;
				const result = await userInfo.save();
				logger.info(result);
				res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen) kich hoat lai tk thanh cong, chi dung 1 tk de thi va luyen tap\nId: ${userInfo._id}\nUsername: ${userInfo.username}`.substring(0, 160), ContentType: 'TEXT'}] })
			} else {
				res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen) Tai khoan nay dang bi chan do vi pham, ko the kich hoat lai.\nEmail: hotro@trangnguyen.edu.vn\nHo tro: 024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
			}
		} else {
			res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: '(trangnguyen) Khong tim thay tk nao kich hoat bang SDT nay.\nVui long su dung SDT khac de kich hoat lai\nEmail: hotro@trangnguyen.edu.vn\nMobile: 024.6666.8786'.substring(0, 160), ContentType: 'TEXT'}] })
		}
	} catch(e) {
		logger.error(e);
		res.json({Code: 0, Result: 'Success', MTs: [{Charging: 0, Message: '(trangnguyen) He thong dang ban, vui long thu lai sau, lien he voi BTC qua\nEmail: hotro@trangnguyen.edu.vn\nMobile: 024.6666.8786'.substring(0, 160), ContentType: 'TEXT'}] })
	}
};

/**
 * Process SMS 8530
 * @param req
 * @param res
 * @param ref_code
 * @param client_mobile
 * @returns {Promise<void>}
 */
const changePassword = async (req, res, ref_code, client_mobile) => {
	const util = req.util;
	const DbUtil = req.DbUtil;

	try {
		const userInfo = await DbUtil.getUserByMobile(client_mobile);
		if(userInfo) {
			if(!userInfo.banned) {
				const arrCode = ref_code.split(' ');
				let password = '';
				if(arrCode.length > 1) {
					arrCode.shift(); //TNV
					password = arrCode.join('').trim().replace(/ /g, '');
				}
				if(password.length < 6 || password.length > 30) {
					password = util.generatorPasswordSimple(6);
				}
				userInfo.active = true;
				userInfo.password = util.sha256(password);
				const result = await userInfo.save();
				logger.info(result);
				res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen) doi mat khau thanh cong\nId: ${userInfo._id}\nUsername: ${userInfo.username}\nPassword: ${password}\nKich hoat: Ok\nDoi MK tai: http://bit.ly/TnDoiPass`.substring(0, 160), ContentType: 'TEXT'}] })
			} else {
				res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: `(trangnguyen) Tai khoan nay dang bi chan do vi pham, ko the doi MATKHAU.\nEmail: giaovien@trangnguyen.edu.vn\nHo tro: 024.6666.8786`.substring(0, 160), ContentType: 'TEXT'}] })
			}
		} else {
			res.json({Code: 0, Result: 'Success', MTs: [{Charging: 1, Message: '(trangnguyen) Khong tim thay tk nao kich hoat bang SDT nay.\nVui long su dung SDT khac de doi MATKHAU\nEmail: giaovien@trangnguyen.edu.vn\nHo tro: 024.6666.8786'.substring(0, 160), ContentType: 'TEXT'}] })
		}
	} catch(e) {
		logger.error(e);
		res.json({Code: 0, Result: 'Success', MTs: [{Charging: 0, Message: '(trangnguyen) He thong dang ban, vui long thu lai sau, lien he voi BTC qua\nEmail: giaovien@trangnguyen.edu.vn\nHo tro: 024.6666.8786'.substring(0, 160), ContentType: 'TEXT'}] })
	}
};
// end process message VTC

module.exports = router;