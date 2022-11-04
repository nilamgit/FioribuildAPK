#!/usr/bin/env node

module.exports = function(context) {

    /** @external */
    var fs = require('fs'),
        path = require('path'),
        shell = require('shelljs');

    var configXml = path.join(context.opts.projectRoot,
            'platforms', 'android', 'app', 'src', 'main', 'res', 'xml', "config.xml");

    if (fs.existsSync(configXml)) {
        shell.sed('-i',/--disable-pull-to-refresh-effect/g,'--disable-pull-to-refresh-effect --disable-threaded-scrolling',configXml);
    }
};