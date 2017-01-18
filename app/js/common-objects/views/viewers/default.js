/*global define*/
define([
    'backbone',
    'mustache',
    'text!common-objects/templates/viewers/wrapper.html',
    'text!common-objects/templates/viewers/default.html',
    'common-objects/views/viewers/viewers-utils'
], function (Backbone, Mustache, wrapperTemplate, template, ViewersUtils) {

    'use strict';

    return Backbone.View.extend({

        events: {},

        initialize: function () {
        },

        render: function (binaryResource, uuid) {

            var url = ViewersUtils.getBinaryDownloadUrl(binaryResource, uuid);
            var fileName = ViewersUtils.getFileName(binaryResource.fullName);

            var viewer = Mustache.render(template, {
                url: url,
                fileName: fileName
            });

            this.$el.html(Mustache.render(wrapperTemplate, {
                downloadUrl: url,
                fileName: fileName,
                id: ViewersUtils.generateViewerHash()
            }));

            this.$('.accordion-inner').append(viewer);

            return this;
        }

    });
});
