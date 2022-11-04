#!/usr/bin/env node

module.exports = function(context) {

    /** @external */
    var fs = require('fs'),
        path = require('path'),
        shell = require('shelljs');

    var androidAssetsDir = path.join(context.opts.projectRoot,
            'platforms', 'android', 'app', 'src', 'main', 'assets'),
        fileName = 'sap-supportability.properties';
    supportabilityFile = path.join(context.opts.projectRoot,
        'scripts', 'android', 'after_prepare', fileName);

    if (fs.existsSync(androidAssetsDir)) {
        shell.cp('-f', supportabilityFile, path.join(androidAssetsDir, fileName));
    }
};
