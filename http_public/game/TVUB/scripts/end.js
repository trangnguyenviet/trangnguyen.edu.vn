/**
 * Created by hwngvnd on 7/11/15.
 */

typeof(TVUB) === 'undefined' ? TVUB = {} : '';

TVUB.End = function (game) {
    /*
     *   _game: game api
     * */
    var _game = game,
        _gameOptions;

    _gameOptions = _game.options;

    //END
    this.initState = function () {
    };

    this.initState.prototype = {
        create: function () {
            //reset game
            $('#answer-txt').remove();
            clearTimeout(_game.timeout);
            clearTimeout(_game.timeoutEndGame);
            clearTimeout(_game.timer);

            var score = _game.stateOptions.score || _game.score,
                timeLeft = _game.stateOptions.timeLeft || _game.timeLeft,
                time = _game.stateOptions.time || _game.time;

            var resultStyles = {
                    font: "25px Arial",
                    fill: "#A00300",
                    align: 'center',
                    height: 25,
                    stroke: '#FFFFFF',
                    strokeThickness: 4,
                    wordWrapWidth: 400,
                    wordWrap: true
                },
                scoreStyles = {
                    font: "28px Arial",
                    fill: "#A00300",
                    align: 'center',
                    height: 25,
                    stroke: '#FFFFFF',
                    strokeThickness: 4,
                    wordWrapWidth: 400,
                    wordWrap: true,
                    fontWeight: 'bold'
                };
            _game.state = {
                state: _game.stateList.END,
                ref: this
            };
            this.bg = this.add.image(0, 0, 'background');
            _game.sounds.play('chuyen_man');

            var ket_thuc = {
                hide: false,
                callback: function () {

                }
            };
            _game.triggerEventListener('state', {
                state: _game.stateList.END,
                options: {
                    score: _game.score,
                    timeLeft: _game.timeLeft,
                    time: _game.time
                },
                button: ket_thuc
            });

            /*
             * AVATAR
             * */
            if (_game.user) {
                var avatarStyles = {
                    font: "12px Arial",
                    fill: "#000000",
                    align: 'center',
                    stroke: '#FFFFFF',
                    strokeThickness: 1,
                    wordWrapWidth: 115,
                    wordWrap: false
                };

                this.avaGroup = this.game.add.group();
                this.avaGroup.x = 10;
                this.avaGroup.y = 10;

                this.avatar_ui = this.add.sprite(0, 0, 'khung_avatar');
                this.avatar_profile = this.add.sprite(12, 11, 'avatar');
                this.avatar_profile.height = 70;
                this.avatar_profile.width = 60;
                this.avatar_info = this.game.add.group();
                this.avatar_info.x = 75;
                var usr = _game.user.username || '';
                if (usr.length > 18) {
                    usr = usr.substring(0, 18) + '...';
                }
                this.username = this.add.text(0, 11, usr, avatarStyles);
                this.username.lineSpacing = -10;
                this.avatar_info.add(this.username);
                this.uid = this.add.text(0, 28, 'ID: ' + _game.user.uid, avatarStyles);
                this.uid.lineSpacing = -10;
                this.scoretxt = this.add.text(60, 45, 'Điểm', avatarStyles);
                this.scoretxt.lineSpacing = -10;
                this.scoretxt.anchor.set(0.5, 0);
                this.ava_score = this.add.text(60, 60, score + '', {
                    font: "22px Arial",
                    fill: "#000000",
                    align: 'center',
                    stroke: '#FFFFFF',
                    strokeThickness: 1,
                    wordWrapWidth: 70,
                    wordWrap: true,
                    fontWeight: 'bold'
                });
                this.ava_score.lineSpacing = -10;
                this.ava_score.anchor.set(0.5, 0);
                this.avatar_info.add(this.scoretxt);
                this.avatar_info.add(this.uid);
                this.avatar_info.add(this.ava_score);

                this.avaGroup.add(this.avatar_ui);
                this.avaGroup.add(this.avatar_profile);
                this.avaGroup.add(this.avatar_info);
                this.avaGroup.x = 10;
            }

            /*
             * RESULT
             * */

            this.resultUI = this.game.add.image(0, 0, 'khung_ket_qua');
            this.resultMessage = this.game.add.image(265, 100, 'hoan_thanh_bt');
            this.resultMessage.anchor.set(0.5);

            this.resultScore = this.add.text(140, 160, 'Bạn được ', resultStyles);
            this.score = this.add.text(290, 158, score + '', scoreStyles);
            this.score.anchor.set(0.5, 0);
            this.unitScore = this.add.text(315, 160, 'điểm', resultStyles);

            this.time = this.add.text(90, 210, 'Thời gian làm bài là', resultStyles);
            this.resultTime = this.add.text(320, 208, this.getTime(), scoreStyles);

            this.mess = this.add.text(256, 260, '', resultStyles);
            this.mess.anchor.set(0.5, 0);


            //ket thuc
            var percent = parseInt(_game.score / 100 * 100);

            if (percent < 50) {
                //action_sprite = 'thi_lai';
                this.trauvang = _game.createObject([
                    {
                        image: 'trau_buon_canhtaytrai',
                        animation: true
                    }, {
                        image: 'trau_buon_bantaytrai',
                        animation: true
                    }, {
                        image: 'trau_buon_canhtaytrai',
                        animation: true
                    }, {
                        image: 'trau_buon_bantayphai',
                        animation: true
                    }, {
                        image: 'trau_buon_than',
                        animation: false
                    }, {
                        image: 'trau_buon_dau',
                        animation: true
                    }
                ]);
            } else {
                //action_sprite = 'thi_tiep';
                this.trauvang = _game.createObject([
                    {
                        image: 'trau_vui_canhtayphai',
                        animation: true
                    }, {
                        image: 'trau_binh_thuong_taytrai',
                        animation: false
                    }, {
                        image: 'trau_vui_than',
                        animation: false
                    }, {
                        image: 'trau_vui_dau',
                        animation: true
                    }, {
                        image: 'trau_vui_bantayphai',
                        animation: true
                    }
                ]);
            }
            this.trauvang.x = 0;
            this.trauvang.y = _game.hh + 10;

            if (!ket_thuc.hide) {
                var action_sprite = ket_thuc.type;
                if(action_sprite !== 'thi_lai' || action_sprite !== 'thi_tiep' || action_sprite !== 'dong_y'){
                    action_sprite = 'dong_y';
                }
                this.ket_thuc = this.game.add.button(265, 290, action_sprite, function () {
                    _game.sounds.play('click_chuot');
                    typeof ket_thuc.callback === 'function' && ket_thuc.callback.apply(ket_thuc, [{
                        score: score,
                        timeLeft: timeLeft,
                        time: time
                    }]);
                }, this);
                this.ket_thuc.input.useHandCursor = true;
                this.ket_thuc.anchor.set(0.5);
                this.ket_thuc.scale.x = 0.5;
                this.ket_thuc.scale.y = 0.5;
                this.ket_thuc.events.onInputOver.add(function () {
                    this.game.add.tween(this.ket_thuc.scale).to({x: 0.6, y: 0.6}, 500, Phaser.Easing.Linear.None, true);
                }, this);
                this.ket_thuc.events.onInputOut.add(function () {
                    this.game.add.tween(this.ket_thuc.scale).to({x: 0.5, y: 0.5}, 500, Phaser.Easing.Linear.None, true);
                }, this);
            }

            this.result = this.game.add.group();
            this.result.add(this.resultUI);
            this.result.add(this.resultMessage);
            this.result.add(this.resultTime);
            this.result.add(this.resultScore);
            this.result.add(this.score);
            this.result.add(this.time);
            this.result.add(this.unitScore);
            this.result.add(this.mess);
            this.result.add(this.ket_thuc);
            this.result.x = _game.hw - 140;
            this.result.y = _game.hh;
            this.game.add.tween(this.result).to({y: _game.hh - 200}, 1500, Phaser.Easing.Back.Out, true);

        },

        getTime: function () {
            var sec_num = parseInt((_game.stateOptions.time || _game.time) - (_game.stateOptions.timeLeft || _game.timeLeft), 10); // don't forget the second param
            console.log(sec_num, _game.stateOptions.time || _game.time, _game.stateOptions.timeLeft || _game.timeLeft);

            if (sec_num >= 0) {
                var hours = Math.floor(sec_num / 3600);
                var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                var seconds = sec_num - (hours * 3600) - (minutes * 60);

                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                return (minutes + '\'' + seconds + 's');
            }
        },
    };
};