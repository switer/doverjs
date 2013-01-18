/**
*	Capturing URL's HTML Content
*	@author switer
*   @notice console log here will be takes error
*/
var args 	= require('system').args,
	count 	= 0;
var styleString = args[args.length - 1],
	//TODO <encode:uri{encode:sel1,encode:sel2,...]encode:uri{encode:sel1,...>
	styleRuleSet = styleString.split(',');
	// Console log a JSON Object
	console.log('[');
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
				console.log('{"url" : "' + encodeURIComponent(url) + '",');
				console.log('"status":"' + status + '",');
				console.log('"total":"' + matches.total + '",');
				console.log('"matchedLen":"' +matches.matched.length + '",');
				console.log('"matched":"' + encodeURIComponent(matches.matched.join('\n'))  + '",');
				console.log('"unMatchedLen":"' + matches.unMatched.length + '",');
				console.log('"unMatched":"' + encodeURIComponent(matches.unMatched.join('\n')) + '",');
				console.log('"errorMatchedLen":"' + matches.errorMatched.length + '",');
				console.log('"errorMatched":"' + encodeURIComponent(matches.errorMatched.join('\n')) + '"}');
				count ++ ;
				if (count < len - 1) {
					console.log(',');
				}
				else {
					console.log(']');
					phantom.exit();
				}
			})
		})(i, args[i]);
	}
}

