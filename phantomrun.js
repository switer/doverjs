
var cp = require('child_process'),
	program = require('commander'),
	colors = require('colors'),
	fs = require('fs'),
	parser = require('./lib/css_parser'),
	loader = require('./lib/loader'),
	_ = require('./lib/underscore-min.js');

var	HTML_TEMP_URI = 'http://localhost:3013/temp/',
	HTML_TEMP_FILE_PREFIX = 'run_result_',
	HTML_TEMP_FILE_SUFFIX = '.html',
	DEADWEIGHT_LIB_PATH = './deadweight/bin/deadweight',
	CAPTURE_HTML_SCRIPT = './lib/coverhtml.js',
	SELECTOR_TEMP_FILE =  'doverjs_temp_file',
	JSON_TEMP_FILE = 'doverjs_temp_out.json';

var	args = process.argv.slice(2),
	optionType = args.shift(),
	localPath  = decodeURIComponent(args.shift()).replace(/^\'/,'').replace(/\'$/,''),
	params;

program
  .usage('[options]')
  .option('-c, --console', 'Console process result')
  .option('-j, --json','covering method is JSON configure')
  .option('-s, --source','covering method is Source URI')
  .option('-S, --statistics','Console statistics result')
  .parse(decodeURIComponent(optionType.replace(/\,/g, '-')).split(' '));
var REGEXES  = {
		URI_REGEX : /^http(?=):\/\/|^https:\/\/|^file:\/\/|^[a-zA-Z]:\/|^\//
	};
this.config = {
	OPTION_TYPE : {
		JSON : 'json',
		SOURCE : 'source'
	}
}

if (program.json) {
	var packageJsName = decodeURIComponent(args.shift())
	try {
		var params = JSON.parse(_readPackgeFile(localPath + '\\' + packageJsName));
		params.html  = _populateLocalURL(_readHTMLPropertiesAsArray(params.html), localPath, true)
		params.style = _populateLocalURL(params.style, localPath);

	} catch (e) {
		console.log('Read configure file Error ! Please check it exist or not, or format error !'.red);
		throw e;
	}
} else if (program.source) {
	params = {}
	var cssParams = decodeURIComponent(args.shift()).split(','),
		htmlParams   = decodeURIComponent(args.shift()).split(',');
	params.html  = _populateLocalURL(htmlParams, localPath, true)
	params.style = _populateLocalURL(cssParams, localPath)
}
var outputFile = args.shift();
if (outputFile === 'undefined') outputFile = null;
outputFile && (outputFile = decodeURIComponent(outputFile));
process.chdir(__dirname);
var that = this;


/**
*	runing initialize
**/

function _initialize () {
	that.isServerStart = false;
}
function _start () {
	var htmls = params.html
		, styles = params["style"]
		, stylesopts = ' -s ' + styles.join(' -s ');
	var styleContent = loader.loadResource(styles, function (data) {
		if (data) {
			// var styleRules = parser.parseAll(data, true);
				// styleRuleParam = styleRules.join(',');
			_captureHTMLWhithArray(htmls, data, function (stdout, logOut, statisticsOut) {
				program.console && console.log(stdout);
				program.statistics && console.log(statisticsOut);
				if (outputFile) {
					fs.writeFileSync(localPath + '\\' + outputFile, logOut, 'UTF-8');
				}
				console.log('Cover Compeleted ! ' + (outputFile ? 'Logged on ' + outputFile : ''));
			});
		}
	});
}
/**
*	read file's html propertice
**/
function _readHTMLPropertiesAsArray (htmls) {
	var arr = [];
	var htmlUrl;
	for (var i = 0; i < htmls.length ; i++ ) {
		htmlUrl = htmls[i];
		if ( typeof htmlUrl !== 'string' && (htmlUrl instanceof Object)) {
			for (var j = 0; j < htmlUrl['suffix'].length; j ++) {
				arr.push(htmlUrl['prefix'] + htmlUrl['suffix'][j]);
			}
		} else if (typeof htmlUrl === 'string') {
			arr.push(htmlUrl);
		} else {
			throw new Error('Unknow URL Collection error !');
		}
	}
	return arr;
}
/**
*	start a http server for execute deadweight
**/
function _startHTTPServer (callback) {
	var proc = cp.spawn('node', ["app.js"]);
	proc.stdout.on('data', function (data) {
	  if (!that.isServerStart) {
	  	console.log('Http Server : '.cyan + data);
	  	that.isServerStart = true;
		callback && callback();
	  }
	});

	proc.stderr.on('data', function (data) {
	  console.log('stderr: ' + data);
	});

	proc.on('exit', function (code) {
	  console.log('Exit Http Server...');
	});
	//记住该服务进程
	that._serverPid = proc.pid;
}
/**
*	Covering...Find verbose selector
**/
function _deadweightStyle (styles, htmls, deadweightCallback) {
	// process.chdir(localPath);
	cmd = 'ruby ' + DEADWEIGHT_LIB_PATH + styles + ' ' + htmls + ' -o ' + localPath + '/' + outputFile
	cp.exec('ruby ' + DEADWEIGHT_LIB_PATH + styles + ' ' + htmls + ' -o ' + localPath + '/' + outputFile, function (err, stdout,stderr) {
		console.log('Covered result in : ' + outputFile.grey);
		err && console.log(err);
		console.log(stdout);
		console.log(stderr);
		deadweightCallback && deadweightCallback(err);
	});
}

function _captureHTMLWhithArray (htmls, styles, callback) {
	var cmd;
	var stylesStr, styleArr = [];
	//TODO optm
	// for(var ind = 0; ind < styles.length; ind ++) {
	// 	console.log(parser.parse(styles[ind]["content"], true).join(','));
	// 	stylesStr = encodeURIComponent(styles[ind]['uri']) + '{' + parser.parse(styles[ind]["content"], true).join(',');
	// 	styleArr.push(stylesStr);
	// }
	// console.log(styleArr.join('['));
	for ( var s = 0; s < styles.length ; s ++ ) {
		var styleRules = styles[s];
		//@param <html1 html2 ...> TODO<encode:uri{encode:sel1,encode:sel2,...]encode:uri{encode:sel1,...>
		fs.writeFileSync(localPath + '/' + SELECTOR_TEMP_FILE, parser.parse(styleRules["content"], true).join(','), 'UTF-8');

		cmd = 'phantomjs ' + CAPTURE_HTML_SCRIPT + ' ' + htmls.join(' ') + ' ' + encodeURIComponent(localPath + '/');
		cp.exec(cmd, function (err, stdout,stderr) {
			err && console.log(err);
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

				callback(output, logOutPut, statisticsOut);
			} catch (e) {
				console.log("Result JSON Object Parsing ERROR ! Something  goes wrond, Contact me(guankaishe@gmail.com)");
				console.log(e);
			}
		});
	}

}
function _populateLocalURL (urlArray, path, isEncoding) {
	var pUrlArray = [];
	var uri;
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
	}
	return pUrlArray;
}

function _readPackgeFile (path) {
	var content =  fs.readFileSync(path, 'UTF-8');
  return content;
}
_start();