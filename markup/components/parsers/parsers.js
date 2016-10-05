import { utils } from 'components/utils/utils';

export let parsers = (function () {

    const names = ['j', 'iJ', 'q', 'iQ', 'k', 'iK', 'a', 'iA', 'wild', 'scatter', 'sw1', 'sw2', 'sw3', 'sw4', 'sw5', 'sw6', 'sw7', 'sw8', 'sw9'];

    function parseWheels(string) {
        const wheelsMas = string.split('|').map((column) => {
            return column.split('@');
        });
        wheelsMas.map((column, columnIndex) => {
            return column.map((element, rowIndex) => {
                if (names.indexOf(element) < 0) {
                    console.error('Unknown symbol!');
                }
                element = names.indexOf(element) + 1;
                column[rowIndex] = element;
            });
        });
        return wheelsMas;
    }

    function parseLines(string) {
        const linesMas = string.split('|').map((line, lineNumber) => {
            return line.split('@').map((coords, index) => {
                return coords.split(',');
            });
        });
        return linesMas;
    }

    function parseLinesCoords(arr) {
        const result = [];
        arr.forEach((line, number) => {
            result[number] = [];
            line.forEach((point, index) => {
                const x = +point[0];
                const y = +point[1];
                const resultX = utils.elementWidth * (x + 0.5);
                const resultY = utils.elementHeight * (y + 0.5);
                const resultCoords = {
                    x: resultX,
                    y: resultY
                };
                result[number][index] = resultCoords;
            });
        });
        return result;
    }

    return {
        wheels: parseWheels,
        lines: parseLines,
        linesCoords: parseLinesCoords
    };

})();
