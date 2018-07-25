/*global casper,homeUrl,login,pass,workspace*/
casper.test.begin('Login tests suite', 2, function loginTestsSuite() {

    'use strict';

    casper.clear();

    /**
     * Open app home page
     */
    casper.open(homeUrl);

    /**
     * Test to find the login form
     */
    casper.then(function waitForLoginForm() {
        return this.waitForSelector('form[id="login_form"]', function loginFormFound() {
            this.test.assert(true, 'Login form found');
        }, function fail() {
            this.capture('screenshot/login/waitForLoginForm-error.png');
            this.test.assert(false, 'Login form not found');
        });
    });

    /**
     * Fill and submit the login form
     */
    casper.then(function fillLoginForm() {
        this.fill('form[id="login_form"]', {
            'login_form-login': login,
            'login_form-password': pass
        }, false);
        this.click('#login_form-login_button');
    });

    /**
     * We should be redirected on workspace menu
     */
    casper.then(function waitForLogoutButton() {
        return this.waitForSelector('#logout_link', function () {
            this.test.assert(true, 'Logout link should be displayed');
        }, function () {
            this.capture('screenshot/auth/waitForLogoutButton-error.png');
            this.test.assert(true, 'Logout link should be displayed');
        });
    });

    casper.run(function allDone() {
        return this.test.done();
    });

});
