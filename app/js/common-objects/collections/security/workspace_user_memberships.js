/*global define,App*/
define([
    'backbone',
    'common-objects/models/security/workspace_user_membership'
], function (Backbone, WorkspaceUserMembership) {
	'use strict';
    var WorkspaceUserMemberships = Backbone.Collection.extend({

        model: WorkspaceUserMembership,

        url: function () {
            return App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/memberships/users';
        }

    });

    return WorkspaceUserMemberships;
});
