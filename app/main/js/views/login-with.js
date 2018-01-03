/*global App*/
define([
    'backbone',
    'mustache',
    'text!templates/login-with.html',
    'common-objects/views/alert',

    'common-objects/oidc',
    'jwt_decode'
], function (Backbone, Mustache, template, AlertView, oidc, jwtDecode) {
    'use strict';


    var LoginWithView = Backbone.View.extend({

        events: {
            'click .oidc-provider': 'connect'
        },

        render: function () {

            this.providers = App.config.providers;

            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n,
                providers: App.config.providers
            }));

            this.$notifications = this.$('.notifications');

            return this;
        },

        connect: function (e) {

            var _this = this;
            var providerId = e.target.getAttribute('data-id');

            var providers = this.providers.filter(function (provider) {
                return provider.id === parseInt(providerId, 10);
            });
            var provider;

            if (providers.length) {

                provider = providers[0];

                oidc.login(providers[0]).then(function onPopupCallback(user) {

                    var decodedToken = jwtDecode(user.id_token);

                    $.ajax({
                        type: 'POST',
                        url: App.config.apiEndPoint + '/auth/oauth',
                        data: JSON.stringify({
                            idToken: user.id_token,
                            nonce: decodedToken.nonce,
                            providerId: provider.id
                        }),
                        contentType: 'application/json'
                    }).then(function (body, status, xhr) {

                        var jwt = xhr.getResponseHeader('jwt');

                        if (jwt && jwt !== localStorage.jwt) {
                            localStorage.jwt = jwt;
                        }

                        window.location.href = App.config.contextPath + 'workspace-management/index.html';

                    }, function (res) {
                        _this.$notifications.append(new AlertView({
                            type: 'error',
                            message: res.statusText
                        }).render().$el);
                    });

                }).catch(function (err) {
                    _this.$notifications.append(new AlertView({
                        type: 'error',
                        message: err
                    }).render().$el);

                });
            }
        }

    });

    return LoginWithView;
});
