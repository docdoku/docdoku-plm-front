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
            'click .remove-hook': 'onRemove',
            'change .specific-hook-configuration input,select': 'updateParameters',
            'change input.hook-name': 'updateName',
            'change input.hook-active': 'updateActive'
        },

        initialize: function () {

        },

        render: function () {
            var _this = this;
            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n,
                id: this.cid
            }));

            this.$specificConfig = this.$('.specific-hook-configuration');
            this.$typeSelect = this.$('select.hook-type');

            _.each(Object.keys(HooksTypes), function (appName) {
                _this.$typeSelect.append('<option value="' + appName + '">' + appName + '</option>')
            });

            this.fillSpecificParametersForm();
            return this;
        },

        onHookTypeChanged: function (e) {
            var typeDef = HooksTypes[e.target.value];
            this.buildSpecificParametersForm(typeDef);
            this.model.set('appName', e.target.value);
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

        fillSpecificParametersForm: function () {
            this.$('.hook-name').val(this.model.get('name'));
            this.$('select.hook-type').val(this.model.get('appName'));

            if (this.model.get('active')) {
                this.$('.hook-active').attr('checked', 'true');
            }

            var typeDef = HooksTypes[this.model.get('appName')];
            this.buildSpecificParametersForm(typeDef);

            var $zone = this.$specificConfig;

            _.each(this.model.get('parameters'), function (parameter) {
                if (parameter) {
                    $zone.find('[name="' + parameter.name + '"]').val(parameter.value);
                }
            });

        },

        updateParameters: function () {
            var parameters = [];
            _.each(this.$specificConfig.find('input,select'), function (input) {
                var name = $(input).attr('name');
                var value = $(input).val();
                parameters.push({
                    name: name,
                    value: value
                });
            });
            this.model.set('parameters', parameters);
        },

        onRemove: function () {
            this.trigger('item:removed');
            this.remove();
        },

        updateName: function (e) {
            this.model.set('name', e.target.value);
        },

        updateActive: function (e) {
            this.model.set('active', $(e.target).is(':checked'));
        }

    });

    return HookItemView;
});
