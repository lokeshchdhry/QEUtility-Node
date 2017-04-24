var exec = require('child_process').exec;
var util = require('../misc/util');


module.exports = function git_pull(callback) {
  console.log('');
  console.log('Pulling any changes from github ...... Please wait');
  //Start the spinner
  util.spinner_start();

  exec('git pull', {
    maxBuffer: 1024 * 1000
  }, function(err, data) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    //Stop spinner
    util.spinner_stop(true);
    console.log(util.cyan(data));
    callback(null, null);
  });
};
