/*global _,define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/product-instances/product_instances_creation.html',
    'common-objects/models/product_instance',
    'collections/configuration_items',
    'common-objects/collections/product_baselines',
    'common-objects/views/attributes/attributes',
    'common-objects/views/security/acl',
    'common-objects/views/alert'
], function (Backbone, Mustache, template, ProductInstanceModel, ConfigurationItemCollection, ProductBaselines, AttributesView, ACLView, AlertView) {
    'use strict';

    var ProductInstanceCreationView = Backbone.View.extend({

        model: new ProductInstanceModel(),

        events: {
            'click .modal-footer .btn-primary': 'interceptSubmit',
            'submit #product_instance_creation_form': 'onSubmitForm',
            'hidden #product_instance_creation_modal': 'onHidden',
            'change #baseline-type': 'onBaselineTypeChange'
        },

        initialize: function () {
            this._subViews = [];
            this.mode = 'BASELINE';
            _.bindAll(this);
            this.$el.on('remove', this.removeSubviews);
        },

        removeSubviews: function () {
            _(this._subViews).invoke('remove');
        },

        render: function () {
            this.$el.html(Mustache.render(template, {i18n: App.config.i18n}));
            this.bindDomElements();
            this.bindAttributesView();
            this.workspaceMembershipsView = new ACLView({
                el: this.$('#acl-mapping'),
                editMode: true
            }).render();
            this.$inputSerialNumber.customValidity(App.config.i18n.REQUIRED_FIELD);

            if (this.options.baseline) {
                this.$inputBaseline.append('<option value="' + this.options.baseline.getId() + '" >' + this.options.baseline.getName() + '</option>');
                this.$inputConfigurationItem.append('<option value="' + this.options.baseline.getConfigurationItemId() + '" >' + this.options.baseline.getConfigurationItemId() + '</option>');
            } else {
                new ConfigurationItemCollection().fetch({success: this.fillConfigurationItemList});
            }

            this.onBaselineTypeChange();

            return this;
        },

        fillConfigurationItemList: function (list) {
            var self = this;
            list.each(function (product) {
                self.$inputConfigurationItem.append('<option value="' + product.getId() + '" >' + product.getId() + '</option>');
            });
            self.fillBaselineList();
            this.$inputConfigurationItem.change(function () {
                self.fillBaselineList();
            });
        },
        fillBaselineList: function () {
            var self = this;
            this.$inputBaseline.empty();
            this.$inputBaseline.attr('disabled', 'disabled');
            new ProductBaselines({}, {productId: self.$inputConfigurationItem.val()}).fetch({
                success: function (list) {
                    list.each(function (baseline) {
                        self.$inputBaseline.append('<option value="' + baseline.getId() + '" >' + baseline.getName() + '</option>');
                    });
                    self.$inputBaseline.removeAttr('disabled');
                }
            });
        },

        bindDomElements: function () {
            this.$notifications = this.$el.find('.notifications').first();
            this.$modal = this.$('#product_instance_creation_modal');
            this.$inputSerialNumber = this.$('#inputSerialNumber');
            this.$inputConfigurationItem = this.$('#inputConfigurationItem');
            this.$inputBaseline = this.$('#inputBaseline');
            this.$baselineType = this.$('#baseline-type');
            this.$effectiveDate = this.$('#effectiveDate');
            this.$effectiveSerialNumber = this.$('#effectiveSerialNumber');
            this.$effectiveLotId = this.$('#effectiveLotId');
        },
        bindAttributesView: function () {
            this.attributesView = new AttributesView({
                el: this.$('#tab-products-instances-attributes')
            }).render();
        },

        interceptSubmit: function () {
            this.isValid = !this.$('.tabs').invalidFormTabSwitcher();
        },

        onSubmitForm: function (e) {

            var data = {
                serialNumber: this.$inputSerialNumber.val(),
                configurationItemId: this.$inputConfigurationItem.val(),
                instanceAttributes: this.attributesView.collection.toJSON(),
                acl: this.workspaceMembershipsView.toList()
            };

            if (this.mode === 'BASELINE') {
                data.baselineId = this.$inputBaseline.val();
                if (data.serialNumber && data.configurationItemId && data.baselineId) {
                    this.model.createInstance(data, {
                        success: this.onProductInstanceCreated.bind(this),
                        error: this.onError.bind(this)
                    });
                }
            }
            else if (this.mode === 'EFFECTIVITY_DATE') {
                data.effectiveDate = this.$effectiveDate.val();
            }
            else if (this.mode === 'EFFECTIVITY_SERIAL_NUMBER') {
                data.effectiveSerialNumber = this.$effectiveSerialNumber.val();
            }
            else if (this.mode === 'EFFECTIVITY_LOT_ID') {
                data.effectiveLotId = this.$effectiveLotId.val();
            }
            else {
                // show an error ?
            }

            console.log(data);

            e.preventDefault();
            e.stopPropagation();
            return false;
        },

        onBaselineTypeChange: function () {
            this.mode = this.$baselineType.val();
            this.$('[show-mode]').hide();
            this.$('[show-mode=' + this.mode + ']').show();
        },

        onProductInstanceCreated: function () {
            this.trigger('info', App.config.i18n.PRODUCT_INSTANCE_CREATED);

            if (this.collection) {
                this.collection.fetch();
            }
            this.closeModal();
        },

        onError: function (xhr) {
            this.$notifications.append(new AlertView({
                type: 'error',
                message: xhr.responseText
            }).render().$el);
        },

        openModal: function () {
            this.$modal.modal('show');
        },

        closeModal: function () {
            this.$modal.modal('hide');
        },

        onHidden: function () {
            this.remove();
        }
    });

    return ProductInstanceCreationView;
});
