/**
*	Capturing URL's HTML Content
*	@author switer
*   @notice console log here will be takes error
*/
var args 	= require('system').args,
	SELECTOR_TEMP_FILE =  'doverjs_temp_file',
	JSON_TEMP_FILE =  'doverjs_temp_out.json';
	fs 	= require('fs');
	count 	= 0;
var cwd = decodeURIComponent(args[args.length - 1]),
	styleString = fs.read(cwd + SELECTOR_TEMP_FILE),
	//TODO <encode:uri{encode:sel1,encode:sel2,...]encode:uri{encode:sel1,...>
	styleRuleSet = styleString.split(',');
	//guo he chai qiao
	fs.remove(cwd + SELECTOR_TEMP_FILE);
	// Console log a JSON Object
	var outJSON = '[';
for (var i = 0, len = args.length - 1; i < len ; i ++) {
	if ( i !== 0) {
		(function (index, url) {
			url = decodeURIComponent(url);		
			var page = require('webpage').create();
				page.settings["localToRemoteUrlAccessEnabled"]  = true;
			page.open(url, function (status) {
				var matches = page.evaluate(function () {
					var matchedSels = [],
						unMatchedSels = [],
						errorMatchedSels = [],
						sel_count = 0;
					var sels = arguments[0];
					var selector;
					for ( var i = 0, len = sels.length; i < len;i ++) {
						selector = decodeURIComponent(sels[i]);
						if (selector !== '') {
							sel_count ++;
							try {
								if (document.querySelector(selector)) {
									matchedSels.push(selector);
								} else {
									unMatchedSels.push(selector);
								}
							} catch (e) {
								errorMatchedSels.push(selector);
							}
						}
					}
					return {
						total : sel_count,
						matched : matchedSels,
						unMatched : unMatchedSels,
						errorMatched :　errorMatchedSels
					}
				}, styleRuleSet);
				//url must encoding
				outJSON += '{"url" : "' + encodeURIComponent(url) + '",';
				outJSON += '"status":"' + status + '",';
				outJSON += '"total":"' + matches.total + '",';
				outJSON += '"matchedLen":"' +matches.matched.length + '",';
				outJSON += '"matched":"' + encodeURIComponent(matches.matched.join('\n'))  + '",';
				outJSON += '"unMatchedLen":"' + matches.unMatched.length + '",';
				outJSON += '"unMatched":"' + encodeURIComponent(matches.unMatched.join('\n')) + '",';
				outJSON += '"errorMatchedLen":"' + matches.errorMatched.length + '",';
				outJSON += '"errorMatched":"' + encodeURIComponent(matches.errorMatched.join('\n')) + '"}';
				count ++ ;
				if (count < len - 1) {
					outJSON += ',';
				}
				else {
					outJSON += ']';
					fs.write(cwd + JSON_TEMP_FILE, outJSON, 'w');
					phantom.exit();
				}
			})
		})(i, args[i]);
	}
}

