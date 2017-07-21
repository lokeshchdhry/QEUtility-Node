var storage = require('node-persist'),
    inquirer = require('inquirer'),
    clone = require('../misc/clone_repo'),
    repolink_clinpm = require('../misc/util').repolink_clinpm,
    npm_dir = require('../misc/util').npm_dir,
    cyan = require('../misc/util').cyan,
    bold = require('../misc/util').bold;

module.exports = function() {
  //Initialize storage sync (node persist)
  storage.initSync();
  //Check if repo link & repo dir is stored? If not ask for it else prceed to clone.
  if (repolink_clinpm === undefined) {
    console.log(bold('\n\u25B6 Appears that you have not set your default Appc npm repo link & directory to clone to.'));
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
    clone(answers.repo_link, answers.dir, 'appc-install');
  });
} else {
  console.log(cyan('\n\u25B6 Clone link: ' + repolink_clinpm));
  console.log(cyan('\u25B6 Clone dir: ' + npm_dir));
  //Calling clone
  clone(repolink_clinpm, npm_dir, 'appc-install');
}
};
