'use strict'

const fs = require('fs'),
      path = require('path'),
      user = require('../misc/util').user,
      exec = require('child_process').exec,
      spawn = require('child_process').spawn,
      output = require('../misc/output'),
      chalk = require('chalk'),
      cyan = chalk.cyan;

let arr = [];

class componentsUtil{
  /*****************************************************************************
  * Get studio version.
  ****************************************************************************/
  static getStudioVer(){
    return new Promise((resolve) => {
      //Studio 5.0.0 path for version.txt
      const path1 = path.join('/Applications','Appcelerator Studio','version.txt'),
      //Studio 5.1.0 path for version.txt
      path2 = path.join('/Applications','AppceleratorStudio.app','Contents','Eclipse','version.txt');
      //Checking if path1 exists if yes return path1 or check if path2 exists if yes return path2 else return false
      const finalPath = fs.existsSync(path1) ? path1 : fs.existsSync(path2) ? path2 : false;
      //Check if finalPath is false
      if(finalPath == path1 ){
        const text = fs.readFileSync(finalPath, 'utf8').split('\n'),
        ver = text[0].split(' ')[2];
        resolve(arr.push(ver)); 		    }
        else if(finalPath == path2){
          const text = fs.readFileSync(finalPath, 'utf8').split('\n'),
          ver = text[0].split(' ')[2]+'.'+text[1].split(' ')[2];
          resolve(arr.push(ver));
        }
        else{resolve(arr.push('Appc Studio not installed.'));}
      });
    }


    /*****************************************************************************
    * Get selected SDK version.
    ****************************************************************************/
    static getSDKVer(){
      return new Promise((resolve, reject) => {
        exec('appc ti config sdk.selected -o json ', (err, data) => {
          if(!err){
            resolve(arr.push(JSON.parse(data)));
          }
          reject(err);
        });
      });
    }


    /*****************************************************************************
    * Get Appc NPM version.
    ****************************************************************************/
    static getAppcNPMVer(){
      return new Promise((resolve, reject) => {
        exec('appc -v -o json', (err, data) => {
          if(!err){
            resolve(arr.push(JSON.parse(data).NPM));
          }
          reject(err);
        });
      });
    }


    /*****************************************************************************
    * Get Appc CLI Core version.
    ****************************************************************************/
    static getAppcCliCoreVer(){
      return new Promise((resolve, reject) => {
        exec('appc -v -o json', (err, data)=> {
          if(!err){
            resolve(arr.push(JSON.parse(data).CLI));
          }
          reject(err);
        });
      });
    }


    /*****************************************************************************
    * Get daemon version.
    ****************************************************************************/
    static getDaemonVer(){
      return new Promise((resolve, reject) => {
        exec('appc appcd --version', (err, data) => {
          if(!err){
            resolve(arr.push(data.trim()));
          }
          reject(err);
        });
      });
    }


    /*****************************************************************************
    * Get OS version.
    ****************************************************************************/
    static getOSVer(){
      return new Promise((resolve, reject) => {
        exec('sw_vers -productVersion', (err, data) => {
          if(!err){
            resolve(arr.push(data.trim()));
          }
          reject(err);
        });
      });
    }


    /*****************************************************************************
    * Get Xcode version.
    ****************************************************************************/
    static getXcodeVer(){
      return new Promise((resolve,reject) => {
        if(fs.existsSync(path.join('/usr', 'bin', 'xcodebuild'))){
          exec('/usr/bin/xcodebuild -version', (err, data)=>{
            if(!err){
              resolve(arr.push(data.split('Build')[0].trim()));
            }
            reject(err);
          });
        }
      });
    }


    /*****************************************************************************
    * Get titanium CLI version.
    ****************************************************************************/
    static getTiCliVer(){
      return new Promise((resolve, reject) => {
        exec('appc ti -v', (err, data)=>{
          if(!err){
            resolve(arr.push(data.trim()));
          }
          reject(err);
        });
      });
    }


    /*****************************************************************************
    * Get alloy version.
    ****************************************************************************/
    static getAlloyVer(){
      return new Promise((resolve, reject) => {
        exec('appc alloy -v', (err, data)=>{
          if(!err){
            resolve(arr.push(data.trim()));
          }
          reject(err);
        });
      });
    }


