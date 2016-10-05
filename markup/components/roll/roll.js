import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';
import { noConnect } from 'components/noConnect/noConnect';

export let roll = (function () {

    // Consts
    const isNoConnect = storage.read('isNoConnect');

    const c = createjs;
    const elementWidth = utils.elementWidth;
    const elementHeight = utils.elementHeight;
    let columnsNumber;
    let rowsNumber;
    let longRowsNumber;

    let config;
    const defaultConfig = {
        columnsNumber: 5,
        rowsNumber: 5,
        longRowsNumber: 30,
        gameX: 77,
        gameY: 84,
        elementHalfWidth: 134,
        elementHalfHeight: 124
    };

    // Container
    const gameContainer = new c.Container();
    const gameTopContainer = new c.Container();

    function start(configObj) {
        config = configObj || defaultConfig;
        columnsNumber = config.columnsNumber;
        rowsNumber = config.rowsNumber;
        longRowsNumber = config.longRowsNumber;
    }

    const rollData = {};
    let columns;
    let shadows;
    let rollAnimation;

    function initScreen(data) {
        const randomArray = [];
        const wheels = storage.read('wheels');
        wheels.forEach((column) => {
            const randomNumber = Math.round(Math.random() * (wheels.length - 1));
            randomArray.push(randomNumber);
        });
        rollData.currentScreen = getScreenData(randomArray, wheels);
        drawScreen(rollData.currentScreen, rollData.currentScreen);
    }

    function initGameContainer() {
        gameContainer.set({
            name: 'gameContainer',
            x: config.gameX,
            y: config.gameY
        });
        const stage = storage.read('stage');
        const gameMask = new createjs.Shape();
        gameMask.graphics.drawRect(config.gameX, config.gameY, utils.gameWidth, utils.gameHeight);
        gameContainer.mask = gameMask;
        const fg = stage.getChildByName('fgContainer');
        stage.addChildAt(gameContainer, stage.getChildIndex(fg));
    }

    function initTopGameContainer() {
        gameTopContainer.set({
            name: 'gameTopContainer',
            x: config.gameX,
            y: config.gameY
        });
        const stage = storage.read('stage');
        const fg = stage.getChildByName('fgContainer');
        stage.addChildAt(gameTopContainer, stage.getChildIndex(fg) + 1);
    }

    function getScreenData(inds, wls) {
        let i, j, screen = [];
        let wheelsLength = +wls[0].length; // Если колеса будут разной длинны поломается
        for (i = 0; i < columnsNumber; i++) {
            screen[i] = [];
            for (j = 0; j < rowsNumber; j++) {
                if (inds[i] === 0 && j === 0) { // Проверка на верхний край
                    screen[i][j] = wls[i][wheelsLength - 1];
                } else if (inds[i] > (wheelsLength - config.rowsNumber + 1)) { // Проверка на нижний край
                    if (wls[i][inds[i] + j - 1]) {
                        screen[i][j] = wls[i][inds[i] + j - 1];
                    } else {
                        screen[i][j] = wls[i][inds[i] + j - 1 - wheelsLength];
                    }
                } else {
                    screen[i][j] = wls[i][inds[i] + j - 1];
                }
            }
        }
        return screen;
    }

    function createElement(elementNumber, ss, mode, i, column) {
        const element = new c.Sprite(ss, `${elementNumber}-${mode}`).set({
            name: 'gameElement' + i,
            x: elementWidth / 2,
            y: elementHeight * i + elementHeight / 2,
            regX: config.elementHalfWidth,
            regY: config.elementHalfHeight,
            posY: i - 1
        });
        element.snapToPixel = true;
        return element;
    }

    function createColumn(startArray, endArray) {
        const loader = storage.read('loadResult');
        const ss = loader.getResult('new_elements');
        const column = new createjs.Container();
        for (let i = 0; i < longRowsNumber; i++) {
            let element;
            if (i < rowsNumber) {
                const elementNumber = endArray[i];
                element = createElement(elementNumber, ss, 'n', i, column);
            } else if (i >= longRowsNumber - rowsNumber) {
                const elementNumber = startArray[i - longRowsNumber + rowsNumber];
                element = createElement(elementNumber, ss, 'n', i, column);
            } else {
                const elementNumber = Math.ceil(Math.random() * 10);
                element = createElement(elementNumber, ss, 'b', i, column);
            }
            column.addChild(element);
        }
        column.set({
            y: -elementHeight * (longRowsNumber - config.rowsNumber + 1)
        });
        return column;
    }

    function updateColumn(startArray, endArray, column) {
        const loader = storage.read('loadResult');
        const ss = loader.getResult('new_elements');
        for (let i = 0; i < longRowsNumber; i++) {
            if (i < rowsNumber) {
                const elementNumber = endArray[i];
                const element = column.getChildByName(`gameElement${i}`);
                element.gotoAndStop(`${elementNumber}-n`);
            } else if (i >= longRowsNumber - rowsNumber) {
                const elementNumber = startArray[i - longRowsNumber + rowsNumber];
                const element = column.getChildByName(`gameElement${i}`);
                element.gotoAndStop(`${elementNumber}-n`);
            } else {
                const elementNumber = Math.ceil(Math.random() * 10);
                const element = column.getChildByName(`gameElement${i}`);
                element.gotoAndStop(`${elementNumber}-b`);
            }
            column.set({
                y: -elementHeight * (longRowsNumber - config.rowsNumber + 1)
            });
        }
    }

    function drawScreen(currentScreenData, nextScreenData) {
        const loader = storage.read('loadResult');
        if (typeof columns === 'undefined') { // Отображение первого экрана
            initGameContainer();
            columns = [];
            shadows = [];
            for (let i = 0; i < columnsNumber; i++) {
                columns[i] = createColumn(currentScreenData[i], nextScreenData[i]).set({
                    x: elementWidth * i,
                    name: 'gameColumn' + i
                });
                shadows[i] = new createjs.Bitmap(loader.getResult('gameShadow')).set({
                    x: (elementWidth + 2) * i,
                    y: 0,
                    alpha: 0,
                    name: 'gameShadow' + i
                });
                gameContainer.addChild(columns[i], shadows[i]);
            }
            storage.changeState('firstScreen', 'done');
            events.trigger('roll:firstScreen');
            // TODO: createTopGameController
            initTopGameContainer();
            let topContainer = [];
            const ss = loader.getResult('new_elements');
            for (let indColumn = 0; indColumn < columnsNumber; indColumn++) {
                topContainer[indColumn] = [];
                for (let indRow = 0; indRow < 3; indRow++) {
                    let _element = topContainer[indColumn][indRow] = createElement(1, ss, 'n', indRow, gameTopContainer);
                    _element.set({
                        x: _element.x + elementWidth * indColumn
                    });
                    _element.visible = false;
                    gameTopContainer.addChild(_element);
                }
            }
            storage.write('gameTopContainer', gameTopContainer);
            storage.write('gameTopElements', topContainer);
        } else { // Отображение новых экранов
            columns.forEach((column, i) => {
                updateColumn(currentScreenData[i], nextScreenData[i], column);
            });
        }
    }

    function _startRollSuccessful(response) {
        if (response.ErrorMessage) {
            utils.showPopup(response.ErrorMessage);
            return;
        }
        if (response.Mode === 'root') { // Стандартный режим
            if (storage.readState('mode') !== 'normal') {
                storage.changeState('mode', 'normal');
            }
            createjs.Sound.play('spinSound');
            createjs.Sound.play('barabanSound');
            rollData.nextScreen = getScreenData(response.Indexes, storage.read('wheels'));
            drawScreen(rollData.currentScreen, rollData.nextScreen);
            rollAnimation = new TimelineMax();
            rollAnimation.staggerTo(columns, 2, {y: -utils.elementHeight, ease: Back.easeInOut.config(0.75)}, 0.1, '+=0', endRoll)
                .staggerTo(shadows, 1, {alpha: 1, ease: Power1.easeOut}, 0.1, 0)
                .staggerTo(shadows, 1, {alpha: 0, ease: Power1.easeIn}, 0.1, '-=1');
            if (storage.readState('fastSpinSetting')) {
                rollAnimation.timeScale(2);
            }
            rollData.currentScreen = rollData.nextScreen;
            storage.changeState('roll', 'started');
            events.trigger('roll:started');
            setTimeout(function () {
                storage.changeState('fastRoll', true);
                events.trigger('roll:fastRoll', true);
            }, 500);
        } else if (response.Mode === 'fsBonus') { // Режим Фри-Спинов
            if (storage.readState('mode') !== 'fsBonus') {
                storage.changeState('mode', 'fsBonus');
            }
            rollData.nextScreen = getScreenData(response.Indexes, storage.read('fsWheels'));
            drawScreen(rollData.currentScreen, rollData.nextScreen);
            rollAnimation = new TimelineMax();
            rollAnimation.staggerTo(columns, 2, {y: -utils.elementHeight, ease: Back.easeInOut.config(0.75)}, 0.1, '+=0', endRoll)
                .staggerTo(shadows, 1, {alpha: 1, ease: Power1.easeOut}, 0.1, 0)
                .staggerTo(shadows, 1, {alpha: 0, ease: Power1.easeIn}, 0.1, '-=1');
            if (storage.readState('fastSpinSetting')) {
                rollAnimation.timeScale(2);
            }
            rollData.currentScreen = rollData.nextScreen;
            storage.changeState('roll', 'started');
            events.trigger('roll:started');
            storage.write('freeRollResponse', response);
        }
        if (response.Type === 'MultiplierBonus') {
            storage.changeState('fsMultiplier', true);
            storage.write('fsMultiplierResponse', response);
            events.trigger('roll:fsMultiplier', true);
        }
        storage.write('rollResponse', response);
    }

    function startRoll() {
        const loader = storage.read('loadResult');
        const currentBalance = storage.read('currentBalance');
        const sessionID = storage.read('sessionID');
        const betValue = currentBalance.betValue;
        const coinsValue = currentBalance.coinsValue * 100;

        if (isNoConnect) {
            let response = JSON.parse(noConnect._Roll);
            _startRollSuccessful(response);
        } else {
            utils.request('_Roll/', `${sessionID}/${betValue}/${coinsValue}`)
                .then((response) => {
                    // console.log('req; _Roll', JSON.stringify(response) );
                    _startRollSuccessful(response);
                });
        }
    }

    function fastRoll() {
        if (storage.readState('fastRoll')) {
            rollAnimation.timeScale(2.5);
            storage.changeState('lockedRoll', true);
        }
    }

    function _endRollSuccessful(response) {
        events.trigger('roll:ended');
        storage.changeState('roll', 'ended');
        storage.changeState('fastRoll', false);
        storage.changeState('lockedRoll', false);
    }

    function endRoll() {
        if (isNoConnect) {
            let response = JSON.parse(noConnect._Ready);
            _endRollSuccessful(response);
        } else {
            utils.request('_Ready/', storage.read('sessionID'))
                .then(_endRollSuccessful);
        }

    }

    return {
        start,
        initScreen,
        startRoll,
        fastRoll
    };
})();
