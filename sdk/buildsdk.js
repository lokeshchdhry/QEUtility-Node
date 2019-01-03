'use strict'

const sdkutil = require('../sdk/sdkutil'),
			sdk_dir = require('../misc/util').sdk_dir,
			output = require('../misc/output'),
			path = require('path');


class buildsdk{

	/*****************************************************************************
	* Run method which runs all SDK build methods according to scenario.
	****************************************************************************/
	static run(){
		let p = Promise.resolve()
		.then(() => {return sdkutil.sdkrepocheck()})
		.then(exist => {
			if(exist){
				process.chdir(path.join(sdk_dir, '/titanium_mobile'));
				return sdkutil.getprno();
			}
			else{
				throw('Looks like titanium mobile repo is not present. Please clone the repo first, FR TOOLS FOR SDK --> CLONE TIMOB SDK REPO.');
			}
		})
		.then(prno => {
			if(!prno){     //If not already on a PR branch
				let p = Promise.resolve()
				.then(() => {return sdkutil.gitpull()})
				.then(() => {return sdkutil.fetchpr()})
				.then(() => {return sdkutil.gitstash()})
				.then(() => {return sdkutil.getinputprno()})
				.then(pr => {return sdkutil.checkoutpr(pr)})
				.then(() => {return sdkutil.npminstallsdk()})
				.then(() => {return sdkutil.sdkbuild()})
				.then(() => {return sdkutil.packagesdk()})
				.then(() => {return sdkutil.installsdk()})
				.catch(err => output.error(err));
			}
			else{          //If already on a PR branch
				let p = Promise.resolve()
				.then(() => {return sdkutil.alreadyquestion(prno)})
				.then(pr => {        //If user wants to build for a new PR
					if(pr.newpr){
						let p = Promise.resolve()
						.then(() => {return sdkutil.gitstash()})
						.then(() => {return sdkutil.checkoutmaster()})
						.then(() => {return sdkutil.deletebranch(prno)})
						.then(() => {return sdkutil.fetchorigin()})
						.then(() => {return sdkutil.gitpull()})
						.then(() => {return sdkutil.fetchpr()})
						.then(() => {return sdkutil.getinputprno()})
						.then(pr => {return sdkutil.checkoutpr(pr)})
						.then(() => {return sdkutil.npminstallsdk()})
						.then(() => {return sdkutil.sdkbuild()})
						.then(() => {return sdkutil.packagesdk()})
						.then(() => {return sdkutil.installsdk()})
						.catch(err => {output.error(err)});
					}
					else{             //If user wants to rebuild for the same PR
						let p = Promise.resolve()
						.then(() => {return sdkutil.checkoutpr(pr.prno)})
						.then(() => {return sdkutil.npminstallsdk()})
						.then(() => {return sdkutil.sdkbuild()})
						.then(() => {return sdkutil.packagesdk()})
						.then(() => {return sdkutil.installsdk()})
						.catch(err => {output.error(err)});
					}
				})
			}
		})
		.catch(err => output.error(err));
	}
}

module.exports = buildsdk;
