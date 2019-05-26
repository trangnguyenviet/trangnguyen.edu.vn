'use strict';
// let geoip = require('geoip-lite');
const logger = require('tracer').colorConsole();
const async = require('async');
// let redis = require("redis");
const express = require('express');
const UsersModel = require('../model/UsersModel');
// let ProvinceModel = require('../model/ProvinceModel');
// let DestrictModel = require('../model/DistrictModel');
// let SchoolModel = require('../model/SchoolModel');
// const LogRequestModel = require('../model/LogRequestModel');
const LogUsersModel = require('../model/LogUsersModel');
const ScoreModel = require('../model/ScoreModel');
const util = require('../util/util');
const utilModule = require('util');
const router = express.Router();

// let email = require('../util/email');

//send email => email
// let SendEmail = function(email_address,text,subject,callback){
// 	email.setRecerver(email_address);
// 	email.setSubject(subject);
// 	email.send(text,function(err,text){
// 		if(callback) callback(err,text);
// 	});
// };

router.post('/score', function(req, res) {
	let redis = req.redis;
	// let util = req.util;
	// let log = req.log;
	// let dir_root = req.dir_root;
	let config = req.config;
	// let DbUtil = req.DbUtil;

	let response = {};
	try{
		//let tndata = req.tndata;
		let tndata = req.tndata;
		if(tndata && tndata.user){
			let user_id = tndata.user._id;
			getScore(redis,config,user_id,function(response){
				res.json(response);
			});
		}
		else{
			response.error = 5;
			response.message = 'Bạn chưa đăng nhập';
			res.json(response);
		}
	}
	catch (e) {
		response.error=10000;
		response.message="server đang bận, bạn hãy thử lại sau";
		res.json(response);
		// log.error('users: ' + e);
		logger.error(e);
	}
});

router.post('/score/:user_id?', function(req, res) {
	let redis = req.redis;
	let util = req.util;
	// let log = req.log;
	// let dir_root = req.dir_root;
	let config = req.config;
	// let DbUtil = req.DbUtil;

	let response = {};
	try{
		let user_id = req.params.user_id;
		if(user_id && util.isOnlyNumber(user_id)){
			user_id = parseInt(user_id);
			getScore(redis,config,user_id,function(response){
				res.json(response);
			});
		}
		else{
			response.error = 2;
			response.message = 'không có thông tin người dùng';
			res.json(response);
		}
	}
	catch (e) {
		response.error=10000;
		response.message="server đang bận, bạn hãy thử lại sau";
		res.json(response);
		logger.error(e);
	}
});

function getScore(redis,config,user_id,callback_results){
	let response = {};
	try{
		let key_rank = config.redis_key.rank.type;
		util.execFun([
			function(callback){
				ScoreModel.find({
					user_id: user_id
				})
				.select('type_id round_id score time luot created_at')
				.sort({type_id:1,round_id:1})
				.exec(function(err,results){
					if(err){
						response.error=20000;
						response.message="server đang bận, bạn hãy thử lại sau";
						// console.log(err);
						logger.error(err);
						callback(null, false);
					}
					else{
						response.content = results;
						response.error=0;
						response.message='';
						callback(null, true);
					}
				});
			},
			function(callback){
				let keys = utilModule.format(key_rank, config.exam_olympic_toan.id);
				redis.zrevrank(keys,user_id,function(err,rank){
					if(err) {
						// console.log(err);
						logger.error(err);
						callback(null,false);
					}
					else{
						// console.log(rank);
						response[keys] = rank;
						callback(null, true);
					}
				});
			},
			function(callback){
				let keys = utilModule.format(key_rank, config.exam_olympic_english.id);
				redis.zrevrank(keys,user_id,function(err,rank){
					if(err) {
						callback(null,false);
					}
					else {
						response[keys] = rank;
						callback(null, true);
					}
				});
			},
			function(callback){
				let keys = utilModule.format(key_rank, config.exam_olympic_cuoituan.id);
				redis.zrevrank(keys,user_id,function(err,rank){
					if(err) {
						callback(null,false);
					}
					else {
						response[keys] = rank;
						callback(null, true);
					}
				});
			},
			function(callback){
				let keys = utilModule.format(key_rank, config.exam_tiengviet.id);
				redis.zrevrank(keys,user_id,function(err,rank){
					if(err){
						callback(null,false);
					}
					else {
						response[keys] = rank;
						callback(null, true);
					}
				});
			}
		],
		function(){
			callback_results(response);
		});
	}
	catch (e) {
		response.error=10000;
		response.message="server đang bận, bạn hãy thử lại sau";
		// log.error(e);
		logger.error(e);
		callback_results(response);
	}
}

