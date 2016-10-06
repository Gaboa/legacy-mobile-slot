import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';
import { parameters } from 'components/balance/parameters';

export let balance = (function () {

    let config;
    const defaultConfig = {
        bottomLineHeight: 30,
        topLineHeight: 40,
        textDelta: 20
    };

    let stage;
    const c = createjs;
    const balanceContainer = new c.Container().set({ name: 'balanceContainer' });
    const balanceTextContainer = new c.Container().set({ name: 'balanceTextContainer' });
    const balanceButtons = new c.Container().set({ name: 'balanceButtons' });

    const balanceText = {};
    const balanceData = {};
    let currencySymbol;

    function start(configObj) {

        config = configObj || defaultConfig;

    }

    function initBalance() {

        stage = storage.read('stage');
        const data = storage.read('initState');
        balanceData.linesLength = storage.read('lines').length;

        balanceData.coinsSteps = data.CoinValue.map((value) => { return (value / 100).toFixed(2); });
        balanceData.betSteps = data.BetLevel;

        balanceData.coinsValue = balanceData.coinsSteps[0];
        balanceData.coinsSum = data.ScoreCoins;
        balanceData.coinsCash = +(data.ScoreCents / 100).toFixed(2);

        balanceData.betValue = balanceData.betSteps[0];
        balanceData.betSum = +(balanceData.betValue * balanceData.linesLength).toFixed(0);
        balanceData.betCash = +(balanceData.betSum * balanceData.coinsValue).toFixed(2);

        balanceData.winCash = (0).toFixed(2);
        balanceData.currency = data.Currency;

        currencySymbol = checkCurrency(balanceData.currency);

        drawBalanceBG();
        drawBalanceButtons();
        writeBalance();

        storage.read('isMobile') || drawBalanceTime();

    }

    function checkCurrency(currency) {

        if (currency === 'USD') {
            return '$ ';
        } else if (currency === 'EUR') {
            return '€ ';
        } else if (currency === 'UAH') {
            return '₴ ';
        } else if (currency === 'RUB') {
            return '₽ ';
        }

    }

    function makeTextDelta(text1, text2, delta) {

        text1.x = text2.x - text2.getMeasuredWidth() / 2 - delta - text1.getMeasuredWidth();

    }

    function drawBalanceTime() {

        let currentHour = new Date().getHours();
        let currentMinutes = new Date().getMinutes();

        if (currentHour < 10) {
            currentHour = '0' + currentHour;
        }
        if (currentMinutes < 10) {
            currentMinutes = '0' + currentMinutes;
        }

        let balanceTime = new c.Text(`${currentHour} : ${currentMinutes}`, parameters.font, parameters.orangeColor);
        balanceTime.set({
            x: utils.width - balanceTime.getMeasuredWidth(),
            y: utils.height - config.bottomLineHeight / 2,
            textAlign: 'center',
            textBaseline: 'middle'
        });

        c.Ticker.on('tick', (event) => {

            let hours = new Date().getHours();
            let minutes = new Date().getMinutes();

            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }

            if (currentHour != hours) {

                currentHour = hours;
                balanceTime.text = `${currentHour} : ${currentMinutes}`;
                balanceContainer.updateCache();

            }

            if (currentMinutes != minutes) {

                currentMinutes = minutes;
                balanceTime.text = `${currentHour} : ${currentMinutes}`;
                balanceContainer.updateCache();

            }

        });

        balanceContainer.addChild(balanceTime);

    }

    function drawBalanceButtons() {

        const loader = storage.read('loadResult');
        let homeButton;
        let soundButton;
        let menuButton;
        let autoButton;

        if (storage.read('isMobile')) {

            homeButton = new c.Sprite(loader.getResult('balance'), 'home').set({
                name: 'homeButton',
                x: 25, // Magic Numbers
                y: utils.height - config.topLineHeight / 2 - config.bottomLineHeight
            });
            utils.getCenterPoint(homeButton);

        } else {

            homeButton = new c.Sprite(loader.getResult('balance'), 'home').set({
                name: 'homeButton',
                x: 15, // Magic Numbers
                y: utils.height - config.bottomLineHeight / 2,
                scaleX: 0.6,
                scaleY: 0.6,
                cursor: 'pointer'
            });
            utils.getCenterPoint(homeButton);

            menuButton = new c.Sprite(loader.getResult('balance'), 'menu').set({
                name: 'menuButton',
                x: 40, // Magic Numbers
                y: utils.height - config.bottomLineHeight / 2,
                scaleX: 0.6,
                scaleY: 0.6,
                cursor: 'pointer'
            });
            utils.getCenterPoint(menuButton);

            soundButton = new c.Sprite(loader.getResult('balance'), 'sound').set({
                name: 'soundButton',
                x: 65, // Magic Numbers
                y: utils.height - config.bottomLineHeight / 2,
                scaleX: 0.6,
                scaleY: 0.6,
                cursor: 'pointer'
            });
            utils.getCenterPoint(soundButton);

            autoButton = new c.Sprite(loader.getResult('balance'), 'auto').set({
                name: 'autoButton',
                x: 90, // Magic Numbers
                y: utils.height - config.bottomLineHeight / 2,
                scaleX: 0.6,
                scaleY: 0.6,
                cursor: 'pointer'
            });
            utils.getCenterPoint(autoButton);

            menuButton.on('click', (event) => {
                if (storage.readState('lockedMenu')) return;

                c.Sound.play('buttonClickSound');
                storage.changeState('menu', 'settings');
                events.trigger('buttons:showMenu', 'settings');
            });
            soundButton.on('click', (event) => {
                if (storage.readState('lockedMenu')) return;

                c.Sound.play('buttonClickSound');
                c.Sound.muted = !c.Sound.muted;
                storage.changeState('sound', !storage.readState('sound'));
            });
            autoButton.on('click', (event) => {
                if (storage.readState('lockedMenu')) return;

                c.Sound.play('buttonClickSound');
                storage.changeState('menu', 'auto');
                events.trigger('buttons:showMenu', 'auto');
            });

            balanceButtons.addChild(menuButton, soundButton, autoButton);

        }

        homeButton.on('click', (event) => {
            utils.request('_Logout/', storage.read('sessionID'))
                .then((response) => {
                    console.log('Logout response:', response);
                    window.history.back();
                });
        });

        balanceButtons.addChild(homeButton);
        balanceContainer.addChild(balanceButtons);

    }

    function drawBalanceBG() {

        const footerBgDown = new c.Shape().set({name: 'footerBgDown'});
        footerBgDown.graphics.beginFill('#000').drawRect(0, utils.height - config.bottomLineHeight, utils.width, config.bottomLineHeight);

        if (storage.read('isMobile')) {
            const footerBgUp = new c.Shape().set({name: 'footerBgUp'});
            footerBgUp.graphics.beginFill('rgba(0, 0, 0, 0.6)').drawRect(0, utils.height - config.bottomLineHeight - config.topLineHeight, utils.width, config.topLineHeight);
            balanceContainer.addChild(footerBgDown, footerBgUp);
        } else {
            balanceContainer.addChild(footerBgDown);
        }

    }

    function writeBalance() {

        balanceText.coinsCashText = new c.Text('Cash:', parameters.font, parameters.greyColor).set(parameters.coinsCashText);
        balanceText.coinsCash = new c.Text(currencySymbol + balanceData.coinsCash, parameters.font, parameters.color).set(parameters.coinsCash);
        balanceText.betCashText = new c.Text('Bet:', parameters.font, parameters.greyColor).set(parameters.betCashText);
        balanceText.betCash = new c.Text(currencySymbol + balanceData.betCash, parameters.font, parameters.color).set(parameters.betCash);
        balanceText.winCashText = new c.Text('Win:', parameters.font, parameters.greyColor).set(parameters.winCashText);
        balanceText.winCash = new c.Text(currencySymbol + balanceData.winCash, parameters.font, parameters.color).set(parameters.winCash);
        makeTextDelta(balanceText.coinsCashText, balanceText.coinsCash, config.textDelta);

        if (storage.read('isMobile')) {

            balanceText.coinsSumText = new c.Text('Coins:', parameters.bigFont, parameters.color).set(parameters.coinsSumText);
            balanceText.coinsSum = new c.Text(balanceData.coinsSum, parameters.font, parameters.orangeColor).set(parameters.coinsSum);
            balanceText.betSumText = new c.Text('Bet:', parameters.bigFont, parameters.color).set(parameters.betSumText);
            balanceText.betSum = new c.Text(balanceData.betSum, parameters.font, parameters.orangeColor).set(parameters.betSum);
            makeTextDelta(balanceText.coinsSumText, balanceText.coinsSum, config.textDelta);

        } else {

            balanceText.coinsSum = new c.Text(balanceData.coinsSum, parameters.font, parameters.orangeColor).set(parameters.desktop.coinsSum);
            balanceText.coinsValue = new c.Text(balanceData.coinsValue, parameters.font, parameters.orangeColor).set(parameters.desktop.coinsValue);
            balanceText.betSum = new c.Text(balanceData.betSum, parameters.font, parameters.orangeColor).set(parameters.desktop.betSum);
            balanceText.betValue = new c.Text(balanceData.betValue, parameters.font, parameters.orangeColor).set(parameters.desktop.betValue);
            balanceTextContainer.addChild(balanceText.betValue, balanceText.coinsValue);

        }


        balanceTextContainer.addChild(
            balanceText.coinsSum,
            balanceText.coinsSumText,
            balanceText.betSum,
            balanceText.betSumText,
            balanceText.coinsCash,
            balanceText.coinsCashText,
            balanceText.betCash,
            balanceText.betCashText,
            balanceText.winCash,
            balanceText.winCashText
        );

        // Добавим баланс на сцену
        balanceContainer.addChild(balanceTextContainer);
        stage.addChildAt(balanceContainer, stage.getChildIndex(stage.getChildByName('mainContainer')) + 1);
        balanceContainer.cache(0, 0, utils.width, utils.height);

        storage.write('currentBalance', balanceData);
        setTimeout(updateBalance, 500); // Для того чтобы подгрузились шрифты и отобразить нужным шрифтом.

    }

    function writeCashBalance(container) {

        const currentBalance = storage.read('currentBalance');

        let coinsCash = new c.Text(currencySymbol + currentBalance.coinsCash, parameters.font, parameters.color).set(parameters.coinsCash);
        let betCash = new c.Text(currencySymbol + currentBalance.betCash, parameters.font, parameters.color).set(parameters.betCash);
        let winCash = new c.Text(currencySymbol + currentBalance.winCash, parameters.font, parameters.color).set(parameters.winCash);
        let coinsCashText = new c.Text('Cash:', parameters.font, parameters.greyColor).set(parameters.coinsCashText);
        let betCashText = new c.Text('Bet:', parameters.font, parameters.greyColor).set(parameters.betCashText);
        let winCashText = new c.Text('Win:', parameters.font, parameters.greyColor).set(parameters.winCashText);

        container.addChild(coinsCashText, betCashText, winCashText, coinsCash, betCash, winCash);

        makeTextDelta(coinsCashText, coinsCash, config.textDelta);

    }

    function updateBalance() {

        if (balanceText.coinsSum.text !== balanceData.coinsSum) {
            balanceText.coinsSum.text = balanceData.coinsSum;
        }
        if (balanceText.betSum.text !== balanceData.betSum) {
            balanceText.betSum.text = balanceData.betSum;
        }
        if (balanceText.coinsCash.text.toString().slice(1) !== balanceData.coinsCash) {
            balanceText.coinsCash.text = currencySymbol + balanceData.coinsCash;
        }
        if (balanceText.betCash.text.toString().slice(1) !== balanceData.betCash) {
            balanceText.betCash.text = currencySymbol + balanceData.betCash;
        }
        if (balanceText.winCash.text.toString().slice(1) !== balanceData.winCash) {
            balanceText.winCash.text = currencySymbol + balanceData.winCash;
        }

        if (storage.read('isMobile')) {

            makeTextDelta(balanceText.coinsSumText, balanceText.coinsSum, config.textDelta);

        } else {

            if (balanceText.coinsValue.text !== balanceData.coinsValue) {
                balanceText.coinsValue.text = balanceData.coinsValue;
            }
            if (balanceText.betValue.text !== balanceData.betValue) {
                balanceText.betValue.text = balanceData.betValue;
            }

        }

        makeTextDelta(balanceText.coinsCashText, balanceText.coinsCash, config.textDelta);

        balanceContainer.updateCache();
        storage.write('currentBalance', balanceData);

    }

    function changeBet(moreOrLess, maxBetFlag) {

        if (maxBetFlag) {

            balanceData.betValue = balanceData.betSteps[balanceData.betSteps.length - 1];

        } else if (moreOrLess === true && balanceData.betValue !== balanceData.betSteps[balanceData.betSteps.length - 1]) {

            let i = balanceData.betSteps.length;
            while (i >= 0) {
                if (balanceData.betSteps[i] === balanceData.betValue) {
                    balanceData.betValue = balanceData.betSteps[i + 1];
                    i = -1;
                }
                i--;
            }

        } else if (moreOrLess === false && balanceData.betValue !== balanceData.betSteps[0]) {

            let i = balanceData.betSteps.length;
            while (i >= 0) {
                if (balanceData.betSteps[i] === balanceData.betValue) {
                    balanceData.betValue = balanceData.betSteps[i - 1];
                    i = -1;
                }
                i--;
            }

        } else {

            console.warn('Bet change is failed!');

        }

        balanceData.betSum = +(balanceData.betValue * balanceData.linesLength).toFixed(0);
        balanceData.betCash = +(balanceData.betSum * balanceData.coinsValue).toFixed(2);

        updateBalance();

    }

    function changeCoins(moreOrLess, maxBetFlag) {

        if (maxBetFlag) {

            balanceData.coinsValue = balanceData.coinsSteps[balanceData.coinsSteps.length - 1];

        } else if (moreOrLess === true && balanceData.coinsValue !== balanceData.coinsSteps[balanceData.coinsSteps.length - 1]) {

            let i = balanceData.coinsSteps.length;
            while (i >= 0) {
                if (balanceData.coinsSteps[i] === balanceData.coinsValue) {
                    balanceData.coinsValue = balanceData.coinsSteps[i + 1];
                    i = -1;
                }
                i--;
            }

        } else if (moreOrLess === false && balanceData.coinsValue !== balanceData.coinsSteps[0]) {

            let i = balanceData.coinsSteps.length;
            while (i >= 0) {
                if (balanceData.coinsSteps[i] === balanceData.coinsValue) {
                    balanceData.coinsValue = balanceData.coinsSteps[i - 1];
                    i = -1;
                }
                i--;

            }
        } else {

            console.warn('Coins change is failed!');

        }

        balanceData.coinsSum = +Math.floor(balanceData.coinsCash / balanceData.coinsValue).toFixed(0);
        balanceData.betCash = +(balanceData.coinsValue * balanceData.betSum).toFixed(2);

        updateBalance();

    }

    function maxBet() {

        changeBet(true, true);

    }

    function startRoll() {

        if (storage.readState('mode') === 'normal') {
            if (balanceData.coinsSum >= balanceData.betSum) {

                balanceData.coinsSum = (balanceData.coinsSum - balanceData.betSum).toFixed(0);
                balanceData.coinsCash = ((balanceData.coinsCash * 100 - balanceData.betCash * 100) / 100).toFixed(2);
                balanceData.winCash = (0).toFixed(2);
                updateBalance();

            } else {

                storage.changeState('lowBalance', true);
                utils.showPopup('Low money!');
                console.warn('Too low cash for spin!');

            }

        }

    }

    function endRoll() {

        if (storage.readState('mode') === 'normal') {

            const data = storage.read('rollResponse');
            balanceData.winCash = (+data.TotalWinCents / 100).toFixed(2);
            balanceData.coinsCash = (+data.ScoreCents / 100).toFixed(2);
            balanceData.coinsSum = (+data.ScoreCoins).toFixed(0);
            updateBalance();

        }

    }

    return {
        start,
        initBalance,
        writeCashBalance,
        updateBalance,
        changeBet,
        changeCoins,
        maxBet,
        startRoll,
        endRoll
    };

})();
