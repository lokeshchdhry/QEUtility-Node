var exec = require('child_process').exec;
var util = require('../misc/util');


module.exports = function npm_install(callback) {
  //install needed stuff
  exec('npm install', function(err) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    console.log(util.underline(util.bold('\n\u25B6 BUILDING THE SDK:')));
    callback(null, null);
  }).stdout.on('data', function(data) {
    console.log(util.cyan(data));
  });
};
