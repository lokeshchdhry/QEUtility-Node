var exec = require('child_process').exec;
var inquirer = require('inquirer');
var util = require('../misc/util');
var Async = require('async');
var pr = require('../misc/get_PR');
var git_pull = require('../misc/git_pull');
var fetch_PR = require('../misc/fetch_PR');
var question_PR = require('../misc/question_PR');
var checkout_PR = require('../misc/checkout_PR');
var npm_install = require('../sdk/npm_install');
var build_sdk_func = require('../sdk/build_sdk_func');
var package_sdk = require('../sdk/package_sdk');
var install_sdk = require('../sdk/install_sdk');
var repoCheck = require('../misc/repo_check');


module.exports = function() {
  var name = 'timob';
  repoCheck.repo_check(name, function(flag){
    if(flag){
      //Get the current PR number.
      process.chdir(util.sdk_dir + '/titanium_mobile');
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
  var path = util.sdk_dir + '/titanium_mobile';
  process.chdir(path);
  if (prNumber === undefined) {

    var task = [];
    task.push(function(callback) { git_pull(callback); });
    task.push(function(callback) { fetch_PR(callback); });
    task.push(function(callback) { question_PR(callback); });
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
  tasks1.push(function(callback) { checkout_PR(prNo, 'sdk', callback); });
  tasks1.push(function(callback) { npm_install(callback); });
  tasks1.push(function(callback) { build_sdk_func(callback); });
  tasks1.push(function(callback) { package_sdk(callback); });
  tasks1.push(function(callback) { install_sdk(callback); });
  //Using async series to execute in series
  Async.series(tasks1, function(err, results) {
    if (err) {
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
  });
};