router.post('/register', function(req, res) {
	const redis = req.redis;
	const redis_token = req.redis_token;
	const util = req.util;
	// let log = req.log;
	const config = req.config;
	// let dir_root = req.dir_root;
	const DbUtil = req.DbUtil;

	const ip = req.headers['x-forwarded-for']? req.headers['x-forwarded-for']: req.connection.remoteAddress;
	// let geo = geoip.lookup(ip);
	//if(geo) logger.debug('[register] create new User: %s | ip: %s (%s - %s)',req.body.username,ip,geo.city,geo.country);
	//else logger.debug('[register] create new User: %s | ip: %s',req.body.username,ip);
	// logger.debug('[register] create new User: %s | ip: %s',req.body.username,ip);

	let response = {};
	try{
		async.waterfall([
			function(callback){
				if(req.tndata){
					callback(false,req.tndata);
				}
				else{
					response.error=3;
					response.message="Đã hết phiên làm việc - hãy load lại trang";
					callback(true,null);
				}
			},
			function(tndata,callback){
				if(tndata.user){
					response.error=3;
					response.message="Bạn đã có tài khoản, hãy thoát ra trước khi tạo tài khoản khác";
					callback(true,null);
				}
				else{
					callback(false,tndata);
				}
			},
			function(tndata,callback){
				if(tndata.captcha){
					callback(false,tndata);
				}
				else{
					response.error=3;
					response.message="Đã hết phiên làm việc - hãy load lại mã xác nhận";
					callback(true,null);
				}
			},
			//check captcha
			function(tndata, callback) {
				let captcha = req.body.captcha;
				if(tndata.captcha === captcha) {
					callback(false,req.body);
				} else {
					response.error=3;
					response.message="Mã xác nhận không đúng";
					callback(true,null);
				}
			},
			//validate data
			function(body,callback){
				let fullname = body.fullname;
				let username = body.username;
				let password = body.password;
				let repassword = body.repassword;
				// let email = body.email;
				// let mobile = body.mobile;
				let province_id = body.province_id;
				let district_id = body.district_id;
				let school_id = body.school_id;
				let class_id = body.class_id;
				let class_name = body.class_name;
				let birthday = body.birthday;

				validate_register(util,fullname,username,password,repassword,province_id,district_id,school_id,class_id,class_name,birthday,function(msg){
					if(msg==''){
						let data = {};
						data.fullname=fullname;
						data.username=username;
						data.password=password;
						// data.email=email;
						// data.mobile=mobile;
						data.province_id=province_id;
						data.district_id=district_id;
						data.school_id=school_id;
						data.class_id=class_id;
						data.class_name=class_name;
						data.birthday=util.parseDate(birthday);
						callback(false,data);
					} else {
						response.error = 5;
						response.message=msg;
						callback(true,null);
					}
				});
			},
			//check exist user => tối ưu
			function(data,callback){
				//UsersModel.count({username:data.username},function(err,count){
				DbUtil.CheckExistsUser(data.username,function(err,isExists){
					if(err){
						response.error=20111;
						response.message='Hệ thống đang bận, bạn hãy thử lại sau.';
						callback(true,null);
						logger.error(err);
					}
					else{
						// console.log('isExists',data.username,isExists);
						if(isExists){
							response.error=102;
							response.message='Tên đăng nhập đã tồn tại, vui lòng chọn tên khác';
							callback(true,null);
						}
						else{
							callback(false,data);
						}
					}
				});
			},
			//check province => tối ưu
			function(data,callback){
				let province_id = data.province_id;
				//ProvinceModel.findOne({_id:province_id}).select('name').exec(function(err,docs){
				DbUtil.GetProvinceInfo(province_id,function(err,docs){
					if(err){
						response.error=20231;
						response.message='Hệ thống đang bận, bạn hãy thử lại sau.';
						callback(true,null);
						logger.error(err);
					}
					else{
						if(docs){
							data.province_name = docs;
							callback(false,data);
						}
						else{
							response.error=5;
							response.message='Không tìm thấy thông tin tỉnh/thành phố';
							callback(true,null);
						}
					}
				});
			},
			//check district => tối ưu
			function(data,callback){
				let district_id = data.district_id;
				//DestrictModel.findOne({_id:district_id}).select('name').exec(function(err,docs){
				DbUtil.GetDistrictInfo(district_id,function(err,docs){
					if(err){
						response.error=20331;
						response.message='Hệ thống đang bận, bạn hãy thử lại sau.';
						callback(true,null);
						logger.error(err);
					}
					else{
						if(docs){
							data.district_name = docs;
							callback(false,data);
						}
						else{
							response.error=5;
							response.message='Không tìm thấy thông tin quận/huyện phố';
							callback(true,null);
						}
					}
				});
			},
			//check school => tối ưu
			function(data,callback){
				let school_id = data.school_id;
				//SchoolModel.findOne({_id:school_id}).select('name').exec(function(err,docs){
				DbUtil.GetSchoolInfo(school_id,function(err,docs){
					if(err){
						response.error=20431;
						response.message='Hệ thống đang bận, bạn hãy thử lại sau.';
						callback(true,null);
						logger.error(err);
					}
					else{
						if(docs){
							data.school_name = docs;
							callback(false,data);
						}
						else{
							response.error=5;
							response.message='Không tìm thấy thông tin quận/huyện phố';
							callback(true,null);
						}
					}
				});
			},
			//count member
			// function(data,callback){
			// 	UsersModel.count({},function(err,count){
			// 		if(err){
			// 			response.error=20111;
			// 			response.message='Hệ thống đang bận, bạn hãy thử lại sau.';
			// 			callback(true,null);
			// 			logger.error(err);
			// 		}
			// 		else{
			// 			data.count_member = count;
			// 			callback(false,data);
			// 		}
			// 	});
			// },
			//save_data
			function(data,callback){
				//console.log('121212');
				let user = new UsersModel();
				user.name=data.fullname;
				user.username=data.username;
				user.password = util.sha256(data.password);
				// user.email=data.email;
				// user.mobile=data.mobile;
				user.province_id=parseInt(data.province_id);
				user.province_name=data.province_name;
				user.district_id=parseInt(data.district_id);
				user.district_name=data.district_name;
				user.school_id=parseInt(data.school_id);
				user.school_name=data.school_name;
				user.class_id=parseInt(data.class_id);
				user.class_name=data.class_name;
				user.birthday=new Date(data.birthday);
				user.money = 0;//data.count_member<=1000?86400:0;//khuyến mãi

				// if(config.IsEvent16()){
				// 	let date = new Date();
				// 	date.setDate(date.getDate()+16);
				// 	user.vip_expire=date;
				// 	user.is_event_16=true;
				// }

				let mark = util.getMarks();
				user.marks = [mark];
				user.save(function(err,user_info){
					if(err){
						response.error=20141;
						response.message='Hệ thống đang bận, bạn hãy thử lại sau.';
						callback(true,null);
						logger.error(err);
					}
					else{
						response.error=0;
						response.message='done';

						//set value user
						const ujs = user_info.toJSON();
						response.user = ujs;
						ujs.mark = true;

						//set marks
						const user_id = user_info._id;
						const cookie_name = '_i_';
						let token_value = req.cookies[cookie_name];
						if(!token_value){
							token_value = util.getMarks();
							res.cookie(cookie_name, token_value, {
								domain: '.trangnguyen.edu.vn',
								maxAge: Infinity,
								httpOnly: true
							});
						}
						const log = new LogUsersModel({
							user_id,
							ip,
							action: 'register',
							token: token_value,
							client_info: {
								use_agent: req.headers['user-agent'],
								referer: req.headers['referer'],
								position: req.body.position
							}
						});
						log.save((err, info) => {});
						redis_token.set(user_id, token_value);
						//end set marks

						//session
						// req.tndata.user = ujs;

						callback(false,null);
						// DbUtil.AddListUser(data.username);
						let key_count = config.redis_key.count_member;
						redis.incr(key_count);
					}
				});
			}
		],
		function(err,results){
			//console.log('131313');
			req.tndata.captcha=null;
			res.json(response);

			//save log
			// if(config.is_log_request){
			// 	let logRequestModel = new LogRequestModel();
			// 	logRequestModel.ip = ip;
			// 	logRequestModel.request = req.body;
			// 	logRequestModel.response = response;
			// 	logRequestModel.created_at = new Date();
			// 	logRequestModel.save();
			// }
			logger.trace(response.message);
		});
	}
	catch (e) {
		response.error=10000;
		response.message="server đang bận, bạn hãy thử lại sau";
		res.json(response);
		req.tndata.captcha=null;
		// log.error('users: ' + e);
		logger.error(e.stack);
	}
});

