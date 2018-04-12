const fs = require('fs'),
      Async = require('async'),
      path = require('path'),
      execute = require('../misc/util').execute,
      cyan = require('../misc/util').cyan,
      error = require('../misc/util').error,
      errorNExit = require('../misc/util').errorNExit,
      user = require('../misc/util').user;

module.exports = function(){

  const task = [];
  task.push(callback => getStudioVer(callback));
  task.push(callback => getSDKVer(callback));
  task.push(callback => getOSVer(callback));
  task.push(callback => getXcodeVer(callback));
  task.push(callback => getAppcNPMVer(callback));
  task.push(callback => getAppcCliCoreVer(callback));
  task.push(callback => getDaemonVer(callback));
  task.push(callback => getTiCliVer(callback));
  task.push(callback => getAlloyVer(callback));
  task.push(callback => getNodeVer(callback));
  task.push(callback => getNPMVer(callback));
  task.push(callback => getJavaVer(callback));
  task.push(callback => getENV(callback));
  task.push(callback => getConnectedDevices(callback));
  task.push(callback => getAndroidSDKTools(callback));
  task.push(callback => getPlatformTools(callback));
  task.push(callback => getBuildTools(callback));
  task.push(callback => getAndroidModules(callback));
  task.push(callback => getIOSModules(callback));
  task.push(callback => getCommonjsModules(callback));

  Async.parallel(task, (err, results) => {
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
    console.log('Daemon Ver:     '+cyan(results[6].trim()));
    console.log('Ti CLI Ver:     '+cyan(results[7].trim()));
    console.log('Alloy Ver:      '+cyan(results[8].trim()));
    console.log('Node Ver:       '+cyan(results[9]));
    console.log('NPM Ver:        '+cyan(results[10].trim()));
    console.log('Java Ver:       '+cyan(results[11]));
    console.log('Devices:        '+cyan(results[13].trim()));
    console.log('Environment:    '+cyan(results[12].trim()));
    console.log('\nSDK Tools:      '+cyan(results[14]));
    console.log('Platform Tools: '+cyan(results[15]));
    console.log('Build Tools:    '+cyan(results[16]));
    console.log('\nAndroid Modules:'+cyan(results[17]));
    console.log('\nIOS Modules:    '+cyan(results[18]));
    console.log('\nCommjs Modules: '+cyan(results[19])+'\n');
  });
};
//Function Definitions start here:
var getStudioVer = (callback)=>{
  //Studio 5.0.0 path for version.txt
  var path1 = path.join('/Applications','Appcelerator Studio','version.txt');
  //Studio 5.1.0 path for version.txt
  var path2 = path.join('/Applications','AppceleratorStudio.app','Contents','Eclipse','version.txt');
  //Checking if path1 exists if yes return path1 or check if path2 exists if yes return path2 else return false
  var finalPath = fs.existsSync(path1) ? path1 : fs.existsSync(path2) ? path2 : false;
  //Check if finalPath is false
  if(!finalPath){
    return callback(null, 'Appc Studio not installed.');
  }
  else{
    var text = fs.readFileSync(finalPath, 'utf8').split('\n');
    var ver = text[0].split(' ')[2]+'.'+text[1].split(' ')[2];
    return callback(null, ver);
  }
};

var getSDKVer = (callback)=>{
  execute('appc ti config sdk.selected -o json ', (err, data) => {
    //Converting the json text to javascript object using JSON.parse & getting the "sdk.selected" value
    if (err) {
      errorNExit(err);
    }
    var ver = JSON.parse(data);
    return callback(null, ver);
  });
};

var getAppcNPMVer = (callback)=>{
  execute('appc -v -o json', function(err, result){
    if (err) {
      errorNExit(err);
    }
    return callback(null, JSON.parse(result).NPM);
  });
};

var getAppcCliCoreVer = (callback)=>{
  execute('appc -v -o json', function(err, result){
    if (err) {
      errorNExit(err);
    }
    return callback(null, JSON.parse(result).CLI);
  });
};

var getDaemonVer = (callback)=>{
  execute('appc appcd --version', function(err, result){
    if(err){
      errorNExit(err);
    }
    var daemon_ver = result;
    return callback(null, daemon_ver);
  });
};

var getOSVer = (callback)=>{
  execute('sw_vers -productVersion', function(err, result){
    if (err) {
      errorNExit(err);
    }
    var os_ver = result;
    return callback(null, os_ver);
  });
};

