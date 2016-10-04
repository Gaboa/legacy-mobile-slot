const c = createjs;

export const parameters = {
    font: '18px Helvetica',
    bigFont: '24px Helvetica',
    color: '#dddddd',
    greyColor: '#888888',
    orangeColor: '#e8b075',
    coinsSum: {
        x: 550,
        y: 655,
        textAlign: 'center',
        font: 'normal 25px Helvetica',
        name: 'coinsSum',
        shadow: new c.Shadow('#e8b075', 0, 0, 15)
    },
    coinsCash: {
        x: 460,
        y: 693,
        textAlign: 'center',
        name: 'coinsCash'
    },
    betSum: {
        x: 700,
        y: 655,
        textAlign: 'center',
        font: 'normal 25px Helvetica',
        name: 'betSum',
        shadow: new c.Shadow('#e8b075', 0, 0, 15)
    },
    betCash: {
        x: 610,
        y: 693,
        textAlign: 'center',
        name: 'betCash'
    },
    winCash: {
        x: 760,
        y: 693,
        textAlign: 'center',
        name: 'winCash'
    },
    coinsCashText: {
        x: 375,
        y: 693
    },
    betCashText: {
        x: 535,
        y: 693
    },
    winCashText: {
        x: 680,
        y: 693
    },
    coinsSumText: {
        name: 'coinsSumText',
        x: 435,
        y: 655
    },
    betSumText: {
        name: 'betSumText',
        x: 625,
        y: 655
    },
    desktop: {
        betSum: {
            x: 315,
            y: 549,
            textAlign: 'center',
            font: 'normal 14px Helvetica',
            name: 'betSum',
            shadow: new c.Shadow('#e8b075', 0, 0, 15)
        },
        coinsSum: {
            x: 925,
            y: 549,
            textAlign: 'center',
            font: 'normal 14px Helvetica',
            name: 'coinsSum',
            shadow: new c.Shadow('#e8b075', 0, 0, 15)
        },
        betValue: {
            x: 350,
            y: 601,
            textAlign: 'center',
            font: 'normal 14px Helvetica',
            name: 'betValue',
            shadow: new c.Shadow('#e8b075', 0, 0, 15)
        },
        coinsValue: {
            x: 854,
            y: 601,
            textAlign: 'center',
            font: 'normal 14px Helvetica',
            name: 'coinsValue',
            shadow: new c.Shadow('#e8b075', 0, 0, 15)
        }
    }
};
