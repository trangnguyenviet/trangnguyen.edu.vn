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
            var answers = _game.answers,
                categories = _game.categories,
                _this = this;
            //check data
            if (!answers || answers.length === 0 || !categories || categories.length === 0) {
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

            //draw group
            this.categories = this.game.add.group();
            this.categories.x = _game.aw - 280;
            this.categories.y = 400;

            $.each(categories, function (index, cate) {
                var groupId,
                    groupUI,
                    groupText,
                    position,
                    textPosition,
                    textRotation,
                    defaultData = _gameOptions.defaultGroups[index];

                position = defaultData.position || {x: 0, y: 0};
                textPosition = defaultData.textPosition || {x: 0, y: 0};
                textRotation = defaultData.textRotation || 0;

                groupId = _this.game.add.group();
                groupId.x = position.x;
                groupId.y = position.y;
                groupId.z = index;

                groupUI = _this.add.image(0, 0, 'gio_' + index);

                groupText = _this.add.text(textPosition.x, textPosition.y, cate.name, {
                    font: "25px Arial",
                    fill: "#000",
                    align: 'center',
                    stroke: '#F2F2F2',
                    strokeThickness: 4,
                    wordWrapWidth: 200,
                    wordWrap: true,
                    width: 200
                });

                groupText.anchor.set(0.5);
                groupText.setShadow(3, 3, 'rgba(0,0,0,0.1)', 5);
                groupText.angle = textRotation;

                groupId.add(groupUI);
                groupId.add(groupText);
                groupId['data-name'] = cate.name;
                groupId['data-index'] = index;
                //_this.game.physics.arcade.enable(groupId);
                _this.categories.add(groupId);
            });
            this.categories.sort('z', Phaser.Group.SORT_DESCENDING);
            this.game.add.tween(this.categories).to({y: 0}, 500, Phaser.Easing.Back.Out, true);

            $.each(answers, function (index, answer) {
                var answerID,
                    answerText,
                    answerUI,
                    defaultAnswer = _gameOptions.defaultAnswers[index] || {},
                    position;

                if (_game.currentAnswers.indexOf(index) >= 0) {
                    return true;
                }

                position = defaultAnswer.position || {x: 0, y: 0};

                answerID = _this.game.add.group();
                answerID.alpha = 0;
                answerID.x = position.x;
                answerID.y = position.y;

                answerUI = _this.game.add.image(0, 0, 'o_nho');

                if (answer.type == 'image') {
                    answerText = _this.game.add.image(0, 0, answer.content);
                    answerText.anchor.set(0.5);
                    answerText.width = 95;
                    answerText.height = 95;
                } else {
                    answerText = _this.game.add.text(0, 0, answer.content, {
                        font: "21px Arial",
                        fill: "#000000",
                        align: 'center',
                        stroke: '#FFFFFF',
                        strokeThickness: 4,
                        wordWrapWidth: 90,
                        wordWrap: true
                    });
                    answerText.anchor.set(0.5);
                    answerText.setShadow(3, 3, 'rgba(0,0,0,0.1)', 5);
                    answerText.lineSpacing = -10;
                }
                answerText.x = 55;
                answerText.y = 55;
                answerText['data-index'] = index;
                answerText['data-content'] = answer.content;
                answerText['data-type'] = answer.type;
                answerText.inputEnabled = true;
                answerText.input.enableDrag();
                answerText.input.useHandCursor = true;
                //_this.game.physics.arcade.enable(answerText);
                answerText.events.onDragStop.add(function (currentSprite) {
                    _this.stopDrag(currentSprite, _this.categories);
                }, _this);
                answerText.events.onDragStart.add(_this.startDrag, this);
                answerID.add(answerUI);
                answerID.add(answerText);
                _this.game.add.tween(answerID).to({alpha: 1}, 500, Phaser.Easing.Back.Linear, true, index * 100);
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
            if (this.chuot && this.chuot.destroy) {
                this.chuot.destroy();
            }
            switch (type) {
                case 'chuot_bt':
                    /////////////
                    this.chuot = _game.createObject([
                        {
                            image: 'chuot_bt_taytrai',
                            animation: true
                        }, {
                            image: 'chuot_bt_tayphai',
                            animation: true
                        }, {
                            image: 'chuot_bt_than',
                            animation: false
                        }, {
                            image: 'chuot_bt_dau',
                            animation: true
                        }
                    ]);
                    break;
                case 'chuot_vui':
                    /////////////
                    this.chuot = _game.createObject([
                        {
                            image: 'chuot_vui_taytrai',
                            animation: false
                        }, {
                            image: 'chuot_vui_tayphai',
                            animation: false
                        }, {
                            image: 'chuot_vui_than',
                            animation: false
                        }, {
                            image: 'chuot_vui_dau',
                            animation: true
                        }
                    ]);
                    break;
                case 'chuot_chienthang':
                    /////////////
                    this.chuot = _game.createObject([
                        {
                            image: 'chuot_chienthang_taytrai',
                            animation: true
                        }, {
                            image: 'chuot_chienthang_tayphai',
                            animation: true
                        }, {
                            image: 'chuot_chienthang_than',
                            animation: false
                        }, {
                            image: 'chuot_chienthang_dau',
                            animation: true
                        }
                    ]);
                    break;
                case 'chuot_buon':
                    /////////////
                    this.chuot = _game.createObject([
                        {
                            image: 'chuot_buon_taytrai',
                            animation: false
                        }, {
                            image: 'chuot_buon_tayphai',
                            animation: false
                        }, {
                            image: 'chuot_buon_than',
                            animation: false
                        }, {
                            image: 'chuot_buon_dau',
                            animation: true
                        }
                    ]);
                    break;
            }
            this.chuot.x = 10;
            this.chuot.y = _game.hh - 10;
        },

        checkOverlap: function (spriteA, spriteB) {
            var boundsA = spriteA.getBounds();
            var boundsB = spriteB.getBounds();
            return Phaser.Rectangle.intersects(boundsA, boundsB);
        },

        checkAnswer: function (callback, answer, category) {
            var _this = this;
            _game.submitAnswer(function (result) {
                if (typeof callback === 'function') {
                    if (typeof callback === 'function') {
                        callback.apply(_this, [result]);
                    }
                }
            }, {
                index: answer['data-index'],
                content: answer['data-content'],
                type: answer['data-type']
            }, {
                index: category['data-index'],
                name: category['data-name']
            });
        },

        startDrag: function (currentSprite) {
            if (currentSprite['data-type'] === 'image') {
                currentSprite.width = 50;
                currentSprite.height = 50;
            }
            currentSprite.originalFillColor = currentSprite.fill;
            currentSprite.originalPosition = currentSprite.position.clone();
            currentSprite.fill = 'red';
            _game.sounds.play('click_chuot');
        },

        stopDrag: function (currentSprite, groups) {
            var _this = this,
                revert = true;
            _game.sounds.play('click_chuot');
            currentSprite.fill = currentSprite.originalFillColor;
            //disable drag
            currentSprite.input.draggable = false;

            var isBreak = false;
            var grLength = groups.length;
            if (grLength >= 3) {
                for (var i = 3; i--; i <= 0) {
                    var item = groups.getChildAt(i);
                    if (!isBreak) {
                        if (_this.checkOverlap(currentSprite, item)) {
                            isBreak = true;
                            revert = false;

                            _this.checkAnswer(function (result) {
                                if (result) {
                                    _this.correct(currentSprite, item);
                                } else {
                                    _this.incorrect(currentSprite, item);
                                    _this.revertPosition(currentSprite);
                                }
                                if (revert) {
                                    _this.revertPosition(currentSprite);
                                }
                                if (_this.isFinishable()) {
                                    //_this.finishGame();
                                    _game.triggerEventListener('must-finish', {
                                        action: 'done',
                                        message: 'Done!',
                                        options: {
                                            score: _game.score,
                                            timeLeft: _game.timeLeft,
                                            time: _game.time,
                                            wrongCount: _game.wrongCount
                                        }
                                    });
                                }
                            }, currentSprite, item);
                        }
                    }
                }
            }
            if (revert) {
                _this.revertPosition(currentSprite);
            }
        },

        revertPosition: function (currentSprite) {
            currentSprite.input.draggable = true;
            currentSprite.position.copyFrom(currentSprite.originalPosition);
            if (currentSprite['data-type'] === 'image') {
                currentSprite.width = 95;
                currentSprite.height = 95;
            }
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

        isFinishable: function () {
            var isFinishable = false;
            if (_game.wrongCount >= 4) {
                isFinishable = true;
            }
            if (_game.count <= 0) {
                isFinishable = true;
            }
            return isFinishable;
        },

        correct: function (item, category) {
            var _this = this;
            if (this.dropTextLeft && this.dropTextLeft.destroy) {
                this.dropTextLeft.destroy();
            }

            _game.count -= 1;

            //lock item
            setTimeout(function () {
                var parent = item.parent;
                if (parent && parent.destroy) {
                    parent.destroy();
                }
            }, 300);

            this.showObject('chuot_vui');
            _game.sounds.play('tra_loi_dung');

            this.dropTextLeft = this.add.image(120, _game.hh - 200, 'text_dung');
            this.dropTextLeft.anchor.set(0.5);
            this.game.add.tween(this.dropTextLeft).to({y: _game.hh - 25}, 300, Phaser.Easing.Back.Out, true);

            _game.score += 10;
            this.ava_score.setText(_game.score + '');

            clearTimeout(_game.timeout);
            _game.timeout = setTimeout(function () {
                _this.showObject('chuot_bt');

                if (_this.dropTextLeft && _this.dropTextLeft.destroy) {
                    _this.dropTextLeft.destroy();
                }
            }, 3000);
        },

        incorrect: function (item1, category) {
            var _this = this;
            if (this.dropTextLeft && this.dropTextLeft.destroy) {
                this.dropTextLeft.destroy();
            }
            _game.wrongCount++;

            //lock item
            setTimeout(function () {
                item1.position.copyFrom(item1.originalPosition);
                if (item1['data-type'] === 'image') {
                    item1.width = 95;
                    item1.height = 95;
                }
                //item1.alpha = 0.75;
                //item1.parent && item1.parent.getChildAt(0).loadTexture('o_nho_sai');
            }, 300);


            this.showObject('chuot_buon');
            _game.sounds.play('tra_loi_sai');

            this.dropTextLeft = this.add.image(140, _game.hh - 200, 'text_sai');
            this.dropTextLeft.anchor.set(0.5);
            this.game.add.tween(this.dropTextLeft).to({y: _game.hh - 25}, 300, Phaser.Easing.Back.Out, true);

            clearTimeout(_game.timeout);
            _game.timeout = setTimeout(function () {
                _this.showObject('chuot_bt');

                if (_this.dropTextLeft && _this.dropTextLeft.destroy) {
                    _this.dropTextLeft.destroy();
                }
            }, 3000);
        },

        preload: function () {
            var _this = this;
            this.bg = this.add.image(0, 0, 'background');
            this.showObject('chuot_bt');
            this.chuot.alpha = 0;
            this.game.add.tween(this.chuot).to({alpha: 1}, 1000, Phaser.Easing.Linear.None, true);
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
            _game.score = gameData.currentScore || 0;
            _game.currentAnswers = gameData.currentAnswers || [];

            _game.answers = data.answers;
            _game.categories = data.categories;
            _game.preload = data.preload;
            _game.count = gameData.play;

            $.each(_game.preload, function (key, value) {
                _this.load.image(key, value);
            })
        },

        parseData: function (data) {
            var contents = data.content || {},
                list = [],
                preload = {},
                answers;

            answers = contents.answers || [];

            $.each(answers, function (index, item) {
                list.push(item);
                if (item.type === 'image') {
                    preload[item.content] = item.content;
                }
            });
            return {
                preload: preload,
                answers: list,
                categories: contents.categories
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