var getXcodeVer = (callback)=>{
  if(fs.existsSync(path.join('/usr', 'bin', 'xcodebuild'))){
    execute('/usr/bin/xcodebuild -version', function(err, result){
      if (err) {
        errorNExit(err);
      }
      var split = result.split('Build');
      var xcode_ver = split[0];
      return callback(null, xcode_ver);
    });
  }
  else{
    return callback(null, 'Xcode not installed');
  }
};

var getTiCliVer = (callback)=>{
  execute('appc ti -v', function(err, result){
    if (err) {
      errorNExit(err);
    }
    var ti_ver = result;
    return callback(null, ti_ver);
  });
};

var getAlloyVer = (callback)=>{
  execute('appc alloy -v', function(err, result){
    if (err) {
      errorNExit(err);
    }
    var alloy_ver = result;
    return callback(null, alloy_ver);
  });
};

var getNodeVer = (callback)=>{
  var node_ver = process.versions.node;
  return callback(null, node_ver);
};

var getNPMVer = function(callback){
  execute('npm -v', function(err, result){
    if(err){
      errorNExit(err);
    }
    var npm_ver = result;
    return callback(null, npm_ver);
  });
};

var getJavaVer = (callback)=>{
  var spawn = require('child_process').spawn('java', ['-version']);
  spawn.on('error', function(err){
    errorNExit(err);
  });
  spawn.stderr.on('data', function(data) {
    data = data.toString().split('\n')[0];
    var javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
    if (javaVersion !== false) {
      return callback(null, javaVersion);
    }
  });
};

var getENV = (callback)=>{
  execute('appc whoami', function(err, result){
    if (err) {
      errorNExit(err);
    }
    var env = result.split('organization')[1].trim(' ');
    return callback(null, env);
  });
};

var getConnectedDevices = (callback)=>{
  execute('appc appcd exec /android/latest/info/devices', function(err, data){
    if (err) {
      let errStr = err.toString();
      if(errStr.includes('Command failed')){
        console.log(bold('\nLooks like Appc Daemon is not started.\nPlease run '+cyan('appc appcd start')+' to start appc daemon.'));
        console.log('');
        process.exit();
      }
      else{
        errorNExit(err);
      }    
    }
    var result = JSON.parse(data)["message"];
    //reading number of devices connected
    var count = result.length;
    if(count === 0){
      return callback(null, 'No device attached');
    }
    else{
      //creating a device object
      var device = {};
      var devices = '';
      for(var i=0; i<count; i++){
        //putting device details in object
        device['brand'+i] = result[i].brand;
        device['model'+i] = result[i].model;
        device['os_ver'+i] = result[i].release;

        devices += '\u21E8 '+device['brand'+i]+' '+device['model'+i]+' --- Android '+device['os_ver'+i]+'\n'+'                ';
      }
      return callback(null, devices);
    }
  });
};

var getAndroidSDKTools = (callback)=>{
  var android_sdkPath = process.env.ANDROID_SDK;
  var sdktools_path = path.join(android_sdkPath,'tools');
  //Checking if source.properties file exists
  if(fs.existsSync(path.join(sdktools_path,'source.properties'))){
    fs.readFile(path.join(sdktools_path, 'source.properties'), function(err, result){
      if(err){
        errorNExit(err);
      }
      current_ver = result.toString().split('Pkg.Revision=')[1].split('\n')[0];
      return callback(null, current_ver);
    });
  }
  else{
    return callback(null, 'No Android SDK Tools Installed.');
  }
};

var getPlatformTools = (callback)=>{
  var android_sdkPath = process.env.ANDROID_SDK;
  var sdktools_path = path.join(android_sdkPath,'platform-tools');
  //Checking if source.properties file exists
  if(fs.existsSync(path.join(sdktools_path,'source.properties'))){
    var result = fs.readFileSync(path.join(sdktools_path, 'source.properties'));
      current_ver = result.toString().split('Pkg.Revision=')[1].split('\n')[0];
      return callback(null, current_ver);
  }
  else{
    return callback(null, 'No Platform Tools Installed.');
  }
};

var getBuildTools = (callback)=>{
  var android_sdkPath = process.env.ANDROID_SDK;
  var buildtools_path = path.join(android_sdkPath, 'build-tools');
  //Checking if build-tools folder exists
  if(fs.existsSync(buildtools_path)){
    //Reading the directory for child directories synchronously
    var folders = fs.readdirSync(buildtools_path);
    var filter_arr = [];
      //filtering out DS.store file from the array of folders
      folders.filter(function(folder){
        if(folder !== '.DS_Store'){
          filter_arr.push(folder);
        }
      });
        var highestinstalled = filter_arr[filter_arr.length-1];
        return callback(null, highestinstalled);
    }
    else{
      return callback(null, 'No Build Tools Installed.');
    }
};

