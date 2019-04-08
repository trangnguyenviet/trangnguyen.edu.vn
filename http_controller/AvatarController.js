'use strict';

let logger = require('tracer').colorConsole();
let express = require('express');
let fs = require('fs');
let path = require('path');
let request = require('request');
let router = express.Router();

router.get('/:id?', function(req, res) {
	try{
		if(req.params.id){
			let dir_root = req.dir_root;
			let id = req.params.id;
			let util = req.util;
			let config = req.config;

			if(util.isOnlyNumber){
				let fullpath = path.join(dir_root,'http_public','avatar', id);
				fullpath+='.jpg';
				if(fs.existsSync(fullpath)){
					res.sendFile(fullpath);
				}
				else{
					fullpath = path.join(dir_root, config.no_avatar);
					res.sendFile(fullpath);
				}
			}
			else{
				res.send('vcc');
			}
		}
		else{
			res.send('vcc');
		}
	}
	catch(e){
		logger.error(e.stack);
	}
});
module.exports = router;