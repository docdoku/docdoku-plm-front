/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/hooks-manager.html',
    'views/hooks-item'
], function (Backbone, Mustache, template, HookItemView) {
    'use strict';

    var HookManagerView = Backbone.View.extend({

        events: {
            'click .add-hook': 'addNewHookItem'
        },

        initialize: function () {
            this.items = new Backbone.Collection();
            this.listenTo(this.items, 'add', this.addItem.bind(this));
            this.listenTo(this.items, 'remove', this.removeItem.bind(this));
        },

        render: function () {
            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n
            }));
            this.$itemList = this.$('.hooks-items');
            return this;
        },

        removeItem: function () {
        },

        addItem: function (model) {
            var _this = this;
            console.log('addItem');
            var view = new HookItemView({model: model}).render();
            this.$itemList.append(view.$el);
            this.listenTo(view, 'item:removed', function () {
                _this.items.remove(model);
            });
        },

        addNewHookItem: function () {
            this.items.add(new Backbone.Model());
        }

    });

    return HookManagerView;
});
