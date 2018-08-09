'use strict'

const fs = require('fs'),
      inquirer = require('inquirer'),
      path = require('path'),
      storage = require('node-persist'),
      user = require('../misc/util').user,
      setSyncValue = require('../misc/util').setSyncValue,
      removeSyncValue = require('../misc/util').removeSyncValue,
      output = require('../misc/output'),
      exec = require('child_process').exec;


const android_sdk = process.env.ANDROID_SDK,
      android_ndk = process.env.ANDROID_NDK;


class setup{
  /*****************************************************************************
   * Check if setup has been run before & offfer user choice
   ****************************************************************************/
  static check(){
    const setuprun = storage.getItemSync('runvalue');
    return new Promise(resolve => {
    if(setuprun){
        inquirer.prompt({
          type: 'confirm',
          name: 'setupruncheck',
          message: 'RE-RUNNING SETUP WILL DELETE THE SAVED DATA. CONTINUE?',
        }).then(function(answers){
          if(answers.setupruncheck){resolve()}
          else{process.exit()}
        });
      }
      else{resolve()}
    })
  }

  /*****************************************************************************
   * Check if bash profile exists
   ****************************************************************************/
    static bashCheck(){
        return new Promise((resolve) => {
            const bashprof = fs.existsSync(path.join('/Users', user, '.bash_profile'));
            if(bashprof){ resolve(bashprof)}
            else{
                throw('bash_profile does not exist. Please create one.');
            }
        })
    }

  /*****************************************************************************
   * Check if Appc CLI exists
   ****************************************************************************/
    static appcCLICheck(){
        return new Promise((resolve) => {
            output.underline('solidarrow', 'CHECKING IF APPC CLI IS INSTALLED:');
            exec('appc -v', (err, data) => {
                if(!err){
                    resolve(output.cyan('tick', `APPC CLI CORE version ${data.trim('')} is installed`));
                }
                else{
                    throw('It seems APPC CLI is not installed & is needed by this tool. Please run \"sudo npm install -g appcelerator\" from the terminal & re-run SETUP.');
                }
            })
        })
    }

  /*****************************************************************************
   * Check if Android SDK env var exists
   ****************************************************************************/
    static androidSDKEnvVarCheck(andSDKEnvVar){
        return new Promise(resolve => {
            output.underline('solidarrow', 'CHECKING IF ANDROID_SDK ENV VARIABLE IS SET:');
            if(andSDKEnvVar === undefined){
                output.cyan('cross', 'ANDROID_SDK env variable is not set. Let\'s set it up.');

                const questions = [{
                  name: 'android_sdkPath',
                  type: 'input',
                  message: 'Enter the path for android SDK :'
                }];
                inquirer.prompt(questions).then(answers => {
                    process.chdir('/Users/' + user);
                    const data1 = fs.readFileSync('.bash_profile').toString().split("\n");
                    data1.splice(40, 0, 'export ANDROID_SDK=' + answers.android_sdkPath);
                    const text = data1.join("\n");

                    fs.writeFile('.bash_profile', text, err => {
                        if (err){
                            throw(err);
                        }
                        else {
                            resolve(output.cyan('tick', 'Done adding ANDROID_SDK to the bash_profile.'));
                        }
                    });
                });
            }
            else{resolve(output.cyan('tick', 'ANDROID_SDK is set in bash_profile.'))}
        })
    }

  /*****************************************************************************
   * Check if android NDK env var exists
   ****************************************************************************/
    static androidNDKEnvVarCheck(andNDKEnvVar){
        return new Promise(resolve => {
            output.underline('solidarrow', 'CHECKING IF ANDROID_NDK ENV VARIABLE IS SET:');
            if(andNDKEnvVar === undefined){
                output.cyan('cross', 'ANDROID_NDK env variable is not set. Let\'s set it up.');

                let questions = [{
                    name: 'android_ndkPath',
                    type: 'input',
                    message: 'Enter the path for android NDK :'
                }];
                inquirer.prompt(questions).then(answers => {
                    process.chdir('/Users/' + user);
                    const data1 = fs.readFileSync('.bash_profile').toString().split("\n");
                    data1.splice(41, 0, 'export ANDROID_NDK=' + answers.android_ndkPath);
                    const text = data1.join("\n");

                    fs.writeFile('.bash_profile', text, function(err) {
                        if (err){
                            throw(err);
                        }
                        else {resolve(output.cyan('tick', 'Done adding ANDROID_NDK to the bash_profile.'))}
                    });
                });
            }
            else{resolve(output.cyan('tick', 'ANDROID_NDK is set in bash_profile.'))}
        })
    }

