#DoverJS
========
Found unused selector from your style-sheet files to the specified HTML URI
## Why DoverJS ?
> DoverJS 简单、易用、有效，基于NodeJS，无混合Ruby, <br />
> 支持的动态脚本改变DOM的选择器匹配、伪类的匹配

##Use case

- 检查样式文件在指定页面的冗余style-rules

##How to use
---
###使用它比Csscover简单多了###

*   Install [node@0.8.x](http://nodejs.org).
*   No Ruby.
*   No Deadweight.

Install it in npm :

    npm install doverjs -g
    
usage : 

    
      Usage: doverjs [options] <file ...>
    
      Options:
    
        -h, --help                 output usage information
        -V, --version              output the version number
        -d, --destination <files>  destination HTML URL <file, file, ...>
        -j, --json <file>          using json config file
        -o, --output <file>        Output result
        -s, --style <files>        covering style-sheet file <file, file, ...>

Easy Use it :
    
*    Usage one :<br />
        `doverjs -s xxx.css -d http://slider.jitsu.com -o out`
*    Usage two :<br />
        `doverjs -j package.js`
    
批量查找的配置文件 :

    //这个是文件配置,使用时把注释去掉，避免JSON解析出错  e.g example/package.js
    {
        //请用 "/双引号 代替 '/单引号
        style : 'xxx.css', /* multiple style-sheet file: style : ["xxx.css",'aaa.css'] */
        html [
            //被检查的网址,远程文件请加上"http://"否则识别为本地文件; 
            //"http://baidu.com"无法解读时，请加上www("http://www.baidu.com")
            "http://sliders.jitsu.com",
            {
                //Mutiple html url
                //可以用于url + hash的形式 prefix +　suffix
                prefix : "http://localhost:3000/", //网址前缀
                suffix : ["index.html","#","path/file.js"] //网址后缀
            }
        ]
    }
##Subsequent Optimized Point

*   大样式文件导致的报错
*   复合样式文件导致的执行时间长优化
*   命令窗口的输出可控
*   支持Linux，Mac

##Support
  &lt;guankaishe@gmail.com&gt;


    
