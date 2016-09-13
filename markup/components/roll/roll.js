/* eslint-disable no-undef */
/* eslint-disable no-use-before-define*/
const roll = (function () {

    // Consts
    const c = createjs;
    const elementWidth = utils.elementWidth; // Может поменяться от игры к игре
    const elementHeight = utils.elementHeight; // Может поменяться от игры к игре
    const columnsNumber = 5; // Может поменяться от игры к игре
    const rowsNumber = 5; // Может поменяться от игры к игре
    const longRowsNumber = 30; // Может поменяться от игры к игре

    // Container
    const gameContainer = new c.Container();

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

    function initGameContainer(x, y) {
        gameContainer.set({
            name: 'gameContainer',
            x, // Смещение gameContainer и маски должны совпадать
            y // Смещение gameContainer и маски должны совпадать
        });
        const stage = storage.read('stage');
        const gameMask = new createjs.Shape();
        gameMask.graphics.drawRect(x, y, utils.gameWidth, utils.gameHeight); // Смещение gameContainer и маски должны совпадать
        gameContainer.mask = gameMask;
        const fg = stage.getChildByName('fgContainer');
        stage.addChildAt(gameContainer, stage.getChildIndex(fg));
    }

    function getScreenData(inds, wls) {
        let i, j, screen = [];
        let wheelsLength = +wls[0].length; // Если колеса будут разной длинны поломается
        for (i = 0; i < columnsNumber; i++) {
            screen[i] = [];
            for (j = 0; j < rowsNumber; j++) {
                if (inds[i] === 0 && j === 0) { // Проверка на верхний край
                    screen[i][j] = wls[i][wheelsLength - 1];
                } else if (inds[i] > (wheelsLength - 4)) { // Проверка на нижний край
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

    function createColumn(startArray, endArray) {
        const loader = storage.read('loadResult');
        const ss = loader.getResult('new_elements');
        const column = new c.SpriteContainer(ss);
        for (let i = 0; i < longRowsNumber; i++) {
            if (i < rowsNumber) {
                const elementNumber = endArray[i];
                const element = new c.Sprite(ss, `${elementNumber}-n`).set({
                    name: 'gameElement' + i,
                    x: elementWidth / 2,
                    y: elementHeight * i + elementHeight / 2,
                    regX: 163 + 5,
                    regY: 145
                });
                element.snapToPixel = true;
                column.addChild(element);
            } else if (i >= longRowsNumber - rowsNumber) {
                const elementNumber = startArray[i - longRowsNumber + rowsNumber];
                const element = new c.Sprite(ss, `${elementNumber}-n`).set({
                    name: 'gameElement' + i,
                    x: elementWidth / 2,
                    y: elementHeight * i + elementHeight / 2,
                    regX: 163 + 5,
                    regY: 145
                });
                element.snapToPixel = true;
                column.addChild(element);
            } else {
                const elementNumber = Math.ceil(Math.random() * 10);
                const element = new c.Sprite(ss, `${elementNumber}-b`).set({
                    name: 'gameElement' + i,
                    x: elementWidth / 2,
                    y: elementHeight * i + elementHeight / 2,
                    regX: 163 + 5,
                    regY: 145
                });
                element.snapToPixel = true;
                column.addChild(element);
            }
            column.set({
                y: -elementHeight * (longRowsNumber - 4)
            });
        }
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
                y: -elementHeight * (longRowsNumber - 4)
            });
        }
    }

    function drawScreen(currentScreenData, nextScreenData) {
        const loader = storage.read('loadResult');
        if (typeof columns === 'undefined') { // Отображение первого экрана
            initGameContainer(100, 89);
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
        } else { // Отображение новых экранов
            columns.forEach((column, i) => {
                updateColumn(currentScreenData[i], nextScreenData[i], column);
            });
        }
    }

    function startRoll() {
        const loader = storage.read('loadResult');
        const currentBalance = storage.read('currentBalance');
        const sessionID = storage.read('sessionID');
        const betValue = currentBalance.betValue;
        const coinsValue = currentBalance.coinsValue * 100;
        utils.request('_Roll/', `${sessionID}/${betValue}/${coinsValue}`)
            .then((response) => {
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
                    setTimeout(function () {
                        storage.changeState('fastRoll', true);
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
                    storage.write('freeRollResponse', response);
                }
                if (response.Type === 'MultiplierBonus') {
                    storage.changeState('fsMultiplier', true);
                    storage.write('fsMultiplierResponse', response);
                }
                storage.write('rollResponse', response);
            });
    }

    function fastRoll() {
        if (storage.readState('fastRoll')) {
            rollAnimation.timeScale(2.5);
            storage.changeState('lockedRoll', true);
        }
    }

    function endRoll() {
        utils.request('_Ready/', storage.read('sessionID'))
            .then((response) => {
                storage.changeState('roll', 'ended');
                storage.changeState('fastRoll', false);
                storage.changeState('lockedRoll', false);
            });
    }

    function checkState(state) {
        if (state === 'bgDraw' && storage.readState('bgDraw') === 'main') {
            initScreen();
        }
        if (state === 'fastRoll' && storage.readState('fastRoll') === 'enabled') {
            fastRoll();
        }
        if (state === 'lowBalance' && storage.readState('lowBalance')) {
            rollAnimation.stop();
        }
    }

    events.on('changeState', checkState);

    return {
        startRoll,
        fastRoll
    };
})();