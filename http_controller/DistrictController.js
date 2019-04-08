'use strict';
let logger = require('tracer').colorConsole();
let express = require('express');
let DestrictModel = require('../model/DistrictModel');
let router = express.Router();

router.get('/api/list/:id?', function(req, res) {
	let redis = req.redis;
	let util = req.util;
	// let log = req.log;
	let config = req.config;
	
	let response={};
	try{
		let province_id = req.params.id;
		if(province_id && util.parseInt(province_id)>0){
			redis.get(config.redis_key.district + province_id,function(err,data){
				if(err){
					response.error=err;
					response.message=err;
					res.send(JSON.stringify(response));
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
						DestrictModel.find({province_id:province_id}).select('_id name').exec(function(err,data){
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
								redis.set(config.redis_key.district + province_id,JSON.stringify(data));
							}
							res.send(JSON.stringify(response));
						});
					}
				}
			});
		}
		else{
			response.error=1;
			response.message='Không tìm thấy thông tin tỉnh';
			response.content = [];
			res.send(JSON.stringify(response));
		}
	}
	catch(e){
		response.error=10000;
		response.message="server đang bận, bạn hãy thử lại sau";
		res.send(JSON.stringify(response));
		// log.error(e);
		logger.error(e.stack);
	}
});

module.exports = router;