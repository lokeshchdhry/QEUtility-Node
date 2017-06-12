var spawn = require('child_process').spawn;
var fs = require('fs');
var Async = require('async');
var _ = require('underscore');
var path = require('path');
var execute = require('../misc/util').execute;
var cyan = require('../misc/util').cyan;
var error = require('../misc/util').error;
var errorNExit = require('../misc/util').errorNExit;
var user = require('../misc/util').user;

module.exports = function(){

  var task = [];
  task.push(function(callback){getStudioVer(callback);});
  task.push(function(callback){getSDKVer(callback);});
  task.push(function(callback){getOSVer(callback);});
  task.push(function(callback){getXcodeVer(callback);});
  task.push(function(callback){getAppcNPMVer(callback);});
  task.push(function(callback){getAppcCliCoreVer(callback);});
  task.push(function(callback){getTiCliVer(callback);});
  task.push(function(callback){getAlloyVer(callback);});
  task.push(function(callback){getNodeVer(callback);});
  task.push(function(callback){getJavaVer(callback);});
  task.push(function(callback){getENV(callback);});
  task.push(function(callback){getConnectedDevices(callback);});
  task.push(function(callback){getAndroidSDKTools(callback);});
  task.push(function(callback){getPlatformTools(callback);});
  task.push(function(callback){getBuildTools(callback);});
  task.push(function(callback){getAndroidModules(callback);});
  task.push(function(callback){getIOSModules(callback);});
  task.push(function(callback){getCommonjsModules(callback);});

  Async.parallel(task, function(err, results){
    if(err){
      console.log(error(err));
      //exit process in case of error
      process.exit();
    }

    console.log('\nStudio Ver:     '+cyan(results[0]));
    console.log('SDK Ver:        '+cyan(results[1]));
    console.log('OS Ver:         '+cyan(results[2].trim()));
    console.log('Xcode Ver:      '+cyan(results[3].trim()));
    console.log('Appc NPM:       '+cyan(results[4]));
    console.log('Appc CLI:       '+cyan(results[5]));
    console.log('Ti CLI Ver:     '+cyan(results[6].trim()));
    console.log('Alloy Ver:      '+cyan(results[7].trim()));
    console.log('Node Ver:       '+cyan(results[8]));
    console.log('Java Ver:       '+cyan(results[9]));
    console.log('Devices:        '+cyan(results[11].trim()));
    console.log('Environment:    '+cyan(results[10].trim()));
    console.log('\nSDK Tools:      '+cyan(results[12]));
    console.log('Platform Tools: '+cyan(results[13]));
    console.log('Build Tools:    '+cyan(results[14]));
    console.log('\nAndroid Modules:'+cyan(results[15]));
    console.log('\nIOS Modules:    '+cyan(results[16]));
    console.log('\nCommjs Modules: '+cyan(results[17])+'\n');
  });
};

var getStudioVer = function(callback){
  var txtPath = path.join('/Applications','Appcelerator Studio','version.txt');
  //Check if version.txt file exists
  if(fs.existsSync(txtPath)){
    var text = fs.readFileSync(txtPath, 'utf8').split('\n');
    var ver = _.chain(text).map(function(text){return text.split(' ');}).flatten().value();
    callback(null, ver[2]);
  }
  else{
    callback(null, 'Appc Studio not installed.');
  }
};

var getSDKVer = function(callback){
  execute('appc ti config -o json', function(err, data){
    //Converting the json text to javascript object using JSON.parse & getting the "sdk.selected" value
    if (err) {
      errorNExit(err);
    }
    var ver = JSON.parse(data)["sdk.selected"];
    callback(null, ver);
  });
};

var getAppcNPMVer = function(callback){
  execute('appc -v -o json', function(err, result){
    if (err) {
      errorNExit(err);
    }
    callback(null, JSON.parse(result).NPM);
  });
};

var getAppcCliCoreVer = function(callback){
  execute('appc -v -o json', function(err, result){
    if (err) {
      errorNExit(err);
    }
    callback(null, JSON.parse(result).CLI);
  });
};

var getOSVer = function(callback){
  execute('sw_vers -productVersion', function(err, result){
    if (err) {
      errorNExit(err);
    }
    var os_ver = result;
    callback(null, os_ver);
  });
};

var getXcodeVer = function(callback){
  if(fs.existsSync(path.join('/usr', 'bin', 'xcodebuild'))){
    execute('/usr/bin/xcodebuild -version', function(err, result){
      if (err) {
        errorNExit(err);
      }
      var split = result.split('Build');
      var xcode_ver = split[0];
      callback(null, xcode_ver);
    });
  }
  else{
    callback(null, 'Xcode not installed');
  }
};

var getTiCliVer = function(callback){
  execute('appc ti -v', function(err, result){
    if (err) {
      errorNExit(err);
    }
    var ti_ver = result;
    callback(null, ti_ver);
  });
};

