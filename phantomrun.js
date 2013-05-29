
var cp 			= require('child_process'),
	program 	= require('commander'),
	colors 		= require('colors'),
	UglifyJS 	= require("uglify-js"),
	fs 			= require('fs'),
	cssParser 	= require('./lib/css_parser'),
	loader 		= require('./lib/loader'),
	ptParser 	= require('./lib/parser'),
	_ 			= require('./lib/underscore-min.js');

var	HTML_TEMP_URI 			= 'http://localhost:3013/temp/',
	HTML_TEMP_FILE_PREFIX 	= 'run_result_',
	HTML_TEMP_FILE_SUFFIX 	= '.html',
	DEADWEIGHT_LIB_PATH 	= './deadweight/bin/deadweight',
	CAPTURE_HTML_SCRIPT 	= './lib/coverhtml.js',
	SELECTOR_TEMP_FILE 		= 'doverjs_temp_file',
	JSON_TEMP_FILE 			= 'doverjs_temp_out.json',
	REGEXES  				= {URI_REGEX : /^http(?=):\/\/|^https:\/\/|^file:\/\/|^[a-zA-Z]:\/|^\//};

var	args = process.argv.slice(2),
	optionType = args.shift(),
	localPath  = decodeURIComponent(args.shift()).replace(/^\'/,'').replace(/\'$/,''),
	params,
	htmlParams,
	cssParams;

//本地配置
this.config = {
	OPTION_TYPE : {
		JSON : 'json',
		SOURCE : 'source'
	}
}

//格式化命令参数
program
  .usage('[options]')
  .option('-j, --json','covering method is JSON configure')
  .option('-c, --console', 'Console process result')
  .option('-s, --source','covering method is Source URI')
  .option('-S, --statistics','Console statistics result')
  .parse(decodeURIComponent(optionType.replace(/\,/g, '-')).split(' '));
  
//填充参数
if (program.json) { //JSON参数格式
	var packageJsName = decodeURIComponent(args.shift())
	try {
		var cmd = UglifyJS.minify(
			"JSON.parse(" + _readPackgeFile(localPath + '\\' + packageJsName) + ")" 
			, {fromString: true}
		);

		var params = eval("(function () { return " + cmd.code.replace(/^JSON\.parse/, '') + '})()');
		params.html = _readHTMLPropertiesAsArray(params.html);

	} catch (e) {
		console.log(e)
		console.log('Read configure file Error ! Please check it exist or not, or format error !'.red);
		return;
	}
} else if (program.source) { //文件URI参数格式
	params = {}
	params.style = decodeURIComponent(args.shift()).split(','),
	params.html   = decodeURIComponent(args.shift()).split(',');
} else {
	console.log('Params error !'.red);
	return;
}

//输出文件地址
var outputFile = args.shift();
if (outputFile === 'undefined') outputFile = null;
outputFile && (outputFile = decodeURIComponent(outputFile));
//切换目录
process.chdir(__dirname);

/**
*	runing initialize
**/
var that = this;
function _initialize () {
	that.isServerStart = false;
}
//启动方法
function _start (params) {

	ptParser.cover(params, localPath, function (results, outputs) {
		var stdout = outputs.stdout, 
			logOut = outputs.log, 
			statisticsOut = outputs.statistics;

		program.console && console.log(stdout);
		program.statistics && console.log(statisticsOut);

		if (outputFile) {
			fs.writeFileSync(localPath + '\\' + outputFile, logOut, 'UTF-8');
		}
		console.log('Cover Compeleted ! ' + (outputFile ? 'Logged on ' + outputFile : ''));
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

function _readPackgeFile (path) {
	var content =  fs.readFileSync(path, 'UTF-8');
  return content;
}
//start runing
_start(params);