var _ 			= require('./underscore-min.js'),
	cssParser 	= require('./css_parser'),
	loader 		= require('./loader'),
	util 		= require('./util'),
	cp 			= require('child_process'),
	fs 			= require('fs'),
	colors 		= require('colors');

var SELECTOR_TEMP_FILE 		= 'doverjs_temp_file',
	CAPTURE_HTML_SCRIPT 	= '"' +__dirname + '"/coverhtml.js',
	JSON_TEMP_FILE 			= 'doverjs_temp_out.json';


function cover (params, localPath, callback, errorcallback) {
	var htmls = util.populateLocalURL(params.html, localPath, true)
		, styles = util.populateLocalURL(params.style, localPath);

	loader.loadResource(styles, function (data) {
		data && run(htmls, data, localPath, callback, errorcallback);
	}, errorcallback);
}

function run (htmls, styles, localPath, callback, errorcallback) {
	var cmd;
	var stylesStr, styleArr = [],
		coverResults = [],
		index = 0;
	function runOnce(styleRules) {
		
		//if not styleRules, stop runing
		if (!styleRules) {
			callback(coverResults);
			return;
		}
		//@param <html1 html2 ...> TODO<encode:uri{encode:sel1,encode:sel2,...]encode:uri{encode:sel1,...>
		fs.writeFileSync(localPath + '/' + SELECTOR_TEMP_FILE, cssParser.parse(styleRules["content"], true).join(','), 'UTF-8');

		cmd = 'phantomjs ' + CAPTURE_HTML_SCRIPT + ' ' + htmls.join(' ') + ' ' + encodeURIComponent(localPath + '/');
		
		cp.exec(cmd, function (err, stdout,stderr) {

			err && console.log(err);
			if (err) {
				errorcallback && errorcallback(err);
				return;
			}
			console.log(stderr);

			var outJSON = fs.readFileSync( localPath + '/' + JSON_TEMP_FILE, 'UTF-8');			
				fs.unlinkSync( localPath + '/' + JSON_TEMP_FILE );
			var output = '',
				logOutPut = "",
				statisticsOut = "",
				unusedArray = [];
				usedArray = [];
				errorArray = [];
			try {
				var results = JSON.parse(outJSON);
				output += ('/*Covering ' + styleRules["uri"]).cyan + '*/\n';
				logOutPut += '/*Covering ' + styleRules["uri"] + '*/\n';
				for (var i = 0, len = results.length; i < len; i ++ ) {
					var result = results[i];
					output += '\n';
					output += ('/*Parsing Url ' + decodeURIComponent(result['url'])).bold + '*/\n';
					output += '/*found ' + result['matchedLen'].yellow + ' used selectors out of ' + new String(result['total']).yellow + '*/\n';
					output += decodeURIComponent(result['matched']).green + '\n';
					output += '/*found ' + result['unMatchedLen'].yellow + ' unused selectors out of ' + new String(result['total']).yellow + ' total' + '*/\n';
					output += decodeURIComponent(result['unMatched']).magenta + '\n';
					output += '/*parsed ' + result['errorMatchedLen'].yellow + ' error selectors out of ' + new String(result['total']).yellow + ' total' + '*/\n';
					output += decodeURIComponent(result['errorMatched']).red ;

					logOutPut += '\n';
					logOutPut += '/*Parsing Url ' + decodeURIComponent(result['url']) + '*/\n';
					logOutPut += '/*found ' + result['matchedLen'] + ' used selectors out of ' + result['total'] + '*/\n';
					logOutPut += decodeURIComponent(result['matched']) + '\n';
					logOutPut += '/*found ' + result['unMatchedLen'] + ' unused selectors out of ' + result['total'] + ' total*/' + '\n';
					logOutPut += decodeURIComponent(result['unMatched']) + '\n';
					logOutPut += '/*parsed ' + result['errorMatchedLen'] + ' error selectors out of ' + result['total'] + ' total*/' + '\n';
					logOutPut += decodeURIComponent(result['errorMatched']) ;

					result['unMatched'].length !== 0 && unusedArray.push(decodeURIComponent(result['unMatched']).split('\n'));
					result['matched'].length !== 0 && usedArray.push(decodeURIComponent(result['matched']).split('\n'));
					result['errorMatched'].length !== 0 && errorArray.push(decodeURIComponent(result['errorMatched']).split('\n'));
				}
				var unusedSels = _.union.apply(this, unusedArray);
					usedSels = _.union.apply(this, usedArray);
					errorSels = _.union.apply(this, errorArray);
					
					unusedLen = unusedSels.length,
					usedLen = usedSels.length,
					errorLen = errorSels.length,
					totalLen = unusedLen + usedLen + errorLen;
					statisticsOut += '\n\n/*Parsing result Count :*/ \n'.blue;
					statisticsOut += '/*Found ' + (new String (unusedLen)).yellow + ' unused'.magenta + ' selectors*/ \n' + 
								unusedSels.join('\n').magenta + '\n' + 
								'/*Found ' + (new String (usedLen)).yellow + ' used'.green + ' selectors*/ \n' + 
								usedSels.join('\n').green + '\n' + 
								'/*Parsing ' + (new String (errorLen)).yellow + ' error'.red + ' selectors*/ \n' +
								errorSels.join('\n').red + '\n' + 
								'/*Total'.yellow + ' selectors : ' + (new String (totalLen)).yellow + '*/';

					logOutPut += '\n/*Parsing result Count : \n';
					logOutPut += '/*Found ' + unusedLen + ' unused selectors*/ \n' + 
								unusedSels.join('\n') + '\n' + 
								'/*Found ' + usedLen + ' used selectors*/ \n' + 
								usedSels.join('\n') + '\n' + 
								'/*Parsing ' + errorLen + ' error selectors*/\n' +
								errorSels.join('\n') + '\n' + 
								'/*total selectors : ' + totalLen + '*/';

				coverResults.push({
					uri : util.getFileMap()[styleRules.uri] || styleRules.uri,
					results : { //results
						"unused" 	: unusedSels,
						"used" 		: usedSels,
						"errors" 	: errorSels
					},
					outputs : { //outputs
						"stdout" 		: output, 
						"log" 			: logOutPut, 
						"statistics" 	: statisticsOut
					}
				})

			} catch (e) {
				if (errorcallback) {
					errorcallback(new Error("Result JSON Object Parsing ERROR ! Something  goes wrond, Contact me(guankaishe@gmail.com)"));
				} else {
					console.log(e);
					console.log("Result JSON Object Parsing ERROR ! Something  goes wrond, Contact me(guankaishe@gmail.com)".red);
				}
				return;
			}
			//递归
			runOnce(styles.shift());
		});
	}
	runOnce(styles.shift())
}
exports.run = run;
exports.cover = cover;