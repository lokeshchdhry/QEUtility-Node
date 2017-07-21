var inquirer = require('inquirer'),
    storage = require('node-persist'),
    error = require('../misc/util').error,
    cyan = require('../misc/util').cyan;

module.exports = function() {
    //Initialize storage sync (node persist)
    storage.initSync();
    var questions = [{
        name: 'clear',
        type: 'confirm',
        message: 'Are you sure you want to clear the stored repo paths & links?',
    }];
    inquirer.prompt(questions).then(function(answers) {
        if (answers.clear) {
            storage.clear(function(err) {
                if (err) console.log(error(err));
                console.log(cyan('\n\u25B6 Done clearing memory.'));
            });
        }
    });
};