  /*****************************************************************************
   * Removes the stored data
   ****************************************************************************/
    static removeSyncedData(){
        return new Promise(resolve => {
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
            removeSyncValue('workspace');
            resolve();
        })
    }

  /*****************************************************************************
   * Setup various links & paths
   ****************************************************************************/
    static setupRepoLinksNPaths(){
        return new Promise(resolve => {
            const clicore_install_path = path.join('/Users', user, '.appcelerator','install', '1.0.0');
            setSyncValue('dir_cli_core', clicore_install_path);

            output.underline('solidarrow', 'SETTING REPO LINKS & REPO PATHS:');
            let questions = [{
                name: 'repo_link_sdk',
                type: 'input',
                message: 'Enter the titanium_mobile repo link to clone :',
                validate: value => {
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
                validate: value => {
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
                validate: value => {
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
                validate: value => {
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
                validate: value => {
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
                validate: value => {
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
                validate: value => {
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
                validate: value => {
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
                validate: value => {
                  if (value.length) {
                    return true;
                  } else {
                    return 'Please enter the pre-production org id :';
                  }
                }
              },
              {
                name: 'workspace',
                type: 'input',
                message: 'Enter the path for your studio workspace:',
                validate: value => {
                  if (value.length) {
                    return true;
                  } else {
                    return 'Please enter path for your studio workspace :';
                  }
                }
              }
            ];
            inquirer.prompt(questions).then(function(answers) {
              setSyncValue('repo_link_sdk', (answers.repo_link_sdk).trim());
              setSyncValue('dir_sdk', (answers.dir_sdk).trim());
              setSyncValue('repo_link_npm', (answers.repo_link_npm).trim());
              setSyncValue('dir_npm', (answers.dir_npm).trim());
              setSyncValue('repo_link_cli_core', (answers.repo_link_cli_core).trim());
              setSyncValue('username', (answers.username).trim());
              setSyncValue('password', (answers.password).trim());
              setSyncValue('prod_org_id', (answers.prod_org_id).trim());
              setSyncValue('preprod_org_id', (answers.preprod_org_id).trim());
              setSyncValue('workspace', (answers.workspace).trim());

              //Set the count to 1 in the storage when setup is run. This count is used to track if setup is run atleast once.
              setSyncValue('runvalue', true);
              resolve();
            })
        });
    }

  /*****************************************************************************
   * Display stored data
   ****************************************************************************/
    static displayData(show){
        return new Promise(resolve => {
            const cyan = require('../misc/util').cyan;
            console.log('');
            output.underline('solidarrow','STORED INFORMATION:');
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
            console.log('Workspace :          ' + cyan(storage.getItemSync('workspace')));
            console.log('');
            if(!show){
              console.log('\u2714 Setup Complete.');
              console.log('');
            }
            resolve();
        })
    }

  /*****************************************************************************
   * Call the methods
   ****************************************************************************/
    static run(){
        let p = Promise.resolve()
        .then(() => {return setup.check()})
        .then(() => {return setup.bashCheck()})
        .then(() => {return setup.appcCLICheck()})
        .then(() => {return setup.androidSDKEnvVarCheck(android_sdk)})
        .then(() => {return setup.androidNDKEnvVarCheck(android_ndk)})
        .then(() => {return setup.removeSyncedData()})
        .then(() => {return setup.setupRepoLinksNPaths()})
        .then(() => {return setup.displayData(false)})
        .catch(err => output.error(err));
    }
}

module.exports = setup;
