/*global _,$,define,App*/
define([
        'backbone'
    ],
    function (Backbone) {
        'use strict';

        var Effectivity = Backbone.Model.extend({
            effectivityTypes: [{id: 'SERIALNUMBERBASEDEFFECTIVITY', name: 'EFFECTIVITY_SERIAL_NUMBER'},
                {id: 'DATEBASEDEFFECTIVITY', name: 'EFFECTIVITY_DATE'},
                {id: 'LOTBASEDEFFECTIVITY', name: 'EFFECTIVITY_LOT'}],

            getEffectivityTypeById: function (typeId) {
                return _.find(this.effectivityTypes, function (elt) {
                    return elt.id === typeId;
                });
            },

            getId: function () {
                return this.get('id');
            },

            getName: function () {
                return this.get('name');
            },

            getType: function () {
                return this.get('typeEffectivity');
            },

            getDescription: function () {
                return this.get('description');
            },

            getConfigurationItemKey: function () {
                return this.get('configurationItemKey');
            },

            getStartSerialNumber: function () {
                return this.get('startNumber');
            },

            getEndSerialNumber: function () {
                return this.get('endNumber');
            },

            getStartDate: function () {
                return this.get('startDate');
            },

            getEndDate: function () {
                return this.get('endDate');
            },

            getStartLotId: function () {
                return this.get('startLotId');
            },

            getEndLotId: function () {
                return this.get('endLotId');
            },

            getEffectivity: function (effectivityId) {
                return $.getJSON(App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/effectivities/' + effectivityId);
            },

            updateEffectivity: function (effectivityId, effectivity) {
                return $.ajax({
                    type: 'PUT',
                    url: App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/effectivities/' + effectivityId,
                    data: JSON.stringify(effectivity),
                    contentType: 'application/json; charset=utf-8'
                });
            }

        });

        return Effectivity;
    });
