var exec = require('child_process').exec;
var inquirer = require('inquirer');
var storage = require('node-persist');
var chalk = require('chalk');

//Setting theme for colors
var error = chalk.bold.red;
var underline = chalk.underline;
var Spinner = require('cli-spinner').Spinner;
var cyan = chalk.cyan;
var bold = chalk.bold;

module.exports = function() {
    //Initialize storage sync (node persist)
    storage.initSync();
    process.chdir(storage.getItemSync('dir_sdk') + '/titanium_mobile');
    console.log('');

    //Start the spinner
    spinner = new Spinner(' Pulling any changes from github ...... Please wait');
    spinner.setSpinnerString(0);
    spinner.setSpinnerDelay(60);
    spinner.start();

    exec('git pull', {
        maxBuffer: 1024 * 1000
    }, function(err) {
        if (err) {
            console.log(error(err));
        } else {
            //Stop spinner
            spinner.stop(true);

            console.log('');
            //Start the spinner
            spinner = new Spinner(' Fetching all pull requests ...... Please wait');
            spinner.setSpinnerString(0);
            spinner.setSpinnerDelay(60);
            spinner.start();

            exec('git fetch origin', {
                maxBuffer: 1024 * 1000
            }, function(err) {
                if (err) {
                    console.log(error(err));
                } else {
                    //Stop spinner
                    spinner.stop(true);

                    var questions = [{
                        name: 'pr_no',
                        type: 'input',
                        message: 'Enter the PR number to build for :',
                        validate: function(value) {
                            if (value.length) {
                                return true;
                            } else {
                                return 'Please enter PR number to build for.';
                            }
                        }
                    }];
                    inquirer.prompt(questions).then(function(answers) {
                        exec('git checkout pr/' + answers.pr_no, {
                            maxBuffer: 1024 * 500
                        }, function(err) {
                            if (err) {
                                console.log(error(err));
                            } else {
                                //CD into the build folder in the repo.
                                process.chdir(storage.getItemSync('dir_sdk') + '/titanium_mobile/build');
                                exec('npm install', function(err) {
                                    if (err) console.log(error(err));
                                    console.log(underline(bold('\n\u25B6 BUILDING THE SDK:')));
                                    //Build the SDK
                                    exec('node scons.js build', {
                                        maxBuffer: 1024 * 500
                                    }, function(err) {
                                        if (err) console.log(error(err));
                                        console.log(underline(bold('\n\u25B6 PACKAGING THE SDK:')));
                                        //Package the SDK
                                        exec('node scons.js package', {
                                            maxBuffer: 1024 * 500
                                        }, function(err) {
                                            if (err) console.log(error(err));
                                            console.log(underline(bold('\n\u25B6 INSTALLING THE SDK:')));
                                            //Install the SDK
                                            exec('node scons.js install', {
                                                maxBuffer: 1024 * 500
                                            }, function(err) {
                                                if (err) console.log(error(err));
                                                console.log('\n\u2714 Done, please find the installed SDK in your titanium folder');
                                                console.log('');
                                            }).stdout.on('data', function(data) {
                                                console.log(cyan(data));
                                            });
                                        }).stdout.on('data', function(data) {
                                            console.log(cyan(data));
                                        });
                                    }).stdout.on('data', function(data) {
                                        console.log(cyan(data));
                                    });
                                }).stdout.on('data', function(data) {
                                    console.log(cyan(data));
                                });
                            }
                        }).stdout.on('data', function(data) {
                            console.log(cyan(data));
                        });
                    });
                }
            }).stdout.on('data', function(data) {
                console.log(cyan(data));
            });
        }
    }).stdout.on('data', function(data) {
        console.log(cyan('\n' + data));
    });
};
