import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';
import { preloaderManifest,
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

        let loader = new c.LoadQueue(true);
        loader.setMaxConnections(4);
        loader.on('complete', showPreloader);
        loader.loadManifest(preloaderManifest);

    }

    function showPreloader(event) {

        stage = storage.read('stage');
        let loader = event.target;

        //  Container
        let preloaderContainer = new c.Container().set({ name: 'preloaderContainer' });

        let darkBG = new c.Shape();
        darkBG.graphics.beginFill('#000').drawRect(0, 0, utils.width, utils.height);

        //  Preloader Line
        let lineSS = loader.getResult('line');
        let line = new c.Sprite(lineSS).set({
            name: 'line',
            y: 450 // Magic Numbers
        });
        utils.getCenterPoint(line);
        utils.setInCenterOf(line, utils.width);
        line.paused = true;

        // Preloader Coin
        let coinSS = loader.getResult('coin');
        let coin = new c.Sprite(coinSS, 'coin').set({
            name: 'coin',
            y: 200, // Magic Numbers
            framerate: 20
        });
        utils.getCenterPoint(coin);
        utils.setInCenterOf(coin, utils.width);
        coin.play();

        preloaderContainer.addChild(darkBG, line, coin);

        stage.addChild(preloaderContainer);

        mainPreload();

    }

    function drawInitScreen() {

        let loader = storage.read('loadResult');

        //  Container
        let initContainer = new c.Container().set({ name: 'initContainer' });

        let initBG = new c.Bitmap(loader.getResult('initBG')).set({ name: 'initBG' });

        let initLogo = new c.Bitmap(loader.getResult('initLogo')).set({
            name: 'initLogo',
            y: 100 // Magic Numbers
        });
        utils.getCenterPoint(initLogo);
        utils.setInCenterOf(initLogo, utils.width);

        let initPlay = new c.Bitmap(loader.getResult('initPlay')).set({
            name: 'initPlay',
            y: 340 // Magic Numbers
        });
        utils.getCenterPoint(initPlay);
        utils.setInCenterOf(initPlay, utils.width);

        let clock = new c.Sprite(loader.getResult('clock'), 'start').set({
            name: 'clock',
            x: utils.width / 2 - 100,
            y: 320 // Magic Numbers
        });
        utils.getCenterPoint(clock);
        clock.paused = true;

        initContainer.addChild(initBG, initLogo, initPlay, clock);
        initContainer.on('click', (e) => {
            e.stopPropagation();
        });
        stage.addChildAt(initContainer, stage.getChildIndex(stage.getChildByName('preloaderContainer')));

    }

    function mainPreload() {

        let loader = new c.LoadQueue(true);
        loader.installPlugin(c.Sound);
        loader.setMaxConnections(20);
        loader.loadManifest(mainManifest);

        loader.on('progress', handleLoadProgress);
        loader.on('complete', handleLoadComplete, null, true);

    }

    function handleLoadProgress(event) {

        let container = stage.getChildByName('preloaderContainer');
        let sprite = container.getChildByName('line');

        let progress = event.progress;
        let framesNumber = sprite.spriteSheet.getNumFrames('start');
        let currentFrame = Math.floor(progress * framesNumber) - 1;
        sprite.gotoAndStop(currentFrame);
        if (progress === 1) {
            event.remove();
        }

    }

    function handleLoadComplete(event) {

        storage.write('loadResult', event.target);

        setTimeout(clearPreloader, 100);

        drawInitScreen();

    }

    function clearPreloader() {

        let preloaderContainer = stage.getChildByName('preloaderContainer');
        let initContainer = stage.getChildByName('initContainer');
        let clock = initContainer.getChildByName('clock');
        let play = initContainer.getChildByName('initPlay');

        play.on('click', handlePlayClick, null, true);

        preloaderContainer.cache(0, 0, utils.width, utils.height);

        TweenMax.to(preloaderContainer, 0.5, {alpha: 0, onComplete: function () {

            clock.play();
            events.trigger('preloader:loaded');
            stage.removeChild(preloaderContainer);

        }});

    }

    function handlePlayClick(event) {

        let loader = storage.read('loadResult');
        let initContainer = storage.read('stage').getChildByName('initContainer');

        events.trigger('preloader:goFullscreen');
        storage.changeState('fastSpinSetting', false);

        // Это стоит вынести в модуль музыки
        let ambient = c.Sound.play('ambientSound', {loop: -1});
        storage.write('ambient', ambient);
        storage.changeState('music', true);
        storage.changeState('sound', true);

        initContainer.cache(0, 0, utils.width, utils.height);

        TweenMax.to(initContainer, 1, {alpha: 0, onComplete: function () {

            events.trigger('preloader:done');
            stage.removeChild(initContainer);

        }});

    }

    return {

        start,
        startPreloader

    };

})();
