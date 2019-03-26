/*global casper,urls*/

casper.test.begin('Part template deletion tests suite', 2, function partTemplateDeletionTestsSuite() {
    'use strict';

    casper.clear();

    /**
     * Open product management URL
     * */

    casper.open(urls.productManagement);

    /**
     * Go to part template nav
     */
    casper.then(function waitForPartTemplateNavLink() {
        return this.waitForSelector('#part-template-nav > .nav-list-entry > a', function clickPartTemplateNavLink() {
            this.click('#part-template-nav > .nav-list-entry > a');
        }, function fail() {
            this.capture('screenshot/partTemplateDeletion/waitForPartTemplateNavLink-error.png');
            this.test.assert(false, 'Part template nav link can not be found');
        });
    });


    /**
     * Click the 'select all' checkbox
     */
    casper.then(function waitForSelectAllCheckbox() {
        return this.waitForSelector('#part_template_table thead tr:first-child  th:first-child input', function clickOnSelectAllCheckbox() {
            this.click('#part_template_table thead tr:first-child  th:first-child input');
        }, function fail() {
            this.capture('screenshot/partTemplateDeletion/waitForSelectAllCheckbox-error.png');
            this.test.assert(false, 'Select all checkbox can not be found');
        });
    });

    /**
     * Wait for the delete button to appear
     */
    casper.then(function waitForDeleteButton() {
        return this.waitForSelector('.actions .delete', function clickOnDeleteButton() {
            this.click('.actions .delete');
            this.test.assert(true, 'Delete button available');
        }, function fail() {
            this.capture('screenshot/partTemplateDeletion/waitForDeleteButton-error.png');
            this.test.assert(false, 'Select all checkbox can not be found');
        });
    });

    /**
     * Wait for the confirmation modal
     */
    casper.then(function waitForConfirmationModal() {
        return this.waitForSelector('.bootbox', function confirmDeletion() {
            this.click('.bootbox .modal-footer .btn-primary');
        }, function fail() {
            this.capture('screenshot/partTemplateDeletion/waitForConfirmationModal-error.png');
            this.test.assert(false, 'Part template deletion confirmation modal can not be found');
        });
    });

    /**
     * Assert that there's no more entries in the table
     **/
    casper.then(function waitForTableToBeEmpty() {
        return this.waitWhileSelector('#part_template_table tbody tr:first-child  td:first-child input', function onBaselineTableEmpty() {
            this.test.assert(true, 'No more part templates in the list');
        }, function fail() {
            this.capture('screenshot/partTemplateDeletion/waitForTableToBeEmpty-error.png');
            this.test.assert(false, 'Part template table still not empty');
        });
    });

    casper.run(function allDone() {
        return this.test.done();
    });
});
