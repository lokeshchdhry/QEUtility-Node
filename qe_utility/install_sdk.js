var inquirer = require('inquirer');
var exec = require('child_process').exec;
var util = require('../misc/util');
var spawn = require('child_process').spawn;

module.exports = function(){
  get_sdk_ver(function(err, ver){
    if(err){
      //exit process in case of error
      process.exit();
    }
    download(ver.sdk_ver, function(err, data){
      if(err){
        //exit process in case of error
        process.exit();
      }
    });
  });
};

function get_sdk_ver(callback) {
  var questions = [{
    name: 'sdk_ver',
    type: 'input',
    message: 'Enter the branch from which you would like to download the SDK(e.g: 6_0_X) :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter the branch would you like to download the SDK from';
      }
    }
  }];
  inquirer.prompt(questions).then(function(answers) {
    callback(null, answers);
  });
}

function download(ver){
  console.log('\n\u25B6 Downloading latest SDK from branch : '+util.cyan(ver));
  util.spinner_start();
  exec('appc ti sdk install -b '+ver+' --default', function(err, data) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    //regex patterns to check
    var patt1 = /You\'re up-to-date/g;
    var patt2 = /Available Branches:/g;
    var patt3 = /successfully installed/g;

    if(patt1.test(data)){
      util.spinner_stop(true);
      console.log(util.cyan('\n\u2714 You already have the latest SDK from the '+util.underline(ver)+' branch.\n'));
    }
    else if(patt2.test(data)){
      util.spinner_stop(true);
      console.log(util.cyan('\n\u2717 Provided branch '+util.underline(ver)+' does not exit. Please enter the correct branch.\n'));
    }
    else if(patt3.test(data)){
      util.spinner_stop(true);
      // var a = data.split('successfully installed').trim(' ');
      console.log(util.cyan('\n\u2714 Done, please find the latest SDK installed in your titanium folder.\n'));
    }
    else{
      console.log('Something went wrong. Please re run the command.');
    }
  });
}