router.post('/count', function(req, res) {
	let redis = req.redis;
	let util = req.util;
	// let log = req.log;
	// let dir_root = req.dir_root;
	let config = req.config;
	// let DbUtil = req.DbUtil;

	let response = {};
	try{
		util.execFun([
			function(callback){
				let key = config.redis_key.count_member;
				redis.get(key,function(err,count){
					if(err){
						response.count=0;
						callback(null, true);
						logger.error(err);
					}
					else{
						if(count){
							response.count=count;
							callback(null, true);
						}
						else{
							//load db
							UsersModel.count({},function(err,count){
								if(err){
									response.count=0;
									callback(null, true);
									logger.error(err);
								}
								else{
									response.count=count;
									callback(null, true);
									redis.set(key,count);
								}
							});
						}
					}
				});
			},
			// function(callback){
			// 	redis.get(config.redis_key.count_connect_exam,function(err,count){
			// 		if(err){
			// 			response.count_exam=0;
			// 			callback(null, true);
			// 			logger.error(err);
			// 		}
			// 		else{
			// 			if(count){
			// 				response.count_exam=count;
			// 				callback(null, true);
			// 			}
			// 			else{
			// 				response.count_exam=0;
			// 				callback(null, true);
			// 			}
			// 		}
			// 	});
			// }
		],
		function(){
			response.error=0;
			response.message="";
			res.json(response);
		});
	}
	catch(e){
		response.error=10000;
		response.message="server đang bận, bạn hãy thử lại sau";
		res.json(response);
		logger.error(e.stack);
	}
});

