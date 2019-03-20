/*global $,define,App*/
define(['backbone'], function (Backbone) {
    'use strict';
    var TimeZone = Backbone.Model.extend({
        initialize: function () {
            this.className = 'TimeZone';
        }
    });

    TimeZone.getTimeZones = function () {
        return $.getJSON(App.config.apiEndPoint + '/timezones');
    };

    return TimeZone;
});
