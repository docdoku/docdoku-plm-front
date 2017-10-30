/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/admin-oauth-edit.html',
    'common-objects/views/alert',
    'common-objects/oidc'
], function (Backbone, Mustache, template, AlertView, oidc) {
    'use strict';

    var ProviderEditView = Backbone.View.extend({

        events: {
            'hidden #edit_provider_modal': 'onHidden',
            'shown #edit_provider_modal': 'onShown',
            'submit #edit_provider_form': 'onSubmitForm'
        },

        initialize: function () {
        },

        render: function (provider) {
            this.provider = provider;

            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n,
                provider: provider
            }));

            this.fillAlgorithmOptions();

            this.$modal = this.$('#edit_provider_modal');
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
            $select.val(this.provider.jwsAlgorithm);
        },


        openModal: function () {
            this.$modal.modal('show');
        },

        closeModal: function () {
            this.$modal.modal('hide');
            this.trigger('provider:updated');
        },

        onShown: function () {
            this.$modal.addClass('ready');
        },

        onHidden: function () {
            this.remove();
        },

        onSubmitForm: function (e) {
            $.ajax({
                method: 'PUT',
                url: App.config.apiEndPoint + '/admin/providers/' + this.provider.id,
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

    return ProviderEditView;
});
