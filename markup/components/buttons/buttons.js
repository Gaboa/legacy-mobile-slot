// import CreateJS
// import TweenMax
import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';
import { handleSpinClick,
        handleSoundClick,
        handleMenuClick,
        handleAutoClick,
        handleBetClick } from 'components/buttons/handlers';

/* eslint-disable curly */
export let buttons = (function () {

    let config;
    const defaultConfig = {
        buttonsX: 1080,
        buttonsLeftX: 14,
        buttonsWidth: 300
    };

    const c = createjs;
    let menuButton;
    let autoButton;
    let spinButton;
    let betButton;
    let soundButton;

    const buttonsContainer = new c.Container().set({
        name: 'buttonsContainer'
    });
    const buttonsCache = new c.Container().set({
        name: 'buttonsCache'
    });

    function start(configObj) {
        config = configObj || defaultConfig;
    }

    function drawButtons() {

        // if (storage.read('device') === 'desktop') {
        //     return;
        // }

        const stage = storage.read('stage');
        const loader = storage.read('loadResult');
        const ss = loader.getResult('buttons');

        buttonsContainer.x = config.buttonsX;

        spinButton = new c.Sprite(ss, 'spinOut').set({
            name: 'spinButton',
            x: 100, // Magic Numbers
            y: 360 // Magic Numbers
        });
        utils.getCenterPoint(spinButton);
        spinButton.on('click', handleSpinClick);

        autoButton = new c.Sprite(ss, 'autoOut').set({
            name: 'autoButton',
            x: 98, // Magic Numbers
            y: 210 // Magic Numbers
        });
        utils.getCenterPoint(autoButton);
        autoButton.on('click', handleAutoClick);

        betButton = new c.Sprite(ss, 'betOut').set({
            name: 'betButton',
            x: 98, // Magic Numbers
            y: 510 // Magic Numbers
        });
        utils.getCenterPoint(betButton);
        betButton.on('click', handleBetClick);

        menuButton = new c.Sprite(ss, 'menuOut').set({
            name: 'menuButton',
            x: 98.5, // Magic Numbers
            y: 108.5 // Magic Numbers
        });
        utils.getCenterPoint(menuButton);
        menuButton.on('click', handleMenuClick);

        soundButton = new c.Sprite(ss, 'soundOut').set({
            name: 'soundButton',
            x: 98.5, // Magic Numbers
            y: 608.5 // Magic Numbers
        });
        utils.getCenterPoint(soundButton);
        soundButton.on('click', handleSoundClick);

        storage.changeState('sound', true);

        buttonsCache.addChild(autoButton, betButton, menuButton, soundButton);
        buttonsCache.cache(0, 0, utils.width, utils.height);
        buttonsContainer.addChild(spinButton, buttonsCache);
        stage.addChildAt(buttonsContainer, 1);
    }

    function changeSide(side) {
        const tl = new TimelineMax();
        if (side === 'right') {
            tl
                .to(buttonsContainer, 0.25, {x: utils.width})
                .to(buttonsContainer, 0, {x: -config.buttonsWidth})
                .to(buttonsContainer, 0.25, {x: config.buttonsLeftX});
        }
        if (side === 'left') {
            tl
                .to(buttonsContainer, 0.25, {x: -config.buttonsWidth})
                .to(buttonsContainer, 0, {x: utils.width})
                .to(buttonsContainer, 0.25, {x: config.buttonsX});
        }
    }

    function writeAutoplay() {
        spinButton.gotoAndStop('spinAuto');
        autoButton.gotoAndStop('autoStop');
        buttonsCache.updateCache();
        const autoCount = storage.read('autoCount');
        const autoText = new c.Text(autoCount, '70px Helvetica', '#90fd5a').set({
            name: 'autoText',
            textAlign: 'center',
            textBaseline: 'middle',
            x: spinButton.x,
            y: spinButton.y,
            shadow: new c.Shadow('#90fd5a', 0, 0, 8)
        });
        buttonsContainer.addChild(autoText);
    }

    function removeAutoplay() {
        spinButton.gotoAndStop('spinOut');
        autoButton.gotoAndStop('autoOut');
        buttonsCache.updateCache();
        const autoText = buttonsContainer.getChildByName('autoText');
        buttonsContainer.removeChild(autoText);
    }

    function updateAutoplay() {
        const autoCount = storage.read('autoCount');
        if (buttonsContainer.getChildByName('autoText')) {
            const autoText = buttonsContainer.getChildByName('autoText');
            autoText.text = autoCount;
        }
    }

    function endRoll() {
        if (storage.readState('autoplay') === 'started') return;
        spinButton.gotoAndStop('spinOut');
        menuButton.gotoAndStop('menuOut');
        autoButton.gotoAndStop('autoOut');
        betButton.gotoAndStop('betOut');
        buttonsCache.updateCache();
        TweenMax.to(spinButton, 0.2, {rotation: 0});
    }

    function fastRoll() {
        if (storage.readState('autoplay') === 'started') return;
        spinButton.gotoAndStop('spinOn');
    }

    function startRoll() {
        if (storage.readState('autoplay') === 'started') return;
        menuButton.gotoAndStop('menuOff');
        autoButton.gotoAndStop('autoOff');
        betButton.gotoAndStop('betOff');
        buttonsCache.updateCache();
    }

    function changeVisibility() {
        buttonsContainer.visible = !buttonsContainer.visible;
    }

    return {
        start,
        drawButtons,
        changeVisibility,
        changeSide,
        writeAutoplay,
        updateAutoplay,
        removeAutoplay,
        startRoll,
        fastRoll,
        endRoll
    };

})();
