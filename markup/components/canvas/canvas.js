import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';

export let canvas = (function () {

    let config;
    const defaultConfig = {
        mouseOver: 10,
        leftToRight: 150
    };
    const c = createjs;

    function start(configObj) {

        config = configObj || defaultConfig;

    }

    function initStage() {

        // Определяем сцену
        const stage = new c.Stage('stage');
        stage.snapToPixelEnabled = true;
        stage.enableMouseOver(config.mouseOver);

        // Включаем heartbeet
        c.Ticker.timingMode = c.Ticker.RAF;
        c.Ticker.on('tick', stage);

        // Сцена создана
        storage.write('stage', stage);
        events.trigger('canvas:stage', stage);

    }

    function fullScreen(e) {

        e = e || document.querySelector('#game');
        /* eslint-disable */
        e.requestFullScreen ? e.requestFullScreen() : e.mozRequestFullScreen ? e.mozRequestFullScreen() : e.webkitRequestFullScreen && e.webkitRequestFullScreen();
        /* eslint-enable */
        iosFullScreenHack();

    }

    function iosFullScreenHack() {

        if ($('html').hasClass('ios') || $('html').hasClass('iphone')) {
            $(document).bind('touchmove', false);
        }
        $(function () {
            if (!$('html').hasClass('ios') || !$('html').hasClass('iphone')) {
                $('h1').hide();
            }
        });

    }

    function changeSide(side) {

        let delta;
        const stage = storage.read('stage');
        const mainContainer = storage.read('mainContainer');
        const balanceContainer = stage.getChildByName('balanceContainer');
        const balanceTextContainer = balanceContainer.getChildByName('balanceTextContainer');

        switch (side) {
            case 'right':
                delta = `+=${config.leftToRight}`;
                storage.changeState('side', 'right');
                break;
            case 'left':
                delta = `-=${config.leftToRight}`;
                storage.changeState('side', 'left');
                break;
            default:
                return;
        }

        balanceContainer.uncache();
        TweenMax.to([mainContainer, balanceTextContainer], 0.5, {x: delta, onComplete: () => {
            balanceContainer.cache(0, 0, utils.width, utils.height);
        }});

    }

    return {
        start,
        initStage,
        changeSide,
        fullScreen
    };

})();
