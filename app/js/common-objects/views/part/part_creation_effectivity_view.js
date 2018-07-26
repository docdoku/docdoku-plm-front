/*global _,$,define,App*/
define([
    'backbone',
    'mustache',
    'common-objects/utils/date',
    'text!common-objects/templates/part/part_creation_effectivity_view.html',
    'text!common-objects/templates/part/part_effectivity_serial_number.html',
    'text!common-objects/templates/part/part_effectivity_date.html',
    'text!common-objects/templates/part/part_effectivity_lot.html',
    'common-objects/models/part',
    'common-objects/models/effectivity',
    'common-objects/views/alert'
], function (Backbone, Mustache, date, template, effectivitySerialNumber, effectivityDate, effectivityLot, Part, Effectivity, AlertView) {
    'use strict';
    var PartCreationView = Backbone.View.extend({

        events: {
            'submit #part_creation_effectivity_form': 'onSubmitForm',
            'change #inputEffectivityType': 'onTypeEffectivityChange'
        },

        initialize: function () {
            this.Effectivity = new Effectivity();
            this.selectedPart = this.options.selectedPart;
            this.effectivityTypes = this.Effectivity.effectivityTypes;
            _.bindAll(this);
        },

        render: function () {
            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n,
                isNewEffectivity: true
            }));
            this.bindDomElements();

            this.setTypeEffectivityOptions();
            this.showTypeEffectivityFields();

            return this;
        },

        bindDomElements: function () {
            this.$notifications = this.$el.find('.notifications').first();
            this.$inputEffectivityType = this.$('#inputEffectivityType');
            this.$inputEffectivityName = this.$('#inputEffectivityName');
            this.$inputEffectivityDescription = this.$('#inputEffectivityDescription');
            this.$specificFields = this.$('#specificFields');
        },

        bindDomFieldElements: function () {
            this.$inputProductId = this.$('#inputProductId');
            this.bindTypeahead();
            this.$inputStart = this.$('#inputStart');
            this.$inputEnd = this.$('#inputEnd');
        },

        bindTypeahead: function () {
            var self = this;
            var map = {};
            this.$inputProductId.typeahead({
                source: function (query, process) {
                    var partNumbers = [];

                    $.getJSON(App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/products/numbers?q=' + query, function (data) {
                        _(data).each(function (d) {
                            partNumbers.push(d.id);
                            map[d.id] = d.id;
                        });
                        process(partNumbers);
                    });
                },
                updater: function (item) {
                    self.$inputProductId.val(map[item].id);
                    return item;
                }
            });
        },

        onTypeEffectivityChange: function () {
            this.showTypeEffectivityFields();
        },

        showTypeEffectivityFields: function () {
            var currentType = this.$inputEffectivityType.val();
            var fields = null;
            switch (currentType) {
                case this.Effectivity.getEffectivityTypeById('SERIALNUMBERBASEDEFFECTIVITY').id:
                    fields = effectivitySerialNumber;
                    break;
                case this.Effectivity.getEffectivityTypeById('DATEBASEDEFFECTIVITY').id:
                    fields = effectivityDate;
                    break;
                case this.Effectivity.getEffectivityTypeById('LOTBASEDEFFECTIVITY').id:
                    fields = effectivityLot;
                    break;
            }
            this.$specificFields.html(Mustache.render(fields, {i18n: App.config.i18n}));
            this.bindDomFieldElements();
            this.setConfigurationRequiredState();
        },

        setConfigurationRequiredState: function () {
            var notRequiredTypes = ['DATEBASEDEFFECTIVITY'];
            var isRequired = notRequiredTypes.indexOf(this.$inputEffectivityType.val()) === -1;
            this.$inputProductId.attr('required', isRequired);
        },

        setTypeEffectivityOptions: function () {
            var self = this;
            _.each(this.effectivityTypes, function (effectivity) {
                self.$inputEffectivityType.append('<option value="' + effectivity.id + '">' + App.config.i18n[effectivity.name] + '</option>');
            });
        },

        onSubmitForm: function (e) {
            this.$notifications.empty();

            this.effectivity = {
                name: this.$inputEffectivityName.val(),
                description: this.$inputEffectivityDescription.val(),
                typeEffectivity: this.$inputEffectivityType.val()
            };

            var currentType = this.$inputEffectivityType.val();
            var start, end;

            switch (currentType) {
                case this.Effectivity.getEffectivityTypeById('SERIALNUMBERBASEDEFFECTIVITY').id:
                    start = 'startNumber';
                    end = 'endNumber';
                    break;
                case this.Effectivity.getEffectivityTypeById('DATEBASEDEFFECTIVITY').id:
                    start = 'startDate';
                    end = 'endDate';
                    break;
                case this.Effectivity.getEffectivityTypeById('LOTBASEDEFFECTIVITY').id:
                    start = 'startLotId';
                    end = 'endLotId';
                    break;
            }

            this.effectivity.configurationItemKey = {
                id: this.$inputProductId.val(),
                workspace: App.config.workspaceId
            };

            if (currentType !== this.Effectivity.getEffectivityTypeById('DATEBASEDEFFECTIVITY').id) {
                this.effectivity[start] = this.$inputStart.val();
                this.effectivity[end] = this.$inputEnd.val();
            } else {
                this.effectivity[start] = date.getDateFromDateInput(this.$inputStart.val());
                this.effectivity[end] = date.getDateFromDateInput(this.$inputEnd.val());
            }

            this.Part = new Part({
                partKey: this.selectedPart.getPartKey()
            });

            this.createEffectivity();

            e.preventDefault();
            e.stopPropagation();
            return false;
        },

        createEffectivity: function () {
            var self = this;
            this.Part.createEffectivity(this.effectivity).then(function () {
                self.$notifications.append(new AlertView({
                    type: 'success',
                    message: App.config.i18n.CREATE_NEW_EFFECTIVITY_SUCCESS
                }).render().$el);
                self.$('#part_creation_effectivity_form')[0].reset();
            }, function (error) {
                self.$notifications.append(new AlertView({
                    type: 'error',
                    message: error ? error.responseText : App.config.CREATE_NEW_EFFECTIVITY_ERROR
                }).render().$el);
            });
        },

        onError: function (model, error) {
            var errorMessage = error ? error.responseText : model;

            this.$notifications.append(new AlertView({
                type: 'error',
                message: errorMessage
            }).render().$el);
        },

        openModal: function () {
            this.$el.one('shown', this.render.bind(this));
            this.$el.one('hidden', this.onHidden.bind(this));
            this.$el.modal('show');
        },

        closeModal: function () {
            this.$el.modal('hide');
        },

        onHidden: function () {
            this.remove();
        }

    });

    return PartCreationView;

});
