#!/usr/bin/env node

// declare dependencies in package.json of the plugin, e.g.:
//
//  "dependencies": {
//    "shelljs" : "~0.8.3"
//  }
//

module.exports = function (context) {
    console.log("installing shelljs...");
    var cp = require('child_process'),
        path = require('path');
    // note: do not install the npm package to projectRoot/node_modules, because that folder will be overwritten during `cordova platform add`.
    // So we install shelljs to projectRoot/scripts/node_modules.
    cp.execSync('npm install --force --no-save --prefix ' + path.join(context.opts.projectRoot, 'scripts') + ' shelljs', {stdio:'inherit'});
};