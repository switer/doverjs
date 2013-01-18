#DoverJS
========
Csscover without deadweight，pure JS——Found unused selector from your style-sheet files
## Why DoverJS ?
> DoverJS 简单，移动，纯爷们，纯JS，无混合Ruby
> 支持的动态脚本改变DOM的选择器匹配，伪类的匹配

##Use case

- 检查样式文件在制定页面的冗余style-rules

##How to use
---
###使用它比Csscover简单多了###

*   Install [node](http://nodejs.org).
*   No Ruby.
*   No Deadweight.

Install it in npm :

    npm install doverjs -g
    
usage : 

    
      Usage: doverjs [options] <file ...>
    
      Options:
    
        -h, --help                 output usage information
        -V, --version              output the version number
        -d, --destination <files>  destination file <file, file, ...>
        -j, --json <file>          using json config file
        -o, --output <file>        Output result
        -s, --style <files>        covering style-sheet file <file, file, ...>
    
    
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

##Support
  &lt;guankaishe@gmail.com&gt;


    
