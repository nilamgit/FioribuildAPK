#!/usr/bin/env node

module.exports = function(context) {
    /** @external */
    var fs = require('fs'),
        path = require('path'),
        readline = require('readline');

    var cordovaLibProDir = path.join(context.opts.projectRoot, 'platforms', 'ios', 'CordovaLib', 'CordovaLib.xcodeproj'),
        cordovaLibProFile = path.join(cordovaLibProDir, 'project.pbxproj');
    
    // There is an issue on iOS Cordova 6.0.0 and 6.1.0. To make sure the CDVWebViewProcessPoolFactory.h as public header in cause InAppBrowser plugin need acesss it.
    if (fs.existsSync(cordovaLibProFile)) {
        console.log("Update CordovaLib Project: " + cordovaLibProFile);
        var lineReader = readline.createInterface({
            input: fs.createReadStream(cordovaLibProFile)
        });
        
        lineReader.on('line', function (line) {
            
            if (line.indexOf("/* CDVWebViewProcessPoolFactory.h in Headers */ =") > 0) {
                var str = "/* CDVWebViewProcessPoolFactory.h */;";
                // ///* CDVWebViewProcessPoolFactory.h in Headers */ = {isa = PBXBuildFile; fileRef = 4E23F8F923E16E96006CD852 /* CDVWebViewProcessPoolFactory.h */; settings = {ATTRIBUTES = (Public, ); }; };
                if (line.indexOf("settings") < 0) {
                    // Normally, the logic should go this way.
                    var newLine = line.substring(0, line.lastIndexOf(str) + str.length) + " settings = {ATTRIBUTES = (Public, ); };" + line.substring(line.lastIndexOf(str) + str.length, line.length);
                } else {
                    //settings = {ATTRIBUTES = (Public, ); };
                    var settings = line.substring(line.lastIndexOf("settings"), line.lastIndexOf("}"));
                    settings = settings.substring(settings.indexOf("{") + 1, settings.lastIndexOf("}"));
                    var setttingAttributes = settings.split(";");
                    
                    var newSettings = " settings = {";
                    var hasAttr = false;
                    var newSettingsAppend = "";
                    for(var idx in setttingAttributes) {
                        if (setttingAttributes[idx].indexOf("ATTRIBUTES") < 0) {
                            newSettingsAppend += setttingAttributes[idx];
                        } else if (setttingAttributes[idx].indexOf("Public") < 0) {
                            var tempAttr = setttingAttributes[idx].substring(setttingAttributes[idx].indexOf("(") + 1, setttingAttributes[idx].lastIndexOf(")"));
                            var attributes = tempAttr.split(",");
                            newSettingsAppend += "(Public, ";
                            for(attrValue in attributes) {
                                newSettingsAppend += (attributes[attrValue] + (attributes[attrValue].trim().length > 0 ? "," : ""));
                            }
                            newSettingsAppend += ");";
                            
                            hasAttr = true;
                        } else {
                            newSettingsAppend += (setttingAttributes[idx] + ";");
                            
                            hasAttr = true;
                        }
                    }
                    newSettings += hasAttr ? newSettingsAppend + "};" : "ATTRIBUTES = " + newSettingsAppend + "};";
                    var newLine = line.substring(0, line.lastIndexOf(str) + str.length) + newSettings + " };";
                }

                fs.readFile(cordovaLibProFile, 'utf8', function (err,data) {
                    if (err) {
                        return console.log(err);
                    }
                    var result = data.replace(line, newLine);
                    // Replace with change file line.
                    fs.writeFile(cordovaLibProFile, result, 'utf8', function (err) {
                    if (err) return console.log(err);
                    });
                });
                
                return;
            }
        });
    }
};