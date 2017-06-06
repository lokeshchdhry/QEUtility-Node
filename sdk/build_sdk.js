var inquirer = require('inquirer'),
Async = require('async'),
gitPull = require('../misc/util').gitPull,
fetch_PR = require('../misc/util').fetch_PR,
questionPR = require('../misc/util').questionPR,
checkoutPR = require('../misc/util').checkoutPR,
npmInstallSDK = require('../sdk/util_sdk').npmInstallSDK,
buildSDKFunc = require('../sdk/util_sdk').buildSDKFunc,
packageSDK = require('../sdk/package_sdk'),
installSDK = require('../sdk/install_sdk'),
dirPath = require('path'),
cyan = require('../misc/util').cyan,
bold = require('../misc/util').cyan,
underline = require('../misc/util').cyan,
errorNExit = require('../misc/util').errorNExit,
sdk_dir = require('../misc/util').sdk_dir,
repo_check = require('../misc/util').repo_check,
getPR_No = require('../misc/util').getPR_No;


module.exports = function() {
  var name = 'timob';
  //Checking if repo path is set
  repo_check(name, function(flag){
    if(flag){
      //Get the current PR number.
      process.chdir(dirPath.join(sdk_dir, '/titanium_mobile'));
      var pr_no;
      getPR_No(function(PR) {
        pr_no = PR;
        if (pr_no !== '') {
          console.log('');
          //Ask question
          var questions = [{
            name: 'choice',
            type: 'confirm',
            message: 'You are already on a PR branch' + cyan(pr_no) + 'Do you want to rebuild for the same PR ?'
          }];
          inquirer.prompt(questions).then(function(answer) {
            if (!answer.choice) {
              console.log('');
              console.log("Please do a cleanup, FR TOOLS FOR SDK -> CLEANUP SDK first before you build again.");
              console.log('');
            } else if (answer.choice) {
              console.log('');
              console.log(bold(underline('\u25B6 Rebuilding the SDK for' + pr_no)));
              build(pr_no);
            }
          });
        } else {
          build();
        }
      });
    }
    else{
      console.log('');
      console.log(cyan('\u2717 Repo for SDK does not exist. Please first check if repo links are set, SETUP --> STORED PATHS & then clone the repo.'));
      console.log('');
    }
  });
};

var build = function(prNumber) {
  var path = dirPath.join(sdk_dir, '/titanium_mobile');
  process.chdir(path);
  if (prNumber === undefined) {

    var task = [];
    task.push(function(callback) { gitPull(callback); });
    task.push(function(callback) { fetch_PR(callback); });
    task.push(function(callback) { questionPR(callback); });
    //Using async series to execute in series
    Async.series(task, function(err, results) {
      if (err) {
        errorNExit(err);
      }
      //results is an array & we need array element 3 so we do results[2]
      var PR_NO = results[2].pr_no;
      build_pr(PR_NO);
    });
  } else {
    build_pr(prNumber.slice(4));
  }
};

var build_pr = function(prNo) {
  var tasks1 = [];
  //pushing individual tasks to array
  tasks1.push(function(callback) { checkoutPR(prNo, 'sdk', callback); });
  tasks1.push(function(callback) { npmInstallSDK(callback); });
  tasks1.push(function(callback) { buildSDKFunc(callback); });
  tasks1.push(function(callback) { packageSDK(callback); });
  tasks1.push(function(callback) { installSDK(callback); });
  //Using async series to execute in series
  Async.series(tasks1, function(err, results) {
    if (err) {
      errorNExit(err);
    }
  });
};
