cordova.define("kapsel-plugin-consent.Consent", function(require, exports, module) {
var bundle = null; // Internationalization. Loaded in init
var servicesMonitored = {};
var logging = "";

/**
 * The consent plugin, targeting Android versions 5 and below, allow cordova apps to
 * request the user’s consent the first time they attempt to use certain plugins. </br>
 * This functionality is already provided in iOS, Windows UWP and Android 6.0+. So this plugin will not come into effect on these plaforms. </br>
 * Currently supported plugins</br>
 * <ul>
 * <li>kapsel-plugin-calendar</li>
 * <li>cordova-plugin-contects</li>
 * <li>cordova-plugin-geolocation</li>
 * </ul></br>
 * The Consent class is used as a storage for permission values, messages and logging. It uses the EncryptedStorage API to store the consent values.<br/>
 * <br/>
 * <br/>
 * <b>Adding and Removing the Consent Plugin</b><br/>
 * The Consent plugin is added and removed using the
 * <a href="http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-line%20Interface">Cordova CLI</a>.<br/>
 * <br/>
 * cordova plugin add kapsel-plugin-consent<br/>
 * <br/>
 * To remove the Consent plugin from your project, use the following command:<br/>
 * cordova plugin rm kapsel-plugin-consent
 * @namespace
 * @alias Consent
 * @memberof sap
 */
var consent = {};

/**
 * This function first checks if the device is running Android 5.x or lower. Then, it overrides the respective methods of the
 * detected plugins installed. Call the init function on window.plugins.consent under the deviceready listener function.
 * @memberof sap.Consent
 * @function init
 * @instance
 */
consent.init = function() {
    if (device.version < "6" && device.platform == "Android") {
        if (!bundle) {
            // Load required translations
            var i18n = require('kapsel-plugin-i18n.i18n');
            i18n.load({
                path: "plugins/kapsel-plugin-consent/www"
            }, function(i18nBundle) {
                bundle = i18nBundle;
            });
        }

        var noopCallback = function() {};
        var errorCallback = function(result) {
            console.log("Error during sap.Consent plugin init: " + result);
        };

        var plugins = cordova.require("cordova/plugin_list").metadata;

        // check if 
        if (typeof plugins['kapsel-plugin-calendar'] !== "undefined") {
            var oldCordovaExec = cordova.exec;
            cordova.exec = function(success, fail, service, action, args) {

                function onConfirm(buttonIndex) {
                    if (buttonIndex == "3") {
                        consent.setConsentValue(service, "allow", noopCallback, errorCallback);
                        oldCordovaExec(success, fail, service, action, args);
                    } else if (buttonIndex == "1")  {
                        consent.setConsentValue(service, "deny", noopCallback, errorCallback);
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        errorCallback(bundle.get("permission_not_granted"));
                    }
                }

                function checkConsent(status) {
                    if (status == "unset") {
                        var message = consent.getMessage(service);
                        var dontAsk = bundle.get("deny_dont_ask");
                        if (screen.height < 380 || screen.width < 380) {
                            dontAsk = bundle.get("deny_dont_ask_short");
                        }
                        navigator.notification.confirm(
                            message,
                            onConfirm,            // callback to invoke with index of button pressed
                            bundle.get("permission_access"),           // title
                            [dontAsk,bundle.get("deny"),bundle.get("allow")]     // buttonLabels
                        );
                    } else if (status == "deny") {
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        oldCordovaExec(success, fail, service, action, args);
                    }
                }

                // check if the service is monitored
                if (servicesMonitored[service] == undefined) {
                    oldCordovaExec(success, fail, service, action, args);
                } else {
                    // check if permission is granted
                    consent.getConsentValue(service, checkConsent, errorCallback);
                }
            }

            consent.startMonitor("Calendar");
        }

        if (typeof plugins['cordova-plugin-contacts'] !== "undefined") {
            var oldContactsFind = navigator.contacts.find;
            navigator.contacts.find = function(fields, successCB, errorCB, options) {

                function onConfirm(buttonIndex) {
                    if (buttonIndex == "3") {
                        consent.setConsentValue("Contacts", "allow", noopCallback, errorCallback);
                        oldContactsFind(fields, successCB, errorCB, options);
                    } else if (buttonIndex == "1") {
                        consent.setConsentValue("Contacts", "deny", noopCallback, errorCallback);
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        errorCallback(bundle.get("permission_not_granted"));
                    }
                }

                function checkConsent(status) {
                    if (status == "unset") {
                        var message = consent.getMessage("Contacts");
                        var dontAsk = bundle.get("deny_dont_ask");
                        if (screen.height < 740 || screen.width < 740) {
                            dontAsk = bundle.get("deny_dont_ask_short");
                        }
                        navigator.notification.confirm(
                            message,
                            onConfirm,            // callback to invoke with index of button pressed
                            bundle.get("permission_access"),           // title
                            [dontAsk,bundle.get("deny"),bundle.get("allow")]     // buttonLabels
                        );
                    } else if (status == "deny") {
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        oldContactsFind(fields, successCB, errorCB, options);
                    }
                }

                // check if the service is monitored
                if (servicesMonitored["Contacts"] == undefined) {
                    oldContactsFind(fields, successCB, errorCB, options);
                } else {
                    // check if permission is granted
                    consent.getConsentValue("Contacts", checkConsent, errorCallback);
                }
            }

            var oldContactsPick = navigator.contacts.pickContact;
            navigator.contacts.pickContact = function(successCB, errorCB) {

                function onConfirm(buttonIndex) {
                    if (buttonIndex == "3") {
                        consent.setConsentValue("Contacts", "allow", noopCallback, errorCallback);
                        oldContactsPick(successCB, errorCB);
                    } else if (buttonIndex == "1") {
                        consent.setConsentValue("Contacts", "deny", noopCallback, errorCallback);
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        errorCallback(bundle.get("permission_not_granted"));
                    }
                }

                function checkConsent(status) {
                    if (status == "unset") {
                        var message = consent.getMessage("Contacts");
                        var dontAsk = bundle.get("deny_dont_ask");
                        if (screen.height < 740 || screen.width < 740) {
                            dontAsk = bundle.get("deny_dont_ask_short");
                        }
                        navigator.notification.confirm(
                            message,
                            onConfirm,            // callback to invoke with index of button pressed
                            bundle.get("permission_access"),           // title
                            [dontAsk,bundle.get("deny"),bundle.get("allow")]     // buttonLabels
                        );
                    } else if (status == "deny") {
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        oldContactsPick(successCB, errorCB);
                    }
                }

                // check if the service is monitored
                if (servicesMonitored["Contacts"] == undefined) {
                    oldContactsPick(successCB, errorCB);
                } else {
                    // check if permission is granted
                    consent.getConsentValue("Contacts", checkConsent, errorCallback);
                }
            }

            var oldContactSave = Contact.prototype.save;
            Contact.prototype.save = function(successCB, errorCB) {

                function onConfirm(buttonIndex) {
                    if (buttonIndex == "3") {
                        consent.setConsentValue("Contacts", "allow", noopCallback, errorCallback);
                        oldContactSave(properties);
                    } else if (buttonIndex == "1") {
                        consent.setConsentValue("Contacts", "deny", noopCallback, errorCallback);
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        errorCallback(bundle.get("permission_not_granted"));
                    }
                }

                function checkConsent(status) {
                    if (status == "unset") {
                        var message = consent.getMessage("Contacts");
                        var dontAsk = bundle.get("deny_dont_ask");
                        if (screen.height < 740 || screen.width < 740) {
                            dontAsk = bundle.get("deny_dont_ask_short");
                        }
                        navigator.notification.confirm(
                            message,
                            onConfirm,            // callback to invoke with index of button pressed
                            bundle.get("permission_access"),          // title
                            [dontAsk,bundle.get("deny"),bundle.get("allow")]     // buttonLabels
                        );
                    } else if (status == "deny") {
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        oldContactSave(properties);
                    }
                }

                // check if the service is monitored
                if (servicesMonitored["Contacts"] == undefined) {
                    oldContactSave(properties);
                } else {
                    // check if permission is granted
                    consent.getConsentValue("Contacts", checkConsent, errorCallback);
                }
            }

            consent.startMonitor("Contacts");
        }

        if (typeof plugins['cordova-plugin-geolocation'] !== "undefined") {
            var oldGeolocationGet = navigator.geolocation.getCurrentPosition;
            navigator.geolocation.getCurrentPosition = function(onSuccess, onError, options) {

                function onConfirm(buttonIndex) {
                    if (buttonIndex == "3") {
                        consent.setConsentValue("Location", "allow", noopCallback, errorCallback);
                        oldGeolocationGet(onSuccess, onError, options);
                    } else if (buttonIndex == "1") {
                        consent.setConsentValue("Location", "deny", noopCallback, errorCallback);
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        errorCallback(bundle.get("permission_not_granted"));
                    }
                }

                function checkConsent(status) {
                    if (status == "unset") {
                        var message = consent.getMessage("Location");
                        var dontAsk = bundle.get("deny_dont_ask");
                        if (screen.height < 740 || screen.width < 740) {
                            dontAsk = bundle.get("deny_dont_ask_short");
                        }
                        navigator.notification.confirm(
                            message,
                            onConfirm,            // callback to invoke with index of button pressed
                            bundle.get("permission_access"),           // title
                            [dontAsk,bundle.get("deny"),bundle.get("allow")]     // buttonLabels
                        );
                    } else if (status == "deny") {
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        oldGeolocationGet(onSuccess, onError, options);
                    }
                }

                // check if the service is monitored
                if (servicesMonitored["Location"] == undefined) {
                    oldGeolocationGet(onSuccess, onError, options);
                } else {
                    // check if permission is granted
                    consent.getConsentValue("Location", checkConsent, errorCallback);
                }
            }

            var oldGeolocationWatch = navigator.geolocation.watchPosition;
            navigator.geolocation.watchPosition = function(onSuccess, onError, options) {

                function onConfirm(buttonIndex) {
                    if (buttonIndex == "3") {
                        consent.setConsentValue("Location", "allow", noopCallback, errorCallback);
                        oldGeolocationWatch(onSuccess, onError, options);
                    } else if (buttonIndex == "1") {
                        consent.setConsentValue("Location", "deny", noopCallback, errorCallback);
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        errorCallback(bundle.get("permission_not_granted"));
                    }
                }

                function checkConsent(status) {
                    if (status == "unset") {
                        var message = consent.getMessage("Location");
                        var dontAsk = bundle.get("deny_dont_ask");
                        if (screen.height < 740 || screen.width < 740) {
                            dontAsk = bundle.get("deny_dont_ask_short");
                        }
                        navigator.notification.confirm(
                            message,
                            onConfirm,            // callback to invoke with index of button pressed
                            bundle.get("permission_access"),           // title
                            [dontAsk,bundle.get("deny"),bundle.get("allow")]     // buttonLabels
                        );
                    } else if (status == "deny") {
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        oldGeolocationWatch(onSuccess, onError, options);
                    }
                }

                // check if the service is monitored
                if (servicesMonitored["Location"] == undefined) {
                    oldGeolocationWatch(onSuccess, onError, options);
                } else {
                    // check if permission is granted
                    consent.getConsentValue("Location", checkConsent, errorCallback);
                }
            }

            var oldGeolocationClear = navigator.geolocation.clearWatch;
            navigator.geolocation.clearWatch = function(pluginWatchId) {

                function onConfirm(buttonIndex) {
                    if (buttonIndex == "3") {
                        consent.setConsentValue("Location", "allow", noopCallback, errorCallback);
                        oldGeolocationClear(pluginWatchId);
                    } else if (buttonIndex == "1") {
                        consent.setConsentValue("Location", "deny", noopCallback, errorCallback);
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        errorCallback(bundle.get("permission_not_granted"));
                    }
                }

                function checkConsent(status) {
                    if (status == "unset") {
                        var message = consent.getMessage("Location");
                        var dontAsk = bundle.get("deny_dont_ask");
                        if (screen.height < 740 || screen.width < 740) {
                            dontAsk = bundle.get("deny_dont_ask_short");
                        }
                        navigator.notification.confirm(
                            message,
                            onConfirm,            // callback to invoke with index of button pressed
                            bundle.get("permission_access"),           // title
                            [dontAsk,bundle.get("deny"),bundle.get("allow")]     // buttonLabels
                        );
                    } else if (status == "deny") {
                        errorCallback(bundle.get("permission_not_granted"));
                    } else {
                        oldGeolocationClear(pluginWatchId);
                    }
                }

                // check if the service is monitored
                if (servicesMonitored["Location"] == undefined) {
                    oldGeolocationClear(pluginWatchId);
                } else {
                    // check if permission is granted
                    consent.getConsentValue("Location", checkConsent, errorCallback);
                }
            }
            
            consent.startMonitor("Location");
        }

        console.log("consent plugin init complete");
    }
};

/**
 * Get the message for display.
 * @private
 */
consent.getMessage = function(service) {
    if (servicesMonitored[service] === '') {
        var message = bundle.get("allow_access") + '\n' + servicesMonitored[service];
        var regex = /\{0\}/gi;
        return message.replace(regex, bundle.get(service));
    } else {
        return servicesMonitored[service];
    }
}

consent.recordConsentValues = function(service, value) {
    var time = new Date();
    var message = time + " Consents Updated: Serivce--" + service + ", Value--" + value + "\n";
    consent.logging += message;
}

/**
 * This function passes on the currently logged information regarding consent changes to the successCallback function.
 * The successCallback handles how do display this data.
 * @param {Function} successCallback success callback function
 * @param {Function} errorCallback error callback function
 * @memberof sap.Consent
 * @function showConsentValues
 * @instance
 */
consent.showConsentValues = function(successCallback, errorCallback) {
    var append = function() {
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) {
            console.log('file system open: ' + dirEntry.name);
            var isAppend = true;
            createFile(dirEntry, "consentValues.txt", isAppend);
        }, fail);
    }

    var createFile = function(dirEntry, fileName, isAppend) {
        // Creates a new file or returns the file if it already exists.
        dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
            writeFile(fileEntry, consent.logging, isAppend);
        }, fail);
    }

    var writeFile = function (fileEntry, dataObj, isAppend) {
        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function() {
                console.log("Successful file read...");
                readFile(fileEntry);
                consent.logging = "";
            };
            fileWriter.onerror = function (e) {
                console.log("Failed file read: " + e.toString());
            };
            // If we are appending data to file, go to the end of the file.
            if (isAppend) {
                try {
                    fileWriter.seek(fileWriter.length);
                }
                catch (e) {
                    console.log("file doesn't exist!");
                }
            }
            fileWriter.write(dataObj);
        });
    }

    var readFile = function(fileEntry) {
        fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function() {
                console.log("Successful file read");
                successCallback(this.result);
            };
            reader.readAsText(file);
        }, fail);
    }

    var fail = function(error) {
        console.log(error.code);
        errorCallback(JSON.stringify(error));
    }

    append();

}

