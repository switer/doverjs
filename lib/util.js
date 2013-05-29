var REGEXES = {URI_REGEX : /^http(?=):\/\/|^https:\/\/|^file:\/\/|^[a-zA-Z]:\/|^\//},
	fileMaps = {};

function encode (str) {
	return str.replace(/\*/g, '\\*')
			.replace(/\+/g, '\\*')
			.replace(/\-/g, '\\-')
			.replace(/\(/g, '\\(')
			.replace(/\)/g, '\\)')
			.replace(/\?/g, '\\?')
			.replace(/\[/g, '\\[')
			.replace(/\]/g, '\\]')
			.replace(/\}/g, '\\}')
			.replace(/\{/g, '\\{')
			.replace(/\$/g, '\\$')
			.replace(/\^/g, '\\^')
			.replace(/\!/g, '\\!')
}
function populateLocalURL (uris, path, isEncoding) {
	var pUrlArray = [],
		urlArray = [],
		uri;
	if ( typeof uris === 'string') urlArray.push(uris);
	else urlArray = uris;
	for (var i = 0; i < urlArray.length ; i ++) {
		/**
		*	http:// | https:// | file:// | A:/ | (linux root /)
		**/
		if (!urlArray[i].match(REGEXES.URI_REGEX)) {
			uri = path.replace(/\/$/, '') + '/' + urlArray[i];
			isEncoding && (uri = encodeURIComponent(uri));
			pUrlArray.push( uri );

		} else {
			uri = isEncoding ? encodeURIComponent(urlArray[i]) : urlArray[i];
			pUrlArray.push( uri );
		}
		fileMaps[uri] = urlArray[i];
	}
	return pUrlArray;
}

function getFileMap () {
	return fileMaps;
}

exports.encode = encode;
exports.populateLocalURL = populateLocalURL;
exports.getFileMap = getFileMap;