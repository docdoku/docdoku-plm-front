/*global define,App*/
define([
    'backbone',
    'common-objects/models/document/document_revision'
], function (Backbone, DocumentRevision) {
	'use strict';
    var TagDocumentList = Backbone.Collection.extend({

        model: DocumentRevision,

        className: 'TagDocumentList',

        url: function () {
            return App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/tags/' + encodeURIComponent(this.parent.get('label')) + '/documents';
        },

        comparator: function (documentRevision) {
            return documentRevision.get('id');
        }

    });

    return TagDocumentList;
});
