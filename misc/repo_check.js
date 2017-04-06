var util = require('../misc/util');
var fs = require('fs');

var repo_check = function(repoName, callback){
  switch(repoName){
    case 'timob':
      if(!fs.existsSync(util.sdk_dir)){
        callback(false);
        break;
      }
      callback(true);
      break;
    case 'clinpm':
      if(!fs.existsSync(util.npm_dir)){
        callback(false);
        break;
      }
      callback(true);
      break;
    case 'clicore':
      if(!fs.existsSync(util.clicore_dir)){
        callback(false);
        break;
      }
      callback(true);
      break;
    default:
      console.log('Invalid repo name provided');
      // callback(null,null);
  }
};

exports.repo_check = repo_check;
