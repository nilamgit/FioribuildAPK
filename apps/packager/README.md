# Packager

## Installation and Setup

After cloning, you need to install the npm dependencies

```
npm install .
```

You also need to go to the cli directory and install the kapsel cli tools.  See the readme file in that directory.

## Example

To run the Packager, provide a `appConfig.js` file locally.  The `appConfig.js` shows an example of such a file.  By default, the Packager will use a local file with the name `appConfig.js` to obtain config details from; if you want another name, specifiy it on the command line.

    <Packager>/bin/packager --config appConfig.js --username 'sampleuser' --password 'samplepassword' --host sampleserver.com --port 44333 --https --targetDir xxx --force --verbose

Front end server details can be provided in the config file; else they can be provided on the command line.

After the packager has downloaded and created the directory hierarchy, you can pass this to the cloud build service, or else build a Cordova application out of it directly.

To do the latter, cd into the target directory, and run the Cordova prepare.  For example:

```
    cd xxx
    cordova prepare ios --searchpath ~/SAP/MobileSDK3/KapselSDK/plugins
    cordova build ios
```

## Usage

    Usage:
    --verbose, -d      Verbose output                        false          
    --version, -v      Version of Packager                                  
    --targetDir, -t    Target directory                                     
    --config, -f       Config File                           appConfig.js    
    --username, -u     Front End Server username                            
    --password, -p     Front End Server password                            
    --host, -H         Front End Server hostname                            
    --port, -P         Front End Server port                                
    --https, -S        Front End Server uses https or not                   
    --force, -F        Force Overwrite of existing target    false          
    --help, -h         Display help                          false          

## Basics

The Packager ideally works with a FES that has the following features:

* REST API to return information about a Fiori Component
* Fiori Components deployed to FES with manifest.json and resources.json files

Te REST API returns information about a component:

* the URL used as a base to fetch component artifacts (e.g. manifest.json and actual JavaScript and view definitions)
* dependent libraries (also present in the manifest.json file)

Packager starts by retrieving the details of an application and then extracting the manifest and resources files.  It then extracts the actual artifacts required for the application (using the resources.json) and also obtains a list of all required libraries.  Once all applications are queried and resource downloaded, the SAP UI5 components are downloaded.

## appConfig.js

This contains the app definition used to download the content and set up the launchpad properly. This includes the component ID for the app, and some details used to create the tile. If the FES supports the app_index API call, then there is no need to specify any addtional details; if the FES does not, then you need to include the remote path to find the app, and dependent libs and resources.

The Packager assumes that all apps listed will be exposed as tiles.
