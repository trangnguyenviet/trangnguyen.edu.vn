'use strict';

const logger = require('tracer').colorConsole(),
	async = require('async'),
	express = require('express'),
	util = require('../util/util');
let ScoreModel = require('../model/ScoreModel'),
	UsersModel = require('../model/UsersModel'),
	router = express.Router();

router.get('/', function(req, res) {
	try{
		let param_render = {};
		// param_render.user = req.tndata.user;//param_render.user = req.session.user;

		// //title
		param_render.title='Tra cứu điểm thi - Trạng Nguyên';
		res.render('score-exam', param_render);
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.post('/', function(req, res) {
	try{
		let code = req.body.code;
		let class_id = util.parseInt(req.body.class_id);
		if(code && code!='' && code.length==6 && util.isInt(code)){
			ScoreModel.find({code:code})
			.select('user_id round_id score time created_at')
			.sort({score:-1, time: 1})
			.exec((err,score_list)=>{
				if(err){
					logger.error(err);
					res.json({
						error: 20000,
						message: 'server đang bận, vui lòng thử lại sau'
					});
				}
				else{
					if(score_list && score_list.length>0){
						let list_user = [];
						// let map_user = {};
						for(let i=0, info; info = score_list[i]; i++){
							list_user.push(info.user_id);
							// map_user[info.user_id] = info;
						}

						let where = {
							_id: {$in:list_user}
						};
						if(class_id>0 && class_id<=5) where.class_id = class_id;
						UsersModel.find(where)
						.select('_id name class_id class_name birthday school_name district_name province_name')
						.exec((err, list_user)=>{
							if(err){
								logger.error(err);
								res.json({
									error: 20000,
									message: 'server đang bận, vui lòng thử lại sau'
								});
							}
							else{
								res.json({
									error: 0,
									message: '',
									users: list_user,
									scores: score_list
								});
							}
						});
					}
					else{
						res.json({
							error: 1,
							message: 'mã thi không đúng hoặc chưa sử dụng'
						});
					}
				}
			});
		}
		else{
			res.json({
				error: 1,
				message: 'mã thi không đúng'
			});
		}
	}
	catch(e){
		logger.error(e.stack);
	}
});

module.exports = router;