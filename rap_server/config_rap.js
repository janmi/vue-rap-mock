// https://www.npmjs.com/package/rap-node-plugin
var configRap = {
  base: {
    projectId: '32',                // 项目ID，默认请参见config 
    port: 80,                      // 端口，默认请参见config 
    host: 'rap.taobao.com',   // 主机，默认请参见config 
    mock: '/mockjsdata/' //返回mock json 数据
  },
  urls: [
    '/api/orderDetail',
    '/api/orderList'
  ]
}

module.exports = configRap