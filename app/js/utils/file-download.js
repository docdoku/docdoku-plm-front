/*global jQuery*/
(function ($) {

    'use strict';

    function extractFileName(url) {
        if (url && url.indexOf('/') !== -1) {
            return url.substr(url.lastIndexOf('/') + 1, url.length);
        }
        return url;
    }

    function triggerDownload(file, fileName, contentType) {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(file, {
            type: contentType
        });
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function saveFile(url) {

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var headers = xhr.getAllResponseHeaders();
                triggerDownload(xhr.response, extractFileName(url), headers['Content-Type']);
            }
        };

        xhr.open('GET', url);
        xhr.setRequestHeader('Content-Type', 'application/json');

        if (localStorage.jwt) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.jwt);
        }

        xhr.responseType = 'blob';
        xhr.send();

    }

    $(document).on('click', '[data-file-download]', function (e) {
        saveFile($(this).attr('data-file-download'));
        e.preventDefault();
        return false;
    });

})(jQuery);
