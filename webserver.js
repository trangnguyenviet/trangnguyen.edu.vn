'use strict';
let compression = require('compression');
let async = require('async');
let cluster = require('cluster'),
DbUtilModule = require('./DbUtil'),
config = require('./config/config');


let num_processes = require('os').cpus().length;

//********************************redis*************************************//
const redis = require("redis");
const redis_client = redis.createClient(config.redis);
const redis_token = redis.createClient(config.redis_token);

//********************************mongodb*************************************//
let mongoose = require ("mongoose");
mongoose.connect(config.mongodb.connect, config.mongodb.options);
mongoose.set('debug', config.mongodb.debug);
// mongoose.set('debug', true);

let DbUtil = new DbUtilModule(redis_client);

if (cluster.isMaster) {
	console.log('web server starting...');
	async.parallel([
		function(callback){
			DbUtil.LoadListParam(function(){
				callback(null,true);
			});
		},
		function(callback){
			DbUtil.LoadListUser(function(err,bDone){
				callback(null,true);
			});
		}],
	function(){
		console.log('server runing...');
		for (let i = 0; i < num_processes; i++) {
			cluster.fork();
		}
	});
} else {
	let cluster_id = cluster.worker.id;
	let process_id = cluster.worker.process.pid,

	express = require('express'),
	// session = require('express-session'),
	// redisStore = require('connect-redis')(session),
	path = require('path'),
	os = require('os'),
	methodOverride = require('method-override'),
	// logger = require('morgan'),
	favicon = require('serve-favicon'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	sessions = require("client-sessions"),

	util = require('./util/util'),
	Log = require('./util/log'),
	mustacheExpress = require('mustache-express');

	//********************************letiable global*************************************//
	// let log = new Log(__dirname + '/log');
	// let db_param = new ParamObj();

	//*********************************server************************************//
	let app = new express();
	let server = app.listen(config.web_port,config.server_name);
	console.log('Webserver listen: %s:%d',config.server_name,config.web_port);

	//*********************************express************************************//
	app.use(compression());
	// app.use(favicon(__dirname + '/http_public/favicon.ico'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: false}));

	app.use(cookieParser());
	app.use(express.static(path.join(__dirname,'http_public'),{ maxAge: 129600000}));//1.5d
	app.use(methodOverride('X-HTTP-Method-Override'));

	//session client
	app.use(sessions(config.session_client));//client-sessions

	// //session redis
	// let session_config = config.session;
	// session_config.store = new redisStore({ host: config.redis.server, port: config.redis.port, client: redis_client,ttl : 432000000}); //5d
	// app.use(session(session_config));//express-session

	app.use('/captcha.png', require('./http_controller/CaptchaController'));
	app.set('views', path.join(__dirname, 'http_views'));
	app.engine('html', mustacheExpress());
	app.set('view engine', 'html');

	//add static obj to request
	app.use(function(req, res, next){
		//console.log('process from cluster id: %d',cluster_id);
		req.redis = redis_client;
		req.redis_token = redis_token;
		req.DbUtil = DbUtil;
		req.util = util;
		req.config = config;
		req.dir_root = __dirname;
		// req.files = config.files;

		/*
		 set user info for render
		 same: res.render('xxx', {user: req.tndata.user});
		 or: res.render('xxx', {user: req.session.user});
		*/
		res.locals.user = req.tndata.user;

		//set header
		// res.set('Server','windows-server-10');
		res.set('x-powered-by', 'MVTHP-2015');
		next();
	});
	//end add static obj to request

	// app.use(logger('combined'));

	//routes - controller
	//app.use('/luyen-tap', require('./http_controller/OlympicController'));
	app.use('/tieng-viet', require('./http_controller/PracticeController'));
	// app.use('/luyen-tieng-viet', require('./http_controller/PracticeController'));
	// app.use('/luyen-toan', require('./http_controller/PracticeController'));
	// app.use('/luyen-tieng-anh', require('./http_controller/PracticeController'));
	// app.use('/luyen-khoa-hoc-tu-nhien', require('./http_controller/PracticeController'));
	// app.use('/luyen-su-dia-xa-hoi', require('./http_controller/PracticeController'));
	// app.use('/luyen-iq-toan-tieng-anh', require('./http_controller/PracticeController'));

	app.use('/hoc-online-toan', require('./http_controller/LessonController'));
	app.use('/hoc-online-tieng-anh', require('./http_controller/LessonController'));
	app.use('/hoc-online-tieng-viet', require('./http_controller/LessonController'));
	app.use('/su-kien', require('./http_controller/ExamEventController'));

	app.use('/game', require('./http_controller/GameController'));
	app.use('/video', require('./http_controller/VideoController'));
	app.use('/hoat-hinh', require('./http_controller/CartoonsController'));
	app.use('/cong-dong', require('./http_controller/CommunityController'));
	app.use('/tai-khoan', require('./http_controller/ProfilerController'));

	app.use('/bang-vang', require('./http_controller/BangVangController'));

	app.use('/sinh-nhat', require('./http_controller/BirthdayController'));

	app.use('/user', require('./http_controller/UsersController'));
	app.use('/dang-ky', require('./http_controller/RegisterController'));
	app.use('/quen-mat-khau', require('./http_controller/FogotPasswordController'));
	app.use('/bai-thi', require('./http_controller/ExamController'));

	app.use('/province', require('./http_controller/ProvinceController'));
	app.use('/district', require('./http_controller/DistrictController'));
	app.use('/school', require('./http_controller/SchoolController'));

	//news
	app.use('/tin-tuc', require('./http_controller/NewsController'));
	app.use('/tin-tu-ban-to-chuc', require('./http_controller/NewsController'));
	app.use('/tin-giao-duc', require('./http_controller/NewsController'));
	app.use('/the-le', require('./http_controller/NewsController'));
	app.use('/huong-dan', require('./http_controller/NewsController'));
	app.use('/tuyen-dung', require('./http_controller/NewsController'));
	app.use('/lien-he', require('./http_controller/NewsController'));
	app.use('/gioi-thieu', require('./http_controller/NewsController'));
	app.use('/de-thi-loi-giai', require('./http_controller/NewsController'));

	app.use('/truyen-cuoi', require('./http_controller/JokesController'));
	app.use('/bai-hoc-cuoc-song', require('./http_controller/LifeLessonsController'));
	app.use('/anh-hoc-sinh', require('./http_controller/ImageStudentController'));
	app.use('/do-vui', require('./http_controller/QuizzesController'));
	app.use('/truyen-tho', require('./http_controller/IndoctrinateController'));

	app.use('/huong-dan-giai-bai-tap', require('./http_controller/NewsController'));
	app.use('/dap-an-sach-trang-nguyen', require('./http_controller/NewsController'));
	//end news

	app.use('/nop-hoc-phi', require('./http_controller/PaymentController'));
	app.use('/payment', require('./http_controller/PaymentController'));
	app.use('/nop-hoc-phi-ngan-hang', require('./http_controller/PayBankController'));
	app.use('/ma-thi-truong', require('./http_controller/CodeExamSchoolController'));
	app.use('/ma-thi-huyen', require('./http_controller/CodeExamDistrictController'));
	app.use('/ma-thi-tinh', require('./http_controller/CodeExamProvinceController'));
	app.use('/ma-thi-dinh', require('./http_controller/CodeExamNationalController'));

	app.use('/dang-ky-thi-vong-19', require('./http_controller/RegExam19Controller'));
	app.use('/ma-thi-vong-19', require('./http_controller/CodeExam19Controller'));

	app.use('/tra-cuu-diem-thi',require('./http_controller/ScoreExamController'));
	app.use('/danh-sach-thi-huyen',require('./http_controller/ListExamEventDistrictController'));
	app.use('/danh-sach-thi-hoi',require('./http_controller/ScoreExamProvinceController'));
	app.use('/giai-thuong',require('./http_controller/AwardController'));

	app.use('/latex', require('./http_controller/LatexController'));
	app.use('/avatar', require('./http_controller/AvatarController'));
	//home
	app.use('/home', require('./http_controller/HomeController'));
	app.use('/trang-chu', require('./http_controller/HomeController'));
	app.use('/index.php', require('./http_controller/HomeController'));
	app.use('/index.html', require('./http_controller/HomeController'));
	app.use('/index.cgi', require('./http_controller/HomeController'));
	app.use('/default.aspx', require('./http_controller/HomeController'));
	app.use('/', require('./http_controller/HomeController'));
	//end routes - controller

	// app.get('/enc', (req,res)=>{
	// 	let crypto = require("crypto");
	// 	const cipher = crypto.createCipher('aes-256-cbc', '123456');
	// 	let data = {
	// 		a:1,
	// 		b:2,
	// 		c:[1,2,3,4]
	// 	}
	// 	let crypted = cipher.update(data,'utf8','hex')
	// 	crypted += cipher.final('hex');
	// 	res.
	// });

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		let err = new Error('Not Found');
		err.status = 404;

		res.status(404);
		try {
			res.render('404',
				{
					message: err.message,
					error: 404
				}
			);
		}
		catch (e) {
			console.log(e.task);
		}
		finally {
			//next(err);
		}
		//next();
	});
	// error 404 handlers

	// development error handler
	// will print stacktrace
	// if (app.get('env') === 'development') {
	// 	app.use(function(err, req, res, next) {
	// 		res.status(err.status || 500);
	// 		res.render('500', {
	// 			message: err.message,
	// 			error: err
	// 		});
	// 	});
	// }

	// production error handler
	// no stacktraces leaked to user
	// app.use(function(err, req, res, next) {
	// 	res.status(err.status || 500);
	// 	res.render('error', {
	// 		message: err.message,
	// 		error: {}
	// 	});
	// });
}

process.on('SIGINT', function () {
	redis_client.unref();
	mongoose.connection.close(function () {
		process.exit(0);
	});
});