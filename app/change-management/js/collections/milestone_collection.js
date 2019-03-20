/*global define,App*/
define([
    'backbone',
    'models/milestone'
], function (Backbone, MilestoneModel) {
    'use strict';
    var MilestoneListCollection = Backbone.Collection.extend({
        model: MilestoneModel,
        url: function () {
            return App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/changes/milestones';
        }
    });

    return MilestoneListCollection;
});
