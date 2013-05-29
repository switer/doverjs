var parser = require('../lib/parser.js');
var localPath  = process.cwd().replace(/^\'/,'').replace(/\'$/,'');
function cover(params, success, error) {
	parser.cover(params, localPath, success, error)
}
exports.cover = cover;