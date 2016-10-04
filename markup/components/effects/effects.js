import { storage } from 'components/storage/storage';

export let effects = (function () {

    const c = createjs;

    function drawFonar() {
        const stage = storage.read('stage');
        const loader = storage.read('loadResult');

        const fonar = new c.Bitmap(loader.getResult('fonar')).set({
            name: 'fonar',
            x: 71, // Magic Numbers
            y: 23, // Magic Numbers
            regX: 267 // Magic Numbers
        });
        TweenMax.to(fonar, 2, {
            repeat: -1,
            yoyo: true,
            ease: RoughEase.ease.config({ template: Power0.easeNone, strength: 0.1, points: 10, taper: 'none', randomize: true, clamp: false}), alpha: 0.7
        });

        stage.addChildAt(fonar, stage.getChildIndex(stage.getChildByName('mainContainer')) + 1);

    }

    return {
        drawFonar
    };
})();
