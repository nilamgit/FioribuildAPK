#!/usr/bin/env node

// declare dependencies in package.json of the plugin, e.g.:
//
//  "dependencies": {
//    "shelljs" : "~0.8.3"
//  }
//

module.exports = function (context) {

    var cp = require('child_process'),
      path = require('path');
    // note: do not install the npm package to projectRoot/node_modules, because that folder will be overwritten during `cordova platform add`.
    // Do not install the npm package to projectRoot/plugins, because during `cordova prepare`, the `projectRoot/plugins/node_modules` folder is parsed
    // as a plugin and is added to package.json, which causes error.
    // So we install shelljs to projectRoot/plugins/kapsel-plugin-ui5.
    cp.execSync('npm install --force --no-save --prefix ' + path.join(context.opts.projectRoot, 'plugins', 'kapsel-plugin-ui5') + ' shelljs', {stdio:'inherit'});
};
