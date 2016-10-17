import { utils } from 'components/utils/utils';
import { storage } from 'components/storage/storage';
import { events } from 'components/events/events';

const c = createjs;

export function handleSpinClick() {
    if (storage.readState('autoplay') === 'started') return;
    const buttonsCache = storage.read('stage').getChildByName('buttonsContainer').getChildByName('buttonsCache');
    let that = this;
    if (storage.readState('lockedMenu')) return;
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
            that.gotoAndStop('spinOff');
            TweenMax.to(that, 0.5, {rotation: -45});
        }
        if (fastRoll) {
            that.gotoAndStop('spinOff');
            storage.changeState('fastRoll', 'enabled');
            events.trigger('buttons:fastRoll', 'enabled');
            TweenMax.to(that, 0.5, {rotation: 0});
        }
    }
}

export function handleSoundClick() {
    const buttonsCache = storage.read('stage').getChildByName('buttonsContainer').getChildByName('buttonsCache');
    let that = this;
    // if (storage.readState('lockedMenu')) return;

    // if (storage.readState('roll') !== 'started') {
        const sound = storage.readState('sound');
        if (sound) {
            that.gotoAndStop('soundOff');
            storage.changeState('sound', false);
            c.Sound.muted = true;
        } else {
            that.gotoAndStop('soundOut');
            storage.changeState('sound', true);
            c.Sound.muted = false;
        }
        buttonsCache.updateCache();
    // }
}

export function handleMenuClick() {
    const buttonsCache = storage.read('stage').getChildByName('buttonsContainer').getChildByName('buttonsCache');
    if (storage.readState('lockedMenu')) return;

    if (storage.readState('roll') !== 'started') {
        c.Sound.play('buttonClickSound');
        storage.changeState('menu', 'settings');
        events.trigger('buttons:showMenu', 'settings');
    }
}

export function handleAutoClick() {
    const buttonsCache = storage.read('stage').getChildByName('buttonsContainer').getChildByName('buttonsCache');
    let that = this;
    if (storage.readState('lockedMenu')) return;

    if (storage.readState('roll') !== 'started' && that.currentAnimation !== 'autoStop') {
        c.Sound.play('buttonClickSound');
        storage.changeState('menu', 'auto');
        events.trigger('buttons:showMenu', 'auto');
    }
    if (that.currentAnimation === 'autoStop') {
        c.Sound.play('buttonClickSound');
        storage.changeState('autoplay', 'ended');
        events.trigger('buttons:stopAutoplay');
    }
}

export function handleBetClick() {
    const buttonsCache = storage.read('stage').getChildByName('buttonsContainer').getChildByName('buttonsCache');
    if (storage.readState('lockedMenu')) return;

    if (storage.readState('roll') !== 'started') {
        c.Sound.play('buttonClickSound');
        storage.changeState('menu', 'bet');
        events.trigger('buttons:showMenu', 'bet');
    }
}
