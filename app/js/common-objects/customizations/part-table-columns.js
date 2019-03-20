/*global define,App*/
define(['common-objects/utils/date'], function (date) {

    'use strict';

    var columnNameMapping = {
        'pr.number': App.config.i18n.PART_NUMBER,
        'pr.version': App.config.i18n.VERSION,
        'pr.iteration': App.config.i18n.ITERATION,
        'pr.type': App.config.i18n.TYPE,
        'pr.name': App.config.i18n.PART_NAME,
        'pr.author': App.config.i18n.AUTHOR_NAME,
        'pr.modificationDate': App.config.i18n.MODIFICATION_DATE,
        'pr.lifecycleSate': App.config.i18n.LIFECYCLE_STATE,
        'pr.checkoutUser': App.config.i18n.CHECKOUT_BY,
        'pr.acl': App.config.i18n.ACL
    };

    var dateFields = ['pr.modificationDate'];
    var numberFields = ['pr.iteration'];

    var optgroups = [
        {id: 'pr', name: App.config.i18n.QUERY_GROUP_PART_REVISION},
        {id: 'attr-TEXT', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_STRING},
        {id: 'attr-LONG_TEXT', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_LONG_STRING},
        {id: 'attr-PART_NUMBER', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_PART_NUMBER},
        {id: 'attr-URL', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_URL},
        {id: 'attr-LOV', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_LOV},
        {id: 'attr-NUMBER', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_NUMBER},
        {id: 'attr-DATE', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_DATE},
        {id: 'attr-BOOLEAN', name: App.config.i18n.QUERY_GROUP_ATTRIBUTE_BOOLEAN},
    ];

    var formatAttribute = function (attr) {
        var value = attr.get('value');
        switch (attr.get('type')) {

            case 'DATE':
                return '<a class="date-popover">' + date.formatTimestamp(App.config.i18n._DATE_FORMAT, value) + '</a>';

            case 'URL':
                return '<a href="' + value + '">' + value + '</a>';

            case 'BOOLEAN':
                return value === 'true' ? App.config.i18n.TRUE : App.config.i18n.FALSE;

            default:
                return value;
        }
    };

    var findAttribute = function (attributes, key) {
        var attrs = attributes.filter(function (attr) {
            return attr.get('name') === key.split('.')[1];
        });
        if (attrs.length) {
            return formatAttribute(attrs[0]);
        }
        return '-';
    };

    // improvements: use mustache to compile templates
    var cellsFactory = {
        'pr.number': function (model) {
            var statusIcon;

            if (model.isCheckout()) {
                if (model.isCheckoutByConnectedUser()) {
                    statusIcon = 'fa-pencil';
                } else {
                    statusIcon = 'fa-lock';
                }
            } else if (model.isReleased()) {
                statusIcon = 'fa-check';
            } else if (model.isObsolete()) {
                statusIcon = 'fa-frown-o';
            } else {
                statusIcon = 'fa-eye';
            }

            var assemblyIcon = model.isLastIterationAssembly() ? 'fa-cubes' : 'fa-cube';

            //build cell to return according to if the part is assembled with others part or not
            var withoutAsemblyParts = '<td class="part_number"><i class="fa ' + statusIcon + '"></i> <i class="fa ' + assemblyIcon + '"></i> <span class="part_number_value"> ' + model.getNumber() + '</span></td>';

            var label = '<span  class="product_title expandable">' + model.getPartKey() + '</span>';

            var text = '<div><i class="fa ' + statusIcon + '"></i><i class="fa ' + assemblyIcon + '"></i><span class="part_number_value">' + model.getNumber() + '</span></div>';

            var list = '<ul><li class="path_-1 expandable lastExpandable"><div  class="blockClickArea hitarea expandable-hitarea lastExpandable-hitarea expandable"></div>' + label + '<ul class="list_child"></ul></li></ul>';

            var navBalise = '<nav id="product_nav_list" class="treeview">' + text + list + '</nav>';

            var assemblyPartBuild = '<td class="part_number">' + navBalise + '</td>';

            return assemblyIcon === 'fa-cubes' ? assemblyPartBuild : withoutAsemblyParts;
        },
        'pr.version': function (model) {
            return '<td><span>' + model.getVersion() + '</span></td>';
        },
        'pr.iteration': function (model) {
            return '<td><span>' + ( model.getLastIteration() ? model.getLastIteration().id : '-') + '</span></td>';
        },
        'pr.type': function (model) {
            return '<td><span>' + (model.getType() || '-') + '</span></td>';
        },
        'pr.name': function (model) {
            return '<td><span>' + ( model.getName() || '-') + '</span></td>';
        },
        'pr.author': function (model) {
            return '<td><a class="author-popover">' + (model.getAuthorName() || '-') + '</a></td>';
        },
        'pr.modificationDate': function (model) {
            return '<td><a class="date-popover">' + model.getFormattedModificationDate() + '</a></td>';
        },
        'pr.lifecycleSate': function (model) {
            return '<td><span>' + ( model.getLifeCycleState() || '-') + '</span></td>';
        },
        'pr.checkoutUser': function (model) {
            return '<td><a class="checkout-user-popover">' + (model.getCheckOutUserName() || '-') + '</a></td>';
        },
        'pr.acl': function (model) {
            var className = model.isReadOnly() ? 'read-only' :
                model.isFullAccess() ? 'full-access' : '';
            var title = model.isReadOnly() ? App.config.i18n.READ_ONLY :
                model.isFullAccess() ? App.config.i18n.FULL_ACCESS : '';
            if (className && title) {
                return '<td class="part-acl-info"><i class="fa fa-key ' + className + '" title="' + title + '"></i></td>';
            }
            else {
                return '<td>-</td>';
            }
        },
        attr: function (model, key) {
            var iteration = model.getLastIteration();
            if (iteration) {
                return '<td>' + findAttribute(iteration.getAttributes(), key) + ' </td>';
            }
            return '<td>-</td>';
        }
    };

    var defaultColumns = ['pr.number', 'pr.version',
        'pr.iteration', 'pr.type', 'pr.name', 'pr.author',
        'pr.modificationDate', 'pr.lifecycleSate', 'pr.checkoutUser', 'pr.acl'
    ];

    return {
        columnNameMapping: columnNameMapping,
        defaultColumns: defaultColumns,
        cellsFactory: cellsFactory,
        optgroups: optgroups,
        dateFields: dateFields,
        numberFields: numberFields,
        mock: defaultColumns.map(function (column) {
            return column.value;
        }).reverse()
    };

});
