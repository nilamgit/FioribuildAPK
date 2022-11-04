#!/usr/bin/env node

module.exports = function(context) {
    var fs, path, et, projectManifestFile, manifestContents, projectManifestXmlTree, application, networkSecurityConfig,
        networkSecurityConfigFileName, pathToNetworkSecurityConfigFile, projectConfigXML, configXMLContents,
        configXMLTree, preferences, trustUserCertificatesElement, preferenceName, trustUserCertsConfigValue,
        networkSecurityConfigXML, networkSecurityConfigXMLContents, networkSecurityConfigXMLTree, baseConfigElement,
        trustAnchorsElement, certificatesElements, userCertificatesElement, cleartextTrafficPermitted, modify = false,
        usesSdkElement, usesLibraryElements, apacheHttpLegacyElement, minSdkVersion, targetSdkVersion, projectBuildGradleFile, projectBuildGradleContent;

    fs = require('fs');
    path = require('path');
    et = require('elementtree');
    projectManifestFile = path.join(context.opts.projectRoot, "platforms", "android", "app", "src", "main", 'AndroidManifest.xml');
    if (!fs.existsSync(projectManifestFile)) {
        // The Android platform must not be present.  Skip the rest of this hook.
        return;
    }
    manifestContents = fs.readFileSync(projectManifestFile, 'utf-8');
    projectManifestXmlTree = new et.ElementTree(et.XML(manifestContents));
    application = projectManifestXmlTree.find("./application");
    usesSdkElement = projectManifestXmlTree.find("./uses-sdk");
    networkSecurityConfig = application.get("android:networkSecurityConfig");

    // Only set the networkSecurityConfig if none is set.  If the developer has set the
    // networkSecurityConfig file already, then only modify the values explicitly set in
    // the config.xml (at this point only the preference trustUserCertificates can be
    // set in config.xml).
    if (!networkSecurityConfig) {
        networkSecurityConfig = "@xml/kapsel_network_security_config";
        application.set("android:networkSecurityConfig", networkSecurityConfig);
        fs.writeFileSync(projectManifestFile, projectManifestXmlTree.write({indent: 4}), 'utf-8');
    }
    networkSecurityConfigFileName = networkSecurityConfig.substring("@xml/".length) + ".xml";
    pathToNetworkSecurityConfigFile = path.join(context.opts.projectRoot, "platforms", "android", "app", "src", "main", "res", "xml", networkSecurityConfigFileName);
    
    if (!fs.existsSync(pathToNetworkSecurityConfigFile)) {
        // The file specified in AndroidManifest.xml doesn't exist; copy the kapsel one there.
        var pathToKapselNetworkSecurityConfig = path.join(context.opts.projectRoot, "plugins", "kapsel-plugin-corelibs", "android", "res", "xml", "kapsel_network_security_config.xml");
        fs.writeFileSync(pathToKapselNetworkSecurityConfig, fs.readFileSync(pathToNetworkSecurityConfigFile));
    }

    // 2019-6-4, Joe. Change for BCP 1970194198, Fiori Client Crashes on Android
    // Declare 'org.apache.http.legacy' uses library if the targetSdkVersion was API level 28 or higher in AndroidManifest.xml file
    if (usesSdkElement) {
    	minSdkVersion = usesSdkElement.get("android:minSdkVersion");
    	targetSdkVersion = usesSdkElement.get("android:targetSdkVersion");
    } else {
        // Use the defaultTargetSdkVersion and defaultMinSdkVersion from build.gradle file in case cordova don't set 'uses-sdk' tag in manifest file
        projectBuildGradleFile =  path.join(context.opts.projectRoot, "platforms", "android", "build.gradle");
        if (fs.existsSync(projectBuildGradleFile)) {
            projectBuildGradleContent = fs.readFileSync(projectBuildGradleFile, 'utf-8');
            var index = projectBuildGradleContent.indexOf("defaultMinSdkVersion=");
            if (index > 0 ) {
                minSdkVersion = projectBuildGradleContent.substring(index + 21, index + 21 + 2);
            }
            index = projectBuildGradleContent.indexOf("defaultTargetSdkVersion=");
            if (index > 0 ) {
                targetSdkVersion = projectBuildGradleContent.substring(index + 24, index + 24 + 2);
            }
        }
    }
    console.log("The project use minSdkVersion: " + minSdkVersion + " and targetSdkVersion: " + targetSdkVersion);

    // See API Level 28 changes: https://developer.android.com/about/versions/pie/android-9.0-changes-28#apache-p
    usesLibraryElements = application.findall('uses-library');
    for (var i = 0; i < usesLibraryElements.length; i++) {
		if (usesLibraryElements[i].get('android:name') === "org.apache.http.legacy") {
			apacheHttpLegacyElement = usesLibraryElements[i];
			break;
		}
	}

	if (!apacheHttpLegacyElement && targetSdkVersion >= 28) {
		apacheHttpLegacyElement = et.SubElement(application, "uses-library");
		apacheHttpLegacyElement.set("android:name", "org.apache.http.legacy");
		if (minSdkVersion <= 23) {
			apacheHttpLegacyElement.set("android:required", "false");
		}
		
		fs.writeFileSync(projectManifestFile, projectManifestXmlTree.write({indent: 4}), 'utf-8');
	} else if (apacheHttpLegacyElement && targetSdkVersion < 28) {
		application.remove(apacheHttpLegacyElement);
    }

    projectConfigXML = path.join(context.opts.projectRoot, "config.xml");
    configXMLContents = fs.readFileSync(projectConfigXML, 'utf-8');
    configXMLTree = new et.ElementTree(et.XML(configXMLContents));
    preferences = configXMLTree.findall("preference");
    for(var i=0; i<preferences.length; i++) {
        preferenceName = preferences[i].get("name");
        if (preferenceName === "trustUserCertificates") {
            trustUserCertificatesElement = preferences[i];
        }
        if (preferenceName === "cleartextTrafficPermitted") {
            cleartextTrafficPermitted = preferences[i].get("value").toLocaleLowerCase() === "true"
        }
    }
    trustUserCertsConfigValue = true;
    if (trustUserCertificatesElement) {
        trustUserCertsConfigValue = trustUserCertificatesElement.get("value");
        if (trustUserCertsConfigValue) {
            // convert from string to boolean
            trustUserCertsConfigValue = trustUserCertsConfigValue.toLowerCase() === "true";
        }
    }
    networkSecurityConfigXML = pathToNetworkSecurityConfigFile;
    networkSecurityConfigXMLContents = fs.readFileSync(networkSecurityConfigXML, 'utf-8');
    networkSecurityConfigXMLTree = new et.ElementTree(et.XML(networkSecurityConfigXMLContents));
    if (networkSecurityConfigXMLTree.getroot() === null) {
        console.log("Warning: kapsel-plugin-corelibs after_prepare hook could not apply network security configuration because the existing xml file is invalid.");
    }
    baseConfigElement = networkSecurityConfigXMLTree.find("base-config");
    if (!baseConfigElement) {
        baseConfigElement = et.SubElement(networkSecurityConfigXMLTree.getroot(), "base-config");
    }

    if (baseConfigElement.get("cleartextTrafficPermitted") !== cleartextTrafficPermitted) {
        if (cleartextTrafficPermitted === undefined) {
            delete baseConfigElement.attrib.cleartextTrafficPermitted
        }
        else {
            baseConfigElement.attrib.cleartextTrafficPermitted = cleartextTrafficPermitted;
        }
        modify = true;
    }

    trustAnchorsElement = baseConfigElement.find("trust-anchors");
    if (!trustAnchorsElement) {
        trustAnchorsElement = et.SubElement(baseConfigElement, "trust-anchors");
    }
    certificatesElements = trustAnchorsElement.findall("certificates");
    for (var j=0; j<certificatesElements.length; j++) {
        if (certificatesElements[j].get("src") === "user") {
            userCertificatesElement = certificatesElements[j];
            break;
        }
    }

    if (trustUserCertsConfigValue && !userCertificatesElement) {
        userCertificatesElement = et.SubElement(trustAnchorsElement, "certificates");
        userCertificatesElement.set("src", "user");
        modify = true;
    }
    else if (!trustUserCertsConfigValue && userCertificatesElement) {
        trustAnchorsElement.remove(userCertificatesElement);
        modify = true;
    }

    if (modify) {
        fs.writeFileSync(pathToNetworkSecurityConfigFile, networkSecurityConfigXMLTree.write({indent: 4}), 'utf-8');
    }
};