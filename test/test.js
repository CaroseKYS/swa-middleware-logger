var assert = require('assert');
var should = require('should');
var events = require('events');
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var rewire = require('rewire');
var muk = require('muk');
var httpmock = require('node-mocks-http');
var mkdirp = require('mkdirp');
var sIndexPath = path.join(__dirname, '..', 'index.js');
var logger;

describe('swa-logger模块测试', function(){
  before(function () {
    this.timeout(10000);
    rmDir().then(() => {
      done();
    });
  });

  after(function (done) {
    this.timeout(10000);
    rmDir().then(() => {
      done();
    });
  });

  describe('开发环境测试', function(){
    var req;
    var res;

    before(function(){
      delete process.env.NODE_ENV;
    }); 

    beforeEach(function(){
      req = httpmock.createRequest({url: '/'});
      res = httpmock.createResponse({
        eventEmitter: events.EventEmitter
      });
      req.headers = {};
      delete require.cache[sIndexPath];
      delete process.env.NODE_SWA_ROOT;
    });

    it('没有指定根目录的情况下加载模块并对中间件进行一次调用', function(){
      should.doesNotThrow(function(){
        logger = require('../index.js');
      });
    });

    it('指定根目录的情况下加载模块并对中间件进行一次调用', function(){
      process.env.NODE_SWA_ROOT = path.join(__dirname, 'conf-1');
      should.doesNotThrow(function(){
        logger = require('../index.js');
      });
    });

    it('指定根目录的情况下加载模块并对中间件进行一次调用', function(){
      process.env.NODE_SWA_ROOT = path.join(__dirname, 'conf-2');
      should.doesNotThrow(function(){
        logger = require('../index.js');
      });
    });

    it('模拟创建文件夹失败场景', function(){
      process.env.NODE_SWA_ROOT = path.join(__dirname, 'conf-6');
      muk(mkdirp, 'sync', () => false);
      should.doesNotThrow(function(){
        logger = require('../index.js');
      });
      muk.restore();
    });
  });

  describe('生产环境测试', function(){
    var req;
    var res;
    var next;

    before(function(){
      process.env.NODE_ENV = 'production';
    });
    after(function(){
      // rmDir();
    });

    beforeEach(function(){
      req = httpmock.createRequest({url: '/'});
      res = httpmock.createResponse({
        eventEmitter: events.EventEmitter
      });
      next = function () {};

      req.headers = {};
      req.query = {'test1': 'value1'};
      req.body  = {'test1': 'value1'};
      req.connection = {};

      // rmDir();
      delete require.cache[sIndexPath];
      delete process.env.NODE_SWA_ROOT;
    });

    it('加载模块并对中间件进行一次调用(未指定根目录)', function(){
      should.doesNotThrow(function(){
        logger = require('../index.js');
      });
    });

    it('加载模块并对中间件进行一次调用(指定根目录)', function(){
      process.env.NODE_SWA_ROOT = path.join(__dirname, 'conf-2');
      should.doesNotThrow(function(){
        logger = require('../index.js');
        logger(req, res, next);/*执行一下返回的*/
      });
    });

    it('加载模块并对中间件进行一次调用(swa-pro-1)', function(done){
      process.env.NODE_SWA_ROOT = path.join(__dirname, 'conf-3');
      should.doesNotThrow(function(){
        logger = require('../index.js');
        logger(req, res, done);/*执行一下返回的*/
      });
    });

    it('加载模块并对中间件进行一次调用(swa-pro-2)', function(done){
      process.env.NODE_SWA_ROOT = path.join(__dirname, 'conf-4');
      delete req.query;
      delete req.body;

      should.doesNotThrow(function(){
        logger = rewire('../index.js');

        muk(logger.__get__('mkdirp'), 'sync', function(){
          return false;
        });

        logger(req, res, done);/*执行一下返回的*/
        muk.restore();
      });
    });

    it('加载模块并对中间件进行一次调用(自定义规则)', function(done){
      process.env.NODE_SWA_ROOT = path.join(__dirname, 'conf-5');
      should.doesNotThrow(function(){
        logger = require('../index.js');
        logger(req, res, done);/*执行一下返回的*/
      });
    });

  });
});

function rmDir(){
  const logDirs = [
                    path.join(__dirname, '..', 'logs'), 
                    path.join(__dirname, 'logs'),
                    path.join(__dirname, 'conf-1', 'logs'),
                    path.join(__dirname, 'conf-2', 'logs'),
                    path.join(__dirname, 'conf-3', 'logs'),
                    path.join(__dirname, 'conf-4', 'logs'),
                    path.join(__dirname, 'conf-5', 'logs'),
                    path.join(__dirname, 'conf-6', 'logs'),
                  ];

  const promises = [];

  delete require.cache[sIndexPath];

  logDirs.forEach(path => {

    promises.push(new Promise((resolve, reject) => {
      rimraf(path, {emfileWait: 5000}, resolve);
    }));
  });

  return Promise.all(promises);
}