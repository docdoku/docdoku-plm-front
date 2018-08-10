/*global $,define,App*/
define(['backbone'], function (Backbone) {
    'use strict';
    var Admin = Backbone.Model.extend({
        initialize: function () {
            this.className = 'Admin';
        }
    });

    Admin.getDiskSpaceUsageStats = function () {
        return $.getJSON(App.config.apiEndPoint + '/admin/disk-usage-stats');
    };
    Admin.getUsersStats = function () {
        return $.getJSON(App.config.apiEndPoint + '/admin/users-stats');
    };
    Admin.getDocumentsStats = function () {
        return $.getJSON(App.config.apiEndPoint + '/admin/documents-stats');
    };
    Admin.getProductsStats = function () {
        return $.getJSON(App.config.apiEndPoint + '/admin/products-stats');
    };
    Admin.getPartsStats = function () {
        return $.getJSON(App.config.apiEndPoint + '/admin/parts-stats');
    };

    Admin.indexWorkspace = function (workspaceId) {
        return $.ajax({
            type: 'PUT',
            url: App.config.apiEndPoint +  '/admin/index/'+workspaceId
        });
    };

    Admin.enableWorkspace = function (workspaceId, enabled) {
        return $.ajax({
            type: 'PUT',
            url: App.config.apiEndPoint +  '/admin/workspace/' + workspaceId + '/enable?enabled='+enabled
        });
    };

    Admin.enableAccount = function (login, enabled) {
        return $.ajax({
            type: 'PUT',
            url: App.config.apiEndPoint +  '/admin/accounts/' + login + '/enable?enabled='+enabled
        });
    };

    Admin.indexAllWorkspaces = function () {
        return $.ajax({
            type: 'PUT',
            url: App.config.apiEndPoint +  '/admin/index-all'
        });
    };

    Admin.getPlatformOptions = function () {
        return $.getJSON(App.config.apiEndPoint +  '/admin/platform-options');
    };

    Admin.getAccounts = function () {
        return $.getJSON(App.config.apiEndPoint +  '/admin/accounts');
    };

    Admin.setPlatformOptions = function (options) {
        return $.ajax({
            type: 'PUT',
            url: App.config.apiEndPoint +  '/admin/platform-options',
            data: JSON.stringify(options),
            contentType: 'application/json'
        });
    };

    return Admin;
});
