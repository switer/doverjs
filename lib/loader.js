/*
*	@author switer
*/
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
	URI_MATCHED_REGEX = /^http:\/\/|^https:\/\//;
function loadResource (uris, callback) {
	var ruleSetArray = [];
	if (typeof uris === 'string') {
		_loadStyleContent(uris, function (content) {
			callback([{
				"uri" : uris,
				"content" : content
			}]);
		});
	} else {
		var count = 0;
		for (var i = 0, len = uris.length; i < len ; i ++ ) {

			(function (uri, index) {
				_loadStyleContent(uri, function (content) {
					count ++ ;
					ruleSetArray.push({
						"uri" : uri,
						"content" : content
						});
					if ( count >= len ) callback(ruleSetArray);
				})
			})(uris[i], i)
		}
	}
}
function _loadStyleContent (uri, callback) {
	//Http resource
	var content = '';
	if (uri.match(URI_MATCHED_REGEX)) {
		var protocal = URI_MATCHED_REGEX.match(/^https:\/\//) ? https : http;
		protocal.get(uri, function(res) {
			if (res.statusCode == 200) {
				res.on('data', function (buffer) {
				  	content += buffer.toString();
				});
				res.on('end', function () {
					callback(content);
				})
			}
		})
	}
	//Local File System Resource
	else {
		content = fs.readFileSync(uri, 'UTF-8');
		callback(content);
	}
}
exports.loadResource = loadResource;
