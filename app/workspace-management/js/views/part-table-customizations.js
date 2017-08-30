/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/part-table-customizations.html'
], function (Backbone, Mustache, template) {
    'use strict';

    var PartTableCustomizationsView = Backbone.View.extend({

        events: {
            'click .reset': 'reset',
            'click .submit': 'save'
        },

        defaultColumns: [
            {
                name: App.config.i18n.PART_NUMBER,
                value: 'pr.number',
                group: 'pr'
            },
            {
                name: App.config.i18n.VERSION,
                value: 'pr.version',
                group: 'pr'
            },
            {
                name: App.config.i18n.TYPE,
                value: 'pr.type',
                group: 'pr'
            },
            {
                name: App.config.i18n.PART_NAME,
                value: 'pr.name',
                group: 'pr'
            },
            {
                name: App.config.i18n.AUTHOR_NAME,
                value: 'pr.author',
                group: 'pr'
            },
            {
                name: App.config.i18n.MODIFICATION_DATE,
                value: 'pr.moidficationDate',
                group: 'pr'
            },
            {
                name: App.config.i18n.LIFECYCLE_STATE,
                value: 'pr.lifecycleSate',
                group: 'pr'
            },
            {
                name: App.config.i18n.CHECKOUT_BY,
                value: 'pr.checkoutUser',
                group: 'pr'
            },
            {
                name: App.config.i18n.ACL,
                value: 'pr.acl',
                group: 'pr'
            }
        ],

        selectizeOptions: {
            plugins: ['remove_button', 'drag_drop', 'optgroup_columns'],
            persist: true,
            delimiter: ',',
            optgroupField: 'group',
            optgroupLabelField: 'name',
            optgroupValueField: 'id',
            optgroups: [
                {id: 'pr', name: "Part revision"},
                {id: 'pi', name: "Part iteration"},
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
            this.fetchPartIterationsAttributes().then(this.initSelectize.bind(this));
        },

        reset: function () {
            this.selectize.clear();
            this.init();
        },

        initSelectize: function (attributes) {

            var columns = _.clone(this.defaultColumns);

            this.$selectize = this.$('#customize-columns');
            this.$selectize.selectize(this.selectizeOptions);
            var selectize = this.$selectize[0].selectize;
            this.selectize = selectize;

            _.each(columns, function (column) {
                selectize.addOption(column);
                selectize.addItem(column.value, true);
            });

            _.each(attributes, function (attribute) {
                selectize.addOption({
                    name: attribute.name,
                    value: 'attr-' + attribute.type + '.' + attribute.name,
                    group: 'attr-' + attribute.type
                });
            });
        },

        fetchPartIterationsAttributes: function () {
            return $.getJSON(App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/attributes/part-iterations');
        },

        save: function () {
            // TODO call WS with list
            // this.selectize.items : ["pr.name", "pr.number", ...]
            $.ajax({
                url: 'TODO',
                data: {
                    columns: this.selectize.items
                }
            });
        }

    });

    return PartTableCustomizationsView;
});
