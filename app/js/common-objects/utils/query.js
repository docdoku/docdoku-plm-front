/*global define*/
define([], function () {
	'use strict';
    var Query = {

        constructSearchQuery: function (data, attributes) {
            var queryString = '';
            Object.keys(data).forEach(function(key) {
                if(data[key]) {
                    queryString += '&' + key + '=' + encodeURIComponent(data[key]);
                }
            });
            if (attributes.length) {
                queryString += '&attributes=';
                var that = this;
                attributes.each(function (attribute) {
                    var type = attribute.get('type') || attribute.get('attributeType');
                    var name = attribute.get('name');
                    var value = attribute.get('value') || '';
                    value = type === 'BOOLEAN' ? (value ? 'true' : 'false') : value;
                    value = type === 'LOV' ? attribute.get('items')[value].name : value;
                    queryString += type + ':' + that.sanitize(name) + ':' + that.sanitize(value) + ';';
                });
                // remove last '+'
                queryString = queryString.substr(0, queryString.length - 1);
            }

            queryString += '&from=0&size=10000';
            return queryString;
        },

        sanitize : function(value) {
            value = value.replace('\\', '\\\\');
            value = value.replace(':', '\\:');
            return value.replace(';', '\\;');
        }
    };

    return Query;

});
