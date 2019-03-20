/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/admin-oauth-new.html',
    'common-objects/views/alert',
    'common-objects/oidc'
], function (Backbone, Mustache, template, AlertView, oidc) {
    'use strict';

    var ProviderCreationView = Backbone.View.extend({

        events: {
            'hidden #new_provider_modal': 'onHidden',
            'shown #new_provider_modal': 'onShown',
            'submit #new_provider_form': 'onSubmitForm'
        },

        initialize: function () {
        },

        render: function () {

            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n,
                defaultRedirectUri: window.location.origin + App.config.contextPath + 'callback.html'
            }));

            this.fillAlgorithmOptions();

            this.$modal = this.$('#new_provider_modal');
            this.$notifications = this.$('.notifications');

            return this;
        },

        fillAlgorithmOptions: function () {
            var $select = this.$('#provider-jwsAlgorithm');
            oidc.algorithms.forEach(function (algorithm) {
                $select.append($('<option/>', {
                    value: algorithm,
                    text: algorithm
                }));
            });
        },

        openModal: function () {
            this.$modal.modal('show');
        },

        closeModal: function () {
            this.$modal.modal('hide');
            this.trigger('provider:created');
        },

        onShown: function () {
            this.$modal.addClass('ready');
        },

        onHidden: function () {
            this.remove();
        },

        onSubmitForm: function (e) {
            $.ajax({
                method: 'POST',
                url: App.config.apiEndPoint + '/admin/providers/',
                data: JSON.stringify({
                    name: this.$('#provider-name').val().trim(),
                    enabled: this.$('#provider-enabled').is(':checked'),
                    authority: this.$('#provider-authority').val().trim(),
                    issuer: this.$('#provider-issuer').val().trim(),
                    clientID: this.$('#provider-clientID').val().trim(),
                    jwsAlgorithm: this.$('#provider-jwsAlgorithm').val().trim(),
                    jwkSetURL: this.$('#provider-jwkSetURL').val().trim(),
                    redirectUri: this.$('#provider-redirectUri').val().trim(),
                    secret: this.$('#provider-secret').val().trim(),
                    scope: this.$('#provider-scope').val().trim(),
                    responseType: this.$('#provider-responseType').val().trim(),
                    authorizationEndpoint: this.$('#provider-authorizationEndpoint').val().trim()
                }),
                contentType: 'application/json'
            })
                .then(this.closeModal.bind(this), this.onError.bind(this));

            e.preventDefault();
            e.stopPropagation();
            return false;
        },

        onError: function (error) {
            this.$notifications.append(new AlertView({
                type: 'error',
                message: error.responseText
            }).render().$el);
        }

    });

    return ProviderCreationView;
});
