'use strict';
let logger = require('tracer').colorConsole();
let express = require('express');
let ClassModel = require('../model/ClassModel');
let router = express.Router();

router.get('/api/select_list', function(req, res) {
	let redis = req.redis;
	// let util = req.util;
	// let log = req.log;

	let response={};
	try{
		redis.get("class",function(err,data){
			if(err){
				response.error=err;
				response.message=err;
				res.send(JSON.stringify(response));
			}
			else{
				if(data){
					response.error=0;
					response.message='done';
					response.content = data;
					res.send(JSON.stringify(response));
				}
				else{
					ClassModel.find({},function(err,data){
						if(err){
							response.error=err;
							response.message=err;
							// log.error('class: ' + err);
							logger.error(err);
						}
						else{
							response.error=0;
							response.message='done';
							response.content = data;

							//save cache
							redis.set("class",data);
						}
						res.send(JSON.stringify(response));
					});
				}
			}
		});
	}
	catch(e){
		response.error=10000;
		response.message="server đang bận, bạn hãy thử lại sau";
		res.send(JSON.stringify(response));
		// log.error('class: ' + e);
		logger.error(e.stack);
	}
});

module.exports = router;