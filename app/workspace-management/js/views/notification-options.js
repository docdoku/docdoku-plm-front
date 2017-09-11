/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/notification-options.html',
    'views/hooks-manager'
], function (Backbone, Mustache, template, HooksManagerView) {
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
            this.$hooksContainer = this.$('.hooks-container');
            this.hooksManagerView = new HooksManagerView({el: this.$hooksContainer}).render();

            $.getJSON(App.config.apiEndPoint + '/workspaces/' + encodeURIComponent(App.config.workspaceId) + '/notification-options')
                .then(this.onOptionsFetched.bind(this));

            return this;
        },


        onOptionsFetched: function (options) {
            this.notificationOptions = options;
            if (options.sendEmails) {
                this.$('#send-emails').attr('checked', 'true');
            }
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

            var _this = this;

            $.ajax({
                method: 'PUT',
                url: App.config.apiEndPoint + '/workspaces/' + encodeURIComponent(App.config.workspaceId) + '/notification-options',
                data: JSON.stringify(this.notificationOptions),
                contentType: 'application/json',
                success: function () {
                    _this.closeModal();
                },
                error: function () {
                    console.log('error');
                }
            });

            e.preventDefault();
            e.stopPropagation();
            return false;
        }


    });

    return NotificationOptionsView;
});
