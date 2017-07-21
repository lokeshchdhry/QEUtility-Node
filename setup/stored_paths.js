var cyan = require('../misc/util').cyan,
    underline = require('../misc/util').underline,
    bold = require('../misc/util').bold,
    util = require('../misc/util');

module.exports = function(){
  console.log('');
  console.log(underline(bold('\u25B6 Stored path & link information:')));
  console.log('TIMOB repo link :    ' + cyan(util.repolink_sdk));
  console.log('TIMOB SDK clone dir: ' + cyan(util.sdk_dir));
  console.log('Appc NPM repo link : ' + cyan(util.repolink_clinpm));
  console.log('Appc NPM clone dir : ' + cyan(util.npm_dir));
  console.log('CLI core repo link : ' + cyan(util.repolink_clicore));
  console.log('CLI core dir :       ' + cyan(util.clicore_dir));
  console.log('CLI username :       ' + cyan(util.username));
  console.log('Prod Org id :        ' + cyan(util.prod_org_id));
  console.log('Preprod Org id :     ' + cyan(util.preprod_org_id));
  console.log('');
};
