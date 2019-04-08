'use strict';
let logger = require('tracer').colorConsole();
let async = require('async');
let express = require('express');
let utilModule = require('util');
let util = require('../util/util');

let ExamLib = require('../ExamLib');

let router = express.Router();

router.get('/', function(req, res) {
	try{
		// let redis = req.redis;
		let config = req.config;
		let DbUtil = req.DbUtil;

		let param_render = {};
		let exam_config;

		//title
		let baseUrl = req.baseUrl;
		param_render.baseUrl=baseUrl;
		if(baseUrl=='/tieng-viet'){
			param_render.title='Thi Tiếng Việt - Trạng Nguyên';
			param_render.page_name='Thi<br/> Tiếng Việt';
			param_render.subject='Thi Tiếng Việt';
			exam_config = config.exam_tiengviet;
		}
		else if(baseUrl=='/luyen-tieng-viet'){
			param_render.title='Luyện Tiếng Việt - Trạng Nguyên';
			param_render.page_name='Luyện<br/> Tiếng Việt';
			param_render.subject='Luyện Tiếng Việt';
			exam_config = config.exam_olympic_tiengviet;
		}
		else if(baseUrl=='/luyen-toan'){
			param_render.title='Luyện Toán- Trạng Nguyên';
			param_render.page_name='Luyện Toán';
			param_render.subject='Luyện Toán';
			exam_config = config.exam_olympic_toan;
		}
		else if(baseUrl=='/luyen-tieng-anh'){
			param_render.title='Luyện Tiếng Anh- Trạng Nguyên';
			param_render.page_name='Luyện<br/> Tiếng Anh';
			param_render.subject='Luyện Tiếng Anh';
			exam_config = config.exam_olympic_english;
		}
		else if(baseUrl=='/luyen-khoa-hoc-tu-nhien'){
			param_render.title='Luyện Khoa học - Tự nhiên - Trạng Nguyên';
			param_render.page_name='Khoa học<br/> Tự nhiên';
			param_render.subject='Luyện Khoa học - Tự nhiên';
			exam_config = config.exam_khoahoc_tunhien;
		}
		else if(baseUrl=='/luyen-su-dia-xa-hoi'){
			param_render.title='Luyện Sử - Địa - Xã hội - Trạng Nguyên';
			param_render.page_name='Sử - Địa<br/> Xã hội';
			param_render.subject='Luyện Sử - Địa - Xã hội';
			exam_config = config.exam_su_dia_xahoi;
		}
		else if(baseUrl=='/luyen-iq-toan-tieng-anh'){
			param_render.title='Luyện IQ - Toán - Tiếng Anh - Trạng Nguyên';
			param_render.page_name='IQ - Toán <br/> Tiếng Anh';
			param_render.subject='Luyện IQ - Toán - Tiếng Anh';
			exam_config = config.exam_iq_toan_tienganh;
		}

		// param_render.user=req.tndata.user;//param_render.user=req.session.user;
		param_render.is_free = exam_config.free;

		async.parallel([
			function(callback){
				if(exam_config.id==4){
					if(req.tndata.user){
						let user_id = req.tndata.user._id;
						DbUtil.GetCurrentRound(user_id,exam_config.id,function(err,round_id){
							if(err){
								logger.error(err);
								res.sendStatus(500);
							}
							else{
								param_render.user_current_round=round_id?round_id:'Chưa qua vòng nào';
							}
							callback(null,true);
						});
					}
					else{
						callback(null,true);
					}
				}
				else{
					param_render.user_current_round = 'Thi tự do';
					callback(null,true);
				}
			},
			function(callback){
				DbUtil.GetParamInfo(utilModule.format(config.exam.current_round,exam_config.id),function(err,current_round){
					if(err){
						logger.error(err);
						res.sendStatus(500);
					}
					else{
						exam_config.current_round=current_round;
						param_render.exam_info=exam_config;
					}
					callback(null,true);
				});
			},
			//tin hướng dẫn
			function(callback){
				let path = '/huong-dan';
				//DbUtil.GetListNewsNoPage(path,function(err,results){
				DbUtil.GetListNewsTop(path, 4, function(err,results){
					param_render.path_news = path;
					param_render.list_news = results;
					callback(null,true);
				});
			}
		],
		function(){
			res.render('tiengviet', param_render);
		});
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.get('/vong-:round/?', function(req, res) {
	try{
		let config = req.config;

		let exam_config;
		let baseUrl = req.baseUrl;
		if(baseUrl=='/tieng-viet'){
			exam_config = config.exam_tiengviet;
		}
		else if(baseUrl=='/luyen-tieng-viet'){
			exam_config = config.exam_olympic_tiengviet;
		}
		else if(baseUrl=='/luyen-toan'){
			exam_config = config.exam_olympic_toan;
		}
		else if(baseUrl=='/luyen-tieng-anh'){
			exam_config = config.exam_olympic_english;
		}
		//
		else if(baseUrl=='/luyen-khoa-hoc-tu-nhien'){
			exam_config = config.exam_khoahoc_tunhien;
		}
		else if(baseUrl=='/luyen-su-dia-xa-hoi'){
			exam_config = config.exam_su_dia_xahoi;
		}
		else if(baseUrl=='/luyen-iq-toan-tieng-anh'){
			exam_config = config.exam_iq_toan_tienganh;
		}
		else{
			logger.error('no base:' + baseUrl);
		}
		ExamLib.SelectRound(req, res, exam_config);
	}
	catch(e){
		logger.error(e.stack);
		res.sendStatus(500);
	}
});

router.get('/vong-:round/bai-:test/?', function(req, res) {
	try{
		let config = req.config;

		let exam_config;
		let baseUrl = req.baseUrl;
		if(baseUrl=='/tieng-viet'){
			exam_config = config.exam_tiengviet;
		}
		else if(baseUrl=='/luyen-tieng-viet'){
			exam_config = config.exam_olympic_tiengviet;
		}
		else if(baseUrl=='/luyen-toan'){
			exam_config = config.exam_olympic_toan;
		}
		else if(baseUrl=='/luyen-tieng-anh'){
			exam_config = config.exam_olympic_english;
		}
		else if(baseUrl=='/luyen-khoa-hoc-tu-nhien'){
			exam_config = config.exam_khoahoc_tunhien;
		}
		else if(baseUrl=='/luyen-su-dia-xa-hoi'){
			exam_config = config.exam_su_dia_xahoi;
		}
		else if(baseUrl=='/luyen-iq-toan-tieng-anh'){
			exam_config = config.exam_iq_toan_tienganh;
		}
		else{
			logger.error('no base:' + baseUrl);
		}

		ExamLib.SelectTest(req, res, exam_config);
	}
	catch(e){
		logger.error(e.stack);
	}
});

module.exports = router;