/*global casper,homeUrl,login,pass,workspace*/
casper.test.begin('Login tests suite', 4, function loginTestsSuite() {

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
            this.test.assert(true, 'Workspace creation form should be displayed');
        });
    });

    /**
     * Fill the form
     */
    casper.then(function submitWorkspaceCreationForm() {
        return this.waitForSelector('#workspace-id', function () {
            this.sendKeys('#workspace-id', workspace);
            this.click('#workspace_creation_form > div.actions-btn > div > input.btn-primary');
        }, function () {
            this.capture('screenshot/auth/submitWorkspaceCreationForm-error.png');
            this.test.assert(true, 'Workspace creation form should be displayed');
        });
    });

    /**
     * Wait for workspaces list redirect
     */
    casper.then(function waitForRedirect() {
        return this.waitUntilVisible('.home-workspace-list-container', function () {
            this.test.assert(true, 'Redirected on workspaces list');
        });
    });

    /**
     * Assert workspace has been created
     */
    casper.then(function checkSessionState() {
        var workspaceExists = this.evaluate(function (w) {
            return $('div.home-workspace-list-container.administrated-workspaces > div > div > h4:contains(' + w + ')').length === 1;
        }, workspace);
        this.test.assert(workspaceExists, 'Workspace exists');
    });

    casper.run(function allDone() {
        return this.test.done();
    });

});
