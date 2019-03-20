/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/part-table-customizations.html',
    'common-objects/customizations/part-table-columns',
    'common-objects/views/alert'
], function (Backbone, Mustache, template, PartTableColumns, AlertView) {
    'use strict';

    var PartTableCustomizationsView = Backbone.View.extend({

        events: {
            'click .reset': 'reset',
            'click .clear': 'clear',
            'click .submit': 'save'
        },

        selectizeOptions: {
            plugins: ['remove_button', 'drag_drop', 'optgroup_columns'],
            persist: true,
            delimiter: ',',
            optgroupField: 'group',
            optgroupLabelField: 'name',
            optgroupValueField: 'id',
            optgroups: PartTableColumns.optgroups,
            valueField: 'value',
            searchField: ['name'],
            options: null,
            render: {
                item: function (item, escape) {
                    return '<div><span class="name">' + escape(item.name) + '</span></div>';
                },
                option: function (item, escape) {
                    return '<div><span class="label">' + escape(item.name) + '</span></div>';
                }
            }
        },

        initialize: function () {
            this.availableColumns = _.clone(PartTableColumns.defaultColumns);
        },

        render: function () {
            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n
            }));
            this.$notifications = this.$('.notifications');
            this.init();
            return this;
        },

        init: function () {
            var _this = this;
            this.fetchPartTableColumns()
                .then(function (columns) {
                    _this.customColumns = columns;
                })
                .then(this.fetchPartIterationsAttributes.bind(this))
                .then(this.initSelectize.bind(this));
        },

        reset: function () {
            this.customColumns = _.clone(this.availableColumns);
            this.initSelectize();
        },

        clear: function () {
            this.customColumns = [];
            this.initSelectize();
        },

        initSelectize: function (attributes) {

            var columns = this.customColumns;
            this.$selectize = this.$('#customize-columns');
            this.$selectize.selectize(this.selectizeOptions);
            var selectize = this.$selectize[0].selectize;
            this.selectize = selectize;
            selectize.clear();

            // add all available as options
            _.each(this.availableColumns, function (column) {
                selectize.addOption({
                    name: PartTableColumns.columnNameMapping[column],
                    value: column,
                    group: column.split('.')[0]
                });
            });
            _.each(attributes, function (attribute) {
                selectize.addOption({
                    name: attribute.name,
                    value: 'attr-' + attribute.type + '.' + attribute.name,
                    group: 'attr-' + attribute.type
                });
            });

            // add custom columns as items
            _.each(columns, function (column) {
                selectize.addItem(column, true);
            });
        },

        fetchPartTableColumns: function () {
            var $deferred = $.Deferred();
            $.getJSON(App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/front-options')
                .success(function (workspaceCustomizations) {
                    $deferred.resolve(workspaceCustomizations.partTableColumns);
                })
                .error(function () {
                    $deferred.resolve(_.clone(PartTableColumns.defaultColumns));
                });
            return $deferred;
        },

        fetchPartIterationsAttributes: function () {
            return $.getJSON(App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/attributes/part-iterations');
        },

        save: function () {
            var _this = this;
            var items = this.selectize.items;
            if(!items.length){
                _this.$notifications.append(new AlertView({
                    type: 'error',
                    message: App.config.i18n.EMPTY_COLUMNS
                }).render().$el);
                return;
            }
            $.ajax({
                method: 'PUT',
                url: App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/front-options',
                contentType: 'application/json',
                data: JSON.stringify({
                    partTableColumns: this.selectize.items
                }),
                success: function () {
                    _this.$notifications.append(new AlertView({
                        type: 'success',
                        message: App.config.i18n.SAVED
                    }).render().$el);
                },
                error: function (xhr) {
                    _this.$notifications.append(new AlertView({
                        type: 'error',
                        message: xhr.responseText
                    }).render().$el);
                }
            });
        }

    });

    return PartTableCustomizationsView;
});
