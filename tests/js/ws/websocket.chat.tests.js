'use strict';

var utils = require('./ws.utils');
var assert = require('assert');

describe('Websocket chat module tests', function () {


    it('should send an error message when remote user is offline', function (done) {

        var testMessage = JSON.stringify({
            type: 'CHAT_MESSAGE',
            remoteUser: 'ws2',
            message: 'Hello'
        });

        var unreachableResponse = JSON.stringify({
            type: 'CHAT_MESSAGE',
            remoteUser: 'ws2',
            sender: '',
            message: '',
            error: 'UNREACHABLE'
        });

        utils.getSocket('ws1', 'password', true, function (ws1) {

            ws1.send(testMessage);

            ws1.on('message', function (message) {
                assert.equal(unreachableResponse, message);
                ws1.close();
                done();
            });

        });

    });

    it('should receive the message in both sockets', function (done) {

        var testMessage = JSON.stringify({
            type: 'CHAT_MESSAGE',
            remoteUser: 'ws2',
            message: 'Hello'
        });

        var ackResponse = JSON.stringify({
            type: 'CHAT_MESSAGE_ACK',
            remoteUser: 'ws2',
            sender: 'ws1',
            message: 'Hello',
            error: ''
        });

        var chatMessage = JSON.stringify({
            type: 'CHAT_MESSAGE',
            remoteUser: 'ws1',
            sender: 'ws1',
            message: 'Hello',
            error: ''
        });

        var count = 0;

        var mayBeDone = function () {
            if (++count === 2) {
                done();
            }
        };

        utils.getSocket('ws2', 'password', true, function (ws2) {
            utils.getSocket('ws1', 'password', true, function (ws1) {

                ws1.send(testMessage);

                ws1.on('message', function (message) {
                    assert.equal(ackResponse, message);
                    ws1.close();
                    mayBeDone();
                });

                ws2.on('message', function (message) {
                    assert.equal(chatMessage, message);
                    ws2.close();
                    mayBeDone();
                });

            });
        });

    });


    it('should not respond when chating with a non reachable user', function (done) {

        var testMessage = JSON.stringify({
            type: 'CHAT_MESSAGE',
            remoteUser: 'ws3',
            message: 'Hello'
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
