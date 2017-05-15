var inquirer = require('inquirer');
var exec = require('child_process').exec;
var util = require('../misc/util');
_ = require('underscore');
var fs = require('fs');
var path = require('path');
var Async = require('async');

module.exports = function(){
  task = [];
  task.push(function(callback){getSDKVer(callback);});
  task.push(function(version, callback){filterAndDownload(version, callback);});
  task.push(function(flag, version, callback){download(flag, version, callback);});

  Async.waterfall(task, function(err, results){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
  });
};

function getSDKVer(callback) {
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
    callback(null, answers.sdk_ver);
  });
}

function filterAndDownload(version, callback){
  //regex patterns to check
  var patt_1 = /_/g;
  var patt_2 = /^[A-z]/g;
  if(patt_1.test(version)||patt_2.test(version)){

    callback(null, 'branch', version);
  }
  else{
    callback(null, 'sdk', version);
  }
}

function download(flag, version){
  var option;
  //regex patterns to check
  var patt1 = /You\'re up-to-date/g;
  var patt2 = /Available Branches:/g;
  var patt3 = /successfully installed/g;
  if(flag === 'branch'){
    console.log('\n\u25B6 Downloading the latest SDK from branch : '+util.cyan(version));
    util.spinner_start();
    exec('appc ti sdk install -b '+version+' --default', function(err, data) {
      if (err) {
        console.log(util.error(err));
        //exit process in case of error
        process.exit();
      }

      if(patt1.test(data)){
        util.spinner_stop(true);
        console.log(util.cyan('\n\u2714 You already have the latest SDK from the '+util.underline(version)+' branch.\n'));
      }
      else if(patt2.test(data)){
        util.spinner_stop(true);
        console.log(util.cyan('\n\u2717 Provided branch '+util.underline(version)+' does not exit. Please enter the correct branch.\n'));
      }
      else if(patt3.test(data)){
        util.spinner_stop(true);
        console.log(util.cyan('\n\u2714 Done, please find the latest SDK '+getLatestSDKVer()+' installed in your titanium folder.\n'));
      }
      else{
        util.spinner_stop(true);
        console.log('Something went wrong. Please re run the command.');
      }
    });
  }
  else{
    console.log('\n\u25B6 Downloading the SDK : '+util.cyan(version));
    util.spinner_start();
    exec('appc ti sdk install '+version+' --default', function(err, data) {
      if (err) {
        console.log(util.error(err));
        //exit process in case of error
        process.exit();
      }

      if(patt1.test(data)){
        util.spinner_stop(true);
        console.log(util.cyan('\n\u2714 You already have the SDK '+util.cyan(version)+'.\n'));
      }
      else if(patt2.test(data)){
        util.spinner_stop(true);
        console.log(util.cyan('\n\u2717 Provided SDK '+util.underline(version)+' does not exit.\n'));
      }
      else if(patt3.test(data)){
        util.spinner_stop(true);
        console.log(util.cyan('\n\u2714 Done, please find the SDK '+getLatestSDKVer()+' installed in your titanium folder.\n'));
      }
      else{
        util.spinner_stop(true);
        console.log('Something went wrong. Please re run the command.');
      }
    });
  }
}

function getLatestSDKVer(){
  var dir = path.join('/Users', 'lchoudhary', 'Library', 'Application Support', 'Titanium', 'mobilesdk', 'osx');
  var folders = fs.readdirSync(dir);
  var filter_arr = [];
  //filtering out DS.store file from the array of folders
  _.filter(folders, function(folder){
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
}
