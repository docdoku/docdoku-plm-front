/*global _,define,App,bootbox*/
define([
    'backbone',
    'mustache',
    'text!templates/part/part_list.html',
    'views/part/part_list_item',
    'common-objects/customizations/part-table-columns'
], function (Backbone, Mustache, template, PartListItemView, PartTableColumns) {
    'use strict';
    var PartListView = Backbone.View.extend({

        events: {
            'click .toggle-checkboxes': 'toggleSelection'
        },

        removeSubviews: function () {
            // Invoke remove for each views in listItemViews
            _(this.listItemViews).invoke('remove');
            this.listItemViews = [];
        },

        initialize: function () {
            _.bindAll(this);
            this.listenTo(this.collection, 'reset', this.resetList);
            this.listenTo(this.collection, 'add', this.addNewPart);
            this.listItemViews = [];
            this.selectedPartIndexes = [];
            this.$el.on('remove', this.removeSubviews);
            Backbone.Events.on('import:success', this.collection.fetch, this.collection);
        },

        getColumns: function () {
            var $deferred = $.Deferred();
            $.getJSON(App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/customizations')
                .success(function (workspaceCustomizations) {
                    $deferred.resolve(workspaceCustomizations.partTableColumns);
                })
                .error(function () {
                    $deferred.resolve(_.clone(PartTableColumns.defaultColumns));
                });
            return $deferred;
        },

        render: function () {
            var that = this;
            this.getColumns()
                .then(function (partTableColumns) {
                    that.columns = partTableColumns.reverse();
                })
                .then(function () {
                    that.collection.fetch({reset: true}).error(function (err) {
                        that.trigger('error', null, err);
                    });
                });
            return this;
        },

        bindDomElements: function () {
        },

        resetList: function () {
            var _this = this;
            this.removeSubviews();

            this.$el.html(Mustache.render(template, {i18n: App.config.i18n}));
            this.addCustomColumns();
            this.bindDomElements();

            this.collection.each(function (model) {
                _this.addPart(model);
            });

            this.dataTable();
            this.onSelectionChanged();
        },

        addNewPart: function (model) {
            this.addPart(model, true);
            this.redraw();
        },

        addPart: function (model, effect) {
            var view = this.addPartView(model);
            if (effect) {
                view.$el.highlightEffect();
            }
        },

        removePart: function (model) {
            this.removePartView(model);
            this.redraw();
        },

        removePartView: function (model) {

            var viewToRemove = _(this.listItemViews).select(function (view) {
                return view.model === model;
            })[0];

            if (viewToRemove) {
                this.listItemViews = _(this.listItemViews).without(viewToRemove);
                var row = viewToRemove.$el.get(0);
                this.oTable.fnDeleteRow(this.oTable.fnGetPosition(row));
                viewToRemove.remove();
            }

        },

        addPartView: function (model) {
            var view = new PartListItemView({model: model, columns: this.columns}).render();
            this.listItemViews.push(view);
            this.$('.items').append(view.$el);
            view.on('selectionChanged', this.onSelectionChanged);
            view.on('rendered', this.redraw);
            return view;
        },

        toggleSelection: function () {
            if (this.$('.toggle-checkboxes').is(':checked')) {
                _(this.listItemViews).each(function (view) {
                    view.check();
                });
            } else {
                _(this.listItemViews).each(function (view) {
                    view.unCheck();
                });
            }
            this.onSelectionChanged();
        },

        checkCheckboxes: function () {
            var that = this;
            _.each(that.selectedPartIndexes, function (selectedView) {
                _.each(that.listItemViews, function (view) {
                    if (selectedView.model.getPartKey() === view.model.getPartKey()) {
                        view.check();
                        view.selectionChanged();
                    }
                });
            });

            this.selectedPartIndexes = [];

        },

        onSelectionChanged: function () {

            var checkedViews = _(this.listItemViews).select(function (itemView) {
                return itemView.isChecked();
            });

            if (checkedViews.length <= 0) {
                this.onNoPartSelected();
            } else if (checkedViews.length === 1) {
                this.onOnePartSelected();

                if (checkedViews[0].model.isCheckout()) {
                    if (checkedViews[0].model.isCheckoutByConnectedUser()) {
                        var canUndo = checkedViews[0].model.getLastIteration().get('iteration') > 1;
                        this.trigger('checkout-group:update', {canCheckout: false, canUndo: canUndo, canCheckin: true});
                    } else {
                        this.trigger('checkout-group:update', {canCheckout: false, canUndo: false, canCheckin: false});
                    }
                } else {
                    this.trigger('checkout-group:update', {canCheckout: true, canUndo: false, canCheckin: false});
                }

            } else {
                this.onSeveralPartsSelected();
                this.canCheckinCheckoutOrUndoCheckout();


            }

        },

        onNoPartSelected: function () {
            this.trigger('delete-button:display', false);
            this.trigger('effectivity-button:display', false);
            this.trigger('checkout-group:display', false);
            this.trigger('acl-edit-button:display', false);
            this.trigger('new-version-button:display', false);
            this.trigger('release-button:display', false);
            this.trigger('new-product-button:display', false);
            this.trigger('obsolete-button:display', false);
        },

        onOnePartSelected: function () {
            var partSelected = this.getSelectedPart();
            this.trigger('delete-button:display', true);
            this.trigger('effectivity-button:display', partSelected.isReleased() && !partSelected.isObsolete());
            this.trigger('checkout-group:display', !partSelected.isReleased() && !partSelected.isObsolete());
            this.trigger('acl-edit-button:display', partSelected ? (App.config.workspaceAdmin || partSelected.getAuthorLogin() === App.config.login) : false);
            this.trigger('new-version-button:display', !partSelected.isCheckout());
            this.trigger('release-button:display', (!partSelected.isCheckout() && !partSelected.isReleased() && !partSelected.isObsolete()));
            this.trigger('new-product-button:display', true);
            this.trigger('obsolete-button:display', partSelected.isReleased());
        },

        onSeveralPartsSelected: function () {
            this.trigger('delete-button:display', true);
            this.trigger('effectivity-button:display', false);
            this.trigger('acl-edit-button:display', false);
            this.trigger('new-version-button:display', false);
            this.trigger('release-button:display', this.isSelectedPartsReleasable());
            this.trigger('new-product-button:display', false);
            this.trigger('obsolete-button:display', false);
        },

        deleteSelectedParts: function () {
            var _this = this;

            bootbox.confirm(App.config.i18n.CONFIRM_DELETE_PART,
                App.config.i18n.CANCEL,
                App.config.i18n.CONFIRM,
                function (result) {
                    if (result) {
                        var checkedViews = _(_this.listItemViews).select(function (view) {
                            return view.isChecked();
                        });
                        var requestsToBeDone = checkedViews.length;
                        var requestsDone = 0;

                        var onRequestOver = function () {
                            if (++requestsDone === requestsToBeDone) {
                                _this.onSelectionChanged();
                                Backbone.Events.trigger('part:iterationChange');
                            }
                        };
                        _(_this.listItemViews).each(function (view) {
                            if (view.isChecked()) {
                                view.model.destroy({
                                    wait: true,
                                    dataType: 'text', // server doesn't send a json hash in the response body
                                    success: function () {
                                        _this.removePart(view.model);
                                        onRequestOver();

                                    },
                                    error: function (model, err) {
                                        _this.trigger('error', model, err);
                                        //must be called, if not the ones which succeed
                                        //won't trigger the event while the part did change.
                                        Backbone.Events.trigger('part:iterationChange');
                                        _this.onSelectionChanged();
                                    }
                                });
                            }
                        });

                    }
                });
        },

        releaseSelectedParts: function () {
            var that = this;
            bootbox.confirm(App.config.i18n.RELEASE_SELECTION_QUESTION,
                App.config.i18n.CANCEL,
                App.config.i18n.CONFIRM,
                function (result) {
                    if (result) {
                        _(that.listItemViews).each(function (view) {
                            if (view.isChecked()) {
                                view.model.release();
                            }
                        });
                    }
                });
        },

        getSelectedPart: function () {
            var checkedView = _(this.listItemViews).select(function (itemView) {
                return itemView.isChecked();
            })[0];

            if (checkedView) {
                return checkedView.model;
            }
            return null;
        },

        getSelectedParts: function () {
            var checkedViews = [];
            _(this.listItemViews).select(function (itemView) {
                if (itemView.isChecked()) {
                    checkedViews.push(itemView.model);
                }

            });
            return checkedViews;
        },

        getSelectedPartIndexes: function () {
            for (var i = 0; i < this.listItemViews.length; i++) {
                if (this.listItemViews[i].isChecked()) {
                    this.selectedPartIndexes[this.selectedPartIndexes.length] = this.listItemViews[i];
                }
            }
        },

        eachChecked: function (callback) {
            _(this.listItemViews).each(function (view) {
                if (view.isChecked()) {
                    callback(view);
                }
            });
        },

        isSelectedPartsReleasable: function () {
            var isPartReleasable = true;
            _(this.listItemViews).each(function (view) {
                if (view.isChecked() && (view.model.isCheckout() || view.model.isReleased() || view.model.isObsolete())) {
                    isPartReleasable = false;
                }
            });
            return isPartReleasable;
        },

        areSelectedPartsCheckoutable: function () {
            var isPartCheckout = this.getSelectedParts().length > 0;
            _(this.getSelectedParts()).each(function (view) {
                if (view.isReleased() || view.isCheckout() || view.isObsolete()) {
                    isPartCheckout = false;
                }
            });
            return isPartCheckout;
        },

        areSelectedPartsCheckedOut: function () {
            var isPartCheckedOut = this.getSelectedParts().length > 0;
            _(this.getSelectedParts()).each(function (view) {
                if (!view.isCheckout()) {
                    isPartCheckedOut = false;
                }
            });
            return isPartCheckedOut;
        },

        areSelectedPartsAllNotCheckedOut: function () {
            var isPartNotCheckedOut = this.getSelectedParts().length > 0;
            _(this.getSelectedParts()).each(function (view) {
                if (view.isCheckout() || view.isReleased() || view.isObsolete()) {
                    isPartNotCheckedOut = false;
                }
            });
            return isPartNotCheckedOut;
        },

        areSelectedPartsCheckedOutByConnectedUser: function () {
            var isPartCheckedOutByConnectedUser = this.getSelectedParts().length > 0;
            _(this.getSelectedParts()).each(function (view) {
                if (!view.isCheckoutByConnectedUser()) {
                    isPartCheckedOutByConnectedUser = false;
                }
            });
            return isPartCheckedOutByConnectedUser;
        },

        haveMoreThanOneIteration: function () {
            var hasMoreThanOneIteration = this.getSelectedParts().length > 0;
            _(this.getSelectedParts()).each(function (view) {
                if (view.getLastIteration().get('iteration') <= 1) {
                    hasMoreThanOneIteration = false;
                }
            });
            return hasMoreThanOneIteration;
        },

        canCheckinCheckoutOrUndoCheckout: function () {

            if (this.areSelectedPartsCheckedOut()) {
                if (this.areSelectedPartsCheckedOutByConnectedUser()) {
                    this.trigger('checkout-group:display', true);
                    this.trigger('checkout-group:update', {
                        canCheckout: false,
                        canUndo: this.haveMoreThanOneIteration(),
                        canCheckin: true
                    });
                } else {
                    this.trigger('checkout-group:display', true);
                    this.trigger('checkout-group:update', {canCheckout: false, canUndo: false, canCheckin: false});
                }
            } else if (this.areSelectedPartsAllNotCheckedOut()) {
                this.trigger('checkout-group:display', true);
                this.trigger('checkout-group:update', {canCheckout: true, canUndo: false, canCheckin: false});
            }

            else if (this.areSelectedPartsCheckoutable()) {
                this.trigger('checkout-group:display', true);
                this.trigger('checkout-group:update', {canCheckout: true, canUndo: false, canCheckin: false});
            }
            else {
                this.trigger('checkout-group:display', false);
            }

        },

        redraw: function () {
            this.dataTable();
        },

        dataTable: function () {
            var oldSort = [
                [0, 'asc']
            ];
            if (this.oTable) {
                if (this.oTable.fnSettings()) {
                    oldSort = this.oTable.fnSettings().aaSorting;
                }
                this.oTable.fnDestroy();
            }

            var columns = this.columns;
            // Before - Columns - After
            var totalColumns = 3 + columns.length + 3;

            var excludeFromSort = [0, 1, 2, totalColumns - 3, totalColumns - 2, totalColumns - 1];
            var dateColumns = [];
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].startsWith('attr-DATE')) {
                    dateColumns.push(i);
                }
            }
            var stripHTMLColumns = [3];

            this.oTable = this.$el.dataTable({
                aaSorting: oldSort,
                bDestroy: true,
                iDisplayLength: -1,
                oLanguage: {
                    sSearch: '<i class="fa fa-search"></i>',
                    sEmptyTable: App.config.i18n.NO_DATA,
                    sZeroRecords: App.config.i18n.NO_FILTERED_DATA
                },
                sDom: 'ft',
                aoColumnDefs: [
                    {'bSortable': false, 'aTargets': excludeFromSort},
                    {'sType': App.config.i18n.DATE_SORT, 'aTargets': dateColumns},
                    {'sType': 'strip_html', 'aTargets': stripHTMLColumns}
                ]
            });

            this.$el.parent().find('.dataTables_filter input').attr('placeholder', App.config.i18n.FILTER);
        },

        addCustomColumns: function () {
            var columns = this.columns;
            var thirdCol = this.$('th:nth-child(3)');
            var _this = this;
            _.each(columns, function (column) {
                thirdCol.after('<th>' + _this.getColumnHeaderValue(column) + '</th>');
            });
        },

        getColumnHeaderValue: function (column) {
            if (column.startsWith('attr-')) {
                return column.split('.')[1];
            }
            var columnName = PartTableColumns.columnNameMapping[column];
            return columnName ? columnName : '?';
        }

    });
    return PartListView;
});
