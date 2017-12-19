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
    bold = require('../misc/util').bold,
    underline = require('../misc/util').underline,
    errorNExit = require('../misc/util').errorNExit,
    sdk_dir = require('../misc/util').sdk_dir,
    repo_check = require('../misc/util').repo_check,
    getPR_No = require('../misc/util').getPR_No,
    cleanup = require('../sdk/cleanup_sdk');


module.exports = function() {
  var name = 'timob';
  //Checking if repo exists
  repo_check(name, function(flag){
    if(flag){
      //Get the current PR number.
      process.chdir(dirPath.join(sdk_dir, '/titanium_mobile'));
      getPR_No(function(PR) {
        if (PR !== '') {
          console.log('');
          //Ask question
          var questions = [{
            name: 'choice',
            type: 'confirm',
            message: 'You are already on a PR branch' + cyan(PR) + 'Do you want to rebuild for the same PR ?'
          }];
          inquirer.prompt(questions).then(function(answer) {
            if (!answer.choice) {
              // Do a cleanup to build for different PR
              cleanup();
            } else if (answer.choice) {
              console.log(bold(underline('\n\u25B6 RE-BUILDING THE SDK FOR' + PR)));
              build(PR);
            }
          });
        } else {
          build();
        }
      });
    }
    else{
      console.log(cyan('\n\u2717 Repo for SDK does not exist. Please first check if repo links are set,'+bold(' SETUP --> STORED PATHS')+' & then clone the repo.\n'));
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
    // task.push(function(callback) { npmInstallSDK(callback); });
    task.push(function(callback) { questionPR(callback); });
    //Using async series to execute in series
    Async.series(task, function(err, results) {
      if (err) {
        errorNExit(err);
      }
      //results is an array & we need array element 4 so we do results[2]
      var PR_NO = results[2].pr_no;
      build_pr(PR_NO);
    });
  } else {
    build_pr(prNumber.slice(4));
  }
};

exports.build = build;

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
