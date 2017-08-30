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
            optgroups: [
                {id: 'pr', name: App.config.i18n.PART_REVISION},
                {id: 'attr-TEXT', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_STRING},
                {id: 'attr-LONG_TEXT', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_LONG_STRING},
                {id: 'attr-PART_NUMBER', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_PART_NUMBER},
                {id: 'attr-URL', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_URL},
                {id: 'attr-LOV', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_LOV},
                {id: 'attr-NUMBER', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_NUMBER},
                {id: 'attr-DATE', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_DATE},
                {id: 'attr-BOOLEAN', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_BOOLEAN},
            ],
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
                    _this.columns = workspaceCustomization.partTableColumns;
                })
                .then(this.fetchPartIterationsAttributes.bind(this))
                .then(this.initSelectize.bind(this));
        },

        reset: function () {
            this.selectize.clear();
            this.columns = _.clone(PartTableColumns.defaultColumns);
            this.initSelectize();
        },

        initSelectize: function (attributes) {

            var columns = this.columns;

            this.$selectize = this.$('#customize-columns');
            this.$selectize.selectize(this.selectizeOptions);
            var selectize = this.$selectize[0].selectize;
            this.selectize = selectize;

            _.each(columns, function (column) {
                selectize.addOption({
                    name: PartTableColumns.columnNameMapping[column],
                    value: column,
                    group: column.split('.')[0]
                });
                selectize.addItem(column, true);
            });

            _.each(attributes, function (attribute) {
                selectize.addOption({
                    name: attribute.name,
                    value: 'attr-' + attribute.type + '.' + attribute.name,
                    group: 'attr-' + attribute.type
                });
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
