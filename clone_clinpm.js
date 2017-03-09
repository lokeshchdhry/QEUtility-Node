var exec = require('child_process').exec;
var fs = require('fs');
var storage = require('node-persist');
var inquirer = require('inquirer');
var chalk = require('chalk');
var util = require('./util');


module.exports = function() {
    //Initialize storage sync (node persist)
    storage.initSync();
    console.log(storage.getItemSync('repo_link_npm'));
    //Check if repo link & repo dir is stored? If not ask for it else prceed to clone.
    if (storage.getItemSync('repo_link_npm') === undefined) {
        console.log(util.bold('\n\u25B6 Appears that you have not set your default Appc npm repo link & directory to clone to.'));
        //questions object array
        var questions = [{
                name: 'repo_link',
                type: 'input',
                message: 'Enter the appc npm repo link to clone :',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter the appc npm repo link to clone :';
                    }
                }
            },
            {
                name: 'dir',
                type: 'input',
                message: 'Enter path to dir where you want to clone the appc npm repo :',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter path to dir where you want to clone the appc npm repo';
                    }
                }
            }
        ];
        inquirer.prompt(questions).then(function(answers) {
            //Storing the repo link & repo dir using node persist.
            storage.setItemSync('repo_link_npm', answers.repo_link);
            storage.setItemSync('dir_npm', answers.dir);
            //Calling clone
            clone(answers.repo_link, answers.dir);
        });
    } else {
        //Getting the values & setting it to repoLink & repoDir
        var repoLink = storage.getItemSync('repo_link_npm');
        var repoDir = storage.getItemSync('dir_npm');
        console.log(util.cyan('\n\u25B6 Clone link: ' + repoLink));
        console.log(util.cyan('\u25B6 Clone dir: ' + repoDir));
        //Calling clone
        clone(repoLink, repoDir);
    }
};

//Clone function
var clone = function(repo_link, repo_dir) {
    process.chdir(repo_dir);

    console.log('');
    console.log('\u25B6 Cloning Appc npm repo .... Please Wait.');
    //Start spinner
    util.spinner_start();

    exec('git clone ' + repo_link, function(err) {
        if (err) {
            console.log(util.error(err));
            //Stop the process
            process.exit();
        } else {
            //Stop spinner
            util.spinner_stop(true);
            console.log(util.cyan('\n\n\u2714 Cloning done successfully.'));
            process.chdir(repo_dir + '/appc-install/.git');
            //Call modify_config from utils.js
            util.modify_config();
        }
    }).stdout.on('data', function(data) {
        console.log(util.bold(data));
    });
};