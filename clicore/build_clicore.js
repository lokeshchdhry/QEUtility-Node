var util = require('../misc/util'),
    fs = require('fs'),
    inquirer = require('inquirer'),
    fetch_PR = require('../misc/util').fetch_PR,
    questionPR = require('../misc/util').questionPR,
    checkoutPR = require('../misc/util').checkoutPR,
    Async = require('async'),
    getPR_No = require('../misc/util').getPR_No,
    dir_path = require('path'),
    repo_check = require('../misc/util').repo_check,
    execute = require('../misc/util').execute,
    errorNExit = require('../misc/util').errorNExit,
    bold = require('../misc/util').bold,
    underline = require('../misc/util').underline,
    cyan = require('../misc/util').cyan;

module.exports = function(){
  var name = 'clicore';
  repo_check(name, function(flag){
    if(flag){
      //Get appc cli core install path from storage
      var install_path = util.clicore_dir;
      // var pkg_path = install_path+'/package';
      var pkg_path = dir_path.join(install_path, '/package');
      var ver = '1.0.0';

      //Get the current PR number.
      process.chdir(dir_path.join(pkg_path, '/appc-cli'));
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
              console.log("Please run " + cyan('appcfr cleanup -c sdk') + " first before you build again.");
              console.log('');
            } else if (answer.choice) {
              console.log('');
              console.log(bold(underline('\u25B6 Rebuilding the cli core for' + pr_no)));
              console.log('@@@@@@'+pkg_path);
              console.log('@@@@@@'+pr_no);
              build(pkg_path, pr_no);
            }
          });
        } else {
          build(pkg_path);
        }
      });
    }
    else{
      console.log('');
      console.log(cyan('\u2717 Repo for CLI Core does not exist. Please use "appcfr clone -c clicore" to clone.'));
      console.log('');
    }

  });
  // //Get appc cli core install path from storage
  // var install_path = util.clicore_dir;
  // var pkg_path = install_path+'/package';
  // var ver = '1.0.0';
  //
  // //Get the current PR number.
  // process.chdir(pkg_path+'/appc-cli');
  // var pr_no;
  // pr.getPR_No(function(PR) {
  //   pr_no = PR;
  //   if (pr_no !== '') {
  //     console.log('');
  //     //Ask question
  //     var questions = [{
  //       name: 'choice',
  //       type: 'confirm',
  //       message: 'You are already on a PR branch' + util.cyan(pr_no) + 'Do you want to rebuild for the same PR ?'
  //     }];
  //     inquirer.prompt(questions).then(function(answer) {
  //       if (!answer.choice) {
  //         console.log('');
  //         console.log("Please run " + util.cyan('appcfr cleanup -c sdk') + " first before you build again.");
  //         console.log('');
  //       } else if (answer.choice) {
  //         console.log('');
  //         console.log(util.bold(util.underline('\u25B6 Rebuilding the cli core for' + pr_no)));
  //         console.log('@@@@@@'+pkg_path);
  //         console.log('@@@@@@'+pr_no);
  //         build(pkg_path, pr_no);
  //       }
  //     });
  //   } else {
  //     build(pkg_path);
  //   }
  // });
};

var build = function(path, prNumber){
  if (prNumber === undefined) {
    var task = [];
    task.push(function(callback){change_dir(dir_path.join(path, '/appc-cli'), callback);});
    task.push(function(callback){fetch_PR(callback);});
    task.push(function(callback){questionPR(callback);});

    Async.series(task, function(err, results){
      if(err){
        errorNExit(err);
      }
      var PR_NO = results[2].pr_no;
      build_pr(path, PR_NO);
    });
  }
  else{
    build_pr(path, prNumber.slice(4));
  }
};

var build_pr = function(path, prNo){
  var task1 = [];
  task1.push(function(callback){change_dir(dir_path.join(path, '/appc-cli'), callback);});
  task1.push(function(callback){checkoutPR(prNo, 'clicore', callback);});
  task1.push(function(callback){install_core(callback);});
  task1.push(function(callback){appc_use('1.0.0', callback);});

  Async.series(task1, function(err, results){
    if(err){
      errorNExit(err);
    }
    console.log(util.cyan('\nDONE'));
  });
};

//Function definitions start here:
function change_dir(path, callback){
  try{
    process.chdir(path);
    return callback(null, null);
  }
  catch(err){
    errorNExit(err);
  }
}

function install_core(callback){
  execute('npm install --production', function(err, data) {
    if (err) {
      errorNExit(err);
    }
    console.log(cyan(data));
    return callback(null, null);
  });
}

function appc_use(ver, callback){
  execute('appc use '+ver, function(err) {
    if (err) {
      errorNExit(err);
    }
    console.log(cyan(data));
    return callback(null, null);
  });
}
