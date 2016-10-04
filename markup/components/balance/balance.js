import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';

import { parameters } from 'components/balance/parameters';

export let balance = (function () {

    let config;
    const defaultConfig = {
        textDelta: 20,
        bottomLineHeight: 30,
        topLineHeight: 40
    };

    const c = createjs;
    const balanceContainer = new c.Container().set({ name: 'balanceContainer' });
    const balanceTextContainer = new c.Container().set({ name: 'balanceTextContainer' });

    let balanceText = {};
    let balanceData = {};
    let currencySymbol;

    function start(configObj) {
        config = configObj || defaultConfig;
    }

    function initBalance() {

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
        drawPanelButtons();
        writeBalance();

    }

    function drawBalanceBG() {

        const footerBgDown = new c.Shape().set({name: 'footerBgDown'});
        footerBgDown.graphics.beginFill('#000').drawRect(0, utils.height - config.bottomLineHeight, utils.width, config.bottomLineHeight);

        if (storage.read('device') === 'mobile') {
            const footerBgUp = new c.Shape().set({name: 'footerBgUp'});
            footerBgUp.graphics.beginFill('rgba(0, 0, 0, 0.6)').drawRect(0, utils.height - config.bottomLineHeight - config.topLineHeight, utils.width, config.topLineHeight);
            balanceContainer.addChild(footerBgDown, footerBgUp);
        } else if (storage.read('device') === 'desktop') {
            balanceContainer.addChild(footerBgDown);
        }

    }

    function drawPanelButtons() {

        const loader = storage.read('loadResult');
        const balanceButtons = new c.Container().set({ name: 'balanceButtons' });
        let homeButton;

        if (storage.read('device') === 'mobile') {

            homeButton = new c.Bitmap(loader.getResult('home')).set({
                name: 'homeButton',
                x: 15, // Magic Numbers
                y: utils.height - config.topLineHeight / 2 - config.bottomLineHeight
            });
            utils.getCenterPoint(homeButton);

        } else if (storage.read('device') === 'desktop') {

            homeButton = new c.Bitmap(loader.getResult('home')).set({
                name: 'homeButton',
                x: 10, // Magic Numbers
                y: utils.height - config.bottomLineHeight / 2,
                scaleX: 0.6,
                scaleY: 0.6,
                cursor: 'pointer'
            });
            utils.getCenterPoint(homeButton);

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

    function writeBalance() {

        const stage = storage.read('stage');

        if (storage.read('device') === 'mobile') {

            balanceText.coinsSum = new c.Text(balanceData.coinsSum, parameters.font, parameters.orangeColor).set(parameters.coinsSum);
            balanceText.betSum = new c.Text(balanceData.betSum, parameters.font, parameters.orangeColor).set(parameters.betSum);
            balanceText.coinsSumText = new c.Text('Coins:', parameters.bigFont, parameters.color).set(parameters.coinsSumText);
            balanceText.betSumText = new c.Text('Bet:', parameters.bigFont, parameters.color).set(parameters.betSumText);
            makeTextDelta(balanceText.coinsSumText, balanceText.coinsSum, config.textDelta);

        } else if (storage.read('device') === 'desktop') {

            balanceText.coinsSum = new c.Text(balanceData.coinsSum, parameters.font, parameters.orangeColor).set(parameters.desktop.coinsSum);
            balanceText.betSum = new c.Text(balanceData.betSum, parameters.font, parameters.orangeColor).set(parameters.desktop.betSum);
            balanceText.coinsValue = new c.Text(balanceData.coinsValue, parameters.font, parameters.orangeColor).set(parameters.desktop.coinsValue);
            balanceText.betValue = new c.Text(balanceData.betValue, parameters.font, parameters.orangeColor).set(parameters.desktop.betValue);
            balanceTextContainer.addChild(balanceText.coinsValue, balanceText.betValue);

        }

        balanceText.coinsCash = new c.Text(currencySymbol + balanceData.coinsCash, parameters.font, parameters.color).set(parameters.coinsCash);
        balanceText.betCash = new c.Text(currencySymbol + balanceData.betCash, parameters.font, parameters.color).set(parameters.betCash);
        balanceText.winCash = new c.Text(currencySymbol + balanceData.winCash, parameters.font, parameters.color).set(parameters.winCash);

        balanceText.coinsCashText = new c.Text('Cash:', parameters.font, parameters.greyColor).set(parameters.coinsCashText);
        balanceText.betCashText = new c.Text('Bet:', parameters.font, parameters.greyColor).set(parameters.betCashText);
        balanceText.winCashText = new c.Text('Win:', parameters.font, parameters.greyColor).set(parameters.winCashText);
        makeTextDelta(balanceText.coinsCashText, balanceText.coinsCash, config.textDelta);

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
        balanceContainer.cache(0, 0, utils.width, utils.height);
        stage.addChildAt(balanceContainer, stage.getChildIndex(stage.getChildByName('preloaderContainer')));

        storage.write('currentBalance', balanceData);
        setTimeout(updateBalance, 500); // Для того чтобы подгрузились шрифты и отобразить нужным шрифтом.
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

        if (storage.read('device') === 'mobile') {
            makeTextDelta(balanceText.coinsSumText, balanceText.coinsSum, config.textDelta);
        } else if (storage.read('device') === 'desktop') {
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

    function changeBet(moreOrLess, maxBet) {
        if (maxBet) {
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
        console.log('Bet is changed:', balanceData.betValue);
        if (balanceData.betValue === balanceData.betSteps[balanceData.betSteps.length - 1]) {
            console.warn('This bet value is maximum!');
        } else if (balanceData.betValue === balanceData.betSteps[0]) {
            console.warn('This bet value is minimum!');
        }
    }

    function changeCoins(moreOrLess, maxBet) {
        if (maxBet) {
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
        console.log('Coins value is changed:', balanceData.coinsValue);
        if (balanceData.coinsValue === balanceData.coinsSteps[balanceData.coinsSteps.length - 1]) {
            console.warn('This coins value is maximum!');
        } else if (balanceData.coinsValue === balanceData.coinsSteps[0]) {
            console.warn('This coins value is minimum!');
        }
    }

    function getMaxBet() {
        changeBet(true, true);
    }

    // Изменение баланса при начале крутки
    function startRoll() {
        if (storage.readState('mode') === 'normal') {
            if (balanceData.coinsSum >= balanceData.betSum) {
                balanceData.coinsSum = (balanceData.coinsSum - balanceData.betSum).toFixed(0);
                balanceData.coinsCash = ((balanceData.coinsCash * 100 - balanceData.betCash * 100) / 100).toFixed(2);
                balanceData.winCash = (0).toFixed(2);
                updateBalance();
            } else {
                storage.changeState('lowBalance', true);
                console.warn('Too low cash for spin!');
                utils.showPopup('Low money!');
            }
        }
    }

    // Изменение баланса в конце крутки
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
        // writeCashBalance,
        updateBalance,
        changeBet,
        changeCoins,
        getMaxBet,
        startRoll,
        endRoll
    };

})();
