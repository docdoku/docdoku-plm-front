/*global App*/
define([
    'backbone',
    'mustache',
    'text!templates/login-form.html',
    'common-objects/views/alert',
    'urlUtils'
], function (Backbone, Mustache, template, AlertView, UrlUtils) {
    'use strict';

    var LoginFormView = Backbone.View.extend({

        tagName: 'form',
        id: 'login_form',
        events: {
            'submit': 'onLoginFormSubmit'
        },

        render: function () {
            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n,
                contextPath: App.config.contextPath,
                providers: App.config.providers
            }));
            this.$notifications = this.$('.notifications');
            this.$loginButton = this.$('#login_form-login_button');
            this.showMessageAtStart();
            return this;
        },

        showMessageAtStart: function () {
            var logout = UrlUtils.getParameterByName('logout');
            if (logout) {
                this.$notifications.append(new AlertView({
                    type: 'info',
                    message: App.config.i18n.DISCONNECTED
                }).render().$el);
            }
            var denied = UrlUtils.getParameterByName('denied');
            if (denied) {
                this.$notifications.append(new AlertView({
                    type: 'error',
                    message: App.config.i18n.FORBIDDEN_MESSAGE
                }).render().$el);
            }
        },

        onLoginFormSubmit: function (e) {
            delete localStorage.jwt;
            this.$notifications.empty();
            this.disableLoginButton();
            $.ajax({
                type: 'POST',
                url: App.config.apiEndPoint + '/auth/login',
                data: JSON.stringify({
                    login: this.$('#login_form-login').val(),
                    password: this.$('#login_form-password').val()
                }),
                contentType: 'application/json; charset=utf-8'
            }).then(function (account) {
                window.localStorage.locale = account && account.language ? account.language : null;
                var originURL = UrlUtils.getParameterByName('originURL');
                window.location.href = originURL ? decodeURIComponent(originURL) : App.config.contextPath + 'workspace-management/index.html';
            }, this.onLoginFailed.bind(this));
            e.preventDefault();
            return false;
        },

        disableLoginButton: function () {
            this.$loginButton.attr('value', App.config.i18n.CONNECTING);
            this.$loginButton.prop('disabled', true);
        },

        enableLoginButton: function () {
            this.$loginButton.attr('value', App.config.i18n.CONNECTION);
            this.$loginButton.prop('disabled', false);
        },

        onLoginFailed: function () {
            this.enableLoginButton();
            this.$notifications.append(new AlertView({
                type: 'error',
                message: App.config.i18n.FAILED_LOGIN
            }).render().$el);
        }
    });

    return LoginFormView;
});
