var fs = require('fs'),
    chalk = require('chalk'),
    inquirer = require('inquirer'),
    path = require('path'),
    Async = require('async'),
    storage = require('node-persist'),
    util = require('../misc/util'),
    questionInput = require('../misc/util').questionInput,
    cyan = require('../misc/util').cyan,
    error = require('../misc/util').error,
    bold = require('../misc/util').bold,
    errorNExit = require('../misc/util').errorNExit,
    user = require('../misc/util').user,
    setSyncValue = require('../misc/util').setSyncValue,
    removeSyncValue = require('../misc/util').removeSyncValue,
    underline = require('../misc/util').underline,
    execute = require('../misc/util').execute,
    spinner_stop = require('../misc/util').spinner_stop,
    spinner_start = require('../misc/util').spinner_start,
    installAppcCLI = require('../qe_utility/install_core');

module.exports = function() {
  var android_sdk, android_ndk;
  //Checking if bash profile exists
  fs.exists(path.join('/Users', user, '.bash_profile'), function(exists) {
    if (exists) {
      android_sdk = process.env.ANDROID_SDK;
      android_ndk = process.env.ANDROID_NDK;

      var task = [];
      task.push(function(callback) {checkAppcCLI(callback);});
      task.push(function(callback) {checkAndroidSDKEnvVar(callback, android_sdk);});
      task.push(function(callback) {checkAndroidNDKEnvVar(callback, android_ndk);});
      task.push(function(callback) {removeSyncedData(callback);});
      task.push(function(callback) {setupRepoLinksNPaths(callback);});
      task.push(function(callback) {displayData(callback);});
      Async.series(task, function(err, results){
        if(err){
          errorNExit(err);
        }
      });
    }
    else {
      console.log(error('\n\u2717.bash_profile does not exist. Please create one.'));
      //exit process in case of error
      process.exit();
    }
  });
};
//Function definitions start here:
var checkAppcCLI = function(callback){
  console.log(underline(bold('\n\u25B6 CHECKING IF APPC CLI IS INSTALLED:')));
  execute('appc -v', function(err, data){
    if(err){
      console.log('\u2717 It seems APPC CLI is not installed & is needed by this tool. Please run '+cyan('\"sudo npm install -g appcelerator\"')+' from the terminal & re-run SETUP.\n');
      //Killing the process as APPC CLI is not installed
      process.exit();
    }
    else{
      execute('appc -v', function(err, data){
        if(err){
          errorNExit(err);
        }
        console.log(cyan('\u2714 APPC CLI CORE version '+ data.trim('')+' is installed'));
        return callback(null, null);
      });
    }
  });
};

var checkAndroidSDKEnvVar = function(callback, andSDKEnvVar){
  console.log(underline(bold('\n\u25B6 CHECKING IF ANDROID_SDK ENV VARIABLE IS SET.')));
  if (andSDKEnvVar === undefined) {
    console.log(cyan('\n\u2717 ANDROID_SDK env variable is not set. Let\'s set it up.'));

    var questions = [{
      name: 'android_sdkPath',
      type: 'input',
      message: 'Enter the path for android SDK :'
    }];
    inquirer.prompt(questions).then(function(answers) {
      //CD into the user dir
      process.chdir('/Users/' + user);
      //Logic to edit bash profile to add ANDROID_SDK & ANDROID_NDK
      var data1 = fs.readFileSync('.bash_profile').toString().split("\n");
      data1.splice(40, 0, 'export ANDROID_SDK=' + answers.android_sdkPath);
      var text = data1.join("\n");

      fs.writeFile('.bash_profile', text, function(err) {
        if (err){
          console.log(error(err));
          //exit process in case of error
          process.exit();
        }
        else {
          console.log(bold(cyan('\n\u2714 Done adding ANDROID_SDK to the bash_profile.')));
          return callback(null, null);
        }
      });
    });
  } else {
    console.log(cyan('\u2714 ANDROID_SDK is set in bash_profile\n'));
    return callback(null, null);
  }
};

var checkAndroidNDKEnvVar = function(callback, andNDKEnvVar){
  console.log(underline(bold('\n\u25B6 CHECKING IF ANDROID_NDK ENV VARIABLE IS SET.')));
  if (andNDKEnvVar === undefined) {
    console.log(bold(cyan('\n\u2717 ANDROID_SNK env variable is not set. Let\'s set it up.')));

    var questions = [{
      name: 'android_ndkPath',
      type: 'input',
      message: 'Enter the path for android NDK :'
    }];
    inquirer.prompt(questions).then(function(answers) {
      //CD into the user dir
      process.chdir('/Users/' + user);
      //Logic to edit bash profile to add ANDROID_SDK & ANDROID_NDK
      var data1 = fs.readFileSync('.bash_profile').toString().split("\n");
      data1.splice(41, 0, 'export ANDROID_NDK=' + answers.android_ndkPath);
      var text = data1.join("\n");

      fs.writeFile('.bash_profile', text, function(err) {
        if (err){
          errorNExit(err);
        }
        else {
          console.log(cyan(bold('\n\u2714 Done adding ANDROID_NDK to the bash_profile.')));
          return callback(null, null);
        }
      });
    });
  } else {
    console.log(cyan('\u2714 ANDROID_NDK is set in bash_profile'));
    return callback(null, null);
  }
};

