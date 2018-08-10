/*global casper,urls,homeUrl*/

casper.test.begin('Content type check tests suite', 6, function contentTypeCheckTestsSuite() {

    'use strict';

    var urlsToTest = [
        homeUrl,
        urls.workspaceAdministration,
        urls.changeManagement,
        urls.documentManagement,
        urls.productManagement,
        urls.productStructure
    ];

    var expectedContentType = 'text/html;charset=utf-8';

    urlsToTest.forEach(function (url) {
        casper.thenOpen(url, function homePageLoaded() {
            var contentType = '';
            this.currentResponse.headers.forEach(function (header) {
                if (header.name === 'Content-Type') {
                    contentType = header.value;
                }
            });
            this.test.assertEqual(contentType.replace(/ /g, '').toLowerCase(), expectedContentType, 'Content Type should be "text/html;charset=UTF-8"');
        });
    });

    casper.run(function allDone() {
        return this.test.done();
    });

});
