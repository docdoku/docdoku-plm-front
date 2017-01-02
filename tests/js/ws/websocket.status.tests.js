'use strict';

var utils = require('./ws.utils');
var assert = require('assert');

describe('Websocket status module tests', function () {


    it('should tell user2 is offline', function (done) {

        var testMessage = JSON.stringify({
            type: 'USER_STATUS',
            remoteUser: 'ws2'
        });

        var offlineResponse = JSON.stringify({
            type: 'USER_STATUS',
            remoteUser: 'ws2',
            status: 'USER_STATUS_OFFLINE'
        });

        utils.getSocket('ws1', 'password', true, function (ws1) {

            ws1.send(testMessage);

            ws1.on('message', function (message) {
                assert.equal(offlineResponse, message);
                ws1.close();
                done();
            });

        });

    });

    it('should tell user2 is online', function (done) {

        var testMessage = JSON.stringify({
            type: 'USER_STATUS',
            remoteUser: 'ws2'
        });

        var onlineResponse = JSON.stringify({
            type: 'USER_STATUS',
            remoteUser: 'ws2',
            status: 'USER_STATUS_ONLINE'
        });

        utils.getSocket('ws2', 'password', true, function (ws2) {
            utils.getSocket('ws1', 'password', true, function (ws1) {

                ws1.send(testMessage);

                ws1.on('message', function (message) {
                    assert.equal(onlineResponse, message);
                    ws1.close();
                    ws2.close();
                    done();
                });

            });
        });

    });


    it('should not respond when asking for a non reachable user', function (done) {

        var testMessage = JSON.stringify({
            type: 'USER_STATUS',
            remoteUser: 'foo'
        });


        utils.getSocket('ws1', 'password', true, function (ws1) {

            ws1.send(testMessage);

            ws1.on('message', function () {
                assert(false, 'Should not have been called');
                ws1.close();
            });

            // Assume 1 second is enough
            setTimeout(function () {
                assert(true, 'Server did not respond');
                ws1.close();
                done();
            }, 1000);

        });

    });


});
