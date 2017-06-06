# QEUtility-Node
QE Utility for Appc

**This is just for SDK & CLI NPM as of now, will be adding CLI core stuff later**

**Installation:**

1. Download the latest release from release tab.
2. Unzip the release.
3. Go inside the folder using terminal (i.e cd into /appc_fr).
4. Run `sudo npm install -g`.

**NOTE:** You have to run the setup command atleast the first time you use this node module.
```
Usage: appcfr [command] [options]


  Commands:

    clone [options]     Clones repository from github.
    build [options]     Command to build, package & install the SDK.
    cleanup [options]   Command to cleanup before you build for a new PR.
    clearmemory         Command to clear all stored links & repo paths (This will prompt you for the paths when you clone the repo next time).
    setup               Setup prerequsites. This should be run at your first run.

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

**1. Clone command:**
```
Usage: appcfr clone [options]

  Clones repository from github.

  Options:

    -h, --help       output usage information
    -c, --component  Clone the component [sdk, npm, cli]
```
Clone will also modify the `config` file with the necessary changes.

**2. Build command:**
```
Usage: appcfr build [options]

  Command to build, package & install the SDK, Appc NPM & CLI.

  Options:

    -h, --help       output usage information
    -c, --component  Build the component [sdk, npm, cli]
 ```
**3. Cleanup command:**
```
Usage: appcfr cleanup [options]

  Command to cleanup before you build for a new PR.

  Options:

    -h, --help       output usage information
    -c, --component  Build the component [sdk, npm, cli]
```
**4. Setup command:**
```
Usage: appfr setup [options]

  Setup prerequisites. This should be run at your first run.

  Options:

    -h, --help  output usage information
```
Setup command will check if `ANDROID_SDK` & `ANDROID_NDK` paths are set in your your bash profile, if not it will help set it for you.
It will also ask & store all your repo links & repo dir paths.
