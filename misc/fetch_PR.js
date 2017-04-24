var exec = require('child_process').exec;
var util = require('../misc/util');


module.exports = function fetch_PR(callback) {
  console.log('');
  console.log('Fetching all pull requests ...... Please wait');
  //Start the spinner
  util.spinner_start();

  exec('git fetch origin', {
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
    console.log(util.cyan('DONE'));
    console.log('');
    callback(null, null);
  });
};
