const logger            = require('morgan');
const utils             = require('swa-utils');
const FileStreamRotator = require('file-stream-rotator')
const path              = require('path');
const fs                = require('fs');
const mkdirp            = require('mkdirp');
const formats           = {
  'combined': 'combined',
  'common'  : 'common',
  'default' : 'default',
  'short'   : 'short',
  'tiny'    : 'tiny',
  'dev'     : 'dev',
  'swa-pro-1': '{date::localedate, request:[real-ip::real-ip, other-end-ip::remote-addr, url::url, method::method, http::http-version, referrer::referrer, user-agent::user-agent], response:[status::status, response-time::response-time ms, length::res[content-length], type::res[content-type], location::res[location]]}',
  'swa-pro-2': '{date::localedate, request:[real-ip::real-ip, other-end-ip::remote-addr, url::url, method::method, http::http-version, referrer::referrer, query::query, body::body, user-agent::user-agent], response:[status::status, response-time::response-time ms, length::res[content-length], type::res[content-type], location::res[location]]}',
  'swa-dev-1': ':method :url :status query::query body::body :response-time ms - :res[content-length] '
};

logger.token('localedate', () => (new Date()).toLocaleString());
logger.token('real-ip', req => utils.getClientIp(req));
logger.token('query', (req, res, param) => {
  let query = req.query || {};
  if (param) {
    return query[param];
  }

  return JSON.stringify(query);
});
logger.token('body', (req, res, param) => {
  let body = req.body || {};
  if (param) {
    return body[param];
  }

  return JSON.stringify(body);
});

function getLogger(){
  /*应用根路径*/
  var rootDir = process.env.NODE_SWA_ROOT || __dirname;
  /*配置文件*/
  var configFile = process.env.NODE_SWA_CONF || path.join(rootDir, "swa-conf.js");
  /*服务器运行状态*/
  var appEnv  = (process.env.NODE_ENV === 'production') ? 'production' : 'development';
  /*开发模式下的日志格式*/
  var levelDev;
  /*生产模式下的日志格式*/
  var levelPro;
  /*日志存放路径*/
  var logsPath;
  /*在生产模式下是否记录日志*/
  var recodeLogUnderPro = true;
  /*immediate 配置项*/
  var immediate = false;
  /*配置内容*/
  var loggerConf;

  loggerConf = utils.getJsonProp('swa-middleware-logger') || {};
  
  /*获取设置缺省状态下的默认日志级别以及存放路径*/
  levelDev  = utils.getJsonProp(loggerConf, 'morgan-development') || 'dev';
  levelPro  = utils.getJsonProp(loggerConf, 'morgan-production')  || 'combined';
  logsPath  = utils.getJsonProp(loggerConf, 'logs-path')          || 'logs';
  enabled   = utils.getJsonProp(loggerConf, 'enabled') == false ? false : true;
  immediate = utils.getJsonProp(loggerConf, 'immediate')          || false;

  if(!enabled){
    console.log('请求日志记录功能处于关闭状态。');
    return function(){};
  }

  /*根据运行环境选择日志级别*/
  var logLevel = (appEnv === 'development') ? levelDev : levelPro;
  logLevel = formats[logLevel] || logLevel;

  /*确定日志存放位置*/
  var logsRealPath = path.join(rootDir, logsPath);

  /*创建日志输出目录*/
  if(!fs.existsSync(logsRealPath)){
    if(!mkdirp.sync(logsRealPath)){
      logsRealPath = rootDir;
      console.log("创建日志输出目录失败，日志将存储在应用根目录下。");
    }
  }

  /*日志输出目标*/
  var accessLogStream = null;

  if(appEnv === 'development'){
     accessLogStream = process.stdout;
  }else{
    accessLogStream = FileStreamRotator.getStream({
      date_format: 'YYYY-MM-DD',
      filename: path.join(logsRealPath, 'request.%DATE%.log'),
      frequency: 'daily',
      verbose: false
    });
  }

  console.log("请求日志级别：%s", logLevel);
  console.log("请求日志文件存放路径：%s", logsRealPath);
  
  return logger(logLevel, {stream: accessLogStream, immediate: immediate});
}

module.exports = getLogger();