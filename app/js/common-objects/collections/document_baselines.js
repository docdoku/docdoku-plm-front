/*global define,App*/
define(['backbone', 'common-objects/models/document_baseline'],
    function (Backbone, DocumentBaseline) {
        'use strict';
        var Baselines = Backbone.Collection.extend({

            model: DocumentBaseline,

            url: function () {
                return App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/document-baselines/';
            }

        });

        return Baselines;
    });
