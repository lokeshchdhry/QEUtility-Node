var inquirer = require('inquirer'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    Async = require('async'),
    cyan = require('../misc/util').cyan,
    errorNExit = require('../misc/util').errorNExit,
    execute = require('../misc/util').execute,
    underline = require('../misc/util').underline,
    spinner_stop = require('../misc/util').spinner_stop,
    spinner_start = require('../misc/util').spinner_start,
    ProgressBar = require('ascii-progress'),
    os = require('os');

module.exports = function(){
  task = [];
  task.push(function(callback){getSDKVer(callback);});
  task.push(function(version, callback){filter(version, callback);});
  task.push(function(flag, version, callback){download(flag, version, callback);});

  Async.waterfall(task, function(err, results){
    if(err){
      errorNExit(err);
    }
  });
};

var getSDKVer = function(callback) {
  var questions = [{
    name: 'sdk_ver',
    type: 'input',
    message: 'Enter the SDK or the branch from which you would like to download the SDK(e.g: 6_0_X or SDK version) :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter SDK or the branch would you like to download the SDK from';
      }
    }
  }];
  inquirer.prompt(questions).then(function(answers) {
    return callback(null, answers.sdk_ver);
  });
};

var filter = function(version, callback){
  //regex patterns to check
  var patt_1 = /_/g;
  var patt_2 = /^[A-z]/g;
  //checking if branch is entered or master
  if(patt_1.test(version)||patt_2.test(version)){
    return callback(null, 'branch', version);
  }
  else{
    return callback(null, 'sdk', version);
  }
};

var download = function(flag, version){
  //regex patterns to check
  var patt1 = /You\'re up-to-date/g;
  var patt2 = /Available Branches:/g;
  var patt3 = /successfully installed/g;
  if(flag === 'branch'){
    console.log('\n\u25B6 Downloading & extracting the latest SDK from branch : '+cyan(version));
    //Start spinner
    spinner_start();
    execute('appc ti sdk install -b '+version+' --default', function(err, data) {
      if (err) {
        errorNExit(err);
      }
      
      if(patt1.test(data)){
        //Stop spinner
        spinner_stop(true);
        console.log(cyan('\u2714 You already have the latest SDK from the '+version+' branch.\n'));
      }
      else if(patt2.test(data)){
        //Stop spinner
        spinner_stop(true);
        console.log(cyan('\u2717 Provided branch '+underline(version)+' does not exit. Please enter the correct branch.\n'));
      }
      else if(patt3.test(data)){
        //Stop spinner
        spinner_stop(true);
        console.log(cyan('\n\u2714 Done, please find the latest SDK '+getLatestSDKVer()+' installed in your titanium folder.\n'));
      }
      else{
        //Stop spinner
        spinner_stop(true);
        console.log('Something went wrong. Please re run the command.');
      }
    });
  }
  else{
    console.log('\n\u25B6 Downloading & extracting the SDK : '+cyan(version));
    spinner_start();
    execute('appc ti sdk install '+version+' --default', function(err, data) {
      if (err) {
        errorNExit(err);
      }

      if(patt1.test(data)){
        spinner_stop(true);
        console.log(cyan('\n\u2714 You already have the SDK '+cyan(version)+'.\n'));
      }
      else if(patt2.test(data)){
        spinner_stop(true);
        console.log(cyan('\n\u2717 Provided SDK '+underline(version)+' does not exit.\n'));
      }
      else if(patt3.test(data)){
        spinner_stop(true);
        console.log(cyan('\n\u2714 Done, please find the SDK '+getLatestSDKVer()+' installed in your titanium folder.\n'));
      }
      else{
        spinner_stop(true);
        console.log('Something went wrong. Please re run the command.');
      }
    });
  }
};

var getLatestSDKVer = function(){
  var dir = path.join(os.homedir(), 'Library', 'Application Support', 'Titanium', 'mobilesdk', 'osx');
  var folders = fs.readdirSync(dir);
  var filter_arr = [];
  //filtering out DS.store file from the array of folders
  folders.filter(function(folder){
    if(folder !== '.DS_Store'){
      filter_arr.push(folder);
    }
  });
  return _.max(filter_arr, function (f) {
    var fullpath = path.join(dir, f);
    // ctime = creation time is used
    // replace with mtime for modification time
    return fs.statSync(fullpath).ctime;
  });
};
