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
            rule: 'Hãy giúp Chuột vàng đưa từ, phép tính vào đúng chủ đề của từng giỏ'
        },
        sound: true,
        autoLoad: true,
        ready: function (game) {
            var data = {
                title: "Chọn các cặp bằng nhau",
                game_id: 4,
                game_name: "Mèo con",
                time: 1200,
                timeLeft: 100,
                currentScore: 0,
                currentIndex: 0,
                wrongCount: 0,
                currentAnswers: [0, 1, 10],
                play: 10,
                content: {
                    categories: [{
                        name: 'Hoa'
                    }, {
                        name: 'Quả'
                    }, {
                        name: 'Vật nuôi'
                    }],
                    answers: [{"type": "text", "content": "chúng ta"}, {
                        "type": "text",
                        "content": "ăn"
                    }, {"type": "text", "content": "mây"}, {"type": "text", "content": "hát hò"}, {
                        "type": "text",
                        "content": "giảng bài"
                    }, {"type": "text", "content": "mưa"}, {"type": "image", "content": "assets/images/2.png"}, {
                        "type": "text",
                        "content": "ấy"
                    }, {"type": "text", "content": "xinh"}, {"type": "text", "content": "ô hay"}, {
                        "type": "text",
                        "content": "Hạ Long"
                    }, {"type": "text", "content": "ngủ "}, {"type": "text", "content": "xanh nhạt"}]
                }
            };

            game.setGameData(data);

            //thong tin ca nhan
            if (typeof userInfo !== 'undefined') {
                game.provide('user', userInfo);
            }

            game.provide('submitAnswer', function (callback, answer1, answer2) {
                var result = false;
                //show loading khi kiem tra dap an
                //game.showLoading();
                //console.log(answer1, answer2);

                if (typeof callback === 'function') {
                    //an loading khi tra ve ket qua
                    //game.hideLoading();
                    callback(result);
                }
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

            // game.on('setData', function (data) {
            //     console.log(data);
            // });

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

            // game.on('error', function (data) {
            //     console.log(data);
            // });

            // game.on('click.endGame', function (data) {
            //     console.log(data);
            // });

            game.off('boot');
        }
    });
})();