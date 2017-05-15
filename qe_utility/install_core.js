var exec = require('child_process').exec;
var inquirer = require('inquirer');
var util = require('../misc/util');
var Async = require('async');

module.exports = function(){

  Async.waterfall([
    function getCLIVer(callback) {
      var questions = [{
        name: 'cli_ver',
        type: 'input',
        message: 'Enter the CLI core version which you would like to download(e.g: 6.2.0) :',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter the CLI core version which you would like to download.';
          }
        }
      }];
      inquirer.prompt(questions).then(function(answers) {
        callback(null, answers.cli_ver);
      });
    },

    function downloadCore(version, callback){
      console.log('\n\u25B6 Downloading & installing CLI Core version : '+util.cyan(version));
      util.spinner_start();
      exec('appc use '+version, function(err, data){
        if(err){
          util.error(err);
          //exit process in case of error
          callback(err);
          process.exit();
        }
        util.spinner_stop(true);
        console.log(util.cyan(data));
        callback(null);
      });
    }
  ],function(err, results){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
  });
};
