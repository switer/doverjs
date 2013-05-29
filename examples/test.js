var dover = require('doverjs');
dover.remove({
	html : "http://www.baidu.com",
	style : ["cv_style.css"]
}, function (resp) {
	console.log(resp)
}, function (err) {
	console.log(err);
});