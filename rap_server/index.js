var express = require('express')
var app = express()
var config = require('./config_path.js')
config(app)
var server = app.listen(9527, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('listening http://%s:%s', host, port)
})