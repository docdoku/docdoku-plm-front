'use strict';


var baseDir = __dirname + '/js/';

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
    showWebConsole: true,
    xunit: 'results.xml',
    waitOnRequest: false,
    debugResponses: false,
    debugRequests: false,
    requestTimeOut: 1000, // ms
    globalTimeout: 30, // minutes
    waitTimeout:20,//seconds
    soundOnTestsEnd: false,

    // Files to test
    pre: [
        baseDir + 'pre/start.js'
    ],
    post: [
        baseDir + 'auth/logout.js'
    ],
    includes: [
        baseDir + 'includes/vars.js',
    ],
    paths: [

        // Login
        baseDir + 'auth/login.js',

        // Workspace creation
        baseDir + 'workspace/workspaceCreation.js',

        // Content Type check
        baseDir + 'content-type/contentTypeCheck.js',

        // Workflow creation
        baseDir + 'change-management/role/roleCreation.js',
        baseDir + 'change-management/workflow/workflowCreation.js',
        baseDir + 'change-management/workflow/workflowDuplication.js',

        // Documents tags
        baseDir + 'document-management/tag/tagCreation.js',
        baseDir + 'document-management/tag/tagList.js',

        // Document templates
        baseDir + 'document-management/template/templateCreation.js',

        // Folder and document creation
        baseDir + 'document-management/folder/folderCreation.js',
        baseDir + 'document-management/document/documentCreationFromTemplate.js',
        baseDir + 'document-management/document/documentCreationWithWorkflow.js',
        baseDir + 'document-management/document/documentCreation.js',
        baseDir + 'document-management/document/documentsCreation.js',
        baseDir + 'document-management/document/documentUploadFile.js',
        baseDir + 'document-management/document/documentFilesRemove.js',
        baseDir + 'document-management/document/documentMultipleCheckin.js',
        baseDir + 'document-management/document/documentMultipleCheckout.js',
        baseDir + 'document-management/document/documentAddLink.js',
        baseDir + 'document-management/document/documentClickLink.js',
        baseDir + 'document-management/document/documentMultipleUndoCheckout.js',
        baseDir + 'document-management/document/documentCheckout.js',
        baseDir + 'document-management/document/documentCheckin.js',
        baseDir + 'document-management/document/documentRelease.js',
        baseDir + 'document-management/document/documentObsolete.js',
        baseDir + 'document-management/document/documentMultipleRelease.js',

        // Document sharing
        baseDir + 'document-management/share/sharedDocumentCreation.js',
        baseDir + 'document-management/share/publicSharedDocument.js',
        baseDir + 'document-management/share/privateSharedDocument.js',
        baseDir + 'document-management/share/expiredSharedDocument.js',


        // Part templates
        baseDir + 'product-management/template/partTemplateCreation.js',
        baseDir + 'product-management/template/templateWithAttribute.js',

        // Part and assembly creation
        baseDir + 'product-management/part/partCreation.js',
        baseDir + 'product-management/part/showPartDetails.js',
        baseDir + 'product-management/part/partUploadNativeCadFile.js',
        baseDir + 'product-management/part/partAddLink.js',
        baseDir + 'product-management/part/partClickLink.js',
        baseDir + 'product-management/part/partCheckin.js',
        baseDir + 'product-management/part/partCheckout.js',
        baseDir + 'product-management/assembly/assemblyCreation.js',
        baseDir + 'product-management/assembly/assemblyCheck.js',
        baseDir + 'product-management/part/partCheckin.js',
        baseDir + 'product-management/part/partsMultipleCheckout.js',
        baseDir + 'product-management/part/partsMultipleCheckin.js',
        baseDir + 'product-management/part/partsMultipleCheckout.js',
        baseDir + 'product-management/part/partsMultipleUndoCheckout.js',
        baseDir + 'product-management/part/partRelease.js',
        baseDir + 'product-management/part/partObsolete.js',
        baseDir + 'product-management/part/partsMultipleRelease.js',

        // Part sharing
        baseDir + 'product-management/share/sharedPartCreation.js',
        baseDir + 'product-management/share/publicSharedPart.js',
        baseDir + 'product-management/share/expiredSharedPart.js',
        baseDir + 'product-management/share/privateSharedPart.js',

        // Product and baseline creation
        baseDir + 'product-management/product/productCreation.js',
        baseDir + 'product-management/pathToPathLink/pathToPathLinkCreation.js',
        baseDir + 'product-management/baseline/baselineCreation.js',
        baseDir + 'product-management/product-instance/productInstanceCreation.js',

        // Product structure
        baseDir + 'product-management/assembly/bomInspection.js',
        baseDir + 'product-management/product-instance/productInstanceData.js',
        baseDir + 'product-management/pathToPathLink/pathToPathLinkCheck.js',
        baseDir + 'product-management/part/checkUsedByList.js',

        // Change items creation
        baseDir + 'change-management/issue/issueCreation.js',
        baseDir + 'change-management/request/requestCreation.js',
        baseDir + 'change-management/order/orderCreation.js',
        baseDir + 'change-management/milestone/milestoneCreation.js',

        //LOV Creation
        baseDir + 'document-management/lov/lovCreation.js',

        // Attributes creation
        baseDir + 'common/attributes.js',
        baseDir + 'common/partFromTemplate.js',

        // Query builder
        baseDir + 'product-management/queryBuilder/queryBuilderSearch.js',

        // Deletions
        baseDir + 'product-management/product-instance/productInstanceDeletion.js',
        baseDir + 'product-management/baseline/baselineDeletion.js',
        baseDir + 'product-management/product/productDeletion.js',
        baseDir + 'product-management/part/partDeletion.js',
        baseDir + 'product-management/part/partMultipleDeletion.js',
        baseDir + 'product-management/template/partTemplateDeletion.js',
        baseDir + 'document-management/lov/lovDeletion.js',

        baseDir + 'document-management/tag/tagDeletion.js',
        baseDir + 'document-management/document/documentDeletion.js',
        baseDir + 'document-management/document/documentMultipleDeletion.js',
        baseDir + 'document-management/template/templateDeletion.js',
        baseDir + 'document-management/folder/folderDeletion.js',

        baseDir + 'change-management/workflow/workflowDeletion.js',
        baseDir + 'change-management/issue/issueDeletion.js',
        baseDir + 'change-management/milestone/milestoneDeletion.js',
        baseDir + 'change-management/order/orderDeletion.js',
        baseDir + 'change-management/request/requestDeletion.js',

        //Create a document template with a LOV attribute, needs an empty list of documents template, and an empty list of LOV
        baseDir + 'document-management/lov/lovInTemplateCreation.js'

    ]
};


module.exports = config;
