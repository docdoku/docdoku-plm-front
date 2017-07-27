/*global jQuery*/
(function ($) {

    'use strict';

    function bytesToSize(bytes) {
        var sizes = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

        if (bytes === 0) {
            return 'n/a';
        }

        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

        if (i === 0) {
            return (bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        }

        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    }

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

    function saveFile($link, url, outputExtension) {


        var xhr = new XMLHttpRequest();

        var uncompressedArchiveSize;

        xhr.onreadystatechange = function () {

            if (xhr.readyState === 2) {
                uncompressedArchiveSize = xhr.getResponseHeader('x-archive-content-length');
            }

            if (xhr.readyState === 4 && xhr.status === 200) {
                var headers = xhr.getAllResponseHeaders();
                triggerDownload(xhr.response, extractFileName(url), headers['Content-Type'], outputExtension);
            }
        };

        xhr.open('GET', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        //xhr.setRequestHeader('x-accept-encoding', 'identity');

        xhr.responseType = 'blob';

        var $el = $('<div class="file-loading-view">' +
            '<span class="download-status"></span>' +
            '<span class="file-percentage"></span> ' +
            '<span class="file-size"></span>' +
            '<div class="progress progress-striped"><div class="bar"></div></div>' +
            '</div>');

        var $progress = $el.find('.progress');
        var $bar = $el.find('.bar');

        var $downloadStatus = $el.find('.download-status');
        var $fileSize = $el.find('.file-size');
        var $filePercentage = $el.find('.file-percentage');

        $el.find('.download-status').html('Preparing download...');

        xhr.onprogress = function (e) {
            if (e.lengthComputable) {
                var percentComplete = e.loaded / e.total;
                var value = Math.round(100 * percentComplete);
                $downloadStatus.html('Downloading...');
                $fileSize.html(bytesToSize(e.total));
                $filePercentage.html(value + '%');
                $progress.show();
                $bar.width(value + '%');
            } else {
                if (uncompressedArchiveSize !== undefined) {
                    $downloadStatus.html('Compressing...');
                    $fileSize.html('Uncompressed size:' + bytesToSize(uncompressedArchiveSize));
                } else {
                    $downloadStatus.html('Downloading compressed content...');
                    $fileSize.html('File size unknown');
                }
                $filePercentage.html(bytesToSize(e.loaded));
                $progress.hide();
            }
        };

        $el.click(function () {
            $(this).remove();
        });

        $link.parent().append($el);
        xhr.send();
    }

    $(document).on('click', '[data-file-download]', function (e) {
        var $link = $(this);
        var output = $link.attr('data-file-download-output') || '';
        saveFile($link, $link.attr('data-file-download'), output);
        e.preventDefault();
        return false;
    });

})(jQuery);
