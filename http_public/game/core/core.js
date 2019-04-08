/**
 * Created by phamdohung161 on 7/11/15.
 */

typeof(IGame) === 'undefined' ? IGame = {} : '';

IGame.core = function (options) {
    var _game = {},
        _this = this;
    _game.stateList = {};
    _game.initStates = {};
    _game.state = {
        state: 'init'
    };
    _game.orientated = null;
    _game.events = {};

    //event
    _game.defaultConfig = {
        container: '#container',
        baseUrl: '',
        forceLandscape: false,
        width: 900,
        height: 600,
        sound: true,
        debugMode: true,
        ready: function () {

        }
    };

    //merge options
    _game.options = $.extend(true, {}, _game.defaultConfig, options || {});

    $.each(options.states || [], function (index, obj) {
        var stateName = (obj.name || '').toUpperCase();
        _game.stateList[stateName] = obj.name || '';
        _game.initStates[stateName] = obj.state;
    });

    //load game
    _game.load = function () {
        var $container = $(_game.options.container);
        if ($container.length === 0) {
            console.log('Container is not exist!');
            return false;
        } else {
            _game.gameId = 'phaser-game';
            _game.$game = $('<div id="' + _game.gameId + '" class="game"></div>')
                .css({
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                }).appendTo($container);
            $('<div id="game-orientation"></div>').appendTo($container);
            _game.initEvent();

            _game.instance = new Phaser.Game(_game.options.width, _game.options.height, Phaser.AUTO, 'phaser-game');
            $.each(_game.stateList, function (key, state) {
                if (typeof _game.initStates[key] === 'function') {
                    _game.instance.state.add(state, new _game.initStates[key](_game).initState);
                }
            });
            _game.triggerEventListener('ready', _this);

            //go_state
            _game.instance.state.start(_game.stateList.BOOT);
        }
        return _game;
    };


    _game.initEvent = function () {
        //registering ready event
        _game.addEventListener('ready', _game.options.ready);
        return _game;
    };

    _game.addEventListener = function (type, callback) {
        if (typeof callback !== 'function') {
            console.log('The second parameter is not a function');
            return false;
        }

        if (!_game.events[type]) {
            _game.events[type] = [];
        }
        _game.events[type].push(callback);

        return _game;
    };

    _game.removeEventListener = function (type) {
        delete _game.events[type];

        return _game;
    };

    _game.removeAllEventListener = function () {
        _game.events = {};

        return _game;
    };

    _game.triggerEventListener = function (type, data) {
        if (!_game.events[type]) {
            return;
        }
        $.each(_game.events[type], function (k, func) {
            typeof func === 'function' && func.apply(_this, [data]);
        });

        return _game;
    };

    _game.inject = function (name, fn) {
        if (typeof fn === 'function') {
            return function () {
                try {
                    return fn.apply(_this, arguments);
                } catch (e) {
                    if (_game.options.debugMode) {
                        console.log(e);
                    }
                }
            };
        } else {
            return fn;
        }
    };

    _game.createObject = function (components) {
        var _this = this;
        if (_game.state.ref) {
            _this = _game.state.ref
        }
        var objGroup = _this.game.add.group();

        $.each(components, function (index, component) {
            var temp = _this.add.image(113, 146, component.image);
            temp.anchor.set(0.5);
            if (component.animation) {
                _this.game.add.tween(temp).from({angle: 0}).to({angle: 5}, 1000, Phaser.Easing.Linear.None, true, 0, 2500, true);
            }
            objGroup.add(temp);
        });
        return objGroup;
    };

    _game.showLoading = function () {
        var _this = this;
        if (_game.state.ref) {
            _this = _game.state.ref
        }

        if (_this.loading && _this.loading.destroy) {
            console.log('destroy');
            _this.loading.destroy();
        }
        _this.loading = _this.game.add.sprite(_game.aw - 50, _game.ah - 50, 'loading');
        _this.loading.animations.add('walk');
        _this.loading.animations.play('walk', 20, true);
        _this.loading.anchor.set(0.5);
        _this.loading.width = 50;
        _this.loading.height = 50;
    };

    _game.hideLoading = function () {
        var _this = this;
        if (_game.state.ref) {
            _this = _game.state.ref
        }
        if (_this.loading) {
            _this.loading.visible = false;
        }
    };

    _game.provide = function (name, fn) {
        if (_game[name]) {
            console.log('Method name has been already declared');
        } else {
            _game[name] = _game.inject(name, fn);
        }
        return this;
    };

    _game.swap = function (arr, n) {
        var length = 0,
            arr_index = [],
            clone = arr.slice(),
            i;
        if (n <= arr.length) {
            length = n;
        } else {
            length = arr.length;
        }
        for (i = 0; i < length; i++) {
            var index = Math.floor(Math.random() * clone.length);
            arr_index.push(clone[index]);
            clone.splice(index, 1);
        }
        return arr_index;
    };

    /**
     *   PUBLIC METHOD
     */

    this.showLoading = function () {
        _game.showLoading();
        return this;
    };

    this.hideLoading = function () {
        _game.hideLoading();
        return this;
    };

    this.getGame = function () {
        return _game.instance;
    };

    this.getGameData = function () {
        return _game.gameData;
    };

    this.setGameData = function (data) {
        _game.gameData = data;
        _game.triggerEventListener('setData', data);
        return this;
    };

    this.getState = function () {
        return _game.state;
    };

    this.goState = function (state, options) {
        if (_game.stateList[(state || '').toUpperCase()]) {
            _game.stateOptions = $.extend(true, {}, options);
            _game.instance.state.start(state);
        }
        return this;
    };

    this.loadGame = function () {
        if (_game.state.state === 'init') {
            _game.load();
        } else {
            console.log('Game has been already initialized');
        }
        return this;
    };


    this.provide = _game.provide;

    this.getOptions = function () {
        return _game.options;
    };

    this.setOptions = function (options) {
        _game.removeAllEventListener();
        _game.options = $.extend(true, {}, _game.defaultConfig, options || {});
        _game.addEventListener('ready', _game.options.ready);

        return this;
    };

    this.on = _game.addEventListener;
    this.off = _game.removeEventListener;

    if (_game.options.autoLoad) {
        _game.load();
    }
};