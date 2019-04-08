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
        title,
        deception;

    _gameOptions = _game.options;
   // title = _game.gameData.title || {};
   // deception = _game.gameData.deception || {};

    //PRELOAD
    this.initState = function () {
    };

    this.initState.prototype = {
        create: function () {
            _game.sounds.play('transition');
            _game.state = {
                state: _game.stateList.HOME,
                ref: this
            };
            this.bg = this.add.image(0, 0, 'background');
            this.bg.width = _game.aw;
            this.bg.height = _game.ah;

            // //luat choi
            this.txtRules = this.add.text(_game.hw, _game.hh - 150, _game.gameData.title || '', {
                font: "30px Arial",
                fill: "#000000",
                align: 'center',
                stroke: '#FFFFFF',
                strokeThickness: 5,
                wordWrapWidth: 600,
                wordWrap: true
            });
            this.txtRules.setShadow(3, 3, 'rgba(0,0,0,0.1)', 5);
            this.txtRules.anchor.set(0.5, 0);
            this.txtRules.alpha = 0;
            this.game.add.tween(this.txtRules).to({alpha: 1}, 2000, Phaser.Easing.Linear.None, true);

            this.tiger = _game.createAtlasObject.apply(this, [[
                {
                    image:  this.getTextureAtlas("v_dau"),
                    animation: true
                },
                {
                    image: this.getTextureAtlas("v_trai"),
                    animation: false
                },
                {
                    image: this.getTextureAtlas("v_phai"),
                    animation: false
                }, {
                    image: this.getTextureAtlas("v_than"),
                    animation: false
                }
            ]]);
            this.tiger.x = 165;
            this.tiger.y = _game.hh + 170;
            this.game.add.tween(this.tiger).to({y: _game.hh + 140}, 400, Phaser.Easing.Back.Out, true);

            //start
            this.btnStart = this.getTextureAtlas("btnStart");
            this.btnStart.x = _game.hw;
            this.btnStart.y = _game.hh + 300;
            this.btnStart.anchor.set(0.5);
            this.btnStart.inputEnabled = true;
            this.btnStart.input.pixelPerfectClick = true;
            this.btnStart.input.useHandCursor = true;
            this.btnStart.events.onInputDown.add(this.startGame, this);
            this.btnStart.events.onInputOver.add(this.mouseoverStartBtn, this);
            this.btnStart.events.onInputOut.add(this.mouseoutStartBtn, this);

            //start
            if(_game.gameData.deception && _game.gameData.deception !== ""){
                this.btnHelp = this.getTextureAtlas("btnHelp");
                this.btnHelp.x = _game.aw -  this.btnHelp.width;
                this.btnHelp.y = _game.ah -  this.btnHelp.height;
                this.btnHelp.anchor.set(0.5);
                this.btnHelp.inputEnabled = true;
                this.btnHelp.input.pixelPerfectClick = true;
                this.btnHelp.input.useHandCursor = true;
                this.btnHelp.events.onInputDown.add(this.openDeception, this);
                this.btnHelp.events.onInputOver.add(this.mouseoverStartBtn, this);
                this.btnHelp.events.onInputOut.add(this.mouseoutStartBtn, this);
            }

            this.game.add.tween(this.btnStart).to({y: _game.hh + 100}, 1000, Phaser.Easing.Back.Out, true);
            //this.game.add.tween(this.btnHelp).to({y: _game.hh + 100}, 1000, Phaser.Easing.Back.Out, true);

            this.createAlert();

            _game.triggerEventListener('state', {
                state: _game.stateList.HOME,
                options: {}
            });


        },

        mouseoverStartBtn: function (btn) {
            this.game.add.tween(btn.scale).to({x: 1.1, y: 1.1}, 500, Phaser.Easing.Linear.None, true);
        },

        mouseoutStartBtn: function (btn) {
            this.game.add.tween(btn.scale).to({x: 1, y: 1}, 500, Phaser.Easing.Linear.None, true);
        },
        animateTitle: function () {
            this.game.add.tween(this.ten_game).from({y: 105}).to({y: 100}, 1000, Phaser.Easing.Linear.None, true, 0, 20, true);
        },
        startGame: function () {
            if( this.alertGroup.alpha === 1) return;

            _game.sounds.play('click');
            _game.showLoading();
            _game.triggerEventListener('click.startGame', []);
        },

        getTextureAtlas:function (name) {
            var sprite = this.add.sprite(0, 0, 'game_atlas');
            sprite.frameName = name;
            return sprite;
        },

        createAlert:function () {
            this.overlay = this.getTextureAtlas("overlay");
            this.overlay.width = _game.aw;
            this.overlay.height = _game.ah;

            this.bgAlert =  this.getTextureAtlas("bg_alert");
            this.bgAlert.anchor.set(0.5, 0.5);
            this.bgAlert.x = _game.hw;
            this.bgAlert.y = _game.hh;

            this.txtAlert = this.add.text(_game.hw, _game.hh - 180, _game.gameData.deception || '', {
                font: "30px Arial",
                fill: "#000000",
                align: 'center',
                stroke: '#FFFFFF',
                strokeThickness: 5,
                wordWrapWidth: 550,
                wordWrap: true
            });
            this.txtAlert.setShadow(3, 3, 'rgba(0,0,0,0.1)', 5);
            this.txtAlert.anchor.set(0.5, 0);


            var scrollMask = this.game.add.graphics(0, 0);
            scrollMask.beginFill(0xffffff);
            scrollMask.drawRect( this.txtAlert.x - this.txtAlert.width/2, this.txtAlert.y , this.txtAlert.width, 360 );
            scrollMask.endFill();
            this.txtAlert.mask = scrollMask;


            this.btnClose = this.getTextureAtlas("btnClose");
            this.btnClose.x = _game.hw ; //-  this.btnClose.width;
            this.btnClose.y = _game.hh + 220; //-  this.btnClose.height;
            this.btnClose.anchor.set(0.5);
            this.btnClose.inputEnabled = true;
            this.btnClose.input.pixelPerfectClick = true;
            this.btnClose.input.useHandCursor = true;
            this.btnClose.events.onInputDown.add(this.closeDeception, this);
            this.btnClose.events.onInputOver.add(this.mouseoverStartBtn, this);
            this.btnClose.events.onInputOut.add(this.mouseoutStartBtn, this);

            this.alertGroup = this.game.add.group();
            this.alertGroup.add(this.overlay);
            this.alertGroup.add(this.bgAlert);
            this.alertGroup.add(this.txtAlert);
            this.alertGroup.add(this.btnClose);

            this.alertGroup.alpha = 0;
        },

        createRectangle: function (x, y, w, h) {
            var sprite = this.game.add.graphics(x, y);
            sprite.beginFill(Phaser.Color.getRandomColor(100, 255), 1);
            sprite.bounds = new PIXI.Rectangle(0, 0, w, h);
            sprite.drawRect(0, 0, w, h);
            return sprite;
        },

        closeDeception:function () {
            _game.sounds.play('click');
            this.alertGroup.alpha = 0;
        },

        openDeception:function () {
            if( this.alertGroup.alpha === 1) return;
            _game.sounds.play('click');
            this.alertGroup.alpha = 1;
        }

    };
};


