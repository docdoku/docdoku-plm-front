/*global casper,urls,products,productInstances*/

casper.test.begin('Used by tab tests suite', 2, function usedByTabTestsSuite() {

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
        });
    });

    /**
     * Wait for part list display
     */

    casper.then(function waitForPartInList() {
        return this.waitForSelector('#part_table tbody tr:first-child td.part_number', function openPartModal() {
            this.click('#part_table tbody tr:first-child td.part_number span');
        });
    });

    /**
     * Wait for part modal
     */
    casper.then(function waitForModalDisplay() {
        return this.waitForSelector('#part-modal li a[href="#tab-iteration-used-by"]', function openUsedByTab() {
            this.click('#part-modal li a[href="#tab-iteration-used-by"]');
        });
    });

    /**
     * Wait for used by tab
     */
    casper.then(function waitForUsedByDisplay() {
        return this.waitForSelector('#used-by-group-list-view > div > div > div > div.group-title', function checkValues() {
            this.test.assertSelectorHasText('#used-by-group-list-view > div > div > div > div.group-title', '< ' + products.product1.number + ' >', 'Part must be present in product "< ' + products.product1.number + ' >"');
            this.test.assertSelectorHasText('#used-by-product-instances > li.used-by-item > div.reference', productInstances.productInstance1.serialNumber, 'Part must be present in product instance "' + productInstances.productInstance1.serialNumber + '"');
        });
    });


    casper.run(function () {
        return this.test.done();
    });

});
