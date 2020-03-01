//node.js日志系统

var log4js = require('log4js');
//先大概的对log4js 的基本用法做一个总结，
//使用configure()方法对日志输出进行配置，使用 getlogger()方法获取logger对象，
//然后使用logger 对象进行打印各个级别的日志。

log4js.configure({
  appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
  categories: { default: { appenders: ['cheese'], level: 'error' } }
});
//categories 也是一个map类型的数据，key是 category 的名字是一个字符串，value 是一个对象。
//value 的常用属性
//level 定义打印日志的级别
//appenders 定义打印的appender

exports.logger = function (level) {
    var logger = log4js.getLogger("cheese");
    logger.level = 'debug';
    return logger;
};

// 配合 express 使用的方法
// exports.use = function (app, level) {
//     app.use(log4js.connectLogger(log4js.getLogger('logInfo'), {
//         level: levels[level] || levels['debug'],
//         format: ':method :url :status'
//     }));
// };