var getAlloyVer = function(callback){
  execute('appc alloy -v', function(err, result){
    if (err) {
      errorNExit(err);
    }
    var alloy_ver = result;
    callback(null, alloy_ver);
  });
};

var getNodeVer = function(callback){
  var node_ver = process.versions.node;
  callback(null, node_ver);
};

var getJavaVer = function(callback) {
  var spawn = require('child_process').spawn('java', ['-version']);
  spawn.on('error', function(err){
    errorNExit(err);
  });
  spawn.stderr.on('data', function(data) {
    data = data.toString().split('\n')[0];
    var javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
    if (javaVersion !== false) {
      callback(null, javaVersion);
    }
  });
};

var getENV = function(callback){
  execute('appc whoami', function(err, result){
    if (err) {
      errorNExit(err);
    }
    var env = result.split('organization')[1].trim(' ');
    callback(null, env);
  });
};

var getConnectedDevices  = function(callback){
  execute('appc ti info -t android -o json', function(err, result){
    if (err) {
      errorNExit(err);
    }
    //reading nuber of devices connected
    var count = JSON.parse(result).android.devices.length;
    if(count === 0){
      callback(null, 'No device attached');
    }
    else{
      //creating a device object
      var device = {};
      var devices = '';
      for(var i=0; i<count; i++){
        //putting device details in object
        device['brand'+i] = JSON.parse(result).android.devices[i].brand;
        device['model'+i] = JSON.parse(result).android.devices[i].model;
        device['os_ver'+i] = JSON.parse(result).android.devices[i].release;

        devices += '\u21E8 '+device['brand'+i]+' '+device['model'+i]+' --- Android '+device['os_ver'+i]+'\n'+'                ';
      }
      callback(null, devices);
    }
  });
};

var getAndroidSDKTools = function(callback){
  var android_sdkPath = process.env.ANDROID_SDK;
  var sdktools_path = path.join(android_sdkPath,'tools');
  //Checking if source.properties file exists
  if(fs.existsSync(path.join(sdktools_path,'source.properties'))){
    fs.readFile(path.join(sdktools_path, 'source.properties'), function(err, result){
      if(err){
        errorNExit(err);
      }
      current_ver = result.toString().split('Pkg.Revision=')[1].split('\n')[0];
      callback(null, current_ver);
    });
  }
  else{
    callback(null, 'No Android SDK Tools Installed.');
  }
};

var getPlatformTools = function(callback){
  var android_sdkPath = process.env.ANDROID_SDK;
  var sdktools_path = path.join(android_sdkPath,'platform-tools');
  //Checking if source.properties file exists
  if(fs.existsSync(path.join(sdktools_path,'source.properties'))){
    var result = fs.readFileSync(path.join(sdktools_path, 'source.properties'));
      current_ver = result.toString().split('Pkg.Revision=')[1].split('\n')[0];
      callback(null, current_ver);
  }
  else{
    callback(null, 'No Platform Tools Installed.');
  }
};

var getBuildTools = function(callback){
  var folders;
  var filter_arr = [];
  var current_ver;
  var android_sdkPath = process.env.ANDROID_SDK;
  var buildtools_path = path.join(android_sdkPath, 'build-tools');
  //Checking if build-tools folder exists
  if(fs.existsSync(buildtools_path)){
    //Reading the directory for child directories synchronously
    folders = fs.readdirSync(buildtools_path);
      //filtering out DS.store file from the array of folders
      _.filter(folders, function(folder){
        if(folder !== '.DS_Store'){
          filter_arr.push(folder);
        }
      });
        var highest = filter_arr[filter_arr.length-1];
        callback(null, highest);
    }
    else{
      callback(null, 'No Build Tools Installed.');
    }
};

