import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';
import { effects } from 'components/effects/effects';

export let config;

export let bg = (function () {

    let bgContainer;
    let mainContainer;

    const c = createjs;
    const defaultConfig = {
        gameDeltaWidth: 20,
        gameDeltaHeight: 80,
        desktopScale: 0.86
    };

    function start(configObj) {

        config = configObj || defaultConfig;

    }

    function drawMainBG() {

        const stage = storage.read('stage');
        const loader = storage.read('loadResult');

        // bgContainer
        bgContainer = new c.Container().set({name: 'bgContainer'});
        storage.write('bgContainer', bgContainer);

        const mainBG = new c.Bitmap(loader.getResult('mainBG')).set({name: 'mainBG'});

        // Если в бекграунде несколько элементов, то лучше кешировать контейнер
        bgContainer.addChild(mainBG);

        // mainContainer
        if (storage.read('isMobile')) {

            mainContainer = new c.Container().set({
                name: 'mainContainer',
                x: 75, // Magic Numbers
                y: 5 // Magic Numbers
            });
            storage.write('mainContainer', mainContainer);

        } else {

            mainContainer = new c.Container().set({
                name: 'mainContainer',
                x: 350, // Magic Numbers
                y: 10, // Magic Numbers
                scaleX: config.desktopScale,
                scaleY: config.desktopScale
            });
            storage.write('mainContainer', mainContainer);

        }

        const gameMachine = new c.Bitmap(loader.getResult('gameMachine')).set({ name: 'gameMachine' });

        const gameBG = new c.Bitmap(loader.getResult('gameBG')).set({
            name: 'gameBG',
            x: config.gameDeltaWidth,
            y: config.gameDeltaHeight
        });

        mainContainer.addChild(gameBG, gameMachine);
        stage.addChildAt(bgContainer, mainContainer, 0);

        if (storage.read('isMobile')) {

            events.trigger('bg:changeSide', 'left');
            storage.changeState('side', 'left');

        } else {

            events.trigger('bg:changeSide', 'right');
            storage.changeState('side', 'right');

        }

        effects.drawFonar();

        events.trigger('bg:main');

    }

    function drawFreeSpinsBG() {



    }

    return {
        start,
        drawMainBG,
        drawFreeSpinsBG
    };

})();
