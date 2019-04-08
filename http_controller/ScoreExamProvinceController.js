/**
 * Created by tanmv on 16/04/2017.
 */
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
		let DbUtil = req.DbUtil;
		let param_render = {title:'Tra cứu điểm thi Hội - Trạng Nguyên'};
		DbUtil.GetListProvince((err,list)=>{
			if(err){
				logger.error(err);
				res.status(500);
			}
			else{
				param_render.provinces = list;
				res.render('score-exam-province', param_render);
			}
		});
	}
	catch(e){
		logger.error(e);
	}
});

router.post('/', function(req, res) {
	try{
		let redis = req.redis;
		let province = util.parseInt(util.parseInt(req.body.province),0);
		if(province>0){
			let key = 'list-example-province-' + province;
			redis.get(key,(err, list)=>{
				if(err){
					logger.error(err);
					res.status(500);
				}
				else{
					if(list){
						res.json({
							error: 0,
							message: '',
							users: util.parseJson(list)
						});
					}
					else{
						UsersModel.find({exam_province:true, province_id: province})
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
									users: list_user
								});
								redis.set(key,JSON.stringify(list_user),(err, reply)=>{
									if(err){
										logger.error(err,reply);
									}
								});
								redis.pexpire(key,600000); //10 minutes
							}
						});
					}
				}
			});
		}
		else{
			res.json({
				error: 1,
				message: 'Hãy chọn tỉnh/thành phố'
			});
		}
	}
	catch(e){
		logger.error(e.stack);
	}
});

module.exports = router;