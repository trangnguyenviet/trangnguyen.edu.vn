/**
 * Created by hwngvnd on 7/11/15.
 */

typeof(TVUB) === 'undefined' ? TVUB = {} : '';

(function () {
	var Game = IGame.core;

	var g = new Game({
		container: '#container',
		baseUrl: 'assets/',
		states: [{
			name: 'Boot',
			state: TVUB.Boot
		}, {
			name: 'Preload',
			state: TVUB.Preload
		}, {
			name: 'Home',
			state: TVUB.Home
		}, {
			name: 'Game',
			state: TVUB.Game
		}, {
			name: 'End',
			state: TVUB.End
		}],
		message: {
			rule: 'Em hãy giúp chú Trâu vàng điền chữ cái, từ, số, ký hiệu toán học hoặc phép tính phù hợp vào ô trống còn thiếu. Sau khi điền vào ô trống, em ấn phím Enter hoặc dùng chuột click vào nút Trả lời. Điền đúng 1 câu, được 10 điểm.'
		},
		sound: true,
		autoLoad: true,
		ready: function (game) {
			var data = {
				title: "Điền vào ô trống",
				play: 10,
				class: 1,
				round: 1,
				game_id: 2,
				game_name: "Trâu vàng",
				total: 10, //so luong cau hoi
				time: 1200,
				timeLeft: 1200,
				currentScore: 0,
				currentIndex: 0,
				wrongCount: 0,
				content: [[{"type": "text", "content": "s"}, {"type": "text", "content": "ắ"}, {
					"type": "image",
					"content": "assets/images/2.png"
				}, {"type": "text", "content": "s"}, {"type": "text", "content": "{}"}, {
					"type": "text",
					"content": "n"
				}], [{"type": "text", "content": "{}"}, {"type": "text", "content": "á"}, {
					"type": "text",
					"content": "i"
				}, {"type": "text", "content": "q"}, {"type": "text", "content": "a"}, {
					"type": "text",
					"content": "ạ"
				}, {"type": "text", "content": "t"}], [{"type": "text", "content": "1"}, {
					"type": "text",
					"content": "{}"
				}, {"type": "text", "content": "2"}, {"type": "text", "content": "="}, {
					"type": "text",
					"content": "3"
				}], [{"type": "text", "content": "{}"}, {"type": "text", "content": "+"}, {
					"type": "text",
					"content": "2"
				}, {"type": "text", "content": "="}, {"type": "text", "content": "4"}], [{
					"type": "text",
					"content": "3"
				}, {"type": "text", "content": "+"}, {"type": "text", "content": "3"}, {
					"type": "text",
					"content": "="
				}, {"type": "text", "content": "{}"}], [{
					"type": "image",
					"content": "assets/images/2.png"
				}, {"type": "text", "content": "Xanh"}, {"type": "text", "content": "Bông"}, {
					"type": "text",
					"content": "Trắng"
				}, {"type": "text", "content": "Lại"}, {"type": "text", "content": "Chen"}, {
					"type": "text",
					"content": "{}"
				}, {"type": "text", "content": "Vàng"}], [{"type": "text", "content": "Nhất"}, {
					"type": "text",
					"content": "Tự"
				}, {"type": "text", "content": "Vi"}, {"type": "text", "content": "Sư"}, {
					"type": "text",
					"content": "Bán"
				}, {"type": "text", "content": "Tự"}, {"type": "text", "content": "Vi"}, {
					"type": "text",
					"content": "{}"
				}], [{"type": "text", "content": "Chị"}, {"type": "text", "content": "{}"}, {
					"type": "text",
					"content": "em"
				}, {"type": "image", "content": "assets/images/2.png"}], [{
					"type": "text",
					"content": "How"
				}, {"type": "text", "content": "are"}, {"type": "text", "content": "you"}, {
					"type": "text",
					"content": "?"
				}, {"type": "text", "content": "I'm"}, {"type": "text", "content": "fine"}, {
					"type": "text",
					"content": "thank"
				}, {"type": "text", "content": "{}"}], [{"type": "text", "content": "What"}, {
					"type": "text",
					"content": "your"
				}, {"type": "text", "content": "name"}, {"type": "text", "content": "?"}, {
					"type": "text",
					"content": "my"
				}, {"type": "text", "content": "{}"}, {"type": "text", "content": "Hương"}]]
			};

			game.setGameData(data);

			//thong tin ca nhan
			if (typeof userInfo !== 'undefined') {
				game.provide('user', userInfo);
			}

			game.provide('submitAnswer', function (callback, index, val) {
				var result = false;
				typeof callback === 'function' && callback({
					result: result
				})
			});

			game.on('state', function (data) {
				if (data.state === 'End') {
					data.button.hide = false;
					//thi_tiep, thi_lai, dong_y
					data.button.type = 'thi_tiep';
					data.button.callback = function (options) {
						console.log('callback', options);
					};
				}
			});

			game.on('setData', function (data) {
				console.log(data);
			});
			game.on('click.startGame', function () {
				game.goState('Game');
				//nếu không có options thì sẽ lấy theo client
				/*game.goState('End', {
					score: 100,
					timeLeft: 10,
					time: 1200
				});*/
			});

			game.on('must-finish', function (data) {
				console.log(data);
				//khi game xong client sẽ bắn fire báo cần kết thúc game
				//cái này có thể dùng hoặc không
				// data.action: timeup, done (hết giờ, hoàn thành bài)
				//...
			});

			game.on('error', function (data) {
				console.log(data);
			});

			game.on('click.endGame', function (data) {
				console.log(data);
			});

			game.off('boot');
		}
	});
})();