/*global define,App*/
define(function () {

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
                statusIcon = 'fa-check'
            } else if (model.isObsolete()) {
                statusIcon = 'fa-frown-o';
            } else {
                statusIcon = 'fa-eye';
            }

            var assemblyIcon = model.isLastIterationAssembly() ? 'fa-cubes' : 'fa-cube';

            return '<td class="part_number"><i class="fa ' + statusIcon + '"></i> <i class="fa ' + assemblyIcon + '"></i> <span class="part_number_value"> ' + model.getNumber() + '</span></td>';
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
                return '<td></td>';
            }
        }
    };


    var defaultColumns = ["pr.number", "pr.version",
        "pr.iteration", "pr.type", "pr.name", "pr.author",
        "pr.modificationDate", "pr.lifecycleSate", "pr.checkoutUser", "pr.acl"
    ];

    return {
        columnNameMapping: columnNameMapping,
        defaultColumns: defaultColumns,
        cellsFactory: cellsFactory,
        mock: defaultColumns.map(function (column) {
            return column.value;
        }).reverse()
    };

});
