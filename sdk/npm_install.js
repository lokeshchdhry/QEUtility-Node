var exec = require('child_process').exec;
var util = require('../misc/util');
var dirPath = require('path');


module.exports = function npm_install(callback) {
  //install needed stuff
  exec('npm install', function(err) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    //cd into build after npm install due to https://github.com/appcelerator/titanium_mobile/pull/8974
    var path = dirPath.join(util.sdk_dir, 'titanium_mobile', 'build');
    process.chdir(path);
    console.log(util.underline(util.bold('\n\u25B6 BUILDING THE SDK:')));
    callback(null, null);
  }).stdout.on('data', function(data) {
    console.log(util.cyan(data));
  });
};
