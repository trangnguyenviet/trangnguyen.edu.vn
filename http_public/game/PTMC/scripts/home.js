/**
 * Created by hwngvnd on 7/11/15.
 */

typeof(TVUB) === 'undefined' ? TVUB = {} : '';

TVUB.Home = function (game) {
    /*
     *   _game: game api
     * */
    var _game = game,
        _gameOptions,
        message;

    _gameOptions = _game.options;
    message = _gameOptions.message || {};

    //PRELOAD
    this.initState = function () {
    };

    this.initState.prototype = {
        create: function () {
            _game.sounds.play('chuyen_man');
            _game.state = {
                state: _game.stateList.HOME,
                ref: this
            };
            this.bg = this.add.image(0, 0, 'background');
            this.bg.width = _game.aw;
            this.bg.height = _game.ah;

            //ten game
            this.ten_game = this.game.add.image(_game.hw + 50, 0, 'ten_game');
            this.ten_game.anchor.set(0.5, 0);
            this.game.add.tween(this.ten_game).to({y: 105}, 1000, Phaser.Easing.Back.Out, true);
            this.game.time.events.add(Phaser.Timer.SECOND * 1, this.animateTitle, this);

            //luat choi
            this.luat_choi = this.add.text(_game.hw + 50, _game.hh, message.rule || 'Hãy giúp trâu vàng điền đáp  vào ô trống!', {
                font: "30px Arial",
                fill: "#000000",
                align: 'center',
                stroke: '#FFFFFF',
                strokeThickness: 5,
                wordWrapWidth: 550,
                wordWrap: true
            });
            this.luat_choi.setShadow(3, 3, 'rgba(0,0,0,0.1)', 5);
            this.luat_choi.anchor.set(0.5, 0);
            this.luat_choi.alpha = 0;
            this.game.add.tween(this.luat_choi).to({alpha: 1}, 2000, Phaser.Easing.Linear.None, true);

            /////////////
            this.meoduc = _game.createObject.apply(this, [[
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
            ]]);
            this.meoduc.x = 10;
            this.meoduc.y = _game.hh - 30;
            this.game.add.tween(this.meoduc).to({y: _game.hh - 10}, 400, Phaser.Easing.Back.Out, true);
            this.meocai = _game.createObject.apply(this, [[
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
            ]]);
            this.meocai.x = _game.aw - 210;
            this.meocai.y = _game.hh;
            this.game.add.tween(this.meocai).to({y: _game.hh + 30}, 400, Phaser.Easing.Back.Out, true);

            //bat dau
            this.bat_dau = this.game.add.button(_game.hw + 50, _game.hh + 300, 'bat_dau', this.startGame, this);
            this.bat_dau.input.useHandCursor = true;
            this.bat_dau.anchor.set(0.5);
            this.game.add.tween(this.bat_dau).to({y: _game.hh + 160}, 1000, Phaser.Easing.Back.Out, true);
            this.bat_dau.events.onInputOver.add(this.mouseoverStartBtn, this);
            this.bat_dau.events.onInputOut.add(this.mouseoutStartBtn, this);

            _game.triggerEventListener('state', {
                state: _game.stateList.HOME,
                options: {}
            });
        },

        mouseoverStartBtn: function () {
            this.game.add.tween(this.bat_dau.scale).to({x: 1.1, y: 1.1}, 500, Phaser.Easing.Linear.None, true);
        },

        mouseoutStartBtn: function () {
            this.game.add.tween(this.bat_dau.scale).to({x: 1, y: 1}, 500, Phaser.Easing.Linear.None, true);
        },
        animateTitle: function () {
            this.game.add.tween(this.ten_game).from({y: 105}).to({y: 100}, 1000, Phaser.Easing.Linear.None, true, 0, 20, true);
        },
        startGame: function () {
            _game.sounds.play('click_chuot');
            _game.showLoading();
            _game.triggerEventListener('click.startGame', []);
        }

    };
};