# appc_fr
FR Utility for Appc

** This is just for SDK as of now, will be adding Appc NPM & CLI stuff later **
```
Usage: appc_fr [command] [options]


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
Clone will also modify the `coinfig` file with the necessary changes.

**2. Build command:**
```
Usage: build [options]

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

  Setup prerequsites. This should be run at your first run.

  Options:

    -h, --help  output usage information
```
Setup command will check if `ANDROID_SDK` & `ANDROID_NDK` paths are set in your your bash profile, if not it will help set it for you. 
It will also ask & store all your repo links & repo dir paths.
