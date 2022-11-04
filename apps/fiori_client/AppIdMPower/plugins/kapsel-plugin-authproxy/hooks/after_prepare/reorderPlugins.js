#!/usr/bin/env node

module.exports = function(context) {
    var fs = require('fs'),
    path = require('path'),
    et = require('elementtree');

    var platformConfigFile = path.join(context.opts.projectRoot,
        "platforms", "android", "app", "src", "main", "res", "xml", 'config.xml');
    if (fs.existsSync(platformConfigFile)) {
        var configContents = fs.readFileSync(platformConfigFile, 'utf-8');
        var configXmlTree = new et.ElementTree(et.XML(configContents));
        var configXmlRoot = configXmlTree.getroot();
        var featureAuthProxy = configXmlRoot.find('.//feature[@name="AuthProxy"]');
        // Move AuthProxy to the top because it has to handle onNewIntent first (or at
        // least before the customUrlScheme plugin) for the OTP flow to work.
        // But we can't use insert because it behaves like set, so remove all
        // features and add them back, but with authproxy first.
        configXmlRoot.remove(featureAuthProxy);
        var otherFeatures = configXmlRoot.findall('.//feature');
        configXmlRoot.append(featureAuthProxy);
        for(var i=0; i<otherFeatures.length; i++) {
            configXmlRoot.remove(otherFeatures[i]);
            configXmlRoot.append(otherFeatures[i]);
        }
        fs.writeFileSync(platformConfigFile, configXmlTree.write({indent: 4}), 'utf-8');
    }
};