/*global App*/
define(function () {
    'use strict';

    var colorCodes = {};

    var contrast = function (rgb) {
        var o = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
        return (o < 125) ? '#d4edf9' : '#14191f';
    };

    var generateColors = function (tag) {
        if (colorCodes[tag]) {
            return colorCodes[tag];
        }

        var num = Math.round(0xffffff * Math.random());
        var r = num >> 16;
        var g = num >> 8 & 255;
        var b = num & 255;
        colorCodes[tag] = 'background: rgb(' + r + ', ' + g + ', ' + b + '); color:' + contrast([r, g, b]);
        return colorCodes[tag];
    };

    return {
        log: function (tag, message) {
            if (App.debug) {
                if (!message) {
                    message = tag;
                    tag = 'Logger';
                }

                window.console.log('%c [' + tag + '] ' + message, generateColors(tag));
            }
        }
    };
});
