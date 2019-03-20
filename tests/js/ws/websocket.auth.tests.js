'use strict';

/**
 *
 * curl 'http://localhost:8080/api/accounts/create' -H 'Content-Type: application/json' --data '{"login":"ws1","name":"ws2","email":"test@localhost","language":"fr","timeZone":"CET","newPassword":"password"}'
 *
 */

var utils = require('./ws.utils');
var assert = require('assert');

describe('Websocket authentication tests', function () {

    var testMessage = JSON.stringify({type: 'USER_STATUS', remoteUser: 'ws2'});
    var expectedResponse = JSON.stringify({type: 'USER_STATUS', remoteUser: 'ws2', status: 'USER_STATUS_OFFLINE'});

    it('should close when not authenticated', function (done) {

        utils.getSocket('ws1', 'password', false, function (ws) {

            ws.on('open', function () {
                ws.send(testMessage);
            });

            ws.on('close', function () {
                assert(true, 'Websocket closed');
                done();
            });

        });

    });

    it('should not close when authenticated', function (done) {

        utils.getSocket('ws1', 'password', true, function (ws) {

            ws.send(testMessage);

            ws.on('message', function (message) {
                assert.equal(message, expectedResponse, 'Response should be ' + expectedResponse);
                ws.close();
                done();
            });

        });

    });

});
