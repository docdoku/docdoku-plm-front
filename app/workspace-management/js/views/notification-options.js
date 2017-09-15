/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/notification-options.html',
    'views/hooks-manager',
    'common-objects/views/alert'
], function (Backbone, Mustache, template, HooksManagerView, AlertView) {
    'use strict';

    var NotificationOptionsView = Backbone.View.extend({

        events: {
            'hidden #notification_options_modal': 'onHidden',
            'shown #notification_options_modal': 'onShown',
            'submit #notification_options_modal': 'onSubmitForm',
            'change #send-emails': 'onSendEmailsChange'
        },

        initialize: function () {
        },

        render: function () {

            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n
            }));

            this.$modal = this.$('#notification_options_modal');
            this.$notifications = this.$('.notifications');
            this.$hooksContainer = this.$('.hooks-container');
            this.hooksManagerView = new HooksManagerView({el: this.$hooksContainer}).render();

            $.getJSON(App.config.apiEndPoint + '/workspaces/' + encodeURIComponent(App.config.workspaceId) + '/back-options')
                .then(this.onOptionsFetched.bind(this));

            return this;
        },


        onOptionsFetched: function (options) {
            this.notificationOptions = options;
            this.$('#send-emails').attr('checked', options.sendEmails);
        },

        openModal: function () {
            this.$modal.modal('show');
        },

        closeModal: function () {
            this.$modal.modal('hide');
        },

        onShown: function () {
            this.$modal.addClass('ready');
        },

        onHidden: function () {
            this.remove();
        },

        onSendEmailsChange: function () {
            this.notificationOptions.sendEmails = this.$('#send-emails').is(':checked');
        },

        onSubmitForm: function (e) {
            var promises = [$.ajax({
                method: 'PUT',
                url: App.config.apiEndPoint + '/workspaces/' + encodeURIComponent(App.config.workspaceId) + '/back-options',
                data: JSON.stringify(this.notificationOptions),
                contentType: 'application/json'
            })].concat(this.hooksManagerView.saveHooks());

            $.when.apply(undefined, promises).then(this.closeModal.bind(this), this.onError.bind(this));

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

    return NotificationOptionsView;
});
