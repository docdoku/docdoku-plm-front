/*global casper,urls,$*/
casper.test.begin('Logout tests suite', 1, function logoutTestsSuite() {

    'use strict';

    casper.clear();

    /**
     * Open document management URL
     * */

    casper.then(function () {
        return this.open(urls.documentManagement);
    });

    /**
     *  Wait for disconnect link, and click it
     */
    casper.then(function () {
        return this.waitForSelector('#logout_link a', function onLogoutLinkReady() {
            this.evaluate(function () {
                $('#logout_link a').click();
            });
        });
    });

    /**
     * Test to find the login form
     */
    casper.then(function checkForLoginForm() {
        return this.waitForSelector('form[id="login_form"]', function loginFormFound() {
            this.test.assert(true, 'Login form found');
        });
    });

    casper.run(function () {
        return this.test.done();
    });
});