function validate_register(util,fullname,username,password,repassword,province_id,district_id,school_id,class_id,class_name,birthday,callback){
	class_id = parseInt(class_id);
	//fullname
	if(!fullname || fullname==''){
		callback('Hãy nhập họ tên');
	}
	else if(fullname.length<3 && fullname.length>30){
		callback('Họ tên không đúng phải từ 3 đến 30 ký tự');
	}
	else if(!util.isNameVi(fullname)){
		callback('Họ tên không đúng - không có số, ký tự đặc biệt');
	}
	//username
	else if(!username || username==''){
		callback('Hãy nhập tên đăng nhập');
	}
	else if(username.length<6 || username.length>20){
		callback('Tên đăng nhập phải &ge; 6 và &le; 20 ký tự và bắt đầu là chữ');
	}
	else if(!util.isUsername(username)){
		callback('Tên đăng nhập không được chứa ký tự đặc biệt');
	}

	//password
	else if(!password || password==''){
		callback('Hãy nhập mật khẩu');
	}
	else if(password.length<6 || password.length>30){
		callback('Mật khẩu phải từ 6 đến 30 ký tự');
	}
	else if(!util.isPassword(password)){
		callback('Mật khẩu định dạng không đúng');
	}
	else if(!repassword || repassword==''){
		callback('Hãy nhập lại mật khẩu');
	}
	else if(repassword!=password){
		callback('Mật khẩu không trùng khớp');
	}
	// //email
	// else if(!email || email==''){
	// 	callback('Hãy nhập địa chỉ email');
	// }
	// else if(!util.isEmail(email)){
	// 	callback('Định dạng email không đúng');
	// }
	// //mobile
	// else if(mobile!='' && !util.isPhoneNumber(mobile)){
	// 	callback('Điện thoại liên hệ hãy nhập số di động');
	// }
	//province
	else if(!province_id || !util.isOnlyNumber(province_id)){
		callback('Hãy chọn tỉnh/thành phố');
	}
	//district
	else if(!district_id || !util.isOnlyNumber(district_id)){
		callback('Hãy chọn quận/huyện');
	}
	//school
	else if(!school_id || !util.isOnlyNumber(school_id)){
		callback('Hãy chọn trường');
	}
	//class
	else if (!util.isOnlyNumber(class_id)){
		callback('Hãy chọn lớp/khối');
	}
	else if(!class_id || class_id<=0 || class_id >5){
		callback('Hãy chọn lớp/khối');
	}
	//birthday
	else if(!birthday || birthday==''){
		callback('Hãy chọn ngày sinh');
	}
	else if(!util.isValidDate(birthday)){
		callback('Định dạng ngày tháng không đúng');
	}
	else callback('');
}

router.post('/login', function(req, res) {
	const redis = req.redis;
	const redis_token = req.redis_token;

	const util = req.util;
	// let log = req.log;
	const config = req.config;
	// let dir_root = req.dir_root;
	// const DbUtil = req.DbUtil;

	let response = {};
	try {
		//let key_login_ip = config.redis_key.login_ip + req.ip;
		//sHeaders['x-forwarded-for'] ? sHeaders['x-forwarded-for']: socket.handshake.address;
		const ip = req.headers['x-forwarded-for']? req.headers['x-forwarded-for']: req.connection.remoteAddress;
		const key_login_ip = config.redis_key.login_ip + ip;

		// let geo = geoip.lookup(ip);
		// if(geo) logger.log('[login]: %s - %s (%s - %s)',req.body.username,ip,geo.city,geo.country);
		// else logger.log('[login]: %s - %s',req.body.username,ip);
		logger.log('[login]: %s - %s',req.body.username,ip);

		// let date = new Date();
		// if(date.getHours()<12 && date.getDate()==5){
		// 	res.json({
		// 		error: 30000,
		// 		message: "server đang bận, bạn hãy thử lại sau"
		// 	});
		// }
		// return;

		async.waterfall([
			function(callback) {
				redis.incr(key_login_ip,function(err,count_connect){
					if(err) {
						response.error=30000;
						response.message="server đang bận, bạn hãy thử lại sau";
						callback(true,null);
						logger.error(err);
					} else {
						if(count_connect <= config.login_false){
							callback(false,null);
						} else {
							response.error=40000;
							response.message="Có nghi vấn DDOS<br/>Hãy chờ 15 phút sau đăng nhập lại";
							callback(true,null);
						}
					}
					redis.pexpire(key_login_ip,900000);
				});
			},
			function(data,callback) {
				let username = req.body.username;
				let password = req.body.password;
				if(!username || !password){
					response.error=200;
					response.message="Chưa nhập đủ thông tin";
					callback(true,null);
				} else if(!util.isUsername(username)) {
					response.error=101;
					response.message='định dạng username không đúng';
					callback(true,null);
				} else if(!util.isPassword(password)) {
					response.error=201;
					response.message="định dạng password không đúng";
					callback(true,null);
				} else {
					password = util.sha256(password);
					// UsersModel.findOne({username:username,deleted:false,password:password}).select('_id username name banned avatar province_id province_name district_id district_name school_id school_name class_id class_name birthday marks exam_school exam_district exam_province exam_national').exec(function(err,user_info){
					UsersModel.findOne({username:username,deleted:false,password:password}).select('_id username name banned avatar province_id province_name district_id district_name school_id school_name class_id class_name birthday exam_school exam_district exam_province exam_national').exec(function(err,user_info){
						if(err) {
							response.error=20131;
							response.message='server đang bận, bạn hãy thử lại sau';
							logger.error(err);
							callback(true,null);
						} else {
							if(user_info) {
								if(user_info.banned === true) {
									response.error=1;
									response.message="Tài khoản của bạn bị vi phạm, nên đang bị ban";
									callback(true,null);
								} else {
									response.error = 0;
									let login_ok = true;
									// if(config.IsEvent12() || config.IsEvent13() || config.IsEvent14()){
									if(config.isEvent12()) {
									// if(config.isEvent13()){
									// if(config.isEvent14()){
										if(user_info.exam_school) {
											response.auto_hide = false;
											response.message="Bạn trong danh sách thi sơ khảo - hãy kiểm tra thông tin cá nhân";
										} else {
											response.error = 1;
											response.message = "Hiện đang diễn ra thi cấp trường, mời bạn vào LUYỆN TẬP trước khi thi";
											login_ok = false;
										}
									}

									// if(config.isEvent15()){
									// if(config.isEvent16()){
									// 	if(user_info.exam_district){
									// 		response.auto_hide = false;
									// 		response.message="Bạn trong danh sách thi Hương - hãy kiểm tra thông tin cá nhân";
									// 	}
									// 	else{
									// 		response.error=1;
									// 		response.message="Đang diễn ra thi Hương, bạn hãy đăng nhập sau 17h";
									// 		login_ok = false;
									// 	}
									// }

									// // if(config.isEvent17()){
									// if(config.isEvent18()){
									// 	if(user_info.exam_province){
									// 		response.auto_hide = false;
									// 		response.message="Bạn trong danh sách thi Hội - hãy kiểm tra thông tin cá nhân";
									// 	}
									// 	else{
									// 		response.error=1;
									// 		response.message="Đang diễn ra thi Hội, bạn hãy vào luyện tập";
									// 		login_ok = false;
									// 	}
									// }

									// if(config.isExamNational()){
									// 	if(user_info.exam_national){
									// 		response.auto_hide = false;
									// 		response.message="Bạn trong danh sách thi Đình - hãy kiểm tra thông tin cá nhân";
									// 	}
									// 	else{
									// 		response.error=1;
									// 		response.message="Đang diễn ra thi Đình, bạn hãy đăng nhập sau lại sau";
									// 		login_ok = false;
									// 	}
									// }

									if(login_ok){
										//set value user
										const ujs = user_info.toJSON();
										delete ujs.marks;
										response.user = ujs;

										//set marks
										const user_id = user_info._id;
										const cookie_name = '_i_';
										let token_value = req.cookies[cookie_name];
										if(!token_value){
											token_value = util.getMarks();
											res.cookie(cookie_name, token_value, {
												domain: '.trangnguyen.edu.vn',
												maxAge: Infinity,
												httpOnly: true
											});
										}
										const log = new LogUsersModel({
											user_id,
											ip,
											action: 'login',
											token: token_value,
											client_info: {
												use_agent: req.headers['user-agent'],
												referer: req.headers['referer'],
												position: req.body.position
											}
										});
										log.save((err, info) => {});
										redis_token.set(user_id, token_value);
										//end set marks

										//session
										req.tndata.user = ujs;

										response.message="done";
									}

									callback(!login_ok,null);
									redis.del(key_login_ip);
								}
							}
							else{
								response.error=300;
								response.message="username hoặc password không đúng";
								callback(true,null);
							}
						}
					});
				}
			}
		],
		function(err,results){
			res.json(response);

			//save log
			// if(config.is_log_request){
			// 	let logRequestModel = new LogRequestModel();
			// 	logRequestModel.ip = ip;
			// 	logRequestModel.request = req.body;
			// 	logRequestModel.response = response;
			// 	logRequestModel.created_at = new Date();
			// 	logRequestModel.save();
			// }
			logger.trace(response.message);
		});
	}
	catch (e) {
		// response.error=10000;
		// response.message="server đang bận, bạn hãy thử lại sau";
		// res.send(JSON.stringify(response));
		// log.error('users: ' + e);
		logger.error(e.stack);
	}
});

