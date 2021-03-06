doverjs
---
Find unused css selectors from your style-sheet files to the specified HTML URI
## Why doverjs ?
> DoverJS --- Simple, Convenient, Effective; Base on Nodejs; Could find unused selector from DHTML <br />
> Support Pseudo-classes, DOM Inserted <br />
> 简单、易用、有效，基于NodeJS，提供命令行工具与nodejs模块<br />
> 支持由JS改变DOM导致的选择器变换、支持伪类选择器的匹配


## Installation

Using npm:
```
 npm install -g doverjs
```

## Use case

##### style.css
```css
body {}
.btn {}
.unknow {}
#main div {}
.other a {}
```

##### index.html
```html
<html>
<head></head>
<body>
<div class="btn"></div>
<div id="main">
    <div></div>
</div>
</body>
</html>
```

> How to find the unused selectors __.unknow__  __.other a__ for __index.html__  from __style.css__ ? <br />
> 对于__index.html__，__style.css__ 中的 __.unknow__  __.other a__ 的样式没被用到，怎样自动检查出来呢？

##### Let's try doverjs (试试doverjs)：

Use in command line (在命令终端使用)
```
doverjs -s style.css -d index.html -c
```

Use in nodejs app (在nodejs代码中使用)

case : find the unused selectors
```javascript
var dover = require('doverjs');
dover.cover({style:'style.css', html:'index.html'}, function (resp) {
    //resp.....
});
```

case : find and remove the unused selectors
或者把没用的删除了
```javascript
dover.remove({style:'style.css', html:'index.html'}, function (resp) {
    //resp.....
});
```
    
#### Helping : 

    
      Usage: doverjs [options] <file ...>
    
      Options:
      
        -h, --help                 output usage information             (使用说明)
        -V, --version              output the version number            (版本信息)
        -c, --console              print process result in console      (在命令行窗口输出处理结果)
        -d, --destination <files>  destination file <file, file, ...>   (指定要检查的HTML文件,可以是远程文件)
        -j, --json <file>          using json config file               (使用JSON文件配置来批量处理)
        -o, --output <file>        Output result                        (输出结果到指定文件)
        -S, --statistics           print statistics in console          (输出统计信息)
        -s, --style <files>        covering style-sheet file <file, file, ...>(指定要检查无用规则的样式文件,可以是远程文件)

#### Usage :
    
*    Usage one :<br />
        `doverjs -s xxx.css -d http://slider.jitsu.com -o out`
*    Usage two :<br />
        `doverjs -j package.js`
*    Console process result :<br />
        `doverjs -j package.js -c`<br />
    ![process result](https://raw.github.com/switer/resource/master/process_result.png)
*    Console statistics result :<br />
        `doverjs -j package.js -S`<br />
    ![process result](https://raw.github.com/switer/resource/master/statistics.png)

    
#### Multiple Cover use configuration files （批量覆盖的配置文件 ）:

```javascript
//e.g example/package.js
{
    style : 'xxx.css', /* multiple style-sheet file: style : ["xxx.css",'aaa.css'] */
    html : [
        /*Add www to the URL , avoid URL Not Found(被检查的网址,远程文件请加上"http://"否则识别为本地文件); 
        "http://baidu.com"无法解读时，请加上www("http://www.baidu.com")*/
        //@One
        "http://github.com/switer/imper",
        //@One
        "http://github.com/switer/DoverJS",
        //@Multiple
        {
            //Mutiple html url
            //可以用于url + hash的形式 prefix +　suffix
            "prefix" : "http://localhost:3000/", //网址前缀
            "suffix" : ["index.html","#","path/file.js"] //网址后缀
            /**yield:
            *       http://localhost:3000/index.html,
            *       http://localhost:3000/#,
            *       http://localhost:3000/path/file.js,
            **/
        }
    ]
}

```

### API Reference
假如你在npm中安装了doverjs，你可以在nodejs的应用中这样使用：

    var dover = require('doverjs');

检查不被使用的样式示例：
```
    dover.cover(
            /**
            *  params
            *  style与html的值可以为数组，如{style:['xxx.css'], html:['x1.com','x2.com']}
            **/
            //远程链接资源地址必须以http或https开头 //必要参数
            {
                //要检查的样式文件
                style:'xxx.css',  //必要参数
                //检查的目标页面uri //必要参数
                html:'http://www.baidu.com'
            }, 
            //success callback //必要参数
            function (resp) {
                /*
                resp是一个数组，格式如下：
                resp = [
                            {
                                uri : String, //资源地址-来自参数的style 属性
                                results : { 
                                	"unused" 	: Arrray<String>,//unused selectors 样式文件中不被使用的选择器
                                	"used" 		: Arrray<String>,//used selectors 已使用的选择器
                                	"errors" 	: Arrray<String>//error match selectors 匹配错误的选择器
                                },
                                outputs : { //outputs
                                	"stdout" 		: String, //命令终端输出的样式文件解析结果，带颜色格式
                                	"log" 			: String, //命令终端输出的统计结构，带颜色格式
                                	"statistics" 	: String//输出的结果（stdout + statistics），无颜色格式
                                }
                            },
                            {
                                //Others ...
                            }
                        ]
                */
            },
            //error callback //可选参数
            function (err) {
                    
            }
    );
```

删除不被使用的样式示例：

```
    dover.remove(
            {
                //要检查的样式文件uri
                style:'xxx.css',  //必要参数
                //检查的目标页面uri //必要参数
                html:'http://www.baidu.com'
            }, 
            //success callback //必要参数
            function (resp) {
                /*
                resp是一个数组，格式如下：
                resp = [
                            {
                                uri : String, //资源地址-来自参数的style 属性
                                results : { 
                                    "unused" 	: Arrray<String>,//unused selectors 样式文件中不被使用的选择器
                                	"used" 		: Arrray<String>,//used selectors 已使用的选择器
                                	"errors" 	: Arrray<String>//error match selectors 匹配错误的选择器
                                },
                                content : String //删除不被使用的CSS样式后的文件内容
                            },
                            {
                                //Others ...
                            }
                        ]
                */
            },
            //error callback //可选参数
            function (err) {}
    );
```

## Subsequent Optimized Point

*   大样式文件导致的报错(`Compeleted @0.1.1`)
*   支持HTTPS 资源(`Compeleted @0.1.1`)
*   windows下，带空格文件路径导致无法运行(`Compeleted @0.1.2`)
*   优化package配置文件的解析，配置文件可以使用单引号与注释(`Compeleted @0.1.4`)
*   支持Linux，Mac(`Compeleted @0.1.4`)
*   命令窗口的输出内容可选项化(`Compeleted @0.1.4`)
*   `@media`选择器提取与忽略`@keyframes`选择器(`Compeleted @2.0.0`)
*   支持API Reference(`Compeleted @2.0.0`)
*   增加remove API(`Compeleted @2.0.0`)
*   批量处理配置文件的语法解析优化
*   自动删除功能
*   复合样式文件导致的执行时间长优化

## Support
 如果图片看不见，怎么办？？囧。github的raw被墙了
  &lt;guankaishe@gmail.com&gt;


    
