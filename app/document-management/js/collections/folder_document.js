/*global define,App*/
define([
    'backbone',
    'common-objects/models/document/document_revision'
], function (Backbone, DocumentRevision) {
    'use strict';
    var FolderDocumentList = Backbone.Collection.extend({

        model: DocumentRevision,

        url: function () {
            var baseUrl = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId;
            if (this.parent) {
                return baseUrl + '/folders' + '/' + this.parent.id + '/documents';
            } else {
                return baseUrl + '/folders' + '/' + App.config.workspaceId + '/documents';
            }
        },

        comparator: function (documentRevision) {
            return documentRevision.get('id');
        }

    });
    FolderDocumentList.className = 'FolderDocumentList';
    return FolderDocumentList;
});
