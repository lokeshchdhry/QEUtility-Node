var exec = require('child_process').exec;
var inquirer = require('inquirer');
var storage = require('node-persist');
var chalk = require('chalk');
var Spinner = require('cli-spinner').Spinner;
var util = require('./util');

module.exports = function() {
    //Initialize storage sync (node persist)
    storage.initSync();
    process.chdir(storage.getItemSync('dir_npm') + '/appc-install');
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
            console.log(util.error(err));
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
                    console.log(util.error(err));
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
                                console.log(util.error(err));
                            } else {
                                exec('sudo npm install --production', function(err) {
                                    if (err) {
                                        console.log(util.error(err));
                                    } else {
                                        console.log('');
                                        exec('sudo npm link', function(err) {
                                            if (err) {
                                                console.log(util.error(err));
                                            } else {
                                                console.log('');
                                                console.log('\u2714 Done building & installing appc NPM.');
                                            }
                                        }).stdout.on('data', function(data) {
                                            console.log(util.cyan(data));
                                        });
                                    }
                                }).stdout.on('data', function(data) {
                                    console.log(util.cyan(data));
                                });
                            }
                        }).stdout.on('data', function(data) {
                            console.log(util.cyan(data));
                        });
                    });
                }
            }).stdout.on('data', function(data) {
                console.log(util.cyan(data));
            });
        }
    }).stdout.on('data', function(data) {
        console.log(util.cyan('\n' + data));
    });
};
