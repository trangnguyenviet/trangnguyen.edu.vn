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
            _game.sounds.play('result');

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
            _game.createUserInfo.apply(this, [this.getTextureAtlas("bgAvatar"), this.getTextureAtlas('avatar')]);
            /*
             * RESULT
             * */

            this.resultUI = this.getTextureAtlas("bgResult");
            this.resultMessage = this.getTextureAtlas("txtComplete");
            this.resultMessage.anchor.set(0.5);
            this.resultUI.x = 50;
            this.resultUI.y = 20;
            this.resultMessage.x = 265;
            this.resultMessage.y = 100;

            this.resultScore = this.add.text(140, 160, 'Bạn được ', resultStyles);
            this.score = this.add.text(290, 158, _game.gameData.score + '', scoreStyles);
            this.score.anchor.set(0.5, 0);
            this.unitScore = this.add.text(315, 160, 'điểm', resultStyles);

            this.time = this.add.text(90, 210, 'Thời gian làm bài là', resultStyles);
            this.resultTime = this.add.text(320, 208, this.getTime(), scoreStyles);

            this.mess = this.add.text(256, 260, '', resultStyles);
            this.mess.anchor.set(0.5, 0);

            this.tiger = this.createPlayer(["v_dau","v_trai", "v_phai", "v_than"], [1, 0, 0, 0]);

            this.btnContinue = this.getTextureAtlas("btnContinue");
            this.btnContinue.x = 280;
            this.btnContinue.y = 290;
            this.btnContinue.anchor.set(0.5);
            this.btnContinue.inputEnabled = true;
            this.btnContinue.input.pixelPerfectClick = true;
            this.btnContinue.input.useHandCursor = true;
            this.btnContinue.events.onInputDown.add(this.onHanlerContinueClick, this);
            this.btnContinue.events.onInputOver.add(this.hanlerOverButton, this);
            this.btnContinue.events.onInputOut.add(this.hanlerOutButton, this);

            this.tiger.alpha = 0;
            this.game.add.tween(this.tiger).to({alpha: 1}, 1000, Phaser.Easing.Linear.None, true);

            this.result = this.game.add.group();
            this.result.add(this.resultUI);
            this.result.add(this.resultMessage);
            this.result.add(this.resultTime);
            this.result.add(this.resultScore);
            this.result.add(this.score);
            this.result.add(this.time);
            this.result.add(this.unitScore);
            this.result.add(this.mess);
            this.result.add(this.btnContinue);
            this.result.x = _game.hw - 140;
            this.result.y = _game.hh;
            this.game.add.tween(this.result).to({y: _game.hh - 200}, 1500, Phaser.Easing.Back.Out, true);

        },

        hanlerOverButton: function (button) {
            this.game.add.tween(button.scale).to({x: 1.1, y: 1.1}, 500, Phaser.Easing.Linear.None, true);
        },

        hanlerOutButton: function (button) {
            this.game.add.tween(button.scale).to({x: 1, y: 1}, 500, Phaser.Easing.Linear.None, true);
        },

        onHanlerContinueClick: function () {
            _game.sounds.play('click');
            _game.triggerEventListener('click.endGame', []);
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

        getTime: function () {
            var sec_num = parseInt(_game.gameData.time - _game.gameData.time_left, 10); // don't forget the second param
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

        getTextureAtlas: function (name) {
            var sprite = this.add.sprite(0, 0, 'game_atlas');
            sprite.frameName = name;
            return sprite;
        },
    };
};