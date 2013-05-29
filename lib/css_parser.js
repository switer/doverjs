/*
* @author switer
*/
/**
* remove usless tuple
**/
function _removeEmpty (cssCtn) {
    var selectors = [];
    for (var i = 0, len = cssCtn.length; i < len; i ++ ) {
      //remove blank space tuple
      var rule = cssCtn[i].trim();
      if (rule.length !== 0) {
        selectors.push(rule);
      }
    }
    return selectors;
}
/**
* remove usless tuple and encode
**/
function _removeEmptyAndEncode(cssCtn) {
    var selectors = []
    for (var i = 0, len = cssCtn.length; i < len; i ++ ) {
      //remove blank space tuple and encode
      var rule = cssCtn[i].trim();
      if (rule.length !== 0) {
        selectors.push( encodeURIComponent(rule));
      }
    }
    return selectors;
}
function exec_parse (cssCtn, encoding) {
    var selectors = [];
    /*remove empty comment*/
    cssCtn = cssCtn.replace(/\/\*\*\//g,'')
          /*remove normal comment*/
          .replace(/\/\*[\s\S]+?\*\//g, '')
          /*remove <!----> comment*/
          .replace(/\<\!\-\-|\-\-\>/g,'')
          /*remove line-break chars*/
          .replace(/\n/g,'')
          /*remove return chars*/
          .replace(/\r/g,'')
          /*remove keyframes*/
          .replace(/\@[a-zA-Z\-]*keyframes[^\{\}]*\{(((?!\}\s*\}).)*\}\s*\}|\s*\})/g, '')
          /*remove empty @media selector*/
          .replace(/\@media[^\{\}]*\{\s*\}/g, '')
          /*trim space*/
          .trim();
    /*extract @media selector no include empty*/
    var mediaArr = cssCtn.match(/\@media[^\{\}]*\{((?!\}\s*\}).)*\}\s*\}/g);
    for (var i = 0, len = mediaArr ? mediaArr.length : 0; i < len; i ++ ) {
        var mediaStr = mediaArr[i];
        //删除该media域
        cssCtn = cssCtn.replace(mediaStr, '');
        //提取media域中的选择器
        mediaStr = mediaStr.replace(/\@media[^\{\}]*\{/g, '').replace(/[^\}\{]*\}$/g, '');
        //将media域中的选择器插进样式文件表
        cssCtn += mediaStr;
    }
    /*Selectors division*/
    cssCtn = cssCtn.split(/{[^\{\}]*}/);
    //Iterate useless tuple
    if (encoding) selectors = _removeEmptyAndEncode(cssCtn);
    else selectors = _removeEmpty(cssCtn);
    return selectors;
}
exports.parse = exec_parse;

