/*global define,App*/
define([
    'backbone',
    'common-objects/models/part'
], function (Backbone, Part) {
	'use strict';
    var PartList = Backbone.Collection.extend({

        model: Part,

        className: 'PartList',

        setQuery: function (query) {
            this.query = query;
        },

        initialize: function () {
            this.urlBase = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/parts/search/';
        },

        fetchPageCount: function () {
            return false;
        },

        hasSeveralPages: function () {
            return false;
        },

        url: function () {
            return this.query.startsWith('?') ? this.urlBase + this.query : this.urlBase + '?' + this.query;
        }

    });

    return PartList;
});
