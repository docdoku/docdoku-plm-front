/*global define,App*/
define([
    'backbone',
    'common-objects/models/document/document_revision'
], function (Backbone, DocumentRevision) {
    'use strict';
    var SearchDocumentList = Backbone.Collection.extend({
        model: DocumentRevision,

        className: 'SearchDocumentList',

        setQuery: function (query) {
            this.query = query;
            return this;
        },

        baseUrl: function(){
          return App.config.apiEndPoint + '/workspaces/' + encodeURIComponent(App.config.workspaceId) + '/documents/search';
        },

        url: function () {
            return this.query.startsWith('?') ? this.baseUrl() + this.query : this.baseUrl() + '?' + this.query;
        }
    });

    return SearchDocumentList;
});



