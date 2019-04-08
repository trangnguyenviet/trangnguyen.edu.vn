/**
 * Created by hwngvnd on 7/11/15.
 */

typeof(TVUB) === 'undefined' ? TVUB = {} : '';

TVUB.Game = function (game) {
    /*
     *   _game: game api
     * */
    var _game = game,
        _gameOptions;

    _gameOptions = _game.options;

    //PRELOAD
    this.initState = function () {
    };

    this.initState.prototype = {
        create: function
            () {
            var questions = _game.questions,
                _this = this;
            //check data
            if (!questions || questions.length === 0) {
                _game.triggerEventListener('error', {
                    action: 'NoData',
                    message: 'Không có dữ liệu!'
                });
                return false;
            }
            _game.hideLoading();

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
                this.ava_score = this.add.text(60, 60, _game.score + '', {
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
                this.avaGroup.x = -200;
                this.game.add.tween(this.avaGroup).to({x: 10}, 500, Phaser.Easing.Back.Out, true);
            }

            this.questionGroup = this.add.group();
            this.questionGroup.x = _game.hw - 282;
            this.questionGroup.y = _game.hh - 50;
            this.questionbg = this.add.image(0, 0, 'nen_chu');
            this.answerGroup = this.add.group();
            this.questionGroup.add(this.questionbg);
            this.questionGroup.add(this.answerGroup);

            this.questionIdx = _game.currentIndex || 0;
            if (questions[this.questionIdx]) {
                this.playQuestion.apply(_this, [questions[this.questionIdx]]);
                this.tra_loi = this.game.add.button(_game.hw, _game.hh + 170, 'tra_loi', this.submitAnswer, this);
                this.tra_loi.scale.x = 0.5;
                this.tra_loi.scale.y = 0.5;
                this.tra_loi.events.onInputOver.add(function () {
                    this.game.add.tween(this.tra_loi.scale).to({x: 0.6, y: 0.6}, 500, Phaser.Easing.Linear.None, true);
                }, this);
                this.tra_loi.events.onInputOut.add(function () {
                    this.game.add.tween(this.tra_loi.scale).to({x: 0.5, y: 0.5}, 500, Phaser.Easing.Linear.None, true);
                }, this);
                this.tra_loi.input.useHandCursor = true;
                this.tra_loi.anchor.set(0.5);
            }

            _game.triggerEventListener('state', {
                state: _game.stateList.GAME,
                ref: _this
            });

            //////////////
            //thoigian
            this.timerGroup = this.game.add.group();
            this.timerGroup.x = _game.hw - 70;
            this.timerGroup.y = -100;
            this.timerText = this.add.text(0, 0, "00:00", {
                font: "40px Arial",
                fill: "#000",
                align: 'center',
                stroke: '#F2F2F2',
                strokeThickness: 4,
                wordWrapWidth: 200,
                wordWrap: true
            });

            this.timerText.anchor.set(0.5);
            this.timerText.x = 70;
            this.timerText.y = 34;
            this.timerGroup.add(this.timerText);
            this.game.add.tween(this.timerGroup).to({y: 10}, 500, Phaser.Easing.Back.Out, true);
            _game.timer = setInterval(function () {
                _this.updateTimer();
            }, Phaser.Timer.SECOND);
        }
        ,

        showObject: function (type) {
            if (this.trauvang && this.trauvang.destroy) {
                this.trauvang.destroy();
            }
            switch (type) {
                case 'trau_bt':
                    /////////////
                    this.trauvang = _game.createObject([
                        {
                            image: 'trau_binh_thuong_tayphai',
                            animation: false
                        }, {
                            image: 'trau_binh_thuong_taytrai',
                            animation: false
                        }, {
                            image: 'trau_binh_thuong_than',
                            animation: false
                        }, {
                            image: 'trau_binh_thuong_dau',
                            animation: true
                        }
                    ]);
                    break;
                case 'trau_vui':
                    /////////////
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
                    break;
                case 'trau_buon':
                    /////////////
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
                    break;
            }
            this.trauvang.x = 0;
            this.trauvang.y = _game.hh + 10;
        }
        ,

        playQuestion: function (list) {
            var _this = this,
                width = Math.floor(500 / list.length),
                size;

            _this.answerGroup.removeAll();
            size = width < 60 ? width : 60;


            $.each(list, function (index, o_chu) {
                var o_chu_nho, anh_nen,
                    ansContent,
                    text = o_chu.content;

                anh_nen = _this.add.image(0, 0, 'o_chu_nho');
                anh_nen.width = width;

                if (o_chu.type === 'image') {
                    ansContent = _this.game.add.image(width / 2, size / 2, o_chu.content);
                    ansContent.width = size - 10;
                    ansContent.height = size - 10;

                } else {
                    ansContent = _this.game.add.text(width / 2, 35, text === '{}' ? '' : text, {
                        font: "21px Arial",
                        fill: "#000000",
                        align: 'center',
                        stroke: '#FFFFFF',
                        strokeThickness: 4,
                        wordWrapWidth: width - 10,
                        wordWrap: true
                    });
                    ansContent.anchor.set(0.5);
                    ansContent.setShadow(3, 3, 'rgba(0,0,0,0.1)', 5);
                    ansContent.lineSpacing = -10;
                }
                ansContent.anchor.set(0.5);

                o_chu_nho = _this.add.group();

                o_chu_nho.add(anh_nen);
                o_chu_nho.add(ansContent);
                o_chu_nho.x = 75 + (width + 2) * index;
                o_chu_nho.y = 15;
                o_chu_nho.alpha = 0;
                _this.game.add.tween(o_chu_nho).to({alpha: 1}, 500, Phaser.Easing.Back.Linear, true, index * 100);
                _this.answerGroup.add(o_chu_nho);

                if (text === '{}') {
                    var oPos = o_chu_nho.position || {},
                        qPos = _this.questionGroup.position,
                        tW = width,
                        tH = 60, top, left;
                    top = oPos.y + qPos.y;
                    left = oPos.x + qPos.x;
                    _this.initTextBox({
                        top: top,
                        left: left,
                        width: tW,
                        height: tH,
                        'font-size': 21,
                        'line-height': 30

                    });
                }
            });
        },

        convertToRealSize: function (obj) {
            var ratio = $('#phaser-game canvas').width() / _gameOptions.width,
                gPos = $('#phaser-game canvas').offset(),
                pPos = $(_gameOptions.container).offset();

            return {
                top: Math.round((obj.top + gPos.top - pPos.top) * ratio),
                left: Math.round((obj.left + gPos.left - pPos.left) * ratio),
                width: Math.round(obj.width * ratio),
                height: Math.round(obj.height * ratio),
                'font-size': Math.round(obj['font-size'] * ratio) + 'px',
                'line-height': Math.round(obj['line-height'] * ratio) + 'px'
            };
        },

        initTextBox: function (obj) {
            var _this = this, $textBox;
            $('#answer-txt').remove();
            $textBox = $('<input id="answer-txt" type="text">')
                .css(this.convertToRealSize(obj))
                .on('keydown', function (event) {
                    if (event.keyCode === 13) {
                        _this.submitAnswer();
                    }
                })
                .appendTo('#phaser-game')
                .focus();

            $(window).off('resize').on('resize', function () {
                $textBox.hide();
                clearTimeout(_this.clearTimeoutResize);
                _this.clearTimeoutResize = setTimeout(function () {
                    $textBox.css(_this.convertToRealSize(obj)).show();
                }, 300);
            });
        },

        submitAnswer: function () {
            var txt = $('#answer-txt').val(),
                result = false,
                _this = this;
            _game.sounds.play('click_chuot');
            _game.submitAnswer(function (res) {
                if (res.result) {
                    _this.correct();
                } else {
                    _this.incorrect();
                }

                _this.questionIdx++;
                if (/*_game.wrongCount < 4 &&*/ _game.questions[_this.questionIdx]) {
                    _this.playQuestion.apply(_this, [_game.questions[_this.questionIdx]]);
                } else {
                    //_this.finishGame();
                    _game.triggerEventListener('must-finish', {
                        action: 'done',
                        message: 'Hoàn thành bài!',
                        options: {
                            score: _game.score,
                            timeLeft: _game.timeLeft,
                            time: _game.time
                        }
                    });
                }
            }, _this.questionIdx, txt);
        },

        finishGame: function () {
            var _this = this;
            $('#answer-txt').remove();
            clearTimeout(_game.timeout);
            clearTimeout(_game.timeoutEndGame);
            clearTimeout(_game.timer);
            _game.timeoutEndGame = setTimeout(function () {
                _this.game.state.start('End');
            }, 300);
        }
        ,

        correct: function () {
            var _this = this;
            if (this.dropText && this.dropText.destroy) {
                this.dropText.destroy();
            }
            this.showObject('trau_vui');
            _game.sounds.play('tra_loi_dung');

            this.dropText = this.add.image(110, _game.hh - 150, 'text_dung');
            this.dropText.anchor.set(0.5);
            this.game.add.tween(this.dropText).to({y: _game.hh + 20}, 300, Phaser.Easing.Back.Out, true);

            _game.score += 10;
            this.ava_score.setText(_game.score + '');

            clearTimeout(_game.timeout);
            _game.timeout = setTimeout(function () {
                _this.showObject('trau_bt');
                if (_this.dropText && _this.dropText.destroy) {
                    _this.dropText.destroy();
                }
            }, 3000);
        }
        ,

        incorrect: function () {
            var _this = this;
            if (this.dropText && this.dropText.destroy) {
                this.dropText.destroy();
            }
            _game.wrongCount++;
            this.showObject('trau_buon');
            _game.sounds.play('tra_loi_sai');

            this.dropText = this.add.image(110, _game.hh - 150, 'text_sai');
            this.dropText.anchor.set(0.5);
            this.game.add.tween(this.dropText).to({y: _game.hh + 20}, 300, Phaser.Easing.Back.Out, true);

            clearTimeout(_game.timeout);
            _game.timeout = setTimeout(function () {
                _this.showObject('trau_bt');
                if (_this.dropText && _this.dropText.destroy) {
                    _this.dropText.destroy();
                }
            }, 3000);
        },

        preload: function () {
            var _this = this;
            this.bg = this.add.image(0, 0, 'background');
            this.showObject('trau_bt');
            _game.sounds.play('chuyen_man');

            _game.state = {
                state: _game.stateList.GAME,
                ref: this
            };
            _game.showLoading();
            var gameData = _game.gameData,
                data;
            if (!gameData) return false;

            data = this.parseData(gameData) || {};
            console.log(data);

            _game.time = gameData.time;
            _game.timeLeft = gameData.timeLeft || gameData.time;
            _game.wrongCount = gameData.wrongCount || 0;
            _game.currentIndex = gameData.currentIndex;
            _game.questions = data.questions;
            _game.preload = data.preload;
            _game.score = gameData.currentScore || 0;
            $.each(_game.preload, function (key, value) {
                _this.load.image(key, value);
            });
        },

        parseData: function (data) {
            var contents = data.content || [],
                preload = {};
            $.each(contents, function (index, content) {
                $.each(content, function (index, q) {
                    if (q.type === 'image') {
                        preload[q.content] = q.content;
                    }
                });
            });
            return {
                preload: preload,
                questions: contents
            };
        },

        updateTimer: function () {
            _game.timeLeft -= 1;
            var sec_num = parseInt(_game.timeLeft, 10); // don't forget the second param
            if (sec_num > 0) {
                var hours = Math.floor(sec_num / 3600);
                var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                var seconds = sec_num - (hours * 3600) - (minutes * 60);

                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                this.timerText.setText(minutes + ':' + seconds);
            } else {
                clearInterval(_game.timer);
                //this.finishGame();
                _game.triggerEventListener('must-finish', {
                    action: 'timeup',
                    message: 'Hết giờ nhé!',
                    options: {
                        score: _game.score,
                        timeLeft: _game.timeLeft,
                        time: _game.time
                    }
                });
            }
        }
    };
}
;