/**
 * Created by tanmv on 11/05/2017.
 */
'use strict';

const logger = require('tracer').colorConsole(),
	async = require('async'),
	express = require('express'),
	util = require('../util/util');
// let ScoreModel = require('../model/ScoreModel'),
let UsersModel = require('../model/UsersModel'),
	router = express.Router();

router.get('/', function(req, res) {
	try{
		let param_render = {};
		// param_render.user = req.tndata.user;//param_render.user = req.session.user;

		// //title
		param_render.title='Tra cứu giải thưởng - Trạng Nguyên';
		res.render('award', param_render);
	}
	catch(e){
		logger.error(e.stack);
	}
});

router.post('/', function(req, res) {
	try{
		let class_id = util.parseInt(req.body.class_id);
		let award = util.parseInt(req.body.award);
		if(award>0){
			let where = {
				award: award
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
							users: list_user
						});
					}
				});
		}
		else{
			res.json({
				error: 1,
				message: 'Không có giải thưởng này'
			});
		}
	}
	catch(e){
		logger.error(e.stack);
	}
});

module.exports = router;