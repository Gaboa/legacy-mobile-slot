import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';
import { config } from 'components/menu/menu';

const c = createjs;
export function showSettingsMenu() {
    const loader = storage.read('loadResult');
    const ss = loader.getResult('menu');
    const setSS = loader.getResult('settings');
    let pointsY = [160, 315, 480];  // Magic Numbers
    let deltaX;

    const menuSettingsTitle = new c.Sprite(ss, 'settings').set({
        name: 'menuSettingsTitle',
        y: 45 // Magic Numbers
    });
    utils.getCenterPoint(menuSettingsTitle);
    utils.setInCenterOf(menuSettingsTitle, config.menuWidth);

    const soundButton = new c.Sprite(setSS, 'sound_on').set({
        name: 'soundButton',
        y: pointsY[0]
    });
    utils.getCenterPoint(soundButton);
    if (!storage.readState('sound')) {
        soundButton.gotoAndStop('sound_off');
    }
    deltaX = (config.menuWidth - soundButton.getBounds().width * 2) / 3;
    soundButton.x = deltaX + soundButton.getBounds().width / 2;
    const soundText = new c.Sprite(setSS, 'sound').set({
        name: 'soundText',
        x: soundButton.x,
        y: soundButton.y + soundButton.getBounds().height / 2 + config.captionDelta
    });
    utils.getCenterPoint(soundText);

    soundButton.on('click', handleSoundClick);

    const musicButton = new c.Sprite(setSS, 'music_on').set({
        name: 'musicButton',
        x: 2 * deltaX + 1.5 * soundButton.getBounds().width,
        y: pointsY[0]
    });
    if (!storage.readState('music')) {
        musicButton.gotoAndStop('music_off');
    }
    utils.getCenterPoint(musicButton);
    const musicText = new c.Sprite(setSS, 'music').set({
        name: 'musicText',
        x: musicButton.x,
        y: musicButton.y + musicButton.getBounds().height / 2 + config.captionDelta
    });
    utils.getCenterPoint(musicText);
    musicButton.on('click', handleMusicClick);

    const fastSpinButton = new c.Sprite(setSS, 'fastSpin_off').set({
        name: 'fastSpinButton',
        x: deltaX + soundButton.getBounds().width / 2,
        y: pointsY[1]
    });
    if (storage.readState('fastSpinSetting')) {
        fastSpinButton.gotoAndStop('fastSpin_on');
    }
    utils.getCenterPoint(fastSpinButton);
    const fastSpinText = new c.Sprite(setSS, 'fastSpin').set({
        name: 'fastSpinText',
        x: fastSpinButton.x,
        y: fastSpinButton.y + fastSpinButton.getBounds().height / 2 + config.captionDelta
    });
    utils.getCenterPoint(fastSpinText);
    fastSpinButton.on('click', handleFastSpinClick);

    const handModeButton = new c.Sprite(setSS, 'handMode_on').set({
        name: 'handModeButton',
        x: 2 * deltaX + 1.5 * soundButton.getBounds().width,
        y: pointsY[1]
    });
    if (storage.readState('side') === 'left') {
        handModeButton.gotoAndStop('handMode_off');
    }
    utils.getCenterPoint(handModeButton);
    const handModeText = new c.Sprite(setSS, 'handMode').set({
        name: 'handModeText',
        x: handModeButton.x,
        y: handModeButton.y + handModeButton.getBounds().height / 2 + config.captionDelta
    });
    utils.getCenterPoint(handModeText);
    handModeButton.on('click', handleHandModeClick);

    const infoButton = new c.Sprite(setSS, 'info_on').set({
        name: 'infoButton',
        x: deltaX + soundButton.getBounds().width / 2,
        y: pointsY[2]
    });
    utils.getCenterPoint(infoButton);
    const infoText = new c.Sprite(setSS, 'info').set({
        name: 'infoText',
        x: infoButton.x,
        y: infoButton.y + infoButton.getBounds().height / 2 + config.captionDelta
    });
    utils.getCenterPoint(infoText);
    infoButton.on('click', handleInfoClick);

    const historyButton = new c.Sprite(setSS, 'history_off').set({
        name: 'historyButton',
        x: 2 * deltaX + 1.5 * soundButton.getBounds().width,
        y: pointsY[2]
    });
    utils.getCenterPoint(historyButton);
    const historyText = new c.Sprite(setSS, 'history').set({
        name: 'historyText',
        x: historyButton.x,
        y: historyButton.y + historyButton.getBounds().height / 2 + config.captionDelta
    });
    utils.getCenterPoint(historyText);
    historyButton.on('click', handleHistoryClick);

    let stage = storage.read('stage');
    let menuContainer = stage.getChildByName('menuContainer');
    menuContainer.addChild(
        menuSettingsTitle,
        soundButton,
        soundText,
        musicButton,
        musicText,
        fastSpinButton,
        fastSpinText,
        handModeButton,
        handModeText,
        infoButton,
        infoText,
        historyButton,
        historyText
    );
}

function handleSoundClick() {
    const stage = storage.read('stage');
    const buttonsContainer = stage.getChildByName('buttonsContainer');
    const buttonsCache = buttonsContainer.getChildByName('buttonsCache');
    const soundButton = buttonsCache.getChildByName('soundButton');
    if (storage.readState('sound')) {
        storage.changeState('sound', false);
        createjs.Sound.muted = true;
        this.gotoAndStop('sound_off');
        soundButton.gotoAndStop('soundOff');
        buttonsCache.updateCache();
    } else {
        storage.changeState('sound', true);
        createjs.Sound.muted = false;
        this.gotoAndStop('sound_on');
        soundButton.gotoAndStop('soundOut');
        buttonsCache.updateCache();
    }
}

function handleMusicClick() {
    if (storage.readState('music')) {
        storage.changeState('music', false);
        this.gotoAndStop('music_off');
        const ambient = storage.read('ambient');
        ambient.volume = 0;
    } else {
        storage.changeState('music', true);
        this.gotoAndStop('music_on');
        const ambient = storage.read('ambient');
        ambient.volume = 1;
    }
}

function handleFastSpinClick() {
    if (storage.readState('fastSpinSetting')) {
        storage.changeState('fastSpinSetting', false);
        this.gotoAndStop('fastSpin_off');
    } else {
        storage.changeState('fastSpinSetting', true);
        this.gotoAndStop('fastSpin_on');
    }
}

function handleHandModeClick() {
    if (storage.readState('side') === 'left') {
        events.trigger('menu:changeSide', 'right');
        this.gotoAndStop('handMode_on');
    } else {
        events.trigger('menu:changeSide', 'left');
        this.gotoAndStop('handMode_off');
    }
}

function handleInfoClick() {
    const loader = storage.read('loadResult');
    const stage = storage.read('stage');
    const rules = new c.Bitmap(loader.getResult('rules'));
    rules.on('click', function () {
        TweenMax.to(rules, 0.5, {alpha: 0, onComplete: function () {
            stage.removeChild(rules);
        }});
    });
    stage.addChild(rules);
}

function handleHistoryClick() {
    $('.history').toggleClass('closed');
}

$('.history__button').click((event) => {
    $('.history').toggleClass('closed');
});
