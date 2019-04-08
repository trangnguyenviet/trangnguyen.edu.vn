'use strict';
let logger = require('tracer').colorConsole();
let express = require('express');
let ProvinceModel = require('../model/ProvinceModel');
let router = express.Router();

router.get('/api/select_list', function(req, res) {
	let redis = req.redis;
	let util = req.util;
	// let log = req.log;

	let response={};
	try{
		redis.get(config.redis_key.province,function(err,data){
			if(err){
				response.error=err;
				response.message=err;
				res.json(response);
				logger.error(err);
			}
			else{
				if(data){
					response.error=0;
					response.message='done';
					response.content = util.parseJson(data);
					res.json(response);
				}
				else{
					//ProvinceModel.find({},function(err,data){
					ProvinceModel.find({}).select('_id name').exec(function(err,data){
						if(err){
							response.error=err;
							response.message=err;
							// log.error('province: ' + err);
							logger.error(err);
						}
						else{
							response.error=0;
							response.message='done';
							response.content = data;

							//save cache
							redis.set(config.redis_key.province,JSON.stringify(data));
						}
						res.json(response);
					});
				}
			}
		});
	}
	catch(e){
		res.res.sendStatus(500);
		// log.error('province: ' + e);
		logger.error(e.stack);
	}
});

module.exports = router;