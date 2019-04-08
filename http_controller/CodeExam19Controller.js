/**
 * Created by tanmv on 15/05/2017.
 */
'use strict';
const logger = require('tracer').colorConsole();
let express = require('express'),
	router = express.Router(),
	UsersModel = require('../model/UsersModel');

router.get('/', function(req, res) {
	try{
		let date_begin = new Date(2017,4,19,9,0,0);
		let date_end = new Date(2017,4,19,17,0,0);
		let now = new Date();

		if(now < date_end){
			let param_render = {error:0,message:''};
			param_render.title='Mã thi vòng 19 - Trạng Nguyên';
			let user = req.tndata.user;
			if(user){
				if(user.exam_national) {
					let dt = now - date_begin;
					param_render.code = dt > 0?'079230':'';
					param_render.timeleft = dt;
				}
				else{
					param_render.error=1;
					param_render.message = 'Bạn chưa đăng ký thi';
				}
			}
			else{
				param_render.error=1;
				param_render.message = 'Bạn chưa login';
			}
			res.render('code-exam-19', param_render);
		}
		else{
			res.redirect('/');
		}
	}
	catch(e){
		logger.error(e.stack);
	}
});

// router.post('/', function(req, res) {
// 	let message_out = {};
// 	try{
// 		let expire_reg = new Date(2017,4,19);
// 		if(new Date() < expire_reg){
// 			let data = {};
// 			async.waterfall([
// 				(callback)=>{
// 					if(req.tndata.user){
// 						data.user_id = req.tndata.user._id;
// 						callback(false,data);
// 					}
// 					else{
// 						message_out.error=1;
// 						message_out.message='Bạn chưa đăng nhập';
// 						callback(true,data);
// 					}
// 				},
// 				(data,callback)=>{
// 					if(req.tndata.error_reg_exam_19==0){
// 						callback(false,data);
// 					}
// 					else{
// 						message_out.error=1;
// 						message_out.message='#error: ' + req.tndata.error_reg_exam_19?req.tndata.error_reg_exam_19:'session timeout';
// 						callback(true,data);
// 					}
// 				},
// 				(data, callback)=>{
// 					let body = req.body;
// 					let captcha = data.captcha = body.captcha;
// 					if(captcha){
// 						callback(false,data);
// 					}
// 					else{
// 						message_out.error = 3;
// 						message_out.message = 'Đã hết phiên làm việc - hãy load lại mã xác nhận';
// 						callback(true,data);
// 					}
// 				},
// 				(data, callback)=>{
// 					if(data.captcha == req.tndata.captcha){
// 						callback(false,data);
// 					}
// 					else{
// 						message_out.error = 4;
// 						message_out.message = 'Mã xác nhận không đúng';
// 						callback(true,data);
// 					}
// 				},
// 				(data,callback)=>{
// 					UsersModel.update({
// 						_id: data.user_id
// 					},{
// 						$set: {exam_national: true}
// 					}, (err, reply)=>{
// 						if(err){
// 							logger.error(err);
// 						}
// 						else{
// 							console.log(reply);
// 							message_out.error = 0;
// 							message_out.message = 'Đăng ký thành công';
// 							message_out.result = reply;
// 							callback(false,data);
// 						}
// 					});
// 				}
// 			], ()=>{
// 				req.tndata.captcha=null;
// 				res.json(message_out);
// 			});
// 		}
// 		else{
// 			res.json({
// 				error:1,
// 				message: 'Hết thời gian đăng ký'
// 			});
// 		}
// 	}catch(e){
// 		logger.error(e);
// 		message_out.error=10000;
// 		message_out.message="server đang bận, bạn hãy thử lại sau";
// 	}
// });

module.exports = router;