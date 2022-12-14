#!/usr/bin/env node

module.exports = function(context) {

    /** @external */
    var path = require('path'),
        shell = require('shelljs');

	var platformRoot = path.join(context.opts.projectRoot, '/platforms/windows');

    shell.cp('-rf', context.opts.projectRoot + "/res/windows/*", platformRoot + "/images");
};