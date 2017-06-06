var inquirer = require('inquirer'),
Async = require('async'),
getPR_No = require('../misc/util').getPR_No,
gitPull = require('../misc/util').gitPull,
fetch_PR = require('../misc/util').fetch_PR,
questionPR = require('../misc/util').questionPR,
checkoutPR = require('../misc/util').checkoutPR,
npm_install_prod = require('../clinpm/util_clinpm').npm_install_prod,
npm_link = require('../clinpm/util_clinpm').npm_link,
dir_path = require('path'),
repo_check = require('../misc/util').repo_check,
errorNExit = require('../misc/util').errorNExit,
npm_dir = require('../misc/util').npm_dir,
cyan = require('../misc/util').cyan,
underline = require('../misc/util').underline;
bold = require('../misc/util').bold;


module.exports = function() {
  var name = 'clinpm';
  //Checking if repo path is set
  repo_check(name, function(flag){
    if(flag){
      //Get the current PR number.
      process.chdir(dir_path.join(npm_dir, '/appc-install'));
      var pr_no;
      pr.getPR_No(function(PR) {
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
              console.log("Please run " + cyan('appcfr cleanup -c clinpm') + " first before you build again.");
              console.log('');
            } else if (answer.choice) {
              console.log('');
              console.log(bold(underline('\u25B6 Rebuilding the CLI NPM for' + pr_no)));
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
      console.log(cyan('\u2717 Repo for CLI NPM does not exist. Please first check if repo links are set, SETUP --> STORED PATHS & then clone the repo.'));
      console.log('');
    }
  });
};

var build = function(prNumber) {
  var path = dir_path.join(npm_dir, '/appc-install');
  process.chdir(path);
  if (prNumber === undefined) {

    var task = [];
    task.push(function(callback) { git_pull(callback); });
    task.push(function(callback) { fetch_PR(callback); });
    task.push(function(callback) { question_PR(callback); });
    //Using async series to execute in series
    Async.series(task, function(err, results) {
      if (err) {
        errorNExit(err);
      }
      //results is an array & we need array element 3 so results[2]
      var PR_NO = results[2].pr_no;
      buildPR(PR_NO);
    });
  } else {
    buildPR(prNumber.slice(4));
  }
};

var buildPR = function(prNo) {
  var tasks1 = [];
  //pushing individual tasks to array
  tasks1.push(function(callback) { checkout_PR(prNo, 'clinpm' ,callback); });
  tasks1.push(function(callback) { npm_install_prod(callback); });
  tasks1.push(function(callback) { npm_link(callback); });
  //Using async series to execute in series
  Async.series(tasks1, function(err, results) {
    if (err) {
      errorNExit(err);
    }
  });
};
