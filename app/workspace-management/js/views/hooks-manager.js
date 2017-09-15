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

            this.toDelete = [];
            var _this = this;
            $.getJSON(App.config.apiEndPoint + '/workspaces/' + encodeURIComponent(App.config.workspaceId) + '/webhooks').then(function (hooks) {
                _.each(hooks, function (hook) {
                    _this.items.add(new Backbone.Model(hook));
                });
            });
        },

        render: function () {
            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n
            }));
            this.$itemList = this.$('.hooks-items');
            return this;
        },

        removeItem: function (item) {
            this.toDelete.push(item);
        },

        addItem: function (model) {
            var _this = this;
            var view = new HookItemView({model: model}).render();
            this.$itemList.append(view.$el);
            this.listenTo(view, 'item:removed', function () {
                _this.items.remove(model);
            });
        },

        addNewHookItem: function () {
            this.items.add(new Backbone.Model({
                name: 'New hook',
                appName: 'SIMPLEWEBHOOK',
                active: true,
                parameters: {
                    method: 'POST',
                    url: 'http://',
                    authorization: null
                }
            }));
        },

        saveHooks: function () {

            var saveItem = function (item) {
                if (item.attributes.id) {
                    return $.ajax({
                        method: 'PUT',
                        data: JSON.stringify(item.attributes),
                        contentType: 'application/json',
                        url: App.config.apiEndPoint + '/workspaces/' + encodeURIComponent(App.config.workspaceId) + '/webhooks/' + item.attributes.id
                    });
                } else {
                    return $.ajax({
                        method: 'POST',
                        data: JSON.stringify(item.attributes),
                        contentType: 'application/json',
                        url: App.config.apiEndPoint + '/workspaces/' + encodeURIComponent(App.config.workspaceId) + '/webhooks/'
                    });
                }

            };

            var deleteItem = function (item) {
                return $.ajax({
                    method: 'DELETE',
                    url: App.config.apiEndPoint + '/workspaces/' + encodeURIComponent(App.config.workspaceId) + '/webhooks/' + item.attributes.id
                });
            };


            var allPromises = [];
            this.items.forEach(function (item) {
                allPromises.push(saveItem(item));
            });

            _.each(this.toDelete, function (item) {
                if (item.attributes.id) {
                    return deleteItem(item);
                }
            });

            return allPromises;

        }

    });

    return HookManagerView;
});
