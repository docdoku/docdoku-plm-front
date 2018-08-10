/*global define,App*/
define(['backbone', 'models/configuration_item' ],
function (Backbone, ConfigurationItem) {
	'use strict';
    var ConfigurationItemCollection = Backbone.Collection.extend({
        url: function () {
            return App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/products';
        },
        model: ConfigurationItem
    });

    return ConfigurationItemCollection;

});
