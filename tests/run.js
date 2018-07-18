/*
 * Node script wrapper to execute casper executable
 * execution : node run.js
 * configuration : config.js - override any arguments from command line
 * node run.js --domain=foo.com --port=8383   ...
 * */

'use strict';

var util = require('util');
var fs = require('fs');
var exec = require('child_process').exec;
var _ = require('underscore');
var config = require('./config');
var xml2js = require('xml2js');
var del = require('del');
var argv = require('yargs').argv;

del.sync(['screenshot/**']);

var conf = _.extend(config, argv);
var uuidV4 = require('uuid/v4');
var workspace = uuidV4();

var casperJsBinary = conf.casperjs || __dirname + '/../node_modules/.bin/casperjs';

var casperCommand = casperJsBinary + ' test' +
    ' --ssl-protocol=any --ignore-ssl-errors=true ' +
    ' --web-security=no ' +
    ' --protocol=' + conf.protocol +
    ' --domain=' + conf.domain +
    ' --port=' + conf.port +
    ' --login=' + conf.login +
    ' --pass=' + conf.pass +
    ' --workspace=' + workspace +
    ' --contextPath=' + conf.contextPath +
    ' --requestTimeOut=' + conf.requestTimeOut +
    ' --globalTimeout=' + conf.globalTimeout +
    (conf.debug ? ' --debug=true' : '') +
    (conf.debugRequests ? ' --debugRequests=true' : '') +
    (conf.waitOnRequest ? ' --waitOnRequest=true' : '') +
    (conf.debugResponses ? ' --debugResponses=true' : '') +
    ' --pre=' + conf.pre.join(',') +
    ' --post=' + conf.post.join(',') +
    ' --includes=' + conf.includes.join(',') +
    ' --xunit=' + conf.xunit +
    (conf.failFast ? ' --fail-fast' : '') +
    (conf.verbose ? ' --verbose' : '') +
    ' --log-level=' + conf.logLevel +
    ' ' + conf.paths.join(' ');

if(conf.debug){
    console.log('Running DocdokuPLM tests. Command : \n ' + casperCommand + '\n\n');
}

var child = exec(casperCommand, {maxBuffer: 5 * 1024 * 1024}, function (error) {
    if(error){
        console.log(error);
        return;
    }
    if (conf.soundOnTestsEnd) {
        var parser = new xml2js.Parser();
        fs.readFile(__dirname + '/results.xml', function (err, data) {
            parser.parseString(data, function (err, result) {
                var suites = result.testsuites.testsuite;
                var lastSuite = suites[suites.length - 1];
                if (lastSuite.$.failures !== '0') {
                    exec('cvlc --play-and-exit fail.wav');
                } else {
                    exec('cvlc --play-and-exit success.wav');
                }
            });
        });
    }
});

child.stdout.on('data', console.log);

if(conf.debug){
    child.stderr.on('data', console.error);
}
