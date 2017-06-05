/*global _,define,App,window*/
define([
    'backbone',
    'mustache',
    'unorm',
    'common-objects/views/components/modal',
    'common-objects/models/file/attached_file',
    'common-objects/views/file/file',
    'common-objects/views/alert',
    'text!templates/part/part_import_modal.html',
    'text!templates/part/part_import_form.html',
    'common-objects/views/part/import_status_view'
], function (Backbone, Mustache, unorm, ModalView, AttachedFile, FileView, AlertView, modalTemplate, template, ImportStatusView) {
    'use strict';
    var PartImportView = Backbone.View.extend({

        template: template,
        modalTemplate: modalTemplate,

        tagName: 'div',
        className: 'attachedFiles idle',

        events: {
            'click form button.cancel-upload-btn': 'cancelButtonClicked',
            'change form input.upload-btn': 'fileSelectHandler',
            'dragover .droppable': 'fileDragHover',
            'dragleave .droppable': 'fileDragHover',
            'drop .droppable': 'fileDropHandler',
            'click .import-button': 'formSubmit',
            'click #auto_checkout_part': 'changeAutoCheckout',
            'hidden .importer-view': 'onHidden',
            'click .back-button': 'backToForm',
            'hidden.bs.modal .modal.importer-view': 'deleteImportStatus'
        },

        initialize: function () {
            this.importStatusViews = [];

            // Prevent browser behavior on file drop
            window.addEventListener('drop', function (e) {
                e.preventDefault();
                return false;
            }, false);

            window.addEventListener('ondragenter', function (e) {
                e.preventDefault();
                return false;
            }, false);

            this.$el.on('remove', this.removeSubviews);

            this.importForm = true;
            this.importPreviewMode = false;
        },

        // cancel event and hover styling
        fileDragHover: function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (e.type === 'dragover') {
                this.filedroparea.addClass('hover');
            }
            else {
                this.filedroparea.removeClass('hover');
            }
        },

        fileDropHandler: function (e) {
            this.fileDragHover(e);
            if (this.options.singleFile && e.dataTransfer.files.length > 1) {
                this.printNotifications('error', App.config.i18n.SINGLE_FILE_RESTRICTION);
                return;
            }

            _.each(e.dataTransfer.files, this.loadNewFile.bind(this));
        },

        fileSelectHandler: function (e) {
            _.each(e.target.files, this.loadNewFile.bind(this));
        },

        cancelButtonClicked: function () {
            //empty the file
            this.file = null;
            this.finished();
        },

        render: function () {
            this.$el.html(Mustache.render(modalTemplate, {i18n: App.config.i18n}));
            this.$el.find('#import-contain').append(Mustache.render(template, {
                importForm: this.importForm,
                importPreviewMode: this.importPreviewMode,
                checkout: this.autocheckout,
                checkin: this.autocheckin,
                permissive: this.permissive,
                revisionNote: this.revisionNote,
                i18n: App.config.i18n
            }));
            this.bindDomElements();
            this.checkboxAutoCheckin.disabled = true;
            this.fetchImports();

            return this;
        },

        loadNewFile: function (file) {

            var fileName = unorm.nfc(file.name);

            var newFile = new AttachedFile({
                shortName: fileName
            });

            this.file = file;
            this.addOneFile(newFile);

        },

        rerender: function () {
            this.$el.find('#import-contain').html(Mustache.render(template, {
                importForm: this.importForm,
                importPreviewMode: this.importPreviewMode,
                checkout: this.autocheckout,
                checkin: this.autocheckin,
                permissive: this.permissive,
                revisionNote: this.revisionNote,
                partCheckoutList: this.partCheckoutList,
                partsToCreate: this.partsToCreate,
                searchingForPartList: this.searchingForPartList,
                i18n: App.config.i18n,
                options: this.options
            }));

            //this.delegateEvents();
            this.bindDomElements();


            this.$('.import-button').removeAttr('disabled');


            if (this.autocheckout) {
                this.checkboxAutoCheckout.prop('checked', true);
            }

            this.$('#revision_text_part').val(this.revisionNote);

            if (this.autocheckout) {
                this.checkboxAutoCheckout.prop('checked', true);
                this.checkboxAutoCheckin.prop('disabled', false);
            } else {
                this.checkboxAutoCheckin.prop('disabled', true);
            }

            if (this.autocheckin) {
                this.checkboxAutoCheckin.prop('checked', true);
            }

            if (this.permissive) {
                this.$('#permissive_update_part').prop('checked', true);
            }
        },

        addOneFile: function (attachedFile) {
            this.filedisplay.html('<li>' + attachedFile.getShortName() + '</li>');
            this.$('.import-button').removeAttr('disabled');
        },

        bindDomElements: function () {
            this.$modal = this.$('.modal.importer-view');
            this.filedroparea = this.$('.filedroparea');
            this.filedisplay = this.$('#file-selected ul');
            this.uploadInput = this.$('input.upload-btn');
            this.progressBars = this.$('div.progress-bars');
            this.notifications = this.$('div.notifications');
            this.checkboxAutoCheckin = this.$('#auto_checkin_part');
            this.checkboxAutoCheckout = this.$('#auto_checkout_part');
            this.checkboxDryRun = this.$('#dry_run');
        },

        /**
         * to enable or disable checkbox for auto checkin
         */
        changeAutoCheckout: function () {
            if (this.checkboxAutoCheckout.is(':checked') === true) {
                this.checkboxAutoCheckin.prop('disabled', false);
            } else {
                this.checkboxAutoCheckin.prop('disabled', true);
                this.checkboxAutoCheckin.prop('checked', false);
            }
        },

        showPreview: function () {

            if (!this.file) {
                return;
            }

            this.clearNotifications();

            this.autocheckin = this.checkboxAutoCheckin.is(':checked');
            this.autocheckout = this.checkboxAutoCheckout.is(':checked');
            this.dryRun = this.checkboxDryRun.is(':checked');
            this.permissive = this.$('#permissive_update_part').is(':checked');
            this.revisionNote = this.$('#revision_text_part').val().trim();

            this.options = this.autocheckin || this.autocheckout || this.permissive || this.revisionNote !== '';

            if (this.dryRun) {

                var params = {
                    autoCheckout: this.autocheckout,
                    autoCheckin: this.autocheckin,
                    permissiveUpdate: this.permissive
                };

                this.searchingForPartList = true;
                this.importForm = false;
                this.importPreviewMode = true;

                var previewBaseUrl = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/parts/importPreview';
                var previewUrl = previewBaseUrl + '?' + $.param(params);
                var xhr = new XMLHttpRequest();
                xhr.open('POST', previewUrl, true);

                if (localStorage.jwt) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.jwt);
                }

                var formData = new window.FormData();
                var _this = this;
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        _this.importPreview = $.parseJSON(xhr.response);
                        _this.partCheckoutList = _this.importPreview.partRevsToCheckOut;
                        _this.partsToCreate = _this.importPreview.partsToCreate;
                        _this.searchingForPartList = false;
                        _this.importForm = false;
                        _this.importPreviewMode = true;
                        _this.rerender();
                    }
                };
                formData.append('upload', this.file);
                xhr.send(formData);
            } else {
                this.partCheckoutList = null;
                this.partsToCreate = null;
            }

            this.rerender();

        },

        formSubmit: function () {
            if (this.importForm && this.checkboxDryRun.is(':checked')) {
                this.showPreview();
            } else {
                this.startImport();
            }
        },

        startImport: function () {

            var baseUrl = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/parts/import';

            if (this.file) {

                var params = {
                    autoCheckout: this.autocheckout,
                    autoCheckin: this.autocheckin,
                    permissiveUpdate: this.permissive,
                    revisionNote: this.revisionNote
                };

                this.deleteImportStatus();

                var importUrl = baseUrl + '?' + $.param(params);

                var xhr = new XMLHttpRequest();
                xhr.onload = this.fetchImports.bind(this);
                xhr.open('POST', importUrl, true);

                if (localStorage.jwt) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.jwt);
                }

                var formData = new window.FormData();
                formData.append('upload', this.file);
                xhr.send(formData);

            } else {
                this.printNotifications('error', App.config.i18n.NO_FILE_TO_IMPORT);
            }

            this.backToForm();
            return false;
        },

        fetchImports: function () {
            var _this = this;
            this.removeSubviews();
            _this.$('.import-status-views').empty();

            if (this.file) {
                var url = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/parts/imports/' + unorm.nfc(this.file.name);
                $.get(url).then(function (imports) {
                    _.each(imports, function (pImport) {
                        var view = new ImportStatusView({model: pImport}).render();
                        _this.importStatusViews.push(view);
                        _this.$('.import-status-views').append(view.$el);
                    });
                });
            }
        },

        printNotifications: function (type, message) {
            this.notifications.append(new AlertView({
                type: type,
                message: message
            }).render().$el);
        },

        clearNotifications: function () {
            this.notifications.text('');
        },

        removeSubviews: function () {
            _(this.importStatusViews).invoke('remove');
            this.importStatusViews = [];
        },

        openModal: function () {
            this.$modal.modal('show');
        },

        closeModal: function () {
            this.$modal.modal('hide');
        },

        onHidden: function () {
            this.remove();
        },

        backToForm: function () {
            this.importPreviewMode = false;
            this.importForm = true;
            this.partCheckoutList = null;
            this.partsToCreate = null;
            this.searchingForPartList = false;
            this.rerender();
            this.loadNewFile(this.file);
        },

        deleteImportStatus: function () {
            _.each(this.importStatusViews, function (importSV) {
                importSV.deleteImport();
            });
        }

    });
    return PartImportView;

});
