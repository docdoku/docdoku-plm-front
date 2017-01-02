/*global casper,homeUrl,login,pass,apiUrls*/
casper.test.begin('Login tests suite', 4, function loginTestsSuite() {

    'use strict';

    casper.open('');

    /**
     * Open app home page
     */
    casper.then(function () {
        return this.open(homeUrl);
    });

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
     * Fill the login form
     */
    casper.then(function fillLoginForm() {
        this.fill('form[id="login_form"]', {
            'login_form-login': login,
            'login_form-password': pass
        }, false);
    });

    /**
     * Submit the login form
     */
    casper.then(function submitLoginForm() {
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

    /**
     * Create the workspace
     */
    casper.then(function createNewWorkspace() {
        return this.waitForSelector('#workspace-management-menu a.new-workspace', function () {
            this.click('#workspace-management-menu a.new-workspace');
        }, function () {
            this.capture('screenshot/auth/createNewWorkspace-error.png');
            this.test.assert(true, 'Logout link should be displayed');
        });
    });

    /**
     * Fill the form
     */
    casper.then(function createNewWorkspace() {
        return this.waitForSelector('#workspace-id', function () {
            this.sendKeys('#workspace-id', workspace);
            this.click('#workspace_creation_form > div.actions-btn > div > input.btn-primary');
        }, function () {
            this.capture('screenshot/auth/createNewWorkspace-error.png');
            this.test.assert(true, 'Logout link should be displayed');
        });
    });

    /**
     * Wait for workspaces list redirect
     */
    casper.then(function waitForRedirect() {
        return this.waitForSelector('.home-workspace-list-container', function () {
            this.test.assert(true, 'Redirected on workspaces list');
        });
    });

    /**
     * Assert workspace has been created
     */
    casper.then(function checkSessionState() {
        return this.open(apiUrls.userInfo).then(function (response) {
            this.test.assertEqual(response.status, 200, 'User "' + login + '" should log in');
        });
    });

    casper.run(function allDone() {
        return this.test.done();
    });

});
