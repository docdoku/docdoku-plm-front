/*global define,App*/
define([
    'backbone',
    'common-objects/models/workflow/workflow_model'
], function (Backbone, WorkflowModel) {
	'use strict';
    var WorkflowModels = Backbone.Collection.extend({
        model: WorkflowModel,
        url: function () {
            return App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/workflow-models';
        }
    });

    return WorkflowModels;
});