    /*****************************************************************************
    * Get Node version.
    ****************************************************************************/
    static getNodeVer(){
      return new Promise((resolve) => {
        resolve(arr.push(process.versions.node));
      });
    }


    /*****************************************************************************
    * Get NPM version.
    ****************************************************************************/
    static getNPMVer(){
      return new Promise((resolve, reject) => {
        exec('npm -v', (err, data)=>{
          if(!err){
            resolve(arr.push(data.trim()));
          }
          reject(err);
        });
      });
    }


    /*****************************************************************************
    * Get JAVA version.
    ****************************************************************************/
    static getJavaVer(){
      return new Promise((resolve, reject) => {
        const spawn = require('child_process').spawn('java', ['-version']);
        spawn.on('error', (err) => {reject(err);});
        spawn.stderr.on('data', (data) => {
          data = data.toString().split('\n')[0];
          const javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
          if (javaVersion !== false) {
            resolve(arr.push(javaVersion.trim()));
          }
        });
      });
    }


    /*****************************************************************************
    * Get current env.
    ****************************************************************************/
    static getENV(){
      return new Promise((resolve, reject) => {
        exec('appc whoami', (err, result)=>{
          if(!err){
            resolve(arr.push(result.split('organization')[1].trim(' ')));
          }
          reject(err);
        });
      });
    }


    /*****************************************************************************
    * Get connected devices.
    ****************************************************************************/
    static getConnectedDevices(){
      return new Promise(resolve => {
        let p = Promise.resolve()
        .then(() => {return componentsUtil.rundaemoncmd();})                      //First try to get connected devices
        .then(result => {
          if(result.running){resolve(arr.push(result.devices));}                //If appc daemon is running push array of devices
          else{
            let p = Promise.resolve()
            .then(() => {return componentsUtil.restartappcdaemon();})		 //If daemon is not running, restart daemon
            .then(done => {
              if(done){return componentsUtil.rundaemoncmd();}				 //Get the connected devices
              else{output.error('Appd daemon could not be restarted. Please try from terminal.');}
            })
            .then(result => {resolve(arr.push(result.devices));});             //Push the array of devices
          }
        });
      });
    }


