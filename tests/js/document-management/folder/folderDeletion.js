/*global casper,urls,documents*/

casper.test.begin('Folder deletion tests suite', 1, function folderDeletionTestsSuite() {

    'use strict';

    casper.clear();

    /**
     * Open document management URL
     * */
    casper.open(urls.documentManagement);

    /**
     * Click on delete folder link
     */
    casper.then(function waitForDeleteFolderLink() {
        return this.waitForSelector('#folder-nav .items a[title="' + documents.folder1 + '"] + .btn-group .delete a', function clickFolderDeleteLink() {
            this.evaluate(function () {
                $('#folder-nav .items a[title="CasperJsTestFolder"] + .btn-group .delete a').click();
            });
        }, function fail() {
            this.capture('screenshot/folderDeletion/waitForDeleteFolderLink-error.png');
            this.test.assert(false, 'Folder link not found');
        });
    });


    /**
     * Confirm folder deletion
     */
    casper.then(function confirmFolderDeletion() {
        return this.waitForSelector('.bootbox', function confirmBoxAppeared() {
            this.click('.bootbox .modal-footer .btn-primary');
        }, function fail() {
            this.capture('screenshot/folderDeletion/confirmFolderDeletion-error.png');
            this.test.assert(false, 'Folder deletion confirmation modal can not be found');
        });
    });

    /**
     * Test if folder has been deleted
     */
    casper.then(function waitForFolderDisappear() {
        return this.waitWhileSelector('#folder-nav .items a[title=' + documents.folder1 + ']', function folderHasBEenDeleted() {
            this.test.assert(true, 'Folder deleted');
        }, function fail() {
            this.capture('screenshot/folderDeletion/waitForFolderDisappear-error.png');
            this.test.assert(false, 'Folder still there');
        });
    });

    casper.run(function allDone() {
        return this.test.done();
    });
});
