/*global $,define,App*/
define(['backbone'], function (Backbone) {
    'use strict';
    var Organization = Backbone.Model.extend({
        initialize: function () {
            this.className = 'Organization';
        }
    });

    Organization.getOrganization = function() {
        return $.getJSON(App.config.apiEndPoint + '/organizations');
    };

    Organization.createOrganization = function(organization) {
        return $.ajax({
            type: 'POST',
            url: App.config.apiEndPoint + '/organizations',
            data: JSON.stringify(organization),
            contentType: 'application/json; charset=utf-8'
        });
    };

    Organization.updateOrganization = function(organization) {
        return $.ajax({
            type: 'PUT',
            url: App.config.apiEndPoint + '/organizations',
            data: JSON.stringify(organization),
            contentType: 'application/json; charset=utf-8'
        });
    };

    Organization.deleteOrganization = function() {
        return $.ajax({
            type: 'DELETE',
            url: App.config.apiEndPoint + '/organizations',
            contentType: 'application/json; charset=utf-8'
        });
    };

    Organization.getMembers = function() {
        return $.getJSON(App.config.apiEndPoint + '/organizations/members');
    };

    Organization.addMember = function(user) {
        return $.ajax({
            type: 'PUT',
            url: App.config.apiEndPoint + '/organizations/add-member',
            data: JSON.stringify(user),
            contentType: 'application/json; charset=utf-8'
        });
    };

    Organization.removeMember = function(user) {
        return $.ajax({
            type: 'PUT',
            url: App.config.apiEndPoint + '/organizations/remove-member',
            data: JSON.stringify(user),
            contentType: 'application/json; charset=utf-8'
        });
    };

    Organization.removeMembers = function (userLogins) {
        var promiseArray = [];
        _.each(userLogins, function (login) {
            promiseArray.push(Organization.removeMember({login: login}));
        });
        return $.when.apply(undefined, promiseArray);
    };

    Organization.moveMemberUp = function(user) {
        return $.ajax({
            type: 'PUT',
            url: App.config.apiEndPoint + '/organizations/move-member?direction=up',
            data: JSON.stringify(user),
            contentType: 'application/json; charset=utf-8'
        });
    };

    Organization.moveMemberDown = function(user) {
        return $.ajax({
            type: 'PUT',
            url: App.config.apiEndPoint + '/organizations/move-member?direction=down',
            data: JSON.stringify(user),
            contentType: 'application/json; charset=utf-8'
        });
    };

    return Organization;

});
