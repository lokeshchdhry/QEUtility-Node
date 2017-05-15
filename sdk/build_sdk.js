var exec = require('child_process').exec;
var inquirer = require('inquirer');
var util = require('../misc/util');
var Async = require('async');
var pr = require('../misc/get_PR');
var gitPull = require('../misc/git_pull');
var fetch_PR = require('../misc/fetch_PR');
var questionPR = require('../misc/question_PR');
var checkoutPR = require('../misc/checkout_PR');
var npmInstall = require('../sdk/npm_install');
var buildSDKFunc = require('../sdk/build_sdk_func');
var packageSDK = require('../sdk/package_sdk');
var installSDK = require('../sdk/install_sdk');
var repoCheck = require('../misc/repo_check');
var dirPath = require('path');


module.exports = function() {
  var name = 'timob';
  repoCheck.repo_check(name, function(flag){
    if(flag){
      //Get the current PR number.
      process.chdir(dirPath.join(util.sdk_dir, '/titanium_mobile'));
      var pr_no;
      pr.getPR_No(function(PR) {
        pr_no = PR;
        if (pr_no !== '') {
          console.log('');
          //Ask question
          var questions = [{
            name: 'choice',
            type: 'confirm',
            message: 'You are already on a PR branch' + util.cyan(pr_no) + 'Do you want to rebuild for the same PR ?'
          }];
          inquirer.prompt(questions).then(function(answer) {
            if (!answer.choice) {
              console.log('');
              console.log("Please run " + util.cyan('appcfr cleanup -c sdk') + " first before you build again.");
              console.log('');
            } else if (answer.choice) {
              console.log('');
              console.log(util.bold(util.underline('\u25B6 Rebuilding the SDK for' + pr_no)));
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
      console.log(util.cyan('\u2717 Repo for SDK does not exist. Please use "appcfr clone -c sdk" to clone.'));
      console.log('');
    }
  });
};

var build = function(prNumber) {
  var path = dirPath.join(util.sdk_dir, '/titanium_mobile');
  process.chdir(path);
  if (prNumber === undefined) {

    var task = [];
    task.push(function(callback) { gitPull(callback); });
    task.push(function(callback) { fetch_PR(callback); });
    task.push(function(callback) { questionPR(callback); });
    //Using async series to execute in series
    Async.series(task, function(err, results) {
      if (err) {
        console.log(util.console.error(err));
        //exit process in case of error
        process.exit();
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
  tasks1.push(function(callback) { npmInstall(callback); });
  tasks1.push(function(callback) { buildSDKFunc(callback); });
  tasks1.push(function(callback) { packageSDK(callback); });
  tasks1.push(function(callback) { installSDK(callback); });
  //Using async series to execute in series
  Async.series(tasks1, function(err, results) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
  });
};
