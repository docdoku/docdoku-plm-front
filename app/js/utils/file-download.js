/*global jQuery,App*/
define(function () {
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
        //xhr.setRequestHeader('x-accept-encoding', 'identity');
        xhr.responseType = 'blob';
        xhr.send();
        return xhr;
    }

    function bindXhr(xhr, $parent) {

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

        $el.find('.download-status').html(App.config.i18n.PREPARING_DOWNLOAD);

        xhr.onprogress = function (e) {
            var uncompressedArchiveSize = xhr.getResponseHeader('x-archive-content-length');
            if (e.lengthComputable) {
                var percentComplete = e.loaded / e.total;
                var value = Math.round(100 * percentComplete);
                $downloadStatus.html(App.config.i18n.DOWNLOADING);
                $fileSize.html(bytesToSize(e.total));
                $filePercentage.html(value + '%');
                $progress.show();
                $bar.width(value + '%');
            } else {
                if (uncompressedArchiveSize) {
                    $downloadStatus.html(App.config.i18n.COMPRESSING);
                    $fileSize.html(App.config.i18n.UNCOMPRESSED_SIZE + bytesToSize(uncompressedArchiveSize));
                } else {
                    $downloadStatus.html(App.config.i18n.DOWNLOADING_COMPRESSED_CONTENT);
                    $fileSize.html(App.config.i18n.UNKNOWN_FILE_SIZE);
                }
                $filePercentage.html(bytesToSize(e.loaded));
                $progress.hide();
            }
        };

        $el.click(function () {
            $(this).remove();
        });

        $parent.append($el);
    }

    (function ($) {
        $(document).on('click', '[data-file-download]', function (e) {
            var $link = $(this);
            var output = $link.attr('data-file-download-output') || '';
            var xhr = saveFile($link.attr('data-file-download'), output);
            bindXhr(xhr, $link.parent());
            e.preventDefault();
            return false;
        });
    })(jQuery);

    return {
        bytesToSize: bytesToSize,
        extractFileName: extractFileName,
        bindXhr: bindXhr
    };


});


