#!/usr/bin/env node

module.exports = function (context) {

    /** @external */
    var path = require('path');
    var platformRoot = path.join(context.opts.projectRoot, '/platforms/windows');

    function manageSolution(platformRoot, filename) {
        var fs = require('fs');
        var result = "";
        var array = fs.readFileSync(platformRoot + "/" + filename).toString().split("\n");
        for (var i in array) {
            if (array[i].indexOf("CordovaApp.Windows.jsproj") == -1 && array[i].indexOf("CordovaApp.Phone.jsproj") == -1) {
                result += array[i] + "\n";
            } else {
                delete array[++i];
            }
        }

        fs.writeFileSync(platformRoot + "/" + filename, result);
    }
    
    
    manageSolution(platformRoot, "CordovaApp.sln");
};