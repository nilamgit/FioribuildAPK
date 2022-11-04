#!/usr/bin/env node

module.exports = function(context) {
    /** @external */
    var fs = require('fs'),
        path = require('path'),
        shell = require('shelljs');

        var androidPlatformDir = path.join(context.opts.projectRoot,
            'platforms', 'android'),
        appDire = path.join(androidPlatformDir, 'app'),
        buildExtrasGradleFile = path.join(context.opts.projectRoot, "scripts", 'build-extras.gradle');
        ui5RootFolder = path.join(context.opts.projectRoot, "www", "resources", 'sap');
    
    // With UI5 1.71, there are folder start with sepcial character. E,g, sap/ushell/bootstrap/_SchedulingAgent.
    // It cause the file under the folder can't be found on Android platform. To fix this, the 'aaptOptions' gradle configuration was needed.
    // Here, the template build-extras.gradle will be copied to Android app folder for this fixing.
    if (fs.existsSync(appDire) && fs.existsSync(buildExtrasGradleFile) ) {
        // Get recursive folder which start with underscore, "_", from UI5 root folder
        var getFolders = function(path, files){
            fs.readdirSync(path).forEach(function(file){
                var subpath = path + '/' + file;
                if(fs.lstatSync(subpath).isDirectory()){
                    getFolders(subpath, files);
                    if (file.indexOf("_") == 0 ) {
                        files.push(path + '/' + file);
                    }
                } 
            });     
        }
        
        var sepFolders = [];
        getFolders(ui5RootFolder, sepFolders);

        // To move the build-exras.gradle file to Android App folder if there has the special folder.
        if (sepFolders.length > 0) {
            shell.cp(buildExtrasGradleFile, appDire);
            console.log('build-exras.gradle was copied to folder: ' + appDire);
        }
    }
};

