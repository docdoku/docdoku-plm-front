'use strict';


var baseDir = __dirname + '/';

var config = {

    // Custom casperjs
    //casperjs: '/usr/local/bin/casperjs',

    // URL
    protocol: 'http',
    domain: 'localhost',
    port: '9001',
    contextPath: '/',

    // User authentication
    login: 'test',
    pass: 'test',

    // Configuration
    logLevel: 'warning',
    debug: false,
    verbose: true,
    failFast: true,
    showWebConsole: false,
    xunit: 'results.xml',
    waitOnRequest: false,
    debugResponses: false,
    debugRequests: false,
    requestTimeOut: 1000, // ms
    globalTimeout: 20, // minutes
    soundOnTestsEnd: false,

    // Files to test
    pre: [
        baseDir + 'js/pre/start.js'
    ],
    post: [
        baseDir + 'js/auth/logout.js'
    ],
    includes: [
        baseDir + 'js/includes/vars.js',
    ],
    paths: [

        // Login and workspace initialization
        baseDir + 'js/auth/login.js',
        // Content Type check
        baseDir + 'js/content-type/contentTypeCheck.js',

        // Workflow creation
        baseDir + 'js/change-management/role/roleCreation.js',
        baseDir + 'js/change-management/workflow/workflowCreation.js',
        baseDir + 'js/change-management/workflow/workflowDuplication.js',

        // Documents tags
        baseDir + 'js/document-management/tag/tagCreation.js',
        baseDir + 'js/document-management/tag/tagList.js',

        // Document templates
        baseDir + 'js/document-management/template/templateCreation.js',

        // Folder and document creation
        baseDir + 'js/document-management/folder/folderCreation.js',
        baseDir + 'js/document-management/document/documentCreationFromTemplate.js',
        baseDir + 'js/document-management/document/documentCreationWithWorkflow.js',
        baseDir + 'js/document-management/document/documentCreation.js',
        baseDir + 'js/document-management/document/documentsCreation.js',
        baseDir + 'js/document-management/document/documentUploadFile.js',
        baseDir + 'js/document-management/document/documentFilesRemove.js',
        baseDir + 'js/document-management/document/documentMultipleCheckin.js',
        baseDir + 'js/document-management/document/documentMultipleCheckout.js',
        baseDir + 'js/document-management/document/documentAddLink.js',
        baseDir + 'js/document-management/document/documentClickLink.js',
        baseDir + 'js/document-management/document/documentMultipleUndoCheckout.js',
        baseDir + 'js/document-management/document/documentCheckout.js',
        baseDir + 'js/document-management/document/documentCheckin.js',
        baseDir + 'js/document-management/document/documentRelease.js',
        baseDir + 'js/document-management/document/documentObsolete.js',
        baseDir + 'js/document-management/document/documentMultipleRelease.js',

        // Document sharing
        baseDir + 'js/document-management/share/sharedDocumentCreation.js',
        baseDir + 'js/document-management/share/publicSharedDocument.js',
        baseDir + 'js/document-management/share/privateSharedDocument.js',
        baseDir + 'js/document-management/share/expiredSharedDocument.js',


        // Part templates
        baseDir + 'js/product-management/template/partTemplateCreation.js',
        baseDir + 'js/product-management/template/templateWithAttribute.js',

        // Part and assembly creation
        baseDir + 'js/product-management/part/partCreation.js',
        baseDir + 'js/product-management/part/showPartDetails.js',
        baseDir + 'js/product-management/part/partUploadNativeCadFile.js',
        baseDir + 'js/product-management/part/partAddLink.js',
        baseDir + 'js/product-management/part/partClickLink.js',
        baseDir + 'js/product-management/part/partCheckin.js',
        baseDir + 'js/product-management/part/partCheckout.js',
        baseDir + 'js/product-management/assembly/assemblyCreation.js',
        baseDir + 'js/product-management/assembly/assemblyCheck.js',
        baseDir + 'js/product-management/part/partCheckin.js',
        baseDir + 'js/product-management/part/partsMultipleCheckout.js',
        baseDir + 'js/product-management/part/partsMultipleCheckin.js',
        baseDir + 'js/product-management/part/partsMultipleCheckout.js',
        baseDir + 'js/product-management/part/partsMultipleUndoCheckout.js',
        baseDir + 'js/product-management/part/partRelease.js',
        baseDir + 'js/product-management/part/partObsolete.js',
        baseDir + 'js/product-management/part/partsMultipleRelease.js',

        // Part sharing
        baseDir + 'js/product-management/share/sharedPartCreation.js',
        baseDir + 'js/product-management/share/publicSharedPart.js',
        baseDir + 'js/product-management/share/expiredSharedPart.js',
        baseDir + 'js/product-management/share/privateSharedPart.js',

        // Product and baseline creation
        baseDir + 'js/product-management/product/productCreation.js',
        baseDir + 'js/product-management/pathToPathLink/pathToPathLinkCreation.js',
        baseDir + 'js/product-management/baseline/baselineCreation.js',
        baseDir + 'js/product-management/product-instance/productInstanceCreation.js',

        // Product structure
        baseDir + 'js/product-management/assembly/bomInspection.js',
        baseDir + 'js/product-management/product-instance/productInstanceData.js',
        baseDir + 'js/product-management/pathToPathLink/pathToPathLinkCheck.js',
        baseDir + 'js/product-management/part/checkUsedByList.js',

        // Change items creation
        baseDir + 'js/change-management/issue/issueCreation.js',
        baseDir + 'js/change-management/request/requestCreation.js',
        baseDir + 'js/change-management/order/orderCreation.js',
        baseDir + 'js/change-management/milestone/milestoneCreation.js',

        //LOV Creation
        baseDir + 'js/document-management/lov/lovCreation.js',

        // Attributes creation
        baseDir + 'js/common/attributes.js',
        baseDir + 'js/common/partFromTemplate.js',

        // Query builder
        baseDir + 'js/product-management/queryBuilder/queryBuilderSearch.js',

        // Deletions
        baseDir + 'js/product-management/product-instance/productInstanceDeletion.js',
        baseDir + 'js/product-management/baseline/baselineDeletion.js',
        baseDir + 'js/product-management/product/productDeletion.js',
        baseDir + 'js/product-management/part/partDeletion.js',
        baseDir + 'js/product-management/part/partMultipleDeletion.js',
        baseDir + 'js/product-management/template/partTemplateDeletion.js',
        baseDir + 'js/document-management/lov/lovDeletion.js',

        baseDir + 'js/document-management/tag/tagDeletion.js',
        baseDir + 'js/document-management/document/documentDeletion.js',
        baseDir + 'js/document-management/document/documentMultipleDeletion.js',
        baseDir + 'js/document-management/template/templateDeletion.js',
        baseDir + 'js/document-management/folder/folderDeletion.js',

        baseDir + 'js/change-management/workflow/workflowDeletion.js',
        baseDir + 'js/change-management/issue/issueDeletion.js',
        baseDir + 'js/change-management/milestone/milestoneDeletion.js',
        baseDir + 'js/change-management/order/orderDeletion.js',
        baseDir + 'js/change-management/request/requestDeletion.js',

        //Create a document template with a LOV attribute, needs an empty list of documents template, and an empty list of LOV
        baseDir + 'js/document-management/lov/lovInTemplateCreation.js'

    ]
};


module.exports = config;
