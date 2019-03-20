/*global _,define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/search_part_advanced_form.html',
    'common-objects/collections/users',
    'common-objects/views/attributes/attribute_list',
    'collections/part_templates',
    'common-objects/utils/date',
    'common-objects/utils/query',
    'common-objects/collections/lovs'
], function (Backbone, Mustache, template, Users, PartAttributeListView, Templates, date, query, LOVCollection) {
    'use strict';
    var AdvancedSearchView = Backbone.View.extend({

        events: {
            'hidden #advanced_search_modal': 'onHidden',
            'submit #advanced_search_form': 'onSubmitForm',
            'click #search-add-attributes': 'addAttribute',
            'change #template-attributes-helper': 'changeAttributes'
        },

        lovs : new LOVCollection(),

        initialize: function () {
            _.bindAll(this);

        },

        render: function () {
            this.$el.html(Mustache.render(template, {i18n: App.config.i18n,timeZone:App.config.timeZone}));
            this.bindDomElements();
            this.fillInputs();
            this.initAttributesView();
            return this;
        },

        initAttributesView: function () {

            this.attributes = new Backbone.Collection();

            var that = this;
            this.lovs.fetch().success(function(){
                that.attributesView = new PartAttributeListView({
                    collection: that.attributes,
                    lovs : that.lovs,
                    displayOnly: true
                });

                that.$('#attributes-list').html(that.attributesView.$el);
            });



        },

        fillInputs: function () {

            var that = this;

            this.users = new Users();
            this.users.fetch({reset: true, success: function () {
                that.users.each(function (user) {
                    that.$author.append('<option value="' + user.get('login') + '">' + user.get('name') + '</option>');
                });
            }});

            this.templates = new Templates();
            this.types = [];
            this.templatesId = [];
            this.templates.fetch({reset: true, success: function () {
                that.templates.each(function (template) {
                    var type = template.get('partType');
                    if (!_.contains(that.types, type) && type) {
                        that.types.push(type);
                        that.$type.append('<option value="' + type + '">' + type + '</option>');
                    }
                    var templateId = template.get('id');
                    if (!_.contains(that.templatesId, templateId) && templateId) {
                        that.templatesId.push(type);
                        that.$templatesId.append('<option value="' + templateId + '">' + templateId + '</option>');
                    }
                });
            }});

        },

        addAttribute: function () {
            this.attributes.add({
                name: '',
                type: 'TEXT',
                value: ''
            });
        },

        openModal: function () {
            this.$modal.modal('show');
        },

        closeModal: function () {
            this.$modal.modal('hide');
        },

        onHidden: function () {
            this.remove();
        },

        onSubmitForm: function () {
            var queryString = this.constructQueryString();
            if (queryString) {
                App.router.navigate(encodeURIComponent(App.config.workspaceId) + '/parts-search/' + encodeURIComponent(queryString), {trigger: true});
                this.closeModal();
            }
            return false;
        },

        bindDomElements: function () {
            this.$modal = this.$('#advanced_search_modal');
            this.$number = this.$('#search-number');
            this.$name = this.$('#search-name');
            this.$type = this.$('#search-type');
            this.$version = this.$('#search-version');
            this.$author = this.$('#search-author');
            this.$tags = this.$('#search-tags');
            this.$createdFrom = this.$('#search-creation-from');
            this.$createdTo = this.$('#search-creation-to');
            this.$modifiedFrom = this.$('#search-modification-from');
            this.$modifiedTo = this.$('#search-modification-to');
            this.$templatesId = this.$('#template-attributes-helper');
            this.$standardPart = this.$('input[name=search-standardPart]');
            this.$content = this.$('#search-content');
        },

        changeAttributes: function (e) {
            if (e.target.value) {
                var search = _.where(this.templates.models, {id: e.target.value});
                if (search[0]) {
                    this.attributes.reset(search[0].get('attributeTemplates'));
                }
            } else {
                this.attributes.reset();
            }
        },

        constructQueryString: function () {

            var data = {
                number: this.$number.val(),
                name: this.$name.val(),
                type: this.$type.val(),
                version: this.$version.val(),
                author: this.$author.val(),
                tags: this.$tags.val().replace(/ /g, ''),
                content: this.$content.val(),
                createdFrom: this.$createdFrom.val() ? date.getISODate(this.$createdFrom.val()) : null,
                createdTo: this.$createdTo.val() ? date.getISODate(this.$createdTo.val()) : null,
                modifiedFrom: this.$modifiedFrom.val() ? date.getISODate(this.$modifiedFrom.val()) : null,
                modifiedTo: this.$modifiedTo.val() ? date.getISODate(this.$modifiedTo.val()) : null,
                standardPart: this.$standardPart.filter(':checked').val() === 'all' ? null : this.$standardPart.filter(':checked').val()
            };
            return query.constructSearchQuery(data, this.attributes);
        }

    });

    return AdvancedSearchView;

});
