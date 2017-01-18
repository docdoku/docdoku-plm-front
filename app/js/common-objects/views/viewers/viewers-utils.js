/*global define*/
define([], function () {

    'use strict';

    function getBinaryDownloadUrl(binaryResource, uuid) {

        var url = App.config.apiEndPoint + '/files/' + binaryResource.fullName + '?';

        if (uuid) {
            url += 'uuid=' + encodeURIComponent(uuid) + '&';
        }

        return url + 'fileName=' + encodeURIComponent(binaryResource.fullName);

    }

    function getFileName(url) {
        return url.substr(url.lastIndexOf('/') + 1).toLowerCase();
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

    function getBinaryEmbeddableUrl(binaryResource, uuid) {
        var url = getBinaryDownloadUrl(binaryResource, uuid);

        if (localStorage.jwt) {
            url += '&jwtToken=' + localStorage.jwt;
        }

        return url;
    }

    return {
        getBinaryDownloadUrl: getBinaryDownloadUrl,
        getBinaryEmbeddableUrl: getBinaryEmbeddableUrl,
        getFileName: getFileName,
        getExtension: getExtension,
        generateViewerHash: generateViewerHash

    };
});