    /*****************************************************************************
    * Run appc daemon command to get android devices.
    ****************************************************************************/
    static rundaemoncmd(){
      return new Promise((resolve, reject) => {
        exec('appc appcd exec /android/latest/info/devices', (err, data) => {
          if (err) {
            if(err.toString().includes('Command failed')){
              resolve({'running': false});
            }
            else{reject(err);}
          }
          else{
            const result = JSON.parse(data).message;
            //reading number of devices connected
            const count = result.length;
            if(count === 0){
              resolve({'running': true, 'devices': 'No device connected'});
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
                devices += '\u21E8 '+device['brand'+i]+' '+device['model'+i]+' (Android '+device['os_ver'+i]+')\n'+'                ';
              }
              resolve({'running': true, 'devices': devices});
            }
          }
        });
      });
    }


    /*****************************************************************************
    * Restart daemon.
    ****************************************************************************/
    static restartappcdaemon(){
      let data = '', done = false;
      return new Promise(resolve => {
        output.cyan(null, '\nLooks like appc daemon is not running. Starting appc daemon to get device info ....\n');
        const prc = spawn('appc',['appcd', 'start']);
        prc.stdout.on('data', output => {
          data = output.toString().trim('');
        });
        prc.on('close', code =>{
          console.log(code);
          if(code !== 0){
            output.error(`Something went wrong while restarting appc deamon. Please check console output. Exited with exit code ${code}.`);
            process.exit();
          }
          else{
            if(data.toString().includes('Appc Daemon started')){
              done = true;
              resolve(done);
            }
          }
        });
      });
    }


    /*****************************************************************************
    * Get connected android emulators.
    ****************************************************************************/
    static getConnectedEmulator(){
      return new Promise((resolve, reject) => {
        exec('adb -s emulator-5554 shell getprop ro.build.version.release', (err, data) => {
          if(!err){
            resolve(arr.push('\u21E8 Android '+data.trim()));
          }
          else{
            err = err.toString();
            if(err.includes('not found')){
              resolve(arr.push('No emulator running'));
            }
            reject(err);
          }
        });
      });
    }


    /*****************************************************************************
    * Get connected IOS simulators.
    ****************************************************************************/
    static getIOSSimulator(){
      return new Promise((resolve, reject) => {
        exec('xcrun simctl list -j devices', (err, data) => {
          if(!err){
            const devices = JSON.parse(data).devices;
            Object.keys(devices).forEach(v => {
              devices[v].find(sim => {
                if(sim.state === 'Booted'){
                  resolve(arr.push('\u21E8 '+sim.name+' ('+v+')'));
                }
              });
            });
            resolve(arr.push('No simulator running'));
          }
          else{
            reject(err);
          }
        });
      });
    }

    /*****************************************************************************
    * Get connected IOS device.
    ****************************************************************************/
    static getIOSDevices(){
      return new Promise((resolve, reject) => {
        exec('appc appcd exec /ios/latest/info/devices', (err, data) => {
          if (err) {
            if(err.toString().includes('Command failed')){
              reject(err);
            }
          }
          else{
            const result = JSON.parse(data).message;
            //reading number of devices connected
            const count = result.length;
            if(count === 0){
              resolve(arr.push('No device connected'));
            }
            else{
              //creating a device object
              var device = {};
              var devices = '';
              for(var i=0; i<count; i++){
                //putting device details in object
                device['devicename'+i] = result[i].deviceClass;
                device['iosver'+i] = result[i].productVersion;
                devices += '\u21E8 '+device['devicename'+i]+' '+device['iosver'+i];
              }
              resolve(arr.push(devices));
            }
          }
        });
      });
    }


    /*****************************************************************************
    * Get android SDK tools version.
    ****************************************************************************/
    static getAndroidSDKTools(){
      return new Promise((resolve) => {
        const android_sdktools_path = path.join(process.env.ANDROID_SDK, 'tools'),
        sourcepropfile = path.join(android_sdktools_path,'source.properties');
        if(fs.existsSync(sourcepropfile)){
          resolve(arr.push(fs.readFileSync(sourcepropfile).toString().split('Pkg.Revision=')[1].split('\n')[0]));
        }
        else{resolve(arr.push('No Android SDK Tools Installed.'));}
      });
    }


    /*****************************************************************************
    * Get android platform tools version.
    ****************************************************************************/
    static getPlatformTools(){
      return new Promise((resolve) => {
        const android_plattools_path = path.join(process.env.ANDROID_SDK, 'platform-tools'),
        sourcepropfile = path.join(android_plattools_path, 'source.properties');
        if(fs.existsSync(sourcepropfile)){
          resolve(arr.push(fs.readFileSync(sourcepropfile).toString().split('Pkg.Revision=')[1].split('\n')[0]));
        }
        else{resolve(arr.push('No Android Platform Tools Installed.'));}
      });
    }


    /*****************************************************************************
    * Get android build tools version.
    ****************************************************************************/
    static getBuildTools(){
      return new Promise(resolve => {
        const android_buildtools_path = path.join(process.env.ANDROID_SDK, 'build-tools');
        if(fs.existsSync(android_buildtools_path)){
          const folders = fs.readdirSync(android_buildtools_path), filter_arr = [];
          folders.filter((folder) => {
            if(folder !== '.DS_Store'){
              filter_arr.push(folder);
            }
          });
          resolve(arr.push(filter_arr[filter_arr.length-1]));
        }
        else{resolve(arr.push('No Build Tools Installed.'));}
      });
    }


  /*****************************************************************************
    * Get android NDK version in use.
    ****************************************************************************/
    static getNDKVer(){
      return new Promise((resolve, reject) => {
        exec('appc ti config android.ndkPath --no-banner', (err, data) => {
          if(!err){
            const ndkver = data.trim().split('ndk-')[1];
            resolve(arr.push(ndkver));
          }
          else{
            reject(err);
          }
        });
      });
    }

    /*****************************************************************************
    * Get installed Appc android modules.
    ****************************************************************************/
    static getAndroidModules(){
      return new Promise(resolve => {
        let modules = {}, folders;
        const androidModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'android'),
        facebookMod = path.join(androidModPath, 'facebook'),
        hyperloopMod = path.join(androidModPath, 'hyperloop'),
        cloudpushMod = path.join(androidModPath, 'ti.cloudpush'),
        mapMod = path.join(androidModPath, 'ti.map'),
        touchidMod = path.join(androidModPath, 'ti.touchid'),
        identityMod = path.join(androidModPath, 'ti.identity'),
        playservicesMod = path.join(androidModPath, 'ti.playservices'),
        apmMod = path.join(androidModPath, 'com.appcelerator.apm'),
        acaMod = path.join(androidModPath, 'com.appcelerator.aca');

        filterFn(facebookMod, 'facebook');
        filterFn(hyperloopMod, 'hyperloop');
        filterFn(cloudpushMod, 'cloudpush');
        filterFn(mapMod, 'map');
        filterFn(touchidMod, 'touchid');
        filterFn(identityMod, 'identity');
        filterFn(playservicesMod, 'playservices');
        filterFn(apmMod, 'apm');
        filterFn(acaMod, 'aca');

        function filterFn(path, modulename){
          if(fs.existsSync(path)){
            let filterArr = [];
            folders = fs.readdirSync(path);
            if(folders){
              folders.filter((folder)=>{
                if(folder !== '.DS_Store'){
                  filterArr.push(folder);
                }
              });
              const finalArr = filterArr.map(version => {return ' '+version;});
              resolve(modules[modulename] = finalArr);
            }
          }
          else{
            return resolve(modules[modulename] = 'None');
          }
        }

        const androidModules = ' Facebook:     '+modules.facebook+'\n '+'                Hyperloop:    '+modules.hyperloop+'\n '+'                Cloudpush:    '+modules.cloudpush+'\n '+'                Map:          '+modules.map+'\n '+'                TouchID:      '+modules.touchid+'\n '+'                Identity:     '+modules.identity+'\n '+'                Playservices: '+modules.playservices+'\n '+'                APM:          '+modules.apm+'\n '+'                ACA:          '+modules.aca;
        resolve(arr.push(androidModules));
      });
    }


    /*****************************************************************************
    * Get installed Appc IOS modules.
    ****************************************************************************/
    static getIOSModules(){
      return new Promise(resolve => {
        let modules = {}, folders;
        const iosModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'iphone'),
        facebookMod = path.join(iosModPath, 'facebook'),
        hyperloopMod = path.join(iosModPath, 'hyperloop'),
        coremotionMod = path.join(iosModPath, 'ti.coremotion'),
        mapMod = path.join(iosModPath, 'ti.map'),
        touchidMod = path.join(iosModPath, 'ti.touchid'),
        identityMod = path.join(iosModPath, 'ti.identity'),
        apmMod = path.join(iosModPath, 'com.appcelerator.apm'),
        acaMod = path.join(iosModPath, 'com.appcelerator.aca');

        filterFn(facebookMod, 'facebook');
        filterFn(hyperloopMod, 'hyperloop');
        filterFn(coremotionMod, 'coremotion');
        filterFn(mapMod, 'map');
        filterFn(touchidMod, 'touchid');
        filterFn(touchidMod, 'identity');
        filterFn(apmMod, 'apm'),
        filterFn(acaMod, 'aca');

        function filterFn(path, modulename){
          if(fs.existsSync(path)){
            let filterArr = [];
            folders = fs.readdirSync(path);
            if(folders){
              folders.filter((folder)=>{
                if(folder !== '.DS_Store'){
                  filterArr.push(folder);
                }
              });
              const finalArr = filterArr.map(version => {return ' '+version;});
              resolve(modules[modulename] = finalArr);
            }
          }
          else{
            return resolve(modules[modulename] = 'None');
          }
        }

        const iosModules = ' Facebook:     '+modules.facebook+'\n '+'                Hyperloop:    '+modules.hyperloop+'\n '+'                Coremotion:   '+modules.coremotion+'\n '+'                Map:          '+modules.map+'\n '+'                TouchID:      '+modules.touchid+'\n '+'                Identity:     '+modules.identity+'\n '+'                APM:          '+modules.apm+'\n '+'                ACA:          '+modules.aca;
        resolve(arr.push(iosModules));
      });
    }



    /*****************************************************************************
    * Get installed Appc commonjs modules.
    ****************************************************************************/
    static getCommonjsModules(){
      return new Promise(resolve => {
        let modules={}, folders;
        const cloudModPath = path.join('/Users', user, 'Library', 'Application Support', 'Titanium', 'modules', 'commonjs', 'ti.cloud');

        if(fs.existsSync(cloudModPath)){
          let filterArr=[];
          folders = fs.readdirSync(cloudModPath);
          if(folders){
            folders.filter((folder)=>{
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

        var commonjsModules = ' Cloud:         '+modules.cloud;
        resolve(arr.push(commonjsModules));
      });
    }


	/*****************************************************************************
	 * Get all components & display them.
	 ****************************************************************************/
	static getcomponents(){
		let getall = Promise.resolve()
			.then(() => {return componentsUtil.getStudioVer();})
			.then(() => {return componentsUtil.getSDKVer();})
      .then(() => {return componentsUtil.getOSVer();})
      .then(() => {return componentsUtil.getXcodeVer();})
			.then(() => {return componentsUtil.getAppcNPMVer();})
			.then(() => {return componentsUtil.getAppcCliCoreVer();})
			.then(() => {return componentsUtil.getDaemonVer();})
			.then(() => {return componentsUtil.getTiCliVer();})
			.then(() => {return componentsUtil.getAlloyVer();})
			.then(() => {return componentsUtil.getNodeVer();})
			.then(() => {return componentsUtil.getNPMVer();})
			.then(() => {return componentsUtil.getJavaVer();})
			.then(() => {return componentsUtil.getENV();})
			.then(() => {return componentsUtil.getConnectedDevices();})
			.then(() => {return componentsUtil.getConnectedEmulator();})
      .then(() => {return componentsUtil.getIOSSimulator();})
      .then(() => {return componentsUtil.getIOSDevices();})
			.then(() => {return componentsUtil.getAndroidSDKTools();})
			.then(() => {return componentsUtil.getPlatformTools();})
			.then(() => {return componentsUtil.getBuildTools();})
      .then(() => {return componentsUtil.getNDKVer();})
			.then(() => {return componentsUtil.getAndroidModules();})
			.then(() => {return componentsUtil.getIOSModules();})
			.then(() => {return componentsUtil.getCommonjsModules();})
			.then(() => {
			const chalk = require('chalk'),
				  cyan = chalk.cyan; 
			console.log('\nStudio Ver:       '+cyan(arr[0]));
		    console.log('SDK Ver:          '+cyan(arr[1]));
		    console.log('OS Ver:           '+cyan(arr[2].trim()));
		    console.log('Xcode Ver:        '+cyan(arr[3].trim()));
		    console.log('Appc NPM:         '+cyan(arr[4]));
		    console.log('Appc CLI:         '+cyan(arr[5]));
		    console.log('Daemon Ver:       '+cyan(arr[6].trim()));
		    console.log('Ti CLI Ver:       '+cyan(arr[7].trim()));
		    console.log('Alloy Ver:        '+cyan(arr[8].trim()));
		    console.log('Node Ver:         '+cyan(arr[9]));
		    console.log('NPM Ver:          '+cyan(arr[10].trim()));
		    console.log('Java Ver:         '+cyan(arr[11]));
		    console.log('Android Devices:  '+cyan(arr[13].trim()));
		    console.log('Android Emulator: '+cyan(arr[14].trim()));
        console.log('\nIOS Simulator:    '+cyan(arr[15].trim()));
        console.log('IOS Devices:      '+cyan(arr[16].trim()+'\n'));
		    console.log('Environment:      '+cyan(arr[12].trim()));
		    console.log('\nSDK Tools:       '+cyan(arr[17]));
		    console.log('Platform Tools:  '+cyan(arr[18]));
		    console.log('Build Tools:     '+cyan(arr[19]));
        console.log('NDK Ver:         '+cyan(arr[20]));
		    console.log('\nAndroid Modules:'+cyan(arr[21]));
		    console.log('\nIOS Modules:    '+cyan(arr[22]));
		    console.log('\nCommjs Modules: '+cyan(arr[23])+'\n');
		})
		.catch(err => output.error(err));
	}
}

module.exports = componentsUtil;
