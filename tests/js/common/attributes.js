/*global casper,urls*/

casper.test.begin('Document creation with attributes', 2, function documentCreationWithAttributes() {
    'use strict';

    casper.clear();

    /**
     * Open document management URL
     * */

    casper.open(urls.documentManagement);

    /**
     * Open modal for new document
     */
    casper.then(function () {
        var newDocumentButtonSelector = '#document-management-content .new-document';
        return this.waitForSelector(newDocumentButtonSelector, function () {
            this.click(newDocumentButtonSelector);
        }, function () {
            this.capture('screenshot/attributes/clickOnNewDocument-error.png');
            this.test.assert(false, 'newDocumentButton id not clickable');
        });

    });

    casper.then(function openModal() {
        var attributesTabSelector = '.nav.nav-tabs > li:nth-child(3) > a';
        return this.waitForSelector(attributesTabSelector, function () {
            this.click(attributesTabSelector);

        }, function () {
            this.capture('screenshot/attributes/clickOnAttributeTab-error.png');
            this.test.assert(false, 'Attribute tab cannot be found');
        });
    });
    /**
     * Add Attribute
     */
    casper.then(function () {
        return this.waitForSelector('.nav.nav-tabs > li:nth-child(3).active', function () {
            this.click('.btn.add');
        }, function () {
            this.capture('screenshot/attributes/attributeTabBecomeActive-error.png');
            this.test.assert(false, 'Attribute tab not appearing');
        });
    });

    casper.then(function () {
        return this.waitForSelector('.list-item.well', function () {
            this.test.assertElementCount('.list-item.well', 1);
            this.click('.btn.btn-default.cancel');
        }, function () {
            this.capture('screenshot/attributes/addAttribute-error.png');
            this.test.assert(false, 'Attribute not appearing in the list');
        });
    });


    /**
     * Same test on Part
     */


    casper.then(function () {
        return this.open(urls.productManagement);
    });

    /**
     * Go to part nav
     */
    casper.then(function waitForPartNavLink() {
        return this.waitForSelector('#part-nav > .nav-list-entry > a', function clickPartNavLink() {
            this.click('#part-nav > .nav-list-entry > a');
        }, function fail() {
            this.capture('screenshot/partCreation/waitForPartNavLink-error.png');
            this.test.assert(false, 'Part nav link can not be found');
        });
    });

    /**
     * Open the part creation modal
     */
    casper.then(function waitForNewPartButton() {
        return this.waitForSelector('.actions .new-part', function clickNewPartButton() {
            this.click('.actions .new-part');
        }, function fail() {
            this.capture('screenshot/partCreation/waitForNewPartButton-error.png');
            this.test.assert(false, 'New part button can not be found');
        });
    });

    casper.then(function openModal() {
        var attributesTabSelector = '.nav.nav-tabs > li:nth-child(3) > a';
        return this.waitForSelector(attributesTabSelector, function () {
            this.click(attributesTabSelector);

        }, function () {
            this.capture('screenshot/attributes/clickOnAttributeTab-error.png');
            this.test.assert(false, 'Attribute tab cannot be found');
        });
    });
    /**
     * Add Attribute
     */
    casper.then(function () {
        return this.waitForSelector('.nav.nav-tabs > li:nth-child(3).active', function () {
            this.click('.btn.add');
        }, function () {
            this.capture('screenshot/attributes/attributeTabBecomeActive-error.png');
            this.test.assert(false, 'Attribute tab not appearing');
        });
    });


    casper.then(function () {
        return this.waitForSelector('.list-item.well', function () {
            this.test.assertElementCount('.list-item.well', 1);
            this.click('.btn[data-dismiss="modal"]');
        }, function () {
            this.capture('screenshot/attributes/addAttribute-error.png');
            this.test.assert(false, 'Attribute not appearing in the list');
        });
    });


    casper.run(function allDone() {
        return this.test.done();
    });
});
