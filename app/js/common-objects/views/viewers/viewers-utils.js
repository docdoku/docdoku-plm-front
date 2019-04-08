/*global define,App*/
define([], function () {

    'use strict';

    function findAndReplaceUrl(string, target, replacement) {
 
        var i = 0, length = string.length;
        
        for (i; i < length; i++) {
        
          string = string.replace(target, replacement);
        
        }
        
        return string;

       }

    function getBinaryDownloadUrl(binaryResource, uuid, token) {

        var url = App.config.apiEndPoint + '/files/' + binaryResource.fullName;

        var options = [];
        if (uuid) {
            options.push('uuid=' + uuid);
        }

        if (token) {
            options.push('token=' + token);
        }

        if (options.length) {
            url += '?' + options.join('&');
        }

        return findAndReplaceUrl(url,'+','%20');

    }

    function getFileName(url) {
        return url.substr(url.lastIndexOf('/') + 1);
    }

    function getExtension(url) {
        var fileName = getFileName(url);
        return fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
    }

    function generateViewerHash() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    function getBinaryEmbeddableUrl(binaryResource, uuid, resourceToken) {
        return getBinaryDownloadUrl(binaryResource, uuid, resourceToken);
    }

    return {
        getBinaryDownloadUrl: getBinaryDownloadUrl,
        getBinaryEmbeddableUrl: getBinaryEmbeddableUrl,
        getFileName: getFileName,
        getExtension: getExtension,
        generateViewerHash: generateViewerHash

    };
});
