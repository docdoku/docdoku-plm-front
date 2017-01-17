/*global define,App*/
define([
    'backbone',
    'common-objects/models/security/workspace_user_group_membership'
], function (Backbone, WorkspaceUserGroupMembership) {
	'use strict';
    var WorkspaceUserGroupMemberships = Backbone.Collection.extend({

        model: WorkspaceUserGroupMembership,

        url: function () {
            return App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/memberships/usergroups';
        }

    });

    return WorkspaceUserGroupMemberships;
});
