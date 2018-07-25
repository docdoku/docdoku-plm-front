/*global casper,urls,products*/

casper.test.begin('Part checkin tests suite', 3, function partCheckinTestsSuite() {
    'use strict';

    casper.clear();

    /**
     * Open product management URL
     * */

    casper.open(urls.productManagement);

    /**
     * Go to part nav
     */
    casper.then(function waitForPartNavLink() {
        return this.waitForSelector('#part-nav > .nav-list-entry > a', function clickPartNavLink() {
            this.click('#part-nav > .nav-list-entry > a');
        }, function fail() {
            this.capture('screenshot/partCheckin/waitForPartNavLink-error.png');
            this.test.assert(false, 'Part nav link can not be found');
        });
    });

    /**
     * Select the first part with checkbox
     */
    casper.then(function waitForPartTable() {
        return this.waitForSelector('#part_table tbody tr:first-child  td:nth-child(2) input', function clickOnPartCheckbox() {
            this.click('#part_table tbody tr:first-child  td:nth-child(2) input');
        }, function fail() {
            this.capture('screenshot/partCheckin/waitForPartTable-error.png');
            this.test.assert(false, 'Part can not be found');
        });
    });

   casper.then(function(){
        return this.waitUntilVisible('.nav-checkedOut-number-item.badge-custom',function(){
            this.test.assertSelectorHasText('.nav-checkedOut-number-item.badge-custom', 1, 'checkout number at 1 in nav');
        }, function fail() {
            this.capture('screenshot/partCheckin/waitBadge-error.png');
            this.test.assert(false, 'Badge is not visible');
        });
    });

    /**
     * Click on checkin button
     */
    casper.then(function waitForCheckinButton() {
        return this.waitForSelector('.actions .checkin:not([disabled])', function clickOnCheckinButton() {
            this.click('.actions .checkin');
        }, function fail() {
            this.capture('screenshot/partCheckin/waitForCheckinButton-error.png');
            this.test.assert(false, 'Checkin button can not be found');
        });
    });

    /**
     * Set an iteration note
     */
    casper.then(function waitForIterationNotePrompt() {
        return this.waitForSelector('#prompt_modal #prompt_input.ready', function fillIterationNote() {
            this.sendKeys('#prompt_modal #prompt_input', products.part1.iterationNote, {reset: true});
            this.click('#prompt_modal .modal-footer .btn-primary');
        }, function fail() {
            this.capture('screenshot/partCheckin/waitForIterationNotePrompt-error.png');
            this.test.assert(false, 'Iteration note modal not found');
        });
    });

    /**
     * Wait for the checkin button to be disabled
     */
    casper.then(function waitForCheckinButtonDisabled() {
        return this.waitForSelector('.actions .checkin:disabled', function partIsCheckin() {
            this.test.assert(true, 'Part has been checkin');
        }, function fail() {
            this.capture('screenshot/partCheckin/waitForCheckinButtonDisabled-error.png');
            this.test.assert(false, 'Part has not been checked in');
        });
    });

    /**
     * Wait for the badge info button
     */
    casper.then(function waitForBadgeDisplayed() {
        return this.waitForSelector('.badge.nav-checkedOut-number-item.badge-primary', function badgeDisplayed() {
            this.test.assertSelectorHasText('.nav-checkedOut-number-item', 0, 'Checkout number updated in nav');
        }, function fail() {
            this.capture('screenshot/partCheckin/waitForBadgeDisplayed-error.png');
            this.test.assert(false, 'Checkout number not updated in nav');
        });
    });

    casper.run(function allDone() {
        return this.test.done();
    });

});
