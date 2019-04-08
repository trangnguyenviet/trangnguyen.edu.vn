'use strict';
let logger = require('tracer').colorConsole();
let express = require('express');
let SchoolModel = require('../model/SchoolModel');
let router = express.Router();

router.get('/api/list/:id?', function(req, res) {
	let redis = req.redis;
	let util = req.util;
	// let log = req.log;
	let config = req.config;
	
	let response={};
	try{
		let district_id = req.params.id;
		if(district_id && util.parseInt(district_id)>0){
			redis.get(config.redis_key.school + district_id,function(err,data){
				if(err){
					response.error=err;
					response.message=err;
					res.send(JSON.stringify(response));
					logger.error(err);
				}
				else{
					if(data){
						response.error=0;
						response.message='done';
						response.content = util.parseJson(data);
						res.send(JSON.stringify(response));
					}
					else{
						//DestrictModel.find({province_id:province_id},'_id name',function(err,data){
						//DestrictModel.find({province_id:province_id}).sort({_id:-1}).select('_id name').skip(from).limit(to).exec(function(err,data){
						SchoolModel.find({district_id:district_id}).select('_id name').exec(function(err,data){
							if(err){
								response.error=err;
								response.message=err;
								// log.error(err);
								logger.error(err);
							}
							else{
								response.error=0;
								response.message='done';
								response.content = data;

								//save cache
								redis.set(config.redis_key.school + district_id,JSON.stringify(data));
							}
							res.send(JSON.stringify(response));
						});
					}
				}
			});
		}
		else{
			response.error=1;
			response.message='Không tìm thấy thông tin huyện';
			response.content = [];
			res.send(JSON.stringify(response));
		}
	}
	catch(e){
		res.sendStatus(500);
		// log.error(e);
		logger.error(e.stack);
	}
});

module.exports = router;