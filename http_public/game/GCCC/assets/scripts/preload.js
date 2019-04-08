/**
 * Created by hwngvnd on 7/11/15.
 */

typeof(TVUB) === 'undefined' ? TVUB = {} : '';

TVUB.Preload = function (game) {
    /*
     *   _game: game api
     * */
    var _game = game,
        _gameOptions,
        baseUrl;

    _game.sounds = {
        play: function () {

        }
    };

    _gameOptions = _game.options;
    baseUrl = _gameOptions.baseUrl;

    //PRELOAD
    this.initState = function () {
    };

    this.initState.prototype = {
        preload: function () {
            this.bg = this.add.image(0, 0, 'background');
            _game.state = {
                state: _game.stateList.PRELOAD,
                ref: this
            };
            _game.hw = this.game.world.width * 0.5;
            _game.hh = this.game.world.height * 0.5;
            _game.aw = this.game.world.width;
            _game.ah = this.game.world.height;

            _game.triggerEventListener('state', {
                state: _game.stateList.PRELOAD,
                options: {}
            });

            this.preloadBar = this.add.sprite(_game.hw - 222, _game.hh, 'preloaderBar');
            this.preloadBar.animations.add('walk');
            this.preloadBar.animations.play('walk', 60, true);
            this.load.setPreloadSprite(this.preloadBar);

            this.load.atlas('game_atlas', baseUrl + "images/atlas/game_atlas.png", baseUrl + 'images/atlas/game_atlas.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
            this.load.spritesheet('loading', baseUrl + 'images/loading.png', 102, 102, 8);

            if (_gameOptions.sound) {
                //am thanh
                this.load.audio('backgtound', [baseUrl + 'audio/music.mp3']);
                this.load.audio('click', [baseUrl + 'audio/click.mp3']);
                this.load.audio('answerOk', [baseUrl + 'audio/answerOk.mp3']);
                this.load.audio('answerFail', [baseUrl + 'audio/answerFail.mp3']);
                this.load.audio('transition', [baseUrl + 'audio/transition.mp3']);
                this.load.audio('result', [baseUrl + 'audio/result.mp3']);
            }

        },

        create: function () {
            this.preloadBar.cropEnabled = false;
        },

        update: function () {
            if (this.load.hasLoaded) {
                this.preloadBar.visible = false;

                if (_gameOptions.sound) {
                    _game.sounds.transition = this.add.audio('transition', 1, false);
                    _game.sounds.answerOk = this.add.audio('answerOk', 1, false);
                    _game.sounds.click = this.add.audio('click', 1, false);
                    _game.sounds.answerFail = this.add.audio('answerFail', 1, false);
                    _game.sounds.result = this.add.audio('result', 1, false);
                    _game.sounds.backgtound = this.add.audio('backgtound', 1, true).play();
                    _game.sounds.play = function (action) {
                        switch (action) {
                            case 'transition':
                                _game.sounds.transition.play();
                                break;
                            case 'answerOk':
                                _game.sounds.answerOk.play();
                                break;
                            case 'answerFail':
                                _game.sounds.answerFail.play();
                                break;
                            case 'click':
                                _game.sounds.click.play();
                                break;
                            case 'result':
                                _game.sounds.result.play();
                                break;
                            case 'backgtound':
                                _game.sounds.backgtound.play();
                                break;
                        }
                    };
                } else {
                    //no sound
                }
                this.state.start('Home');
            }
        }
    }
};