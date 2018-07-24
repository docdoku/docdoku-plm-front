String.prototype.replaceUrl = function () {
	'use strict';
    var exp = /(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig;
    return this.replace(exp, '<a href="$1" target="_blank">$1</a>');
};

String.prototype.nl2br = function () {
	'use strict';
    return this.replace(/\n/g, '<br/>');
};

String.prototype.startsWith = String.prototype.startsWith || function(search, pos) {
    'use strict';
    return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
};

