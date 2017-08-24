/*global _,$,define,App*/
define([
    'backbone',
    'mustache',
    'text!common-objects/templates/error.html'
], function (Backbone, Mustache, template) {
    'use strict';
    var ErrorView = Backbone.View.extend({

        events: {
            'click .disconnect': 'disconnect',
            'click .back': 'back',
            'click .reload': 'reload',
            'click .navigate': 'navigate'
        },

        initialize: function () {
            _.bindAll(this);
        },

        renderError: function (xhr) {

            if (xhr.status === 502 || xhr.status === 503 || xhr.status === 0) {
                return this.render({
                    title: App.config.i18n.SORRY,
                    content: App.config.i18n.SERVER_NOT_AVAILABLE,
                    xhr: xhr,
                    showReloadButton: true,
                    showBackButton: true,
                });
            }

            if (xhr.status === 404) {
                return this.render({
                    title: App.config.i18n.SORRY,
                    content: App.config.i18n.NOTHING_HERE,
                    showReloadButton: true,
                    showBackButton: true,
                    workspaces: App.config.workspaces.allWorkspaces,
                    xhr: xhr
                });
            }

            if (xhr.status === 403) {
                return this.render({
                    title: App.config.i18n.SORRY,
                    content: App.config.i18n.FORBIDDEN_MESSAGE,
                    showReloadButton: true,
                    showBackButton: true,
                    showDisconnectButton: true,
                    xhr: xhr
                });
            }

            return this.render({
                title: App.config.i18n.SORRY,
                content: App.config.i18n.UNEXPECTED_ERROR,
                showReloadButton: true,
                showBackButton: true,
                xhr: xhr
            });

        },

        renderWorkspaceSelection: function (resolver) {
            var self = this;
            resolver.then(function (workspaces) {
                self.render({
                    title: App.config.i18n.SORRY,
                    content: App.config.i18n.NOTHING_HERE,
                    showBackButton: true,
                    workspaces: workspaces.allWorkspaces
                });
            });
        },

        render: function (opts) {
            opts.i18n = App.config.i18n;
            this.$el.html(Mustache.render(template, opts));
            this.$el.addClass('error-page');
            return this;
        },

        navigate: function (e) {
            window.location.href = e.target.href;
            window.location.reload();
            return false;
        },

        back: function () {
            window.history.back();
            setTimeout(location.reload.bind(location),50);
        },

        disconnect: function () {
            delete localStorage.jwt;
            $.get(App.config.apiEndPoint + '/auth/logout').complete(function () {
                location.reload();
            });
        },

        reload: function () {
            location.reload();
        }

    });

    return ErrorView;
});
