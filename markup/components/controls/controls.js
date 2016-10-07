import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';

export let controls = (function () {

    const c = createjs;

    function drawControlsBG() {

        let loader = storage.read('loadResult');
        let mainContainer = storage.read('mainContainer');

        let controlsContainer = new c.Container().set({ name: 'controlsContainer' });
        mainContainer.addChild(controlsContainer);

        let controlsBG = new c.Bitmap(loader.getResult('controlsBG')).set({
            name: 'controlsBG',
            x: 8, // Magic Numbers
            y: 621 // Magic Numbers
        });
        controlsContainer.addChild(controlsBG);

        drawControlsButtons();

    }

    function handleSpinClick() {
        if (storage.readState('lockedMenu')) return;
        if (storage.readState('autoplay') === 'started') return;
        if (utils.lowBalance()) {
            utils.showPopup('Low balance!');
            return;
        }

        const rollState = storage.readState('roll');
        const fastRoll = storage.readState('fastRoll');
        const lockedRoll = storage.readState('lockedRoll');
        if (!lockedRoll) {
            if (rollState !== 'started') {
                events.trigger('buttons:startRoll');
                this.gotoAndStop('spinOn');
            }
            if (fastRoll) {
                this.gotoAndStop('spinOff');
                storage.changeState('fastRoll', 'enabled');
            }
        }
    }

    function handleMinusBetClick() {
        if (storage.readState('lockedMenu')) return;
        if (storage.readState('roll') === 'started') return;
        if (this.currentAnimation === 'minusOff') return;
        this.gotoAndStop('minusOn');
        events.trigger('menu:changeBet', false);
        createjs.Sound.play('buttonClickSound');
    }
    function handlePlusBetClick() {
        if (storage.readState('lockedMenu')) return;
        if (storage.readState('roll') === 'started') return;
        if (this.currentAnimation === 'plusOff') return;
        this.gotoAndStop('plusOn');
        events.trigger('menu:changeBet', true);
        createjs.Sound.play('buttonClickSound');
    }
    function handleMinusCoinsClick() {
        if (storage.readState('lockedMenu')) return;
        if (storage.readState('roll') === 'started') return;
        if (this.currentAnimation === 'minusOff') return;
        this.gotoAndStop('minusOn');
        events.trigger('menu:changeCoins', false);
        createjs.Sound.play('buttonClickSound');
    }
    function handlePlusCoinsClick() {
        if (storage.readState('lockedMenu')) return;
        if (storage.readState('roll') === 'started') return;
        if (this.currentAnimation === 'plusOff') return;
        this.gotoAndStop('plusOn');
        events.trigger('menu:changeCoins', true);
        createjs.Sound.play('buttonClickSound');
    }

    function handleMaxbetClick() {
        if (storage.readState('lockedMenu')) return;
        if (storage.readState('roll') === 'started') return;
        if (this.currentAnimation === 'maxbetOff') return;

        createjs.Sound.play('buttonClickSound');
        this.gotoAndStop('maxbetOn');
        events.trigger('menu:maxBet');
    }

    function handleAutoClick() {
        if (storage.readState('lockedMenu')) return;

        if (storage.readState('roll') !== 'started' && this.currentAnimation !== 'autoStopHover') {
            createjs.Sound.play('buttonClickSound');
            // storage.changeState('menu', 'auto');
            events.trigger('buttons:showMenu', 'auto');
        }
        if (this.currentAnimation === 'autoStopHover') {
            createjs.Sound.play('buttonClickSound');
            storage.changeState('autoplay', 'ended');
            events.trigger('autoplay:ended');
        }
    }

    function handleHoverState(button, name) {

        button.on('rollover', (e) => {
            if (storage.readState('roll') === 'started') return;
            if (storage.readState('autoplay') === 'started') return;
            button.gotoAndStop(name + 'Hover');
        });
        button.on('rollout', (e) => {
            if (storage.readState('roll') === 'started') return;
            if (storage.readState('autoplay') === 'started') return;
            button.gotoAndStop(name + 'Out');
        });
    }

    function handleAutoHoverState(button) {
        button.on('rollover', (e) => {
            if (storage.readState('autoplay') === 'started') {
                button.gotoAndStop('autoStopHover');
            } else if (storage.readState('autoplay') === false || storage.readState('autoplay') === 'ended') {
                if (storage.readState('roll') === 'started') return;
                button.gotoAndStop('autoHover');
            }
        });
        button.on('rollout', (e) => {
            if (storage.readState('autoplay') === 'started') {
                button.gotoAndStop('autoStopOut');
            } else if (storage.readState('autoplay') === false || storage.readState('autoplay') === 'ended') {
                if (storage.readState('roll') === 'started') return;
                button.gotoAndStop('autoOut');
            }
        });
    }

    function drawControlsButtons() {

        let loader = storage.read('loadResult');
        let mainContainer = storage.read('mainContainer');
        let controlsContainer = mainContainer.getChildByName('controlsContainer');
        let buttonsSS = loader.getResult('controlsButtons');

        let controlsButtons = new c.Container().set({ name: 'controlsButtons' });

        let spinButton = new c.Sprite(buttonsSS, 'spinOut').set({
            name: 'spinButton',
            x: 501,
            y: 685,
            scaleX: 0.8,
            scaleY: 0.8,
            cursor: 'pointer'
        });
        utils.getCenterPoint(spinButton);
        handleHoverState(spinButton, 'spin');
        spinButton.on('click', handleSpinClick);

        let autoButton = new c.Sprite(buttonsSS, 'autoOut').set({
            name: 'autoButton',
            x: 363,
            y: 695,
            scaleX: 0.74,
            scaleY: 0.74,
            cursor: 'pointer'
        });
        utils.getCenterPoint(autoButton);
        handleAutoHoverState(autoButton);
        autoButton.on('click', handleAutoClick);

        let maxbetButton = new c.Sprite(buttonsSS, 'maxbetOut').set({
            name: 'maxbetButton',
            x: 639,
            y: 695,
            scaleX: 0.74,
            scaleY: 0.74,
            cursor: 'pointer'
        });
        utils.getCenterPoint(maxbetButton);
        handleHoverState(maxbetButton, 'maxbet');
        maxbetButton.on('click', handleMaxbetClick);

        let minusBetButton = new c.Sprite(buttonsSS, 'minusOut').set({
            name: 'minusBetButton',
            x: 176,
            y: 702,
            scaleX: 0.75,
            scaleY: 0.75,
            cursor: 'pointer'
        });
        utils.getCenterPoint(minusBetButton);
        handleHoverState(minusBetButton, 'minus');
        minusBetButton.on('click', handleMinusBetClick);

        let minusCoinsButton = new c.Sprite(buttonsSS, 'minusOut').set({
            name: 'minusCoinsButton',
            x: 732,
            y: 702,
            scaleX: 0.75,
            scaleY: 0.75,
            cursor: 'pointer'
        });
        utils.getCenterPoint(minusCoinsButton);
        handleHoverState(minusCoinsButton, 'minus');
        minusCoinsButton.on('click', handleMinusCoinsClick);

        let plusBetButton = new c.Sprite(buttonsSS, 'plusOut').set({
            name: 'plusBetButton',
            x: 273,
            y: 702,
            scaleX: 0.75,
            scaleY: 0.75,
            cursor: 'pointer'
        });
        utils.getCenterPoint(plusBetButton);
        handleHoverState(plusBetButton, 'plus');
        plusBetButton.on('click', handlePlusBetClick);

        let plusCoinsButton = new c.Sprite(buttonsSS, 'plusOut').set({
            name: 'plusCoinsButton',
            x: 829,
            y: 702,
            scaleX: 0.75,
            scaleY: 0.75,
            cursor: 'pointer'
        });
        utils.getCenterPoint(plusCoinsButton);
        handleHoverState(plusCoinsButton, 'plus');
        plusCoinsButton.on('click', handlePlusCoinsClick);

        controlsButtons.addChild(
            spinButton,
            autoButton,
            maxbetButton,
            minusBetButton,
            minusCoinsButton,
            plusBetButton,
            plusCoinsButton
        );

        controlsContainer.addChild(controlsButtons);

    }

    return {
        drawControlsBG
    };

})();
