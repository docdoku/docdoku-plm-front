/*global define,App*/
define(['common-objects/models/baseline'],
    function (Baseline) {
        'use strict';
        var ProductBaseline = Baseline.extend({
            urlRoot: function () {
                var ciId = this.getConfigurationItemId();
                if (ciId) {
                    return App.config.apiEndPoint + '/workspaces/' +
                        App.config.workspaceId + '/product-baselines/' + ciId + '/baselines';
                }
                return App.config.apiEndPoint + '/workspaces/' +
                    App.config.workspaceId + '/product-baselines';
            },
            getBaselinedParts: function () {
                return this.get('baselinedParts');
            },
            setBaselinedParts: function (baselinedParts) {
                return this.set('baselinedParts', baselinedParts);
            },
            getConfigurationItemId: function () {
                return this.get('configurationItemId');
            },
            setConfigurationItemId: function (configurationItemId) {
                this.set('configurationItemId', configurationItemId);
            },
            getSubstituteLinks: function () {
                return this.get('substituteLinks');
            },
            setSubstituteLinks: function (substituteLinks) {
                this.set('substituteLinks', substituteLinks);
            },
            getOptionalUsageLinks: function () {
                return this.get('optionalUsageLinks');
            },
            setOptionalUsageLinks: function (optionalUsageLinks) {
                this.set('optionalUsageLinks', optionalUsageLinks);
            },

            getBomUrl: function () {
                return App.config.contextPath + 'product-structure/index.html#' + App.config.workspaceId +
                    '/' + encodeURIComponent(this.getConfigurationItemId()) + '/config-spec/' + this.getId() + '/bom';
            },

            getSceneUrl: function () {
                return App.config.contextPath + 'product-structure/index.html#' + App.config.workspaceId +
                    '/' + encodeURIComponent(this.getConfigurationItemId()) + '/config-spec/' + this.getId() + '/scene';
            },

            getZipUrl: function () {
                return App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId +
                    '/products/' + encodeURIComponent(this.getConfigurationItemId()) +
                    '/export-files?configSpecType=' + encodeURIComponent(this.getId());
            },

            getSubstitutesParts: function () {
                //can be null, and used as an array.
                return this.get('substitutesParts');
            },

            getOptionalsParts: function () {
                //can be null, and used as an array.
                return this.get('optionalsParts');
            },

            hasObsoletePartRevisions: function () {
                return this.get('hasObsoletePartRevisions');
            },

            hasPathToPathLink: function () {
                return this.getPathToPathLinks().length;
            },
            getPathToPathLinks: function () {
                return this.get('pathToPathLinks');
            }
        });

        return ProductBaseline;
    });
