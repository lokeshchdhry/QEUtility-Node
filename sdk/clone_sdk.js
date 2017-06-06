var storage = require('node-persist'),
inquirer = require('inquirer'),
clone = require('../misc/clone_repo'),
repolink_sdk = require('../misc/util').repolink_sdk,
bold = require('../misc/util').bold,
sdk_dir = require('../misc/util').sdk_dir,
cyan = require('../misc/util').cyan;

module.exports = function() {
    //Initialize storage sync (node persist)
    storage.initSync();
    //Check if repo link & repo dir is stored? If not ask for it else prceed to clone.
    if (repolink_sdk === undefined) {
        console.log(bold('\n\u25B6 Appears that you have not set your default titanium mobile repo link & directory to clone to.'));
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
        console.log(cyan('\n\u25B6 Clone link: ' + repolink_sdk));
        console.log(cyan('\u25B6 Clone dir: ' + sdk_dir));
        //Calling clone
        clone(repolink_sdk, sdk_dir, 'titanium_mobile');
    }
};