/**
 * This function generates an object consisting of key-value pairs of (service, value).
 * The callback then handles the data.
 * @param {Function} callback callback function
 * @memberof sap.Consent
 * @function listConsents
 * @instance
 */
consent.listConsents = function(callback) {
    var consentsList = {};
    var keys = Object.keys(servicesMonitored);
    var numConsents = keys.length;
    var numCallbacksCalled = 0;
    for (var i = 0; i < numConsents; ++i) {
        var key = keys[i];
        (function (){ // Need the function to create a copy of key via a closure.
            var closureKey = key;
            consent.getConsentValue(closureKey, function(consentValue) {
                consentsList[closureKey] = consentValue;
                numCallbacksCalled++;
                if (numCallbacksCalled == numConsents) {
                    callback(consentsList);
                }
            });
        })();
    }
};

/**
 * This function starts the monitoring of a service, so a consent popup will be displayed before the plugin code runs. 
 * The consent value will be set to unset, which means the user has yet to decide whether to give consent.
 * @param {String} service name of service
 * @param {Function} successCallback callback function
 * @param {Function} errorCallback callback function
 * @memberof sap.Consent
 * @function startMonitor
 * @instance
 * @example
 * consent.startMonitor("Calendar");
 */
consent.startMonitor = function(service, succesCallback, errorCallback) {
    servicesMonitored[service] = '';
    consent.getConsentValue(service, function(status) {
        // check for null and "null".  Status will be null if the service has never been monitored
        // before.  Status will be "null" if removeConsentValue has been previously called for the
        // service.
        if (status == null || status == "null") {
            consent.setConsentValue(service, "unset", function() {
                    console.log("Consent plugin started monitoring " + service);
                    if (succesCallback != undefined) {
                        succesCallback();
                    }
                }, function(result) {
                    if (errorCallback != undefined) {
                        errorCallback(result);
                    }
                }
            );
        } else {
            // Service is already being monitored.
            if (succesCallback != undefined) {
                succesCallback();
            }
        }
    }, errorCallback);
};

