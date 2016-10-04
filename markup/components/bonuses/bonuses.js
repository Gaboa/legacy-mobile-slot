import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';
import { win } from 'components/win/win';
import { balance } from 'components/balance/balance';

// /* eslint-disable */
export let bonuses = (function () {

    let currentLevel = 1;
    let bonusData;
    let firstCashWin;
    let totalCount;
    let firstWin;
    const c = createjs;
    const w = utils.width;
    const h = utils.height;

    let totalWinText;
    let totalWinSum;

    function initBonusLevel() {
        const loader = storage.read('loadResult');
        const stage = storage.read('stage');
        let initContainer = new c.Container().set({
            name: 'initContainer'
        });
        let initBG = new c.Bitmap(loader.getResult('bonusPerehodBG')).set({
            name: 'initBG',
            alpha: 0
        });
        let initYouWin = new c.Bitmap(loader.getResult('youWin')).set({
            name: 'initText',
            x: (1280 - 1277 * 0.7) / 2,
            y: 20,
            scaleX: 0.7,
            scaleY: 0.7
        });
        let initBonusLevel = new c.Bitmap(loader.getResult('bonusLevel')).set({
            name: 'initBonusLevel',
            x: (1280 - 1100 * 0.7) / 2,
            y: 250,
            scaleX: 0.7,
            scaleY: 0.7
        });
        let initLiza = new c.Bitmap(loader.getResult('lizaBonusPerehod')).set({
            x: -50,
            y: 150,
            scaleX: 0.7,
            scaleY: 0.7
        });
        let initButton = new createjs.Bitmap(loader.getResult('But')).set({
            name: 'initButton',
            x: (1280 - 396) / 2,
            y: 575
        });
        initContainer.addChild(initBG, initBonusLevel, initYouWin, initLiza, initButton);

        // c.Tween.get(initContainer)
        //     .to({alpha: 1}, 500)
        //     .call(
        //         function () {
        //             currentLevel = 1;
        //             win.cleanWin();
        //             getBonusLevel();
        //         }
        //     );
        createjs.Sound.stop('ambientSound');
        createjs.Sound.play('bonusPerehodSound', {loop: -1});
        let tl = new TimelineMax();
        tl.to(initBG, 0.4, {alpha: 1})
            .call(function () {
                currentLevel = 1;
                win.cleanWin();
                getBonusLevel();
            })
            .from(initYouWin, 0.4, {y: -400, alpha: 0}, '-=0.2')
            .from(initBonusLevel, 0.4, {y: 900, alpha: 0}, '-=0.2')
            .from(initLiza, 0.4, {x: -400, alpha: 0}, '-=0.2')
            .from(initButton, 0.4, {alpha: 0}, '-=0.2');
        initContainer.on('click', function () {
            c.Tween.get(initContainer)
                .to({alpha: 0}, 300)
                .call(function () {
                    stage.removeChild(initContainer);
                    createjs.Sound.stop('bonusPerehodSound');
                    createjs.Sound.play('doorsAmbientSound', {loop: -1});
                });
        });

        stage.addChild(initContainer);
    }

    function drawBonusLevel(level, data) {
        let clickCounter = 0;
        const loader = storage.read('loadResult');
        const stage = storage.read('stage');
        if (stage.getChildByName('bonusContainer')) {
            stage.removeChild(stage.getChildByName('bonusContainer'));
            stage.removeChild(stage.getChildByName('winText'));
        }
        let bonusContainer = new createjs.Container().set({
            name: 'bonusContainer'
        });
        let bonusBG = new createjs.Bitmap(loader.getResult('bonusBG_' + level)).set({
            name: 'bonusBG'
        });

        let balanceContainer = stage.getChildByName('balanceContainer');
        let balanceTextContainer = balanceContainer.getChildByName('balanceTextContainer');

        if (!balanceTextContainer.getChildByName('totalWinText')) {
            totalWinText = new createjs.Text('Total Win:', '24px Helvetica', '#dddddd').set({
                name: 'totalWinText',
                x: 85,
                y: 658,
                textAlign: 'center'
            });
            if (storage.read('bonusResponse').CurrentWinCoins && level !== 1) {
                totalCount = storage.read('bonusResponse').CurrentWinCoins + firstWin + '';
            } else {
                totalCount = storage.read('rollResponse').TotalWinCoins + '';
                firstWin = +totalCount;
                firstCashWin = +storage.read('currentBalance').winCash;
            }
            totalWinSum = new createjs.Text(totalCount, '24px Helvetica', '#e8b075').set({
                name: 'totalWinSum',
                x: 85,
                y: 658,
                textAlign: 'center',
                shadow: new c.Shadow('#e8b075', 0, 0, 15)
            });
            totalWinText.x = utils.width / 2 - 10 - totalWinText.getMeasuredWidth();
            totalWinSum.x = totalWinText.x + 20 + totalWinText.getMeasuredWidth() / 2 + totalWinSum.getMeasuredWidth() / 2;
        } else {
            totalCount = storage.read('bonusResponse').CurrentWinCoins + firstWin + '';
            totalWinSum.text = totalCount;
            balanceContainer.updateCache();

        }

        var footerBgDown = new c.Shape().set({
            name: 'footerBgDown'
        });
        footerBgDown.graphics.beginFill('rgba(0, 0, 0)').drawRect(0, h - 30, w, 30);
        if (storage.read('device') === 'desktop') {
            if (!balanceTextContainer.getChildByName('totalWinText')) {
                let coinsSum = balanceTextContainer.getChildByName('coinsSum');
                let betSum = balanceTextContainer.getChildByName('betSum');
                coinsSum.visible = betSum.visible = false;
                let footerBgUp = new c.Shape().set({ name: 'footerBgUp' });
                footerBgUp.graphics.beginFill('rgba(0, 0, 0, 0.6)').drawRect(0, h - 70, w, 40);
                balanceTextContainer.addChild(footerBgUp, totalWinText, totalWinSum);
                balanceContainer.updateCache();
            }
        } else if (storage.read('device') === 'mobile') {
            if (!balanceTextContainer.getChildByName('totalWinText')) {
                let coinsText = balanceTextContainer.getChildByName('coinsSumText');
                let betText = balanceTextContainer.getChildByName('betSumText');
                let coinsSum = balanceTextContainer.getChildByName('coinsSum');
                let betSum = balanceTextContainer.getChildByName('betSum');
                coinsText.visible = betText.visible = coinsSum.visible = betSum.visible = false;
                balanceTextContainer.addChild(totalWinText, totalWinSum);
                balanceContainer.updateCache();
            }
        }
        // bonusBalance.addChild(totalWinText, totalWinSum);
        // balance.writeCashBalance(bonusBalance);
        if (data.BonusEnd) {
            var bonusWall = new createjs.Bitmap(loader.getResult('bonusFail_' + level)).set({
                name: 'bonusWall'
            });
        } else {
            var bonusWall = new createjs.Bitmap(loader.getResult('bonusWin_' + level)).set({
                name: 'bonusWall'
            });
        }
        let doorsContainer = new createjs.Container().set({
            name: 'doorsContainer'
        });
        if (level === 1) {
            let door_1 = new createjs.Bitmap(loader.getResult('bonusDoor_1_1'));
            let door_2 = new createjs.Bitmap(loader.getResult('bonusDoor_1_2'));
            let door_3 = new createjs.Bitmap(loader.getResult('bonusDoor_1_3'));
            let door_4 = new createjs.Bitmap(loader.getResult('bonusDoor_1_4'));
            let door_5 = new createjs.Bitmap(loader.getResult('bonusDoor_1_5'));
            let darkness = new createjs.Shape();
            darkness.graphics.beginFill('#000').drawRect(0, 0, 140, 400);
            door_1.set({
                x: 274,
                y: 222
            });
            let darkness_1 = darkness.clone().set({
                x: door_1.x,
                y: door_1.y
            });
            door_2.set({
                x: 425,
                y: 236
            });
            let darkness_2 = darkness.clone().set({
                x: door_2.x,
                y: door_2.y
            });
            door_3.set({
                x: 568,
                y: 237
            });
            let darkness_3 = darkness.clone().set({
                x: door_3.x,
                y: door_3.y
            });
            door_4.set({
                x: 718,
                y: 238
            });
            let darkness_4 = darkness.clone().set({
                x: door_4.x,
                y: door_4.y
            });
            door_5.set({
                x: 864,
                y: 220
            });
            let darkness_5 = darkness.clone().set({
                x: door_5.x,
                y: door_5.y
            });

            function setClickEvent(door, darkness) {
                door.on('click', function () {
                    createjs.Sound.play('door1Sound');
                    if (clickCounter < 1) {
                        clickCounter++;
                        createjs.Tween.get(door)
                        .to({y: door.y - 250}, 400);
                        createjs.Tween.get(darkness)
                        .to({alpha: 0}, 500);
                        if (data.CurrentValue !== 'Exit') {
                            storage.read('currentBalance').winCash = (firstCashWin * 100 + storage.read('bonusResponse').CurrentWinCents) / 100;
                            showBonusWin(data.CurrentValue);
                        } else {
                            setTimeout(function () {
                                events.trigger('finishBonusLevel');
                            }, 750);
                        }
                    }
                });
            }

            setClickEvent(door_1, darkness_1);
            setClickEvent(door_2, darkness_2);
            setClickEvent(door_3, darkness_3);
            setClickEvent(door_4, darkness_4);
            setClickEvent(door_5, darkness_5);

            doorsContainer.addChild(darkness_1, door_1, darkness_2, door_2, darkness_3, door_3, darkness_4, door_4, darkness_5, door_5);
            bonusContainer.addChild(bonusWall, doorsContainer, bonusBG);

        } else if (level === 2 || level === 3 || level === 4) {

            let ss = loader.getResult('doorSprite_' + level);
            let door_1 = new createjs.Sprite(ss, 'door_1').set({
                x: 270,
                y: 227
            });
            let door_2 = new createjs.Sprite(ss, 'door_2').set({
                x: 422,
                y: 237,
                scaleX: 0.96,
                scaleY: 0.94
            });
            let door_3 = new createjs.Sprite(ss, 'door_3').set({
                x: 572,
                y: 238,
                scaleX: 0.93,
                scaleY: 0.93
            });
            let door_4 = new createjs.Sprite(ss, 'door_4').set({
                x: 716,
                y: 232,
                scaleX: 0.98,
                scaleY: 0.96
            });
            let door_5 = new createjs.Sprite(ss, 'door_5').set({
                x: 858,
                y: 217,
                scaleX: 1.02,
                scaleY: 1.05
            });

            door_1.stop();
            door_2.stop();
            door_3.stop();
            door_4.stop();
            door_5.stop();

            doorSpriteClick(door_1);
            doorSpriteClick(door_2);
            doorSpriteClick(door_3);
            doorSpriteClick(door_4);
            doorSpriteClick(door_5);

            function doorSpriteClick(door) {
                door.on('click', function () {
                    if (level === 2) {
                        createjs.Sound.play('door2Sound');
                    } else if (level === 3) {
                        createjs.Sound.play('door3Sound');
                        if (data.BonusEnd) {
                            createjs.Sound.play('smehSound');
                        }
                    } else if (level === 4) {
                        createjs.Sound.play('door4Sound');
                    }
                    if (clickCounter < 1) {
                        clickCounter++;
                        door.play();
                        if (data.CurrentValue !== 'Exit') {
                            storage.read('currentBalance').winCash = (firstCashWin * 100 + storage.read('bonusResponse').CurrentWinCents) / 100;
                            showBonusWin(data.CurrentValue);
                        } else {
                            setTimeout(function () {
                                events.trigger('finishBonusLevel');
                            }, 750);
                        }
                        door.on('animationend', function functionName() {
                            door.stop();
                        });
                    }
                });
            }

            doorsContainer.removeAllChildren();
            doorsContainer.addChild(door_1, door_2, door_3, door_4, door_5);
            bonusContainer.addChild(bonusWall, doorsContainer, bonusBG);
            stage.addChild(bonusContainer);

        } else if ( level === 5 ) {
            let ss1 = loader.getResult('doorSprite_5_1');
            let ss3 = loader.getResult('doorSprite_5_3');
            let ss5 = loader.getResult('doorSprite_5_5');
            let door_1 = new createjs.Sprite(ss1, 'open').set({
                x: 270,
                y: 355
            });
            let door_2 = new createjs.Sprite(ss1).set({
                x: 415,
                y: 355
            });
            let door_3 = new createjs.Sprite(ss3).set({
                x: 564,
                y: 355
            });
            let door_4 = new createjs.Sprite(ss5).set({
                x: 715,
                y: 355
            });
            let door_5 = new createjs.Sprite(ss5).set({
                x: 865,
                y: 355
            });

            door_1.stop();
            door_2.stop();
            door_3.stop();
            door_4.stop();
            door_5.stop();

            handleLastDoor(door_1);
            handleLastDoor(door_2);
            handleLastDoor(door_3);
            handleLastDoor(door_4);
            handleLastDoor(door_5);

            function handleLastDoor(door) {
                door.on('click', function () {
                    if (clickCounter < 1) {
                        createjs.Sound.play('door5Sound');
                        clickCounter++;
                        door.play();
                        if (data.CurrentValue !== 'Exit') {
                            storage.read('currentBalance').winCash = (firstCashWin * 100 + storage.read('bonusResponse').CurrentWinCents) / 100;
                            let light = new createjs.Bitmap(loader.getResult('bonusLight')).set({
                                x: door.x,
                                y: door.y,
                                regX: 0,
                                regY: 550,
                                alpha: 0
                            });
                            let coins = new createjs.Bitmap(loader.getResult('bonusCoins')).set({
                                x: door.x,
                                y: door.y,
                                regX: -20,
                                regY: 592,
                                alpha: 0
                            });
                            bonusContainer.addChild(light, coins);
                            door.on('animationend', function () {
                                door.gotoAndStop(4);
                                door.paused = true;
                                createjs.Tween.get(light)
                                .to({alpha: 1}, 400);
                                createjs.Tween.get(coins)
                                .to({alpha: 1}, 400);
                            });
                            showBonusWin(data.CurrentValue, true, 3000);
                        } else {
                            console.log('Это fail выход из пятых дверей.');
                            door.on('animationend', function () {
                                door.gotoAndStop(4);
                                door.paused = true;
                            });
                            createjs.Sound.play('muhaSound');
                            setTimeout(function () {
                                events.trigger('finishBonusLevel');
                            }, 1000);
                            // let fly = new createjs.Sprite(loader.getResult('bonusFly')).set({
                            //     x: door.x,
                            //     y: door.y
                            // });
                            // fly.on('animationend', function () {
                            //     createjs.Tween.get(fly)
                            //     .to({alpha: 0}, 100);
                            // })
                            // bonusContainer.addChild(fly);
                            // door.on('animationend', function () {
                            //     door.gotoAndStop(4);
                            //     door.paused = true;
                            // });
                        }
                    }
                });
            }

            doorsContainer.removeAllChildren();
            doorsContainer.addChild(door_1, door_2, door_3, door_4, door_5);
            bonusContainer.addChild(bonusBG, doorsContainer);
            stage.addChild(bonusContainer);
        }
        // bonusContainer.addChild(bonusBalance);
        if (stage.getChildIndex(stage.getChildByName('initContainer'))) {
            stage.addChildAt(bonusContainer, stage.getChildIndex(stage.getChildByName('balanceContainer')));
        } else {
            stage.addChild(bonusContainer);
        }
    }

    function showBonusWin(win, last, timer) {
        const loader = storage.read('loadResult');
        const numberSS = loader.getResult('numbers');
        let time = timer || 1000;
        console.log('I must show win:', win);
        let stage = storage.read('stage');
        let winText = new createjs.BitmapText(win, numberSS).set({
            name: 'winText',
            // x: 1280 / 2,
            // y: 760 / 2,
            // textAlign: 'center',
            // textBaseline: 'middle',
            scaleX: 0.1,
            scaleY: 0.1
        });
        var bounds = winText.getBounds();
        winText.x = stage.canvas.width - bounds.width >> 1;
        winText.y = stage.canvas.height - bounds.height >> 1;
        let bonusContainer = stage.getChildByName('bonusContainer');
        bonusContainer.addChild(winText);
        createjs.Tween.get(winText)
        .to({scaleX: 1, scaleY: 1}, 1000, createjs.Ease.bounceOut)
        .call(
            function () {
                setTimeout(function () {
                    if (!last) {
                        callNextBonusLevel();
                    } else {
                        events.trigger('finishBonusLevel');
                    }
                }, time);

            }
        );
    }

    function finishBonusLevel() {

        const stage = storage.read('stage');
        const balanceContainer = stage.getChildByName('balanceContainer');
        const balanceTextContainer = balanceContainer.getChildByName('balanceTextContainer');

        if (storage.read('device') === 'desktop') {
            let footerBgUp = balanceTextContainer.getChildByName('footerBgUp');
            let coinsSum = balanceTextContainer.getChildByName('coinsSum');
            let betSum = balanceTextContainer.getChildByName('betSum');
            coinsSum.visible = betSum.visible = true;
            balanceTextContainer.removeChild(totalWinText, totalWinSum, footerBgUp);
            balanceContainer.updateCache();
        } else if (storage.read('device') === 'mobile') {
            let coinsText = balanceTextContainer.getChildByName('coinsSumText');
            let betText = balanceTextContainer.getChildByName('betSumText');
            let coinsSum = balanceTextContainer.getChildByName('coinsSum');
            let betSum = balanceTextContainer.getChildByName('betSum');
            coinsText.visible = betText.visible = coinsSum.visible = betSum.visible = true;
            balanceTextContainer.removeChild(totalWinText, totalWinSum);
            balanceContainer.updateCache();
        }

        storage.read('currentBalance').coinsCash = ((storage.read('currentBalance').coinsCash * 100 + +storage.read('currentBalance').winCash * 100) / 100).toFixed(2);
        storage.read('currentBalance').coinsSum = +storage.read('currentBalance').coinsSum + +totalCount;

        storage.changeState('lockedMenu', false);
        createjs.Sound.stop('doorsAmbientSound');
        createjs.Sound.play('bonusPerehodSound', {loop: -1});
        let loader = storage.read('loadResult');
        console.warn('I am finishing Bonuses!');
        let finishContainer = new createjs.Container().set({
            name: 'finishContainer'
        });
        let finishBG = new createjs.Bitmap(loader.getResult('bonusWinBG')).set({
            name: 'finishBG',
            alpha: 0
        });
        let finishTotalWin = new createjs.Bitmap(loader.getResult('totalWin')).set({
            name: 'finishTotalWin',
            x: (1280 - 820 * 0.7) / 2,
            y: 50,
            scaleX: 0.7,
            scaleY: 0.7
        });
        let finishText = new createjs.BitmapText(totalCount + '', loader.getResult('numbers')).set({
            name: 'finishWinText',
            scaleX: 0.1,
            scaleY: 0.1,
            alpha: 0
        });
        let finishLiza = new createjs.Bitmap(loader.getResult('lizaBonusWin')).set({
            name: 'lizaBonusWin',
            x: 920,
            y: 210,
            scaleX: 0.7,
            scaleY: 0.7
        });
        let bounds = finishText.getBounds();
        finishText.x = 1280 - bounds.width * 0.7 >> 1;
        finishText.y = (720 - bounds.height * 0.7 >> 1);
        let finishButton = new createjs.Bitmap(loader.getResult('But')).set({
            name: 'finishButton',
            x: (1280 - 396) / 2,
            y: 575
        });
        let tl = new TimelineMax();

        tl.to(finishBG, 0.4, {alpha: 1})
            .call(function () {
                balance.updateBalance();
                stage.removeChild(stage.getChildByName('bonusContainer'));
            })
            .from(finishTotalWin, 0.4, {y: -400, alpha: 0}, '-=0.2')
            .to(finishText, 0.4, {scaleX: 0.7, scaleY: 0.7, alpha: 1}, '-=0.2')
            .from(finishLiza, 0.4, {x: 1400, alpha: 0}, '-=0.2')
            .from(finishButton, 0.4, {alpha: 0}, '-=0.2');
        // createjs.Tween.get(finishContainer)
        //     .to({alpha: 1}, 500)
        //     .call(
        //         function () {
        //             stage.removeChild(stage.getChildByName('bonusContainer'));
        //         }
        //     );
        finishBG.on('click', function () {
            createjs.Tween.get(finishContainer)
                .to({alpha: 0}, 500)
                .call(function () {
                    stage.removeChild(stage.getChildByName('finishContainer'));
                    createjs.Sound.stop('bonusPerehodSound');
                    createjs.Sound.play('ambientSound', {loop: -1});
                    readyAfterBonus();
                });
        });
        finishContainer.addChild(finishBG, finishTotalWin, finishText, finishLiza, finishButton);

        stage.addChild(finishContainer);

    }

    function callNextBonusLevel() {
        console.log('I am calling next Level');
        readyAfterBonus();
        const stage = storage.read('stage');
        let darkness = new createjs.Shape();
        darkness.graphics.beginFill('#000').drawRect(0, 0, 1280, 720);
        darkness.alpha = 0;
        stage.addChild(darkness);
        createjs.Tween.get(darkness)
            .to({alpha: 1}, 500)
            .call(function () {
                currentLevel++;
                getBonusLevel();
            })
            .wait(500)
            .to({alpha: 0}, 500)
            .call(function () {
                stage.removeChild(darkness);
            });
    }

    function getBonusLevel() {
        const sessionID = storage.read('sessionID');
        const currentBalance = storage.read('currentBalance');
        const betValue = currentBalance.betValue;
        const coinsValue = currentBalance.coinsValue * 100;
        utils.request('_Roll/', `${sessionID}/${betValue}/${coinsValue}`)
            .then((data) => {
                if (data.ErrorMessage) {
                    utils.showPopup(data.ErrorMessage);
                    return;
                }
                bonusData = data;
                drawBonusLevel(currentLevel, data);
                storage.write('bonusResponse', data);
            });
    }

    function readyAfterBonus() {
        const sessionID = storage.read('sessionID');
        utils.request('_Ready/', `${sessionID}`).then((data) => {
            console.log('Ready data:', data);
        });
    }

    events.on('initBonusLevel', initBonusLevel);
    events.on('drawBonusLevel', drawBonusLevel);
    events.on('finishBonusLevel', finishBonusLevel);

    return {
        getBonusLevel,
        readyAfterBonus
    };
})();
