import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';

import { balance } from 'components/balance/balance';
import { roll } from 'components/roll/roll';

// /* eslint-disable no-undef */
/* eslint-disable eqeqeq */
/* eslint-disable curly */
/* eslint-disable no-use-before-define */
export let freeSpin = (function () {
    const c = createjs;
    let stage;
    let pressureDiscs;

    let currentFreeSpins;
    // let config.currentMulti = 2;
    // let config.currentLevel = 0;
    // let config.currentCount = 15;
    // let config.currentWinCoins = 0;
    // let config.currentWinCents = 0;
    let fsWheels;
    let fsStartData;
    let fsTotalWin;
    let fireTimer;
    let parTimer;

    let config;
    const defaultConfig = {
        currentMulti: 2,
        currentLevel: 0,
        currentCount: 15,
        currentWinCoins: 0,
        currentWinCents: 0
    };

    function start(configObj) {
        config = configObj || defaultConfig;
    }

    function hideBalance() {
        const balanceContainer = stage.getChildByName('balanceContainer');
        const coinsSum = balanceContainer.getChildByName('coinsSum');
        const betSum = balanceContainer.getChildByName('betSum');
        const coinsSumText = balanceContainer.getChildByName('coinsSumText');
        const betSumText = balanceContainer.getChildByName('betSumText');
        betSum.visible = coinsSum.visible = betSumText.visible = coinsSumText.visible = false;
    }

    function showFsBalance() {
        const balanceContainer = stage.getChildByName('balanceContainer');

        const totalWinText = new createjs.Text('Total Win:', '24px Helvetica', '#dddddd').set({
            name: 'totalWinText',
            y: 658,
            textAlign: 'center'
        });
        const totalWinSum = new createjs.Text(config.currentWinCoins + '', '24px Helvetica', '#e8b075').set({
            name: 'totalWinSum',
            y: 658,
            textAlign: 'center',
            shadow: new c.Shadow('#e8b075', 0, 0, 15)
        });
        if (config.currentWinCents) {
            storage.read('currentBalance').winCash = (config.currentWinCents / 100).toFixed(2);
        }
        totalWinText.x = utils.width / 2 - 10 - totalWinText.getMeasuredWidth();
        totalWinSum.x = totalWinText.x + 20 + totalWinText.getMeasuredWidth() / 2 + totalWinSum.getMeasuredWidth() / 2;
        balanceContainer.addChild(totalWinText, totalWinSum);
        balanceContainer.updateCache();
    }

    function moveClock(clockContainer) {
        const tl = new TimelineMax({repeat: -1});
        tl.to(clockContainer, 1.5, { y: 5 })
        .to(clockContainer, 1, { y: -8 })
        .to(clockContainer, 1.5, { y: 7 })
        .to(clockContainer, 1, { y: 0 });
    }

    function addClockParticles(clockContainer) {
        const loader = storage.read('loadResult');
        const clockParticle = new c.Bitmap(loader.getResult('newLight'));
        utils.getCenterPoint(clockParticle);
        let particleAmount = Math.round(Math.random() * 60) + 30;
        let particleArray = [];
        for (let i = 0; i < particleAmount; i++) {
            const newParticle = clockParticle.clone();
            newParticle.x = 80 + Math.round(Math.random() * 350 - 175);
            newParticle.y = 450 + Math.round(Math.random() * 400 - 200);
            newParticle.alpha = Math.random() - 0.2;
            newParticle.scaleX = newParticle.scaleY = Math.random() + 0.4;
            const time = 4 * Math.random() + 3;
            TweenMax.to(newParticle, time, {
                x: newParticle.x + Math.round(Math.random() * 190 - 50),
                y: newParticle.y + Math.round(Math.random() * 190 - 50),
                alpha: Math.random(),
                repeat: -1,
                yoyo: true
            });
            particleArray.push(newParticle);
            clockContainer.addChild(newParticle);
        }

    }

    function showPressureTube() {
        // const loader = storage.read('loadResult');
        // const fgContainer = stage.getChildByName('fgContainer');
        // const pressure = new createjs.Bitmap(loader.getResult('pressure')).set({
        //     name: 'pressure',
        //     x: 60,
        //     y: 575
        // });
        // const pressureFire = new createjs.Sprite(loader.getResult('fireToPressure'), 'go').set({
        //     name: 'pressureFire',
        //     x: 90,
        //     y: 605
        // });
        // const pressureDark = new createjs.Shape().set({
        //     name: 'pressureDark',
        //     x: 100,
        //     y: 620
        // });
        // pressureDark.graphics.beginFill('#000').drawRect(0, 0, 810, 14);
        // const fireMask = new createjs.Shape();
        // fireMask.graphics.drawRect(0, 0, 100, utils.height);
        // pressureFire.mask = fireMask;
        // const pressureContainer = new createjs.Container().set({
        //     name: 'pressureContainer'
        // });
        // const pressureDisc = new createjs.Bitmap(loader.getResult('pressureDisc')).set({
        //     name: 'pressureDisc',
        //     x: 375,
        //     y: 598
        // });
        // pressureContainer.addChild(pressureDark, pressureFire);
        // for (let i = 0; i < 6; i++) {
        //     const newDisc = pressureDisc.clone();
        //     pressureDiscs.push(newDisc);
        //     pressureContainer.addChild(newDisc);
        // }
        // pressureDiscs[0].x = 244;
        // pressureDiscs[1].x = 376;
        // pressureDiscs[2].x = 508;
        // pressureDiscs[3].x = 640;
        // pressureDiscs[4].x = 772;
        // pressureDiscs[5].x = 904;
        // const truba = new createjs.Bitmap(loader.getResult('truba')).set({
        //     name: 'truba',
        //     x: 755,
        //     y: 40
        // });
        // fgContainer.addChildAt(truba, 0);
        // fgContainer.addChild(pressureContainer);
    }

    function drawFreeSpinsBG() {
        pressureDiscs = [];
        stage = storage.read('stage');
        const loader = storage.read('loadResult');

        // Balance data invisible
        hideBalance();
        showFsBalance();

        const bgContainer = stage.getChildByName('bgContainer');
        const gameBG = bgContainer.getChildByName('gameBG');
        gameBG.visible = false;
        const fsTableContainer = new createjs.Container().set({
            name: 'fsTableContainer',
            x: 230,
            y: 75
        });
        const fsTotalTable = new createjs.Bitmap(loader.getResult('fsTotalTable')).set({
            name: 'fsTotalTable',
            regX: 125,
            regY: 125,
            scaleX: 0.65,
            scaleY: 0.65
        });
        const fsTotalCount = new createjs.BitmapText(config.currentCount + '', loader.getResult('numbers')).set({
            name: 'fsTotalCount',
            x: 5,
            scaleX: 0.3,
            scaleY: 0.3
        });
        let bounds = fsTotalCount.getBounds();
        fsTotalCount.regX = bounds.width / 2;
        fsTotalCount.regY = bounds.height / 2;

        utils.getCenterPoint(fsTotalCount);
        fsTableContainer.addChild(fsTotalTable, fsTotalCount);
        stage.addChildAt(fsTableContainer, stage.getChildIndex(stage.getChildByName('fgContainer')) + 1);

        showPressureTube();

        const cultistBlackContainer = new createjs.Container().set({
            name: 'cultistBlackContainer'
        });
        const cultistBlack1 = new createjs.Bitmap(loader.getResult('cultistBlack1')).set({
            name: 'cultistBlack1',
            x: 30,
            y: 0,
            scaleX: 0.6,
            scaleY: 0.6
        });
        const cultistBlack2 = new createjs.Bitmap(loader.getResult('cultistBlack2')).set({
            name: 'cultistBlack2',
            x: 30,
            y: 120,
            scaleX: 0.6,
            scaleY: 0.6
        });
        const cultistBlack3 = new createjs.Bitmap(loader.getResult('cultistBlack3')).set({
            name: 'cultistBlack3',
            x: 30,
            y: 250,
            scaleX: 0.6,
            scaleY: 0.6
        });
        cultistBlackContainer.addChild(cultistBlack1, cultistBlack2, cultistBlack3);

        const fgContainer = stage.getChildByName('fgContainer');
        fgContainer.uncache();
        const fsBG = new createjs.Bitmap(loader.getResult('fsBG')).set({
            name: 'fsBG'
        });
        bgContainer.addChildAt(fsBG, 1);
        changeMultiplier(2);
        const clockContainer = new c.Container().set({
            name: 'clockContainer'
        });
        const book = new c.Bitmap(loader.getResult('chasyFS')).set({
            name: 'clock',
            x: 120,
            y: utils.height - 200,
            regX: 300,
            regY: 300,
            scaleX: 0.52,
            scaleY: 0.52
        });
        clockContainer.addChild(book);
        addClockParticles(clockContainer);
        stage.addChildAt(cultistBlackContainer, clockContainer, stage.getChildIndex(stage.getChildByName('winRectsContainer')) + 1);
        moveClock(clockContainer);

        if (config.currentLevel !== 0) {
            changeLevel(config.currentLevel + 1);
        }
        if (config.currentMulti !== 2) {
            changeMultiplier(config.currentMulti);
        }

    }

    function addPar(num) {
        const loader = storage.read('loadResult');
        const fgContainer = stage.getChildByName('fgContainer');
        const pressureContainer = fgContainer.getChildByName('pressureContainer');
        const parSprite = new createjs.Sprite(loader.getResult('parNaKryshku'), 'go');
        parSprite.set({
            x: pressureDiscs[num].x - 30,
            y: pressureDiscs[num].y - 33
        });
        pressureContainer.addChildAt(parSprite, pressureContainer.getChildIndex(pressureDiscs[num]));
        parSprite.on('animationend', function (e) {
            pressureContainer.removeChild(parSprite);
            e.remove();
        });
    }

    function changeLevel(num) {
        // if (num != config.currentLevel) {
        //     config.currentLevel = num;
        //     createjs.Sound.play('fsClockSound');
        //     const clockContainer = stage.getChildByName('clockContainer');
        //     const hours = clockContainer.getChildByName('clockHours');
        //     const minutes = clockContainer.getChildByName('clockMinutes');
        //     minutes.play();
        //     minutes.on('animationend', function () {
        //         minutes.paused = true;
        //         minutes.gotoAndStop('minute');
        //         if (num !== 11) {
        //             hours.gotoAndStop(`h-${num + 2}`);
        //         } else {
        //             hours.gotoAndStop('h-1');
        //             minutes.gotoAndPlay('finish');
        //         }
        //     });
        // }
    }

    function changeMultiplier(multi) {
        // if (pressureDiscs[multi - 2].alpha === 0) return;
        // createjs.Sound.play('pressureSound');
        // const fgContainer = stage.getChildByName('fgContainer');
        // const pressureContainer = fgContainer.getChildByName('pressureContainer');
        // const pressureFire = pressureContainer.getChildByName('pressureFire');
        // const newMask = new createjs.Shape();
        // const tl = new TimelineMax();
        // if (multi == 2) {
        //     newMask.graphics.drawRect(0, 0, 300, utils.height);
        //     tl.to(pressureDiscs[0], 0.3, {y: '-=150', alpha: 0});
        //     addPar(0);
        // } else if (multi == 3) {
        //     newMask.graphics.drawRect(0, 0, 400, utils.height);
        //     tl.to([pressureDiscs[0], pressureDiscs[1]], 0.3, {y: '-=150', alpha: 0});
        //     addPar(1);
        // } else if (multi == 4) {
        //     newMask.graphics.drawRect(0, 0, 500, utils.height);
        //     tl.to([pressureDiscs[0], pressureDiscs[1], pressureDiscs[2]], 0.3, {y: '-=150', alpha: 0});
        //     addPar(2);
        // } else if (multi == 5) {
        //     newMask.graphics.drawRect(0, 0, 650, utils.height);
        //     tl.to([pressureDiscs[0], pressureDiscs[1], pressureDiscs[2], pressureDiscs[3]], 0.3, {y: '-=150', alpha: 0});
        //     addPar(3);
        // } else if (multi == 6) {
        //     newMask.graphics.drawRect(0, 0, 800, utils.height);
        //     tl.to([pressureDiscs[0], pressureDiscs[1], pressureDiscs[2], pressureDiscs[3], pressureDiscs[4]], 0.3, {y: '-=150', alpha: 0});
        //     addPar(4);
        // } else if (multi == 7) {
        //     newMask.graphics.drawRect(0, 0, utils.width, utils.height);
        //     tl.to([pressureDiscs[0], pressureDiscs[1], pressureDiscs[2], pressureDiscs[3], pressureDiscs[4], pressureDiscs[5]], 0.3, {y: '-=150', alpha: 0});
        //     addPar(5);
        //     getFireLogo();
        //     getFirework();
        //     crashGame();
        //     getMultiLight();
        //     const loader = storage.read('loadResult');
        //     const x7 = new c.Bitmap(loader.getResult('x7')).set({
        //         x: utils.width / 2 + 100,
        //         y: utils.height / 2 - 50,
        //         scaleX: 0.3,
        //         scaleY: 0.3
        //     });
        //     utils.getCenterPoint(x7);
        //     stage.addChild(x7);
        //     TweenMax.to(x7, 1.5, {scaleX: 1, scaleY: 1, ease: Bounce.easeOut, onComplete: function () {
        //         TweenMax.to(x7, 0.3, {alpha: 0, onComplete: function () {
        //             stage.removeChild(x7);
        //         }});
        //     }});
        // }
        // pressureFire.mask = newMask;
    }

    function getFirework() {
        if (stage.getChildByName('fsLogoContainer')) {
            const loader = storage.read('loadResult');
            const fsLogoContainer = stage.getChildByName('fsLogoContainer');
            const amount = Math.round(Math.random() * 5 + 3);
            for (let i = 0; i < amount; i++) {
                const firework = new c.Sprite(loader.getResult('firework'), 'fire').set({
                    x: fsLogoContainer.x + Math.random() * 400 - 250 - 300,
                    y: fsLogoContainer.y + Math.random() * 200 - 100 - 100
                });
                firework.on('animationend', function () {
                    fsLogoContainer.removeChild(firework);
                });
                fsLogoContainer.addChildAt(firework, 0);
            }
        }
    }

    function getMultiLight() {
        const loader = storage.read('loadResult');
        const fgContainer = stage.getChildByName('fgContainer');
        const pressureContainer = fgContainer.getChildByName('pressureContainer');
        const light = new c.Bitmap(loader.getResult('redLight'));
        const lightArray = [];
        const lightX = 244;
        const lightY = 598;
        for (let i = 0; i < pressureDiscs.length; i++) {
            const newLight = light.clone(true);
            newLight.x = lightX + i * 132 - 24;
            newLight.y = lightY - 28;
            newLight.alpha = 0;
            pressureContainer.addChild(newLight);
            lightArray.push(newLight);
        }
        const tl = new TimelineMax();
        tl.staggerTo(lightArray, 0.15, {alpha: 1}, 0.05)
                .staggerTo(lightArray, 0.15, {alpha: 0, onComplete: function () {
                    pressureContainer.removeChild(this.target);
                }}, 0.05, '+=0.3');
        const time = Math.round(Math.random() * 5000 + 3000);
        fireTimer = setTimeout(getMultiLight, time);
    }

    function getFireLogo() {
        const loader = storage.read('loadResult');
        const logoTop = new createjs.Bitmap(loader.getResult('logoTop')).set({
            name: 'logoTop'
        });
        const logoFire = new createjs.Bitmap(loader.getResult('logoFire')).set({
            name: 'logoFire'
        });
        const fsLogoContainer = new createjs.Container().set({
            name: 'fsLogoContainer',
            x: 507,
            y: -8,
            alpha: 0
        });
        TweenMax.to(fsLogoContainer, 0.3, {alpha: 1});
        let tl = new TimelineMax({repeat: -1, yoyo: true});
        tl.to(logoFire, 0.8, {alpha: 0.7});
        fsLogoContainer.addChild(logoTop, logoFire);
        const fgContainer = stage.getChildByName('fgContainer');
        stage.addChildAt(fsLogoContainer, stage.getChildIndex(fgContainer) + 1);
    }

    function movePipe() {
        const fgContainer = stage.getChildByName('fgContainer');
        const truba = fgContainer.getChildByName('truba');
        let tl = new TimelineMax({repeat: 5, yoyo: true});
        tl.to(truba, 0.15, {x: 908 - 150});
        if (window.navigator.vibrate) {
            window.navigator.vibrate([300, 200, 300]);
        }
    }

    function getSomePar() {
        const loader = storage.read('loadResult');
        createjs.Sound.play('parSound');
        const parContainer = new c.Container().set({
            name: 'parContainer'
        });
        const par1 = new createjs.Sprite(loader.getResult('parPack'), 'parVar2_').set({
            x: 930,
            y: -50,
            scaleX: 0.5,
            scaleY: 0.5,
            alpha: 0
        });
        const par2 = new createjs.Sprite(loader.getResult('parPack'), 'parVar1_').set({
            x: 1147,
            y: 302,
            scaleX: 0.5,
            scaleY: 0.5,
            rotation: 270,
            alpha: 0
        });
        const par3 = new createjs.Sprite(loader.getResult('parPack'), 'parVar1_').set({
            x: 1285,
            y: 5,
            scaleX: 0.4,
            scaleY: 0.4,
            rotation: 60,
            alpha: 0
        });
        const par4 = new createjs.Sprite(loader.getResult('parPack'), 'parVar2_').set({
            x: 1092,
            y: 588,
            scaleX: 0.4,
            scaleY: 0.4,
            rotation: 0,
            alpha: 0
        });
        let tl = new TimelineMax();
        tl.from([par1, par2, par3, par4], 0.5, {alpha: 1})
            .delay(2)
            .to([par1, par2, par3, par4], 0.5, {alpha: 0})
            .call(function () {
                parContainer.removeChild(par1, par2, par3, par4);
                stage.removeChild(parContainer);
            });
        parContainer.addChild(par1, par2, par3, par4);
        const fgContainer = stage.getChildByName('fgContainer');
        stage.addChildAt(parContainer, stage.getChildIndex(fgContainer) + 1);
    }

    function initFreeSpins(data) {
        const buttonsContainer = stage.getChildByName('buttonsContainer');
        buttonsContainer.visible = false;
        fsTotalWin = 0;
        drawFreeSpinsBG();
        events.trigger('menu:changeSide', 'right');
    }

    function transitionFreeSpins(data) {
        createjs.Sound.stop('ambientSound');
        createjs.Sound.play('bonusPerehodSound', {loop: -1});
        fsStartData = data;
        if (data) {
            config.currentLevel = data.level - 1;
            config.currentMulti = data.multi;
            config.currentCount = data.count;
            config.currentWinCoins = data.currentWinCoins;
            config.currentWinCents = data.currentWinCents;
        }
        const loader = storage.read('loadResult');
        stage = storage.read('stage');

        let transitionContainer = new createjs.Container().set({
            name: 'transitionContainer'
        });
        let transitionBG = new createjs.Shape().set({
            name: 'transitionBG',
            alpha: 0.8
        });
        transitionBG.graphics.beginFill('#000').drawRect(0, 0, utils.width, utils.height);
        let transitionPopup = new createjs.Bitmap(loader.getResult('transitionPopup')).set({
            name: 'transitionPopup',
            x: utils.width / 2,
            y: utils.height / 2 - 50,
            regX: 350,
            regY: 200,
            alpha: 1
        });
        let transitionLuchi = new createjs.Bitmap(loader.getResult('luchi')).set({
            name: 'transitionLuchi',
            x: utils.width / 2,
            y: utils.height / 2 - 50,
            regX: 410,
            regY: 403,
            alpha: 0.5
        });

        let transitionWinText = new createjs.BitmapText(config.currentCount + '', loader.getResult('numbers')).set({
            name: 'transitionWinText',
            scaleX: 0.9,
            scaleY: 0.9,
            alpha: 1
        });
        let bounds = transitionWinText.getBounds();
        transitionWinText.x = utils.width / 2 - 27;
        transitionWinText.y = utils.height / 2 - 90;
        transitionWinText.regX = bounds.width / 2;
        transitionWinText.regY = bounds.height / 2;
        let transitionButton = new createjs.Bitmap(loader.getResult('But')).set({
            name: 'transitionButton',
            x: utils.width / 2,
            y: utils.height / 2 + 150,
            regX: 118,
            regY: 47.5,
            alpha: 1
        });

        let tl0 = new TimelineMax({repeat: -1});
        tl0.from(transitionLuchi, 15, {rotation: -360, ease: Power0.easeNone});

        transitionContainer.on('click', function () {
            createjs.Sound.stop('bonusPerehodSound');
            createjs.Sound.play('fsAmbientSound', {loop: -1});

            let tl = new TimelineMax();
            tl.to(transitionBG, 0.4, {alpha: 1})
                .call(function () {
                    events.trigger('drawFreeSpins', fsStartData);
                    setTimeout(function () {
                        events.trigger('startFreeSpin');
                    }, 1000);
                    createjs.Tween.get(transitionContainer)
                        .to({alpha: 0}, 500);
                });
        }, transitionContainer, true);

        transitionContainer.addChild(transitionBG, transitionPopup, transitionLuchi, transitionWinText, transitionButton);
        stage.addChild(transitionContainer);
        let tl = new TimelineMax();
        tl.from(transitionBG, 0.4, {alpha: 0})
            .from(transitionPopup, 0.4, {y: 0, alpha: 0}, '-=0.2')
            .from(transitionLuchi, 0.4, {alpha: 0}, '-=0.2')
            .from(transitionWinText, 1.2, {scaleX: 0.1, scaleY: 0.1, alpha: 0, ease: Elastic.easeOut.config(1, 0.3)}, '-=0.2')
            .from(transitionButton, 0.4, {alpha: 0}, '-=0.2');
    }

    function countFreeSpins(number) {
        const fsTableContainer = stage.getChildByName('fsTableContainer');
        const fsTotalCount = fsTableContainer.getChildByName('fsTotalCount');
        fsTotalCount.text = number + '';
        const countBounds = fsTotalCount.getBounds();
        fsTotalCount.regX = countBounds.width / 2;
        fsTotalCount.regY = countBounds.height / 2;
        console.log('I must change fsCount', number);
    }

    function startFreeSpin() {
        roll.startRoll();
    }

    function stopFreeSpins() {
        clearTimeout(fireTimer);
        clearTimeout(parTimer);
        storage.changeState('lockedMenu', false);
        const bgContainer = stage.getChildByName('bgContainer');
        const fgContainer = stage.getChildByName('fgContainer');
        const buttonsContainer = stage.getChildByName('buttonsContainer');
        buttonsContainer.visible = true;
        const truba = fgContainer.getChildByName('truba');
        const pressureContainer = fgContainer.getChildByName('pressureContainer');
        // const fsMachineBG = bgContainer.getChildByName('fsMachineBG');
        const fsBG = bgContainer.getChildByName('fsBG');

        const gameBG = bgContainer.getChildByName('gameBG');
        gameBG.visible = true;

        const balanceContainer = stage.getChildByName('balanceContainer');
        const coinsSum = balanceContainer.getChildByName('coinsSum');
        const betSum = balanceContainer.getChildByName('betSum');
        const coinsSumText = balanceContainer.getChildByName('coinsSumText');
        const betSumText = balanceContainer.getChildByName('betSumText');
        const totalWinText = balanceContainer.getChildByName('totalWinText');
        const totalWinSum = balanceContainer.getChildByName('totalWinSum');
        betSum.visible = coinsSum.visible = betSumText.visible = coinsSumText.visible = true;
        balanceContainer.removeChild(totalWinText, totalWinSum);
        balanceContainer.updateCache();

        bgContainer.removeChild(fsBG);
        bgContainer.uncache();
        fgContainer.removeChild(truba, pressureContainer);
        fgContainer.uncache();
        stage.removeChild(stage.getChildByName('fsLogoContainer'));
        stage.removeChild(stage.getChildByName('fsTableContainer'));
        stage.removeChild(stage.getChildByName('clockContainer'));
        stage.removeChild(stage.getChildByName('cultistBlackContainer'));
        storage.changeState('side', 'left');
        events.trigger('menu:changeSide', 'left');
        // canvas.changeGamePosition('left');
    }

    function countTotalWin(data) {
        if (data.Mode === 'fsBonus') {
            const balanceContainer = stage.getChildByName('balanceContainer');
            const totalWinSum = balanceContainer.getChildByName('totalWinSum');
            const totalWinText = balanceContainer.getChildByName('totalWinText');
            totalWinSum.text = +totalWinSum.text + data.TotalWinCoins;
            fsTotalWin = totalWinSum.text;
            totalWinSum.x = totalWinText.x + 20 + totalWinText.getMeasuredWidth() / 2 + totalWinSum.getMeasuredWidth() / 2;
            balanceContainer.updateCache();
        }
    }

    function finishFreeSpins() {

        const response = storage.read('freeRollResponse');
        storage.read('currentBalance').coinsCash = ((+storage.read('currentBalance').coinsCash * 100 + +storage.read('currentBalance').winCash * 100) / 100).toFixed(2);
        storage.read('currentBalance').coinsSum = +storage.read('currentBalance').coinsSum + response.CoinsWinCounter + response.TotalWinCoins;
        balance.updateBalance();

        createjs.Sound.stop('fsAmbientSound');
        createjs.Sound.play('bonusPerehodSound', {loop: -1});
        let loader = storage.read('loadResult');
        let finishContainer = new createjs.Container().set({
            name: 'finishContainer',
            alpha: 0
        });
        let finishBG = new createjs.Shape().set({
            name: 'finishBG',
            alpha: 0.8
        });
        finishBG.graphics.beginFill('#000').drawRect(0, 0, utils.width, utils.height);
        let finishText = new createjs.Bitmap(loader.getResult('totalWin')).set({
            name: 'finishText',
            x: utils.width / 2,
            y: utils.height / 2 - 250,
            regX: 500,
            regY: 150,
            scaleX: 0.1, scaleY: 0.1, alpha: 0
        });
        let cultists1 = new createjs.Sprite(loader.getResult('new_elements'), '12-w').set({
            name: 'cultists',
            x: utils.width / 2 - 330,
            y: utils.height / 2 + 40,
            scaleX: 1.4,
            scaleY: 1.4
        });
        let cultists2 = new createjs.Sprite(loader.getResult('new_elements'), '11-w').set({
            name: 'cultists',
            x: utils.width / 2 - 220,
            y: utils.height / 2 - 30,
            scaleX: 1.6,
            scaleY: 1.6
        });
        let cultists3 = new createjs.Sprite(loader.getResult('new_elements'), '13-w').set({
            name: 'cultists',
            x: utils.width / 2 + 300,
            y: utils.height / 2 + 34,
            scaleX: 1.4,
            scaleY: 1.4,
            skewY: 180
        });
        let finishWinText = new createjs.BitmapText(fsTotalWin + '', loader.getResult('numbers')).set({
            name: 'transitionWinText',
            x: utils.width / 2 - 40,
            y: utils.height / 2 - 110,
            scaleX: 0.1, scaleY: 0.1, alpha: 0
        });
        let bounds = finishWinText.getBounds();
        finishWinText.regX = bounds.width / 2;
        finishWinText.regY = bounds.height / 2;

        let luchi = new createjs.Bitmap(loader.getResult('luchi')).set({
            name: 'transitionLuchi',
            x: utils.width / 2,
            y: utils.height / 2 - 50,
            regX: 410,
            regY: 403,
            alpha: 0.5
        });
        let tl = new TimelineMax({repeat: -1});
        tl.from(luchi, 15, {rotation: -360, ease: Power0.easeNone});

        let finishButton = new createjs.Bitmap(loader.getResult('But')).set({
            name: 'finishButton',
            x: utils.width / 2,
            y: utils.height / 2 + 255,
            regX: 118,
            regY: 47.5,
            alpha: 1
        });
        finishContainer.addChild(finishBG, luchi, finishText, cultists1, cultists3, cultists2, finishButton, finishWinText);
        createjs.Tween.get(finishContainer)
            .to({alpha: 1}, 500)
            .call(function () {
                events.trigger('stopFreeSpins');
                let tl2 = new TimelineMax();
                tl2.to(finishText, 1.2, {scaleX: 0.7, scaleY: 0.7, alpha: 1, ease: Elastic.easeOut.config(1, 0.3)}, '-=0.2')
                    .to(finishWinText, 1.2, {scaleX: 1.1, scaleY: 1.1, alpha: 1, ease: Elastic.easeOut.config(1, 0.3)}, '-=0.2');
            });

        finishButton.on('click', function () {
            createjs.Sound.stop('bonusPerehodSound');
            createjs.Sound.play('ambientSound', {loop: -1});
            createjs.Tween.get(finishContainer)
                .to({alpha: 0}, 500)
                .call(function () {
                    stage.removeChild(finishContainer);
                });
        });
        stage.addChild(finishContainer);
    }

    function showTotalFreeSpins(num) {
        const loader = storage.read('loadResult');
        const fsTable = new createjs.Bitmap(loader.getResult('fsTable')).set({
            x: 730,
            y: 180
        });
        let tableBounds = fsTable.getBounds();
        fsTable.regX = tableBounds.width / 2;
        fsTable.regY = tableBounds.height / 2;
        const fsTableText = new createjs.Bitmap(loader.getResult('plus3')).set({
            x: fsTable.x,
            y: fsTable.y + 35
        });
        let textBounds = fsTableText.getBounds();
        fsTableText.regX = textBounds.width / 2;
        fsTableText.regY = textBounds.height / 2;
        const fsTableContainer = new createjs.Container().set({
            name: 'fsTableContainer'
        });
        const tableMask = new createjs.Shape();
        tableMask.graphics.beginFill('#fff').drawRect(0, 88, utils.width, utils.height);
        fsTableContainer.mask = tableMask;
        fsTableContainer.addChild(fsTable, fsTableText);
        stage.addChild(fsTableContainer);
        let tl = new TimelineMax();
        tl.from(fsTableContainer, 0.3, {y: -200, alpha: 0})
            .to(fsTableContainer, 0.3, {y: -200, alpha: 0, onComplete: function () {
                stage.removeChild(fsTableContainer);
            }}, '+=1.5');
    }

    function addMultiBonus(data) {
        let multiStage = storage.read('stage');
        let loader = storage.read('loadResult');
        // fsTotalWin = fsTotalWin + data.coins;
        // multiStage.getChildByName('fsTotalContainer').getChildByName('fsTotalWinText').text = fsTotalWin;


        let multiContainer = new createjs.Container().set({
            name: 'multiContainer',
            alpha: 0
        });
        let multiBG = new createjs.Bitmap(loader.getResult('multiBG')).set({
            name: 'multiBG'
        });
        let multiTitle = new createjs.Bitmap(loader.getResult('multiTitle')).set({
            name: 'multiTitle',
            x: (1280 - 868) / 2,
            y: 100
        });
        let multiCoins = new createjs.Bitmap(loader.getResult('multiCoins')).set({
            name: 'multiCoins',
            x: (1280 - 192) / 2,
            y: 440
        });
        let multiWinText = new createjs.BitmapText('1000', loader.getResult('fsText')).set({
            x: 1280 / 2,
            y: 680 / 2
        });
        let multiBounds = multiWinText.getBounds();
        multiWinText.regX = multiBounds.width / 2;
        multiWinText.regY = multiBounds.height / 2;
        let multiButton = new createjs.Bitmap(loader.getResult('But')).set({
            name: 'multiButton',
            x: (1280 - 396) / 2,
            y: 560
        });
        multiContainer.addChild(multiBG, multiTitle, multiCoins, multiWinText, multiButton);
        createjs.Tween.get(multiContainer)
            .to({alpha: 1}, 500);
        // multiButton.on('mousedown', function () {
        //     multiButton.gotoAndStop('over');
        // });
        multiButton.on('click', function () {
            utils.request('_Ready/', storage.read('sessionID'))
                .then((response) => {
                    if (response.ErrorCode === 0) {
                        events.trigger('startFreeSpin');
                    }
                });
            createjs.Tween.get(multiContainer)
                .to({alpha: 0}, 500)
                .call(function () {
                    multiStage.removeChild(multiContainer);
                });
        });
        multiStage.addChild(multiContainer);
    }

    function crashGame() {
        const time = Math.random() * 3000 + 1000;
        getSomePar();
        movePipe();
        parTimer = setTimeout(crashGame, time);
    }

    function countMoney(response) {
        storage.read('currentBalance').winCash = ((response.CentsWinCounter + response.TotalWinCents) / 100).toFixed(2);
        balance.updateBalance();
    }

    function checkState(state) {
        if (state === 'roll' && storage.readState(state) === 'ended') {
            if (storage.readState('mode') === 'fsBonus') {
                countTotalWin(storage.read('rollResponse'));
                countFreeSpins(storage.read('freeRollResponse').TotalFreeSpins);
                countMoney(storage.read('freeRollResponse'));
                if (storage.read('rollResponse').LinesResult.length && storage.readState('fsMulti') == 7) {
                    getFirework();
                }
            }
        }
        if (state === 'roll' && storage.readState(state) === 'started') {
            if (storage.readState('mode') === 'fsBonus') {
                countTotalWin(storage.read('rollResponse').TotalFreeSpins - 1);
            }
        }
        if (state === 'fsMulti') {
            // if (config.currentMulti != storage.readState(state)) {
            changeMultiplier(storage.readState(state));
                // config.currentMulti = storage.readState(state);
            // }
        }
        if (state === 'fsLevel') {
            changeLevel(storage.readState(state));
        }
    }

    events.on('initFreeSpins', transitionFreeSpins);
    events.on('drawFreeSpins', initFreeSpins);
    // events.on('initFreeSpins', initFreeSpins);
    events.on('stopFreeSpins', stopFreeSpins);
    events.on('finishFreeSpins', finishFreeSpins);
    events.on('startFreeSpin', startFreeSpin);
    events.on('spinEnd', countTotalWin);
    events.on('multiplierBonus', addMultiBonus);
    events.on('changeState', checkState);
    return {
        start,
        initFreeSpins,
        stopFreeSpins,
        startFreeSpin,
        drawFreeSpinsBG,
        changeMultiplier,
        getMultiLight,
        changeLevel,
        showTotalFreeSpins,
        crashGame,
        getSomePar
    };
})();