/**
 * This function sets a message to the specified service so that this message is displayed in the popup when requesting consent.
 * Default is empty string.
 * @param {String} service name of service
 * @param {String} message message to be displayed on popup
 * @memberof sap.Consent
 * @function setMessage
 * @instance
 * @example
 * consent.setMessage("Calendar", "Message on popup");
 */
 consent.setMessage = function(service, message) {
    servicesMonitored[service] = message;
}

/**
 * This function stops the monitoring of a service, so user consent is no longer requested
 * @param {String} service name of service
 * @param {Function} callback callback function
 * @memberof sap.Consent
 * @function stopMonitor
 * @instance
 * @example
 * consent.stopMonitor("Calendar");
 */
 consent.stopMonitor = function(service, callback) {
    delete servicesMonitored[service];
    consent.removeConsentValue(service, function(result) {
            console.log("Consent plugin stopped monitoring " + service);
            if (callback != undefined) {
                callback();
            }
        }, function(result) {console.log(result)}
    );
};

/**
 * This function retrieves the consent value of the specified service and handles it through callback
 * @param {String} service name of service
 * @param {Function} successCallback success callback function
 * @param {Function} errorCallback error callback function
 * @memberof sap.Consent
 * @function getConsentValue
 * @instance
 * @example
 * consent.getConsentValue("Calendar", function(status) {alert(status);});
 */
 consent.getConsentValue = function(service, successCallback, errorCallback) {
    sap.AppPreferences.getPreferenceValue(service + "PermissionGranted", successCallback, errorCallback);
};

/**
 * This function sets the consent value of the specified service
 * @param {String} service name of service
 * @param {String} status consent value (could be be "allow", "deny", or "unset")
 * @param {Function} successCallback success callback function
 * @param {Function} errorCallback error callback function
 * @memberof sap.Consent
 * @function setConsentValue
 * @instance
 * @example
 * consent.setConsentValue("Calendar", "allow");
 */
 consent.setConsentValue = function(service, status, successCallback, errorCallback) {
    console.log("Consent plugin setConsentValue called for " + service + " with status " + status);
    var consentSuccessCallback = function() {
    	consent.recordConsentValues(service, status);
        successCallback();
    };
    sap.AppPreferences.setPreferenceValue(service + "PermissionGranted", status, consentSuccessCallback, errorCallback);
};


consent.removeConsentValue = function(service, successCallback, errorCallback) {
    console.log("Consent plugin removeConsentValue called for " + service);
    sap.AppPreferences.setPreferenceValue(service + "PermissionGranted", "null", successCallback, errorCallback);
};

module.exports = consent;
});
