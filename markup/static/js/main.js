import { events } from 'components/events/events';
import { storage } from 'components/storage/storage';
import { utils } from 'components/utils/utils';

import { init } from 'components/init/init';
import { canvas } from 'components/canvas/canvas';
import { preloader } from 'components/preloader/preloader';
import { bg } from 'components/bg/bg';
import { balance } from 'components/balance/balance';
import { buttons } from 'components/buttons/buttons';
import { controls } from 'components/controls/controls';
import { menu } from 'components/menu/menu';
import { autoplay } from 'components/autoplay/autoplay';
import { roll } from 'components/roll/roll';
import { win } from 'components/win/win';
import { bonuses } from 'components/bonuses/bonuses';
import { freeSpin } from 'components/freeSpin/freeSpin';

// Init Module
init.start({
    userID: 1,
    casinoID: 1,
    mode: 'normal',
    device: 'mobile'
});
init.login();

// Canvas Module
canvas.start({
    canvas: '#game',
    mouseOver: 0,
    leftToRight: 150,
    timeToSlide: 0.5
});
events.on('init:inited', canvas.initStage);
events.on('menu:changeSide', canvas.changeSide);
events.on('preloader:goFullscreen', canvas.fullScreen);

// Preloader Module
preloader.start();
events.on('canvas:stage', preloader.startPreloader);
events.on('preloader:done', () => {
    if (storage.read('savedFS')) {
        events.trigger('initFreeSpins', storage.read('savedFS'));
    }
    if (storage.read('savedBonus')) {
        events.trigger('initBonusLevel', storage.read('savedBonus'));
    }
});

// BG Module
bg.start();
events.on('preloader:loaded', bg.drawMainBG);
// events.on('menu:changeSide', bg.changeSide);

// Balance Module
balance.start();
events.on('bg:main', balance.initBalance);
events.on('menu:changeBet', balance.changeBet);
events.on('menu:changeCoins', balance.changeCoins);
events.on('menu:maxBet', balance.getMaxBet);
events.on('roll:started', balance.startRoll);
events.on('roll:ended', balance.endRoll);

// Autoplay Module
autoplay.start({

});
events.on('autoplay:startRoll', roll.startRoll);
events.on('menu:startAutoplay', autoplay.initAutoplay);
events.on('initBonusLevel', autoplay.stopAutoplay);
events.on('initFreeSpins', autoplay.stopAutoplay);
events.on('buttons:stopAutoplay', autoplay.stopAutoplay);

// Buttons Module
buttons.start({
    buttonsX: 1080,
    buttonsLeftX: 14,
    buttonsWidth: 300
});
events.on('bg:main', buttons.drawButtons);
events.on('buttons:startRoll', roll.startRoll);
events.on('buttons:stopAutoplay', buttons.removeAutoplay);
events.on('menu:changeSide', buttons.changeSide);
events.on('autoplay:started', buttons.writeAutoplay);
events.on('autoplay:count', buttons.updateAutoplay);
events.on('autoplay:ended', buttons.removeAutoplay);
events.on('roll:started', buttons.startRoll);
events.on('roll:fastRoll', buttons.fastRoll);
events.on('roll:ended', buttons.endRoll);
events.on('initFreeSpins', buttons.changeVisibility);
events.on('finishFreeSpins', buttons.changeVisibility);
events.on('finishFreeSpins', buttons.removeAutoplay);

// Controls Module
if (storage.read('device') === 'desktop') {
    controls.start();
    events.on('bg:main', controls.drawControlsPanel);
}

// Menu Module
menu.start({
    menuWidth: 300,
    borderWidth: 3,
    slideTime: 0.5,
    plusMinusDelta: 8,
    dividerDelta: 8,
    captionDelta: 15
});
events.on('menu:startAutoplay', menu.hideMenu);
events.on('menu:changeSide', menu.hideMenu);
events.on('buttons:showMenu', menu.showMenu);
events.on('menu:changeSide', menu.changeSide);
events.on('bg:changeSide', menu.changeSide);

// Roll Module
roll.start();
events.on('bg:main', roll.initScreen);
events.on('buttons:fastRoll', roll.fastRoll);

// Win Module
win.start();
events.on('roll:firstScreen', win.initWin);
events.on('roll:started', win.startRoll);
events.on('roll:ended', win.endRoll);
events.on('win:lineByLine', win.drawAnotherLine);
events.on('win:lineLight', win.finishLineLight);
events.on('win:anotherLine', win.showNextLine);
events.on('roll:fsMultiplier', win.showMulti);

// Free Spins Module
freeSpin.start();


export { storage };
export { events };
