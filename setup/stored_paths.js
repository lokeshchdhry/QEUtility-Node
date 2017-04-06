var util = require('../misc/util');

module.exports = function(){
  console.log('');
  console.log(util.underline(util.bold('\u25B6 Stored path & link information:')));
  console.log('TIMOB repo link :    ' + util.cyan(util.repolink_sdk));
  console.log('TIMOB SDK clone dir: ' + util.cyan(util.sdk_dir));
  console.log('Appc NPM repo link : ' + util.cyan(util.repolink_clinpm));
  console.log('Appc NPM clone dir : ' + util.cyan(util.npm_dir));
  console.log('CLI core repo link : ' + util.cyan(util.repolink_clicore));
  console.log('CLI core dir :       ' + util.cyan(util.clicore_dir));
  console.log('');
};
