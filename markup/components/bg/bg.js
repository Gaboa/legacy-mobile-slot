// import CreateJS
// import TimelineMax
import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';

export let bg = (function () {

    let config;
    const defaultConfig = {
        bottomLineHeight: 30,
        topLineHeight: 40
    };

    const c = createjs;
    const w = utils.width;
    const h = utils.height;

    function start(configObj) {
        config = configObj || defaultConfig;
    }

    function drawBG() {
        const stage = storage.read('stage');
        const loader = storage.read('loadResult');

        const bgContainer = new c.Container().set({name: 'bgContainer'});
        const fgContainer = new c.Container().set({name: 'fgContainer'});
        const mainBG = new c.Bitmap(loader.getResult('newBGLight')).set({name: 'mainBG'});
        const gameBG = new c.Sprite(loader.getResult('bg'), 'gameBG').set({name: 'gameBG'});
        const gameMachine = new c.Bitmap(loader.getResult('newGameMachine')).set({
            name: 'gameMachine',
            x: 30, // Magic Numbers
            y: 5 // Magic Numbers
        });
        const logoNecro = new c.Bitmap(loader.getResult('logoNecro')).set({
            name: 'logoNecro',
            x: 325, // Magic Numbers
            y: 15 // Magic Numbers
        });

        const winNumbersContainer = new c.Container().set({name: 'winNumbersContainer'});

        let winNumPrefab = new c.Sprite(loader.getResult('winAllNumbers')).set({
            name: 'winAllNumbers',
            x: 24, // Magic Numbers
            y: 106, // Magic Numbers
            visible: false
        });

        const winNumCount = winNumPrefab.spriteSheet.getNumFrames();
        let winNumArr = [];
        for (let i = 0; i < winNumCount; i++) {
            winNumPrefab.gotoAndStop(i);
            winNumArr[i] = [
                winNumPrefab.clone(),
                winNumPrefab.clone().set({
                    x: 1045, // Magic Numbers
                    y: 106 // Magic Numbers
                })
            ];
            winNumbersContainer.addChild(winNumArr[i][0], winNumArr[i][1]);
        }

        // Это нужно перенести в модуль баланса или оставить здесь
        const footerBgDown = new c.Shape().set({name: 'footerBgDown'});
        const footerBgUp = new c.Shape().set({name: 'footerBgUp'});
        footerBgDown.graphics.beginFill('rgba(0, 0, 0)').drawRect(0, h - config.bottomLineHeight, w, config.bottomLineHeight);
        footerBgUp.graphics.beginFill('rgba(0, 0, 0, 0.6)').drawRect(0, h - config.bottomLineHeight - config.topLineHeight, w, config.topLineHeight);

        // Это нужно перенести в модуль кнопок либо отдельный модуль
        const home = new c.Bitmap(loader.getResult('home')).set({
            name: 'homeButton',
            x: 15, // Magic Numbers
            y: h - 63 // Magic Numbers
        });
        home.on('click', function () {
            utils.request('_Logout/', storage.read('sessionID'))
            .then((response) => {
                console.log('Logout response:', response);
            });
            window.history.back();
        });


        bgContainer.addChild(mainBG, gameBG, footerBgUp, footerBgDown, home);
        fgContainer.addChild(gameMachine, winNumbersContainer, logoNecro);
        stage.addChildAt(bgContainer, fgContainer, 0);

        // TODO: Разобраться с кешированием бекграундов
        // TODO: Перенасти отрисовку нижних полосок меню в модуль balance

        storage.write('winNumbersArr', winNumArr);
        storage.changeState('bgDraw', 'main');
        events.trigger('bg:main');
        storage.changeState('side', 'left');
        events.trigger('bg:changeSide', 'left');
    }

    function changeSide(side) {
        const stage = storage.read('stage');
        const fg = stage.getChildByName('fgContainer');
    }

    return {
        start,
        drawBG,
        changeSide
    };

})();
