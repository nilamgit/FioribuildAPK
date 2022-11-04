#!/usr/bin/env node

module.exports = function(context) {

    /** @external */
    var fs = require('fs'),
        path = require('path'),
        shell = require('shelljs');

    var androidPlatformDir = path.join(context.opts.projectRoot,
            'platforms', 'android'),
        androidCordovaDir = path.join(androidPlatformDir, 'CordovaLib'),
        androidCordovaDirSrc = path.join(androidCordovaDir, 'src'),
        cordovaGradleFile = path.join(androidCordovaDir, 'build.gradle'),
        fileName = 'PluginAspect.aj',
        aspectFile = path.join(context.opts.projectRoot,
            'scripts', 'android', 'after_platform_add', fileName);

        libsFolder = path.join(context.opts.projectRoot,
            'scripts', 'android', 'after_platform_add','libs');

    if (fs.existsSync(androidPlatformDir)) {
        shell.cp('-f', aspectFile, path.join(androidCordovaDirSrc, fileName));
        shell.cp('-R', libsFolder,androidCordovaDir)

        shell.sed('-i', 'dependencies {', 'dependencies {\n\t\trepositories{ flatDir {dirs \'libs\'}}\n\t\tclasspath \'org.aspectj:aspectjrt:1.8.7\'\n\t\tclasspath \'org.aspectj:aspectjtools:1.8.7\'\n\t\tclasspath \'com.uphyca.gradle:gradle-android-aspectj-plugin:0.9.15\'', cordovaGradleFile);
        shell.sed('-i', 'apply plugin: \'com.android.library\'', 'apply plugin: \'com.android.library\' \napply plugin: \'com.uphyca.android-aspectj\'', cordovaGradleFile);
    }
};
