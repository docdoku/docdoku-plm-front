/*global jQuery*/
(function ($) {

    'use strict';

    function extractFileName(url) {
        if (url && url.indexOf('/') !== -1) {
            url = url.substr(url.lastIndexOf('/') + 1, url.length);
        }
        if (url.indexOf('?') !== -1) {
            url = url.substr(0, url.indexOf('?'));
        }
        return url;
    }

    function triggerDownload(file, fileName, contentType, outputExtension) {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(file, {
            type: contentType
        });
        a.download = fileName + outputExtension;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function saveFile(url, outputExtension) {

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var headers = xhr.getAllResponseHeaders();
                triggerDownload(xhr.response, extractFileName(url), headers['Content-Type'], outputExtension);
            }
        };

        xhr.open('GET', url);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.responseType = 'blob';
        xhr.send();

    }

    $(document).on('click', '[data-file-download]', function (e) {
        var output = $(this).attr('data-file-download-output') || '';
        saveFile($(this).attr('data-file-download'), output);
        e.preventDefault();
        return false;
    });

})(jQuery);
