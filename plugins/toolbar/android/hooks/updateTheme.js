#!/usr/bin/env node

module.exports = function(context) {

    /** @external */
    var fs = require('fs'),
        path = require('path'),
        shell = require('shelljs');

    var androidPlatformDir = path.join(context.opts.projectRoot,
            'platforms', 'android'),
        projectManifestFile = path.join(androidPlatformDir,
            'app',
            'src',
            'main',
            'AndroidManifest.xml');

    if (fs.existsSync(projectManifestFile)) {
        shell.sed('-i', /android:name="MainActivity" android:theme=\"@android:style\/Theme.DeviceDefault.NoActionBar\"/,
            'android:name="MainActivity" android:theme="@android:style/Theme.DeviceDefault"', projectManifestFile);
    }
};
