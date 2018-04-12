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

var name = 'clicore',
    install_path = util.clicore_dir,
    pkg_path = dir_path.join(install_path, '/package');

module.exports = function(){
  repo_check(name, function(flag){
    if(flag){
      //Get the current PR number.
      console.log(install_path);
      process.chdir(pkg_path);
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
              // console.log("Building for a new PR ");
              build(pkg_path);
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
      console.log(cyan('\u2717 Repo for CLI Core does not exist. Cloning repo ...'));
      //passing callback as a function
      clone_clicore(function(done){
        if(done){
          buildAfterClone(pkg_path);
        }
      });
      console.log('');
    }
  });
}
 
var build = function(path, prNumber){
  if (prNumber === undefined) {
    var task = [];
    // task.push(function(callback){deleteRepo(callback);});
    // task.push(function(callback){clone_clicore(callback);});
    // task.push(function(callback){changeFolderName(callback);});
    task.push(function(callback){change_dir(path, callback);});
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

var buildAfterClone = function(path){
    var task = [];
    task.push(function(callback){change_dir(path, callback);});
    task.push(function(callback){fetch_PR(callback);});
    task.push(function(callback){questionPR(callback);});

    Async.series(task, function(err, results){
      if(err){
        errorNExit(err);
      }
      var PR_NO = results[2].pr_no;
      build_pr(path, PR_NO);
    });
};

var build_pr = function(path, prNo){
  var task1 = [];
  task1.push(function(callback){change_dir(pkg_path, callback);});
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
  execute('appc use '+ver, function(err, data) {
    if (err) {
      errorNExit(err);
    }
    console.log(cyan(data));
    return callback(null, null);
  });
}

function deleteRepo(callback){
  execute('rm -rf '+ util.clicore_dir, function(err){
    if(err){
      errorNExit(err);
    }
    console.log('');
    console.log(cyan('Done deleting repo !!!'))
    return callback(null, null);  
  });
}

function changeFolderName(callback){
  execute('mv '+install_path+'/appc-cli'+' '+pkg_path, function(err){
    if(err){
      errorNExit(err);
    }
    var done = true;
    return callback(null, done);
  });
}

function clone_clicore(callback) {
  var repo_link = util.repolink_clicore;
  //Creating directory to clone appc-install
  fs.mkdirSync(install_path);
  process.chdir(install_path);
  console.log('\n\u25B6 Cloning appc-cli repo .... Please Wait.');
  //Starting spinner
  util.spinner_start();

  execute('git clone ' + repo_link, function(err) {
    if (err) {
      console.log(util.error(err));
      //Stop the process
      process.exit();
    } else {
      //Stop spinner
      util.spinner_stop(true);
      console.log(util.cyan('\n\n\u2714 Cloning done successfully.'));
      process.chdir(dir_path.join(install_path, '/appc-cli/.git'));
      //Call modify_config from utils.js
      util.modify_config(function(done){
        if(done){
          console.log(util.cyan('\n\u2714 Done modifying the the config file.\n'));
          changeFolderName(function(done){
            if(done){
              var done = true;
              callback(null, done);
            }
          });
        }
      });
    }
  });
}
