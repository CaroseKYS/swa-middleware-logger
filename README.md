# swa-middleware-logger
用于swa平台的基于morgan的请求日志记录中间件。

## 功能描述
基于**morgan**的请求日志记录中间件。该中间件记录记录较为详细的请求路径、及客户端信息以及相应状态, 在开发的时候方便开发人员调试, 在生产环境中产生的日志可以用于 **统计分析**、**请求筛查** 等。

## 使用方式

    var express = require('express');
    var app = express();
    app.use(require('swa-middleware-logger'));

## 配置信息

    /*配置开发和生产环境下的日志级别*/
    'swa-middleware-logger': {
      // 日志的存放目录，默认为/logs目录
      'logs-path': 'logs',
      // 请求日志的记录级别，可用值如下：swa-pro-1, swa-pro-2, swa-dev-1, combined, common, dev, short, tiny
      // swa-pro-1: {date::localedate, request:[real-ip::real-ip, other-end-ip::remote-addr, url::url, method::method, http::http-version, referrer::referrer, user-agent::user-agent], response:[status::status, response-time::response-time ms, length::res[content-length], type::res[content-type], location::res[location]]}
      // swa-pro-2: {date::localedate, request:[real-ip::real-ip, other-end-ip::remote-addr, url::url, method::method, http::http-version, referrer::referrer, query::query, body::body, user-agent::user-agent], response:[status::status, response-time::response-time ms, length::res[content-length], type::res[content-type], location::res[location]]}
      // swa-dev-1: :method :url :status query::query body::body :response-time ms - :res[content-length]
      // 详情请查看: https://www.npmjs.com/package/morgan
      'morgan-development': 'swa-dev-1',
      'morgan-production': 'swa-pro-2',
      // morgan 的immediate配置
      'morgan-immediate': false,
      // 生产模式下是否记录请求日志
      'morgan-under-production': true
    }