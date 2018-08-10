/*global _,define,App,$*/
define([
    'backbone',
    'common-objects/utils/date',
    'common-objects/collections/attribute_collection',
    'common-objects/collections/file/attached_file_collection'
], function (Backbone, date, AttributeCollection, AttachedFileCollection) {
	'use strict';
    var PartIteration = Backbone.Model.extend({

        idAttribute: 'iteration',

        initialize: function () {

            this.className = 'PartIteration';

            var attributes = new AttributeCollection(this.get('instanceAttributes'));
            this.set('instanceAttributes', attributes);
            this.resetNativeCADFile();

            var filesMapping = _.map(this.get('attachedFiles'), function (binaryResource) {
                return {
                    fullName: binaryResource.fullName,
                    shortName: _.last(binaryResource.fullName.split('/')),
                    created: true
                };
            });

            var attachedFiles = new AttachedFileCollection(filesMapping);

            this.set('attachedFiles', attachedFiles);

        },

        resetNativeCADFile: function () {
            var nativeCADBinaryResource = this.get('nativeCADFile');
            if (nativeCADBinaryResource) {
                this._nativeCADFile = new AttachedFileCollection({
                    fullName: nativeCADBinaryResource.fullName,
                    shortName: _.last(nativeCADBinaryResource.fullName.split('/')),
                    created: true
                });
            } else {
                this._nativeCADFile = new AttachedFileCollection();
            }
        },


        defaults: {
            instanceAttributes: []
        },

        getAttributes: function () {
            return this.get('instanceAttributes');
        },

        getAttributeTemplates: function () {
            return this.get('instanceAttributeTemplates');
        },

        getWorkspace: function () {
            return this.get('workspaceId');
        },

        getReference: function () {
            return this.getPartKey() + '-' + this.getIteration();
        },

        getIteration: function () {
            return this.get('iteration');
        },

        getPartKey: function () {
            return  this.get('number') + '-' + this.get('version');
        },

        getEncodedPartKey: function () {
            return encodeURIComponent(this.get('number')) + '-' + this.get('version');
        },

        getAttachedFiles: function () {
            return this.get('attachedFiles');
        },

        getBaseName: function (subType) {
            return this.getWorkspace() + '/parts/' + encodeURIComponent(this.getNumber()) + '/' + this.getVersion() + '/' + this.get('iteration') + '/' + subType;
        },

        getNumber: function () {
            return this.collection.part.getNumber();
        },

        getVersion: function () {
            return this.collection.part.getVersion();
        },

        getComponents: function () {
            return this.get('components');
        },

        isAssembly: function () {
            var components = this.getComponents();
            return components && components.length > 0;
        },


        getLinkedDocuments: function () {
            return this.get('linkedDocuments');
        },

        setLinkedDocuments: function (linkedDocuments) {
            this.set('linkedDocuments', linkedDocuments);
        },

        getLifeCycleState: function () {
            return this.get('lifeCycleState');
        },

        getConversionUrl:function(){
            return App.config.apiEndPoint +
                '/workspaces/' + this.getWorkspace() +
                '/parts/' + this.getEncodedPartKey() +
                '/iterations/' + this.get('iteration') +
                '/conversion';
        },

        getConversionStatus:function(){
            return $.get(this.getConversionUrl());
        },

        launchConversion:function(){
            return $.ajax({method:'PUT',url:this.getConversionUrl()});
        },

        getAttachedFilesUploadBaseUrl: function () {
            return App.config.apiEndPoint + '/files/' + this.getWorkspace() + '/parts/' + encodeURIComponent(this.getNumber()) + '/' + this.getVersion() + '/' + this.get('iteration') + '/attachedfiles/';
        },

        getNativeCadFileUploadBaseUrl: function () {
            return App.config.apiEndPoint + '/files/' + this.getWorkspace() + '/parts/' + encodeURIComponent(this.getNumber()) + '/' + this.getVersion() + '/' + this.get('iteration') + '/nativecad/';
        }

    });

    return PartIteration;

});
