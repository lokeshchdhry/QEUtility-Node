var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var util = require('../misc/util');
var Async = require('async');
var _ = require('underscore');
var path = require('path');

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

  Async.series(task, function(err, results){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }

    console.log('\nStudio Ver:     '+util.cyan(results[0]+'\n'));
    console.log('SDK Ver:        '+util.cyan(results[1]+'\n'));
    console.log('OS Ver:         '+util.cyan(results[2]));
    console.log('Xcode Ver:      '+util.cyan(results[3]));
    console.log('Appc NPM:       '+util.cyan(results[4]+'\n'));
    console.log('Appc CLI:       '+util.cyan(results[5]+'\n'));
    console.log('Ti CLI Ver:     '+util.cyan(results[6]));
    console.log('Alloy Ver:      '+util.cyan(results[7]));
    console.log('Node Ver:       '+util.cyan(results[8]+'\n'));
    console.log('Java Ver:       '+util.cyan(results[9]+'\n'));
    console.log('Environment:    '+util.cyan(results[10]+'\n'));
    console.log('Devices:        '+util.cyan(results[11]));
    console.log('\nSDK Tools:      '+util.cyan(results[12])+'\n');
    console.log('Platform Tools: '+util.cyan(results[13])+'\n');
    console.log('Build Tools:    '+util.cyan(results[14])+'\n');
    console.log('Android Modules:'+util.cyan(results[15])+'\n');
    console.log('IOS Modules:    '+util.cyan(results[16])+'\n');
    console.log('Commjs Modules: '+util.cyan(results[17])+'\n');
  });
};

function getStudioVer(callback){
  var text = fs.readFileSync('/Applications/Appcelerator Studio/version.txt', 'utf8').split('\n');
  var ver = _.chain(text).map(function(text){return text.split(' ');}).flatten().value();
  callback(null, ver[2]);
}

function getSDKVer(callback){
  exec('appc ti config -o json', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    //Converting the json text to javascript object using JSON.parse & getting the "sdk.selected" value
    var ver = JSON.parse(result)["sdk.selected"];
    callback(null, ver);
  });
}

function getAppcNPMVer(callback){
  exec('appc -v -o json', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    callback(null, JSON.parse(result).NPM);
  });
}

function getAppcCliCoreVer(callback){
  exec('appc -v -o json', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    callback(null, JSON.parse(result).CLI);
  });
}

function getOSVer(callback){
  exec('sw_vers -productVersion', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var os_ver = result;
    callback(null, os_ver);
  });
}

function getXcodeVer(callback){
  exec('/usr/bin/xcodebuild -version', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var split = result.split('Build');
    var xcode_ver = split[0];
    callback(null, xcode_ver);
  });
}

function getTiCliVer(callback){
  exec('appc ti -v', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var ti_ver = result;
    callback(null, ti_ver);
  });
}

function getAlloyVer(callback){
  exec('appc alloy -v', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var alloy_ver = result;
    callback(null, alloy_ver);
  });
}

function getNodeVer(callback){
  var node_ver = process.versions.node;
  callback(null, node_ver);
}

function getJavaVer(callback) {
  var spawn = require('child_process').spawn('java', ['-version']);
  spawn.on('error', function(err){
    console.log(util.error(err));
    //exit process in case of error
    process.exit();
  });
  spawn.stderr.on('data', function(data) {
    data = data.toString().split('\n')[0];
    var javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
    if (javaVersion !== false) {
      callback(null, javaVersion);
    }
  });
}

function getENV(callback){
  exec('appc whoami', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
    }
    var env = result.split('organization')[1].trim(' ');
    callback(null, env);
  });
}

function getConnectedDevices(callback){
  exec('appc ti info -t android -o json', function(err, result){
    if(err){
      console.log(util.error(err));
      //exit process in case of error
      process.exit();
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
}

function getAndroidSDKTools(callback){
  var android_sdkPath = process.env.ANDROID_SDK;
  var sdktools_path = path.join(android_sdkPath,'tools');
  //Checking if source.properties file exists
  if(fs.existsSync(path.join(sdktools_path,'source.properties'))){
    fs.readFile(path.join(sdktools_path, 'source.properties'), function(err, result){
      if(err){
        log(err);
        //exit process in case of error
          process.exit();
      }
      current_ver = result.toString().split('Pkg.Revision=')[1].split('\n')[0];
      callback(null, current_ver);
    });
  }
  else{
    callback(null, 'No Android SDK Tools Installed.');
  }
}

function getPlatformTools(callback){
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
}

function getBuildTools(callback){
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
}

function getAndroidModules(callback){
    var modules={}, folders, filterArr=[];
    var facebookModPath = path.join('/Users', util.user, 'Library', 'Application Support', 'Titanium', 'modules', 'android', 'facebook');
    var hyperloopModPath = path.join('/Users', util.user, 'Library', 'Application Support', 'Titanium', 'modules', 'android', 'hyperloop');
    var cloudpushModPath = path.join('/Users', util.user, 'Library', 'Application Support', 'Titanium', 'modules', 'android', 'ti.cloudpush');
    var mapModPath = path.join('/Users', util.user, 'Library', 'Application Support', 'Titanium', 'modules', 'android', 'ti.map');
    var touchidModPath = path.join('/Users', util.user, 'Library', 'Application Support', 'Titanium', 'modules', 'android', 'ti.touchid');

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

    var androidModules = 'Facebook: '+JSON.stringify(modules.facebook)+', '+'Hyperloop: '+JSON.stringify(modules.hyperloop)+', '+'Cloudpush: '+JSON.stringify(modules.cloudpush)+', '+'Map: '+JSON.stringify(modules.map)+', '+'TouchID: '+JSON.stringify(modules.touchid);
    callback(null, androidModules);
}

function getIOSModules(callback){
    var modules={}, folders, filterArr=[];
    var facebookModPath = path.join('/Users', util.user, 'Library', 'Application Support', 'Titanium', 'modules', 'iphone', 'facebook');
    var hyperloopModPath = path.join('/Users', util.user, 'Library', 'Application Support', 'Titanium', 'modules', 'iphone', 'hyperloop');
    var coremotionModPath = path.join('/Users', util.user, 'Library', 'Application Support', 'Titanium', 'modules', 'iphone', 'ti.coremotion');
    var mapModPath = path.join('/Users', util.user, 'Library', 'Application Support', 'Titanium', 'modules', 'iphone', 'ti.map');
    var touchidModPath = path.join('/Users', util.user, 'Library', 'Application Support', 'Titanium', 'modules', 'iphone', 'ti.touchid');

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

    var iosModules = 'Facebook: '+JSON.stringify(modules.facebook)+', '+'Hyperloop: '+JSON.stringify(modules.hyperloop)+', '+'Coremotion: '+JSON.stringify(modules.coremotion)+', '+'Map: '+JSON.stringify(modules.map)+', '+'TouchID: '+JSON.stringify(modules.touchid);
    callback(null, iosModules);
}

function getCommonjsModules(callback){
  var modules={}, folders, filterArr=[];
  var cloudModPath = path.join('/Users', util.user, 'Library', 'Application Support', 'Titanium', 'modules', 'commonjs', 'ti.cloud');

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

  var commonjsModules = 'Cloud: '+JSON.stringify(modules.cloud);
  callback(null, commonjsModules);
}
