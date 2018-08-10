/*global define,App*/
define([
    'backbone',
    'common-objects/models/lov/lov'
], function (Backbone, lov) {
    'use strict';
    var LOVCollection = Backbone.Collection.extend({

        model: lov,

        url: App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/lov'

    });

    return LOVCollection;
});