router.get('/logout', function(req, res) {
	req.tndata.reset();
	// req.tndata.destroy();
	res.redirect('/');
});

//fogot
router.post('/fogot', function(req, res) {
	let redis = req.redis;
	let util = req.util;
	// let log = req.log;
	let config = req.config;
	// let dir_root = req.dir_root;
	// let DbUtil = req.DbUtil;

	let response = {};
	try{
		let ip = req.headers['x-forwarded-for']? req.headers['x-forwarded-for']: req.connection.remoteAddress;
		let key_login_ip = config.redis_key.login_ip + ip;

		async.waterfall([
			function(callback){
				if(req.tndata){
					callback(false,req.tndata);
				}
				else{
					response.error=3;
					response.message="Đã hết phiên làm việc, hãy ấn F5 để tải lại trang";
					callback(true,null);
				}
			},
			function(tndata,callback){
				if(tndata.user){
					response.error=3;
					response.message="Bạn đã đăng nhập, không thễ sử dụng tính năng này";
					callback(true,null);
				}
				else{
					callback(false,tndata);
				}
			},
			function(tndata,callback){
				if(tndata.captcha){
					callback(false,tndata);
				}
				else{
					response.error=3;
					response.message="Đã hết phiên làm việc, hãy ấn F5 để tải lại trang";
					callback(true,null);
				}
			},
			//check captcha
			function(tndata,callback){
				let captcha = req.body.captcha;
				if(tndata.captcha==captcha){
					callback(false,req.body);
				}
				else{
					response.error=3;
					response.message="Mã xác nhận không đúng";
					callback(true,null);
				}
			},
			//validate data
			function(body,callback){
				let username = body.username;

				validate_fogot(util,username,function(msg){
					if(msg==''){
						callback(false,username);
					}
					else{
						response.error=5;
						response.message=msg;
						callback(true,null);
					}
				});
			},
			//check exist user
			function(username,callback){
				UsersModel.findOne({username:username,deleted: false,banned: false}).select('_id username name mobile email').exec(function(err,user_info){
					if(err){
						response.error=20131;
						response.message='Hệ thống đang bận, bạn hãy thử lại sau.';
						callback(true,null);
						logger.error(err);
					}
					else{
						if(user_info){
							// response.error=0;
							// response.message='done';
							let email = user_info.email;
							response.email = util.hidenEmail(email);

							//redis set key
							let key = util.randomString(32);
							let key_fogot = config.redis_key.fogot + key;
							redis.psetex(key_fogot,config.redis_key.fogot_time,JSON.stringify(user_info));

							// let subject = utilModule.format(config.email_config.message.subject,user_info.username);
							// let text_send = utilModule.format(config.email_config.message.text,user_info.name,key,key);
							// SendEmail(email,text_send,subject,function(err){
							// 	if(err){
							// 		response.error=105;
							// 		response.message='Không thể gửi email xác nhận';
							// 		callback(true,null);
							// 	}
							// 	else{
							// 		response.error=0;
							// 		response.message='done';
							// 		callback(true,null);
							// 	}
							// 	callback(false,null);
							// });

							//logger.info('[fogot] username: %s | email: %s | mobile: %s | keycache: %s', username, email, user_info.mobile, key);
							logger.info('[fogot] username: %s | email: %s | mobile: %s', username, email, user_info.mobile);
						}
						else{
							response.error=102;
							response.message='Tên đăng nhập không tồn tại';
							callback(true,null);
						}
					}
				});
			}
		],
		function(err,results){
			req.tndata.captcha=null;
			res.json(response);

			//save log
			// if(config.is_log_request){
			// 	let logRequestModel = new LogRequestModel();
			// 	logRequestModel.ip = ip;
			// 	logRequestModel.request = req.body;
			// 	logRequestModel.response = response;
			// 	logRequestModel.created_at = new Date();
			// 	logRequestModel.save();
			// }
			logger.trace(response.message);
		});
	}
	catch (e) {
		// response.error=10000;
		// response.message="server đang bận, bạn hãy thử lại sau";
		// res.json(response);
		req.tndata.captcha=null;
		// log.error('users: ' + e);
		logger.error(e);
	}
});

