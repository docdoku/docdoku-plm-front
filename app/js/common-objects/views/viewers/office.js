/*global define,PluginDetect*/
define([
    'backbone',
    'mustache',
    'text!common-objects/templates/viewers/wrapper.html',
    'text!common-objects/templates/viewers/office.html',
    'common-objects/views/viewers/viewers-utils'
], function (Backbone, Mustache, wrapperTemplate, template, ViewersUtils) {

    'use strict';

    var supportedExtensions = ['odt', 'html', 'sxw', 'swf', 'sxc', 'doc', 'docx', 'xls', 'xlsx', 'rtf', 'txt', 'ppt', 'pptx', 'odp', 'wpd', 'tsv', 'sxi', 'csv', 'pdf'];

    var OfficeViewer = Backbone.View.extend({

        events: {},

        initialize: function () {
        },

        render: function (binaryResource, uuid) {

            var url = ViewersUtils.getBinaryEmbeddableUrl(binaryResource, uuid);
            var fileName = ViewersUtils.getFileName(binaryResource.fullName);

            var viewer = Mustache.render(template, {
                url: url + '&output=pdf&type=viewer',
                fileName: fileName
            });

            this.$el.html(Mustache.render(wrapperTemplate, {
                downloadUrl: url,
                downloadAsPDF: url + '&output=pdf',
                fileName: fileName,
                id: ViewersUtils.generateViewerHash()
            }));

            this.$('.accordion-inner').append(viewer);

            return this;
        }

    });

    OfficeViewer.canDisplayExtension = function (extension) {
        return _.contains(supportedExtensions, extension);
    };

    return OfficeViewer;

});
