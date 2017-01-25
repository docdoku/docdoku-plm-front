/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!common-objects/templates/part/conversion_status.html'
], function (Backbone, Mustache, template) {
    'use strict';
    var ConversionStatusView = Backbone.View.extend({

        className: 'conversion-status',

        events: {
            'click .reload': 'render',
            'click .launch': 'retryConversion',
            'remove': 'clearTimer'
        },

        TIMER_DELAY: 2000,

        clearTimer: function () {
            if (this._timeout) {
                clearTimeout(this._timeout);
            }
        },

        launchTimer: function () {
            this.clearTimer();
            this._timeout = setTimeout(this.fetch.bind(this), this.TIMER_DELAY);
        },

        onStatusFetched: function (status) {
            this.renderStatus(status);
            if (!status || status && status.pending) {
                this.launchTimer();
            }
        },

        renderStatus: function (status) {
            this.$el.html(Mustache.render(template, {
                status: status,
                hasCadFile: this.model.get('nativeCADFile'),
                i18n: App.config.i18n
            }));
        },

        render: function () {
            this.renderStatus({pending: true});
            this.fetch();
            return this;
        },

        fetch: function () {
            this.model.getConversionStatus()
                .success(this.onStatusFetched.bind(this))
                .error(this.onStatusFetched.bind(this));
        },

        retryConversion: function () {
            this.renderStatus({pending: true});
            this.model.launchConversion()
                .success(this.fetch.bind(this))
                .error(this.fetch.bind(this));
        }

    });

    return ConversionStatusView;
});
