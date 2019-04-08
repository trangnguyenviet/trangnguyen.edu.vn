'use strict';
let logger = require('tracer').colorConsole();
let express = require('express');
let RoundModel = require('../model/RoundModel');
let router = express.Router();

router.get('/api/select_list/:id?', function(req, res, next) {
	let redis = req.redis;
	// let util = req.util;
	// let log = req.log;

	let response={};
	try{
		let class_id = res.params.id;
		if(class_id){
			redis.get("round_" + class_id,function(err,data){
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
						response.content = data;
						res.send(JSON.stringify(response));
					}
					else{
						RoundModel.find({class_id:class_id},function(err,data){
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
								redis.set("round_" + class_id,data);
							}
							res.send(JSON.stringify(response));
						});
					}
				}
			});
		}
		else{
			response.error=1;
			response.message='Không tìm thấy thông tin lớp';
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