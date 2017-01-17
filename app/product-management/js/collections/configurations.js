/*global define,App*/
define(['backbone', 'models/configuration' ],
function (Backbone, Configuration) {
	'use strict';
    var ConfigurationCollection = Backbone.Collection.extend({
        url: function () {
            return App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/product-configurations';
        },
        model: Configuration
    });

    return ConfigurationCollection;

});
