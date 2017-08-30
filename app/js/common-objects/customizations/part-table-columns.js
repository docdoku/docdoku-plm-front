/*global define,App*/
define(function () {

    'use strict';

    var columnNameMapping = {
        'pr.number': App.config.i18n.PART_NUMBER,
        'pr.version': App.config.i18n.VERSION,
        'pr.type': App.config.i18n.TYPE,
        'pr.name': App.config.i18n.PART_NAME,
        'pr.author': App.config.i18n.AUTHOR_NAME,
        'pr.modificationDate': App.config.i18n.MODIFICATION_DATE,
        'pr.lifecycleSate': App.config.i18n.LIFECYCLE_STATE,
        'pr.checkoutUser': App.config.i18n.CHECKOUT_BY,
        'pr.acl': App.config.i18n.ACL
    };


    var cellsFactory = {
        'pr.number': function (model) {
            return '<td class="part_number"><span class="part_number_value">' + model.getNumber() + '</span></td>';
        },
        'pr.version': function (model) {
            return '<td><span>' + model.getVersion() + '</span></td>';
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


    var defaultColumns = [
        {
            name: columnNameMapping['pr.number'],
            value: 'pr.number',
            group: 'pr'
        },
        {
            name: columnNameMapping['pr.version'],
            value: 'pr.version',
            group: 'pr'
        },
        {
            name: columnNameMapping['pr.type'],
            value: 'pr.type',
            group: 'pr'
        },
        {
            name: columnNameMapping['pr.name'],
            value: 'pr.name',
            group: 'pr'
        },
        {
            name: columnNameMapping['pr.author'],
            value: 'pr.author',
            group: 'pr'
        },
        {
            name: columnNameMapping['pr.modificationDate'],
            value: 'pr.modificationDate',
            group: 'pr'
        },
        {
            name: columnNameMapping['pr.lifecycleSate'],
            value: 'pr.lifecycleSate',
            group: 'pr'
        },
        {
            name: columnNameMapping['pr.checkoutUser'],
            value: 'pr.checkoutUser',
            group: 'pr'
        },
        {
            name: columnNameMapping['pr.acl'],
            value: 'pr.acl',
            group: 'pr'
        }
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
