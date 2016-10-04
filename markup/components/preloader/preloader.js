import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';
import {preloaderManifest,
        mainManifest,
        preloaderManifestFullHD} from 'components/preloader/manifests';

export let config;

export let preloader = (function () {

    const c = createjs;
    const defaultConfig = {};

    let stage;

    function start(configObj) {
        config = configObj || defaultConfig;
    }

    function startPreloader() {

        const loader = new c.LoadQueue(true);
        loader.setMaxConnections(4);
        loader.on('complete', showPreloader);
        loader.loadManifest(preloaderManifest);

    }

    function showPreloader(event) {

        stage = storage.read('stage');
        const loader = event.target;

        //  New Preloader
        const newPreloaderContainer = new c.Container().set({ name: 'newPreloaderContainer' });

        const darkBG = new c.Shape();
        darkBG.graphics.beginFill('#000').drawRect(0, 0, utils.width, utils.height);

        //  Preloader Line
        const lineSS = loader.getResult('preloaderLine');
        const line = new c.Sprite(lineSS).set({
            name: 'preloaderLine',
            y: 450
        });
        utils.getCenterPoint(line);
        utils.setInCenterOf(line, utils.width);
        line.paused = true;

        // Preloader Coin
        const coinSS = loader.getResult('preloaderCoin');
        const coin = new c.Sprite(coinSS, 'coin').set({
            name: 'preloaderCoin',
            y: 200,
            framerate: 20
        });
        utils.getCenterPoint(coin);
        utils.setInCenterOf(coin, utils.width);
        coin.play();

        newPreloaderContainer.addChild(darkBG, line, coin);

        stage.addChild(newPreloaderContainer);

        mainPreload(newPreloaderContainer);

    }

    function drawInitScreen() {

        const loader = storage.read('loadResult');

        // Spritesheets
        const ss = loader.getResult('preloader');
        const clock = loader.getResult('preloaderSprite');

        //  Containers
        const preloaderContainer = new c.Container().set({ name: 'preloaderContainer' });
        const preloaderCache = new c.Container().set({ name: 'preloaderCache' });

        const preloaderBG = new c.Sprite(ss, 'bg').set({ name: 'preloaderBG' });

        const preloaderLogo = new c.Sprite(ss, 'logo');
        preloaderLogo.set({
            name: 'preloaderLogo',
            x: (utils.width - preloaderLogo.getBounds().width) / 2,
            y: 75
        });

        const preloaderPlay = new c.Sprite(ss, 'play');
        preloaderPlay.set({
            name: 'preloaderPlay',
            x: (utils.width - preloaderPlay.getBounds().width) / 2,
            y: 310
        });

        const preloaderSprite = new c.Sprite(clock, 'start');
        preloaderSprite.set({
            name: 'preloaderSprite',
            x: (utils.width - preloaderSprite.getBounds().width) / 2 - 100,
            y: 150
        });
        preloaderSprite.paused = true;

        preloaderCache.addChild(preloaderBG, preloaderLogo);
        preloaderCache.cache(0, 0, utils.width, utils.height);
        preloaderContainer.addChild(preloaderCache, preloaderPlay, preloaderSprite);
        preloaderContainer.on('click', function (e) {
            e.stopPropagation();
        });
        stage.addChildAt(preloaderContainer, stage.getChildIndex(stage.getChildByName('newPreloaderContainer')));
    }

    function mainPreload(container) {
        const sprite = container.getChildByName('preloaderLine');
        const loader = new c.LoadQueue(true);
        loader.installPlugin(c.Sound);
        loader.setMaxConnections(20);
        loader.loadManifest(mainManifest);

        loader.on('progress', handleLoadProgress, loader, false, {
            sprite
        });
        loader.on('complete', handleLoadComplete, loader, true, {
            container
        });

    }

    function handleLoadProgress(event, data) {
        const sprite = data.sprite;
        const progress = event.progress;
        const framesNumber = sprite.spriteSheet.getNumFrames('start');
        const currentFrame = Math.ceil(progress * framesNumber) - 1;
        sprite.gotoAndStop(currentFrame);
        if (progress === 1) {
            event.remove();
        }
    }

    function handleLoadComplete(event, data) {

        storage.write('loadResult', event.target);

        drawInitScreen();

        setTimeout(clearPreloader, 100);

    }

    function clearPreloader() {

        let preloaderContainer = stage.getChildByName('preloaderContainer');
        let preloaderSprite = preloaderContainer.getChildByName('preloaderSprite');
        let play = preloaderContainer.getChildByName('preloaderPlay');
        play.on('click', handlePlayClick, play, true);

        let newPreloaderContainer = stage.getChildByName('newPreloaderContainer');
        newPreloaderContainer.cache(0, 0, utils.width, utils.height);
        TweenMax.to(newPreloaderContainer, 0.5, {alpha: 0, onComplete: function () {
            preloaderSprite.play();
            storage.changeState('loaded', true);
            events.trigger('preloader:loaded');
            stage.removeChild(newPreloaderContainer);
        }});

    }

    function handlePlayClick(event, data) {
        events.trigger('preloader:goFullscreen');
        storage.changeState('fastSpinSetting', false);

        // Это стоит вынести в модуль музыки
        const ambient = c.Sound.play('ambientSound', {loop: -1});
        storage.write('ambient', ambient);
        storage.changeState('music', true);
        // Конец фрагмента

        const loader = storage.read('loadResult');
        const container = storage.read('stage').getChildByName('preloaderContainer');
        container.cache(0, 0, utils.width, utils.height);

        TweenMax.to(container, 1, {alpha: 0, onComplete: function () {
            stage.removeChild(container);
            storage.changeState('preloader', 'done');
            events.trigger('preloader:done');
        }});

    }

    return {
        start,
        startPreloader
    };

})();
