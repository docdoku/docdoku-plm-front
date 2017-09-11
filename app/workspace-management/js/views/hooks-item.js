/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/hooks-item.html',
    'hooks/hooks-types'
], function (Backbone, Mustache, template, HooksTypes) {
    'use strict';

    var HookItemView = Backbone.View.extend({

        events: {
            'change select.hook-type': 'onHookTypeChanged',
            'click .remove-hook': 'onRemove'
        },

        initialize: function () {

        },

        render: function () {
            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n,
                id: this.cid
            }));
            this.$specificConfig = this.$('.specific-hook-configuration');
            this.$typeSelect = this.$('select.hook-type');
            var typeDef = HooksTypes[this.$typeSelect.val()];
            this.buildSpecificParametersForm(typeDef);
            return this;
        },

        onHookTypeChanged: function (e) {
            var typeDef = HooksTypes[e.target.value];
            this.buildSpecificParametersForm(typeDef);

        },

        buildSpecificParametersForm: function (typeDef) {
            var zone = this.$specificConfig;
            zone.empty();
            _.each(typeDef.parameters, function (arg) {
                var element;
                switch (arg.type) {
                    case 'select':
                        element = '<select name="' + arg.name + '">';
                        var options = arg.options.map(function (opt) {
                            return '<option value="' + opt + '">' + opt + '</option>';
                        });
                        element += options.join('\n');
                        element += '</select>';
                        break;
                    case 'text':
                        element = '<input type="text" name="' + arg.name + '" placeholder="' + arg.name + '"/>';
                        break;
                    default:
                        element = '<input type="text" name="' + arg.name + '" placeholder="' + arg.name + '"/>';
                        break;
                }
                zone.append($(element));
            });
        },

        onRemove: function () {
            this.trigger('item:removed');
            this.remove();
        }

    });

    return HookItemView;
});
