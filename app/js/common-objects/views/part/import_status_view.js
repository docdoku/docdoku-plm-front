/*global define,App*/
define([
    'backbone',
    'mustache',
    'text!common-objects/templates/part/import_status.html',
    'common-objects/utils/date'
], function (Backbone, Mustache, template, date) {
    'use strict';
    var ImportStatusView = Backbone.View.extend({
        className: 'import-status',

        initialize: function () {
            _.bindAll(this);
            this.$el.on('remove', this.stopRefresh);
            this.timeout = null;
        },

        render: function () {

            var displayedDate = date.formatTimestamp(
                App.config.i18n._DATE_FORMAT,
                this.model.startDate
            );

            this.$el.html(Mustache.render(template, {
                status: this.model,
                displayedDate: displayedDate,
                i18n: App.config.i18n
            }));

            if (this.model.pending) {
                this.timeout = setTimeout(this.refresh.bind(this), 1000);
            }

            date.dateHelper(this.$('.start-date>a'));

            return this;
        },

        deleteImport: function () {
            var url = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/parts/import/' + this.model.id;
            $.ajax({
                url: url,
                method: 'DELETE',
                success: this.remove.bind(this)
            });
        },

        refresh: function () {
            var url = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/parts/import/' + this.model.id;
            var _this = this;
            $.get(url).then(function (pImport) {
                _this.model = pImport;
                _this.render();
            });
        },

        stopRefresh: function () {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
        }

    });
    return ImportStatusView;
});
