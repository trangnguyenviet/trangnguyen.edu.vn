/**
 * Created by hwngvnd on 7/11/15.
 */

typeof(TVUB) === 'undefined' ? TVUB = {} : '';

(function () {
	var Game = IGame.core;

	var g = new Game({
		container: '#container',
		baseUrl: '/game/PTMC/',
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
			rule: 'Em hãy giúp 2 chú mèo tìm và ghép được 2 ô trống có chứa nội dung tương đồng, giống nhau hoặc bằng nhau. Nếu ghép đúng cặp đôi ô trống sẽ mất đi. Bài thi sẽ dừng lại khi các em bị sai quá 3 lần.'
		},
		sound: true,
		autoLoad: true,
		ready: function (game) {
			var data = {
				//title: "Chọn các cặp bằng nhau",
				play: 10,
				//game_id: 4,
				//game_name: "Mèo con",
				time: 1200,
				timeLeft: 1200,
				currentScore: 0,
				//currentIndex: 0,
				//wrongCount: 0,
				currentAnswers: [0, 1, 18, 19],
				//content a tự tráo vị trí trên server
				content: [{"type": "text", "content": "7 + 1"}, {"type": "text", "content": "8"}, {
					"type": "text",
					"content": "10 + 7"
				}, {"type": "text", "content": "7 + 10"}, {"type": "text", "content": "11 + 7 + 1"}, {
					"type": "text",
					"content": "19"
				}, {"type": "text", "content": "12 + 8"}, {"type": "text", "content": "20"}, {
					"type": "text",
					"content": "13"
				}, {"type": "text", "content": "13"}, {"type": "text", "content": "69"}, {
					"type": "text",
					"content": "69 + 0"
				}, {"type": "text", "content": "8 - 2"}, {"type": "text", "content": "4 + 2"}, {
					"type": "text",
					"content": "9 - 2"
				}, {"type": "text", "content": "5 + 2"}, {"type": "text", "content": "Mèo"}, {
					"type": "image",
					"content": "/game/PTMC/images/2.png"
				}, {"type": "text", "content": "Chim"}, {"type": "image", "content": "/game/PTMC/images/4.png"}]
			};

			game.setGameData(data);

			//thong tin ca nhan
			if (typeof userInfo !== 'undefined') {
				game.provide('user', userInfo);
			}

			game.provide('submitAnswer', function (callback, answer1, answer2) {
				var result = false;
				// console.log(answer1, answer2);
				if (answer1.index === answer2.index) {
					result = true;
				}

				if (typeof callback === 'function') {
					callback(result);
				}
			});

			game.on('state', function (data) {
				if (data.state === 'End') {
					data.button.hide = false;
					//thi_tiep, thi_lai, dong_y
					data.button.type = 'thi_tiep';
					data.button.callback = function (options) {
						// console.log('callback', options);
					};
				}
			});

			game.on('setData', function (data) {
				// console.log(data);
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
				// console.log(data);
				//khi game xong client sẽ bắn fire báo cần kết thúc game
				//cái này có thể dùng hoặc không
				// data.action: timeup, done (hết giờ, hoàn thành bài)
				//...
			});

			game.on('error', function (data) {
				console.log(data);
			});

			game.on('click.endGame', function (data) {
				// console.log(data);
			});

			game.off('boot');
		}
	});
})();