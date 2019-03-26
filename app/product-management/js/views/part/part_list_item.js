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
            'click td.part-revision-share i': 'sharePart',
            'click td.part-attached-files i': 'toPartModalOnFilesTab',
            'dragstart a.parthandle': 'dragStart',
            'dragend a.parthandle': 'dragEnd',
            'click .expandable': 'expandRootNodeChildren',
            'click .collapsable': 'clearRootNodesChildren',
            'click .embeddedExpandable': 'expandEmbeddedNodesChildren',
            'click .embeddedCollapsable': 'clearEmbeddedNodesChildren',
            'click .product_title': 'doNothing'
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
                if (column.startsWith('attr')) {
                    thirdTd.after(PartTableColumns.cellsFactory.attr(model, column));
                } else {
                    var fn = PartTableColumns.cellsFactory[column];
                    if (fn && typeof fn === 'function') {
                        thirdTd.after(fn(model));
                    } else {
                        thirdTd.after('<td>-</td>');
                    }
                }
            });
        },
        expandRootNodeChildren: function (event) {

            event.stopPropagation();
            this.revertCssPropertiesOfCells();
            var partKey = this.model.attributes.partKey;
            var parentInstance = this;
            var workspace = this.model.attributes.workspaceId;
            var listChild = this.$('.list_child');
            this.moveAllCellsInTRtag();
            this.makeRootNodeCollapsable();
            this.getChild(workspace, partKey).success(function (data) {

                parentInstance.buildChildrenNodes(data, listChild);
            });
        },
        doNothing: function (event) {

            event.stopPropagation();
        },
        moveAllCellsInTRtag: function () {

            this.$el.find('td').each(function (index, element) {

                var tdTag = $(element);
                tdTag.css('vertical-align', 'top');
                if(tdTag.hasClass('part_number')){

                    var faTag = tdTag.children('nav').children('div').children('i');
                    var firstLine = tdTag.children('nav').children('div').children('ul').children('li');

                    $(firstLine).each(function(index,line){

                        $(line).css({'position':'relative','top':'0px'});
                    });
                    $(faTag).each(function(index, fa){

                        $(fa).css({'vertical-align':'top','position':'relative','top':'5px'});
                    });
                }
            });
        },
        expandEmbeddedNodesChildren: function (event) {

            event.stopPropagation();
            var currentLineSelected = event.currentTarget;
            var workspaceId = this.model.attributes.workspaceId;
            if ($(currentLineSelected).is('div')) {

                currentLineSelected = $(currentLineSelected).parent()[0];
            }
            this.exposeEmbeddedChildren(workspaceId, currentLineSelected);
            this.makeEmbeddedNodesCollapsable(currentLineSelected);
        },
        clearEmbeddedNodesChildren: function (event) {

            event.stopPropagation();
            var currentLineSelected = event.currentTarget;
            if ($(currentLineSelected).is('div')) {

                currentLineSelected = $(currentLineSelected).parent()[0];
            }
            this.closeSingleEmbeddeNodeExpands(currentLineSelected);
        },
        clearRootNodesChildren: function (event) {

            event.stopPropagation();
            this.closeAllRootNodeExpanded();
        },
        exposeEmbeddedChildren: function (workspaceId, rootLine) {

            var rootContext = this;
            var listChildEmbedded = $(rootLine).children('ul').children('li');
            if (typeof listChildEmbedded !== 'undefined') {

                $(listChildEmbedded).each(function (index, item) {

                    var partKey = $(item).children('span').text();
                    rootContext.getChild(workspaceId, partKey).success(function (data) {

                        var lastIteration = data.lastIterationNumber - 1;
                        var assemblyArray = data.partIterations[lastIteration].components;
                        if ((assemblyArray.length) !== 0) {

                            if (!$(item).children('ul').length && !$(item).children('.blockClickAreaEmbedded').length) {

                                item.setAttribute('class', 'embeddedExpandable');
                                var includeDiv = document.createElement('div');
                                var includeUl = document.createElement('ul');
                                includeDiv.setAttribute('class', 'blockClickAreaEmbedded hitarea expandable-hitarea embeddedExpandable');
                                rootContext.buildChildrenNodes(data, includeUl);
                                if ($(item).is(':last-child')) {

                                    item.setAttribute('class', 'lastExpandable embeddedExpandable');
                                }
                                includeUl.setAttribute('style', 'display:none; background: none;');
                                item.append(includeUl);
                                item.prepend(includeDiv);
                                rootContext.correctlyDisplayLastItem(includeUl);
                            }

                        }
                    });
                });
            }
        },
        buildChildrenNodes: function (data, listChild) {

            var lastIteration = data.lastIterationNumber - 1;
            var assemblyArray = data.partIterations[lastIteration].components;
            var rootContext = this;
            assemblyArray.forEach(function (element, index) {

                rootContext.getChildLatestVersion(data.workspaceId, element.component.number).success(function (latest) {

                    var fullId = 'path_-1-' + element.fullId;
                    var item = document.createElement('li');
                    var span = document.createElement('span');
                    item.setAttribute('id', fullId);
                    span.setAttribute('class', 'product_title');
                    $(span).text(latest.partKey);
                    item.append(span);
                    rootContext.buildHierarchy(element.component.number, item, fullId, data.workspaceId);
                    if (index === (assemblyArray.length - 1)) {

                        var lastestIteration = latest.lastIterationNumber - 1;
                        var components = latest.partIterations[lastestIteration].components;
                        if (components.length !== 0) {

                            item.setAttribute('class', 'lastExpandable embeddedExpandable');
                        } else {

                            item.setAttribute('class', 'last');
                        }
                    }
                    rootContext.addLineInList(listChild, item);
                });
            });
        },
        buildHierarchy: function (partNumber, currentLine, parentId, workspaceId) {

            var rootContext = this;
            this.getChildLatestVersion(workspaceId, partNumber).success(function (latestChild) {

                var lastIteration = latestChild.lastIterationNumber - 1;
                var latestChildArray = latestChild.partIterations[lastIteration].components;
                if (latestChildArray.length !== 0) {

                    $(currentLine).addClass('embeddedExpandable');
                    var embeddedDiv = document.createElement('div');
                    var embeddedUl = document.createElement('ul');
                    embeddedDiv.setAttribute('class', 'blockClickAreaEmbedded hitarea expandable-hitarea embeddedExpandable');
                    latestChildArray.forEach(function (element, index) {

                        rootContext.getChildLatestVersion(workspaceId, element.component.number).success(function (latest) {

                            var subLi = document.createElement('li');
                            var currentParentId = parentId + '-' + element.fullId;
                            subLi.setAttribute('id', currentParentId);
                            var span = document.createElement('span');
                            span.setAttribute('class', 'product_title');
                            $(span).text(latest.partKey);
                            subLi.append(span);
                            if (index === (latestChildArray.length - 1)) {

                                var lastestIteration = latest.lastIterationNumber - 1;
                                var components = latest.partIterations[lastestIteration].components;
                                if (components.length !== 0) {

                                    subLi.setAttribute('class', 'lastExpandable embeddedExpandable');
                                } else {

                                    subLi.setAttribute('class', 'last');
                                }
                            }
                            rootContext.addLineInList(embeddedUl, subLi);
                        });
                        embeddedUl.setAttribute('style', 'display:none;  background: none;');
                    });
                    currentLine.prepend(embeddedDiv);//should always be first child
                    currentLine.append(embeddedUl);
                    rootContext.correctlyDisplayLastItem(embeddedUl);
                }
            });
        },
        addLineInList: function (list, line) {

            //avoid inconsistent positioning
            //last item should always be positioning at end of the list
            if ($(line).hasClass('lastExpandable') || $(line).hasClass('last')) {

                list.append(line);
            } else {

                list.prepend(line);
            }
        },
        correctlyDisplayLastItem: function (list) {

            var parentTag = $(list).parent();
            var currentDivTag = parentTag.children('div');
            if (parentTag.hasClass('lastExpandable')) {

                currentDivTag.addClass('lastExpandable-hitarea');
            }
        },
        makeRootNodeCollapsable: function () {

            var blockClickArea = this.$('.blockClickArea');
            var firstPath = this.$('.path_-1');
            blockClickArea.removeClass('expandable lastExpandable-hitarea expandable-hitarea');
            blockClickArea.addClass('collapsable-hitarea lastCollapsable-hitarea collapsable');
            firstPath.removeClass('lastExpandable');
            firstPath.addClass('lastCollapsable');
        },
        makeEmbeddedNodesCollapsable: function (currentSelected) {

            var selectedItem = $(currentSelected);
            var ulIntoSelectedItem = selectedItem.children('ul');
            var divIntoSelectedItem = selectedItem.children('.blockClickAreaEmbedded');

            ulIntoSelectedItem.css('display', 'block');
            divIntoSelectedItem.removeClass('expandable-hitarea embeddedExpandable');
            divIntoSelectedItem.addClass('collapsable-hitarea');
            selectedItem.removeClass('embeddedExpandable');

            if (selectedItem.is(':last-child')) {

                selectedItem.addClass('lastCollapsable embeddedCollapsable');
                selectedItem.removeClass('lastExpandable');
                divIntoSelectedItem.removeClass('lastExpandable-hitarea');
                divIntoSelectedItem.addClass('lastCollapsable-hitarea embeddedCollapsable');
            } else {

                selectedItem.addClass('embeddedCollapsable');
                divIntoSelectedItem.addClass('embeddedCollapsable');
            }
        },
        revertCssPropertiesOfCells: function () {

            this.$el.find('td').each(function (index, td) {

                var currentCell = $(td);
                currentCell.css({'vertical-align':'middle','position':'','top':''});
                if(currentCell.hasClass('part_number')){

                    var faTag = currentCell.children('nav').children('div').children('i');
                    var firstLine = currentCell.children('nav').children('div').children('ul').children('li');

                    $(firstLine).each(function(index,line){

                        $(line).css({'position':'','top':''});
                    });
                    $(faTag).each(function(index, fa){

                        $(fa).css({'vertical-align':'middle','position':'','top':''});
                    });
                }
            });
        },
        closeAllRootNodeExpanded: function () {

            this.revertRootBlockClickArea();
            this.revertRootFirstPath();
            this.revertRootLabel();
            this.clearAllRootChildrenCollapsed();
            this.revertCssPropertiesOfCells();
        },

        closeAllEmbeddedNodesExpands: function (ulParent) {

            var allItems = $(ulParent).children('li');
            var rootContext = this;
            allItems.each(function (index, element) {

                rootContext.closeSingleEmbeddeNodeExpands(element);
                var embeddedUl = $(element).children('ul');
                if (embeddedUl !== 'undefined') {

                    rootContext.closeAllEmbeddedNodesExpands(embeddedUl);
                }
            });
        },
        closeSingleEmbeddeNodeExpands: function (currentSelected) {

            var selectedItem = $(currentSelected);
            var divInLineSelected = selectedItem.children('.blockClickAreaEmbedded');
            var ulInLineSelected = selectedItem.children('ul');
            if (selectedItem.is(':last-child')) {

                currentSelected.setAttribute('class', 'lastExpandable embeddedExpandable');
            } else {

                currentSelected.setAttribute('class', 'embeddedExpandable');
            }
            //--- clossing all div element
            divInLineSelected.each(function (index, element) {

                if ($(element).parent().is(':last-child')) {

                    element.setAttribute('class', 'blockClickAreaEmbedded hitarea expandable-hitarea lastExpandable-hitarea embeddedExpandable');
                } else {

                    element.setAttribute('class', 'blockClickAreaEmbedded hitarea expandable-hitarea embeddedExpandable');
                }
            });
            //--- hide all list
            ulInLineSelected.each(function (index, element) {

                element.setAttribute('style', 'display:none;background: none;');
            });
        },
        revertRootBlockClickArea: function () {

            this.$el.find('.blockClickArea').each(function (index, element) {

                var currentBlock = $(element);
                currentBlock.removeClass('collapsable-hitarea lastCollapsable-hitarea collapsable');
                if (currentBlock.is(':last-child')) {

                    currentBlock.addClass('last');
                }
                currentBlock.addClass('expandable-hitarea lastExpandable-hitarea expandable');
            });
        },
        revertRootFirstPath: function () {

            this.$el.find('.path_-1').each(function (index, element) {

                var currentPath = $(element);
                currentPath.removeClass('collapsable lastCollapsable');
                currentPath.addClass('lastExpandable');
            });
        },
        revertRootLabel: function () {

            this.$el.find('.product_title').each(function (index, element) {

                var currentTitle = $(element);
                if (currentTitle.is(':last-child')) {

                    currentTitle.addClass('last');
                }
                currentTitle.addClass('product_title');
                currentTitle.removeClass('collapsable');
            });
        },
        clearAllRootChildrenCollapsed: function () {

            this.$el.find('.list_child').each(function (index, element) {

                var currentList = $(element);
                currentList.empty();
            });
        },
        getChild: function (workspace, partNumber) {
            return $.ajax({
                method: 'GET',
                url: App.config.apiEndPoint + '/workspaces/' + encodeURIComponent(workspace) + '/parts/' + partNumber
            });
        },
        getChildLatestVersion: function (workspace, partNumber) {

            return $.ajax({
                method: 'GET',
                url: App.config.apiEndPoint + '/workspaces/' + encodeURIComponent(workspace) + '/parts/' + partNumber + '/latest-revision'
            });
        }

    });

    return PartListItemView;

});
