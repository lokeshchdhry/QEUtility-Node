var fs = require('fs');
var chalk = require('chalk');
var inquirer = require('inquirer');
var util = require('../misc/util');

module.exports = function() {
    //Get the username
    var user = util.user;

    //Hardcoding the cli core clone path/dir
    var clicore_install_path = '/Users/' + user + '/.appcelerator/install/1.0.0';
    util.setSyncValue('dir_cli_core', clicore_install_path);

    //Checking if bash_profile exists
    fs.exists('/Users/' + user + '/.bash_profile', function(exists) {
        if (exists) {
            var android_sdk = process.env.ANDROID_SDK;
            var android_ndk = process.env.ANDROID_NDK;

            console.log(util.underline('\nChecking if ANDROID_SDK env variable is set.'));
            if (android_sdk === undefined) {
                console.log(util.cyan('\n\u2717 ANDROID_SDK env variable is not set. I will help to set it up.'));

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
                        if (err) return console.log(util.error(err));
                        else {
                            console.log(util.cyan('\n\u2714 Done adding ANDROID_SDK to the bash_profile.'));
                        }
                    });
                });
            } else {
                console.log(util.cyan('\u2714 ANDROID_SDK is set in bash_profile\n'));
            }
            console.log(util.underline('\nChecking if ANDROID_NDK env variable is set.'));
            if (android_ndk === undefined) {
                console.log(util.cyan('\n\u2717 ANDROID_SNK env variable is not set. I will help to set it up.'));

                var questions1 = [{
                    name: 'android_ndkPath',
                    type: 'input',
                    message: 'Enter the path for android NDK :'
                }];
                inquirer.prompt(questions1).then(function(answers) {
                    //CD into the user dir
                    process.chdir('/Users/' + user);
                    //Logic to edit bash profile to add ANDROID_SDK & ANDROID_NDK
                    var data1 = fs.readFileSync('.bash_profile').toString().split("\n");
                    data1.splice(41, 0, 'export ANDROID_NDK=' + answers.android_ndkPath);
                    var text = data1.join("\n");

                    fs.writeFile('.bash_profile', text, function(err) {
                        if (err) return console.log(util.error(err));
                        else {
                            console.log(util.cyan('\n\u2714 Done adding ANDROID_NDK to the bash_profile.'));
                        }
                    });
                });
            } else {
                console.log(util.cyan('\u2714 ANDROID_NDK is set in bash_profile'));
            }

            console.log(util.underline('\n\u25B6 Setting repo links & repo paths:'));
            //questions object array
            var questions2 = [{
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
                }
            ];
            inquirer.prompt(questions2).then(function(answers) {
                //Storing the repo link & repo dir using node persist.
                util.setSyncValue('repo_link_sdk', answers.repo_link_sdk);
                util.setSyncValue('dir_sdk', answers.dir_sdk);
                util.setSyncValue('repo_link_npm', answers.repo_link_npm);
                util.setSyncValue('dir_npm', answers.dir_npm);
                util.setSyncValue('repo_link_cli_core', answers.repo_link_cli_core);

                //Getting the stored info & printing the details to console
                console.log('');
                console.log(util.underline('\u25B6 Stored information:'));
                console.log('TIMOB repo link :    ' + util.cyan(util.repolink_sdk));
                console.log('TIMOB SDK clone dir: ' + util.cyan(util.sdk_dir));
                console.log('Appc NPM repo link : ' + util.cyan(util.repolink_clinpm));
                console.log('Appc NPM clone dir : ' + util.cyan(util.npm_dir));
                console.log('CLI core repo link : ' + util.cyan(util.repolink_clicore));
                console.log('CLI core dir :       ' + util.cyan(util.clicore_dir));
                console.log('');
                console.log('\u2714 Setup Complete.');
                console.log('');
            });

        } else {
            console.log(util.error('\n\u2717.bash_profile does not exist. Please create one.'));
        }
    });
};
