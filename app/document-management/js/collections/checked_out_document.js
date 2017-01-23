/*global define,App*/
define([
    'backbone',
    'common-objects/models/document/document_revision'
], function (Backbone, DocumentRevision) {
    'use strict';
    var TagDocumentList = Backbone.Collection.extend({

        model: DocumentRevision,

        className: 'CheckedOutDocumentList',

        url: function () {
            return App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/documents/checkedout';
        },

        comparator: function (documentRevision) {
            return documentRevision.get('id');
        }

    });

    return TagDocumentList;
});