function validate_fogot(util,username,callback){
	//username
	if(username==''){
		callback('Hãy nhập tên đăng nhập');
	}
	else if(username.length<6 || username.length>20){
		callback('Tên đăng nhập phải &ge; 6 và &le; 20 ký tự và bắt đầu là chữ');
	}
	else if(!util.isUsername(username)){
		callback('Tên đăng nhập không được chứa ký tự đặc biệt');
	}
	else callback('');
}

router.get('/update', function(req, res) {
	// let redis = req.redis;
	let util = req.util;
	// let log = req.log;
	// let config = req.config;
	// let dir_root = req.dir_root;
	// let DbUtil = req.DbUtil;

	let response = {};
	try{
		let userInfo = (req.tndata && req.tndata.user_info)?req.tndata.user_info:null;
		if(userInfo_tndata!=null){
			let _id = userInfo_tndata._id;
			if(_id){
				userInfo._id=_id;
				userInfo.name = util.replaceHtml(req.query.name);
				//userInfo.username = req.query.username;
				//userInfo.password = req.query.password;
				//userInfo.repassword = req.query.repassword;
				userInfo.email = req.query.email;
				userInfo.mobile = req.query.mobile;
				userInfo.sex = req.query.sex;
				userInfo.province_id = req.query.province_id;
				userInfo.province_name = util.replaceHtml(req.query.province_name);
				userInfo.district_id = req.query.district_id;
				userInfo.district_name = util.replaceHtml(req.query.district_name);
				userInfo.school_id = req.query.school_id;
				userInfo.school_name = util.replaceHtml(req.query.school_name);
				//userInfo.class_id = req.query.class_id;
				userInfo.class_name = util.replaceHtml(req.query.class_name);
				userInfo.address = util.replaceHtml(req.query.address);

				let msg = Validate_Update(userInfo);
				if(msg==''){
					//check exist username
					UsersModel.count({username:username},function(err,count){
						if(err){
							response.error=err.code;
							response.message=err.message;
							logger.error(err);
						}
						else{
							if(count && count>0){
								UsersModel.update({
									_id:_id
								},
								{
									$set:{
										name: userInfo.name,
										email: userInfo.email,
										mobile: userInfo.mobile,
										sex: userInfo.sex,
										province_id: userInfo.province_id,
										province_name: userInfo.province_name,
										district_id: userInfo.district_id,
										district_name: userInfo.district_name,
										school_id: userInfo.school_id,
										school_name: userInfo.school_name
									}
								},function(err){
									if(err){
										response.error=err.code;
										response.message=err.message;
										logger.error(err);
									}
									else{
										response.error=0;
										response.message="done";

										//reset tndata
										req.tndata.user_info = userInfo;
									}
									res.send(JSON.stringify(response));
								});
							}
							else{
								response.error=400;
								response.message="không tìm thấy thông tin user";
								res.send(JSON.stringify(response));
							}
						}
					});
				}
				else{
					response.error=2;
					response.message=msg;
					res.send(JSON.stringify(response));
				}
			}
			else{
				response.error=10;
				response.message="đã hết phiên làm việc, hãy đăng nhập lại";
				res.send(JSON.stringify(response));
			}
		}
		else{
			response.error=10;
			response.message="bạn chưa đăng nhập";
			res.send(JSON.stringify(response));
		}
	}
	catch (e) {
		// response.error=10000;
		// response.message="server đang bận, bạn hãy thử lại sau";
		// res.send(JSON.stringify(response));
		// log.error('users: ' + e);
		logger.error(e.stack);
	}
});

