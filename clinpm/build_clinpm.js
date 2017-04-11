var exec = require('child_process').exec;
var inquirer = require('inquirer');
var util = require('../misc/util');
var Async = require('async');
var pr = require('../misc/get_PR');
var git_pull = require('../misc/git_pull');
var fetch_PR = require('../misc/fetch_PR');
var question_PR = require('../misc/question_PR');
var checkout_PR =  require('../misc/checkout_PR');
var npm_install_prod = require('./npm_install_prod');
var npm_link = require('../clinpm/npm_link');
var dir_path = require('path');


module.exports = function() {
  //Get the current PR number.
  process.chdir(dir_path.join(util.npm_dir, '/appc-install'));
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
          console.log("Please run " + util.cyan('appcfr cleanup -c clinpm') + " first before you build again.");
          console.log('');
        } else if (answer.choice) {
          console.log('');
          console.log(util.bold(util.underline('\u25B6 Rebuilding the CLI NPM for' + pr_no)));
          build(pr_no);
        }
      });
    } else {
      build();
    }
  });
};

  var build = function(prNumber) {
    var path = dir_path.join(util.npm_dir, '/appc-install');
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
        //results is an array & we need array element 3 so results[2]
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
    tasks1.push(function(callback) { checkout_PR(prNo, 'clinpm' ,callback); });
    tasks1.push(function(callback) { npm_install_prod(callback); });
    tasks1.push(function(callback) { npm_link(callback); });
    //Using async series to execute in series
    Async.series(tasks1, function(err, results) {
      if (err) {
        console.log(util.error(err));
        //exit process in case of error
        process.exit();
      }
    });
  };
