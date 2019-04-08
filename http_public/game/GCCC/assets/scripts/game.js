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
        create: function () {
            var gameData = _game.gameData;
            _this = this;

            //check data
            if (!gameData.content || gameData.content.length === 0) {
                _game.triggerEventListener('error', {
                    action: 'NoData',
                    message: 'Không có dữ liệu!'
                });
                return false;
            }
            this.bg = this.add.image(0, 0, 'background');
            this.bg.width = _game.aw;
            this.bg.height = _game.ah;

            _game.hideLoading();
            _game.createUserInfo.apply(this, [this.getTextureAtlas("bgAvatar"), this.getTextureAtlas('avatar')]);

            this.initGame();
        },

        preload: function () {
            _game.sounds.play('transition');
            _game.state = {
                state: _game.stateList.GAME,
                ref: this
            };

            for (var i = 0; i < _game.gameData.content.length; i++) {
                var quest = _game.gameData.content[i];
                for (var j = 0; j < quest.length; j++) {
                    var mcCross = quest[j];
                    if (mcCross.type === 'image') {
                        this.load.image(mcCross.content, mcCross.content);
                    }
                }
            }

        },

        showStateObject: function (state) {
            if (this.player && this.player.destroy) {
                this.player.destroy();
            }
            switch (state) {
                case "idle":
                    this.player = this.createPlayer(["v_dau","v_trai", "v_phai", "v_than"], [1, 0, 0, 0]);
                    break;
                case "bad":
                    this.player = this.createPlayer(["b_dau", "b_phai", "b_than", "b_trai"], [1, 0, 0]);
                    break;
                case "happy":
                    this.player = this.createPlayer(["t_dau", "t_phai", "t_trai", "t_than"], [1, 0, 0, 0]);
                    break;
            }
        },

        createPlayer: function (arrName, arrSate) {
            var arr = [];
            for (var i = 0; i < arrName.length; i++) {
                arr.push({
                    image: this.getTextureAtlas(arrName[i]),
                    animation: arrSate[i]
                })
            }

            var tiger = _game.createAtlasObject.apply(this, [arr]);
            tiger.x = 150;
            tiger.y = _game.hh + 50;
            return tiger;
        },

        startTimer: function () {
            this.timerGroup = this.game.add.group();
            this.timerGroup.x = _game.hw + 50;
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
            this.timer = setInterval(function () {
                _this.updateTimer();
            }.bind(this), Phaser.Timer.SECOND);
        },

        updateTimer: function () {
            this.timeLeft -= 1;
            var sec_num = parseInt(this.timeLeft, 10); // don't forget the second param
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
                this.timerText.setText(minutes + ':' + seconds);
            } else {
                clearInterval(this.timer);
                this.checkFinishGame();
            }
        },

        getTextureAtlas: function (name) {
            var sprite = this.add.sprite(0, 0, 'game_atlas');
            sprite.frameName = name;
            return sprite;
        },

        destroyGroup: function (group) {
            if (group && group.destroy) {
                group.destroy();
            }
        },

        hanlerOverButton: function (button) {
            this.game.add.tween(button.scale).to({x: 1.1, y: 1.1}, 500, Phaser.Easing.Linear.None, true);
        },

        hanlerOutButton: function (button) {
            this.game.add.tween(button.scale).to({x: 1, y: 1}, 500, Phaser.Easing.Linear.None, true);
        },

        finishGame: function () {
            _game.onOverGame(this.setEnd, this.score, this.timeLeft);

        },

        setEnd: function (score, time_left) {
            _game.sounds.play('transition');

            _game.gameData.score = score;
            _game.gameData.time_left = time_left;

            $('#answer-txt').remove();
            clearTimeout(this.timeout);
            clearTimeout(this.timeoutEndGame);
            clearTimeout(this.timer);
            this.timeoutEndGame = setTimeout(function () {
                _this.game.state.start('End');
            }, 300);
        },

        //==============================================================================================================
        //==============================================================================================================
        //==============================================================================================================
        initGame: function () {
            this.numCrossWidth = 5;
            this.timeLeft = _game.gameData.time_left;
            this.totalTime = _game.gameData.time;
            this.score =  _game.gameData.score;
            this.life = _game.gameData.life || 3;
            this.addScore = _game.gameData.addScore || 10;
            this.isAanswer = false;
            this.playQuest();
            this.startTimer();
            this.showStateObject("idle");

            _game.updateScore.apply(this, [this.score]);
        },

        playQuest: function () {
            this.ctnAnswer = this.createCrossAnswer();
            this.backCross =  this.createBackCross();
            this.ctnCross = this.createCross();
            this.sortCrossGroupList(this.ctnCross);
            this.sortCrossAnswerList(this.ctnAnswer);
            this.hanlerEventListeners();
        },

        hanlerEventListeners: function () {
            for (var i = 0; i < this.ctnCross.children.length; i++) {
                var mcCross = this.ctnCross.children[i];
                if (mcCross.hasContent) {
                    _game.sounds.play('click');
                    var bg = mcCross.getChildAt(0);
                    bg.inputEnabled = true;
                    bg.input.useHandCursor = true;
                    bg.events.onInputDown.add(this.sendAnswer, this);
                }
            }
        },

        showAnswer: function (result) {
            if (this.dropText && this.dropText.destroy) this.dropText.destroy();
            this.dropText = (result) ? this.getTextureAtlas("txtYes") : this.getTextureAtlas("txtNo");
            this.dropText.anchor.set(0.5);
            this.dropText.x = 250;
            this.dropText.y = _game.hh + 40;
            this.game.add.tween(this.dropText).to({y: _game.hh + 130}, 300, Phaser.Easing.Back.Out, true);

            var state = (result) ? "happy" : "bad";

            this.showStateObject(state);
            setTimeout(function () {
                this.showStateObject("idle");
                if (this.dropText && this.dropText.destroy) this.dropText.destroy();
            }.bind(this), 2000);
        },

        reponseAnswer: function (result, index) {
            var answereds = _game.gameData.answereds;
            var mcCross = this.ctnCross.children[index];
            this.showAnswer(result);
            if (result) {
                answereds.push(index);
                var x = this.ctnAnswer.x + this.ctnAnswer.children[answereds.length - 1].x - this.ctnCross.x + this.ctnAnswer.children[answereds.length - 1].width / 2 - mcCross.width / 2;
                var y = this.ctnAnswer.y + this.ctnAnswer.children[answereds.length - 1].y - this.ctnCross.y + this.ctnAnswer.children[answereds.length - 1].height / 2 - mcCross.height / 2;
                var time = (this.ctnAnswer.alpha === 1)?300:10;
                var tween = _this.game.add.tween(mcCross).to({x: x, y: y}, time, Phaser.Easing.Back.Linear, true);
                _game.sounds.play('answerOk');
                tween.onComplete.add(function () {
                    var bg = mcCross.getChildAt(0);
                    mcCross.alpha = 0;
                    mcCross.hasContent = false;
                    bg.inputEnabled = false;
                    bg.input.useHandCursor = false;
                    bg.events.onInputDown.removeAll();
                    this.updateAnswerCross(index);
                }, this);

                this.timeout = setTimeout(function () {
                    this.isAanswer = false;
                    this.checkFinishGame();

                    this.score += this.addScore;
                    _game.updateScore.apply(this, [this.score]);

                }.bind(this), 300);
            }else{
                mcCross.bg2.alpha = 1;
                _game.sounds.play('answerFail');
                this.timeout = setTimeout(function () {
                    mcCross.bg2.alpha = 0;
                    this.life--;
                    if(this.life > 0){
                        this.isAanswer = false;
                    }
                    this.checkFinishGame();
                }.bind(this), 1000);
            }


        },

        checkFinishGame:function () {
            if(this.life <= 0){
                this.finishGame();
                return;
            }
            var answereds = _game.gameData.answereds;
            var arrQuest = _game.gameData.content;
            if(answereds.length === arrQuest.length){
                this.finishGame();
                return;
            }

            if(this.timeLeft <= 0){
                this.finishGame();
                return;
            }
        },

        finishGame:function () {
            this.timeout = setTimeout(function () {
                _game.onOverGame(this.setEnd, this.score, this.timeLeft);
            }.bind(this), 1000);

        },

        updateAnswerCross:function (index) {
            var arrQuest = _game.gameData.content;
            var answereds = _game.gameData.answereds;
            var quest = arrQuest[index];
            var mcCross = this.ctnAnswer.children[answereds.length - 1];
            var content = null;
            var bg =  mcCross.getChildAt(0);
            if (quest.type === 'image') {
                content = _this.game.add.image(0, 0, quest.content);
                content.width = bg.width - 12;
                content.height = bg.height - 12;
            } else {
                content = _this.game.add.text(0, 0, quest.content, {
                    font: "16px Arial",
                    fill: "#000000",
                    align: 'center',
                    stroke: '#FFFFFF',
                    strokeThickness: 4,
                    wordWrapWidth: 90,
                    wordWrap: true
                });
                content.setShadow(3, 3, 'rgba(0,0,0,0.1)', 5);
                content.lineSpacing = -10;
            }
            mcCross.add(content);
            this.updateContentPosition(bg, content);
        },

        sendAnswer: function (bgCross) {
            if (this.isAanswer) return;
            this.isAanswer = true;
            _game.sounds.play('click');
            _game.submitAnswer(this.reponseAnswer.bind(this), bgCross.index);
        },

        sortCrossGroupList: function (crossGroupList) {
            for (var i = 0; i < crossGroupList.length; i++) {
                var mcCross = crossGroupList.children[i];
                mcCross.x = (i % this.numCrossWidth) * mcCross.width;
                mcCross.y = Math.floor(i / this.numCrossWidth) * mcCross.height;
                mcCross.alpha = 0;

                var my = mcCross.y;
                mcCross.y -= 50;

                _this.game.add.tween(mcCross).to({alpha: 1, y: my}, 300, Phaser.Easing.Back.Linear, true, i * 100);
            }

            crossGroupList.x = _game.aw / 2 - crossGroupList.width / 2 + 120;
            crossGroupList.y = _game.ah / 2 - crossGroupList.height / 2;

            this.backCross.x = crossGroupList.x;
            this.backCross.y = crossGroupList.y;
        },

        createBackCross:function () {
            var crossGroupList = _this.game.add.group();
            var arrQuest = _game.gameData.content;
            var numHeight = Math.ceil(arrQuest.length / this.numCrossWidth);
            var bg = this.getTextureAtlas("bgCross");

            bg.width  = this.numCrossWidth * bg.width;
            bg.height  = numHeight * bg.height;

            var lineTop = this.getTextureAtlas("lineTop");
            var lineBottom = this.getTextureAtlas("lineBottom");
            var lineRight = this.getTextureAtlas("lineRight");
            var lineLeft = this.getTextureAtlas("lineLeft");

            lineTop.x = bg.width/2 - lineTop.width/2;
            lineTop.y = bg.y - lineTop.height;

            lineBottom.x = bg.width/2 - lineBottom.width/2;
            lineBottom.y = bg.y + bg.height;

            lineLeft.height = bg.height + 20;
            lineLeft.x = bg.x - lineLeft.width;
            lineLeft.y = bg.height/2 - lineLeft.height/2;

            lineRight.height = bg.height + 20;
            lineRight.x = bg.x + bg.width;
            lineRight.y = bg.height/2 - lineRight.height/2;

            crossGroupList.add(bg);
            crossGroupList.add(lineTop);
            crossGroupList.add(lineBottom);
            crossGroupList.add(lineRight);
            crossGroupList.add(lineLeft);
            return crossGroupList;
        },
        
        createCross: function () {
            var crossGroupList = _this.game.add.group();

            var arrQuest = _game.gameData.content;
            var answereds = _game.gameData.answereds;
            var numHeight = Math.ceil(arrQuest.length / this.numCrossWidth);


            for (var i = 0; i < numHeight * this.numCrossWidth; i++) {
                var crossGroup = _this.game.add.group();
                if (i < arrQuest.length && this.checkAnswereds(answereds, i)) {
                    var quest = arrQuest[i];
                    var bg1 = this.getTextureAtlas("bgCross1");
                    var bg2 = this.getTextureAtlas("bgCross_red");
                    var content = null;

                    if (quest.type === 'image') {
                        content = _this.game.add.image(0, 0, quest.content);
                        content.width = bg1.width - 12;
                        content.height = bg1.height - 12;
                    } else {
                        content = _this.game.add.text(0, 0, quest.content, {
                            font: "21px Arial",
                            fill: "#000000",
                            align: 'center',
                            stroke: '#FFFFFF',
                            strokeThickness: 4,
                            wordWrapWidth: 90,
                            wordWrap: true
                        });
                        content.setShadow(3, 3, 'rgba(0,0,0,0.1)', 5);
                        content.lineSpacing = -10;
                    }
                    this.updateContentPosition(bg1, content);
                    bg1.index = i;
                    bg2.alpha = 0;
                    crossGroup.bg1 = bg1;
                    crossGroup.bg2 = bg2;
                    crossGroup.hasContent = true;
                    crossGroup.add(bg1);
                    crossGroup.add(bg2);
                    crossGroup.add(content);
                    crossGroupList.add(crossGroup);
                } else {
                    crossGroup.hasContent = false;
                    crossGroupList.add(crossGroup);
                }
            }

            return crossGroupList;
        },

        updateContentPosition: function (bg, content) {
            content.x = bg.x + bg.width / 2 - content.width / 2;
            content.y = bg.y + bg.height / 2 - content.height / 2;
        },

        checkAnswereds: function (answereds, index) {
            for (var i = 0; i < answereds.length; i++) {
                var idx = answereds[i];
                if (idx === index) return false;
            }
            return true;
        },

        createCrossAnswer: function () {
            var crossGroupList = _this.game.add.group();
            var arrQuest = _game.gameData.content;
            var answereds = _game.gameData.answereds;

            if(arrQuest.length >= 13){
                crossGroupList.alpha = 0;
            }

            for (var i = 0; i < arrQuest.length; i++) {
                var crossGroup = _this.game.add.group();
                var bg = this.getTextureAtlas("bgCross2");
                crossGroup.add(bg);
                if (i < answereds.length) {
                    var quest = arrQuest[answereds[i]];
                    var content = null;
                    if (quest.type === 'image') {
                        content = _this.game.add.image(0, 0, quest.content);
                        content.width = bg.width - 12;
                        content.height = bg.height - 12;
                    } else {
                        content = _this.game.add.text(0, 0, quest.content, {
                            font: "16px Arial",
                            fill: "#000000",
                            align: 'center',
                            stroke: '#FFFFFF',
                            strokeThickness: 4,
                            wordWrapWidth: 90,
                            wordWrap: true
                        });
                        content.setShadow(3, 3, 'rgba(0,0,0,0.1)', 5);
                        content.lineSpacing = -10;
                    }
                    crossGroup.add(content);
                    this.updateContentPosition(bg, content);
                }

                crossGroupList.add(crossGroup);
            }

            return crossGroupList;
        },

        sortCrossAnswerList: function (crossGroupList) {
            for (var i = 0; i < crossGroupList.length; i++) {
                var mcCross = crossGroupList.children[i];
                mcCross.x = i * mcCross.width;
                mcCross.y = 0;
                mcCross.alpha = 0;

                _this.game.add.tween(mcCross).to({alpha: 1}, 300, Phaser.Easing.Back.Linear, true, i * 100);
            }

            crossGroupList.x = _game.aw / 2 - crossGroupList.width / 2;
            crossGroupList.y = _game.ah - crossGroupList.height - 10;
        },

    };
};