var getAndroidModules = (callback)=>{
    var modules={}, folders, cmnpath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'android'),
        facebookModPath = path.join(cmnpath, 'facebook'),
        hyperloopModPath = path.join(cmnpath, 'hyperloop'),
        cloudpushModPath = path.join(cmnpath, 'ti.cloudpush'),
        mapModPath = path.join(cmnpath, 'ti.map'),
        touchidModPath = path.join(cmnpath, 'ti.touchid'),
        identityModPath = path.join(cmnpath, 'ti.identity'),
        playservicesModPath = path.join(cmnpath, 'ti.playservices'),
        apmModPath = path.join(cmnpath, 'com.appcelerator.apm');
    //Calling filterFn
    filterFn(facebookModPath, 'facebook');
    filterFn(hyperloopModPath, 'hyperloop');
    filterFn(cloudpushModPath, 'cloudpush');
    filterFn(mapModPath, 'map');
    filterFn(touchidModPath, 'touchid');
    filterFn(identityModPath, 'identity');
    filterFn(playservicesModPath, 'playservices');
    filterFn(apmModPath, 'apm');
    //Function to filter .DS_Store
    function filterFn(path, modulename){
      if(fs.existsSync(path)){
        filterArr=[];
        folders = fs.readdirSync(path);
        if(folders){
          folders.filter(function(folder){
            if(folder !== '.DS_Store'){
             filterArr.push(folder);
           }
         });
         modules[modulename] = filterArr;
        }
      }
      else{
        modules[modulename] = 'None';
      }
    }
    var androidModules = 'Facebook:     '+modules.facebook+'\n '+'               Hyperloop:    '+modules.hyperloop+'\n '+'               Cloudpush:    '+modules.cloudpush+'\n '+'               Map:          '+modules.map+'\n '+'               TouchID:      '+modules.touchid+'\n '+'               Identity:     '+modules.identity+'\n '+'               Playservices: '+modules.playservices+'\n '+'               APM:          '+modules.apm;
    return callback(null, androidModules);
};

var getIOSModules = (callback)=>{
    var modules={}, folders, cmnpath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'iphone'),
        facebookModPath = path.join(cmnpath, 'facebook'),
        hyperloopModPath = path.join(cmnpath, 'hyperloop'),
        coremotionModPath = path.join(cmnpath, 'ti.coremotion'),
        mapModPath = path.join(cmnpath, 'ti.map'),
        touchidModPath = path.join(cmnpath, 'ti.touchid'),
        identityModPath = path.join(cmnpath, 'ti.identity');
        apmModPath = path.join(cmnpath, 'com.appcelerator.apm');
    //Calling filterFn
    filterFn(facebookModPath, 'facebook');
    filterFn(hyperloopModPath, 'hyperloop');
    filterFn(coremotionModPath, 'coremotion');
    filterFn(mapModPath, 'map');
    filterFn(touchidModPath, 'touchid');
    filterFn(touchidModPath, 'identity');
    filterFn(apmModPath, 'apm');
    //Function to filter .DS_Store
    function filterFn(path, modulename){
      if(fs.existsSync(path)){
        filterArr=[];
        folders = fs.readdirSync(path);
        if(folders){
          folders.filter(function(folder){
            if(folder !== '.DS_Store'){
             filterArr.push(folder);
           }
         });
         modules[modulename] = filterArr;
        }
      }
      else{
        modules[modulename] = 'None';
      }
    }
    var iosModules = 'Facebook:   '+modules.facebook+'\n '+'               Hyperloop:  '+modules.hyperloop+'\n '+'               Coremotion: '+modules.coremotion+'\n '+'               Map:        '+modules.map+'\n '+'               TouchID:    '+modules.touchid+'\n '+'               Identity:   '+modules.identity+'\n '+'               APM:        '+modules.apm;;
    callback(null, iosModules);
};

var getCommonjsModules = (callback)=>{
  var modules={}, folders;
  var cloudModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'commonjs', 'ti.cloud');

  if(fs.existsSync(cloudModPath)){
    filterArr=[];
    folders = fs.readdirSync(cloudModPath);
    if(folders){
      folders.filter(function(folder){
        if(folder !== '.DS_Store'){
         filterArr.push(folder);
       }
     });
     modules.cloud = filterArr;
    }
  }
  else{
    modules.cloud = 'None';
  }

  var commonjsModules = 'Cloud:     '+modules.cloud;
  return callback(null, commonjsModules);
};