router.get('/change_password', function(req, res) {
	// let redis = req.redis;
	let util = req.util;
	// let log = req.log;
	// let config = req.config;
	// let dir_root = req.dir_root;
	// let DbUtil = req.DbUtil;

	let response = {};
	try{
		let userInfo = (req.tndata && req.tndata.user_info)?req.tndata.user_info:null;
		if(userInfo_tndata!=null){
			let _id = userInfo_tndata._id;
			if(_id){
				userInfo._id=_id;
				let old_password = req.query.oldpassword;
				let password = req.query.password;
				let repassword = req.query.repassword;

				//validate
				if(!util.isPassword(password)){
					response.error=400;
					response.message="password không đúng định dạng";
					res.send(JSON.stringify(response));
					return;
				}
				if(password!=repassword){
					response.error=400;
					response.message="nhập lại password không trùng";
					res.send(JSON.stringify(response));
					return;
				}
				//end validate

				old_password = util.sha256(old_password);
				password = util.sha256(password);

				UsersModel.count({_id:_id,password:old_password},function(err,count){
					if(err){
						response.error=err.code;
						response.message=err.message;
						logger.error(err);
					}
					else{
						if(count && count>0){
							UsersModel.update({
									_id:_id
								},
								{
									$set:{
										password: password
									}
								},function(err){
									if(err){
										response.error=err.code;
										response.message=err.message;
									}
									else{
										response.error=0;
										response.message="done";
									}
									res.send(JSON.stringify(response));
								});
						}
						else{
							response.error=400;
							response.message="password cũ không đúng";
							res.send(JSON.stringify(response));
						}
					}
				});
			}
			else{
				response.error=10;
				response.message="đã hết phiên làm việc, hãy đăng nhập lại";
				res.send(JSON.stringify(response));
			}
		}
		else{
			response.error=10;
			response.message="bạn chưa đăng nhập";
			res.send(JSON.stringify(response));
		}
	}
	catch(e){
		// response.error=10000;
		// response.message="server đang bận, bạn hãy thử lại sau";
		// res.send(JSON.stringify(response));
		// log.error('users: ' + e);
		logger.error(e.stack);
	}
});

router.post('/rank_score/', function(req, res) {
	let redis = req.redis;
	let util = req.util;
	// let log = req.log;
	let DbUtil = req.DbUtil;
	let config = req.config;

	let response = {};
	try{
		let key_rank = config.redis_key.rank.type;
		util.execFun([
			function(callback){
				//sếp hạng olympic toán
				let keys = utilModule.format(key_rank,config.exam_olympic_toan.id);
				redis.zrevrange(keys,0,9,function(err,list_user_id){
					if(err){
						// console.log(err);
						logger.error(err);
						callback(null, true);
					}
					else{
						if(list_user_id && list_user_id.length>0){
							DbUtil.GetRank(config.exam_olympic_toan.id,list_user_id,function(err,list_user_info){
								if(err){
									callback(null, true);
									logger.error(err);
								}
								else{
									if(list_user_info && list_user_info.length>0){
										response.rank_olympic_toan = {
											list_user_id:list_user_id,
											list_user_info:list_user_info
										};
									}
									callback(null, true);
								}
							});
						}
						else{
							callback(null, true);
						}
					}
				});
			},
			function(callback){
				//sếp hạng olympic Tiếng Anh
				let keys = utilModule.format(key_rank,config.exam_olympic_english.id);
				redis.zrevrange(keys,0,9,function(err,list_user_id){
					if(err){
						callback(null, true);
						logger.error(err);
					}
					else{
						if(list_user_id && list_user_id.length>0){
							DbUtil.GetRank(config.exam_olympic_english.id,list_user_id,function(err,list_user_info){
								if(err){
									callback(null, true);
									logger.error(err);
								}
								else{
									if(list_user_info && list_user_info.length>0){
										response.rank_olympic_english = {
											list_user_id:list_user_id,
											list_user_info:list_user_info
										};
									}
									callback(null, true);
								}
							});
						}
						else{
							callback(null, true);
						}
					}
				});
			},
			function(callback){
				//sếp hạng olympic cuoituan
				let keys = utilModule.format(key_rank,config.exam_olympic_cuoituan.id);
				redis.zrevrange(keys,0,9,function(err,list_user_id){
					if(err){
						callback(null, true);
						logger.error(err);
					}
					else{
						if(list_user_id && list_user_id.length>0){
							DbUtil.GetRank(config.exam_olympic_cuoituan.id,list_user_id,function(err,list_user_info){
								if(err){
									callback(null, true);
									logger.error(err);
								}
								else{
									if(list_user_info && list_user_info.length>0){
										response.rank_olympic_cuoituan = {
											list_user_id:list_user_id,
											list_user_info:list_user_info
										};
									}
									callback(null, true);
								}
							});
						}
						else{
							callback(null, true);
						}
					}
				});
			},
			function(callback){
				//sếp hạng tieng viet
				let keys = utilModule.format(key_rank,config.exam_tiengviet.id);
				redis.zrevrange(keys,0,9,function(err,list_user_id){
					if(err){
						callback(null, true);
						// console.log('error:',err);
						logger.error(err);
					}
					else{
						if(list_user_id && list_user_id.length>0){
							DbUtil.GetRank(config.exam_tiengviet.id,list_user_id,function(err,list_user_info){
								if(err){
									callback(null, true);
									logger.error(err);
								}
								else{
									if(list_user_info && list_user_info.length>0){
										response.rank_tiengviet = {
											list_user_id:list_user_id,
											list_user_info:list_user_info
										};
									}
									callback(null, true);
								}
							});
						}
						else{
							callback(null, true);
						}
					}
				});
			}
		],
		function(list_err,list_result){
			response.error=0;
			response.message='ok';
			res.json(response);
		});
	}
	catch(e){
		// response.error=10000;
		// response.message="server đang bận, bạn hãy thử lại sau";
		// res.json(response);
		logger.error(e.stack);
	}
});

