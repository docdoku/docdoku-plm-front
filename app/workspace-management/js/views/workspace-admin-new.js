/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/workspace-admin-new.html',
    'common-objects/models/workspace',
    'common-objects/views/alert'
], function (Backbone, Mustache, template, Workspace, AlertView) {
    'use strict';

    var WorkspaceAdminNewView = Backbone.View.extend({

        events: {
            'click .workspace-edit':'onCancel',
            'submit #workspace_set_admin_form':'onSubmit'
        },

        initialize: function () {
        },

        render: function () {
            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n,
                workspace: _.findWhere(App.config.workspaces.administratedWorkspaces,{id:App.config.workspaceId})
            }));
            this.$notifications = this.$('.notifications');
            return this;
        },

        onSubmit:function(e){
            var login = this.$('#workspace_set_admin_form input[name="login"]').val().trim();
            if(login){
                Workspace.setAdmin(App.config.workspaceId,{login:login})
                    .then(this.onAdminChange.bind(this),this.onError.bind(this));
            }
            e.preventDefault();
            return false;
        },

        onError:function(error){
            this.$notifications.append(new AlertView({
                type: 'error',
                message: error.responseText
            }).render().$el);
        },

        onAdminChange:function(response){
            var workspaceIndex = _.indexOf(App.config.workspaces.administratedWorkspaces,
                _.findWhere(App.config.workspaces.administratedWorkspaces,{id:response.id}));
            App.config.workspaces.administratedWorkspaces.splice(workspaceIndex, 1);
            window.location.hash = '#/';
        },

        onCancel:function(){
            window.location.hash = '#/workspace/' + App.config.workspaceId + '/edit';
        }
    });

    return WorkspaceAdminNewView;
});
