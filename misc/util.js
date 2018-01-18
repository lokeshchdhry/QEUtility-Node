var chalk = require('chalk'),
    Spinner = require('cli-spinner').Spinner,
    fs = require('fs'),
    exec = require('child_process').exec,
    storage = require('node-persist'),
    inquirer = require('inquirer'),
    path = require('path');

//Initialize storage sync (node persist)
storage.initSync();

module.exports = {
    //Setting color settings
    error: chalk.red,
    underline: chalk.underline,
    cyan: chalk.cyan,
    bold: chalk.bold,
    
    //Getting user info
    user: process.env.USER,

    //Getting the links & dir paths from node-persist
    sdk_dir: storage.getItemSync('dir_sdk'),
    npm_dir: storage.getItemSync('dir_npm'),
    repolink_sdk: storage.getItemSync('repo_link_sdk'),
    repolink_clinpm: storage.getItemSync('repo_link_npm'),
    repolink_clicore: storage.getItemSync('repo_link_cli_core'),
    clicore_dir: storage.getItemSync('dir_cli_core'),
    username : storage.getItemSync('username'),
    password : storage.getItemSync('password'),
    prod_org_id : storage.getItemSync('prod_org_id'),
    preprod_org_id : storage.getItemSync('preprod_org_id'),
    runcount : storage.getItemSync('runcount'),

    //Function to set sync for links & dir paths
    setSyncValue : function(name, value){
      storage.setItemSync(name, value);
    },

    //Remove sync value
    removeSyncValue : function(name){
      storage.removeItemSync(name);
    },

    //Start spinner
    spinner_start: function(text) {
        spinner = new Spinner(text);
        spinner.setSpinnerString(18);
        spinner.setSpinnerDelay(40);
        spinner.start();
    },

    //Stop spinner
    spinner_stop: function(flag) {
        spinner.stop(flag);
    },

    //Function to modify config after cloning
    modify_config: function(callback) {
        console.log(chalk.cyan("\n\u25B6 Adding 'fetch = +refs/pull/*/head:refs/remotes/origin/pr/*' to the config file'"));
        //Logic to add "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*" to the config file
        var data1 = fs.readFileSync('config').toString().split("\n");
        data1.splice(10, 0, "fetch = +refs/pull/*/head:refs/remotes/origin/pr/*");
        var text = data1.join("\n");

        fs.writeFile('config', text, function(err) {
            if (err) return console.log(util.error(err));
            else {
              var done = true;
               return callback(done);
            }
        });
    },

    execute: function(cmd, opts, callback){
      if(opts){
        exec(cmd, opts,function(err, data){
          if(err){
            return callback(err, null);
          }
          return callback(null, data);
        });
      }
      else{
        exec(cmd, function(err, data){
          if(err){
            return callback(err, null);
          }
          return callback(data);
        });
      }
    },

    // run_spawn: function(args, callback){
    //   const installFolderPath = path.join('/Users', process.env.USER, '.appcelerator', 'install'),
    //         verFile = path.join(installFolderPath, '.version'),
    //         options = {encoding: 'utf8'};
    //         appc_ver = fs.readFileSync(verFile, options);
    //         appcExe = path.join(installFolderPath, appc_ver, 'package', 'bin', 'appc'),
    //         spawn = require('child_process').spawn,
    //         proc = spawn(appcExe, args); 
    
    //   let output = '',
    //       isErr;

    //   proc.stdout.on('data', function(data){
    //     console.log('hello');
    //     output += data.toString();
    //     callback(null, output);
    //   });
    //   proc.on('error', function(err){
    //     isErr = true;
    //     callback(err, null);
    //   });
    //   proc.on('exit', function(){
    //     if(isErr){
    //       return;
    //     }
    //   });
      
    //   callback(null, output);
    // },

    repo_check: function(repoName, callback){
      var util = require('../misc/util');
      switch(repoName){
        case 'timob':
          if(!fs.existsSync(path.join(util.sdk_dir, 'titanium_mobile'))){
            callback(false);
            break;
          }
          callback(true);
          break;
        case 'clinpm':
          if(!fs.existsSync(path.join(util.npm_dir, 'appc-install'))){
            callback(false);
            break;
          }
          callback(true);
          break;
        case 'clicore':
          if(!fs.existsSync(util.clicore_dir)){
            callback(false);
            break;
          }
          callback(true);
          break;
        default:
          console.log('Invalid repo name provided');
          // callback(null,null);
      }
    },

    getPR_No: function(callback){
      var util = require('../misc/util');
      exec("git branch| grep '* pr/'|cut -c2-", function(err, data) {
        if (err) {
          console.log(util.error(err));
          //Exit process
          process.exit();
        }
        return callback(data);
      });
    },

    errorNExit: function(err){
      var util = require('../misc/util');
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    },

    gitPull: function(callback) {
      var util = require('../misc/util');
      console.log(util.underline(util.bold('\n\u25B6 PULLING ANY CHANGES FROM GITHUB:')));
      //Start the spinner
      util.spinner_start();

      exec('git pull', {
        maxBuffer: 1024 * 1000
      }, function(err, data) {
        if (err) {
          console.log(util.error(err));
          //Exit process
          process.exit();
        }
        //Stop spinner
        util.spinner_stop(true);
        console.log(util.cyan(data));
        return callback(null, null);
      });
    },

    fetch_PR: function(callback) {
      var util = require('../misc/util');
      console.log(util.underline(util.bold('\n\u25B6 FETCHING ALL PULL REQUESTS:')));
      //Start the spinner
      util.spinner_start();

      exec('git fetch origin', {
        maxBuffer: 1024 * 1000
      }, function(err, data) {
        if (err) {
          console.log(util.error(err));
          //Exit process
          process.exit();
        }
        //Stop spinner
        util.spinner_stop(true);
        console.log(util.cyan(data));
        console.log(util.cyan('DONE'));
        return callback(null, null);
      });
    },

    questionPR: function(callback) {
      var questions = [{
        name: 'pr_no',
        type: 'input',
        message: 'ENTER THE PR TO BUILD FOR :',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return this.message;
          }
        }
      }];
      inquirer.prompt(questions).then(function(answers) {
        return callback(null, answers);
      });
    },

    checkoutPR: function(prNo, component ,callback) {
      var util = require('../misc/util');
      exec('git checkout pr/' + prNo, {
        maxBuffer: 1024 * 500
      }, function(err, data) {
        if (err) {
          console.log(util.error(err));
          //Exit process
          process.exit();
        }
        if(component === 'sdk'){
          //CD into the build folder in the repo.
          process.chdir(path.join(util.sdk_dir, 'titanium_mobile'));
        }
        console.log(util.cyan(data));
        return callback(null, null);
      });
    }
};
