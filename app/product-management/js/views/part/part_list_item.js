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
            'click .expandable': 'expandRootNodeChilds',
            'click .collapsable': 'clearRootNodesChilds',
            'click .embeddedExpandable': 'expandEmbeddedNodesChilds',
            'click .embeddedCollapsable': 'clearEmbeddedNodesChilds'
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
        expandRootNodeChilds: function (event) {

            event.stopPropagation();
            this.revertCssPropetyOfCells();
            var partKey = this.model.attributes.partKey;
            var parentInstance = this;
            var workspace = this.model.attributes.workspaceId;
            var listChild = this.$('.list_child');
            $(this.el).find('td').each(function (index, element) {

                $(element).css('vertical-align', 'top');
            });
            this.makeRootNodeCollapsable();
            this.getChild(workspace, partKey).success(function (data) {

                parentInstance.buildChildsNodes(data, listChild);
            });
        },
        expandEmbeddedNodesChilds: function (event) {

            event.stopPropagation();
            var currentLineSelected = event.currentTarget;
            var workspaceId = this.model.attributes.workspaceId;
            if ($(currentLineSelected).is('div')) {

                currentLineSelected = $(currentLineSelected).parent()[0];
            }
            this.exposeEmbeddedChilds(workspaceId, currentLineSelected);
            this.makeEmbeddedNodesCollapsable(currentLineSelected);
        },
        clearEmbeddedNodesChilds: function (event) {

            event.stopPropagation();
            var currentLineSelected = event.currentTarget;
            if ($(currentLineSelected).is('div')) {

                currentLineSelected = $(currentLineSelected).parent()[0];
            }
            this.closeSingleEmbeddeNodeExpands(currentLineSelected);
        },
        clearRootNodesChilds: function (event) {

            event.stopPropagation();
            this.closeAllRootNodeExpanded();
        },
        exposeEmbeddedChilds: function (workspaceId, rootLine) {

            var rootContext = this;
            var listChildEmbedded = $(rootLine).children('ul').children('li');
            if (typeof listChildEmbedded !== 'undefined') {

                $(listChildEmbedded).each(function (index, item) {

                    var partKey = $(item).children('span').text();
                    rootContext.getChild(workspaceId, partKey).success(function (data) {

                        var lastIteration = data.lastIterationNumber - 1;
                        var assemblyArray = data.partIterations[lastIteration].components;
                        if ((assemblyArray.length) !== 0) {


                            item.setAttribute('class', 'embeddedExpandable');
                            if ($(item).is(':last-child')) {

                                item.setAttribute('class', 'last embeddedExpandable');
                            }
                            if (!$(item).children('ul').length && !$(item).children('.blockClickAreaEmbedded').length) {

                                var includeDiv = document.createElement('div');
                                var includeUl = document.createElement('ul');
                                includeDiv.setAttribute('class', 'blockClickAreaEmbedded hitarea expandable-hitarea embeddedExpandable');
                                rootContext.buildChildsNodes(data, includeUl);
                                if ($(item).is(':last-child')) {

                                    includeDiv.setAttribute('class', 'blockClickAreaEmbedded hitarea last expandable-hitarea embeddedExpandable');
                                }
                                includeUl.setAttribute('style', 'display:none;');
                                item.append(includeUl);
                                item.prepend(includeDiv);
                            }
                        }
                    });
                });
            }
        },
        buildChildsNodes: function (data, listChild) {

            var lastIteration = data.lastIterationNumber - 1;
            var assemblyArray = data.partIterations[lastIteration].components;
            var rootContext = this;
            assemblyArray.forEach(function (element, index) {

                rootContext.getChildLatestVersion(data.workspaceId, element.component.number).success(function (latest) {

                    var fullId = 'path_-1-' + element.fullId;
                    var item = document.createElement('li');
                    var span = document.createElement('span');
                    span.setAttribute('class', 'product_title');
                    $(span).text(latest.partKey);
                    item.append(span);
                    rootContext.buildHierarchy(element.component.number, item, fullId, data.workspaceId);
                    if (index === (assemblyArray.length - 1)) {

                        item.setAttribute('class', 'last embeddedExpandable');
                    }
                    listChild.append(item);
                });
            });
        },
        buildHierarchy: function (partNumber, currentLine, parentId, workspaceId) {

            var rootContext = this;
            this.getChildLatestVersion(workspaceId, partNumber).success(function (latestChild) {

                var lastIteration = latestChild.lastIterationNumber - 1;
                var latestChildArray = latestChild.partIterations[lastIteration].components;
                if (latestChildArray.length !== 0) {

                    $(currentLine).addClass('product_title');
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

                                subLi.setAttribute('class', 'last embeddedExpandable');
                            }
                            embeddedUl.append(subLi);
                        });
                        embeddedUl.setAttribute('style', 'display:none;');
                    });
                    currentLine.prepend(embeddedDiv);
                    currentLine.append(embeddedUl);
                }
            });
        },
        makeRootNodeCollapsable: function () {

            var blockClickArea = this.$('.blockClickArea');
            var firstPath = this.$('.path_-1');
            var label = this.$('.product_title');
            blockClickArea.removeClass('expandable');
            blockClickArea.removeClass('lastExpandable-hitarea');
            blockClickArea.removeClass('expandable-hitarea');
            blockClickArea.addClass('collapsable-hitarea');
            blockClickArea.addClass('lastCollapsable-hitarea');
            blockClickArea.addClass('collapsable');
            firstPath.removeClass('expandable');
            firstPath.removeClass('lastExpandable');
            firstPath.addClass('collapsable');
            firstPath.addClass('lastCollapsable');
            if ($(firstPath).is(':last-child')) {

                firstPath.addClass('last');
            }
            label.removeClass('expandable');
            label.addClass('collapsable');
        },
        makeEmbeddedNodesCollapsable: function (currentSelected) {

            $(currentSelected).children('ul').css('display', 'block');
            $(currentSelected).children('.blockClickAreaEmbedded').removeClass('expandable-hitarea');
            $(currentSelected).children('.blockClickAreaEmbedded').addClass('collapsable-hitarea');
            $(currentSelected).children('.blockClickAreaEmbedded').removeClass('embeddedExpandable');
            $(currentSelected).removeClass('embeddedExpandable');

            if ($(currentSelected).is(':last-child')) {

                $(currentSelected).addClass('last embeddedCollapsable');
                $(currentSelected).children('.blockClickAreaEmbedded').addClass('last embeddedCollapsable');
            } else {

                $(currentSelected).addClass('embeddedCollapsable');
                $(currentSelected).children('.blockClickAreaEmbedded').addClass('embeddedCollapsable');
            }
        },
        revertCssPropetyOfCells: function () {

            var currentTr = $(this.el);
            $(currentTr).find('td').each(function (index, td) {

                $(td).css('vertical-align', 'middle');
            });
        },
        closeAllRootNodeExpanded: function () {

            this.revertRootBlockClickArea();
            this.revertRootFirstPath();
            this.revertRootLabel();
            this.clearAllRootChildsCollapsed();
            this.revertCssPropetyOfCells();
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

            var divInLineSelected = $(currentSelected).children('.blockClickAreaEmbedded');
            var ulInLineSelected = $(currentSelected).children('ul');
            if ($(currentSelected).is(':last-child')) {

                currentSelected.setAttribute('class', 'last embeddedExpandable');
            } else {

                currentSelected.setAttribute('class', 'embeddedExpandable');
            }
            //--- clossing all div element
            divInLineSelected.each(function (index, element) {

                if ($(element).is(':last-child')) {

                    element.setAttribute('class', 'blockClickAreaEmbedded hitarea expandable-hitarea last embeddedExpandable');
                } else {

                    element.setAttribute('class', 'blockClickAreaEmbedded hitarea expandable-hitarea embeddedExpandable');
                }
            });
            //--- hide all list
            ulInLineSelected.each(function (index, element) {

                element.setAttribute('style', 'display:none;');
            });
        },
        revertRootBlockClickArea: function () {

            var tbody = $(this.el);
            $(tbody).find('.blockClickArea').each(function (index, element) {

                $(element).removeClass('collapsable-hitarea');
                $(element).removeClass('lastCollapsable-hitarea');
                $(element).removeClass('collapsable');
                if ($(element).is(':last-child')) {

                    $(element).addClass('last');
                }
                $(element).addClass('expandable-hitarea');
                $(element).addClass('expandable');
                $(element).addClass('blockClickArea');
            });
        },
        revertRootFirstPath: function () {

            var tbody = $(this.el);
            $(tbody).find('.path_-1').each(function (index, element) {

                $(element).removeClass('collapsable');
                $(element).removeClass('lastCollapsable');
                $(element).addClass('expandable');
                if ($(element).is(':last-child')) {

                    $(element).addClass('last');
                }
            });
        },
        revertRootLabel: function () {

            var tbody = $(this.el);
            $(tbody).find('.product_title').each(function (index, element) {

                if ($(element).is(':last-child')) {

                    $(element).addClass('last');
                }
                $(element).addClass('product_title');
                $(element).addClass('expandable');
                $(element).removeClass('collapsable');
            });
        },
        clearAllRootChildsCollapsed: function () {

            var tbody = $(this.el);
            $(tbody).find('.list_child').each(function (index, element) {

                $(element).empty();
            });
        },
        getChild: function (workspace, partNumber) {
            return $.ajax({
                method: 'GET',
                async: false,
                url: App.config.apiEndPoint + '/workspaces/' + workspace + '/parts/' + partNumber
            });
        },
        getChildLatestVersion: function (workspace, partNumber) {

            return $.ajax({
                method: 'GET',
                async: false,
                url: App.config.apiEndPoint + '/workspaces/' + workspace + '/parts/' + partNumber + '/latest-revision'
            });
        }

    });

    return PartListItemView;

});
