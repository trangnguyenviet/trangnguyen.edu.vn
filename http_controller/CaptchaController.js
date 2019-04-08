'use strict';
let logger = require('tracer').colorConsole();
let captchapng = require('captchapng');
let express = require('express');
let util = require('../util/util');

let router = express.Router();

router.get('/', function(req, res) {
	try{
		let scaptcha = util.randomNumber(6);
		req.tndata.captcha = scaptcha;//req.session.captcha = scaptcha;
		let width = 80;
		let height = 30;
		let p = new captchapng(width,height,scaptcha); // width,height,numeric captcha
		p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
		p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

		for (let j = 0; j < width; j++) {
			p.buffer[p.index(j,5)] = p.color(80, 80, 80);
			p.buffer[p.index(j,10)] = p.color(255, 255, 255);
			p.buffer[p.index(j,15)] = p.color(255, 255, 255);
			p.buffer[p.index(j,20)] = p.color(255, 255, 255);
			p.buffer[p.index(j,25)] = p.color(80, 80, 80);
		}

		let img = p.getBase64();
		let imgbase64 = new Buffer(img,'base64');
		res.writeHead(200, {
			'Content-Type': 'image/png'
		});
		res.end(imgbase64);
	}
	catch(e){
		logger.error(e.stack);
	}
});

module.exports = router;