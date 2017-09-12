/*global define*/
define(function () {
    'use strict';
    return {
        SIMPLEWEBHOOK: {
            parameters: [
                {
                    name: 'method',
                    type: 'select',
                    options: ['GET', 'POST', 'PUT']
                },
                {
                    name: 'uri',
                    type: 'text'
                },
                {
                    name: 'authorization',
                    type: 'text'
                }
            ]
        },
        SNSWEBHOOK: {
            parameters: [
                {
                    name: 'region',
                    type: 'text'
                },
                {
                    name: 'topicArn',
                    type: 'text'
                },
                {
                    name: 'awsAccount',
                    type: 'text'
                },
                {
                    name: 'awsSecret',
                    type: 'text'
                }
            ]
        }
    };
})
;
