/*global _,define,App,$*/
define([
    'backbone',
    'mustache',
    'common-objects/models/part',
    'text!templates/part/part_list_item.html',
    'common-objects/views/share/share_entity',
    'common-objects/views/part/part_modal_view',
    'common-objects/utils/date',
    'common-objects/customizations/part-table-columns'
], function (Backbone, Mustache, Part, template, ShareView, PartModalView, date, PartTableColumns) {
    'use strict';
    var PartListItemView = Backbone.View.extend({

        events: {
            'click input[type=checkbox]': 'selectionChanged',
            'click td.modification_notification i': 'toPartModalOnNotificationsTab',
            'click td.part_number': 'toPartModal',
            'click span.part': 'hierarchy',
            'click td.part-revision-share i': 'sharePart',
            'click td.part-attached-files i': 'toPartModalOnFilesTab',
            'dragstart a.parthandle': 'dragStart',
            'dragend a.parthandle': 'dragEnd',
            'click span.less': 'hideLine'
        },

        tagName: 'tr',

        initialize: function () {
            _.bindAll(this);
            this._isChecked = false;

            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'sync', this.render);

            // jQuery creates it's own event object, and it doesn't have a
            // dataTransfer property yet. This adds dataTransfer to the event object.
            $.event.props.push('dataTransfer');
        },

        render: function () {
            this.$el.html(Mustache.render(template, {model: this.model, i18n: App.config.i18n}));
            this.$checkbox = this.$('input[type=checkbox]');
            if (this.isChecked()) {
                this.check();
                this.trigger('selectionChanged', this);
            }

            this.addCustomColumns();

            this.bindUserPopover();
            this.bindDescriptionPopover();
            date.dateHelper(this.$('.date-popover'));
            this.trigger('rendered', this);
            return this;
        },

        hierarchy: function () {
            var partList = this;
            var parentId= this.$('.list_child');
            this.changeClassTr(partList.$el[0]);
            var partKey = this.model.attributes.partKey;
            var workspace = this.model.attributes.workspaceId;
            this.getChild(workspace, partKey).success(function(data) {
                partList.appendChild(data, parentId);      
            });
            this.hideAndDisplayLine();
        },

        hideAndDisplayLine: function() {
            var arrayLine = document.getElementById('part_table').children[1].children;
            $.each(arrayLine, function(index) {
                var arrayCell = arrayLine[index].children[3];
                var listChildren = $(arrayCell.children[2]);
                $(listChildren).empty();
                $('.less').css({'display':'none'});
                $('.part').css({'display':'inline'});
            });
            this.$('.part').css({'display':'none'});
            this.$('.less').css({'display':'inline'});
        },

        appendChild: function(data, parentId) {
            var partList = this;
            var arrayChilds = new Array();
            var lastIteration = data.lastIterationNumber - 1;
            var assemblyArray = data.partIterations[lastIteration].components;
            var count = $(assemblyArray).length;
            $.each(assemblyArray, function(index) {

                arrayChilds.push(assemblyArray[index].component.number);
                if(index + 1 === count) {
                    $.each(arrayChilds, function(index) {
                        partList.getChildLatestVersion(data.workspaceId, arrayChilds[index]).success(function(childsLatestVersion) {
                            $(
                            `<ul class="child" id="${ arrayChilds[index] }">
                            <li id="${ arrayChilds[index] }"><p> ${ childsLatestVersion.partKey }</p></li>
                            </ul>`).appendTo(parentId);
                            var child = new Array();
                            child = partList.$(`#${ arrayChilds[index] }`);
                            partList.listenerClick(data.workspaceId, arrayChilds[index]);
                            var grandChild= childsLatestVersion.partIterations[0].components;
                            var grandChildTest = grandChild.length > 0 ? true : false ;

                            if (grandChildTest === true)
                            {        
                                $(child).append(`<div class="fa fa-plus treechild">`);                                                            
                            }
                        });
                    });
                }
            });
        },
    
        hideLine: function() {
            this.$('.less').css({'display':'none'});
            this.$('.part').css({'display':'inline'});
             var arrayLine = document.getElementById('part_table').children[1].children;
             $.each(arrayLine, function(index) {
                var arrayCell = arrayLine[index].children[3];
            var listChildren = $(arrayCell.children[2]);
                $(listChildren).empty();
            });
        },

        listenerClick: function(workspace, childs) {
            var partList = this;
            $(`#${childs}`).one('click', function(event) {
                event.stopPropagation();
                var newPartNumber = this.id;
                partList.getChildLatestVersion(workspace, newPartNumber).success(function(data) {
                    
                    
                    var parentId = `#${data.number}`;
                    partList.appendChild(data, parentId);
                });
            });
        },

        getChildLatestVersion: function(workspace, partNumber) {
            return  $.ajax({
                method: 'GET',
                url: App.config.apiEndPoint + `/workspaces/${workspace}/parts/${partNumber}/latest-revision`
            });
        },

        changeClassTr: function( lineSelected ) {
            $(lineSelected).find('td').each( function(cell) {
                $(this).css({
                    'vertical-align': 'unset',
                    'padding-top': '0.5rem'
                });
            });
        },

        getChild: function(workspace, partNumber) {
            return  $.ajax({
                method: 'GET',
                url: App.config.apiEndPoint + `/workspaces/${workspace}/parts/${partNumber}`
            });
        },

        selectionChanged: function () {
            this._isChecked = this.$checkbox.prop('checked');
            this.trigger('selectionChanged', this);
        },

        isChecked: function () {
            return this._isChecked;
        },

        check: function () {
            this.$checkbox.prop('checked', true);
            this._isChecked = true;
        },

        unCheck: function () {
            this.$checkbox.prop('checked', false);
            this._isChecked = false;
        },

        toPartModal: function () {
            var self = this;
            self.model.fetch().success(function () {
                var partModalView = new PartModalView({
                    model: self.model
                });
                partModalView.show();
            });
        },

        toPartModalOnFilesTab: function () {
            var model = this.model;
            model.fetch().success(function () {
                var partModalView = new PartModalView({
                    model: model
                });
                partModalView.show();
                partModalView.activateFileTab();

            });
        },

        toPartModalOnNotificationsTab: function () {
            var model = this.model;
            model.fetch().success(function () {
                var partModalView = new PartModalView({
                    model: model
                });
                partModalView.show();
                partModalView.activateNotificationsTab();
            });
        },

        bindDescriptionPopover: function () {
            if (this.model.getDescription() !== undefined && this.model.getDescription() !== null && this.model.getDescription() !== '') {
                var self = this;
                this.$('.part_number')
                    .popover({
                        title: App.config.i18n.DESCRIPTION,
                        html: true,
                        content: self.model.getDescription(),
                        trigger: 'hover',
                        placement: 'top',
                        container: 'body'
                    });
            }
        },

        bindUserPopover: function () {
            this.$('.author-popover').userPopover(this.model.getAuthorLogin(), this.model.getNumber(), 'left');
            if (this.model.isCheckout()) {
                this.$('.checkout-user-popover').userPopover(this.model.getCheckOutUserLogin(), this.model.getNumber(), 'left');
            }
        },

        sharePart: function () {
            var shareView = new ShareView({model: this.model, entityType: 'parts'});
            window.document.body.appendChild(shareView.render().el);
            shareView.openModal();
        },

        dragStart: function (e) {
            var that = this;
            this.$el.addClass('moving');

            Backbone.Events.on('part-moved', function () {
                Backbone.Events.off('part-moved');
                Backbone.Events.off('part-error-moved');
                that.model.collection.remove(that.model);
            });
            Backbone.Events.on('part-error-moved', function () {
                Backbone.Events.off('part-moved');
                Backbone.Events.off('part-error-moved');
                that.$el.removeClass('moving');
            });
            var data = JSON.stringify(this.model.toJSON());
            e.dataTransfer.setData('part:text/plain', data);
            e.dataTransfer.dropEffect = 'none';
            e.dataTransfer.effectAllowed = 'copyMove';
            return e;
        },

        dragEnd: function (e) {
            if (e.dataTransfer.dropEffect === 'none') {
                Backbone.Events.off('part-moved');
                Backbone.Events.off('part-error-moved');
            }
            this.$el.removeClass('moving');
        },

        addCustomColumns: function () {
            var columns = this.options.columns;
            var model = this.model;
            var thirdTd = this.$('td:nth-child(3)');
            _.each(columns, function (column) {
                if(column.startsWith('attr')){
                    thirdTd.after(PartTableColumns.cellsFactory.attr(model, column));
                }else{
                    var fn = PartTableColumns.cellsFactory[column];
                    if (fn && typeof fn === 'function') {
                        thirdTd.after(fn(model));
                    } else {
                        thirdTd.after('<td>-</td>');
                    }
                }
            });
        }

    });

    return PartListItemView;

});
