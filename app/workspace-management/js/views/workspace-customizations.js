/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/workspace-customizations.html',
    'views/part-table-customizations'
], function (Backbone, Mustache, template, PartTableCustomizationsView) {
    'use strict';

    var WorkspaceCustomizationsView = Backbone.View.extend({

        events: {},

        initialize: function () {
        },

        render: function () {

            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n
            }));

            var partTableCustomizationsView = new PartTableCustomizationsView().render();
            this.$('#customizations-content').html(partTableCustomizationsView.$el);
            return this;
        }

    });

    return WorkspaceCustomizationsView;
});
