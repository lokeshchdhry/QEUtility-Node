var exec = require('child_process').exec;
var util = require('../misc/util');


module.exports = function build_sdk_func(callback) {
  //Build the SDK
  exec('node scons.js build', {
    maxBuffer: 1024 * 500
  }, function(err) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    console.log(util.underline(util.bold('\n\u25B6 PACKAGING THE SDK:')));
    callback(null, null);
  }).stdout.on('data', function(data) {
    console.log(util.cyan(data));
  });
};
