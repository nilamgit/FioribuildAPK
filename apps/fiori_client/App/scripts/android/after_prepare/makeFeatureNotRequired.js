module.exports = function(context) {
    var fs = require('fs'),
    path = require('path'),
    et = require('elementtree'),
    xml = context.requireCordovaModule('cordova-common').xmlHelpers;

    var manifestPath = path.join(context.opts.projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
    var doc = xml.parseElementtreeSync(manifestPath);

    /**
     * Make all features not required so devices that don't have camera can still install the app.
     * Note: We remove duplicate features as Cordova can sometimes add them again.
     */
    var foundFeatures = {};
    doc.getroot().findall('./uses-feature').map(function (feature) {
        var name = feature.attrib['android:name'];
        if (foundFeatures[name]) {
            doc.getroot().remove(feature);
        }
        else {
            feature.attrib['android:required'] = false;
            foundFeatures[name] = feature;
        }
    });

    /**
     * Extra more explicit hardware features that we want to remove the requirement for.
     */
    var extraFeatures = [
        et.XML('<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />'),
        et.XML('<uses-feature android:name="android.hardware.location" android:required="false" />'),
        et.XML('<uses-feature android:name="android.hardware.location.network" android:required="false" />'),
        et.XML('<uses-feature android:name="android.hardware.microphone" android:required="false" />')
    ];

    extraFeatures.forEach(function(feature) {
        var name = feature.attrib['android:name'];
        var found = doc.getroot().find('./uses-feature[@android:name=\"'+ name + '\"]');
        if (!found) {
            doc.getroot().append(feature);
        }
    });

    fs.writeFileSync(manifestPath, doc.write({
        indent: 4
    }), 'utf-8');
};