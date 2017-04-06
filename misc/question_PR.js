var inquirer = require('inquirer');

module.exports = function question_PR(callback) {
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
    callback(null, answers);
  });
};
