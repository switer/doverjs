var parser 	= require('../lib/parser.js'),
	_ 		= require('../lib/underscore-min.js'),
	loader 	= require('../lib/loader.js'),
	util 	= require('../lib/util.js'),
	colors 	= require('color'),
	fs 		= require('fs');


var localPath  = process.cwd().replace(/^\'/,'').replace(/\'$/,''),
	rmfilePrefix = 'dover_';
function cover (params, success, error) {
	parser.cover(params, localPath, success, error)
}

function remove (params, success, error) {
	var count = 0,
		rmFiles = [];
	cover(params, function (resp) {
		for (var i = resp.length - 1; i >= 0; i--) {
			var data = resp[i],
				uri	 = data.uri,
				unusedSels = data.results.unused,
				fullURI = util.populateLocalURL(uri, localPath);

			loader.loadResource(fullURI, function (uriCtns) {
				_.each(uriCtns, function (item) {
					var ctn = item.content,
						fileName = rmfilePrefix + uri;
					_.each(unusedSels, function (sel) {
						ctn = ctn.replace(new RegExp(util.encode(sel) + '\s*\{[^\}\{]*\}', 'g'), '')
					})
					rmFiles.push({
						uri : uri,
						content : ctn,
						results : data.results
					});
					// fs.writeFileSync(fileName, ctn, 'UTF-8');
					// console.log('Remove unused selectors and write file : '.yellow + fileName);
				});
				count ++;
				if (count >= resp.length) {
					// console.log('Remove compelete!'.green)
					success && success(rmFiles);
				}

			}, error);
		};
	}, error)
}
exports.cover = cover;
exports.remove = remove;