var getAndroidModules = function(callback){
    var modules={}, folders, filterArr=[];
    var facebookModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'android', 'facebook');
    var hyperloopModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'android', 'hyperloop');
    var cloudpushModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'android', 'ti.cloudpush');
    var mapModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'android', 'ti.map');
    var touchidModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'android', 'ti.touchid');

    if(fs.existsSync(facebookModPath)){
      folders = fs.readdirSync(facebookModPath);
      if(folders){
        _.filter(folders, function(folder){
          if(folder !== '.DS_Store'){
           filterArr.push(folder);
         }
       });
       modules.facebook = filterArr;
      }
    }
    else{
      modules.facebook = 'No Facebook modules';
    }

    if(fs.existsSync(hyperloopModPath)){
      filterArr=[];
      folders = fs.readdirSync(hyperloopModPath);
      if(folders){
        _.filter(folders, function(folder){
          if(folder !== '.DS_Store'){
           filterArr.push(folder);
         }
       });
       modules.hyperloop = filterArr;
      }
    }
    else{
      modules.hyperloop = 'No Hyperloop modules';
    }

    if(fs.existsSync(cloudpushModPath)){
      filterArr=[];
      folders = fs.readdirSync(cloudpushModPath);
      if(folders){
        _.filter(folders, function(folder){
          if(folder !== '.DS_Store'){
           filterArr.push(folder);
         }
       });
       modules.cloudpush = filterArr;
      }
    }
    else{
      modules.cloudpush = 'No Cloudpush modules';
    }

    if(fs.existsSync(mapModPath)){
      filterArr=[];
      folders = fs.readdirSync(mapModPath);
      if(folders){
        _.filter(folders, function(folder){
          if(folder !== '.DS_Store'){
           filterArr.push(folder);
         }
       });
       modules.map = filterArr;
      }
    }
    else{
      modules.map = 'No Map modules';
    }

    if(fs.existsSync(touchidModPath)){
      filterArr=[];
      folders = fs.readdirSync(touchidModPath);
      if(folders){
        _.filter(folders, function(folder){
          if(folder !== '.DS_Store'){
           filterArr.push(folder);
         }
       });
       modules.touchid= filterArr;
      }
    }
    else{
      modules.touchid = 'No TouchID modules';
    }

    var androidModules = 'Facebook:  '+modules.facebook+'\n '+'               Hyperloop: '+modules.hyperloop+'\n '+'               Cloudpush: '+modules.cloudpush+'\n '+'               Map:       '+modules.map+'\n '+'               TouchID:   '+modules.touchid;
    callback(null, androidModules);
};

var getIOSModules = function(callback){
    var modules={}, folders, filterArr=[];
    var facebookModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'iphone', 'facebook');
    var hyperloopModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'iphone', 'hyperloop');
    var coremotionModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'iphone', 'ti.coremotion');
    var mapModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'iphone', 'ti.map');
    var touchidModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'iphone', 'ti.touchid');

    if(fs.existsSync(facebookModPath)){
      folders = fs.readdirSync(facebookModPath);
      if(folders){
        _.filter(folders, function(folder){
          if(folder !== '.DS_Store'){
           filterArr.push(folder);
         }
       });
       modules.facebook = filterArr;
      }
    }
    else{
      modules.facebook = 'No Facebook modules';
    }

    if(fs.existsSync(hyperloopModPath)){
      filterArr=[];
      folders = fs.readdirSync(hyperloopModPath);
      if(folders){
        _.filter(folders, function(folder){
          if(folder !== '.DS_Store'){
           filterArr.push(folder);
         }
       });
       modules.hyperloop = filterArr;
      }
    }
    else{
      modules.hyperloop = 'No Hyperloop modules';
    }

    if(fs.existsSync(coremotionModPath)){
      filterArr=[];
      folders = fs.readdirSync(coremotionModPath);
      if(folders){
        _.filter(folders, function(folder){
          if(folder !== '.DS_Store'){
           filterArr.push(folder);
         }
       });
       modules.coremotion = filterArr;
      }
    }
    else{
      modules.coremotion = 'No Coremotion modules';
    }

    if(fs.existsSync(mapModPath)){
      filterArr=[];
      folders = fs.readdirSync(mapModPath);
      if(folders){
        _.filter(folders, function(folder){
          if(folder !== '.DS_Store'){
           filterArr.push(folder);
         }
       });
       modules.map = filterArr;
      }
    }
    else{
      modules.map = 'No Map modules';
    }

    if(fs.existsSync(touchidModPath)){
      filterArr=[];
      folders = fs.readdirSync(touchidModPath);
      if(folders){
        _.filter(folders, function(folder){
          if(folder !== '.DS_Store'){
           filterArr.push(folder);
         }
       });
       modules.touchid= filterArr;
      }
    }
    else{
      modules.touchid = 'No TouchID modules';
    }

    var iosModules = 'Facebook:  '+modules.facebook+'\n '+'               Hyperloop: '+modules.hyperloop+'\n '+'               Coremotion:'+modules.coremotion+'\n '+'               Map:       '+modules.map+'\n '+'               TouchID:   '+modules.touchid;
    callback(null, iosModules);
};

var getCommonjsModules = function(callback){
  var modules={}, folders, filterArr=[];
  var cloudModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'commonjs', 'ti.cloud');

  if(fs.existsSync(cloudModPath)){
    folders = fs.readdirSync(cloudModPath);
    if(folders){
      _.filter(folders, function(folder){
        if(folder !== '.DS_Store'){
         filterArr.push(folder);
       }
     });
     modules.cloud = filterArr;
    }
  }
  else{
    modules.cloud = 'No Facebook modules';
  }

  var commonjsModules = 'Cloud:     '+modules.cloud;
  callback(null, commonjsModules);
};