var removeSyncedData = function(callback){
  removeSyncValue('repo_link_sdk');
  removeSyncValue('dir_sdk');
  removeSyncValue('repo_link_npm');
  removeSyncValue('dir_npm');
  removeSyncValue('repo_link_cli_core');
  removeSyncValue('dir_cli_core');
  removeSyncValue('username');
  removeSyncValue('password');
  removeSyncValue('prod_org_id');
  removeSyncValue('preprod_org_id');

  return callback(null, null);
};

var setupRepoLinksNPaths = function(callback){
  //Hardcoding the cli core clone path/dir
  var clicore_install_path = path.join('/Users', user, '.appcelerator','install', '1.0.0');
  setSyncValue('dir_cli_core', clicore_install_path);

  console.log(underline(bold('\n\u25B6 SETTING REPO LINKS & REPO PATHS:')));
  //questions object array
  var questions = [{
    name: 'repo_link_sdk',
    type: 'input',
    message: 'Enter the titanium_mobile repo link to clone :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter the titanium_mobile repo link to clone :';
      }
    }
  },
  {
    name: 'dir_sdk',
    type: 'input',
    message: 'Enter path to dir where you want to clone the titanium_mobile repo :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter path to dir where you want to clone the titanium_mobile repo';
      }
    }
  },
  {
    name: 'repo_link_npm',
    type: 'input',
    message: 'Enter the Appc NPM repo link :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return ('Please enter the Appc NPM repo link to clone :');
      }
    }
  },
  {
    name: 'dir_npm',
    type: 'input',
    message: 'Enter path to dir where you want to clone the Appc NPM repo :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter path to dir where you want to clone the Appc NPM repo :';
      }
    }
  },
  {
    name: 'repo_link_cli_core',
    type: 'input',
    message: 'Enter the CLI core repo link :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter the CLI core repo link :';
      }
    }
  },
  {
    name: 'username',
    type: 'input',
    message: 'Enter the CLI login username :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter the CLI login username :';
      }
    }
  },
  {
    name: 'password',
    type: 'password',
    message: 'Enter the CLI login password :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter the CLI login password :';
      }
    }
  },
  {
    name: 'prod_org_id',
    type: 'input',
    message: 'Enter the production org id (which you normally use) :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter the production org id :';
      }
    }
  },
  {
    name: 'preprod_org_id',
    type: 'input',
    message: 'Enter the pre-production org id (which you normally use) :',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter the pre-production org id :';
      }
    }
  }
];
inquirer.prompt(questions).then(function(answers) {
  //Storing the repo link & repo dir using node persist.
  setSyncValue('repo_link_sdk', (answers.repo_link_sdk).trim());
  setSyncValue('dir_sdk', (answers.dir_sdk).trim());
  setSyncValue('repo_link_npm', (answers.repo_link_npm).trim());
  setSyncValue('dir_npm', (answers.dir_npm).trim());
  setSyncValue('repo_link_cli_core', (answers.repo_link_cli_core).trim());
  setSyncValue('username', (answers.username).trim());
  setSyncValue('password', (answers.password).trim());
  setSyncValue('prod_org_id', (answers.prod_org_id).trim());
  setSyncValue('preprod_org_id', (answers.preprod_org_id).trim());

  //Set the count to 1 in the storage when setup is run. This count is used to track if setup is run atleast once.
  setSyncValue('runcount', 1);

  return callback(null, null);
});
};

var displayData = function(callback){
  //Getting the stored info & printing the details to console
  /* Have to use node-persist directly to get the stored values as accessing from util.js returns 'undefined' for
    the first run as displayData is called before tthe values are set in node-persist */
  console.log('');
  console.log(underline(bold('\u25B6 STORED INFORMATION: (PLEASE DOUBLE CHECK)')));
  console.log('TIMOB repo link :    ' + cyan(storage.getItemSync('repo_link_sdk')));
  console.log('TIMOB SDK clone dir: ' + cyan(storage.getItemSync('dir_sdk')));
  console.log('Appc NPM repo link : ' + cyan(storage.getItemSync('repo_link_npm')));
  console.log('Appc NPM clone dir : ' + cyan(storage.getItemSync('dir_npm')));
  console.log('CLI core repo link : ' + cyan(storage.getItemSync('repo_link_cli_core')));
  console.log('CLI core dir :       ' + cyan(storage.getItemSync('dir_cli_core')));
  console.log('CLI username :       ' + cyan(storage.getItemSync('username')));
  console.log('CLI password :       ' + cyan(storage.getItemSync('password')));
  console.log('Prod Org id :        ' + cyan(storage.getItemSync('prod_org_id')));
  console.log('Preprod Org id :     ' + cyan(storage.getItemSync('preprod_org_id')));
  console.log('');
  console.log('\u2714 Setup Complete.');
  console.log('');

  return callback(null, null);
};
