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
            _game.wrongCount = 0;
            //_game.count = 0;


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

            //tra loi
            this.answersGroup = this.game.add.group();
            this.answersGroup.x = 175;
            this.answersGroup.y = 110;
            var itemPerRow = 5;
            $.each(_game.questions, function (index, answer) {
                var ansGroup = _this.game.add.group(),
                    ansUI,
                    ansContent,
                    x = index, y = 0;
                if ($.inArray(index, _game.currentAnswers) >= 0) {
                    return true;
                }

                ansUI = _this.add.image(0, 0, 'o_nho');
                ansGroup.add(ansUI);

                if (index >= itemPerRow) {
                    y = Math.floor(index / itemPerRow);
                    x = index - 5 * y;
                }
                ansGroup.x = x * 115;
                ansGroup.y = y * 115;

                if (answer.type === 'image') {
                    ansContent = _this.game.add.image(0, 0, answer.content);
                    ansContent.anchor.set(0.5);
                    ansContent.x = 55;
                    ansContent.y = 55;
                    ansContent.width = 95;
                    ansContent.height = 95;

                } else {
                    ansContent = _this.game.add.text(0, 0, answer.content, {
                        font: "21px Arial",
                        fill: "#000000",
                        align: 'center',
                        stroke: '#FFFFFF',
                        strokeThickness: 4,
                        wordWrapWidth: 90,
                        wordWrap: true
                    });
                    ansContent.anchor.set(0.5);
                    ansContent.x = 55;
                    ansContent.y = 55;
                    ansContent.setShadow(3, 3, 'rgba(0,0,0,0.1)', 5);
                    ansContent.lineSpacing = -10;
                }
                ansGroup.add(ansContent);
                ansGroup.alpha = 0;
                _this.game.add.tween(ansGroup).to({alpha: 1}, 500, Phaser.Easing.Back.Linear, true, index * 100);

                ansUI['data-index'] = index;
                ansUI['data-value'] = answer.content;
                ansUI.inputEnabled = true;
                ansUI.input.useHandCursor = true;
                ansUI.events.onInputDown.add(_this.clickAnswerHandler, _this);
                _this.answersGroup.add(ansGroup);
            });


            _game.triggerEventListener('state', {
                state: _game.stateList.GAME,
                options: {}
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
            if (this.meoduc && this.meoduc.destroy) {
                this.meoduc.destroy();
            }
            if (this.meocai && this.meocai.destroy) {
                this.meocai.destroy();
            }
            switch (type) {
                case 'meo_bt':
                    /////////////
                    this.meoduc = _game.createObject([
                        {
                            image: 'meoduc_bt_taytrai',
                            animation: false
                        }, {
                            image: 'meoduc_bt_tayphai',
                            animation: false
                        }, {
                            image: 'meoduc_bt_than',
                            animation: false
                        }, {
                            image: 'meoduc_bt_dau',
                            animation: true
                        }
                    ]);
                    this.meocai = _game.createObject([
                        {
                            image: 'meocai_bt_taytrai',
                            animation: false
                        }, {
                            image: 'meocai_bt_tayphai',
                            animation: false
                        }, {
                            image: 'meocai_bt_than',
                            animation: false
                        }, {
                            image: 'meocai_bt_dau',
                            animation: true
                        }
                    ]);
                    break;
                case 'meo_vui':
                    /////////////
                    this.meoduc = _game.createObject([
                        {
                            image: 'meoduc_vui_taytrai',
                            animation: true
                        }, {
                            image: 'meoduc_vui_tayphai',
                            animation: true
                        }, {
                            image: 'meoduc_vui_than',
                            animation: false
                        }, {
                            image: 'meoduc_vui_dau',
                            animation: true
                        }
                    ]);
                    this.meocai = _game.createObject([
                        {
                            image: 'meocai_vui_taytrai',
                            animation: true
                        }, {
                            image: 'meocai_vui_tayphai',
                            animation: true
                        }, {
                            image: 'meocai_vui_than',
                            animation: false
                        }, {
                            image: 'meocai_vui_dau',
                            animation: true
                        }
                    ]);
                    break;
                case 'meo_buon':
                    /////////////
                    this.meoduc = _game.createObject([
                        {
                            image: 'meoduc_buon_taytrai',
                            animation: true
                        }, {
                            image: 'meoduc_buon_tayphai',
                            animation: true
                        }, {
                            image: 'meoduc_buon_than',
                            animation: false
                        }, {
                            image: 'meoduc_buon_dau',
                            animation: true
                        }, {
                            image: 'meoduc_buon_bantayphai',
                            animation: true
                        }, {
                            image: 'meoduc_buon_bantaytrai',
                            animation: true
                        }
                    ]);
                    this.meocai = _game.createObject([
                        {
                            image: 'meocai_buon_taytrai',
                            animation: true
                        }, {
                            image: 'meocai_buon_tayphai',
                            animation: true
                        }, {
                            image: 'meocai_buon_than',
                            animation: false
                        }, {
                            image: 'meocai_buon_dau',
                            animation: true
                        }, {
                            image: 'meocai_buon_bantayphai',
                            animation: true
                        }, {
                            image: 'meocai_buon_bantaytrai',
                            animation: true
                        }
                    ]);
                    break;
            }
            this.meocai.x = _game.aw - 190;
            this.meocai.y = _game.hh + 30;
            this.meoduc.x = -40;
            this.meoduc.y = _game.hh - 5;
        },


        clickAnswerHandler: function (selected) {
            _game.sounds.play('click_chuot');
            if (selected.isSelected) {
                selected.parent.getChildAt(0).loadTexture('o_nho');
                selected.isSelected = false;
                delete this.selected;
            } else {
                selected.parent.getChildAt(0).loadTexture('o_nho_sai');
                selected.isSelected = true;
                if (this.selected) {
                    this.checkAnswer(function (result) {
                        if (result) {
                            this.correct(selected, this.selected);
                        } else {
                            this.incorrect(selected, this.selected);
                        }
                        delete this.selected;
                        if (this.isFinishable()) {
                            //this.finishGame();
                            _game.triggerEventListener('must-finish', {
                                action: 'done',
                                message: 'Hoàn thành bài!',
                                options: {
                                    score: _game.score,
                                    timeLeft: _game.timeLeft,
                                    time: _game.time,
                                    wrongCount: _game.wrongCount
                                }
                            });
                        }
                    }, selected, this.selected);
                } else {
                    this.selected = selected;
                }
            }
        },

        checkAnswer: function (callback, answer1, answer2) {
            var _this = this;
            _game.submitAnswer(function (result) {
                if (typeof callback === 'function') {
                    callback.apply(_this, [result]);
                }
            }, {
                index: answer1['data-index'],
                content: answer1['data-value']
            }, {
                index: answer2['data-index'],
                content: answer2['data-value']
            });
        },

        finishGame: function () {
            var _this = this;
            clearTimeout(_game.timeout);
            clearTimeout(_game.timeoutEndGame);
            clearTimeout(_game.timer);
            _game.timeoutEndGame = setTimeout(function () {
                _this.game.state.start('End');
            }, 300);
        },

        correct: function (item1, item2) {
            var _this = this;
            if (this.dropTextLeft && this.dropTextLeft.destroy) {
                this.dropTextLeft.destroy();
            }

            if (this.dropTextRight && this.dropTextRight.destroy) {
                this.dropTextRight.destroy();
            }

            _game.count -= 2;
            setTimeout(function () {
                item1.parent && item1.parent.destroy();
                item2.parent && item2.parent.destroy();
            }, 500);

            this.showObject('meo_vui');
            _game.sounds.play('tra_loi_dung');

            this.dropTextLeft = this.add.image(75, _game.hh - 150, 'text_dung');
            this.dropTextLeft.anchor.set(0.5);
            this.game.add.tween(this.dropTextLeft).to({y: _game.hh + 20}, 300, Phaser.Easing.Back.Out, true);

            this.dropTextRight = this.add.image(_game.aw - 75, _game.hh - 150, 'text_dung');
            this.dropTextRight.anchor.set(0.5);
            this.game.add.tween(this.dropTextRight).to({y: _game.hh + 60}, 300, Phaser.Easing.Back.Out, true);

            _game.score += 10;
            this.ava_score.setText(_game.score + '');

            clearTimeout(_game.timeout);
            _game.timeout = setTimeout(function () {
                _this.showObject('meo_bt');

                if (_this.dropTextLeft && _this.dropTextLeft.destroy) {
                    _this.dropTextLeft.destroy();
                }
                if (_this.dropTextRight && _this.dropTextRight.destroy) {
                    _this.dropTextRight.destroy();
                }
            }, 3000);
        }
        ,

        isFinishable: function () {
            var isFinishable = false;
            if (_game.wrongCount === 4) {
                isFinishable = true;
            }
            if (_game.count === 0) {
                isFinishable = true;
            }
            return isFinishable;
        },

        incorrect: function (item1, item2) {
            var _this = this;
            if (this.dropTextLeft && this.dropTextLeft.destroy) {
                this.dropTextLeft.destroy();
            }

            if (this.dropTextRight && this.dropTextRight.destroy) {
                this.dropTextRight.destroy();
            }
            _game.wrongCount++;


            item1.isSelected = false;
            item2.isSelected = false;

            setTimeout(function () {
                item1.parent && item1.parent.getChildAt(0).loadTexture('o_nho');
                item2.parent && item2.parent.getChildAt(0).loadTexture('o_nho');
            }, 500);

            this.showObject('meo_buon');
            _game.sounds.play('tra_loi_sai');

            this.dropTextLeft = this.add.image(75, _game.hh - 150, 'text_sai');
            this.dropTextLeft.anchor.set(0.5);
            this.game.add.tween(this.dropTextLeft).to({y: _game.hh + 20}, 300, Phaser.Easing.Back.Out, true);

            this.dropTextRight = this.add.image(_game.aw - 75, _game.hh - 150, 'text_sai');
            this.dropTextRight.anchor.set(0.5);
            this.game.add.tween(this.dropTextRight).to({y: _game.hh + 60}, 300, Phaser.Easing.Back.Out, true);

            clearTimeout(_game.timeout);
            _game.timeout = setTimeout(function () {
                _this.showObject('meo_bt');

                if (_this.dropTextLeft && _this.dropTextLeft.destroy) {
                    _this.dropTextLeft.destroy();
                }
                if (_this.dropTextRight && _this.dropTextRight.destroy) {
                    _this.dropTextRight.destroy();
                }
            }, 3000);
        }
        ,

        preload: function () {
            var _this = this;
            this.bg = this.add.image(0, 0, 'background');
            this.showObject('meo_bt');
            this.meoduc.alpha = 0;
            this.meocai.alpha = 0;
            this.game.add.tween(this.meoduc).to({alpha: 1}, 1000, Phaser.Easing.Linear.None, true);
            this.game.add.tween(this.meocai).to({alpha: 1}, 1000, Phaser.Easing.Linear.None, true);
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

            _game.time = gameData.time;
            _game.timeLeft = gameData.timeLeft || gameData.time;
            _game.wrongCount = gameData.wrongCount || 0;
            _game.currentIndex = gameData.currentIndex;
            _game.questions = data.questions;
            _game.preload = data.preload;
            _game.score = gameData.currentScore || 0;
            _game.currentAnswers = gameData.currentAnswers || [];
            _game.count = _game.questions.length - _game.currentAnswers.length;

            $.each(_game.preload, function (key, value) {
                _this.load.image(key, value);
            })
        },

        parseData: function (data) {
            var contents = data.content || [],
                list = [],
                preload = {};
            $.each(contents, function (index, item) {
                list.push(item);
                if (item.type === 'image') {
                    preload[item.content] = item.content;
                }
            });
            return {
                preload: preload,
                questions: list
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
                        time: _game.time,
                        wrongCount: _game.wrongCount
                    }
                });
            }
        }
    };
}
;