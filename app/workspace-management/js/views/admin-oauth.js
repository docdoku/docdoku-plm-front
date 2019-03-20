/*global define,App,bootbox*/
define([
    'backbone',
    'mustache',
    'text!templates/admin-oauth.html',
    'text!templates/admin-oauth-provider.html',
    'views/admin-oauth-new',
    'views/admin-oauth-edit',
    'common-objects/views/alert'
], function (Backbone, Mustache, template, providerItemTemplate, ProviderCreationView, ProviderEditView, AlertView) {
    'use strict';

    var AdminOAuthView = Backbone.View.extend({

        events: {
            'click .new-provider': 'newProvider',
            'change #providers-table .items input[type="checkbox"].change': 'onSelection',
            'click .delete-selection': 'deleteSelectedItems',
            'click .provider-name': 'editProvider'
        },

        initialize: function () {
        },

        render: function () {
            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n
            }));
            this.$notifications = this.$('.notifications');
            this.refresh();
            return this;
        },

        refresh: function () {
            $.getJSON(App.config.apiEndPoint + '/admin/providers')
                .then(this.onProvidersFetched.bind(this));
        },

        onProvidersFetched: function (providers) {
            this.$('#providers-table tbody.items')
                .empty().append(providers.map(function (provider) {
                    return Mustache.render(providerItemTemplate, {
                        i18n: App.config.i18n,
                        provider: provider
                    });
                }));
        },

        onSelection: function () {
            var selected = this.$('#providers-table .items input[type="checkbox"].change:checked').length;
            if (!selected) {
                this.$('.delete-selection').addClass('hidden');
            } else {
                this.$('.delete-selection').removeClass('hidden');
            }
        },

        deleteSelectedItems: function () {
            var selected = this.$('#providers-table .items input[type="checkbox"].change:checked');
            var _this = this;

            bootbox.confirm(App.config.i18n.DELETE_PROVIDER_QUESTION,
                App.config.i18n.CANCEL,
                App.config.i18n.DELETE,
                function (result) {
                    if (result) {
                        selected.each(function (i, item) {
                            _this.deleteItem($(item).attr('data-id'));
                        });
                    }
                });
        },

        deleteItem: function (id) {
            var _this = this;
            $.ajax({
                method: 'DELETE',
                url: App.config.apiEndPoint + '/admin/providers/' + id
            }).then(function () {
                _this.$('tr[data-id="' + id + '"]').remove();
                _this.onSelection();
            }, function (err) {
                _this.$notifications.append(new AlertView({
                    type: 'error',
                    message: err.responseText
                }).render().$el);
            });
        },

        newProvider: function () {
            var view = new ProviderCreationView().render();
            window.document.body.appendChild(view.el);
            this.listenTo(view, 'provider:created', this.refresh.bind(this));
            view.openModal();
        },

        editProvider: function (e) {
            var _this = this;
            $.getJSON(App.config.apiEndPoint + '/admin/providers/' + e.target.getAttribute('data-id'))
                .then(function (provider) {
                    var view = new ProviderEditView().render(provider);
                    window.document.body.appendChild(view.el);
                    _this.listenTo(view, 'provider:updated', _this.refresh.bind(_this));
                    view.openModal();
                });
        }

    });

    return AdminOAuthView;
});
