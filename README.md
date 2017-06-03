# vue-rap-mock

> A Vue.js rap mcok project

## 背景
在公司开发的移动端项目中主要是使用了前后端分离开发方式，这自然就避免不了要调式接口，说到调式接口自然而然就是上mock啦，但是直接让后端程序员直接去写mock配置这并不是一个有效的方式，所以经过调研最终选择了淘宝开发的RAP可视化接口管理工具，这个工具对于后端比较友好，可以像建表一样直接添加接口对应的字段和设置类型，然后前端在根据需求补充对应的mock配置。是一个提高效率的好工具！
[RAP官方地址](http://rapapi.org/platform/home.do)
## RAP插件
官方一共提供了插件用以拦劫请求的接口
1、<script src="http://rap.tounick.com/rap.plugin.js?projectId=项目ID"></script>这个地址可通过配置获取。
2、AngularJS版本插件 ng-rap
3、rap-node-plugin
第一个插件必须依赖kissy或者jQuery，而第二个是ng插件，所以只有第三可以使用了！
## 代理配置
我们以vue-cli配置为说明；在vue-cli的config配置里面是可以设置开发环境的代理配置； 如下:
``` config/index.js
    proxyTable: {
        '/api': {
            target: 'http://127.0.0.1:8080', // 代理请求地址
            changeOrigin: true,
            secure: false,
            pathRewrite: {
                '/api': '/api' // 代理地址替换标识
            }
        }
    }
``` 

我们通常要对接不止一个接口，所以可以把这一步份配置提取出来形成一个配置文件，方便维护

``` config/proxy-config.js
    var proxy = {
      defaultTarget: 'http://127.0.0.1:9527', // 默认地址
      items: [{
        name: '/api1' // 假设接口地址为 /api1/user 则name为"/api1"
        target: 'http://127.0.0.1:10086' // 特殊接口代理地址不一致时可设置此项
      }, {
        name: '/api2'
      }]
    }

const proxyConfig = (function () {
  var obj = {}
  proxy.items.forEach(function (item) {
    if (item.target) {
      obj[item.name] = {
        target: item.target, 
        changeOrigin: true,
        secure: false
      }
    } else {
      obj[item.name] = {
        target: proxy.defaultTarget, 
        changeOrigin: true,
        secure: false
      }
    }
    obj[item.name].pathRewrite = {}
    obj[item.name].pathRewrite[item.name] = item.name// 代理地址替换标识
  })
  return obj
})()

module.exports = proxyConfig
```
vue 的代理配置到这里就设置好了！
## rap server 配置

接下来我们需要搭建一个server服务
``` rap_server/index.js
    var express = require('express')
    var app = express()
    var config = require('./config_path.js')
    config(app)
    var server = app.listen(9527, function () {
      var host = server.address().address
      var port = server.address().port
      console.log('listening http://%s:%s', host, port)
    })
```
配置 rap-node-plugin
``` rap_server/config_rap.js
// https://www.npmjs.com/package/rap-node-plugin
var configRap = {
  base: {
    projectId: '32',                // 项目ID，默认请参见config 
    port: 80,                      // 端口，默认请参见config 
    host: 'rap.taobao.com',   // 主机，默认请参见config 
    mock: '/mockjsdata/' // 默认返回mock模版 设置为 “/mockjsdata/”后返回json 数据
  },
  urls: [ // 接口集
    '/api/orderDetail',
    '/api/orderList'
  ]
}

module.exports = configRap
``` 
配置接口路由
``` rap_server/config_path.js

var rapnode = require('rap-node-plugin')
var configRap = require('./config_rap.js')
global.RAP_FLAG = 1  // 开启RAP
rapnode.config(configRap.base)

var config_path = function (app) {
  app.all('/', function (req, res) {
    res.send('rap-server')
  })
  configRap.urls.forEach(function (item) {
    app.all(item, function (req, res) {
      console.log(req.method + ' ' + req.url)
      rapnode.getRapData(item, function () {}, function(err, ret) {
        if (err) {
          res.send(err)
          return
        }
          res.json(ret)
      })
    })
  })
}
```
配置启动命令
``` package.json
  "scripts": {
    "mock": "node rap_server/index.js"
  }
```
在控制台中执行命令 npm run mock 即可访问 server，在浏览器中访问根目录看查看到“rap-server”，或访问对应的接口看查看到json数据
![demo](https://ooo.0o0.ooo/2017/06/03/5932c5551ff19.gif)

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# serve with mock json at localhost:9527
npm run mock

```