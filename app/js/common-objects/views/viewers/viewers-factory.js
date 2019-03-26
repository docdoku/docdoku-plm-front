/*global define*/
define([
    'common-objects/views/viewers/default',
    'common-objects/views/viewers/viewers-utils',
    'common-objects/views/viewers/image',
    'common-objects/views/viewers/office',
    'common-objects/views/viewers/video'
], function (DefaultViewer, ViewersUtils, ImageViewer, OfficeViewer, VideoViewer) {

    'use strict';

    var viewers = [ImageViewer, OfficeViewer, VideoViewer];

    return {

        getViewer: function (binaryResource, uuid, resourceToken) {

            var selectedViewers = viewers.filter(function (viewer) {
                return viewer.canDisplayExtension(ViewersUtils.getExtension(binaryResource.fullName));
            });

            if (selectedViewers.length > 0) {
                return new selectedViewers[0]().render(binaryResource, uuid, resourceToken).$el;
            }
            else {
                return new DefaultViewer().render(binaryResource, uuid, resourceToken).$el;
            }

        }

    };

});
