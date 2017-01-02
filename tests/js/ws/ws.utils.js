'use strict';

var http = require('http');
var WebSocket = require('ws');

module.exports = {

    getSocket: function (login, password, autoConnect, callback) {

        var options = {
            hostname: 'localhost',
            port: 8080,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        var req = http.request(options, function (res) {

            if (res.statusCode === 200) {

                var jwt = res.headers.jwt;
                var cookie = res.headers['set-cookie'];

                var ws = new WebSocket('ws://localhost:8080/ws', {
                    headers: {
                        Cookie: cookie
                    }
                });

                if (autoConnect) {

                    ws.on('open', function open() {

                        ws.send(JSON.stringify({
                            type: 'AUTH',
                            jwt: jwt
                        }), function () {
                            callback(ws);
                        });

                    });

                } else {
                    callback(ws);
                }


            }

        });

        req.write(JSON.stringify({
            login: login,
            password: password
        }));

        req.end();


    }

};
