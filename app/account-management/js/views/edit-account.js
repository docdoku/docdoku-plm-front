/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/edit-account.html',
    'text!templates/edit-account-auth.html',
    'common-objects/models/timezone',
    'common-objects/models/language',
    'common-objects/models/user',
    'common-objects/views/alert',
    'common-objects/oidc',
    'jwt_decode'
], function (Backbone, Mustache, template, authTemplate, TimeZone, Language, User, AlertView, oidc, jwtDecode) {
    'use strict';

    var EditAccountView = Backbone.View.extend({
        events: {
            'click .toggle-password-update': 'togglePasswordUpdate',
            'submit #account_edition_form': 'onSubmitForm',
            'click .logout': 'logout',
            'click #login-with-provider': 'authWithProvider',
            'click #validate-password': 'authWithPassword'
        },


        renderAuthView: function () {

            // if token is not older than 2 minutes, render edit form without auth ?

            // 1 check if account is provided.
            if (App.config.account.providerId) {
                // 2 provided => login with button
                $.getJSON(App.config.apiEndPoint + '/auth/providers/' + App.config.account.providerId)
                    .then(this.renderProviderForm.bind(this));
            } else {
                // 3 not provided => prompt password
                this.renderPasswordForm();
            }

            return this;
        },

        renderProviderForm: function (provider) {
            this.provider = provider;
            this.$el.html(Mustache.render(authTemplate, {
                i18n: App.config.i18n,
                provider: this.provider
            }));
            this.$notifications = this.$('.notifications');
        },

        renderPasswordForm: function () {
            this.provider = null;
            this.$el.html(Mustache.render(authTemplate, {
                i18n: App.config.i18n,
                provider: null
            }));
            this.$notifications = this.$('.notifications');
        },

        authWithProvider: function () {

            var provider = this.provider;
            var _this = this;

            oidc.login(provider).then(function onPopupCallback(user) {

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
                }).then(_this.onAuthSuccess.bind(_this), _this.onAuthFail.bind(_this));

            }).catch(this.onAuthFail.bind(this));
        },

        authWithPassword: function () {
            this.password = this.$('#password').val();
            $.ajax({
                type: 'POST',
                url: App.config.apiEndPoint + '/auth/login',
                data: JSON.stringify({
                    login: App.config.account.login,
                    password: this.password
                }),
                contentType: 'application/json; charset=utf-8'
            }).then(this.onAuthSuccess.bind(this), this.onAuthFail.bind(this));
        },

        onAuthSuccess: function () {
            this.render();
        },

        onAuthFail: function () {
            this.$notifications.append(new AlertView({
                type: 'error',
                message: App.config.i18n.AUTHENTICATION_FAILED
            }).render().$el);
        },

        render: function () {

            this.enablePasswordUpdate = false;
            var _this = this;

            TimeZone.getTimeZones()
                .then(function (timeZones) {
                    _this.timeZones = timeZones;
                })
                .then(Language.getLanguages)
                .then(function (languages) {
                    _this.languages = languages;
                })
                .then(function () {

                    _this.$el.html(Mustache.render(template, {
                        i18n: App.config.i18n,
                        account: App.config.account,
                        timeZones: _this.timeZones,
                        languages: _this.languages,
                        provider: _this.provider
                    }));
                    _this.$notifications = _this.$('.notifications');
                    _this.$('#account-language option').each(function () {
                        $(this).attr('selected', $(this).val() === App.config.account.language);
                        $(this).text(App.config.i18n.LANGUAGES[$(this).val()]);
                    });
                    _this.$('#account-timezone option').each(function () {
                        $(this).attr('selected', $(this).val() === App.config.account.timeZone);
                    });

                });

            return this;
        },

        onSubmitForm: function (e) {

            var account = {
                name: this.$('#account-name').val().trim(),
                email: this.$('#account-email').val().trim(),
                language: this.$('#account-language').val(),
                timeZone: this.$('#account-timezone').val(),
            };

            if (this.password) {
                account.password = this.password;

            }

            if (this.enablePasswordUpdate) {
                var newPassword = this.$('#account-password').val().trim();
                var confirmedPassword = this.$('#account-confirm-password').val().trim();
                if (newPassword === confirmedPassword) {
                    account.newPassword = newPassword;
                    this.newPassword = newPassword;
                } else {
                    this.$notifications.append(new AlertView({
                        type: 'error',
                        message: App.config.i18n.PASSWORD_NOT_CONFIRMED
                    }).render().$el);
                    e.preventDefault();
                    return false;
                }
            }

            User.updateAccount(account)
                .then(this.onUpdateSuccess.bind(this), this.onError.bind(this));

            e.preventDefault();
            return false;
        },

        onError: function (error) {
            this.$notifications.append(new AlertView({
                type: 'error',
                message: error.responseText
            }).render().$el);
        },

        onUpdateSuccess: function (account) {
            var needReload = window.localStorage.locale !== account.language;
            if (window.localStorage.locale !== account.language) {
                window.localStorage.locale = 'unset';
            }

            if (this.newPassword) {
                this.password = this.newPassword;
            }

            this.$notifications.append(new AlertView({
                type: 'success',
                title: App.config.i18n.ACCOUNT_UPDATED,
                message: needReload ? App.config.i18n.NEED_PAGE_RELOAD_CHANGED_LANG : ''
            }).render().$el);
        },

        togglePasswordUpdate: function () {
            this.enablePasswordUpdate = !this.enablePasswordUpdate;
            this.$('.password-update').toggle(this.enablePasswordUpdate);
            this.$('#account-password').attr('required', this.enablePasswordUpdate);
            this.$('#account-confirm-password').attr('required', this.enablePasswordUpdate);
        },

        logout: function () {
            delete localStorage.jwt;
            $.get(App.config.apiEndPoint + '/auth/logout').complete(function () {
                window.location.href = App.config.contextPath + 'index.html?logout=true';
            });
        }
    });

    return EditAccountView;
});