// router.post('/count-rank-province', function(req, res) {

// });

// router.post('/count-rank-district', function(req, res) {

// });

// router.post('/count-rank-school', function(req, res) {

// });

router.post('/count-rank', function(req, res) {
	// let redis = req.redis;
	// let util = req.util;
	let DbUtil = req.DbUtil;
	// let config = req.config;

	DbUtil.CountRankUsers(function(jMessage){
		res.json(jMessage);
	});
});
//****************END API*****************//

function Validate_Create(userInfo){
	let msg = '';
	if(!util.isNameVi(userInfo.name)){
		msg='họ tên không đúng định dạng';
	}
	if(!util.isUsername(userInfo.username)){
		if(smg!='')msg+='<br/>';
		msg+='username không đúng định dạng';
	}
	if(!util.isPassword(userInfo.password)){
		if(smg!='')msg+='<br/>';
		msg+='password không đúng định dạng';
	}
	if(userInfo.password!=userInfo.repassword){
		if(smg!='')msg+='<br/>';
		msg+='password phải trùng nhau';
	}
	if(!util.isEmail(userInfo.email)){
		if(smg!='')msg+='<br/>';
		msg+='email không đúng định dạng';
	}
	if(!util.isPhoneNumber(userInfo.mobile)){
		if(smg!='')msg+='<br/>';
		msg+='số di động không đúng định dạng';
	}

	userInfo.province_id = util.parseInt(userInfo.province_id);
	if(userInfo.province_id<=0){
		if(smg!='')msg+='<br/>';
		msg+='chưa nhập tỉnh';
	}

	userInfo.district_id = util.parseInt(userInfo.district_id);
	if(userInfo.district_id<=0){
		if(smg!='')msg+='<br/>';
		msg+='chưa nhập huyện';
	}

	userInfo.school_id = util.parseInt(userInfo.school_id);
	if(userInfo.school_id<=0){
		if(smg!='')msg+='<br/>';
		msg+='chưa nhập trường';
	}

	userInfo.class_id = util.parseInt(userInfo.class_id);
	if(userInfo.school_id<1 || userInfo.school_id>5){
		if(smg!='')msg+='<br/>';
		msg+='hãy chọn lớp';
	}
	return msg;
}

function Validate_Update(userInfo){
	let msg = '';
	if(!util.isNameVi(userInfo.name)){
		msg='họ tên không đúng định dạng';
	}
	//if(!util.isUsername(userInfo.username)){
	//	if(smg!='')msg+='<br/>';
	//	msg+='username không đúng định dạng';
	//}
	//if(!util.isPassword(userInfo.password)){
	//	if(smg!='')msg+='<br/>';
	//	msg+='password không đúng định dạng';
	//}
	//if(userInfo.password!=userInfo.repassword){
	//	if(smg!='')msg+='<br/>';
	//	msg+='password phải trùng nhau';
	//}
	if(!util.isEmail(userInfo.email)){
		if(smg!='')msg+='<br/>';
		msg+='email không đúng định dạng';
	}
	if(!util.isPhoneNumber(userInfo.mobile)){
		if(smg!='')msg+='<br/>';
		msg+='số di động không đúng định dạng';
	}

	userInfo.province_id = util.parseInt(userInfo.province_id);
	if(userInfo.province_id<=0){
		if(smg!='')msg+='<br/>';
		msg+='chưa nhập tỉnh';
	}

	userInfo.district_id = util.parseInt(userInfo.district_id);
	if(userInfo.district_id<=0){
		if(smg!='')msg+='<br/>';
		msg+='chưa nhập huyện';
	}

	userInfo.school_id = util.parseInt(userInfo.school_id);
	if(userInfo.school_id<=0){
		if(smg!='')msg+='<br/>';
		msg+='chưa nhập trường';
	}

	//userInfo.class_id = util.parseInt(userInfo.class_id);
	//if(userInfo.school_id<1 || userInfo.school_id>5){
	//	if(smg!='')msg+='<br/>';
	//	msg+='hãy chọn lớp';
	//}
	return msg;
}

module.exports = router;