/*global _,$,bootbox,define,App*/
define([
    'backbone',
    'mustache',
    'text!templates/query_builder.html',
    'selectize',
    'query-builder-options',
    'common-objects/views/alert',
    'collections/configuration_items',
    'common-objects/collections/product_instances',
    'common-objects/views/prompt',
    'fileDownload'
], function (Backbone, Mustache, template, selectize, queryBuilderOptions, AlertView, ConfigurationItemCollection, ProductInstances, PromptView, FileDownload) {
    'use strict';
    var QueryBuilderView = Backbone.View.extend({

        events: {
            'click .search-button': 'onSearchButton',
            'click .save-button': 'onSave',
            'change select.query-list': 'onSelectQueryChange',
            'click .delete-selected-query': 'deleteSelectedQuery',
            'click .reset-button': 'onReset',
            'click .clear-select-badge': 'onClearSelect',
            'click .clear-where-badge': 'onClearWhere',
            'click .clear-path-data-where-badge': 'onClearPathDataWhere',
            'click .clear-order-by-badge': 'onClearOrderBy',
            'click .clear-group-by-badge': 'onClearGroupBy',
            'click .clear-context-badge': 'onClearContext',
            'click .export-existing-query-excel-button': 'doExportExistingQuery',
            'click .export-excel-button': 'doExport'
        },

        delimiter: ',',

        render: function () {

            this.initStaticOptionsAndFilters();

            this.$el.html(Mustache.render(template, {i18n: App.config.i18n}));
            this.bindDomElements();
            this.$pathDataWhereContainer.hide();

            this.fetchPartIterationsAttributes()
                .then(this.fetchPathDataAttributes.bind(this))
                .then(this.fetchTags.bind(this))
                .then(this.fetchQueries.bind(this))
                .then(this.fillSelectizes.bind(this))
                .then(this.initWhere.bind(this));

            return this;
        },

        initStaticOptionsAndFilters: function () {
            this.selectizeAvailableOptions = _.clone(queryBuilderOptions.fields);
            this.partIterationFilters = _.clone(queryBuilderOptions.filters);
            this.pathDataIterationFilters = _.clone(queryBuilderOptions.pathDataFilters);
            this.selectizeOptions = queryBuilderOptions.selectizeOptions;
        },

        bindDomElements: function () {
            this.$modal = this.$('#query-builder-modal');
            this.$where = this.$('#where');
            this.$pathDataWhere = this.$('#path-data-where');
            this.$pathDataWhereContainer = this.$pathDataWhere.parent().first();
            this.$select = this.$('#select');
            this.$orderBy = this.$('#orderBy');
            this.$groupBy = this.$('#groupBy');
            this.$selectQuery = this.$('select.query-list');
            this.$deleteQueryButton = this.$('.delete-selected-query');
            this.$exportExistingQueryButton = this.$('.export-existing-query-excel-button');
            this.$searchButton = this.$('.search-button');
            this.$context = this.$('#context');
            this.$existingQueriesArea = this.$('.choose-existing-request-area');
        },

        fetchQueries: function (queryName) {
            this.queries = [];
            var queries = this.queries;

            var url = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/parts/queries';

            var $select = this.$selectQuery;
            var $existingQueriesArea = this.$existingQueriesArea;
            var $deleteQueryButton = this.$deleteQueryButton;
            var $exportExistingQueryButton = this.$exportExistingQueryButton;
            var selected = this.$selectQuery.val();
            $select.empty();
            $select.append('<option value=""></option>');

            var fillOption = function (q) {
                queries.push(q);
                $select.append('<option value="' + q.id + '">' + q.name + '</option>');
            };

            return $.getJSON(url, function (data) {

                data.sort(function (a, b) {
                    return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
                }).map(fillOption);

                if (typeof queryName === 'string') {
                    var selectedQuery = _.find(data, function (query) {
                        return query.name === queryName;
                    });
                    selected = selectedQuery.id;
                }
                $select.val(selected);

            }).then(function () {
                if (!queries.length) {
                    $existingQueriesArea.hide();
                } else {
                    $existingQueriesArea.show();
                    $deleteQueryButton.toggle($select.val() !== '');
                    $exportExistingQueryButton.toggle($select.val() !== '');
                }
            });

        },

        clear: function () {
            var selectSelectize = this.$select[0].selectize;
            var orderBySelectize = this.$orderBy[0].selectize;
            var groupBySelectize = this.$groupBy[0].selectize;

            selectSelectize.clear();
            orderBySelectize.clear(true);
            orderBySelectize.clearOptions();
            groupBySelectize.clear(true);
            groupBySelectize.clearOptions();

            this.onClearContext();

            this.$deleteQueryButton.hide();
            this.$exportExistingQueryButton.hide();
        },

        onSelectQueryChange: function (e) {

            this.clear();

            var selectSelectize = this.$select[0].selectize;
            var orderBySelectize = this.$orderBy[0].selectize;
            var groupBySelectize = this.$groupBy[0].selectize;
            var contextSelectize = this.$context[0].selectize;

            this.$where.queryBuilder('reset');

            if (this.pathDataIterationFilters.length) {
                this.$pathDataWhere.queryBuilder('reset');
            }

            if (e.target.value) {

                var originalQuery = _.findWhere(this.queries, {id: parseInt(e.target.value, 10)});
                // Deep clone query to not alter original one
                var query = JSON.parse(JSON.stringify(originalQuery));

                if (query.queryRule) {
                    this.extractArrayValues(query.queryRule);
                    this.$where.queryBuilder('setRules', query.queryRule);
                } else {
                    this.$where.queryBuilder('setRules', {rules: []});
                }

                if (query.pathDataQueryRule) {
                    this.extractArrayValues(query.pathDataQueryRule);
                    this.$pathDataWhere.queryBuilder('setRules', query.pathDataQueryRule);
                } else {
                    this.$pathDataWhere.queryBuilder('setRules', {rules: []});
                }

                _.each(query.contexts, function (value) {
                    if (!value.serialNumber) {
                        contextSelectize.addItem(value.configurationItemId, true);
                    } else {
                        contextSelectize.addItem(value.configurationItemId + '/' + value.serialNumber, true);
                    }
                });

                _.each(query.selects, function (value) {
                    selectSelectize.addItem(value);
                });

                _.each(query.orderByList, function (value) {
                    orderBySelectize.addItem(value, true);
                });

                _.each(query.groupedByList, function (value) {
                    groupBySelectize.addItem(value, true);
                });

            } else {
                this.$where.queryBuilder('reset');
                if (this.pathDataIterationFilters.length) {
                    this.$pathDataWhere.queryBuilder('reset');
                }
            }

            this.$deleteQueryButton.toggle(e.target.value !== '');
            this.$exportExistingQueryButton.toggle(e.target.value !== '');
        },

        hasProductInstanceInSelectedContext: function () {
            var contextValue = this.$context[0].selectize.getValue();
            var context = contextValue.length ? contextValue.split(this.delimiter) : [];
            return context.filter(function (ctx) {
                return ctx.split('/').length === 2;
            }).length;
        },

        onContextChange: function () {
            if (this.pathDataIterationFilters.length) {
                if (!this.hasProductInstanceInSelectedContext()) {
                    this.$pathDataWhere.queryBuilder('reset');
                    this.$pathDataWhereContainer.hide();
                } else {
                    this.$pathDataWhereContainer.show();
                }
            }
        },

        deleteSelectedQuery: function () {
            var self = this;
            var id = this.$selectQuery.val();

            if (id) {
                bootbox.confirm(App.config.i18n.DELETE_QUERY_QUESTION,
                    App.config.i18n.CANCEL,
                    App.config.i18n.DELETE,
                    function (result) {
                        if (result) {

                            var url = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/parts/queries/' + id;
                            $.ajax({
                                type: 'DELETE',
                                url: url,
                                success: function () {
                                    self.clear();
                                    self.$where.queryBuilder('reset');
                                    self.fetchQueries();
                                },
                                error: function (errorMessage) {
                                    self.$('#alerts').append(new AlertView({
                                        type: 'error',
                                        message: errorMessage.responseText
                                    }).render().$el);
                                }
                            });
                        }
                    });
            }
        },

        fetchPartIterationsAttributes: function () {
            var self = this;
            var url = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/attributes/part-iterations';

            return $.ajax({
                type: 'GET',
                url: url,
                success: function (data) {
                    _.each(data, function (attribute) {
                        self.addFilter(attribute, '', self.partIterationFilters);
                        self.selectizeAvailableOptions.push({
                            name: attribute.name,
                            value: 'attr-' + attribute.type + '.' + attribute.name,
                            group: 'attr-' + attribute.type
                        });

                    });
                },
                error: function () {

                }
            });
        },

        fetchPathDataAttributes: function () {
            var self = this;
            var url = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/attributes/path-data';

            return $.ajax({
                type: 'GET',
                url: url,
                success: function (data) {
                    _.each(data, function (attribute) {
                        self.addFilter(attribute, 'pd-', self.pathDataIterationFilters);
                        self.selectizeAvailableOptions.push({
                            name: attribute.name,
                            value: 'pd-attr-' + attribute.type + '.' + attribute.name,
                            group: 'pd-attrs'
                        });
                    });
                },
                error: function () {

                }
            });
        },

        addFilter: function (attribute, prefix, filters) {
            var attributeType = queryBuilderOptions.types[attribute.type];
            var group = _.findWhere(queryBuilderOptions.groups, {id: 'attr-' + attribute.type});
            var filter = {
                id: prefix + 'attr-' + attribute.type + '.' + attribute.name,
                label: attribute.name,
                type: attributeType,
                realType: attributeType,
                optgroup: group.name
            };
            if (attributeType === 'date') {
                filter.operators = queryBuilderOptions.dateOperators;
                filter.input = queryBuilderOptions.dateInput;
            } else if (attributeType === 'string') {
                filter.operators = queryBuilderOptions.stringOperators;
            } else if (attributeType === 'lov') {
                filter.type = 'string';
                filter.operators = queryBuilderOptions.lovOperators;
                filter.input = 'select';
                var values = [];
                var index = 0;
                _.each(attribute.items, function (item) {
                    var value = {};
                    value[index] = item.name;
                    values.push(value);
                    index++;
                });
                filter.values = values;
            } else if (attributeType === 'boolean') {
                filter.type = 'boolean';
                filter.operators = queryBuilderOptions.booleanOperators;
                filter.input = 'select';
                filter.values = [
                    {'true': App.config.i18n.TRUE},
                    {'false': App.config.i18n.FALSE}
                ];
            } else if (attributeType === 'double') {
                filter.operators = queryBuilderOptions.numberOperators;
            }

            filters.push(filter);
        },

        fetchTags: function () {
            var self = this;
            var url = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/tags';

            return $.ajax({
                type: 'GET',
                url: url,
                success: function (tags) {

                    var filter = {
                        id: 'pr.tags',
                        label: 'TAG',
                        type: 'string',
                        realType: 'string',
                        optgroup: _.findWhere(queryBuilderOptions.groups, {id: 'pr'}).name
                    };

                    var values = [];
                    _.each(tags, function (tag) {
                        var value = {};
                        value[tag.id] = tag.label;
                        values.push(value);
                    });

                    filter.operators = queryBuilderOptions.tagOperators;
                    filter.input = 'select';
                    filter.values = values;
                    self.partIterationFilters.push(filter);
                },
                error: function () {

                }
            });
        },

        destroy: function () {
            if (this.$where) {
                this.$where.queryBuilder('destroy');
            }
        },

        initWhere: function () {
            this.$where.queryBuilder({
                filters: this.partIterationFilters,
                icons: queryBuilderOptions.icons,
                'allow_empty': true
            });

            if (this.pathDataIterationFilters.length) {
                this.$pathDataWhere.queryBuilder({
                    filters: this.pathDataIterationFilters,
                    icons: queryBuilderOptions.icons,
                    'allow_empty': true
                });
            }

            this.$pathDataWhereContainer.hide();
        },

        fillSelectizes: function () {
            var self = this;

            this.fillContext();

            this.$select.selectize(this.selectizeOptions);
            this.$select[0].selectize.addOption(this.selectizeAvailableOptions);

            this.$select[0].selectize.on('item_add', function (value) {
                var data = _.findWhere(self.$select[0].selectize.options, {value: value});

                self.$groupBy[0].selectize.addOption(data);
                self.$groupBy[0].selectize.refreshOptions(false);

                self.$orderBy[0].selectize.addOption(data);
                self.$orderBy[0].selectize.refreshOptions(false);
            });

            this.$select[0].selectize.on('item_remove', function (value) {
                self.$groupBy[0].selectize.removeOption(value);
                self.$groupBy[0].selectize.refreshOptions(false);

                self.$orderBy[0].selectize.removeOption(value);
                self.$orderBy[0].selectize.refreshOptions(false);
            });

            this.$orderBy.selectize(this.selectizeOptions);
            this.$groupBy.selectize(this.selectizeOptions);
        },

        fillContext: function () {
            var contextOption = _.clone(this.selectizeOptions);
            contextOption.group = [{id: 'pi', name: App.config.i18n.QUERY_GROUP_PRODUCT}];
            this.$context.selectize(contextOption);

            var self = this;
            var contextSelectize = this.$context[0].selectize;

            var productCollection = new ConfigurationItemCollection();
            productCollection.fetch().success(function (productsList) {
                _.each(productsList, function (product) {
                    self.$context[0].selectize.addOption({
                        name: product.id,
                        value: product.id,
                        group: 'pi'
                    });
                });
            }).error(function () {
                self.$('#alerts').append(new AlertView({
                    type: 'warning',
                    message: App.config.i18n.QUERY_CONTEXT_ERROR
                }).render().$el);
            });

            contextSelectize.on('item_add', function () {
                self.onContextChange();
                self.$select[0].selectize.addOption(queryBuilderOptions.contextFields);
                self.$select[0].selectize.refreshOptions(false);

                if (contextSelectize.items.length === 1) {
                    _.each(queryBuilderOptions.contextFields, function (field) {
                        self.selectizeAvailableOptions.push(field);
                    });
                }
            });

            contextSelectize.on('item_remove', function () {
                self.onContextChange();
                if (contextSelectize.items.length === 0) {
                    _.each(queryBuilderOptions.contextFields, function (field) {
                        self.$select[0].selectize.removeOption(field.value);
                        self.$select[0].selectize.refreshOptions(false);

                        self.$groupBy[0].selectize.removeOption(field.value);
                        self.$groupBy[0].selectize.refreshOptions(false);

                        self.$orderBy[0].selectize.removeOption(field.value);
                        self.$orderBy[0].selectize.refreshOptions(false);
                    });
                }
            });


            new ProductInstances().fetch().success(function (productInstances) {
                _.each(productInstances, function (pi) {
                    contextSelectize.addOptionGroup(pi.configurationItemId, {name: pi.configurationItemId});

                    contextSelectize.addOption({
                        name: pi.serialNumber,
                        value: pi.configurationItemId + '/' + pi.serialNumber,
                        group: pi.configurationItemId
                    });

                });
            });

        },

        onClearSelect: function () {
            var selectSelectize = this.$select[0].selectize;
            var orderBySelectize = this.$orderBy[0].selectize;
            var groupBySelectize = this.$groupBy[0].selectize;

            selectSelectize.clear();
            orderBySelectize.clear(true);
            orderBySelectize.clearOptions();
            groupBySelectize.clear(true);
            groupBySelectize.clearOptions();
        },

        onClearWhere: function () {
            this.$where.queryBuilder('reset');
        },

        onClearPathDataWhere: function () {
            if (this.pathDataIterationFilters.length) {
                this.$pathDataWhere.queryBuilder('reset');
            }
        },

        onClearOrderBy: function () {
            var orderBySelectize = this.$orderBy[0].selectize;
            orderBySelectize.clear();
        },

        onClearGroupBy: function () {
            var groupBySelectize = this.$groupBy[0].selectize;
            groupBySelectize.clear();
        },

        onClearContext: function () {
            if (this.pathDataIterationFilters.length) {
                this.$pathDataWhere.queryBuilder('reset');
            }
            this.$pathDataWhereContainer.hide();

            var contextSelectize = this.$context[0].selectize;
            contextSelectize.clear();

            var self = this;
            _.each(queryBuilderOptions.contextFields, function (field) {
                self.$select[0].selectize.removeOption(field.value);
                self.$select[0].selectize.refreshOptions(false);

                self.$groupBy[0].selectize.removeOption(field.value);
                self.$groupBy[0].selectize.refreshOptions(false);

                self.$orderBy[0].selectize.removeOption(field.value);
                self.$orderBy[0].selectize.refreshOptions(false);
            });

        },

        onReset: function () {
            this.clear();
            this.$where.queryBuilder('reset');
            if (this.pathDataIterationFilters.length) {
                this.$pathDataWhere.queryBuilder('reset');
            }
            this.$selectQuery.val('');
        },

        doExportExistingQuery: function () {
            var queryId = this.$selectQuery.val();
            var query = _.findWhere(this.queries, {id: parseInt(queryId, 10)});
            var url = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/parts/queries/' + query.id + '/format/XLS';

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                var a;
                if (xhr.readyState === 4 && xhr.status === 200) {
                    a = document.createElement('a');
                    a.href = window.URL.createObjectURL(xhr.response);
                    a.download = 'export.xls';
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                }
            };
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            FileDownload.bindXhr(xhr, this.$exportExistingQueryButton.parent());
            xhr.send();

        },

        onSave: function () {

            var self = this;

            var promptView = new PromptView();
            promptView.setPromptOptions(App.config.i18n.SAVE, '', App.config.i18n.SAVE, App.config.i18n.CANCEL, this.$selectQuery.find('option:selected').text());
            window.document.body.appendChild(promptView.render().el);
            promptView.openModal();

            this.listenTo(promptView, 'prompt-ok', function (args) {
                var name = args[0];
                self.doSearch(name);
            });

        },

        getQueryData: function (save) {

            var isValid = this.$where.queryBuilder('validate');

            var sendPathDataRules = this.hasProductInstanceInSelectedContext();
            var pathDataRules = null;

            if (sendPathDataRules) {
                isValid = isValid && this.$pathDataWhere.queryBuilder('validate');
                pathDataRules = this.$pathDataWhere.queryBuilder('getRules');
                if (pathDataRules.rules && pathDataRules.rules.length > 0) {
                    this.sendValuesInArray(pathDataRules.rules);
                } else {
                    pathDataRules = null;
                }
            }

            var rules = this.$where.queryBuilder('getRules');

            if (rules.rules && rules.rules.length > 0) {
                this.sendValuesInArray(rules.rules);
            } else {
                rules = null;
            }

            var selectsSize = this.$select[0].selectize.items.length;

            isValid = isValid && selectsSize > 0;

            if (isValid) {
                var context = this.$context[0].selectize.getValue().length ? this.$context[0].selectize.getValue().split(this.delimiter) : [];

                var contextToSend = [];
                _.each(context, function (ctx) {
                    var productAndSerial = ctx.split('/');
                    contextToSend.push({
                        configurationItemId: productAndSerial[0],
                        serialNumber: productAndSerial[1],
                        workspaceId: App.config.workspaceId
                    });
                });

                var selectList = this.$select[0].selectize.getValue().length ? this.$select[0].selectize.getValue().split(this.delimiter) : [];
                var orderByList = this.$orderBy[0].selectize.getValue().length ? this.$orderBy[0].selectize.getValue().split(this.delimiter) : [];
                var groupByList = this.$groupBy[0].selectize.getValue().length ? this.$groupBy[0].selectize.getValue().split(this.delimiter) : [];

                return {
                    contexts: contextToSend,
                    selects: selectList,
                    orderByList: orderByList,
                    groupedByList: groupByList,
                    queryRule: rules,
                    pathDataQueryRule: pathDataRules,
                    name: save || ''
                };

            }
        },

        doExport: function () {

            var queryData = this.getQueryData(false);

            if (queryData) {
                var url = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/parts/query-export?export=XLS';

                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    var a;
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        a = document.createElement('a');
                        a.href = window.URL.createObjectURL(xhr.response);
                        a.download = 'export.xls';
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();
                    }
                };
                xhr.open('POST', url);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.responseType = 'blob';
                FileDownload.bindXhr(xhr, this.$('.query-actions-block'));
                xhr.send(JSON.stringify(queryData));
            }

        },

        onSearchButton: function () {
            this.doSearch(false);
        },

        doSearch: function (save) {

            var queryData = this.getQueryData(save);
            var self = this;

            if (queryData) {

                this.$searchButton.button('loading');
                var url = App.config.apiEndPoint + '/workspaces/' + App.config.workspaceId + '/parts/queries';

                if (save) {
                    url += '?save=true';
                }

                $.ajax({
                    type: 'POST',
                    url: url,
                    data: JSON.stringify(queryData),
                    contentType: 'application/json',
                    success: function (data) {
                        var filters = _.clone(self.partIterationFilters).concat(self.pathDataIterationFilters);
                        var dataToTransmit = {
                            queryFilters: filters,
                            queryData: queryData,
                            queryResponse: data,
                            queryColumnNameMapping: self.selectizeAvailableOptions
                        };
                        self.$searchButton.button('reset');
                        self.fetchQueries(save);
                        self.trigger('query:search', dataToTransmit);
                    },
                    error: function (errorMessage) {
                        self.$searchButton.button('reset');
                        self.$('#alerts').append(new AlertView({
                            type: 'error',
                            message: errorMessage.responseText
                        }).render().$el);
                    }
                });
            }

        },

        extractArrayValues: function (rule) {
            if (rule && rule.rules) {
                var rules = rule.rules;
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i].values && rules[i].values.length === 1) {
                        rules[i].value = rules[i].values[0];
                    } else {
                        rules[i].value = rules[i].values;
                    }
                    if (rules[i].rules && rules[i].rules.length) {
                        for (var j = 0; j < rules[i].rules.length; j++) {
                            this.extractArrayValues(rules[i]);
                        }
                    }
                }
            }
        },

        sendValuesInArray: function (rules) {
            if (rules) {
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i].value === undefined) {
                        this.sendValuesInArray(rules[i].rules);
                    } else {
                        if (rules[i].value instanceof Array) {
                            rules[i].values = rules[i].value;
                        } else {
                            rules[i].values = [rules[i].value];
                        }
                        rules[i].value = undefined;
                    }
                }
            }
        }

    });


    return QueryBuilderView;
});
