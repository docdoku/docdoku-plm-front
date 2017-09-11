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
            'submit #notification_options_modal': 'onSubmitForm'
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
            return this;
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

        onSubmitForm:function(e){
            // Save
            e.preventDefault();
            e.stopPropagation();
            return false;
        }


    });

    return NotificationOptionsView;
});
