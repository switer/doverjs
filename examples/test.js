var dover = require('doverjs');
dover.cover({
	html : "http://www.baidu.com",
	style : "cv_style.css"
}, function (results, outputs) {
	console.log(results)
}, function (err) {
	console.log(err);
});