//  this.game.kineticScrolling = this.game.plugins.add(Phaser.Plugin.KineticScrolling);
//  this.game.kineticScrolling.configure({
//      verticalScroll: true,
//      horizontalScroll: true
//  });
//  this.game.kineticScrolling.start();
//
//  this.rectangles = [];
//
//  var initX = 50;
//
//  for (var i = 0; i < 25; i++) {
//      this.rectangles.push(this.createRectangle(initX, this.game.world.centerY - 100, 250, 200));
//      this.index = this.add.text(_game.hw, _game.hh - 180, _game.gameData.deception || '', {
//              font: "30px Arial",
//              fill: "#000000",
//              align: 'center',
//              stroke: '#FFFFFF',
//              strokeThickness: 5,
//              wordWrapWidth: 550,
//              wordWrap: true
//          });
//      this.index.setShadow(3, 3, 'rgba(0,0,0,0.1)', 5);
//      this.index.anchor.set(0.5, 0);
//      initX += 300;
//  }
//
//  this.game.world.setBounds(0, 0, 302 * this.rectangles.length, this.game.height);
//
//  this.bg.fixedToCamera = true;
//  this.bgAlert.fixedToCamera = true;
// // this.tiger.fixedToCamera = true;
//  this.btnStart.fixedToCamera = true;
//  this.btnHelp.fixedToCamera = true;