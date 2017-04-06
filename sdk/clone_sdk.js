var exec = require('child_process').exec;
var fs = require('fs');
var storage = require('node-persist');
var inquirer = require('inquirer');
var util = require('../misc/util');
var clone = require('../misc/clone_repo');

module.exports = function() {
    //Initialize storage sync (node persist)
    storage.initSync();
    //Check if repo link & repo dir is stored? If not ask for it else prceed to clone.
    if (util.repolink_sdk === undefined) {
        console.log(util.bold('\n\u25B6 Appears that you have not set your default titanium mobile repo link & directory to clone to.'));
        //questions object array
        var questions = [{
                name: 'repo_link',
                type: 'input',
                message: 'Enter the repo link to clone :',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter the repo link to clone :';
                    }
                }
            },
            {
                name: 'dir',
                type: 'input',
                message: 'Enter path to dir where you want to clone the repo :',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter path to dir where you want to clone the repo';
                    }
                }
            }
        ];
        inquirer.prompt(questions).then(function(answers) {
            //Storing the repo link & repo dir using node persist.
            storage.setItemSync('repo_link_sdk', answers.repo_link);
            storage.setItemSync('dir_sdk', answers.dir);
            //Calling clone
            clone(answers.repo_link, answers.dir, 'titanium_mobile');
        });
    } else {
        //Getting the values & setting it to repoLink & repoDir
        var repoLink = util.repolink_sdk;
        var repoDir = util.sdk_dir;
        console.log(util.cyan('\n\u25B6 Clone link: ' + repoLink));
        console.log(util.cyan('\u25B6 Clone dir: ' + repoDir));
        //Calling clone
        clone(repoLink, repoDir, 'titanium_mobile');
    }
};
