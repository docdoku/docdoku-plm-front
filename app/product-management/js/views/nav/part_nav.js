/*global define,App*/
define([
    'backbone',
    'mustache',
    'common-objects/common/singleton_decorator',
    'text!templates/nav/part_nav.html',
    'views/part/part_content',
    'common-objects/collections/part_collection',
    'common-objects/collections/part_search_collection'
], function (Backbone, Mustache, singletonDecorator, template, PartContentView, PartCollection, PartSearchCollection) {
	'use strict';
    var PartNavView = Backbone.View.extend({
        el: '#part-nav',

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(Mustache.render(template, {i18n: App.config.i18n, workspaceId: App.config.workspaceId}));
        },

        setActive: function () {
            if (App.$productManagementMenu) {
                App.$productManagementMenu.find('.active').removeClass('active');
            }
            this.$el.find('.nav-list-entry').first().addClass('active');
        },

        showContent: function (query) {
            this.setActive();
            this.cleanView();

            if(!this.partContentView){
                this.partContentView = new PartContentView();
            }

            var partsCollection;

            if (query) {
                partsCollection = new PartSearchCollection();
                partsCollection.setQuery(query);
            }else{
                partsCollection = new PartCollection();
            }

            this.partContentView.setCollection(partsCollection).render();

            App.$productManagementContent.html(this.partContentView.el);
        },

        cleanView: function () {
            if (this.partContentView) {
                this.partContentView.undelegateEvents();
                App.$productManagementContent.html('');
            }
        }
    });

    PartNavView = singletonDecorator(PartNavView);
    return PartNavView;
});
