/*global $,define,App*/
define(['backbone'],
function (Backbone) {
	'use strict';
    var UserModel = Backbone.Model.extend({
        getLogin: function () {
            return this.get('login');
        },
        getName: function () {
            return this.get('name');
        }
    });

    UserModel.whoami = function (workspaceId) {
        return $.getJSON(App.config.apiEndPoint + '/workspaces/' + workspaceId + '/users/me');
    };

    UserModel.getGroups = function (workspaceId) {
        return $.getJSON(App.config.apiEndPoint + '/workspaces/' + workspaceId + '/memberships/usergroups/me');
    };

    UserModel.getAccount = function () {
        return $.getJSON(App.config.apiEndPoint + '/accounts/me');
    };

    UserModel.updateAccount = function (account) {
        return $.ajax({
            type: 'PUT',
            url: App.config.apiEndPoint + '/accounts/me',
            data: JSON.stringify(account),
            contentType: 'application/json; charset=utf-8'
        });
    };

    UserModel.getTagSubscriptions = function (workspaceId, login) {
        return $.getJSON(App.config.apiEndPoint + '/workspaces/' + workspaceId + '/users/' + login + '/tag-subscriptions');
    };

    UserModel.addOrEditTagSubscription = function (workspaceId, login, tagSubscription, error) {
        return $.ajax({
            type: 'PUT',
            url: App.config.apiEndPoint + '/workspaces/' + workspaceId + '/users/' + login + '/tag-subscriptions/' + tagSubscription.getTag(),
            data: JSON.stringify(tagSubscription),
            contentType: 'application/json; charset=utf-8',
            error: error
        });
    };

    UserModel.removeTagSubscription = function (workspaceId, login, tagId, error) {
        return $.ajax({
            type: 'DELETE',
            url: App.config.apiEndPoint + '/workspaces/' + workspaceId + '/users/' + login + '/tag-subscriptions/' + tagId,
            error: error
        });
    };

    return UserModel;
});
