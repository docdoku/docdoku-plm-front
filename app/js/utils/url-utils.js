define(function(){
    'use strict';
    return {
        getParameterByName:function(name) {
            var url = window.location.href;
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
            if (!results) {
                return null;
            }
            if (!results[2]){
                return '';
            }
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        },

        base64urlEncode:function(str) {
            // Encode in classical base64
            // for more details, please see https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
            var encodedString = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16))
    }))
            // Remove padding equal characters
            encodedString = encodedString.replace(/=+$/, '');

            // Replace characters according to base64url specifications
            encodedString = encodedString.replace(/\+/g, '-');
            encodedString = encodedString.replace(/\//g, '_');

            return encodedString;
        },

    };

});
