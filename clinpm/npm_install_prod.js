var exec = require('child_process').exec;
var util = require('../misc/util');

module.exports = function npm_install_prod(callback) {
  //install needed stuff
  exec('npm install --production', function(err) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    callback(null, null);
  }).stdout.on('data', function(data) {
    console.log(util.cyan(data));
  });
};
