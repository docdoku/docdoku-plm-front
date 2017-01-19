/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/part-revision.html',
    'views/cad-file-view',
    'common-objects/utils/date',
    'common-objects/views/viewers/viewers-factory'
], function (Backbone, Mustache, template, CADFileView, date, ViewersFactory) {
    'use strict';

    var PartRevisionView = Backbone.View.extend({

        events: {
            'click a[href="#tab-cad-file"]': 'showCADFileView'
        },

        showCADFileView: function () {
            if (this.lastIteration.geometryFileURI) {
                if (!this.cadFileView) {


                    var fileName = this.lastIteration.geometryFileURI;

                    if (fileName.indexOf('/') === 0) {
                        fileName = fileName.substr(1, fileName.length);
                    }

                    fileName = App.config.serverBasePath + fileName;

                    var nativeCADFile = App.config.apiEndPoint + '/files/' + this.lastIteration.nativeCADFile.fullName;
                    this.cadFileView = new CADFileView().render(nativeCADFile, fileName, this.uuid);
                    this.$('#tab-cad-file').html(this.cadFileView.$el);
                }
                this.cadFileView.resize();
            }
        },

        render: function (part, uuid) {

            var _this = this;
            this.uuid = uuid;
            this.part = part;
            var lastIteration = part.partIterations[part.partIterations.length - 1];
            this.lastIteration = lastIteration;

            part.creationDate = date.formatTimestamp(
                App.config.i18n._DATE_FORMAT,
                part.creationDate
            );

            part.releaseDate = date.formatTimestamp(
                App.config.i18n._DATE_FORMAT,
                part.releaseDate
            );

            part.obsoleteDate = date.formatTimestamp(
                App.config.i18n._DATE_FORMAT,
                part.obsoleteDate
            );

            if (lastIteration) {
                lastIteration.creationDate = date.formatTimestamp(
                    App.config.i18n._DATE_FORMAT,
                    lastIteration.creationDate
                );

                lastIteration.checkInDate = date.formatTimestamp(
                    App.config.i18n._DATE_FORMAT,
                    lastIteration.checkInDate
                );

                lastIteration.modificationDate = date.formatTimestamp(
                    App.config.i18n._DATE_FORMAT,
                    lastIteration.modificationDate
                );
            }

            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n,
                contextPath: App.config.contextPath,
                part: part,
                lastIteration: lastIteration
            })).show();

            date.dateHelper(this.$('.date-popover'));

            this.$accordion = this.$('#tab-part-files > .accordion');

            if (lastIteration) {
                _.each(lastIteration.attachedFiles, function (binaryResource) {
                    var viewer = ViewersFactory.getViewer(binaryResource, uuid);
                    _this.$accordion.append(viewer);
                });
            }
            return this;
        },
    });

    return PartRevisionView;
});
