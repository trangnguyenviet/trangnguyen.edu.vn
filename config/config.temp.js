// let util = require('../util/util');
'use strict';

module.exports = {
	web_port: 9009,
	socket_port: 9090,
	server_name: '10.0.0.120',

	is_exam_province: false,
	is_exam_national: false,

	use_active_account: true,

	files:{
		avatar:'/avatar',
		images:'',
		statitics:'',
	},

	domain: 'https://trangnguyen.edu.vn',
	is_log_request: true,

	//db config
	mongodb:{
		connect:'mongodb://10.0.0.200/trangnguyen',
		// connect:'mongodb://192.168.0.111:27017/trangnguyen,192.168.0.112:27017/trangnguyen,192.168.0.113:27017/trangnguyen,192.168.0.114:27017/trangnguyen',
		options: {
			db: { native_parser: true }, //passed to the connection db instance
			server: { poolSize: 10 }, //passed to the connection server instance(s)
			// replset: { rs_name: 'set0',socketOptions: { keepAlive: 120 }}, //passed to the connection ReplSet instance
			// user: 'myUserName',
			// pass: 'myPassword'
			// auth:, options for authentication
			mongos: true, // passed to the [underlying driver's mongos options](http://mongodb.github.io/node-mongodb-native/2.0/api/Mongos.html)
		},
		debug: true
	},

	//redis config
	redis:{
		port: 6379,
		host: '10.0.0.50',
		db: 0
	},

	redis_token:{
		port: 6379,
		host: '10.0.0.50',
		db: 1
	},

	rabbitMq: {
		host: '10.0.0.60',
		port: 5672,
		login: 'admin',
		password: 'admin@123',
		connectionTimeout: 10000,
		noDelay: true,
		ssl: {
			enabled : false
		}
	},

	//session config
	session_client: {
		cookieName: 'tndata', // cookie name dictates the key name added to the request object
		secret: '$&38t_$+f52fdgdASF*^', // should be a large unguessable string
		duration: 60 * 60 * 1000, // how long the session will stay valid in ms
		activeDuration: 1000 * 60 * 60, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
		cookie: {
			domain: '.trangnguyen.edu.vn',
			path: '/', // cookie will only be sent to requests under '/api'
			// maxAge: 60000, // duration of the cookie in milliseconds, defaults to duration above
			ephemeral: true, // when true, cookie expires when the browser closes
			httpOnly: true, // when true, cookie is not accessible from javascript
			// secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
		}
	},

	// session:{
	// 	secret:'sdfg(SDsdf453%&4rdaf^$g',
	// 	saveUninitialized: false,
	// 	resave: false,
	// 	cookie: {
	// 		// domain: '.trangnguyen.edu.vn',
	// 		path: '/',
	// 	}
	// },

	login_false: 200,
	no_avatar: 'http_public/avatar/no_avatar.png',
	page_size_user: 50,
	category:{
		tin_giao_duc:1,
		gioi_thieu:2,
		hoc_sinh_hieu_biet:3,
		giao_vien_tam_huyet:4,
		phu_huynh_tuyet_voi:5,
		su_kien:6,
		ton_vinh:7,
		sang_tao:8,
		list_news_size: 10,
		get_id: {
			'/tin-tu-ban-to-chuc': {id: 1, name: 'Tin từ Ban tổ chức'},
			'/tin-giao-duc': {id: 2, name: 'Tin giáo dục'},
			'/the-le': {id: 3, name: 'Thể lệ'},
			'/huong-dan': {id: 4, name: 'Hướng dẫn'},
			'/phu-huynh-tuyet-voi': {id: 5, name: 'Phụ huynh tuyệt vời'},
			'/su-kien': {id: 6, name: 'Sự kiện'},
			'/ton-vinh': {id: 7, name: 'Tôn vinh'},
			'/sang-tao': {id: 8, name: 'Sáng tạo'},
			'/tuyen-dung': {id: 9, name: 'Tuyển dụng'},
			'/de-thi-loi-giai': {id: 17, name: 'Đề thi & lời giải'},
			'/huong-dan-giai-bai-tap': {id: 18, name: 'Hướng dẫn giải bài tập'},
			'/dap-an-sach-trang-nguyen': {id: 19, name: 'Đáp án sách Trạng Nguyên'},
		}
	},
	redis_key: {
		param_global: 'param_global',
		count_member: 'count_member',
		count_connect_exam: 'count_connect_exam',
		count_connect_exam_type: 'count_connect_exam_type_%s',
		exam_info : 'exam_%s_%s_%s_%s', //exam_<type_id>_<class_id>_<round_id>_<test>
		//user_exam_info: 'user_exam_%s_%s_%s_%s_%s', //user_exam_<type_id>_<class_id>_<round_id>_<test>_<user_id>
		user_exam_info: 'user_exam_%s', //user_exam_<user_id>
		user_info: 'user_info_',

		province: 'province',
		district: 'district_',
		school: 'school_',
		province_info: 'province_info_%s',
		district_info: 'district_info_%s',
		school_info: 'school_info_%s',

		list_news:'list_news_%s_%s_%s', //list_news_<category_id>_<page_index>_<page_size>
		count_list_news: 'count_list_news_%s', //count_list_news_<category_id>
		news:'news_%s', //news_<news_id>
		login_ip: 'login_ip_',
		fogot: 'fogot_',
		fogot_time: 7200000,//2h
		user_play_exam: 'user_play_exam_%d', //user_play_exam_<user_id>
		is_user_play_exam: 'is_user_play_exam_%d', //is_user_play_exam_<user_id>
		list_correct_exam: 'list_correct_exam_%s', //list_correct_exam_<user_id>
		count_read_news:'count_read_news_%d', //count_read_news_<news_id>
		score_user: {
			hash: 'score_user_%d_%d_%d',//score_user_<type_id>_<round_id>_<user_id>
			score: 'score_',
			total_time: 'totaltime_',
			wrong: 'wrong_',
			luot:'luot',
			score_info: 'score_user_info_%d_%d_%d',//score_user_info_<type_id>_<round_id>_<user_id>
		},

		rank:{
			type: 'rank_type_%d',
			province: 'rank_province_%d_%d',
			district: 'rank_district_%d_%d',
			school: 'rank_school_%d_%d',
			xclass: 'rank_class_%d_%d'
		},

		rank_count_member_national: 'rank_count_member_national',
		rank_count_member_province: 'rank_count_member_province_%d', //rank_count_member_province_<province_id>
		rank_count_member_district: 'rank_count_member_district_%d', //rank_count_member_district_<district_id>
		rank_count_member_school: 'rank_count_member_school_%d', //rank_count_member_school_<school_id>
		count_member_class: 'count_member_class_%d', //count_member_class_<class_id>

		lesson_info: 'lesson_info_%d',//lesson_info_<id>
		//lesson_new: 'lesson_new_%d_%d',//lesson_new_<type_id>_<class_id>
		lesson_new: 'lesson_new_%d',//lesson_new_<type_id>
		//list_lesson: 'list_lesson_%d_%d_%d_%d_%d',//list_lesson_<type_id>_<class_id>_<page_size>_<page_index>_<ne_id>
		list_lesson: 'list_lesson_%d_%d_%d_%d',//list_lesson_<type_id>_<page_size>_<page_index>_<ne_id>
		list_lesson_other: 'list_lesson_other_%d',//list_lesson_other_<type_id>
		count_read_lesson: 'count_read_lesson_%d',//count_read_lesson_<id>
		count_lesson_other: 'count_lesson_other_%d_%d', //count_lesson_other_<type_id>_<class_id>

		category_game: 'category_game',
		list_game: 'list_game_%d_%d_%d', //list_game_<category_id>_<page_size>_<page_index>
		list_all_game: 'list_all_game_%d_%d', //list_game_<page_size>_<page_index>
		count_list_game: 'count_list_game_%d', //count_list_game_<category_id>
		game_info: 'game_info_%d',//game_info_<game_id>
		count_all_game: 'count_all_game',

		category_video: 'category_video',
		list_video: 'list_video_%d_%d_%d', //list_video_<category_id>_<page_size>_<page_index>
		list_all_video: 'list_all_video_%d_%d', //list_video_<page_size>_<page_index>
		count_list_video: 'count_list_video_%d', //count_list_video_<category_id>
		video_info: 'video_info_%d',//video_info_<game_id>
		count_all_video: 'count_all_video',

		exam_event_list: 'exam_event_list',
		exam_event_info: 'exam_event_info_%d', //exam_event_info_<id>
		exam_event_game: 'exam_event_game_%d_%d', //exam_event_game_<type_id>_<class_id>
	},

	exam:{
		user_current_round:'user_current_round_%d_%d', //user_current_round_<user_id>_<type_id>
		total_round: 'total_round_%d', //db
		current_round: 'current_round_%d', //db
		payment_round: 'payment_round_%d' //db
	},

	exam_olympic_toan: {
		id: 1,
		name: 'Luyện Toán',
		max_round: 19,
		test_count: 3,
		free: true
	},
	exam_olympic_english: {
		id: 2,
		name: 'Luyện Tiếng Anh',
		max_round: 19,
		test_count: 3,
		free: true
	},
	exam_olympic_tiengviet: {
		id: 3,
		name: 'Luyện Tiếng Việt',
		max_round: 19,
		test_count: 3,
		free: true
	},
	exam_tiengviet: {
		id: 4,
		name: 'Tiếng Việt',
		max_round: 19,
		test_count: 3,
		free: false
	},
	exam_khoahoc_tunhien: {
		id: 5,
		name: 'Luyện Khoa học - tự nhiên',
		max_round: 19,
		test_count: 3,
		free: true
	},
	exam_su_dia_xahoi: {
		id: 6,
		name: 'Luyện Sử - địa -xã hội',
		max_round: 19,
		test_count: 3,
		free: true
	},
	exam_iq_toan_tienganh: {
		id: 7,
		name: 'Luyện IQ - Toán tiếng anh',
		max_round: 19,
		test_count: 3,
		free: true
	},

	email_config:{
		server:{
			user: "AKIAJMLAAGSN3V6UNA6Q",
			password: "AvYmQ8yNyma0apv4fbC7DmCfTE9+hMuLUHoID+RaiOSA",
			host: "email-smtp.us-east-1.amazonaws.com",
			port: 465,
			ssl: true
			//tls: {ciphers: "SSLv3"} //hotmail | outlook
		},
		message:{
			from: 'Trạng Nguyên Support <no-reply@support.vp9.tv>',
			// to:[
			// 	//"Tech VP9 <tech@vp9.tv>",
			// 	//"Customer Care <customercare@vp9.tv>",
			// 	// "Zai Tân <tanmv@vp9.tv>"
			// ],
			subject: '[TrangNguyen][Support][%s] Lấy lại mật khẩu đăng nhập',
			text:'Chào %s,\n<br/>Bạn hãy click vào link <a href="https://trangnguyen.edu.vn/quen-mat-khau/%s">%s</a> để lấy lại mật khẩu.\nTrạng Nguyên cảm ơn! \n<br/>(Email send tự động, vui lòng ko gửi lại - reply)'
		}
	},
	// socket_exam: 'http://localhost:8080'
	payment:{
		allow_miss_count: 5,
		ttl_miss: 900000,
		key_miss: 'payment_miss_%d',//payment_miss_<user_id>
		expire_day:{
			10000: 5,
			20000: 10,
			50000: 30,
			100000: 100,
			200000: 200,
			500000: 600
		},
		card:{
			VIETTEL:{
				name:'Viettel',
				number_length: [13,15],
				serial_length: [11,13]
			},
			VMS:{
				name: 'MobiFone',
				number_length: [12],
				serial_length: [15]
			},
			VNP:{
				name: 'VinaPhone',
				number_length: [14],
				serial_length: [9,14]
			},
			TNCARD:{
				name: 'Trạng Nguyên',
				number_length: [12],
				serial_length: [12]
			}
		},
		request: {
			// url: 'https://www.nganluong.vn/mobile_card.api.post.v2.php',
			url: 'http://exu.vn/mobile_card.api.post.v2.php',
			method: 'POST',
			headers: {
				'User-Agent': 'Super Agent/trangnguyen2015',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			form: {
				'func': 'CardCharge',
				'version': '2.0',
				// 'merchant_id': '40021',
				'merchant_id': '50354',
				'merchant_account': 'nganluong.trangnguyen@gmail.com',
				//'merchant_password': '0f764ed8c664ff681a3325f7170555b5',//util.MD5('40021|TrangnguyenAPI!2015'),
				'merchant_password': 'd7857ea388daaa6f418f10007b53ece5',
				'pin_card':'', //Mã thẻ cào
				'card_serial':'', //Số serial của thẻ
				'type_card':'VMS',//VMS: Thẻ cào MobiFone | VNP: Thẻ cào VinaPhone | VIETTEL: Thẻ cào Viettel
				'ref_code':0,
				'client_fullname':'',
				'client_email':'',
				'client_mobile':''
			}
		},
		status:{
			'00': {
				// NlMsg: 'Giao dịch thành công',
				CusMsg: 'Nạp thẻ thành công',
				customer_done: true
			},
			'99': {
				// NlMsg: 'Lỗi, tuy nhiên lỗi chưa được định nghĩa hoặc chưa xác định được nguyên nhân',
				CusMsg: 'Đã xảy ra sự cố ngoài ý muốn, bạn hãy thử lại sau',
				customer_done: false
			},
			'01': {
				// NlMsg: 'Lỗi, địa chỉ IP truy cập API của NgânLượng.vn bị từ chối',
				CusMsg: 'Kênh thanh toán chưa kết nối thành công',
				customer_done: false
			},
			'02': {
				//NlMsg: 'Lỗi, tham số gửi từ merchant tới NgânLượng.vn chưa chính xác (thường sai tên tham số hoặc thiếu tham số)',
				CusMsg: 'Kênh thanh toán chưa kết nối thành công',
				customer_done: false
			},
			'03': {
				//NlMsg: 'Lỗi, Mã merchant không tồn tại hoặc merchant đang bị khóa kết nối tới NgânLượng.vn',
				CusMsg: 'Kênh thanh toán chưa kết nối thành công',
				customer_done: false
			},
			'04': {
				//NlMsg: 'Lỗi, Mã checksum không chính xác (lỗi này thường xảy ra khi mật khẩu giao tiếp giữa merchant và NgânLượng.vn không chính xác, hoặc cách sắp xếp các tham số trong biến params không đúng)',
				CusMsg: 'Kênh thanh toán chưa kết nối thành công',
				customer_done: false
			},
			'05': {
				// NlMsg: 'Tài khoản nhận tiền nạp của merchant không tồn tại',
				CusMsg: 'Kênh thanh toán chưa kết nối thành công',
				customer_done: false
			},
			'06': {
				// NlMsg: 'Tài khoản nhận tiền nạp của merchant đang bị khóa hoặc bị phong tỏa, không thể thực hiện được giao dịch nạp tiền',
				CusMsg: 'Kênh thanh toán chưa kết nối thành công',
				customer_done: false
			},
			'07': {
				// NlMsg: 'Thẻ đã được sử dụng',
				CusMsg: 'Thẻ đã được sử dụng',
				customer_done: false
			},
			'08': {
				// NlMsg: 'Thẻ bị khóa',
				CusMsg: 'Thẻ bị khóa',
				customer_done: false
			},
			'09': {
				// NlMsg: 'Thẻ hết hạn sử dụng',
				CusMsg: 'Thẻ hết hạn sử dụng',
				customer_done: false
			},
			'10': {
				// NlMsg: 'Thẻ chưa được kích hoạt hoặc không tồn tại',
				CusMsg: 'Thẻ chưa được kích hoạt hoặc không tồn tại',
				customer_done: false
			},
			'11': {
				// NlMsg: 'Mã thẻ sai định dạng',
				CusMsg: 'Mã thẻ sai định dạng',
				customer_done: false
			},
			'12': {
				// NlMsg: 'Sai số serial của thẻ',
				CusMsg: 'Sai số serial của thẻ',
				customer_done: false
			},
			'13': {
				// NlMsg: 'Mã thẻ và số serial không khớp',
				CusMsg: 'Mã thẻ và số serial không khớp',
				customer_done: false
			},
			'14': {
				// NlMsg: 'Thẻ không tồn tại',
				CusMsg: 'Thẻ không tồn tại',
				customer_done: false
			},
			'15': {
				// NlMsg: 'Thẻ không sử dụng được',
				CusMsg: 'Thẻ không sử dụng được',
				customer_done: false
			},
			'16': {
				// NlMsg: 'Số lần thử (nhập sai liên tiếp) của thẻ vượt quá giới hạn cho phép',
				CusMsg: 'Số lần sai quá nhiều, bạn hãy thử lại sau',
				customer_done: false
			},
			'17': {
				// NlMsg: 'Hệ thống Telco bị lỗi hoặc quá tải, thẻ chưa bị trừ',
				CusMsg: 'Hệ thống đang bận, bạn hãy thử lại sau.',
				customer_done: false
			},
			'18': {
				// NlMsg: 'Hệ thống Telco bị lỗi hoặc quá tải, thẻ có thể bị trừ, cần phối hợp với NgânLượng.vn để tra soát',
				CusMsg: 'Hệ thống thanh toán đang bận, bạn hãy liên hệ với admin để kiểm tra lại',
				customer_done: false
			},
			'19': {
				// NlMsg: 'Kết nối từ NgânLượng.vn tới hệ thống Telco bị lỗi, thẻ chưa bị trừ (thường do lỗi kết nối giữa NgânLượng.vn với Telco, ví dụ sai tham số kết nối, mà không liên quan đến merchant)',
				CusMsg: 'Kết nối thanh toán đang bị gián đoạn',
				customer_done: false
			},
			'20': {
				// NlMsg: 'Kết nối tới telco thành công, thẻ bị trừ nhưng chưa cộng tiền trên NgânLượng.vn',
				CusMsg: 'Giao dịch thành công',
				customer_done: true
			},
		}
	},
	bank_pay:{
		expire_day:{
			100000: 120,
			200000: 250,
			300000: 400,
			500000: 700
		},

		merchant_id: '40021',
		merchant_account: 'nganluong.trangnguyen@gmail.com',
		merchant_pass:'TrangnguyenAPI!2015',
		url: 'https://www.nganluong.vn/mobile_checkout_api_post.php',

		// url: 'https://www.nganluong.vn/mobile_checkout_api_post.php',
		send_order: {
			method: 'POST',
			headers: {
				'User-Agent': 'Super Agent/trangnguyen2017',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			form: {
				func: 'sendOrder',
				version: '1.0',
				// merchant_id: '40021',
				// merchant_account: 'nganluong.trangnguyen@gmail.com',
				order_code: '0',
				total_amount: 0,
				currency: 'vnd',
				language: 'vi',
				return_url: 'https://trangnguyen.edu.vn/nop-hoc-phi-ngan-hang/done',
				cancel_url: 'https://trangnguyen.edu.vn/nop-hoc-phi-ngan-hang/cancel',
				notify_url: 'https://trangnguyen.edu.vn/nop-hoc-phi-ngan-hang/notify',
				buyer_fullname: '',
				order_description: 'nop hoc phi trang nguyen',
				buyer_email: 'az@trangnguyen.edu.vn',
				buyer_mobile: '',
				buyer_address: 'trangnguyen.edu.vn',
				checksum: ''
			}
		},
		check_order: {
			// url: 'https://www.nganluong.vn/mobile_checkout_api_post.php',
			method: 'POST',
			headers: {
				'User-Agent': 'Super Agent/trangnguyen2017',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			form: {
				func: 'checkOrder',
				version: '1.0',
				// merchant_id: '40021',
				token_code: '',
				checksum: ''
			}
		},

		response_code: {
			'00': 'thành công',
			'01': 'Lỗi không xác định',
			'02': 'merchant_id không tồn tại',
			'04': 'checksum không đúng',
			'05': 'Không ghi nhận được đơn hàng trên cổng thanh toán',
			'06': 'token_code không tồn tại hoặc không hợp lệ',
			'07': 'Đơn hàng chưa được thanh toán',
			'09': 'receiver_email không tồn tại',
			'11': 'receiver_email đang bị khóa hoặc phong tỏa không thể giao dịch',
			'20': 'function không đúng',
			'21': 'version không đúng hoặc không tồn tại',
			'22': 'Thiếu tham số đầu vào',
			'23': 'order_code mã đơn hàng không hợp lệ',
			'24': 'total_amount không hợp lệ',
			'25': 'currency không hợp lệ',
			'26': 'language không hợp lệ',
			'27': 'return_url không hợp lệ',
			'28': 'cancel_url không hợp lệ',
			'29': 'notify_url không hợp lệ',
			'30': 'buyer_fullname không hợp lệ',
			'31': 'buyer_email không hợp lệ',
			'32': 'buyer_mobile không hợp lệ',
			'33': 'buyer_address không hợp lệ'
		},
		pay_status:{
			1: 'Giao dịch chưa thanh toán',
			2: 'Giao dịch đã thanh toán, tuy nhiên số tiền trả cho người bán đang bị tạm giữ',
			3: 'Giao dịch lỗi',
			4: 'Giao dịch thanh toán thành công'
		}
	},
	isEvent12: function(){
		let date = new Date();
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let hour = date.getHours();
		if(month == 1 && [20,21,23].indexOf(day)>=0 && hour>=8 && hour<17){// && hour>=8 && hour<17
			return true;
		}
		else{
			console.log(month == 1,[20,21,23].indexOf(day)>=0);
		}
		return false;
	},
	isEvent13: function(){
		let date = new Date();
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let hour = date.getHours();
		if(month == 1 && [5,8,9,10,11,12,15,16,17,18,19,22,23,24,25].indexOf(day)>=0 && hour>=8 && hour<17){
			return true;
		}
		return false;
	},
	isEvent14: function(){
		let date = new Date();
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let hour = date.getHours();
		if(((month == 2 && [17,18,20,21,22,23,24,25,27,28].indexOf(day)>=0) || (month == 3 && [1,2,3,4,6,7].indexOf(day)>=0)) && hour>=8 && hour<17){
			return true;
		}
		return false;
	},

	IsExamDistrict: function (){
		let date = new Date();
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let hour = date.getHours();
		if(month == 3 && [23,24,25].indexOf(day)>=0 && hour>=8 && hour<17){
			return true;
		}
		return false;
	},

	IsExamProvince: function (){
		let date = new Date();
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let hour = date.getHours();
		if((month == 5 && [4,5,6].indexOf(day)>=0)){
			return true;
		}
		return false;
	},

	IsExamNational: function (){
		let date = new Date();
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let hour = date.getHours();
		if(((month == 2 && [17,18,20,21,22,23,24,25,27,28].indexOf(day)>=0) || (month == 3 && [1,2,3,4,6,7].indexOf(day)>=0)) && hour>=7 && hour<17){
			return true;
		}
		return false;
	}
};
