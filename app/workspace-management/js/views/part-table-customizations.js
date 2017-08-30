/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/part-table-customizations.html',
    'common-objects/customizations/part-table-columns'
], function (Backbone, Mustache, template, PartTableColumns) {
    'use strict';

    var PartTableCustomizationsView = Backbone.View.extend({

        events: {
            'click .reset': 'reset',
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
            this.init();
            return this;
        },

        init: function () {
            var _this = this;
            this.fetchPartTableColumns()
                .then(function (workspaceCustomization) {
                    _this.customColumns = workspaceCustomization.partTableColumns;
                })
                .then(this.fetchPartIterationsAttributes.bind(this))
                .then(this.initSelectize.bind(this));
        },

        reset: function () {
            this.customColumns = _.clone( this.availableColumns);
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
            return $.getJSON(App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/customizations');
        },

        fetchPartIterationsAttributes: function () {
            return $.getJSON(App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/attributes/part-iterations');
        },

        save: function () {
            $.ajax({
                method: 'PUT',
                url: App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/customizations',
                contentType: 'application/json',
                data: JSON.stringify({
                    partTableColumns: this.selectize.items
                }),
                success: function () {
                    console.log('saved')
                },
                error: function () {
                    console.log('error on save')
                }
            });
        }

    });

    return PartTableCustomizationsView;
});
