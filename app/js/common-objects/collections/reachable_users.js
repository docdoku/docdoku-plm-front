/*global define,App*/
define([
    'backbone',
    'common-objects/models/user'
], function (Backbone, User) {
	'use strict';
    var Users = Backbone.Collection.extend({
        model: User,
        url: function () {
            return App.config.apiEndPoint + '/workspaces/reachable-users';
        }
    });

    return Users;
});
