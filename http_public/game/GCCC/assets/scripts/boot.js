/**
 * Created by hwngvnd on 7/11/15.
 */

typeof(TVUB) === 'undefined' ? TVUB = {} : '';

TVUB.Boot = function (game) {
    /*
     *   _game: game api
     * */
    var _game = game,
        _gameOptions,
        baseUrl;

    _gameOptions = _game.options;
    baseUrl = _gameOptions.baseUrl;

    //BOOT
    this.initState = function () {
    };

    this.initState.prototype = {
        init: function () {
            _game.state = {
                state: _game.stateList.BOOT,
                ref: this
            };
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;

            if (this.game.device.desktop) {
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.scale.setMinMax(320, 213, 900, 600);
                this.scale.setScreenSize(true);
                this.scale.refresh();
            }
            else {
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.scale.setMinMax(320, 213, 900, 600);
                this.scale.forceOrientation(false, false);
                this.scale.setResizeCallback(this.gameResized, this);
                this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
                this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
                this.scale.setScreenSize(true);
                this.scale.refresh();
            }

            _game.triggerEventListener('state', {
                state: _game.stateList.BOOT,
                options: _gameOptions,
                buttons: {

                }
            });
        },

        preload: function () {
            this.load.image('background', baseUrl + 'images/bg.png');
            this.load.spritesheet('preloaderBar', baseUrl + 'images/preloader.png', 452, 48, 13);
        },

        create: function () {
            this.state.start(_game.stateList.PRELOAD);
        },

        gameResized: function () {

        },

        enterIncorrectOrientation: function () {
            if (_gameOptions.forceLandscape) {
                _game.orientated = false;
                document.getElementById('game-orientation').style.display = 'block';
            }
        },

        leaveIncorrectOrientation: function () {
            if (_gameOptions.forceLandscape) {
                _game.orientated = true;
                document.getElementById('game-orientation').style.display = 'none';
            }
        }
    };
};