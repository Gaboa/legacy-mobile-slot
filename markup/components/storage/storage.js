import { events } from 'components/events/events';

export let storage = (function () {

    const store = {};
    const state = {};

    function write(key, value) {

        if (typeof key !== 'string') return;
        store[key] = value;

    }

    function read(key) {

        return typeof store[key] !== 'undefined' && store[key];

    }

    function log() {

        console.log('Store is:', store);

    }

    function changeState(key, value) {

        if (typeof key !== 'string') return;
        state[key] = value;

        console.info(`State '${key}' changed to: ${value}`);
        events.trigger('changeState', key);

    }

    function readState(key) {

        return typeof state[key] !== 'undefined' && state[key];

    }

    function logState() {

        console.log('State is:', state);

    }

    return {

        changeState,
        readState,
        logState,
        write,
        read,
        log

    };

})();
