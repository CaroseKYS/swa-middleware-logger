module.exports = {
  /*配置开发和生产环境下的日志级别*/
  'swa-middleware-logger': {
    'logs-path': 'logs',/*日志的存放目录，默认为/logs目录*/
    /**
     * 请求日志的记录级别，所有级别如下：
     * combined, common, dev, short, tiny
     * 详情请查看: https://www.npmjs.com/package/morgan
     */
    'morgan-development': ':query :body :query[test1] :body[test1] :real-ip',
    'morgan-production' : ':query :body :query[test1] :body[test1] :real-ip',
    'morgan-under-production': true /*生产模式下是否记录请求日志*/,
    'morgan-immediate': true
  }
}