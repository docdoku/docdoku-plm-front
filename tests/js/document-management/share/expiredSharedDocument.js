/*global casper,urls*/

casper.test.begin('Expired private shared document tests suite', 1, function expiredPrivateSharedDocumentTestsSuite() {

    'use strict';

    casper.clear();

    /**
     * Open document management URL
     * */

    casper.open(urls.privateDocumentPermalinkExpired);

    /**
     * Check we have the expired resource page
     */

    casper.then(function checkForExpiredPage() {
        return this.waitForSelector('#not-found-view > h1', function () {
            this.test.assert(true, 'Expired entity page displayed');
        }, function fail() {
            this.capture('screenshot/expiredSharedDocument/checkForExpiredPage-error.png');
            this.test.assert(false, 'Expired shared entity page not displayed');
        });
    });

    casper.run(function allDone() {
        return this.test.done();
    });
});
