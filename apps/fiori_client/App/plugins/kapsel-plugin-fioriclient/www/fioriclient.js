/*jslint browser:true*/
/*global sap*/
/*global $*/
/*global cordova*/
/*global device*/
/*global module*/
/*global require*/
/*global console*/

/**
 * The FioriClient plugin leverages the Cordova infrastructure
 * to add logic that is needed by the Fiori Client application
 * whenever a page load event occurs. This allows the app to initialize,
 * tweak and enhance the behavior of the web view and existing plugins
 * to create a more rich user experience consistent with the original
 * native implementations of the Fiori Client.
 * <br/> <br/> This plugin encapsulates the Fiori Client logic, including
 * responding to changes in application settings and initializing the toolbar.
 * It's only meant to be used in the context of the Fiori Client application.
 * It should therefore only be added via the create_fiori_client
 * Node.js script, which is also included in the Kapsel SDK.
 *
 * @namespace
 * @alias FioriClient
 * @memberof sap
 */

/// Bundle used to store localized strings. This is loaded when the deviceready event occurs.
var bundle = null;
/// Text used to indicate that the Fiori URL has been changed.
var fioriURLChangedText = null;
/// Text used to indicate that the page is loading.
var loadingThePageText = null;

var launchpad = require("./FioriClient-Launchpad");

var context = {};

var deepLinkErrorDisplayed = false;

//the only parameters supported are appID, fioriUrlIsSMP, authtype, and certificate.
//sample:
var handleFioriUrlWithFakeParameter = function (url) {
    var vars = [],
        hash;
    var config = {};
    var fakeParamCount = 0;
    var questionMarkIndex = url.indexOf('?');
    if (questionMarkIndex > 0) {
        var urlParameters = ""
        var fragmentMarkIndex = url.indexOf('#');
        var fragMentValue = "";
        if (fragmentMarkIndex > questionMarkIndex) {
            urlParameters = url.slice(questionMarkIndex + 1, fragmentMarkIndex)
            fragMentValue = url.slice(fragmentMarkIndex + 1, url.length);
        } else {
            urlParameters = url.slice(questionMarkIndex + 1)
        }
        var hashes = urlParameters.split('&');
        for (var i = hashes.length - 1; i >= 0; i--) {
            hash = hashes[i].split('=');
            if (hash[0]) {
                if (hash[0].toLowerCase() == "appid") {
                    config.appID = hash[1];
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "fioriurlissmp") {
                    config.fioriURLIsSMP = (hash[1].toLowerCase() === "true");
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "certificate") {
                    if (isBase64EncodedJSON(hash[1])) {
                        config.certificate = JSON.parse(atob(hash[1]));
                    } else {
                        config.certificate = hash[1];
                    }
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "authtype") {
                    //for current version only a single authtype element is supported and
                    //only SAML auth type is tested
                    config.auth = [];
                    var authElement = {};
                    authElement.type = hash[1];
                    config.auth.push(authElement);
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "autoselectsinglecert") {
                    config.autoSelectSingleCert = (hash[1].toLowerCase() === "true");
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "logoffhandler") {//"server or "client", default is "client"
                    config.logoffHandler = hash[1].toLowerCase();
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "datavaulttype") {
                    config.data = hash[1];
                    hashes.splice(i, 1);
                    fakeParamCount++;
                }
                // idpLogonURL will be provided as a query string in fiori url for SSO sap authenticator.
                // The query string for idpLogonURL is actually double encoded because it seems to be automatically decoded after entering fiori url.
                else if (hash[0].toLowerCase() == "idplogonurl") {
                    // double decode is required to get normal idplogonurl.
                    decodedIdpLogonURL = decodeURIComponent(decodeURIComponent(hash[1]));
                    config.idpLogonURL = decodedIdpLogonURL;
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "hcpmsroute") {
                    config.hcpmsroute = decodeURIComponent(hash[1]);
                    config.fioriURLIsSMP = true;
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "nobridgewhitelist") {
                    config.noBridgewhitelist = decodeURIComponent(hash[1]).replace(/'/g, "").split(',');
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "multiuser") {
                    config.multiUser = (hash[1].toLowerCase() === "true");
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "backgroundtask") {
                    config.backgroundTask = (hash[1].toLowerCase() === "true");
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == 'prefetch') {
                    config.prefetch = (hash[1].toLowerCase() === "true");
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "usebrowserinstead") {
                    config.usebrowserinstead = hash[1] ? (hash[1].toLowerCase() === "true") : false;
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "enablecachemanager") {
                    config.enableCacheManager = hash[1] ? (hash[1].toLowerCase() === "true") : false;
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "allowsavingformcredentials") {
                    config.allowSavingFormCredentials = hash[1] ? (hash[1].toLowerCase() === "true") : false;
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "skipheadrequest") {
                    config.skipheadrequest = hash[1] ? (hash[1].toLowerCase() === "true") : false;
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "authproxykeychaingroup") {
                    config.authproxyKeychainGroup = hash[1];
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "skiphomebuster") {
                    config.skiphomebuster = hash[1] ? (hash[1].toLowerCase() === "true") : false;
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "handlex509") {
                    config.handleX509 = hash[1] ? (hash[1].toLowerCase() === "true") : false;
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else if (hash[0].toLowerCase() == "webviewtype") {
                    config.webviewType = hash[1];
                    hashes.splice(i, 1);
                    fakeParamCount++;
                } else {
                    console.log("Unsupported url parameter: " + hash[0]);
                    continue;
                }
            }
        }

        console.log("Number of fake parameter found in fioriUrl: " + fakeParamCount);

        if (hashes.length > 0) {
            config.fioriURL = url.slice(0, questionMarkIndex) + '?' + hashes.join('&') + "#" + fragMentValue;
        } else {
            config.fioriURL = url.slice(0, questionMarkIndex);
        }
    } else {
        config.fioriURL = url;
    }
    return config;
};


var scanBarcode = function (context, screenContext, showScreen) {
    cordova.plugins.barcodeScanner.scan(function (result) {
        console.log("Scanner result: \n" +
            "text: " + result.text + "\n" +
            "format: " + result.format + "\n" +
            "cancelled: " + result.cancelled + "\n");

        if (result.cancelled == false) {
            screenContext.fioriConfiguration = result.text; //scanned fiori url
            context.operation.currentScreenState = "show";
            context.operation.currentScreenID = "enterFioriConfiguration";
            showScreen(context, screenContext);
        }
        return;

    }, function (error) {
        console.error("Scanning failed: " + error);

        // to show camera access error dialog
        if (cordova.require("cordova/platform").id == "ios") {
            if (error != null && typeof error === 'string' && error.indexOf("Access to the camera has been prohibited; please enable it in the Settings app to continue") !== -1) {
                navigator.notification.alert(bundle.get("camera_access_denied_launch_settings_message"), function () { },
                    bundle.get("camera_access_restricted_title"), bundle.get("ok"));
            }
        }
    }
    );

}


var onSubmitScreen = function (context, screenContext, onGetConfigData, showScreen, showNotification) {
    var fioriConfig = {};

    var runBarcodeScan = function () {
        console.log('barcode scanning for fiori url...');
        screenContext.barcodescan = false;

        scanBarcode(context, screenContext, showScreen);

    }


    if (context.operation.currentScreenID == "enterFioriConfiguration") {
        //barcode scan for fiori url
        if (screenContext.barcodescan) {
            runBarcodeScan();
            return;
        }

        if (screenContext.cancelled) {
            context.operation.currentScreenState = "show";
            context.operation.currentScreenID = "chooseDemoMode";
            showScreen(context, screenContext);
            return;
        }

        if (screenContext.fioriConfiguration) {
            screenContext.fioriConfiguration = screenContext.fioriConfiguration.trim();
        }

        var checkRequiredConfiguration = function (fioriConfig) {
            var requiredConfigValues = ['appID', 'fioriURL', 'fioriURLIsSMP'];

            //if configuration is not complete, then set state to done and let logonController move
            //to next config source type
            for (var i = 0; i < requiredConfigValues.length; i++) {
                var value = requiredConfigValues[i];
                if ((fioriConfig[value] === undefined || fioriConfig[value] === '') &&
                    (context.appConfig[value] === undefined || context.appConfig[value] === '')) {
                    screenContext.valueStateText = "Missing configuration for '" + value + "', please try again";
                    context.operation.currentScreenState = "show";
                    showScreen(context, screenContext);
                    return false;
                }
            }

            if (isWindows() && fioriConfig.hasOwnProperty('certificate')) {
                screenContext.valueStateText = "Certificate parameter is unsupported on Windows";
                context.operation.currentScreenState = "show";
                showScreen(context, screenContext);
                return false;
            }

            //merge the screen context to appConfig
            parseAppConfig(onGetConfigData, fioriConfig, context);
            return true;
        };

        var displayErrorBox = function (message) {
            screenContext.valueStateText = message;
            context.operation.currentScreenState = "show";
            showScreen(context, screenContext);
        };

        var errorHandling = function (e) {
            console.log("fioriclient.js: Checking reachability is failed. The entered URL is not reachable. " + JSON.stringify(e));
            var onConfirmResponse = function (buttonIndex) {
                if (buttonIndex == 1) {
                    // The user pressed continue
                    checkRequiredConfiguration(fioriConfig);
                } else if (buttonIndex == 2) {
                    // The user pressed cancel
                    displayErrorBox(bundle.get("url_not_reachable_message"));
                    if (isWindows) {
                        context.operation.currentScreenState = "show";
                        showScreen(context, screenContext);
                    }
                }
            }
            navigator.notification.confirm(
                bundle.get("server_could_not_be_reached_continue_anyway"),
                onConfirmResponse,
                bundle.get("connectivity_check_failed"),
                [bundle.get("continue"), bundle.get("request_failed_timeout_cancel")]
            );

        }

        //if user input a string starts with '{', then it means this is a json string for ugly url, instead of a real url
        //or email
        if (screenContext.fioriConfiguration[0] != '{') {
            //if user inputs an email, then switch the configuration source type to "mobileplace"
            if (isEmail(screenContext.fioriConfiguration)) {
                context.operation.currentScreenState = "done";
                context.operation.currentConfigState = "begin";
                context.operation.data = screenContext.fioriConfiguration;
                context.operation.currentConfigType = "mobilePlace";
                onGetConfigData(context);
                return;
            } else if (!isUrl(screenContext.fioriConfiguration)) {
                displayErrorBox(bundle.get("invalid_fiori_url_message"));
                return;
            } else {
                //the fiori url may contain fake parameter for appid and isforsmp, if so, set the parameter value to
                //context.operation, and then remove the fake parameter from the url, as server may not reject the url
                //with unknown parameters
                fioriConfig = handleFioriUrlWithFakeParameter(screenContext.fioriConfiguration);
                fioriConfig.urlWithFakeParameters = screenContext.fioriConfiguration;

                // checking URL reachability
                sap.AuthProxy.sendRequest2("HEAD", fioriConfig.fioriURL, {
                    "Accept-Encoding": "identity"
                }, null,
                    function (result) {
                        //On Windows the result contains information about the accessibility
                        if (isWindows() && result.status == "503") {
                            errorHandling(result.responseText);
                        } else {
                            checkRequiredConfiguration(fioriConfig);
                        }
                    },
                    function (e) {
                        if (e && e.errorCode && (e.errorCode === sap.AuthProxy.ERR_CLIENT_CERTIFICATE_VALIDATION || e.errorCode === sap.AuthProxy.ERR_SERVER_CERTIFICATE_VALIDATION)) {
                            // The error callback was invoked because the connect failed due to invalid
                            // certificate.  This means that the server is reachable.
                            checkRequiredConfiguration(fioriConfig);
                            return;
                        }
                        //error messages for possible request errors as references
                        //{"errorCode":-1,"description":"Unknown Error. Details : Unable to resolve host \"wrongdewdfgwp00926.wdf.sap.corp\": No address associated with hostname."}
                        //{"errorCode":-1,"description":"Unknown Error. Details : failed to connect to test.wdf.sap.corp/10.78.188.9 (port 8001): connect failed: ETIMEDOUT (Connection timed out)."} (*timeout max. 2min)
                        errorHandling(e);
                    },
                    15, // 15 seconds, Max Timeout: 30 sec (15x2)
                    null, true);
            }
        } else {
            try {
                fioriConfig = JSON.parse(screenContext.fioriConfiguration);
                if (!checkRequiredConfiguration(fioriConfig)) return;
            } catch (e) {
                console.error('Invalid configuration data. Caused by: ' + e);
                displayErrorBox(bundle.get("invalid_config_data_message"));
                return;
            }
        }

    } else if (context.operation.currentScreenID == "chooseDemoMode") {
        var useDemoMode = screenContext.demoMode;
        context.operation.mustWriteToAppPreferences = true;
        if (useDemoMode) {
            fioriConfig = {
                demoMode: true,
                appID: "fioriDemoMode",
                fioriURL: "https://www.sapfioritrial.com",
                fioriURLIsSMP: false
            };
            parseAppConfig(onGetConfigData, fioriConfig, context);
        } else {
            context.appConfig.demoMode = false;
            context.operation.currentScreenState = "show";
            context.operation.currentScreenID = "enterFioriConfiguration";

            var plugins = cordova.require("cordova/plugin_list").metadata;
            var isBarcodescannerPluginAvailable = !isWindows() && (plugins['kapsel-plugin-barcodescanner'] !== null) && (typeof plugins['kapsel-plugin-barcodescanner'] === "string");
            screenContext.isBarcodescannerPluginAvailable = isBarcodescannerPluginAvailable;

            showScreen(context, screenContext);
        }
    }
};

var loadConfigurationFromAppConfig = function (onSuccess, context) {
    var config = fiori_client_appConfig;
    if (!config.hasOwnProperty('webviewType')) {
        for (var keyOfConfig in config) {
            if (keyOfConfig.toLowerCase() == "webviewtype") {
                config.webviewType = config[keyOfConfig];
                break;
            }
        }
    }
    try {
        parseAppConfig(onSuccess, config, context);
    } catch (e) {
        var errorTitle = bundle.get('error_title');
        sap.Logger.error('Failed to load the appConfig.js file: ' + e.toString(), "FIORI_CLIENT");
        if (e.message) {
            navigator.notification.alert(e.message, null, errorTitle);
        }
        else {
            navigator.notification.alert(e.toString(), null, errorTitle);
        }
        return;
    }
};

//this method also handles config from mobile place. In both case, the config is a json string
var handleConfigFromMobilePlace = function (onSuccess, context) {
    try {
        parseAppConfig(onSuccess, context.operation.data, context);
    } catch (e) {
        console.error('Invalid MDM config. Caused by: ' + e);
        if (context.operation.currentConfigType == "mobilePlace") {
            context.operation.logonView.context.operation.logonView.showNotification("ERR_MOBILE_PLACE_CONFIG_INVALID");
        } else {
            context.operation.logonView.context.operation.logonView.showNotification("ERR_MDM_CONFIG_INVALID");
        }
        return;
    }
};

var loadSavedConfiguration = function (onSuccess, context) {
    var preferenceValuesToRead =
        [
            'skipShowFirstUseTips',
            'appID',
            'fioriURL',
            'fioriURLIsSMP',
            'isMDMConfig',
            'LogLevel',
            'certificate',
            'demoMode',
            'previous_fiori_urls',
            'SwitchToProduction',
            'urlWithFakeParameters',
            'autoSelectSingleCert',
            'logoffHandler',
            'dataVaultType',
            'prepackaged',
            'proxyExceptionList',
            'idpLogonURL',
            'appName',
            'proxyID',
            'proxyURL',
            'noBridgewhitelist',
            'multiUser',
            'backgroundTask',
            'privacyPolicies',
            'backgroundImage',
            'styleSheet',
            'hideLogoCopyright',
            'copyrightLogo',
            'copyrightMsg',
            'disablePasscode',
            'theme',
            'prefetch',
            'refreshSAMLSessionOnResume',
            'refreshOAUTHSessionOnResume',
            'useLocalStorage',
            'usebrowserinstead',
            'enableCacheManager',
            'allowSavingFormCredentials',
            'skipheadrequest',
            'deleteClientCertificatesOption',
            'authproxyKeychainGroup',
            'skiphomebuster',
            'handleX509',
            'webviewType',
            'eulaVersion',
            'psVersion',
            'skipPsRegionChecking',
            'enablePrivacyStatement',
            'eulaHyperlink',
            'psHyperlink',
            'eulaMsg',
            'eulaAndPsMsg'
        ];
    sap.AppPreferences.getPreferenceValues(preferenceValuesToRead, function (fioriConfig) {
        try {
            if (fioriConfig.hasOwnProperty('copyrightMsg')) {
                try {
                    fioriConfig['copyrightMsg'] = JSON.parse(fioriConfig['copyrightMsg']);
                } catch (e) {
                    console.error('Property copyrightMsg not a valid JSON string. Caused by: ' + e);
                }
            }

            //only a new 'deep' config structure will override the saved 'flat' one
            if ((typeof fiori_client_appConfig) != "undefined" && fioriConfig && fioriConfig.certificate && (typeof fioriConfig.certificate.id) == "undefined") {
                if (fiori_client_appConfig.hasOwnProperty('certificate') && fiori_client_appConfig.certificate.id) {
                    fioriConfig.certificate = fiori_client_appConfig.certificate;
                    context.operation.mustWriteToAppPreferences = true;
                    console.log("Certificate provider config was updated.");
                }
            }

            if ((typeof fiori_client_appConfig) != "undefined" && fioriConfig) {
                var toPolicy = function (val) {
                    return new sap.Usage.PrivacyPolicy(val.id, val.label, val.url, val.lastUpdated)
                };
                var policyEquals = function (a, b) {
                    return a.id == b.id && a.label == b.label && a.url == b.url && a.lastUpdated == b.lastUpdated;
                };

                var currentPolicies = [];
                var savedPolicies = [];
                if (fiori_client_appConfig.privacyPolicies) {
                    if (fiori_client_appConfig.privacyPolicies.constructor === Array) {
                        currentPolicies = fiori_client_appConfig.privacyPolicies.map(toPolicy);
                    }
                    else {
                        console.log('AppConfig privacyPolicies not a valid array');
                    }
                }
                if (fioriConfig.privacyPolicies) {
                    try {
                        if (fioriConfig.privacyPolicies.constructor !== Array) {
                            // Stringified value on Android only
                            fioriConfig.privacyPolicies = JSON.parse(fioriConfig.privacyPolicies);
                        }
                        savedPolicies = fioriConfig.privacyPolicies.map(toPolicy);
                    }
                    catch (error) {
                        console.error('Stored privacyPolicies was neither an Array nor a valid stringified JSON Array. Caused by: ' + error);
                    }
                }

                if (currentPolicies.length !== savedPolicies.length) {
                    fioriConfig.privacyPolicies = currentPolicies;
                    context.operation.mustWriteToAppPreferences = true;
                    console.log("Privacy Policy config was updated.");
                }
                else {
                    for (var i = 0; i < currentPolicies.length; i++) {
                        if (!policyEquals(currentPolicies[i], savedPolicies[i])) {
                            fioriConfig.privacyPolicies = currentPolicies;
                            context.operation.mustWriteToAppPreferences = true;
                            console.log("Privacy Policy config was updated.");
                            break;
                        }
                    }
                }

                // EULA and PS properties in appConfig.js have higher priority. If appConfig.js has
                // different values from saved AppPreferences, then overwrite to AppPreferences.
                var preferencesForEulaPs = [
                    'eulaVersion',
                    'psVersion',
                    'skipPsRegionChecking',
                    'enablePrivacyStatement',
                    'eulaHyperlink',
                    'psHyperlink',
                    'eulaMsg',
                    'eulaAndPsMsg'
                ];
                for (i = 0; i < preferencesForEulaPs.length; i++) {
                    if (fiori_client_appConfig[preferencesForEulaPs[i]] != fioriConfig[preferencesForEulaPs[i]]) {

                        if (typeof fiori_client_appConfig[preferencesForEulaPs[i]] === "undefined") {
                            // Use "null" literal because on iOS, <null> value cannot be saved in AppPreferences due to error:
                            // Attempt to set a non-property-list object <null> as an NSUserDefaults/CFPreferences value
                            fioriConfig[preferencesForEulaPs[i]] = newNullLiteral();
                        } else {
                            fioriConfig[preferencesForEulaPs[i]] = fiori_client_appConfig[preferencesForEulaPs[i]];
                        }
                        context.operation.mustWriteToAppPreferences = true;
                        sap.Logger.info("EULA and PS configuration was updated. " + preferencesForEulaPs[i] + "=" + fioriConfig[preferencesForEulaPs[i]], 'FIORI_CLIENT');
                    }
                }
            }

            parseAppConfig(onSuccess, fioriConfig, context);
        } catch (e) {
            sap.Logger.error(e.toString());
            sap.Logger.error('Failed to load the appConfig.js file.');
            navigator.notification.alert(e.toString(), null, 'Error');
            return;
        }
    }, function () {
        //do not have saved config
        context.operation.currentConfigState = "done";
        setTimeout(function () {
            onSuccess(context);
        }, 0);
    });
};

//this method lets application delegate to handle the configuration in context.
//if the config type is saved or appconfig.js, it is expected this method will handle it as the logic belongs to app dev
//for other config source types, this method can decide whether skip it by changing the status from begin to done, or customize the context data, and
//then advance the configstate to next state.
var onGetAppConfig = function (contextParam, onSuccess, onError) {
    var innerSuccess = function (context) {
        onSuccess(context, onError);
    };

    if (!context) {
        context = contextParam;
    }

    var configType = context.operation.currentConfigType;
    if (!configType) {
        configType = context.operation.configSources[context.operation.currentConfigIndex];
    }

    sap.Logger.debug("fioriClient onGetAppConfig, currentConfigIndex=" + context.operation.currentConfigIndex + ", currentConfigType=" + configType + ", currentConfigState=" + context.operation.currentConfigState);

    if (configType == "saved") {
        //if application has complete config, return state to "complete", otherwise return "done" to move to next config source
        loadSavedConfiguration(innerSuccess, context);
    } else if (configType == "appConfig.js" && context.operation.currentConfigState == "run") {
        loadConfigurationFromAppConfig(innerSuccess, context);
    } else if ((configType == "mobilePlace" ||
        configType == "mdm") && context.operation.currentConfigState == "run") {
        handleConfigFromMobilePlace(innerSuccess, context);
    } else {
        if (context.operation.currentConfigState == "begin") {
            //try to load the fiori url just inputed by user before switching the webview type
            if (configType == "user" && isIOS()) {
                sap.AppPreferences.getPreferenceValue("fioriURLFromUser", function (savedURL) {
                    if (savedURL) {
                        context.operation.fioriConfiguration = savedURL;
                        context.operation.currentScreenID = "enterFioriConfiguration";
                        context.operation.currentConfigState = "run";
                        sap.AppPreferences.deletePreferenceValue("fioriURLFromUser", function () {
                            innerSuccess(context);
                        });
                    }
                    else {
                        context.operation.currentConfigState = "run";
                        setTimeout(function () {
                            innerSuccess(context);
                        }, 0);
                    }
                }, function (result) {
                    context.operation.currentConfigState = "run";
                    setTimeout(function () {
                        innerSuccess(context);
                    }, 0);
                });
                return;
            }
            else {
                context.operation.currentConfigState = "run";
            }
        } else if (context.operation.currentConfigState == "run") {
            context.operation.currentConfigState = "done";
        }
        setTimeout(function () {
            innerSuccess(context);
        }, 0);
    }
};

var onRegistrationError = function (error) {
    logonErrorCallback(error);
};

var onRegistrationSuccess = function (result, forNewRegistration) {
    sap.logon.Utils.logPerformanceMessage("fioriclient.js: onRegistrationSuccess");

    var onSuccessCallback = function () {
        //set SAP authenticatior idp url to no bridge whitelist
        if (context.appConfig.idpLogonURL && sap.Settings) {
            sap.Settings.setIdpUrl(context.appConfig.idpLogonURL, logonCompletedCallback,
                function () {
                    sap.Logger.error('Failed to set authenticator idp url', 'FIORI_CLIENT');
                    logonCompletedCallback(result, forNewRegistration);
                });
        }
        else {
            logonCompletedCallback(result, forNewRegistration);
        }
    };

    var handleLocalPasscodePolicy = function () {
        // Conditionally applies the local passcode policy changes to the data vault and result.policyContext
        if (!context.appConfig.fioriURLIsSMP && !context.appConfig.isMDMConfig && (typeof fiori_client_appConfig) != "undefined" && isPasscodePolicyChanged(fiori_client_appConfig.passcodePolicy, result.policyContext)) {
            var passcodeContext = {
                passcodePolicy: isWindows() ? JSON.stringify(fiori_client_appConfig.passcodePolicy) : fiori_client_appConfig.passcodePolicy
            };
            sap.logon.Core.applyLocalPasscodePolicy(
                function () {
                    sap.Logger.info('Local passcode policy application was successful.', 'FIORI_CLIENT');
                },
                function (e) {
                    sap.Logger.error("Failed to apply local passcode policy: " + JSON.stringify(e));
                },
                passcodeContext
            );
            result.policyContext = fiori_client_appConfig.passcodePolicy;
        }
    };

    if (!result) {
        console.log("Error: No registration object in 'completed' function.");
        return;
    }

    if (context.operation.mustWriteToAppPreferences) {
        sap.Logger.info('Registration was successful.', 'FIORI_CLIENT');
        if (context.appConfig.isForSMP) {
            var serverHost = result.registrationContext.serverHost;
            var serverPort = result.registrationContext.serverPort ? ":" + result.registrationContext.serverPort : "";
            var scheme = result.registrationContext.https ? 'https' : 'http';
            // Set the hardcoded Fiori URL to be the server the application registered to
            // concatenated with the Fiori launchpad URL. This value will then be stored
            // in AppPreferences, where it will be retrieved from then on.
            context.appConfig.fioriURL = scheme + '://' + serverHost + serverPort + context.appConfig.endpointSuffix;

            //1880548768, Persist passcode policy returned by logon core
            if (result.policyContext) {
                context.appConfig.passcodePolicy = result.policyContext;
            }
        }
        context.appConfig.isMDMConfig = (context.operation.configSources[context.operation.currentConfigIndex] === 'mdm');

        sap.AppPreferences.setPreferenceValues(context.appConfig,
            function () {
                sap.Logger.info('Logon was successful.', 'FIORI_CLIENT');
                context.smpRegContext = result;
                context.operation.mustWriteToAppPreferences = false;
                onSuccessCallback();
            },
            function (e) {
                throw new Error(e);
            }
        );
    }
    else {
        if (isWindows()) {
            handleLocalPasscodePolicy();
            context.smpRegContext = result;
            onSuccessCallback();
        }
        else {
            sap.logon.Core.getMDMConfiguration(
                function (config) {
                    handleMDMConfig(config, context, result.policyContext,
                        function (hasMDM) {
                            if (hasMDM && !context.appConfig.isMDMConfig) {
                                // Only change from 'non-MDM' -> 'has-MDM'; cannot override MDM after being used once
                                context.appConfig.isMDMConfig = true;
                                sap.AppPreferences.setPreferenceValue('isMDMConfig', true, function () { }, function () { });
                            }
                            handleLocalPasscodePolicy();
                            context.smpRegContext = result;
                            onSuccessCallback();
                        });
                },
                function (error) {
                    sap.Logger.error("Fail to get MDM configuration: " + JSON.stringify(error));
                });
        }
    }
    //if enableCacheManager is undefined, the following calls will just return and not disable the CacheManager
    if (sap.CacheManager) {
        sap.CacheManager.setCacheEnabled(context.appConfig.enableCacheManager);
        sap.CacheManager.setSAPUI5LifecycleManagementEnabled(context.appConfig.enableCacheManager);
    }

    // Optimised FC setup
    if (sap.Toolbar) {
        // Hide/disable the toolbar when prefetch
        sap.Toolbar.setEnabled(!context.appConfig.prefetch);
    }
};

var isConfigChanged = function (newValue, oldValue) {
    //For javascript comparison, undefined is not equal false or "", but for MDM config, they are treated same
    //so need at least one of the value is true
    //passcode policy defined in appconfig uses string for number and boolean type, but registration context uses actual type
    //so convert to string to compare
    if ((newValue || oldValue) && (String(newValue) != String(oldValue))) {
        return true;
    }
    else {
        return false;
    }
};

// The URL needs it's own compare function so that default ports are properly ignored.
var isUrlChanged = function (newUrl, oldUrl) {
    var newUrlElement = document.createElement('a');
    newUrlElement.href = newUrl;
    var oldUrlElement = document.createElement('a');
    oldUrlElement.href = oldUrl;
    if (newUrlElement.protocol !== oldUrlElement.protocol
        || newUrlElement.host !== oldUrlElement.host
        || newUrlElement.port !== oldUrlElement.port
        || newUrlElement.pathname !== oldUrlElement.pathname
        || newUrlElement.hash !== oldUrlElement.hash) {
        return true;
    }
    return false;
}

var isPasscodePolicyChanged = function (newPasscodePolicy, currentPasscodePolicy) {
    if (!newPasscodePolicy && !currentPasscodePolicy) {
        return false;
    }
    if ((!newPasscodePolicy && currentPasscodePolicy) || (newPasscodePolicy && !currentPasscodePolicy)) {
        return true;
    }

    var localPolicyChanged = false;
    var allPolicies = ['allowFingerprint', 'defaultAllowed', 'expirationDays',
        'hasDigits', 'hasLowerCaseLetters', 'hasSpecialLetters', 'hasUpperCaseLetters',
        'lockTimeout', 'minLength', 'minUniqueChars', 'retryLimit'];
    if (isWindows()) {
        //Fingerprint is not supported on Windows yet
        var fingerPrintIndex = allPolicies.indexOf('allowFingerprint');
        if (fingerPrintIndex > -1) {
            allPolicies.splice(fingerPrintIndex, 1);
        }
    }

    var policyChanges = {};

    for (var i = 0; i < allPolicies.length; ++i) {
        var key = allPolicies[i];
        if (isConfigChanged(currentPasscodePolicy[key], newPasscodePolicy[key])) {
            policyChanges[key] = [currentPasscodePolicy[key], newPasscodePolicy[key]];
            localPolicyChanged = true;
        }
    }
    var changelog = function (cl) {
        var out = '';
        var items = Object.keys(cl).sort();
        for (var i = 0; i < items.length; ++i) {
            var key = items[i];
            out += (key + ': ' + cl[key][0] + ' -> ' + cl[key][1] + '\n');
        }
        return out;
    };

    if (localPolicyChanged) {
        console.log('Passcode Policy was updated.\n' + changelog(policyChanges));
        return true;
    }
    return false;
};

/**
 * Log the Kapsel SDK version and the Build timestamp. With this info, we can verify that
 * if the Fiori Client picks up the correct Kapsel SDK version. The logs will
 * be printed during the onDeviceReady event handler, so to see the logs, need
 * to change the log level to INFO, then close and restart Fiori Client.
 */
function logVersionBuildTime() {
    var i18n = require('kapsel-plugin-i18n.i18n');
    i18n.load({
        path: "plugins/kapsel-plugin-fioriclient/www",
        name: "application"
    }, function (buildInfo) {
        var version = buildInfo.get("version");
        var buildTimestamp = buildInfo.get("build_timestamp");
        console.log("Kapsel SDK version: " + version + " ; Build timestamp: " + buildTimestamp);
    });
}

//if MDM configuration is available, it is used to compare with the current settings to
//decide what action should be taken. No matter whether the current config is from MDM or
//not.
//For properties of appid, fioriURL, fioriURLIsSMP, certifcate as they change will reset the app, and
//the MDM configuration will be picked up when initializing the app after resetting

//For properties of AppName, autocertselect, passcode policy (only for no SMP case), their change should be applied immediately
//and also write into apppreference, so when next time app restart, the value will be picked up

//For logLevel, passcode policy (for SMP case) the change should be ignored as log level can be set by user or server

// Sends the callback one boolean argument, indicating whether MDM configuration was applied.
// The argument value is false if no/empty config and true otherwise.

var handleMDMConfig = function (newMdmConfig, currentContext, currentPasscodePolicy, callbackToContinue) {

    //if MDM config is not available, just continue the screen flow.
    if (!newMdmConfig || Object.keys(newMdmConfig).length === 0) {
        callbackToContinue(false);
        return;
    }

    var passcodeChanged = false;
    var resetAllRequired = false;
    // Determine what has changed. The first condition checks at least one of them has a no empty or undefined value.
    // Change from undefined to undefined is ignored. sometime registration context sets empty string as default value
    var newMDMFioriURL = newMdmConfig.fioriURL
    if (newMDMFioriURL) {
        newMDMFioriURL = newMDMFioriURL.replace(/[\\\/]$/, '');
    }
    var currentFioriURL = currentContext.appConfig.fioriURL;
    if (currentFioriURL) {
        currentFioriURL = currentFioriURL.replace(/[\\\/]$/, '');
    }
    if (isUrlChanged(newMDMFioriURL, currentFioriURL)) {
        resetAllRequired = true;
    }
    if (isConfigChanged(newMdmConfig.appID, currentContext.appConfig.appID)) {
        resetAllRequired = true;
    }
    if (isConfigChanged(newMdmConfig.fioriURLIsSMP, currentContext.appConfig.fioriURLIsSMP)) {
        resetAllRequired = true;
    }
    if (isConfigChanged(newMdmConfig.certificate, currentContext.appConfig.certificate)) {
        resetAllRequired = true;
    }
    if (isAndroid() && isConfigChanged(newMdmConfig.webviewType, currentContext.appConfig.webviewType)) {
        resetAllRequired = true;
    }

    if (!resetAllRequired) {
        //Add below code for SF support and fix the bcp 210388/2019 No attachments (e.g. photos) possible in
        if ((isIOS() || isAndroid()) && newMdmConfig.webviewType == "sf") {
            sap.AppPreferences.setPreferenceValue('webviewType', newMdmConfig.webviewType,
                function () {
                    goToFioriURL();
                }, function (error) {
                    console.log("Error setting webview type preference value: " + error);
                });
        }

        if (isConfigChanged(newMdmConfig.autoSelectSingleCert, currentContext.appConfig.autoSelectSingleCert)) {
            currentContext.appConfig.autoSelectSingleCert = newMdmConfig.autoSelectSingleCert;
            sap.AppPreferences.setPreferenceValue('autoSelectSingleCert', currentContext.appConfig.autoSelectSingleCert, null, null);

            sap.AuthProxy.setAutoSelectCertificateConfig(null, null, currentContext.appConfig.autoSelectSingleCert);
        }

        if (isConfigChanged(newMdmConfig.handleX509, currentContext.appConfig.handleX509)) {
            sap.AuthProxy.setHandleWebviewX509Challenges(function () { }, function () { }, newMdmConfig.handleX509);
        }

        // check the passcode policy
        if (!context.appConfig.fioriURLIsSMP && currentPasscodePolicy) {
            passcodeChanged = isPasscodePolicyChanged(newMdmConfig.passcodePolicy, currentPasscodePolicy);
        }
    }

    if (resetAllRequired) {

        navigator.notification.alert(bundle.get("configuration_change_app_reset_required"), function () {
            resetSettings(newMdmConfig.deleteClientCertificatesOption);
        },
            bundle.get("configuration_change_app_reset_required_title"), bundle.get("ok"));

    } else {
        if (passcodeChanged) {
            sap.logon.Core.applyPasscodePolicy(null, function (error) {
                sap.Logger.error('Fail to apply passcode policy. Details: ' + JSON.stringfy(error), 'FIORI_CLIENT');
            });
        }
        callbackToContinue(true);
    }
};

var logonCompletedCallback = function (result, forNewRegistration) {
    var shouldGoToFioriUrl = forNewRegistration ? true : false;


    var setSAMLChallengeHandlerIfRequired = function () {
        sap.Logon.getConfiguration(function (jsonconfig) {

            var authConfig = JSON.parse(jsonconfig);
            if (authConfig && authConfig.saml && authConfig.saml[0] && authConfig.saml[0].data) {
                var samlConfig = authConfig.saml[0].data;
                var notificationShowing = false;
                var handleSAMLChallenge = function (requestURL) {
                    if (!notificationShowing) {

                        //directly load fiori url by calling window.location.reload(true) will not work, as at that moment datavault is
                        //still unlocked, so logon.init will immediately return success without doing SAML auth. Once other plugins get
                        //the logon.init onSAPLogonSuccess event, they will start sending the requests to server, which will again
                        //trigger the SAML auth and mess mess up with the current SMAL auth started by the fiori url page redirect

                        notificationShowing = true;
                        navigator.notification.confirm(bundle.get("request_failed_timeout"),
                            function (actionItem) {
                                notificationShowing = false;
                                if (actionItem == 1) {
                                    // Loading via window.history.go doesn't work on Android in some cases.
                                    if (isAndroid()) {
                                        sap.logon.Core.loadStartPage(function () {
                                            // Don't need to do anything on success callback
                                        }, function () {
                                            sap.Logger.error("Failed to load start page after SAML session timeout.");
                                        });
                                    } else {
                                        //the first page is loaded from cordova's config.xml
                                        var pages = window.history.length - 1;
                                        window.history.go(-pages);
                                    }
                                } else if (actionItem == 2) {
                                    sap.Logon.performSAMLAuth();
                                }

                            },
                            bundle.get("request_failed_timeout_title"), [bundle.get("request_failed_timeout_reload"),
                            bundle.get("request_failed_timeout_Login"),
                            bundle.get("request_failed_timeout_cancel")
                        ]
                        );
                    }

                };

                sap.AuthProxy.setSAMLChallengeHandler(
                    function () {
                        sap.Logger.info('Logon setSAMLChallengeHandler success.', 'FIORI_CLIENT');
                        if (shouldGoToFioriUrl) {
                            goToFioriURL();
                        }
                    },
                    function (error) {
                        sap.Logger.info('Logon setSAMLChallengeHandler failed: ' + json.stringify(error), 'FIORI_CLIENT');
                        if (shouldGoToFioriUrl) {
                            goToFioriURL();
                        }
                    },
                    handleSAMLChallenge, samlConfig);
            } else {
                if (shouldGoToFioriUrl) {
                    goToFioriURL();
                }
            }
        },
            function (error) {
                sap.Logger.info('Logon getConfiguration failed:' + json.stringify(error), 'FIORI_CLIENT');
                if (shouldGoToFioriUrl) {
                    goToFioriURL();
                }
            },
            "authentication");
    }

    //for ios (SFSafariViewController) or Android (custom tabs), skip first tip and SAML preemptive
    // authentication
    if (context.appConfig.prepackaged || context.appConfig.webviewType == "sf") {
        //do not show first tip for prepackaged app
        goToFioriURL();
    } else {
        sap.AppPreferences.getPreferenceValue('skipShowFirstUseTips', function (skipShowFirstUseTips) {
            if (skipShowFirstUseTips === true) {
                // Windows does not have this variable.
                if (isWindows() || sap.FioriClient.loadByIndexPage) {
                    shouldGoToFioriUrl = true;
                }
            } else {
                setTimeout(showFirstUseTips, 1000);
            }
            setSAMLChallengeHandlerIfRequired();
        }, function (error) {
            setTimeout(showFirstUseTips, 1000);
            setSAMLChallengeHandlerIfRequired();
        });
    }
};


//the following flag is used to avoid the duplicated authentication request issue, as a second request to either idp or
//sp will invalidate the previous request
var skipGotoFioriUrl = false;

//method to handle openurl request from SAP authenticator and other source. The url should follow x-callback-url protocol, and
//currently, the only source supported is com.sap.authenticator. Requests from unknown source are ignored
//if the url is handled, the method returns true, otherwise, returns false to caller.
//the method may be called from logon or gotofioriURL, when it is called by
//gotofioriUrl, the datavaule is already unlocked. When it is called by logonController, it may or may not be locked,
//so unlock must be called first before setting the url
var handleOpenURL = function (errorCallback, url) {
    sap.Logger.debug('fioriclient handleOpenURL called' + encodeURI(url), 'FIORI_CLIENT');

    var loadDeeplinkURL = function (retrievedFioriURL, elementDeepLinkURL) {
        if ((retrievedFioriURL != null) && (retrievedFioriURL != "")) { //retrievedFioriURL == "" means fiori url is not configured yet.
            var elementFioriURL = document.createElement("a");
            elementFioriURL.href = retrievedFioriURL;

            if ((elementDeepLinkURL.host == elementFioriURL.host) &&
                (elementDeepLinkURL.protocol == elementFioriURL.protocol)) { // comparing host (hostname + : + port) and protocol
                var processedDeepLinkUrl = elementDeepLinkURL.href;
                if ((processedDeepLinkUrl != null) && (processedDeepLinkUrl != "")) {
                    console.log("handleopenurl to load deep link " + encodeURI(processedDeepLinkUrl));

                    if ((document.URL.toLowerCase().indexOf("file:") != -1) && (document.URL.toLowerCase().indexOf("index.html") != -1)) { //cold start case
                        //Calling setFioriURL and adding buster are needed for cold start case..
                        //When fc is cold start and deeplink is about to be loaded, it seems that the request has to have buster.
                        //If not, when home fiori url was loaded by click home toolbar button over the loaded deeplink page,
                        //home fiori url is loaded correctly but plugins are not loaded. It can cause alert dialog is not popup.
                        //Also, it seems that setFioriURL needs to be called for current logic/implementation of FC
                        //because it needs to call Settings.initNoLoadPolicy at cold start. If it's not called,
                        //it seems that some plugins are not loaded when home fiori url is loaded by home toolbar button in cold start case.
                        setFioriURL(retrievedFioriURL);
                        processedDeepLinkUrl = addBusterToURL(processedDeepLinkUrl);
                        skipGotoFioriUrl = true;

                        if (isAndroid()) {
                            var registerForLogonCallback = function () {
                                // For Android, after below event(s) is triggered, deeplink url will be loaded (for passcode enabled case)
                                document.addEventListener(
                                    "onSapResumeSuccess",
                                    function () {
                                        window.location.href = processedDeepLinkUrl;
                                    },
                                    false
                                );

                                document.addEventListener(
                                    "onSapLogonSuccess",
                                    function () {
                                        window.location.href = processedDeepLinkUrl;
                                    },
                                    false
                                );
                            }


                            //'onSapLogonSuccess' will get fired in logonController.js#onFullRegistered,
                            //and subsequently handleOpenUrl will get called in onFlowSuccess in onFullRegistered
                            //In this case, onSapLogonSuccess would never get fired again after this method called.
                            //So navigate to new url directly if event fired
                            if (sap.Logon && sap.Logon.isSapLogonFired && typeof (sap.Logon.isSapLogonFired) == 'function') {
                                if (sap.Logon.isSapLogonFired()) {
                                    window.location.href = processedDeepLinkUrl;
                                } else {
                                    registerForLogonCallback();
                                }
                            } else {
                                registerForLogonCallback();
                            }

                        } else {
                            window.location.href = processedDeepLinkUrl;
                        }

                    } else {
                        if (isWindows()) {
                            skipGotoFioriUrl = true;
                            var data = {};
                            processedDeepLinkUrl = addBusterToURL(processedDeepLinkUrl);
                            data.url = processedDeepLinkUrl;
                            if (context.appConfig.usebrowserinstead && context.appConfig.usebrowserinstead == true) {
                                data.usebrowserinstead = true;
                            }
                            if (context.appConfig.skipheadrequest && context.appConfig.skipheadrequest == true) {
                                data.skipheadrequest = true;
                            }
                            fireEvent("fioriurl_initial_set", data);
                        } else {
                            window.location.href = processedDeepLinkUrl;
                        }
                    }
                }
            } else { // when wrong url is used, cannot open dialog will be shown.
                function showDeeplinkFailureMessage() {
                    sap.Logger.error("Deep link navigation is blocked.");

                    // Only show error once for the page currently loaded.
                    // Subsequent calls will just have an error in the log similar to Chrome.
                    if (!deepLinkErrorDisplayed) {
                        deepLinkErrorDisplayed = true;
                        navigator.notification.alert(bundle.get("deeplink_alert_message"), function () {
                            if ((document.URL.toLowerCase().indexOf("file:") != -1) &&
                                (document.URL.toLowerCase().indexOf("index.html") != -1)) { //cold start case

                                //for the case that iOS FC is cold start and deeplink url cannot be opened.
                                //If fioriPendingOpenURL is existed, it means that handleOpenURL is
                                //called from goToFioriURL() and it should call goToFioriURL one more time to load home fiori url.
                                if (window.fioriPendingOpenURL) {
                                    window.fioriPendingOpenURL = null;
                                    setTimeout(goToFioriURL, 1000);
                                }
                            }
                        },
                            bundle.get("deeplink_alert_title"), bundle.get("ok"));
                    }
                }

                setTimeout(function () {
                    if (cordova.require("cordova/platform").id.indexOf("windows") === 0) {
                        loadTranslations(function () {
                            showDeeplinkFailureMessage();
                        });
                    } else {
                        showDeeplinkFailureMessage();
                    }
                });
            }
        }

    };


    if (url && url.indexOf("x-source=com.sap.authenticator") != -1 && url.indexOf("://x-callback-url/setCredential?") != -1) {

        //wrap the method in setTimeout to avoid hang the caller
        setTimeout(function () {
            //process the authenticator url parameter
            var authenticatorCredential = url.substring(url.indexOf("?") + 1);
            var userName = "";
            var userValue = "";
            var passcodeName = "";
            var passcodeValue = "";
            var a = authenticatorCredential.split('&');
            for (var i = 0; i < a.length; i++) {
                var b = a[i].split('=');
                if (b[0] == "username_paramname") {
                    userName = decodeURIComponent(b[1]);
                } else if (b[0] == "username_paramvalue") {
                    userValue = decodeURIComponent(b[1]);
                } else if (b[0] == "passcode_paramname") {
                    passcodeName = decodeURIComponent(b[1]);
                } else if (b[0] == "passcode_paramvalue") {
                    passcodeValue = decodeURIComponent(b[1]);
                }
            }
            var credential = userName + "=" + userValue + "&" + passcodeName + "=" + passcodeValue;
            if (userValue || userName) {
                skipGotoFioriUrl = true;
                //when open url is called by logon controller, the app may still be locked, so call
                //unlock and then go to the idpLogonUrl with the credentials.
                sap.Logon.unlock(function () {
                    console.log("handleopenurl unlock called");
                    sap.FioriClient.getIdpLogonURL(function (retrievedIdpURL) {
                        if ((retrievedIdpURL != null) && (retrievedIdpURL != "")) {
                            var credential = userName + "=" + userValue + "&" + passcodeName + "=" + passcodeValue;

                            console.log("handleopenurl set webview url " + encodeURI(retrievedIdpURL + "&***credential***"));
                            window.location.replace(retrievedIdpURL + "&" + credential);
                        }
                    });
                }, function () {
                    skipGotoFioriUrl = false;
                    sap.Logger.error("fail to unlock the application", "FIORI_CLIENT");
                });
            }
            else {
                var credential = passcodeName + "=" + passcodeValue;
                console.log("handleopenurl set webview url for otp" + encodeURI(window.location + "&***credential***"));
                sap.AuthProxy.OTP.credentialCallback(credential);
            }
        });
        return true;
    }
    if (url && url.toLowerCase().indexOf("://x-callback-url/openfioriurl") != -1 && url.toLowerCase().indexOf("url=") != -1) { // for handling deeplink
        var deepLinkUrl = url.substring(url.toLowerCase().indexOf("url=") + 4);

        //decodeURIComponent() needs to be called twice because double encoded url parameter cannot be decoded completely
        //and elementDeepLinkURL can be wrongly built with index.html at cold start.
        decodedDeepLinkURL = decodeURIComponent(decodeURIComponent(deepLinkUrl));
        var elementDeepLinkURL = document.createElement("a");
        elementDeepLinkURL.href = decodedDeepLinkURL;

        sap.AppPreferences.getPreferenceValue('fioriURL', function (retrievedFioriURL) {
            loadDeeplinkURL(retrievedFioriURL, elementDeepLinkURL);
        },
            function (error) {
                sap.Logger.info(error, 'FIORI_CLIENT');
                // The Fiori URL wasn't found, so use the hardcoded value.
                loadDeeplinkURL(context.appConfig.fioriURL, elementDeepLinkURL);
            }
        );

        return true;

    } else {
        window.fioriPendingOpenURL = null;
    }
};

// Reloads the entire application on windows
var resetWindowsApp = function () {
    if (isWindows()) {
        fireEvent("resetSettings"); // needs to reset the webview cookies and reload the app
        sap.Logger.debug('Reload application', 'ResetSettings');
    }
};

var logonErrorCallback = function (error) {
    var restartApp = function () {
        if (isWindows()) {
            resetWindowsApp();
        } else {
            //if user cancels the regnewuser operation, then remove the regnewuser parameter from url so as to start fresh (Bug 1780176961)
            if (window.location.href.indexOf("file:") == 0 && window.location.href.indexOf("regnewuser=true") >= 0) {
                window.location.replace(window.location.href.substring(0, window.location.href.indexOf("regnewuser=true") - 1));
            }
            else {
                // Allow time for the InAppBrowser to close before calling onDeviceReady (which will launch it again).
                setTimeout(function () { onDeviceReady(); }, 200);
            }
        }
    };

    if (error && error.errorDomain === "MAFLogon" && (error.errorCode === "0" || error.errorCode === "1")) {
        // not an error. This is a result of user cancelling sso screen or cancelling registration.
        restartApp();
    }
    else {
        // error. display an error.
        var msg = error;
        try {
            msg = JSON.stringify(error);
        } catch (e) {
            // not json.
            msg = error;
        }

        //Fix bug 1570763120 Kapsel client properly handles the error when SAML idp url is not accessible.
        //The logon error callback method will restart the logon process without showing an alert error message box,
        //as sometime the alertbox already showed to user in inappbrowser. In that case, user can fix the related error
        //when inputting the init fiori url again.
        //However, if the configuration is provided by appconfig.js, then fioriclient.js will automatically reload the configuriaton and
        //call the error callback again, this will lead to an infinite loop due to the error.
        //In order to break the loop and give user a chance to check the error message, an error alert is shown if the
        //current log level is DEBUG.
        sap.AppPreferences.getPreferenceValue('LogLevel',
            function (logLevel) {
                if (logLevel == "DEBUG") {
                    alert(msg);
                }
                sap.Logger.error('Logon encountered an error. Details: ' + msg, 'FIORI_CLIENT');

                //Fixed medium ticket [1680163237], no error popup was shown when tried with mobilePlace on windows, restart is not necessary in this case
                if (isWindows() && error) {
                    var parsedMsg;
                    try {
                        parsedMsg = JSON.parse(error);
                    } catch (e) {
                        console.error('Failed to parse error message. Caused by: ' + e);
                    }
                    //trying to specify the errormessage as much as possible, to narrow it down to only this one case, so this change doesn't affect other parts
                    //source of "AppMetadata resource file is not reachable." is logonCore.cs ln:1036
                    if (parsedMsg && parsedMsg.errorDomain === "MAFLogonCoreErrorDomain" && parsedMsg.errorMessage === "AppMetadata resource file is not reachable." && parsedMsg.errorCode == "5") {
                        context.operation.logonView.showNotification("ERR_MOBILE_PLACE_CONFIG_NOT_RETRIEVED");
                    } else {
                        restartApp();
                    }
                } else {
                    //standard course of action
                    restartApp();
                }

            },
            function () {
                sap.Logger.error('Logon encountered an error. Details: ' + msg, 'FIORI_CLIENT');
                restartApp();
            }
        );
    }
};

var retrieveAppID = function (callback) {
    var getAppIDSuccess = function (retrievedAppID) {
        //only override the appconfig's appid if retrieved appid from native side is not empty
        if (retrievedAppID != null) {
            context.appConfig.appID = retrievedAppID;
        }
        callback();
    };
    var getAppIDFromAppPreferencesFailed = function (error) {
        sap.Logger.info(error, 'FIORI_CLIENT');
        // The App ID wasn't found, so the value won't be changed.
        callback();
    };
    sap.AppPreferences.getPreferenceValue('appID', getAppIDSuccess, getAppIDFromAppPreferencesFailed);
};

var retrieveFioriURLIsSMP = function (callback) {
    var getFioriURLIsSMPSuccess = function (retrievedFioriURLIsSMP) {
        if (retrievedFioriURLIsSMP != null) {
            context.appConfig.fioriURLIsSMP = retrievedFioriURLIsSMP;
        }
        callback();
    };
    var getFioriURLIsSMPFromAppPreferencesFailed = function (error) {
        sap.Logger.info(error, 'FIORI_CLIENT');
        // The fioriURLIsSMP flag wasn't found, so the value won't be changed.
        callback();
    };
    sap.AppPreferences.getPreferenceValue('fioriURLIsSMP', getFioriURLIsSMPSuccess, getFioriURLIsSMPFromAppPreferencesFailed);
};

var isUrl = function (url) {
    if (typeof (url) !== 'string') {
        return false;
    }
    var regexp = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i;
    return regexp.test(url);
};

//the email validation regex is from http://www.w3resource.com/javascript/form/email-validation.php
var isEmail = function (emailAddress) {
    if (typeof (emailAddress) !== 'string') {
        return false;
    }
    var regexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
    return regexp.test(emailAddress);
};


var addBusterToURL = function (requestedURL) {
    if (context.appConfig.skiphomebuster) {
        return requestedURL;
    }
    else {
        // Add extra query string to force page reload.
        var buster = "smphomebuster=" + Math.random() * 10000000000000000;


        if (requestedURL.indexOf("?") != -1) {
            // Add query right after ?
            // Do not assume there is only one ? in the URL,
            // they are legal characters in the query or fragment.
            var splitOnQuestionMark = requestedURL.split("?");
            var preFirstQuestionMark = splitOnQuestionMark.shift();
            var postFirstQuestionMark = splitOnQuestionMark.join("?");
            requestedURL = preFirstQuestionMark + "?" + buster + "&" + postFirstQuestionMark;
        } else {
            if (requestedURL.indexOf("#") != -1) {
                // Need to add query before anchor
                requestedURL = requestedURL.split("#")[0] + "?" + buster + "#" + requestedURL.split("#")[1];
            } else {
                // No anchor or query so create one.
                requestedURL = requestedURL + '?' + buster;
            }
        }

        return requestedURL;
    }
};

var goToFioriURL = function (errorCallback) {
    //use the browser view (SFSafariViewController on iOS, custom tabs on Android) if webviewType is "sf"
    if (context.appConfig.webviewType == "sf") {
        sap.FioriClient.getFioriURL(function (retrievedFioriURL) {

            if (!isUrl(retrievedFioriURL)) {
                errorCallback();
                return;
            }
            retrievedFioriURL = addBusterToURL(retrievedFioriURL);
            sap.FioriClient.openBrowserView(function () { }, errorCallback, retrievedFioriURL);
        });
    }
    else {
        //For no-SMP registration,
        sap.Settings.initWhiteList(function () {
            var startTime = sap.logon.Utils.logPerformanceMessage("fioriClient.js goToFioriURL");

            var gotoFioriURLInternal = function (errorCallback) {
                if (context.appConfig.prefetch && !context.appConfig.prepackaged) {
                    // This means the app is getting its initial update from the server!
                    return;
                }
                if (context.appConfig.prefetch && !(window.location + "").indexOf("index-remote.html") > 0) {
                    return;
                }

                if (context.appConfig.prepackaged) {
                    var config = fiori_client_appConfig;
                    startApp(context.smpRegContext.registrationContext, config);
                } else {
                    if (skipGotoFioriUrl) {
                        return;
                    } else if (window.fioriPendingOpenURL) {
                        //check whether the pending url is from authenticator
                        var url = window.fioriPendingOpenURL;
                        if (handleOpenURL(errorCallback, url)) {
                            //if handleOpenURL knows how to handle the url, then just return, otherwise, let goto fiori url to continue
                            return;
                        }
                    }

                    sap.FioriClient.getFioriURL(function (retrievedFioriURL) {
                        if (!context.smpRegContext) {
                            // If sap.FioriClient.context.smpRegContext is null, don't allow the user
                            // to skip the logon plugin by changing the URL.
                            // sap.FioriClient.context.smpRegContext will be set once logon is successful.
                            // Once logon completes and the app navigates to the URL, sap.FioriClient.context.smpRegContext will
                            // be undefined, so it will pass this test.
                            return;
                        }

                        if (!isUrl(retrievedFioriURL)) {
                            errorCallback();
                            return;
                        }

                        setFioriURL(retrievedFioriURL);

                        retrievedFioriURL = addBusterToURL(retrievedFioriURL);

                        if (typeof launchpad !== "undefined" && typeof launchpad.launchpadTimer !== "undefined" && typeof launchpad.launchpadTimer.startLoadTimer === "function") {
                            var timeout = 120000;
                            launchpad.launchpadTimer.startLoadTimer(timeout);
                        } else {
                            console.log("[FioriClient][fioriclient.js] Launchpad module is not initialized");
                        }

                        if (cordova.require("cordova/platform").id.indexOf("windows") === 0) {
                            if (context.appConfig.multiUser) {
                                SAP.Logon.LogonCore.getContext(function (result) {

                                    var newContext = JSON.parse(result).context;
                                    context.smpRegContext.registrationContext = newContext.registrationContext;
                                    var url = retrievedFioriURL;
                                    var operation = "HEAD";

                                    // Add the headers from the request.
                                    var headers = {
                                        "Accept": "application/json",
                                        "Content-Type": "application/json",
                                        "X-SMP-APPCID": newContext.applicationConnectionId
                                    };

                                    // Send a head request to set the current authentication header
                                    sap.AuthProxy.sendRequest(operation, url, headers, null,
                                        function (response) {
                                            var data = {};
                                            data.url = retrievedFioriURL;
                                            data.smpRegContext = newContext;
                                            if (context.appConfig.usebrowserinstead && context.appConfig.usebrowserinstead == true) {
                                                data.usebrowserinstead = true;
                                            }
                                            if (context.appConfig.skipheadrequest && context.appConfig.skipheadrequest == true) {
                                                data.skipheadrequest = true;
                                            }
                                            fireEvent("fioriurl_initial_set", data);
                                        },
                                        function (error) {
                                            sap.Logger.error(error, 'FIORI_CLIENT');
                                        },
                                        newContext.registrationContext.mobileUser,
                                        newContext.registrationContext.password,
                                        0,
                                        null);

                                }, function (err) {
                                    sap.Logger.error(err, 'FIORI_CLIENT');
                                });
                            } else {
                                // Ping server via AuthProxy to establish a valid session.
                                // If FC do not ping server, Fiori URL will be opened in webview, and
                                // webview will handle authentication. There is no chance to cache the
                                // basic credentail.
                                // Call AuthProxy.sendRequest2 to ping server. It will authenticate user
                                // and establish a valid session and cache basic credentail.
                                var requestHeader = null;
                                var requestBody = null;
                                var timeout = 60; // 60 seconds.
                                var authConfig = {
                                    basic: [
                                        {
                                            type: "user"
                                        },
                                        {
                                            type: "logon"
                                        }
                                    ],
                                    handleChallenges: true
                                };
                                var callback = {
                                    success: function (response) {
                                        if (response && response.userCancelled) {
                                            sap.Logger.warn("User cancelled basic authentication logon. Clearing application settings...", "FIORI_CLIENT");
                                            resetSettings();
                                            return;
                                        }

                                        var data = {};
                                        data.url = retrievedFioriURL;
                                        data.smpRegContext = context.smpRegContext;
                                        if (context.appConfig.usebrowserinstead && context.appConfig.usebrowserinstead == true) {
                                            data.usebrowserinstead = true;
                                        }
                                        if (context.appConfig.skipheadrequest && context.appConfig.skipheadrequest == true) {
                                            data.skipheadrequest = true;
                                        }
                                        fireEvent("fioriurl_initial_set", data);
                                    },
                                    error: function (errMsg) {
                                        sap.Logger.error(errMsg, "FIORI_CLIENT");
                                    }
                                };
                                sap.AuthProxy.sendRequest2("HEAD", retrievedFioriURL, requestHeader, requestBody, callback.success, callback.error, timeout, authConfig);
                            }
                        } else {
                            //ios WKWebView does not share the session cookies with NSURLSession's pingServer requests, so need to explicitly
                            //set the access token for oauth authentication
                            if (cordova.require("cordova/platform").id == "ios" && sap.AuthProxy.OAuth2.isProtectedEndpoint(retrievedFioriURL)) {
                                //logon core should already call pingServer to refresh the access token, so no need to refresh the token again at here
                                sap.AuthProxy.OAuth2.getToken(function (token) {
                                    if (token && token.access_token) {
                                        var header = {
                                            "Authorization": "Bearer " + token.access_token
                                        };
                                        sap.logon.Core.loadURLRequest(null, null, retrievedFioriURL, header);
                                    } else {
                                        //if access token is not available by any reason, then need to authenticate user
                                        sap.AuthProxy.OAuth2.authenticate(
                                            function (token) {
                                                var header = {
                                                    "Authorization": "Bearer " + token.access_token
                                                };
                                                sap.logon.Core.loadURLRequest(null, null, retrievedFioriURL, header);
                                            },
                                            function () {
                                                window.location.replace(retrievedFioriURL);
                                            });
                                    }
                                });
                            } else {
                                window.location.replace(retrievedFioriURL);
                            }
                        }
                    });
                }
            };

            // check whether need to show usage permission dialog before going to fiori URL
            // do not usage server request if ((skip saml flag is set) and (local index.html is currently loaded), and (not the first registration))
            if (sap.Settings && isUsageSupported() &&
                !((window.fiori_client_appConfig && (window.fiori_client_appConfig.refreshSAMLSessionOnResume == "skip" || window.fiori_client_appConfig.refreshOAUTHSessionOnResume == "skip")) &&
                    window.location.href.toLowerCase().indexOf("file:") == 0 && !sap.logon.Core.isFirstRegistration())) {
                sap.Settings.getConfigProperty(
                    function (enable) {
                        if (enable) {
                            sap.Usage.getUserConsent(function (value) {
                                if (value === null && (window.location.href.indexOf("file:") == 0 || window.location.href.indexOf("ms-appx-web:") == 0)) {
                                    // only show usage permission from index.html
                                    // use setTimeout to allow the IAB to fully close after showing the first-use tips.
                                    setTimeout(function () {
                                        console.log("show permisson dialog");
                                        sap.Usage.showConsentDialog(function () {
                                            gotoFioriURLInternal(errorCallback);
                                        });
                                    }, 100);
                                } else {
                                    gotoFioriURLInternal(errorCallback);
                                }
                            });
                        } else {
                            gotoFioriURLInternal(errorCallback);
                        }
                    },
                    function (error) {
                        sap.Logger.error("Failed to get setting. Status code" + error.statusCode + " text: " + error.statusText);
                        gotoFioriURLInternal(errorCallback);
                    },
                    "CollectClientUsageReports" //this property is not exposed by usage plugin, directly read from settings
                );
            } else {
                gotoFioriURLInternal(errorCallback);
            }
        });
    }
};

var setFioriURL = function (fioriURL) {
    if (sap.CacheManager && typeof sap.CacheManager === "object") {
        sap.CacheManager.setUrl(fioriURL);
    }

    // Make sure this value is synchronized with app preferences.
    sap.AppPreferences.setPreferenceValue('fioriURL', fioriURL, null, null);
    // Save an additional copy so that we can detect when the value is changed in the Settings menu.
    sap.AppPreferences.setPreferenceValue('previousFioriURL', fioriURL, null, null);
    if (typeof sap.Settings !== "undefined") {
        sap.Settings.initNoLoadPolicy();
    }

};

var getPreviousFioriURL = function (callback) {
    sap.AppPreferences.getPreferenceValue('previousFioriURL', callback, null);
};

var getFioriURL = function (callback) {
    function getFioriURLFromAppPreferencesFailed(error) {
        sap.Logger.info(error, 'FIORI_CLIENT');
        // The Fiori URL wasn't found, so use the hardcoded value.
        callback(context.appConfig.fioriURL);
    }

    function getFioriURLFromAppPreferencesSuccess(url) {
        if (url != null) {
            callback(url);
        } else {
            callback(context.appConfig.fioriURL);
        }
    }
    sap.AppPreferences.getPreferenceValue('fioriURL', getFioriURLFromAppPreferencesSuccess, getFioriURLFromAppPreferencesFailed);
};


var getIdpLogonURL = function (callback) {
    function getIdpLogonURLFromAppPreferencesFailed(error) {
        sap.Logger.info(error, 'FIORI_CLIENT');
        // The idp logon URL wasn't found, so use the hardcoded value.
        callback(context.appConfig.idpLogonURL);
    }

    function getIdpLogonURLFromAppPreferencesSuccess(url) {
        if (url != null) {
            callback(url);
        } else {
            callback(context.appConfig.idpLogonURL);
        }
    }
    sap.AppPreferences.getPreferenceValue('idpLogonURL', getIdpLogonURLFromAppPreferencesSuccess, getIdpLogonURLFromAppPreferencesFailed);
};


var clearBrowserCache = function (shouldDisplayPrompt) {
    sap.AppPreferences.setPreferenceValue('ClearBrowserCache', false);

    if (sap.CacheManager && typeof sap.CacheManager === "object") {
        sap.CacheManager.clearCache();
        if (shouldDisplayPrompt) {
            navigator.notification.alert("", null, bundle.get('cache_cleared'));
        }
    }
    else {
        //TODO: consider to add a native method in fioriclient plugin to clean the webview cache
        sap.Logger.info("Cache manager plugin is not available for clearBrowserCache", "FIORI_CLIENT");
    }
};

var clearLog = function () {
    sap.AppPreferences.setPreferenceValue('ClearLog', false);
    sap.Logger.clearLog();
};

var applySettings = function () {
    getFioriURL(function (fioriURL) {
        getPreviousFioriURL(function (previousFioriURL) {
            if (context.appConfig.webviewType == "sf" || fioriURL && previousFioriURL && fioriURL !== previousFioriURL) {
                clearBrowserCache(false);
                goToFioriURL(fioriURL);
                /** Fixing the issue 1472008622: Annoying "OK" button while resetting URL from settings
                    After discussing with Kanthi and Jonathan we decided to remvoe the navigation alert Temporarily commenting out

                navigator.notification.alert(loadingThePageText ?
                                             loadingThePageText : 'Loading the page.',
                                             null,
                                             fioriURLChangedText ?
                                             fioriURLChangedText : 'Fiori URL changed');
                */
            }
        });
    });
    sap.AppPreferences.getPreferenceValue('ClearBrowserCache', function (result) {
        if (result) {
            clearBrowserCache(true);
        }
    }, null);
    sap.AppPreferences.getPreferenceValue('ClearLog', function (result) {
        if (result) {
            clearLog();
        }
    }, null);
    sap.AppPreferences.getPreferenceValue('LogLevel', function (logLevel) {
        if (logLevel != null) {
            sap.Logger.setLogLevel(logLevel);
        }
    }, null);

};

var isConfigComplete = function (config) {
    var requiredConfigValues = ['appID', 'fioriURL', 'fioriURLIsSMP'];
    for (var i = 0; i < requiredConfigValues.length; i++) {
        var value = requiredConfigValues[i];
        if (config[value] === undefined || config[value] === '') {
            return false;
        }
    }
    return true;
}

//keep the registration, but delete all saved credential. This is for no-SMP logoff case.
var resetCredentials = function () {

    console.log("successCallback for deleteregistration");
    if (cordova.require("cordova/platform").id == "ios" || isAndroid()) {

        if (context.appConfig.useLocalStorage) {
            localStorage.clear();
            sessionStorage.clear();
        }

        if (sap.CacheManager && typeof sap.CacheManager === "object") {
            sap.CacheManager.clearCache();
        }

        var options = {};
        options.resetCredential = true;
        if (context && context.appConfig && (typeof context.appConfig.deleteClientCertificatesOption) != "undefined") {
            options.deleteClientCertificates = context.appConfig.deleteClientCertificatesOption;
        }
        sap.logon.Core.reset(null, null, null, options);
    } else {
        //TODO: update for windows client
        //sap.logon.Core.reset(resaveSomePreferences, resaveSomePreferences);
        //if ( sap.CacheManager && typeof sap.CacheManager === "object") {
        //    sap.CacheManager.clearCache();
        //}
        //// Reloads the entire application on windows
        //resetWindowsApp();
    }
}

var resetSettings = function (deleteClientCertificatesOptionFromNewConfig) {
    var previousFioriURLs;
    var switchToProduction;
    var previousLogLevel;
    var deleteClientCertificates;
    // Some preferences must be kept when all others are reset.
    // This function saves those settings back after the reset cleared everything.
    var resaveSomePreferences = function () {
        var preferencesToSave = {};
        preferencesToSave.previous_fiori_urls = previousFioriURLs;
        preferencesToSave.SwitchToProduction = switchToProduction;
        //save log level so that the debug log level can be applied during initial configuration
        preferencesToSave.LogLevel = previousLogLevel;

        sap.AppPreferences.setPreferenceValues(preferencesToSave);
    };
    var deleteRegistration = function () {
        var onDeleteRegistration = function () {
            console.log("successCallback for deleteregistration");
            if (cordova.require("cordova/platform").id == "ios" || isAndroid()) {

                if (context.appConfig.useLocalStorage) {
                    localStorage.clear();
                    sessionStorage.clear();
                }

                if (sap.CacheManager && typeof sap.CacheManager === "object") {
                    sap.CacheManager.clearCache();
                }
                var preferencesToSave = {};
                preferencesToSave.previous_fiori_urls = previousFioriURLs;
                preferencesToSave.SwitchToProduction = switchToProduction;
                //save log level so that the debug log level can be applied during initial configuration
                preferencesToSave.LogLevel = previousLogLevel;

                var options = null;
                if (deleteClientCertificatesOptionFromNewConfig === true || deleteClientCertificatesOptionFromNewConfig === false) {
                    options = {};
                    options.deleteClientCertificates = deleteClientCertificatesOptionFromNewConfig;
                }
                else if (typeof deleteClientCertificates != "undefined") {
                    options = {};
                    options.deleteClientCertificates = deleteClientCertificates;
                }
                sap.logon.Core.reset(null, null, preferencesToSave, options);
            } else {
                sap.logon.Core.reset(resaveSomePreferences, resaveSomePreferences);
                if (sap.CacheManager && typeof sap.CacheManager === "object") {
                    sap.CacheManager.clearCache();
                }
                // Reloads the entire application on windows
                resetWindowsApp();
            }
        };

        if (context.appConfig.multiUser) {
            sap.logon.Core.removeAllDeviceUsers(onDeleteRegistration, onDeleteRegistration);
        }
        else {
            sap.logon.Core.deleteRegistration(onDeleteRegistration, onDeleteRegistration);
        }
    };

    var prepareToDeleteRegistration = function () {
        deleteRegistration();
    };

    var prepareToPrepareToDeleteRegistration = function () {
        // The only thing we don't want to get rid of are the previous urls.
        // So, get them before resetting, then save them back afterward.
        sap.AppPreferences.getPreferenceValues(["previous_fiori_urls", "SwitchToProduction", "LogLevel", "deleteClientCertificates"], function (preferences) {
            if (preferences.previous_fiori_urls) {
                // use ^ to delimit the urls, since ^ is not allowed in a url.
                previousFioriURLs = preferences.previous_fiori_urls;
                // Add the current url if it isn't already included in the previous urls.
                if (previousFioriURLs.indexOf(context.appConfig.urlWithFakeParameters) < 0) {
                    previousFioriURLs = context.appConfig.urlWithFakeParameters + "^" + previousFioriURLs;
                } else {
                    // The current fiori url is already in the list of previous urls, so move it to the front.
                    previousUrlsArray = previousFioriURLs.split("^");
                    var index = previousUrlsArray.indexOf(context.appConfig.urlWithFakeParameters);
                    previousUrlsArray.unshift(previousUrlsArray.splice(index, 1));
                }
            } else {
                previousFioriURLs = context.appConfig.urlWithFakeParameters;
            }
            previousLogLevel = preferences.LogLevel;
            switchToProduction = preferences.SwitchToProduction;
            deleteClientCertificates = preferences.deleteClientCertificates;
            prepareToDeleteRegistration();
        }, function (result) {
            sap.Logger.error("Error callback while attempting to read previous fiori urls.  Continuing to reset the application. Caused by: " + result);
            prepareToDeleteRegistration();
        });
    }

    prepareToPrepareToDeleteRegistration();
}

//if source is 'apppreference', then the fioriConfiguration is coming from appPreference plugin, and
//the value is already parsed as name&value pair settings
//if source is 'user', then the savedFioriUrl is coming from messagebox's user input, the input may
//be a simple url or a json string containing mobile place, SMP or other settings we may add later.
//The settings also need to be saved in apppreference once it is validated
var parseAppConfig = function (callback, fioriConfiguration, context) {
    var configType = context.operation.currentConfigType;
    if (!configType) {
        configType = context.operation.configSources[context.operation.currentConfigIndex];
    }

    var requiredConfigValues = ['appID', 'fioriURL', 'fioriURLIsSMP'];

    //set the context appConfig property with the input configuration object
    if (fioriConfiguration) {
        for (var name in fioriConfiguration) {
            if (fioriConfiguration.hasOwnProperty(name)) {
                context.appConfig[name] = fioriConfiguration[name];
            }
        }
    }

    // If demo mode is enabled, and the current page is local index.html, which has the definition of fiori_client_appConfig,
    // then skip config types except user so that the chooseDemoMode screen shows again.
    if (fioriConfiguration.demoMode && configType != "user" && (typeof fiori_client_appConfig) != "undefined") {
        context.operation.currentConfigState = "done";
        setTimeout(function () {
            callback(context);
        }, 0);
        return;
    }

    if (configType == "saved" && fioriConfiguration.prefetch == true) {
        context.appConfig.prepackaged = true;
    }

    //if configuration is not complete, then set state to done and let logonController move
    //to next config source type
    for (var i = 0; i < requiredConfigValues.length; i++) {
        var value = requiredConfigValues[i];
        if ((fioriConfiguration[value] === undefined || fioriConfiguration[value] === '') &&
            (context.appConfig[value] === undefined || context.appConfig[value] === '')) {
            context.operation.currentConfigState = "done";
            setTimeout(function () {
                callback(context);
            }, 0);
            return;
        }
    }

    //if configure source is not saved, then save the configuraiton to later use
    if (configType != "saved") {
        //once registatation succeeded, this flag will tell onsuccess callback delegate to save the appPreference
        context.operation.mustWriteToAppPreferences = true;
    } else {
        if (typeof fiori_client_appConfig !== "undefined" && isConfigComplete(fiori_client_appConfig)) {

            var compareUrls = function (url1, url2) {

                var u1 = document.createElement('a');
                var u2 = document.createElement('a');
                u1.href = url1;
                u2.href = url2;

                var proto1 = u1.protocol;
                var hostname1 = u1.hostname;
                // for default port it is empty
                var port1 = u1.port;
                var pathname1 = u1.pathname;
                var search1 = u1.search;
                var hash1 = u1.hash;


                var proto2 = u2.protocol;
                var hostname2 = u2.hostname;
                // for default port it is empty
                var port2 = u2.port;
                var pathname2 = u2.pathname;
                var search2 = u2.search;
                var hash2 = u2.hash;

                return (proto1 === proto2 && hostname1 === hostname2 && port1 === port2 &&
                    pathname1 === pathname2 && search1 === search2 && hash1 === hash2)
            }

            // This means the configuration is saved, but there is also a configuration in appconfig.js.
            // So, check for a change in appconfig.js. The fiori url
            // the persisted fiori url may have an additional / at the end, which may be different from the original
            // fioriurl set in appconfig.js or MDM. So when comparing the fiori url at below, the ending / or \
            // is trimmed first
            if (!compareUrls(fiori_client_appConfig.fioriURL.replace(/[\\\/]$/, ''), context.appConfig.fioriURL.replace(/[\\\/]$/, '')) ||
                fiori_client_appConfig.fioriURLIsSMP !== context.appConfig.fioriURLIsSMP ||
                fiori_client_appConfig.appID !== context.appConfig.appID) {
                //bug 1770368332, Certificate will be reset by different URL. In order to apply the new deleteClientCertificatesOption setting during
                //config update, the new value should be used if available
                resetSettings(fiori_client_appConfig.deleteClientCertificatesOption);
            }
            if (fiori_client_appConfig.hasOwnProperty("handleX509")) {
                if (context.appConfig.handleX509 != fiori_client_appConfig.handleX509) {
                    context.appConfig.handleX509 = fiori_client_appConfig.handleX509;
                    context.operation.mustWriteToAppPreferences = true;
                }
            }
        }
    }

    if (context.appConfig.hasOwnProperty("LogLevel")) {
        sap.Logger.setLogLevel(context.appConfig.LogLevel, null, null);
    }

    if (context.appConfig.hasOwnProperty("handleX509")) {
        sap.AuthProxy.setHandleWebviewX509Challenges(function () { }, function () { }, context.appConfig.handleX509);
    }

    if (context.appConfig.fioriURL && !isUrl(context.appConfig.fioriURL)) {
        errorText = context.appConfig.fioriURL + ' is not a valid URL.';
        throw new Error(errorText);
    }

    var autoSelectCert = false;
    if (context.appConfig.autoSelectSingleCert === true) {
        autoSelectCert = true;
    }

    var keychainGroup = "all";
    if (context.appConfig.authproxyKeychainGroup === "self" || context.appConfig.authproxyKeychainGroup === "none") {
        keychainGroup = context.appConfig.authproxyKeychainGroup;
    }

    //for ios, if useExternalBrowser is true, then only run on ios 11 and above, and also need to set redirect url with
    //custom url scheme. Otherwise return an error
    if (device.platform.toLowerCase() == "ios" && context.appConfig.auth && context.appConfig.auth[0] && context.appConfig.auth[0].type == "oauth2") {
        var oauthConfig = context.appConfig.auth[0].config;
        if (oauthConfig["oauth2.useExternalBrowser"]) {
            if (parseInt(device.version) < 11) {
                var errorText = bundle.get('need_upgrade_ios_for_oauth');
                throw new Error(errorText);
            }

            var redirectURL = oauthConfig["oauth2.redirectURL"];
            if (redirectURL && redirectURL.length > 0) {
                var usehttpScheme = redirectURL.toLowerCase().indexOf("https://") == 0 || redirectURL.toLowerCase().indexOf("http://") == 0;
                if (usehttpScheme) {
                    var errorText = bundle.get('invalid_redirect_url_scheme');
                    throw new Error(errorText);
                }
            }
            else {
                var errorText = bundle.get('invalid_redirect_url_scheme');
                throw new Error(errorText);
            }
        }
    }

    sap.AuthProxy.setAutoSelectCertificateConfig(
        function () {
            onConfigurationValidated(context, callback);
        },
        function () {
            errorText = context.appConfig.fioriURL + ' is not a valid URL.';
            throw new Error(errorText);
        },
        autoSelectCert, keychainGroup);

};

var onConfigurationValidated = function (context, callback) {
    var splitArray = context.appConfig.fioriURL.split('://');
    context.smpConfig.https = splitArray.shift().toLowerCase() === 'https';
    context.smpConfig.serverHost = splitArray.join('://');

    //set auth element
    if (context.appConfig.auth) {
        context.smpConfig.auth = context.appConfig.auth;
    }
    if (context.appConfig.farmId) {
        context.smpConfig.farmId = context.appConfig.farmId;
    }
    if (context.appConfig.resourcePath) {
        context.smpConfig.resourcePath = context.appConfig.resourcePath;
    }
    if (context.appConfig.refreshSAMLSessionOnResume) {
        context.smpConfig.refreshSAMLSessionOnResume = context.appConfig.refreshSAMLSessionOnResume;
    }
    if (context.appConfig.refreshOAUTHSessionOnResume) {
        context.smpConfig.refreshOAUTHSessionOnResume = context.appConfig.refreshOAUTHSessionOnResume;
    }
    if (context.appConfig.useLocalStorage) {
        // useLocalStorage is only supported by ios and android clients
        // and only for Android 4.3 and higher.  Disable useLocalStorage otherwise.
        if (isAndroid()) {
            var version = device.version;
            var versionXdotX = Number(version.substring(0, 3));
            if (versionXdotX < 4.3) {
                context.appConfig.useLocalStorage = false;
            }
        } else if (isWindows()) {
            context.appConfig.useLocalStorage = false;
        }
    }
    if (context.appConfig.useLocalStorage) {
        context.smpConfig.useLocalStorage = context.appConfig.useLocalStorage;
    }

    //if application sets the communicatorId then uses it so it can be compatible with any future new communicatorid,
    //if the communicatorid is not set by application, then if fioriURLIsSMP is true, then set the communicate to "REST"
    //as currrently that is the only communicator id supported by SMP and HCPms.
    //By doing so logon core will not need to send the ping request to server's root url, which will cause authentication
    //issue if server's root url using a different auth method from the application's endpoint url, as application can
    //only handle authentication on its own endpoint url
    if (context.appConfig.communicatorId) {
        context.smpConfig.communicatorId = context.appConfig.communicatorId;
    }
    else if (context.appConfig.fioriURLIsSMP) {
        context.smpConfig.communicatorId = "REST";
    }

    //allow application to specify the version in the registration url. If the server version is not compatiable with the
    //default version used by the client, then app developer can explictly set the version in appconfig.js
    if (context.appConfig.registrationServiceVersion) {
        context.smpConfig.registrationServiceVersion = context.appConfig.registrationServiceVersion;
    }

    if (context.appConfig.appName) {
        context.smpConfig.appName = context.appConfig.appName;
    } else {
        context.smpConfig.appName = bundle.get("app_name");
    }

    if (context.appConfig.dataVaultType) {
        context.smpConfig.dataVaultType = context.appConfig.dataVaultType;
    }

    if (context.appConfig.multiUser && (!context.appConfig.fioriURLIsSMP || isAndroid())) {
        context.appConfig.multiUser = false;
    }

    if (context.appConfig.multiUser) {
        context.smpConfig.multiUser = true;
    }
    else if (context.appConfig.multiUser === false) {
        //if the field is not specified, then skip it and so as to inherit the exising value.
        //But if it is explicitly set to false by the current config source, then need to set it here.
        context.smpConfig.multiUser = false;
    }

    if (context.appConfig.backgroundTask) {
        context.smpConfig.backgroundTask = true;
    }

    context.smpConfig.custom = {
        "hiddenFields": ["serverHost", "resourcePath", "https", "serverPort", "farmId", "securityConfig"]
    };

    if (context.appConfig.backgroundImage) {
        context.smpConfig.custom.backgroundImage = context.appConfig.backgroundImage;
    } else {
        context.smpConfig.custom.backgroundImage = "img/background.jpg";
    }

    if (context.appConfig.styleSheet) {
        context.smpConfig.custom.styleSheet = context.appConfig.styleSheet;
    }

    if (context.appConfig.hideLogoCopyright) {
        context.smpConfig.custom.hideLogoCopyright = context.appConfig.hideLogoCopyright;
    }

    if (context.appConfig.copyrightLogo) {
        context.smpConfig.custom.copyrightLogo = context.appConfig.copyrightLogo;
    }

    if (context.appConfig.copyrightMsg) {
        context.smpConfig.custom.copyrightMsg = context.appConfig.copyrightMsg;
    }

    if (context.appConfig.disablePasscode) {
        context.smpConfig.custom.disablePasscode = context.appConfig.disablePasscode;
    }
    // When Fiori Client uses custom tabs, the app can't tell when it's in the background.  That
    // means a passcode can't be enforced.
    if (isAndroid() && context.appConfig.webviewType == "sf") {
        context.appConfig.disablePasscode = true;
        context.smpConfig.custom.disablePasscode = true;
    }

    if (context.appConfig.theme) {
        context.smpConfig.custom.theme = context.appConfig.theme;
    }

    if (context.appConfig.fioriURL) {
        var indexOfColon = context.smpConfig.serverHost.indexOf(':');
        if (indexOfColon !== -1 && (indexOfColon < context.smpConfig.serverHost.indexOf('/') || context.smpConfig.serverHost.indexOf('/') == -1)) {
            var splitURL = context.smpConfig.serverHost.split(':');
            context.smpConfig.serverHost = splitURL[0];
            context.smpConfig.serverPort = splitURL[1].split('/')[0];
            context.appConfig.endpointSuffix = '/' + splitURL[1].split('/').slice(1).join('/');
        } else {
            //port is not specified in the fiori url
            var restOfURL = context.smpConfig.serverHost;
            var indexOfFirstSlash = restOfURL.indexOf('/');
            context.smpConfig.serverPort = ""; //set port to empty string to indicate using the default port
            if (indexOfFirstSlash != -1) {
                context.smpConfig.serverHost = restOfURL.substring(0, indexOfFirstSlash);
                context.appConfig.endpointSuffix = restOfURL.substring(indexOfFirstSlash);
            } else {
                context.smpConfig.serverHost = restOfURL;
                context.appConfig.endpointSuffix = "";
            }
        }
        //set application settings to smp specific setting
        context.appConfig.isForSMP = context.appConfig.fioriURLIsSMP;

        if (context.appConfig.hcpmsroute) {
            context.smpConfig.resourcePath = context.appConfig.hcpmsroute;
        }

        //fix bug 1670290328 Win10 NoBridge require restarts for the 1st time
        //attach consolidated config to the global fiori_client_appConfig object, so that it can be
        //accessed by settings plugin before the config is persisted in onRegistationSuccess callback
        //fiori_client_appConfig is only defined and available when loading index.html to webview
        if (window.fiori_client_appConfig) {
            window.fiori_client_appConfig.finalConfig = context.appConfig;
        }
        //initialize secure proxy library if configured
        if (context.appConfig.proxyID && context.appConfig.proxyURL) {
            sap.logon.Core.startProxy(
                function () {
                    initClient(bundle, context, callback);
                },
                function (err) {
                    //if failed, show the error to user and then restart,
                    alert(err.errorMessage);
                    onDeviceReady();
                },
                context.appConfig.proxyID, context.appConfig.proxyURL, context.appConfig.proxyExceptionList);
        }
        else {
            initClient(bundle, context, callback);
        }

    }

    if (typeof context.appConfig.allowSavingFormCredentials !== "undefined") {
        context.smpConfig.allowSavingFormCredentials = context.appConfig.allowSavingFormCredentials;
    }
};

var loadTranslations = function (success) {
    // Load required translations
    var i18n = require('kapsel-plugin-i18n.i18n');
    i18n.load({
        path: "plugins/kapsel-plugin-fioriclient/www"
    },
        function (loadedBundle) {
            bundle = loadedBundle;
            success();
        });
};

var showSettings = function () {
    var stateWithUserInfo;
    var currentUser = {};
    function setupPreferences(prefData) {
        if (!prefData) {
            prefData = {};
        }

        // Webapppath is different on windows
        var webappPath;

        if (isWindows()) {
            webappPath = "ms-appx:///www/plugins/kapsel-plugin-fioriclient/www/validation.html";
        } else {
            webappPath = "file:///android_asset/www/plugins/kapsel-plugin-fioriclient/www/validation.html";
        }

        //settings are used for ios client for grouping
        var settingsGroupTitle = bundle.get("settings");
        var versionGroupTitle = bundle.get("version");
        var userGroupTitle = bundle.get("user")

        var sectionList;
        if (context.appConfig.multiUser) {
            sectionList = {
                "title1": settingsGroupTitle,
                "title2": userGroupTitle,
                "title3": versionGroupTitle,

            };
        }
        else {
            sectionList = {
                "title1": settingsGroupTitle,
                "title2": versionGroupTitle
            };
        }
        var preferencesJSON = {
            "webapppath": webappPath,
            "validationfunction": "validationFunction",
            "titles": sectionList,
            "preferences": []
        };

        //if fioriURLIsSMP is false, then delete APPID and FioriUrlIsSMP, and ResetSettings field, and also make FioriUrl field as editable so it has the same user experience as fiori 1.0
        var urlPreference = {};
        urlPreference[bundle.get("sap_fiori_url")] = [{
            "key": "fioriURL",
            "type": "edittext",
            "title": bundle.get("fiori_url"),
            "summary": bundle.get("sap_fiori_url"),
            "defaultvalue": "",
            "readonly": true,
            "regex": "^(http|https)://(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(/|/([\\w#!:.?+=&%@!\\-/]))?" //TODO: the regex attribute (and the native code in settings screen) should be deleted as the url in settings screen is readonly.
        }];
        preferencesJSON.preferences.push(urlPreference);

        if (context.appConfig.fioriURLIsSMP) {
            var isSmpPreference = {};
            isSmpPreference[bundle.get("proxy_through_smp")] = [{
                "key": "fioriURLIsSMP",
                "type": "checkbox",
                "title": bundle.get("proxy_through_smp"),
                "summary": bundle.get("connect_through_smp"),
                "defaultvalue": context.appConfig.fioriURLIsSMP,
                "readonly": true
            }];
            var appIdPreference = {};
            appIdPreference[bundle.get("app_id")] = [{
                "key": "appID",
                "type": "edittext",
                "title": bundle.get("app_id"),
                "summary": bundle.get("app_id"),
                "defaultvalue": "",
                "readonly": true
            }];
            preferencesJSON["preferences"].push(isSmpPreference, appIdPreference);

            // if SMP/HCPms registration is not basic auth (eg. X509 certificate), then user is an empty string and there shouldn't be a changePassword option
            if (context.smpRegContext.registrationContext.user != undefined && context.smpRegContext.registrationContext.user != "") {
                var changePasswordPreference = {};
                changePasswordPreference[bundle.get("change_password")] = [{
                    "key": "changePassword",
                    "type": "button",
                    "title": bundle.get("change_password"),
                    "summary": bundle.get("tap_to_change_password_button"),
                    "defaultvalue": "",
                    "callbackOnPress": true
                }];
                preferencesJSON["preferences"].push(changePasswordPreference);
            }
        }

        if (!context.appConfig.disablePasscode) {
            var passcodePreference = {};
            passcodePreference[bundle.get("manage_passcode")] = [{
                "key": "ManagePasscode",
                "type": "button",
                "title": bundle.get("manage_passcode"),
                "summary": bundle.get("tap_to_manage_passcode_button"),
                "defaultvalue": "",
                "callbackOnPress": true
            }];
            preferencesJSON.preferences.push(passcodePreference);
        }

        var loggingPreference = {};
        loggingPreference[bundle.get("logging")] = [{
            "key": "LogLevel",
            "type": "list",
            "title": bundle.get("log_level"),
            "summary": bundle.get("log_level"),
            "settings": settingsGroupTitle,
            "defaultvalue": sap.Logger.logLevel ? sap.Logger.logLevel : "ERROR",
            "listentries": [bundle.get("log_level_error"), bundle.get("log_level_warn"), bundle.get("log_level_info"), bundle.get("log_level_debug")],
            "listvalues": ["ERROR", "WARN", "INFO", "DEBUG"]
        }];

        if (isUsageSupported() && sap.Usage.isUsageEnabledOnServer()) {
            var userConsented = prefData['UsageConsent'];
            var userConsentPreference = {};
            userConsentPreference[bundle.get("usage_preference")] = [{
                "key": "ChangeUserConsentForDataCollection",
                "type": "button",
                "title": bundle.get("usage_user_consent_allow_settings_title"),
                "summary": userConsented ? bundle.get("yes") : bundle.get("no"),
                "defaultvalue": "",
                "callbackOnPress": true
            }];
            preferencesJSON.preferences.push(userConsentPreference);
        }

        if (!isIOS()) {
            loggingPreference[bundle.get("logging")].push(
                {
                    "key": "ClearLog",
                    "type": "button",
                    "title": bundle.get("clear_log"),
                    "summary": bundle.get("tap_to_clear_log"),
                    "defaultvalue": "",
                    "postClickToast": bundle.get("log_cleared_successfully"),
                    "confirmTitle": bundle.get("clear_log"),
                    "confirmMessage": bundle.get("clear_log_confirmation"),
                    "confirmButton1": bundle.get("yes"),
                    "confirmButton2": bundle.get("no"),
                });
            preferencesJSON.preferences.push(loggingPreference);
        }
        else if (context.appConfig.webviewType != "sf") {
            // iOS does not have groupings like Android does, and iOS app preferences only adds
            // the first entry in a group.  Copy the clear log preferences here.
            var clearLogPreference = {};
            clearLogPreference[bundle.get("logging")] = [{
                "key": "ClearLog",
                "type": "button",
                "title": bundle.get("clear_log"),
                "summary": bundle.get("tap_to_clear_log"),
                "defaultvalue": "",
                "postClickToast": bundle.get("log_cleared_successfully"),
                "confirmTitle": bundle.get("clear_log"),
                "confirmMessage": bundle.get("clear_log_confirmation"),
                "confirmButton1": bundle.get("yes"),
                "confirmButton2": bundle.get("no"),
            }];
            preferencesJSON.preferences.push(loggingPreference);
            preferencesJSON.preferences.push(clearLogPreference);
        }

        // "Share Screen" preference only available on Android platform
        if (isAndroid()) {
            var plugins = cordova.require("cordova/plugin_list").metadata;
            if (typeof plugins['cordova-plugin-privacyscreen'] !== "undefined") {
                // Only add the preference if the plugin is installed.
                var privacyScreenEnabled = prefData["PrivacyScreenEnabled"] !== 'undefined' && prefData["PrivacyScreenEnabled"];
                var shareScreenPreference = {};
                shareScreenPreference[bundle.get("privacy_screen_sharing_preference")] = [{
                    "key": "PrivacyScreenEnabled",
                    "type": "button",
                    "title": bundle.get("privacy_screen_sharing_preference"),
                    "summary": privacyScreenEnabled ? bundle.get("disabled") : bundle.get("enabled"),
                    "defaultvalue": "",
                    "confirmTitle": privacyScreenEnabled ? bundle.get("privacy_enable_screen_sharing") : bundle.get("privacy_disable_screen_sharing"),
                    "confirmMessage": bundle.get("privacy_app_must_restart_msg"),
                    "confirmButton1": bundle.get("yes"),
                    "confirmButton2": bundle.get("no"),
                }];
                preferencesJSON.preferences.push(shareScreenPreference);
            }
        }

        // "Clear browser cache" button is not available on windows platform.
        if (!isWindows() && context.appConfig.webviewType != "sf") {
            var cachePreference = {};
            cachePreference[bundle.get("cache")] = [{
                "key": "ClearBrowserCache",
                "type": "button",
                "title": bundle.get("clear_cache"),
                "summary": bundle.get("tap_to_clear_cache"),
                "defaultvalue": "",
                "confirmTitle": bundle.get("clear_cache"),
                "confirmMessage": bundle.get("clear_cache_confirmation"),
                "confirmButton1": bundle.get("yes"),
                "confirmButton2": bundle.get("no"),
            }];
            preferencesJSON.preferences.push(cachePreference);
        }

        if (context.appConfig.demoMode) {
            var switchToProductionPreference = {};
            switchToProductionPreference[bundle.get("demo_mode")] = [{
                "key": "SwitchToProduction",
                "type": "button",
                "title": bundle.get("switch_to_production_mode"),
                "summary": bundle.get("tap_to_switch_to_production_mode"),
                "defaultvalue": "",
                "postClickToast": bundle.get("app_reset")
            }];
            preferencesJSON.preferences.push(switchToProductionPreference);
        }

        var resetPreference = {};
        resetPreference[bundle.get("reset_settings")] = [{
            "key": "ResetSettings",
            "type": "button",
            "title": bundle.get("clear_all_app_settings"),
            "summary": bundle.get("tap_to_clear_settings"),
            "defaultvalue": "",
            "confirmTitle": bundle.get("reset_settings"),
            "confirmMessage": bundle.get("app_reset_confirmation"),
            "confirmButton1": bundle.get("yes"),
            "confirmButton2": bundle.get("no"),
            "postClickToast": bundle.get("app_reset")
        }];
        preferencesJSON.preferences.push(resetPreference);

        if (isIOS()) {
            var deleteClientCertificatesOption = {};
            var defaultValue = true;
            if (context.appConfig.deleteClientCertificatesOption === false) {
                defaultValue = false;
            }
            deleteClientCertificatesOption[bundle.get("delete_shared_credentials")] = [{
                "key": "deleteClientCertificates",
                "type": "checkbox",
                "title": "     " + bundle.get("delete_shared_credentials"),
                "summary": bundle.get("delete_shared_credentials"),
                "defaultvalue": defaultValue
            }];
            preferencesJSON.preferences.push(deleteClientCertificatesOption);
        }


        //multiuser related setting
        if (context.appConfig.multiUser) {
            preferencesJSON.user = [];
            if (stateWithUserInfo.multiUser.userList) {
                for (var i = 0; i < stateWithUserInfo.multiUser.userList.length; i++) {
                    if (stateWithUserInfo.multiUser.userList[i].deviceUserId == stateWithUserInfo.multiUser.currentUser) {
                        currentUser = stateWithUserInfo.multiUser.userList[i];
                        break;
                    }
                }
            }

            var userNamePreference = {};
            userNamePreference[bundle.get("username")] = [{
                "key": "User",
                "type": "edittext",
                "title": bundle.get("username"),
                "defaultvalue": currentUser.displayName,
                "readonly": true
            }];
            preferencesJSON.user.push(userNamePreference);

            var logoutPreference = {};
            logoutPreference[bundle.get("logout")] = [{
                "key": "Logout",
                "type": "button",
                "title": bundle.get("logout"),
                "summary": bundle.get("tap_to_logout"),
                "confirmTitle": bundle.get("logout"),
                "confirmMessage": bundle.get("logout_confirmation"),
                "confirmButton1": bundle.get("yes"),
                "confirmButton2": bundle.get("no")
            }];
            preferencesJSON.user.push(logoutPreference);

            var deleteUserPreference = {};
            deleteUserPreference[bundle.get("delete_user")] = [{
                "key": "DeleteUser",
                "type": "button",
                "title": bundle.get("delete_user"),
                "summary": bundle.get("tap_to_delete_user"),
                "confirmTitle": bundle.get("delete_user"),
                "confirmMessage": bundle.get("delete_user_confirmation"),
                "confirmButton1": bundle.get("yes"),
                "confirmButton2": bundle.get("no")
            }];
            preferencesJSON.user.push(deleteUserPreference);


            if (isWindows()) {
                preferencesJSON.preferences = preferencesJSON.preferences.concat(preferencesJSON.user);
            }
        }

        // Don't show the clear cert selection option if custom tabs is used, since we can't clear
        // Chrome's (or other) browser cert selections.
        if (isAndroid() && context.appConfig.webviewType != "sf") {
            var clearCertificateSelections = {};
            clearCertificateSelections[bundle.get("certificate_selections")] = [{
                "key": "ClearCertificateSelections",
                "type": "button",
                "title": bundle.get("clear_certificate_selections"),
                "summary": bundle.get("tap_to_clear_saved_certificate_selections"),
                "defaultvalue": "",
                "postClickToast": bundle.get("certificate_selections_cleared"),
                "callbackOnPress": true
            }];
            preferencesJSON.preferences.push(clearCertificateSelections);
        }

        // Settings of EULA & Privacy Statement on Android and iOS

        if (isAndroid() || isIOS()) {
            var readEula = {};
            readEula[bundle.get("settings_read_eula")] = [{
                "key": "readEula",
                "type": "button",
                "title": bundle.get("settings_read_eula"),
                "summary": bundle.get("settings_read_eula"),
                "defaultvalue": "",
                "callbackOnPress": true
            }];
            preferencesJSON.preferences.push(readEula);
            if (context.appConfig.enablePrivacyStatement !== false && (context.appConfig.skipPsRegionChecking || isChinaMainland())) {
                var readPs = {};
                readPs[bundle.get("settings_read_ps")] = [{
                    "key": "readPs",
                    "type": "button",
                    "title": bundle.get("settings_read_ps"),
                    "summary": bundle.get("settings_read_ps"),
                    "defaultvalue": "",
                    "callbackOnPress": true
                }];
                preferencesJSON.preferences.push(readPs);
            }
        }

        if (isIOS()) {
            sap.AppPreferences.showPreferencesScreen(successCallback, errorCallback, preferencesJSON);
        }
        else {
            sap.AppPreferences.configurePreferencesScreen(preferencesJSON,
                function () {
                    sap.AppPreferences.showPreferencesScreen(successCallback, errorCallback);
                },
                errorCallback);
        }
    }

    function successCallback(result) {
        if (result == "reset") {
            resetSettings();
        }
        else if (result == "changePassword") {
            sap.Logon.changePassword(
                function () {
                    sap.Logger.debug("Successfully changed password.");
                },
                function (err) {
                    if (!(err && err.errorKey == "ERR_USER_CANCELLED")) {
                        var detailedMsg = "";
                        if (err && err.errorMessage) {
                            detailedMsg = err.errorMessage;
                        }
                        sap.Logger.warn("Failed to change password. " + detailedMsg);

                        //Alert the user for the error. Note, we cannot use cordova navigator.notification.alert
                        //method to show the error alert, as on ios client, the alert is shown on top of the
                        //inappbrowser, but the inappbrowser is in middle of dismiss when the method is called.
                        //So once the inappbrowser is dismissed, the notification.alert will
                        //also be dismissed automatically before user sees it.
                        //in future, may consider to make the chagne to only call the callback method after the
                        //screen flow in inappbrowser is closed

                        //on Windows it works
                        if (isWindows()) {
                            navigator.notification.alert(bundle.get("change_password_failed"), function () { }, "", bundle.get("close"));
                        } else {
                            alert(bundle.get("change_password_failed"));
                        }
                    }
                }
            );
        }
        else if (result == "logout") {
            sap.logon.Core.deactivateCurrentUser(
                function () {
                    //Do not load starting page for ios, as the native code will load it automatically after
                    //deactivating the user, otherwise, a timing issue will happen on iOS 12.
                    //Not need to check for android client, as multiuser is not supported on android.
                    if (isWindows()) {
                        sap.Logon.unlock(
                            function () {
                                console.log("deactivateCurrentUser unlock called");
                                goToFioriURL();
                            },
                            errorCallback);
                    }
                },
                errorCallback,
                false
            );
        }
        else if (result == "deleteUser") {
            sap.logon.Core.removeDeviceUser(
                function () {
                    if (isWindows()) {
                        sap.Logon.unlock(
                            function () {
                                console.log("removeDeviceUser unlock called");
                                goToFioriURL();
                            },
                            errorCallback);
                    }
                    else {
                        if (stateWithUserInfo.multiUser.userList.length <= 1) {
                            // Deleted the last user. Now clear the EULA/PS agreement record.
                            removeAgreementForUser(null, stateWithUserInfo.multiUser.currentUser, true).then(function () {
                                return removeAgreement(null);
                            }).then(function () {
                                sap.logon.Core.loadStartPage(null, function () {
                                    console.error("Failed to load start page after deleteUser.");
                                });
                            });
                        } else {
                            removeAgreementForUser(null, stateWithUserInfo.multiUser.currentUser, false).then(function () {
                                sap.logon.Core.loadStartPage(null, function () {
                                    console.error("Failed to load start page after deleteUser.");
                                });
                            });
                        }
                    }
                },
                errorCallback, currentUser.deviceUserId);
        }
        else if (result == "ChangeUserConsentForDataCollection") {
            console.log("changeUserConsent Pressed!");
            sap.Usage.showConsentDialog(function () { });
        }
        else if (result == "ManagePasscode") {
            console.log("ManagePasscode Pressed!");
            sap.Logon.managePasscode(
                function () {
                    console.log("Passcode setting updated.");
                    if (context.appConfig.webviewType == "sf") {
                        goToFioriURL();
                    }
                },
                function () {
                    console.error("Failed to update passcode.");
                    if (context.appConfig.webviewType == "sf") {
                        goToFioriURL();
                    }
                });
        }
        else if (result == "PrivacyScreenEnabled") {
            console.log("Screen Sharing Toggled!");
            navigator.app.exitApp(); // can this restart the app somehow?
        }
        else if (result == "ClearCertificateSelections") {
            console.log("ClearCertificateSelections pressed");
            sap.AuthProxy.clearClientCertPreferences();
        }
        else if (result == "readEula") {
            var eulaHyperlink;
            if (isNull(context.appConfig.eulaHyperlink)) {
                eulaHyperlink = "EULA.html";
            } else {
                eulaHyperlink = context.appConfig.eulaHyperlink;
            }
            sap.Logger.debug("eulaHyperlink=" + eulaHyperlink, "FIORI_CLIENT");
            if (eulaHyperlink.indexOf("http://") === 0 || eulaHyperlink.indexOf("https://") === 0
                || eulaHyperlink.indexOf("file:///") === 0) {
                // absolute Url
                cordova.InAppBrowser.open(eulaHyperlink, "_blank", 'location=no');
            } else {
                // relative Url
                cordova.InAppBrowser.open(getWwwAppDirectory() + eulaHyperlink, "_blank", 'location=no');
            }
        }
        else if (result == "readPs") {
            var psHyperlink;
            if (isNull(context.appConfig.psHyperlink)) {
                psHyperlink = defaultPsFileName();
            } else {
                psHyperlink = context.appConfig.psHyperlink;
            }
            sap.Logger.debug("psHyperlink=" + psHyperlink, "FIORI_CLIENT");
            if (psHyperlink.indexOf("http://") === 0 || psHyperlink.indexOf("https://") === 0
                || psHyperlink.indexOf("file:///") === 0) {
                // absolute Url
                cordova.InAppBrowser.open(psHyperlink, "_blank", 'location=no');
            } else {
                // relative Url
                cordova.InAppBrowser.open(getWwwAppDirectory() + psHyperlink, "_blank", 'location=no');
            }
        }
        else {
            console.log("successCallback called " + JSON.stringify(result));
            if (device.platform[0] === 'i' || isWindows()) {
                setTimeout(applySettings, 0);
            }
        }
    }

    function errorCallback(error) {
        console.log("An error occurred:  " + JSON.stringify(error));
        if (cordova.require("cordova/platform").id.indexOf("windows") === 0 && error.errorCode === "1" && error.errorDomain === "MAFLogon") {
            setTimeout(function () {
                window.location.reload(true);
            }, 300);
        }
    }

    function checkPreferences(setupCallback) {
        // Serialized asynchronous calls to ensure co-ordination
        var checkPrivacyScreen = function (data, n, steps) {
            sap.AppPreferences.getPreferenceValue('org.devgeeks.privacyscreen/PrivacyScreenEnabled', function (value) {
                if (value == null) {
                    data.PrivacyScreenEnabled = true;
                }
                else {
                    data.PrivacyScreenEnabled = value;
                }
                steps[n + 1](data, n + 1, steps); // call next function
            }, function (err) {
                data.PrivacyScreenEnabled = true;
                steps[n + 1](data, n + 1, steps); // call next function
            });
        };

        var checkUserConsent = function (data, n, steps) {
            if (isUsageSupported && isUsageSupported() && sap.Usage.isUsageEnabledOnServer()) {
                sap.Usage.getUserConsent(function (value) {
                    data.UsageConsent = value;
                    steps[n + 1](data, n + 1, steps); // call next function
                }, function (err) {
                    data.UsageConsent = false;
                    steps[n + 1](data, n + 1, steps); // call next function
                });
            } else {
                steps[n + 1](data, n + 1, steps); // call next function
            }
        };

        var checkStart = function (data, steps) {
            steps[0](data, 0, steps); // call next function
        };

        var finalStep = function (data, n, steps) {
            setupCallback(data); // checks are finished, return data to callback
        };

        checkStart({}, [checkPrivacyScreen, checkUserConsent, finalStep]);
    }

    if (context.appConfig.multiUser) {
        sap.logon.Core.getState(function (state) {
            stateWithUserInfo = state;
            checkPreferences(setupPreferences);
        },
            errorCallback);
    }
    else {
        checkPreferences(setupPreferences);
    }

};

var print = function (bundle) {
    cordova.plugins.printer.isAvailable(function (available) {
        if (available) {
            if (cordova.require("cordova/platform").id != "ios" && cordova.require("cordova/platform").id != "android") {
                var page = location.href; // for current page
                var path = window.location.pathname;
                var currentPageName = path.substring(path.lastIndexOf('/') + 1);
                cordova.plugins.printer.print(page, currentPageName, function () { });
            } else {
                //test shows passing url or DOM outerHtml string does not print the content properly, so pass null to indicate
                //native code to use the current UIWebView
                cordova.plugins.printer.print(null, null, function () { });
            }
        } else {
            navigator.notification.alert(bundle.get("service_not_available"), function () { }, bundle.get("print_title"), bundle.get("ok"));
        }
    });

};

var showLog = function () {
    function fail(error) {
        console.log(error.code);
        alert(JSON.stringify(error));
    }

    // write file
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
        fileSystem.root.getFile("fclog.html", {
            create: true,
            exclusive: false
        }, function (fileEntry) {
            fileEntry.createWriter(function (writer) {
                sap.Logger.getFormattedLog(function (logEntries) {
                    var logPage = '<!DOCTYPE html PUBLIC "-//IETF//DTD HTML 2.0//EN"><HTML dir="auto"><HEAD><META CHARSET="UTF-8"></HEAD>';
                    logPage += '<STYLE>button {-webkit-appearance: none; -moz-appearance: none; appearance: none;font-size: 30px;padding: 20px 20px 20px 20px; min-height: 90px; min-width: 220px; font-weight:bold; font-style:normal} ';
                    logPage += 'table {width: 100%;table-layout: fixed;word-wrap: break-word;word-break: break-all;border-collapse: collapse;text-align: left;}th, td {text-align: left;} .odd th, .odd td {background: #ddd;}.even th, .even td {background: #fff;}</STYLE><BODY>';
                    // Fix issue 1970545447:1970545447, FC: Email Log button shows half after support iPhone 11 full size.
                    if (window.screen.height > 800) {
                        // On some device with big screen like iPhone X, 11 series device, the status bar hide half of email button.
                        // So, add margin top on the button to avoid this.
                        logPage += '<button style="margin-top:60px"  onclick="window.location.href=\'#sendEmail=true\';">' + bundle.get("email_log") + '</button><p><table>';
                    } else {
                        logPage += '<button onclick="window.location.href=\'#sendEmail=true\';">' + bundle.get("email_log") + '</button><p><table>';
                    }
                    logPage += logEntries;
                    logPage += '</table>';
                    logPage += '</BODY></HTML>';
                    writer.write(logPage);
                    setTimeout(function () {
                        module.exports.showLogFile();
                    }, 1);
                }, function () {
                    var logPage = '<!DOCTYPE html PUBLIC "-//IETF//DTD HTML 2.0//EN"><HTML><HEAD></HEAD><BODY>';
                    logPage += bundle.get("no_entries_in_log");
                    logPage += '</BODY></HTML>';
                    writer.write(logPage);
                    setTimeout(function () {
                        module.exports.showLogFile();
                    }, 1);
                });
            }, fail);
        }, fail);
    }, fail);


};

var showLogFile = function () {
    function fail(error) {
        console.log(error.code);
        alert(JSON.stringify(error));
    }

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
        fileSystem.root.getFile("fclog.html", {
            create: true,
            exclusive: false
        }, function (fileEntry) {
            var path = "file:" + fileEntry.fullPath;
            var sendEmail = false;

            function logViewerLoadStart(event) { // fired on iOS
                if (event.url.lastIndexOf('sendEmail=true') != -1) {
                    windowRef.close();
                    sendEmail = true;
                }
            }

            function logViewerLoadStop(event) { // fired on Android and ios
                console.log("logviewStop");
                if (cordova.require("cordova/platform").id != "ios") { //skip it for ios as this event is also fired on ios 8
                    if (event.url.lastIndexOf('sendEmail=true') != -1) {
                        setTimeout(function () {
                            windowRef.close();
                        }, 50);
                        sap.Logger.emailLog('', bundle.get("sap_fiori_client_log"), null, null,
                            function () { navigator.notification.alert(bundle.get("email_log_error_message"), function () { }, bundle.get("email_log_error_title"), bundle.get("ok")); });
                    }
                }
            }

            function logViewerExit(event) {
                console.log("logviewExit");
                if (sendEmail === true) {
                    if (cordova.require("cordova/platform").id != "ios") {
                        setTimeout(function () { // Exit called to quickly some times
                            sap.Logger.emailLog('', bundle.get("sap_fiori_client_log"), null, null,
                                function () { navigator.notification.alert(bundle.get("email_log_error_message"), function () { }, bundle.get("email_log_error_title"), bundle.get("ok")); });
                            sendEmail = false;
                        }, 500);
                    } else {
                        sap.Logger.emailLog('', bundle.get("sap_fiori_client_log"), null, null,
                            function () { navigator.notification.alert(bundle.get("email_log_error_message"), function () { }, bundle.get("email_log_error_title"), bundle.get("ok")); });
                        sendEmail = false;
                    }

                }
                windowRef.removeEventListener('loadstart', logViewerLoadStart);
                windowRef.removeEventListener('loadstop', logViewerLoadStop);
                windowRef.removeEventListener('exit', logViewerExit);
            }

            var windowRef = cordova.InAppBrowser.open(fileEntry.nativeURL, '_blank', 'location=no,EnableViewPortScale=yes,overridebackbutton=yes,closebuttoncaption=' + bundle.get("iab_done_button"));
            windowRef.addEventListener('loadstart', logViewerLoadStart);
            windowRef.addEventListener('loadstop', logViewerLoadStop);
            windowRef.addEventListener('exit', logViewerExit);
            windowRef.addEventListener('backbutton', function () {
                windowRef.close();
            });
        }, fail);
    }, fail);
};

var showConsents = function () {
    var preferencesJSON = {
        "webapppath": "file:///android_asset/www/plugins/kapsel-plugin-fioriclient/www/validation.html",
        "validationfunction": "validationFunction",
        "displayVersion": false,
        "preferences": []
    };
    var consentPreference = {};
    consentPreference[bundle.get("permissions")] = [];
    var consentsBeforeShowingScreen;
    var permissionScreenKeys = [];

    sap.Consent.listConsents(function (consentsObject) {
        consentsBeforeShowingScreen = consentsObject;
        var keys = Object.keys(consentsObject);
        if (keys.length == 0) { // configure the consent menu if there is no permission in the consent store
            var preferencesJSON2 = {
                "webapppath": "file:///android_asset/www/plugins/kapsel-plugin-fioriclient/www/validation.html",
                "validationfunction": "validationFunction",
                "displayVersion": false,
                "preferences": []
            }
            var noPermissionPreference = {};
            noPermissionPreference[bundle.get("permissions")] = [{
                "key": "NoPermissions",
                "type": "edittext",
                "title": bundle.get("manage_permission"),
                "defaultvalue": bundle.get("no_permissions_requested"),
                "summary": "",
                "readonly": true
            }];
            preferencesJSON2.preferences.push(noPermissionPreference);
            sap.AppPreferences.configurePreferencesScreen(preferencesJSON2, showScreen, errorCallback);
        } else {
            var consentsAppPreferencesFormat = {};
            for (var i = 0; i < keys.length; i++) {
                var appPreferencesKey = "permissionScreen" + keys[i];
                var val = ((consentsObject[keys[i]] == "allow") ? true : false);
                permissionScreenKeys.push(appPreferencesKey);
                consentPreference[bundle.get("permissions")].push(
                    {
                        "key": "permissionScreen" + keys[i],
                        "type": "checkbox",
                        "title": keys[i],
                        "summary": bundle.get("select_to_grant_permission"),
                        "defaultvalue": val,
                        "callbackOnPress": "true"
                    }
                );
                consentsAppPreferencesFormat[appPreferencesKey] = val;
            }
            // call setPreferenceValues to ensure the values that will be shown on the permissions
            // screen are initialized to the correct values.
            sap.AppPreferences.setPreferenceValues(consentsAppPreferencesFormat, function () {
                consentPreference[bundle.get("permissions")].sort(function (a, b) { // sort permissions alphabetically
                    var nameA = a[Object.keys(a)[0]].toUpperCase(); // ignore upper and lowercase
                    var nameB = b[Object.keys(b)[0]].toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    // names must be equal
                    return 0;
                });
                preferencesJSON.preferences.push(consentPreference);
                sap.AppPreferences.configurePreferencesScreen(preferencesJSON, showScreen, errorCallback);
            }, function (error) {
                console.log("Error setting preference values before showing permissions screen: " + error);
            });
        }
    });

    function errorCallback(error) {
        console.log("Error showing permissions screen");
    }

    function showScreenSuccessCallback(result) {
        // The results from the permissions screen are retrieved from AppPreferences via the keys
        // defined above in the consentPreference JSON objects.
        sap.AppPreferences.getPreferenceValues(permissionScreenKeys, function (permissionScreenValues) {
            var keys = Object.keys(consentsBeforeShowingScreen);
            for (var i = 0; i < permissionScreenKeys.length; i++) {
                var originalConsentKey = permissionScreenKeys[i].substring("permissionScreen".length);
                var originalConsentValue = consentsBeforeShowingScreen[originalConsentKey];
                if (permissionScreenValues[permissionScreenKeys[i]]) {
                    // The checkbox was checked when the screen was closed
                    if (originalConsentValue != "allow") {
                        sap.Consent.setConsentValue(originalConsentKey, "allow", function () { },
                            function (error) {
                                console.log("setting consent value from permission screen failed due to error: " + JSON.stringify(error));
                            });
                    }
                } else {
                    // The checkbox was not checked when the screen was closed.  Importantly, the
                    // logic here will not overwrite the original value if it was "unset".
                    if (originalConsentValue == "allow") {
                        sap.Consent.setConsentValue(originalConsentKey, "deny", function () { },
                            function (error) {
                                console.log("setting consent value from permission screen failed due to error: " + JSON.stringify(error));
                            });
                    }
                }
            }
        });
    }

    function showScreen() {
        sap.AppPreferences.showPreferencesScreen(showScreenSuccessCallback, errorCallback);
    }
};

function define_ushell_container_logout() {
    // Lazy define sap.ushell.Container.logout to use our reset
    // UI5 might not be loaded yet so we wait for each property
    // to be defined
    var logout = function () {
        if (context.appConfig.fioriURLIsSMP) {
            if (context.appConfig.multiUser) {  //Fix bug 43308 / 2017 / fiori client multiuser passcode. In multiuser mode, deactivate the current user
                sap.logon.Core.deactivateCurrentUser(
                    function () {
                        if (isWindows()) {
                            sap.Logon.unlock(
                                function () {
                                    goToFioriURL();
                                },
                                function () {
                                    console.error("Unlock error after deactivate user.");
                                });
                        }
                        //for ios client, no need to call gotoFioriUrl as logon plugin native code will reload starting page.
                    },
                    function () {
                        console.error("Fail to deactivate user.");
                    },
                    false
                );
            }
            else {
                resetSettings();
            }
        }
        else {
            resetCredentials();
        }
    };

    var define_ushell = function () {
        var ushell;

        Object.defineProperty(sap, 'ushell', {
            get: function () {
                return ushell;
            },
            set: function (ushellValue) {
                ushell = ushellValue;

                if (ushell) {
                    if (ushell.Container) {
                        ushell.Container.logout = logout;
                    } else {
                        define_ushell_container(ushell);
                    }
                }
            },
            configurable: true
        });
    };

    var define_ushell_container = function (ushell) {
        var container;

        Object.defineProperty(ushell, 'Container', {
            get: function () {
                return container;
            },
            set: function (containerValue) {
                container = containerValue;

                if (container) {
                    container.logout = logout;
                }
            },
            configurable: true
        });
    };

    if (!sap.ushell) {
        define_ushell();
    } else if (!sap.ushell.Container) {
        define_ushell_container(sap.ushell);
    } else {
        sap.ushell.Container.logout = logout;
    }
}

var initClient = function (i18nBundle, context, callback) {
    bundle = i18nBundle;
    cacheClearedText = bundle.get('cache_cleared');
    fioriURLChangedText = bundle.get('fiori_url_changed');
    loadingThePageText = bundle.get('loading_the_page');

    if (!context.appConfig.prepackaged) {
        if (!(context.appConfig.logoffHandler && context.appConfig.logoffHandler.toLowerCase() == "server")) {
            define_ushell_container_logout();
        }

        if (isToolbarSupported()) {

            sap.Toolbar.clear(function () {
                if (isWindows()) {

                    sap.Toolbar.addItem({
                        "label": bundle.get("settings"),
                        "id": "settings",
                        "icon": "settings",
                        "showAsAction": sap.Toolbar.SHOW_AS_ACTION_NEVER,
                        "section": "secondary",
                        "placement": "bottom"
                    }, function () {
                        if (typeof sap.AppPreferences !== "undefined" && sap.AppPreferences != null) {
                            showSettings();
                        }
                    });

                    sap.Toolbar.addItem({
                        "label": bundle.get("about"),
                        "id": "about",
                        "icon": "world",
                        "showAsAction": sap.Toolbar.SHOW_AS_ACTION_NEVER,
                        "section": "secondary",
                        "placement": "bottom"
                    }, function () {
                        window.navigator.notification.alert(bundle.get("version") + " " + bundle.get("version_value"), null, bundle.get("about_title"), bundle.get("ok"));
                    });

                    sap.Toolbar.addItem({
                        "label": i18nBundle.get("view_log", 'View Log'), "icon": "showresults", "section": "secondary", "placement": "bottom", "id": "cmdViewLog"
                    }, function () {
                        fireEvent("view_log_btn_clicked");
                    });


                    sap.Toolbar.addItem({
                        "label": i18nBundle.get("help", 'Help'), "icon": "help", "section": "secondary", "placement": "bottom", "id": "help"
                    }, function () {
                        fireEvent("help_btn_clicked");
                    });

                    // Add back button.
                    if (!WinJS.Utilities.isPhone) {
                        sap.Toolbar.addItem({
                            "label": i18nBundle.get("back", 'Back'), "icon": "back", "section": "primary", "placement": "bottom", "id": "back"
                        }, function () {
                            fireEvent("back_btn_clicked");
                        });
                    }

                    sap.Toolbar.addItem({
                        "label": i18nBundle.get("home", 'Home'), "icon": "home", "section": "primary", "placement": "bottom", "id": "home"
                    }, function () {
                        fireEvent("home_btn_clicked");
                    });

                    sap.Toolbar.addItem({
                        "label": i18nBundle.get("refresh", 'Refresh'), "icon": "refresh", "section": "primary", "placement": "bottom", "id": "refresh"
                    }, function () {
                        fireEvent("refresh_btn_clicked");
                    });

                    try {
                        Windows.Graphics.Printing.StandardPrintTaskOptions.colorMode;//check(phone 8.1 does not support Printing )
                        sap.Toolbar.addItem({
                            "label": i18nBundle.get("print", 'Print'), "icon": "print", "section": "primary", "placement": "bottom", "id": "print", "hidden": "true"
                        }, function () {
                            fireEvent("print_btn_clicked");
                        });
                    } catch (namespaceEx) {
                        console.error("Print not supported. Caused by: " + namespaceEx);
                    }//if namespace check fails, we do not put the print button, but it's DC exception in any other perspectives

                } else {
                    var isAndroid = (device.platform == 'Android');

                    sap.Toolbar.addItem({
                        "label": bundle.get("settings"),
                        "id": "settings",
                        "icon": "smp_settings",
                        "showAsAction": sap.Toolbar.SHOW_AS_ACTION_NEVER
                    }, function () {
                        showSettings();
                    });

                    if (isAndroid) {
                        sap.Toolbar.addItem({
                            "label": bundle.get("view_log"),
                            "id": "view_log",
                            "icon": "smp_home",
                            "showAsAction": sap.Toolbar.SHOW_AS_ACTION_NEVER
                        }, function () {
                            showLog();
                        });

                        // Only add the preference if consent plugin is installed.
                        var plugins = cordova.require("cordova/plugin_list").metadata;
                        if (typeof plugins['kapsel-plugin-consent'] !== "undefined" && device.version < "6") {
                            sap.Toolbar.addItem({
                                "label": bundle.get("permissions"),
                                "id": "permissions",
                                "icon": "smp_permissions",
                                "showAsAction": sap.Toolbar.SHOW_AS_ACTION_NEVER
                            }, function () {
                                showConsents();
                            });
                        }

                    } else {
                        sap.Toolbar.addItem({
                            "label": bundle.get("view_log"),
                            "id": "view_log",
                            "icon": "smp_log",
                            "showAsAction": sap.Toolbar.SHOW_AS_ACTION_ALWAYS
                        }, function () {
                            getFioriURL(function (fioriURL) {
                                showLog();
                            });
                        });
                    }

                    //add a button for print
                    sap.Toolbar.addItem({
                        "label": bundle.get("print"),
                        "id": "print",
                        "icon": "smp_print",
                        "showAsAction": sap.Toolbar.SHOW_AS_ACTION_NEVER
                    }, function () {
                        print(bundle);
                    });
                }

                //if the current page is for error html pages, then automatically show the toolbar
                if (window.location.href.indexOf("www/CannotReachHost.html") != -1 || window.location.href.indexOf("www/CertificateErrorPage.html") != -1) {
                    window.sap.Toolbar.show();
                }
            });
        }
    }

    // Set an event listener to respond to changes in AppPreferences.
    document.addEventListener('onSapResumeSuccess', function (event) {
        if (event && event.detail && event.detail.args && event.detail.args[0] && event.detail.args[0].policyContext) {
            // Get the passcode policy from the event, otherwise the policyContext will not
            // be defined if the app is coming to the foreground from the background
            // (without getting cleared from memory).
            context.smpRegContext.policyContext = event.detail.args[0].policyContext;
        }
        sap.logon.Core.getMDMConfiguration(function (config) {
            handleMDMConfig(config, context, context.smpRegContext.policyContext, function (hasMDM) {
                if (hasMDM && !context.appConfig.isMDMConfig) {
                    // Only change from 'non-MDM' -> 'has-MDM'; cannot override MDM after being used once
                    context.appConfig.isMDMConfig = true;
                    sap.AppPreferences.setPreferenceValue('isMDMConfig', true, function () { }, function () { });
                }
                // On iOS, the Fiori URL doesn't always get updated unless there is a small delay.
                if (!isWindows()) {
                    // windows does not need to apply settings on resume. It causes other problems.
                    setTimeout(applySettings, 1000);
                }
            });
        },
            function (error) {
                sap.Logger.error("Fail to get MDM configuration: " + JSON.stringify(error));
            });
    });

    if (sap.AppUpdate) {
        var prefetch = context.appConfig.prefetch ? context.appConfig.prefetch : false;
        var useAppUpdate = prefetch || context.appConfig.prepackaged;
        sap.AppUpdate.autoCheck(useAppUpdate);

        if (useAppUpdate) {
            sap.AppUpdate.update();
        }
    }

    context.operation.currentConfigState = "complete";
    callback(context);
};

var onDeviceReady = function () {
    logVersionBuildTime();
    if (!isWindows()) {
        initFioriClient();
    }
}

// for windows only; this makes sure that the event handlers in default.js are already initialized and can handle events coming from fioriclient
var onDefaultInitialized = function () {
    if (isWindows()) {
        initFioriClient();
    }
}

var initFioriClient = function () {
    sap.logon.Utils.logPerformanceMessage("fioriclient.js: ondeviceready");

    //to check network status
    document.addEventListener("offline", function () {
        sap.AppPreferences.setPreferenceValue('nonetwork', true, null, null);
    }, false);

    document.addEventListener("online", function () {
        sap.AppPreferences.setPreferenceValue('nonetwork', false, null, null);
    }, false);

    loadTranslations(function () {
        // checkAndOpenEulaPsDialog().then(function(oEvent) {
        //     if (oEvent.accept){
        if (sap.CacheManager && typeof sap.CacheManager === "object") {
            sap.CacheManager.setCheckForUpdatesEvents(['onSapResumeSuccess']);
            var defaultoncacheinvalidated = sap.CacheManager.oncacheinvalidated;
            sap.CacheManager.oncacheinvalidated = function () {
                defaultoncacheinvalidated();
                goToFioriURL();
            }
        }

        context = {
            operation: {
                logonView: sap.logon.LogonJsView
            },
        };

        context.operation.logonView.onShowScreen = function (screenId, screenEvents, currentContext) {
            var windowLocationString = window.location + "";
            currentContext.custom = {};

            if (context.appConfig.backgroundImage) {
                currentContext.custom.backgroundImage = context.appConfig.backgroundImage;
            } else {
                currentContext.custom.backgroundImage = "img/background.jpg";
            }

            if (context.appConfig.styleSheet) {
                currentContext.custom.styleSheet = context.appConfig.styleSheet;
            }

            if (context.appConfig.hideLogoCopyright) {
                currentContext.custom.hideLogoCopyright = context.appConfig.hideLogoCopyright;
            }

            if (context.appConfig.copyrightLogo) {
                currentContext.custom.copyrightLogo = context.appConfig.copyrightLogo;
            }

            if (context.appConfig.copyrightMsg) {
                currentContext.custom.copyrightMsg = context.appConfig.copyrightMsg;
            }

            if (context.appConfig.theme) {
                currentContext.custom.theme = context.appConfig.theme;
            }

            if (screenId == "SCR_SET_PASSCODE_OPT_ON" && (context.appConfig.demoMode || context.smpConfig.useLocalStorage)) {
                // If demo mode is enabled, we want to automatically disable the
                // passcode without showing the setPasscode screen.
                currentContext.passcodeEnabled = false;
                screenEvents.onsubmit(currentContext);
                return true;
            } else if (screenId == "chooseDemoMode") {
                // The user has just selected the Switch to Production Mode on the
                // settings screen, so skip the choose demo mode screen.
                var switchToProduction = false;
                if (typeof context.appConfig.SwitchToProduction === "boolean") {
                    switchToProduction = context.appConfig.SwitchToProduction;
                } else {
                    switchToProduction = context.appConfig.SwitchToProduction == "true";
                }
                if (switchToProduction) {
                    currentContext.demoMode = false;
                    screenEvents.onsubmit(currentContext);
                    // Clear the switch to production preference so this only
                    // happens once every time the user switches to production.
                    context.appConfig.SwitchToProduction = false;
                    sap.AppPreferences.setPreferenceValue('SwitchToProduction', false);
                    return true;
                }
                // Every time the plugins load in demo mode from index.html, the chooseDemoMode screen
                // would be shown.  But the chooseDemoMode screen should not be shown in fioriURL page or
                // error screen. The solution is to check whether the window.location is from a local
                // index.html file (only the first time the plugins are loaded is window.location from
                // local index.html file), and if not, then directlying submit the screen without showing the
                // chooseDemoMode screen.
                //
                var loadFromLocalIndexHtml = windowLocationString.toLowerCase().indexOf("file:") === 0 && windowLocationString.toLowerCase().indexOf("/www/index.html") !== -1;

                if (!loadFromLocalIndexHtml && (cordova.require("cordova/platform").id.indexOf("windows") !== 0)) {
                    currentContext.demoMode = true;
                    screenEvents.onsubmit(currentContext);
                    return true;
                }
            } else if (screenId == "enterFioriConfiguration") {
                currentContext.previous_fiori_urls = context.appConfig.previous_fiori_urls;
            }
            return false;
        };

        //Uncomment and modify the below block to bypass the logon regisration and passcode initialization screen
        //Please refer to Kapsel SDK Getting Started Guide for details - http://scn.sap.com/docs/DOC-49524
        /*context.operation.logonView.onShowScreen = function(screenId, screenEvents, currentContext) {
            if (screenId == "SCR_SSOPIN_SET") {
                screenEvents.onskip();
                return true;
            }
            else if (screenId =="SCR_UNLOCK") {
                var context = {
                    unlockPasscode: "Password1@"
                }
                screenEvents.onsubmit(context);
                return true;
            }
            else if (screenId == "SCR_REGISTRATION") {
                currentContext.registrationContext.user ="demo";
                currentContext.registrationContext.password = "mobile";

                screenEvents.onsubmit(currentContext.registrationContext);
                return true;
            }
            else if (screenId == "SCR_SET_PASSCODE_MANDATORY") {
                var context = {
                    passcode: "Password1@",
                    passcode_CONFIRM: "Password1@"
                }
                screenEvents.onsubmit(context);
                return true;
            }
            else if (screenId == "SCR_SET_PASSCODE_OPT_ON") {
                screenEvents.ondisable();
                return true;
            }
            else if (screenId == "SCR_SET_PASSCODE_OPT_OFF") {
                var context = {};
                screenEvents.onsubmit(context);
                return true;
            }
            return false;  //skip the default value
        };

        context.operation.onshowNotification = function(screenId, notifcationKey) {
            if (screenId == "SCR_SSOPIN_SET" || screenId == "SCR_UNLOCK" || screenId == "SCR_REGISTRATION" || screenId == "SCR_SET_PASSCODE_MANDATORY" || screenId == "SCR_SET_PASSCODE_OPT_ON" || screenId == "SCR_SET_PASSCODE_OPT_OFF" ) {
                alert(notifcationKey);
                return true;
            }
            return false;
        };
        */

        sap.Logon.loadConfiguration(sap.FioriClient, context);

        if (isWindows()) {
            var customEvent = document.createEvent('Event');
            customEvent.initEvent('fioriinitialized', true, true);
            document.dispatchEvent(customEvent);
        }
        // } else {
        //     // End user denied agreement. Ask user to quit app
        //     handleDenyAgreement();
        // }
        // }).catch(function (err) {
        //     sap.Logger.error(err, "FIORI_CLIENT");
        // });

    });

    var plugins = cordova.require("cordova/plugin_list").metadata;
    if (typeof plugins['kapsel-plugin-consent'] !== "undefined" && device.platform == 'Android' && device.version < "6") {
        sap.Consent.init();
    }
};


// Set up the toolbar plugin buttons.
/*
 205691 2020 SAML enabled Fiori Client build for IOS
 onDeviceReady may not triggered if not set time out.
 */

setTimeout(function () {
    document.addEventListener('deviceready', onDeviceReady);
},
    1000);
document.addEventListener('defaultinitialized', onDefaultInitialized); //for windows

var showFirstUseTips = function () {
    sap.AppPreferences.setPreferenceValue('skipShowFirstUseTips', true);
    sap.Logger.info('Showing first use tips dialog.', 'FIORI_CLIENT');
    var firstUseIAB = cordova.InAppBrowser.open('FirstUseTips.html', '_blank', 'location=no,EnableViewPortScale=yes,toolbar=no,allowfileaccessfromfile=yes');
    var done = false;

    function onTipsFinished() {
        if (!done) {
            done = true;
            sap.FioriClient.goToFioriURL();
        }
    }

    if (isIOS() || isAndroid()) {
        //fix bug 1570449557 Empty gray screen comes after successful passcode verification
        //if user puts application into background, the inappbrowser will be replaced by unlock screen, and the event
        //of firstUseIAB will be lost. Add a SapResumeSuccess event to let it load the fiori url
        document.addEventListener(
            "onSapResumeSuccess",
            onTipsFinished,
            false
        );
    }

    firstUseIAB.addEventListener('exit', onTipsFinished);

    if (isIOS()) {

        firstUseIAB.addEventListener('loadstart', function (event) {
            // Need loadstart for iOS
            if (event.url.match("closewindow")) {
                firstUseIAB.close();
            }
        });
    }

    if (isWindows() || isAndroid()) {
        firstUseIAB.addEventListener('loadstop', function (event) {
            // Need loadstop for Android and Windows.
            if (event.url.match("closewindow")) {
                firstUseIAB.close();
                if (isWindows()) {
                    sap.FioriClient.goToFioriURL();
                }
            }
        });
    }
};

var isASCII = function (str) {
    return /^[\x00-\x7F]*$/.test(str);
};

//atob implementation decodes non base64 encoded string as well,
//by returning non ASCII characters {see: atob('FileProvider') }
//to avoid this, we are checking if the decoded string is ASCII too.
var isBase64EncodedJSON = function (str) {
    try {
        var decodedStr = atob(str);
        return decodedStr && decodedStr.charAt(0) == '{' && isASCII(decodedStr);
    } catch (err) {
        return false;
    }
};

// Returns whether platform is windows or not
var isWindows = function () {
    return device.platform.toLowerCase().indexOf("windows") === 0;
};

var isAndroid = function () {
    return device.platform.toLowerCase().indexOf("android") === 0;
};

var isIOS = function () {
    return device.platform.toLowerCase().indexOf("ios") === 0;
};

var isToolbarSupported = function () {
    if (typeof sap === "undefined" || typeof sap.Toolbar === "undefined") {
        console.log("Toolbar is not supported");
        return false;
    }
    return true;
};
var isUsageSupported = function () {
    if (typeof sap === "undefined" || typeof sap.Usage === "undefined" || sap == null || sap.Usage == null) {
        console.log("Usage is not supported");
        return false;
    }
    return true;
};

var openBrowserView = function (successCallback, errorCallback, url) {
    if (isIOS()) {
        cordova.exec(successCallback, errorCallback, "FioriClient", "openSafariViewController", [url]);
    } else {
        cordova.exec(successCallback, errorCallback, "FioriClient", "openBrowserView", [url]);
    }
};

if (cordova.require("cordova/platform").id == "android") {
    var chromeVersion = "Unknown";
    var match = /Chrome\/([0-9.]+)/.exec(navigator.userAgent);
    if (match && match.length > 1) {
        chromeVersion = match[1];
    }

    console.log("Chrome version: " + chromeVersion);
}

/**
 * return true if value is null, undefined or "null".
 */
function isNull(value) {
    return value == null || value == "null";
}

/**
 * return a "null" literal
 */
function newNullLiteral() {
    return "null";
}

/**
 * End user denies the EULA and PS agreement. Exit FC on Android, or show warning message on iOS.
 */
function handleDenyAgreement() {
    if (isIOS()) {
        new sap.m.MessageStrip({
            text: bundle.get("eula_and_ps_deny_msg"),
            type: "Warning",
            showIcon: true
        }).addStyleClass("sapUiMediumMargin").placeAt("content");
    } else {
        navigator.app.exitApp();
    }
}

/**
 * pop-up EULA and PS dialog. Returns a Promise with oEvent parameter in callback:
 * {
 *     "accept": {boolean} // indicates if end user accepts the agreement
 * }
 *
 * @param {string} [title] dialog title
 * @param {string} [message] dialog message
 * @param {boolean} [bFullScreen] Determines if the dialog will be displayed in full screen.
 * Default value is false.
 */
function showEulaAndPs(title, message, bFullScreen) {
    return new Promise(function (resolve, reject) {
        bFullScreen = bFullScreen || false; // if it is undefined, set it to false
        var oDialog = new sap.m.Dialog({
            showHeader: false,
            type: "Message",
            stretch: bFullScreen,
            content: [
                new sap.m.Title({
                    wrapping: true,
                    text: title,
                    textAlign: "Center"
                }),
                new sap.ui.core.HTML({
                    content: "<p>" + message + "</p>"
                }),
            ],
            endButton: new sap.m.Button({
                type: sap.m.ButtonType.Emphasized,
                text: bundle.get("eula_and_ps_btn_accept"),
                press: function () {
                    oDialog.close();
                    return resolve({ accept: true });
                }
            }),
            beginButton: new sap.m.Button({
                text: bundle.get("eula_and_ps_btn_deny"),
                press: function () {
                    oDialog.close();
                    return resolve({ accept: false });
                }
            }),
            afterClose: function () {
                oDialog.destroy();
            }
        });

        oDialog.open();
    });
}

/**
 * Check the agreement record to see if user has accepted already.
 *
 * Return a Promise with following object as resolve argument:
 * {
 *     "agreementOfApp": {boolean},
 *     "agreementOfUser": {
 *         "anybody": {boolean},
 *         "thisUser": {boolean}
 *     }
 * }
 *
 * "agreementOfApp" - agreement of application level. This is true if user accepts the agreement in the initial popup dialog.
 * "agreementOfUser" - agreement of user level. Used by multi-users scenario.
 * "anybody" - This is true if at least one user has accepted agreement.
 * "thisUser" - This is true if the user of deviceUserId has accepted agreement.
 *
 * @param {string} eulaVersion - EULA version to check with
 * @param {string} psVersion - Privacy Statement version to check with
 * @param {string} deviceUserId - Use this argument to check agreement for a given user.
 *                                It is used in multiple users scenario
 */
function checkAgreement(eulaVersion, psVersion, deviceUserId) {
    return new Promise(function (resolve, reject) {
        var propAppEula = "app_acceptedEulaVersion";
        var propAppPs = "app_acceptedPsVersion";
        var propAnybodyEula = "anybody_acceptedEulaVersion";
        var propAnybodyPs = "anybody_acceptedPsVersion";
        var propUserEula, propUserPs;

        var versionToCheck = [propAppEula, propAppPs];
        if (deviceUserId != null) {
            propUserEula = deviceUserId + "_acceptedEulaVersion";
            propUserPs = deviceUserId + "_acceptedPsVersion";

            versionToCheck.push(propAnybodyEula);
            versionToCheck.push(propAnybodyPs);
            versionToCheck.push(propUserEula);
            versionToCheck.push(propUserPs);
        }

        sap.AppPreferences.getPreferenceValues(versionToCheck, function (values) {
            var agreementResult = {
                agreementOfApp: undefined,
                agreementOfUser: {
                    anybody: undefined,
                    thisUser: undefined
                }
            };

            if (isNull(values[propAppEula]) || values[propAppEula] != eulaVersion
                || isNull(values[propAppPs]) || values[propAppPs] != psVersion) {
                agreementResult.agreementOfApp = false;
            } else {
                agreementResult.agreementOfApp = true;
            }

            if (deviceUserId != null) {
                agreementResult.agreementOfUser = {};

                if (isNull(values[propUserEula])
                    || values[propUserEula] != eulaVersion
                    || isNull(values[propUserPs])
                    || values[propUserPs] != psVersion) {

                    agreementResult.agreementOfUser.thisUser = false;
                } else {
                    agreementResult.agreementOfUser.thisUser = true;
                }

                if (isNull(values[propAnybodyEula]) || values[propAnybodyEula] != eulaVersion
                    || isNull(values[propAnybodyPs]) || values[propAnybodyPs] != psVersion) {
                    agreementResult.agreementOfUser.anybody = false;
                } else {
                    agreementResult.agreementOfUser.anybody = true;
                }
            }

            return resolve(agreementResult);
        }, function (errMsg) {
            sap.Logger.error("Failed to get agreement records. " + errMsg, "FIORI_CLIENT");
            return reject(new Error(errMsg));
        });
    });
}

/**
 * Save the EULA and PS agreement record in AppPreferences.
 *
 * Returns a Promise with oEvent as resolve argument.
 * @param {object} oEvent - this object will be passed out to the returned Promise.resolve.
 * @param {string} eulaVersion - EULA version to be accepted
 * @param {string} psVersion - Privacy Statement version to be accepted
 * @param {string} deviceUserId - Use this argument to save agreement for a given user.
 * @param {boolean} anybody - set true to save agreement for anybody
 */
function saveAgreement(oEvent, eulaVersion, psVersion, deviceUserId, anybody) {
    return new Promise(function (resolve, reject) {
        var versToPersist = {
            app_acceptedEulaVersion: eulaVersion,
            app_acceptedPsVersion: psVersion
        };

        if (deviceUserId != null) {
            versToPersist[deviceUserId + "_acceptedEulaVersion"] = eulaVersion;
            versToPersist[deviceUserId + "_acceptedPsVersion"] = psVersion;
        }

        if (anybody) {
            versToPersist.anybody_acceptedEulaVersion = eulaVersion;
            versToPersist.anybody_acceptedPsVersion = psVersion;
        }

        sap.AppPreferences.setPreferenceValues(versToPersist, function (successMsg) {
            resolve(oEvent);
        }, function (errMsg) {
            sap.Logger.error("Failed to set agreement records. " + errMsg, "FIORI_CLIENT");
            reject(new Error(errMsg));
        });
    });
}

/**
 * Save the EULA and PS agreement record in AppPreferences.
 *
 * Returns a Promise.
 * @param {string} deviceUserId - save agreement for this given user.
 */
function saveAgreementForUser(deviceUserId) {
    var eulaPsConfig = readAppConfigForEulaPs();
    return saveAgreement(null, eulaPsConfig.eulaVersion, eulaPsConfig.psVersion, deviceUserId, true);
}

/**
 * Remove the EULA and PS agreement record from AppPreferences.
 * Returns a Promise with oEvent as resolve argument.
 * @param {object} oEvent - this object will be passed out to the returned Promise.resolve.
 */
function removeAgreement(oEvent) {
    return saveAgreement(oEvent, newNullLiteral(), newNullLiteral());
}

/**
 * Remove the EULA and PS agreement for a given user only.
 * Returns a Promise with oEvent as resolve argument.
 * @param {object} oEvent - this object will be passed out to the returned Promise.resolve.
 * @param {string} deviceUserId - the device user ID of the agreement
 * @param {boolean} anybody - set true to remove agreement for anybody too.
 */
function removeAgreementForUser(oEvent, deviceUserId, anybody) {
    return new Promise(function (resolve, reject) {
        if (deviceUserId == null) {
            reject(new Error("deviceUserId cannot be null or undefined"));
        }

        var versToRemove = {};
        versToRemove[deviceUserId + "_acceptedEulaVersion"] = newNullLiteral();
        versToRemove[deviceUserId + "_acceptedPsVersion"] = newNullLiteral();
        if (anybody) {
            versToRemove.anybody_acceptedEulaVersion = newNullLiteral();
            versToRemove.anybody_acceptedPsVersion = newNullLiteral();
        }

        sap.AppPreferences.setPreferenceValues(versToRemove, function (successMsg) {
            resolve(oEvent);
        }, function (errMsg) {
            sap.Logger.error("Failed to remove agreement records. " + errMsg, "FIORI_CLIENT");
            reject(new Error(errMsg));
        });
    });
}


/**
 * Check China Mainland by time zone
 */
function isChinaMainland() {
    var tzInChinaMainland = ["asia/shanghai", "asia/urumqi"];
    var timez = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
    return tzInChinaMainland.indexOf(timez) >= 0;
}

/**
 * Validate the text to prevent javascript injection.
 * The text should not contain characters: "<>",
 * or "javascript:"
 */
function validateHTMLText(text) {
    if (text == null) {
        return; // null is OK.
    }

    if (typeof text !== "string") {
        throw new Error("The text is an invalid string");
    }

    if (text.match(/<|>/g) != null) {
        throw new Error("The text contains invalid characters: '<', '>'.");
    }

    if (text.indexOf("javascript:") >= 0) {
        throw new Error("The text contains forbidden keywords: 'javascript:'.");
    }
}

/**
 * precheck before showing EulaPs Dialog. Return true if it is OK to show dialog, false to skip dialog.
 */
function precheckEulaPsDialog(forMultiUser) {
    // Windows doesn't support CCSL.
    if (isWindows()) {
        return false;
    }

    if (forMultiUser) {
        // If for multi users scenario, always pop-up dialog regardless of current URL
        return true;
    }

    // Only pop-up dialog when loading initial local start page index.html (startsWith www app directory)
    return isLocalPageLoaded();
}

function isLocalPageLoaded() {
    var currentUrl = window.location.href.toLowerCase();
    var wwwDir = getWwwAppDirectory().toLowerCase();
    if (currentUrl.indexOf(wwwDir) !== 0) {
        return false;
    }

    return true;
}

/**
 * Returns the default Privacy Statement file name.
 * return "privacy-statement.html"
 */
function defaultPsFileName() {
    return "privacy-statement.html";
}

/**
 * Reading appConfig.js and return an object:
 * {
 *     eulaVersion: EULA document version.
 *     psVersion: Privacy Statement document version.
 *     skipPsRegionChecking: set true to skip checking China mainland region and always show Privacy Statement.
 *     enablePrivacyStatement: set true to show privacy statement.
 *     eulaHyperlink: url to customized EULA document.
 *     psHyperlink: url to customized Privacy Statement document.
 *     eulaMsg: customized message on EULA pop-up dialog.
 *     eulaAndPsMsg: customized message on EULA and Privacy Statement pop-up dialog.
 * }
 */
function readAppConfigForEulaPs() {
    var obj = {};
    var cfg = {};
    if (typeof fiori_client_appConfig !== "undefined") {
        cfg = fiori_client_appConfig;
    } else if (typeof context !== "undefined" && typeof context.appConfig !== "undefined") {
        // fiori_client_appConfig is only defined in local index.html. If load the remote FLP,
        // fiori_client_appConfig will be undefined.
        cfg = context.appConfig;
    }
    obj.eulaVersion = cfg.eulaVersion || "0";
    obj.psVersion = cfg.psVersion || "0";
    obj.skipPsRegionChecking = cfg.skipPsRegionChecking === true;
    obj.enablePrivacyStatement = cfg.enablePrivacyStatement !== false;
    obj.eulaHyperlink = cfg.eulaHyperlink || "EULA.html";
    obj.psHyperlink = cfg.psHyperlink || defaultPsFileName();
    obj.eulaMsg = cfg.eulaMsg;
    obj.eulaAndPsMsg = cfg.eulaAndPsMsg;
    return obj;
}

/**
 * preset EulaPs dialog title and message. Returns an object:
 * {
 *      title: dialog title
 *      message: dialog message
 * }
 *
 * @param {object} eulaPsConfig - configuration for EULA and PS
 */
function presetEulaPsTitle(eulaPsConfig) {
    var obj = {};
    // To prevent javascript injection attack, need to validate eulaHyperlink and psHyperlink
    validateHTMLText(eulaPsConfig.eulaHyperlink);
    validateHTMLText(eulaPsConfig.psHyperlink);

    if (eulaPsConfig.eulaHyperlink.indexOf("http://") < 0 && eulaPsConfig.eulaHyperlink.indexOf("https://") < 0
        && eulaPsConfig.eulaHyperlink.indexOf("file:///") < 0) {

        // relative Url
        eulaPsConfig.eulaHyperlink = getWwwAppDirectory() + eulaPsConfig.eulaHyperlink;
    }

    if (eulaPsConfig.psHyperlink.indexOf("http://") < 0 && eulaPsConfig.psHyperlink.indexOf("https://") < 0
        && eulaPsConfig.psHyperlink.indexOf("file:///") < 0) {

        // relative Url
        eulaPsConfig.psHyperlink = getWwwAppDirectory() + eulaPsConfig.psHyperlink;
    }

    if (eulaPsConfig.enablePrivacyStatement && (eulaPsConfig.skipPsRegionChecking || isChinaMainland())) {

        // Show both EULA and Privacy Statement
        obj.title = bundle.get("eula_and_ps_title");
        if (eulaPsConfig.eulaAndPsMsg) {
            obj.message = eulaPsConfig.eulaAndPsMsg;
        } else {
            obj.message = bundle.getFormatText("eula_and_ps_msg", [eulaPsConfig.eulaHyperlink, eulaPsConfig.psHyperlink]);
        }
    } else {
        // Show EULA only
        obj.title = bundle.get("eula_title");
        if (eulaPsConfig.eulaMsg) {
            obj.message = eulaPsConfig.eulaMsg;
        } else {
            obj.message = bundle.getFormatText("eula_msg", [eulaPsConfig.eulaHyperlink]);
        }
    }
    return obj;
}

/**
 * Check and open EULA and Privacy Statement dialog. If end user has not accepted agreement, then FC will
 * pop-up the EULA and PS dialog.
 * For China region, the pop-up dialog includes both EULA and PS; for other regions, only includes
 * EULA.
 *
 * Returns a Promise with an oEvent parameter in callback:
 * {
 *     "accept": {boolean} // indicates if end user accepts the agreement
 * }
 *
 * Note: Windows doesn't support this function.
 * @param {boolean} [forRegNewUser] set true for register new user. It will ignore the agreement record checking
 * and to force display the pop-up dialog.
 */
function checkAndOpenEulaPsDialog(forRegNewUser) {
    if (precheckEulaPsDialog(forRegNewUser) === false) {
        return Promise.resolve({ accept: true });
    }

    eulaPsConfig = readAppConfigForEulaPs();

    return new Promise(function (resolve, reject) {
        if (eulaPsConfig.eulaVersion === "0" && eulaPsConfig.psVersion === "0") {
            // When loading the FioriLaunchpad, eulaVersion and psVersion are undefined.
            // So in this condition, we assume that either FC is loading FioriLaunchpad, or
            // customer doesn't define eulaVersion and psVersion properties in appConfig.js.
            // Do not display EULA and PS dialog.
            sap.Logger.debug("eulaVersion and psVersion are '0' or undefined. Do not display EULA and PS dialog.", "FIORI_CLIENT");
            return resolve({ accept: true });
        }

        if (forRegNewUser) {
            return internalPopupEulaAndPs(true);
        } else {
            return checkAgreement(eulaPsConfig.eulaVersion, eulaPsConfig.psVersion).then(function (agreementResult) {
                if (agreementResult.agreementOfApp) {
                    sap.Logger.debug("Already accepted agreement. Do not display EULA and PS dialog.", "FIORI_CLIENT");
                    return resolve({ accept: true });
                }

                return internalPopupEulaAndPs();
            }).catch(function (err) {
                return reject(err);
            });
        }

        /**
         * popup EULA and PS dialog
         */
        function internalPopupEulaAndPs(bFullScreen) {
            var dialogTxt = presetEulaPsTitle(eulaPsConfig);
            return showEulaAndPs(dialogTxt.title, dialogTxt.message, bFullScreen).then(function (oEvent) {
                if (!forRegNewUser && oEvent.accept) {
                    return saveAgreement(oEvent, eulaPsConfig.eulaVersion, eulaPsConfig.psVersion);
                } else {
                    return oEvent;
                }
            }).then(function (oEvent) {
                return resolve(oEvent);
            }).catch(function (errMsg) {
                sap.Logger.error('Failed to open EULA and PS dialog: ' + errMsg, "FIORI_CLIENT");
                reject(new Error(errMsg));
            });
        }

    });
}

function checkAndOpenEulaPsDialogForMultiUser(deviceUserId) {
    if (precheckEulaPsDialog(true) === false) {
        return Promise.resolve({ accept: true });
    }

    eulaPsConfig = readAppConfigForEulaPs();

    return new Promise(function (resolve, reject) {
        return checkAgreement(eulaPsConfig.eulaVersion, eulaPsConfig.psVersion, deviceUserId).then(function (agreementResult) {
            if (agreementResult.agreementOfUser.thisUser) {
                sap.Logger.debug("Already accepted agreement. Do not display EULA and PS dialog.", "FIORI_CLIENT");
                return resolve({ accept: true });
            } else if (agreementResult.agreementOfUser.anybody) {
                return internalPopupEulaAndPs();
            } else {
                return saveAgreement(null, eulaPsConfig.eulaVersion, eulaPsConfig.psVersion, deviceUserId, true).then(function () {
                    return resolve({ accept: true });
                });
            }
        }).catch(function (err) {
            return reject(err);
        });

        /**
         * popup EULA and PS dialog
         */
        function internalPopupEulaAndPs() {
            var dialogTxt = presetEulaPsTitle(eulaPsConfig);
            var bFullScreen = !isLocalPageLoaded();
            return showEulaAndPs(dialogTxt.title, dialogTxt.message, bFullScreen).then(function (oEvent) {
                if (oEvent.accept) {
                    return saveAgreement(oEvent, eulaPsConfig.eulaVersion, eulaPsConfig.psVersion, deviceUserId, false);
                } else {
                    return oEvent;
                }
            }).then(function (oEvent) {
                return resolve(oEvent);
            }).catch(function (err) {
                sap.Logger.error('Failed to open EULA and PS dialog: ' + err, "FIORI_CLIENT");
                reject(new Error(err));
            });
        }

    });
}

/**
 * returns the www/ directory where the application is installed.
 */
function getWwwAppDirectory() {
    sap.Logger.debug("return cordova.file.applicationDirectory + www/ : " + cordova.file.applicationDirectory + "www/", "FIORI_CLIENT");
    return cordova.file.applicationDirectory + "www/";
}

/**
 * Open a consent dialog before collecting personal information.
 * Returns a Promise with an oEvent parameter in resolve callback:
 * {
 *     "accept": {boolean} // true if end user accepts the consent
 * }
 *
 * @memberof sap.FioriClient
 * @method openPsConsentDialog
 * @param {String} [personalInfo] describes the personal information to be collected.
 * @param {object} [oPsHyperlink] describes the Privacy Statement hyperlink. It has two properties:
 *                                "href": {String} the url of the hyperlink.
 *                                "text": {String} the text of the hyperlink.
 *                                If this param is null, the Consent Dialog will show the default Fiori Client Privacy Statement.
 * @public
 * @example
 * sap.FioriClient.openPsConsentDialog({
 *     "href": "https://www.sap.com/about/legal/privacy.html",
 *     "text": "privacy statement"
 * }, "bank account, ID card and address")
 * .then(function(oEvent) {
 *     if (oEvent.accept) {
 *         // end user accepts consent. Now it's legal to collect personal information.
 *     } else {
 *         // end user denies consent. Do not collect personal information.
 *     }
 * });
 */
function openPsConsentDialog(personalInfo, oPsHyperlink) {
    return new Promise(function (resolve, reject) {
        var appName = context.smpConfig.appName;
        var psHref, psText;
        if (oPsHyperlink) {
            psHref = oPsHyperlink.href;
            psText = oPsHyperlink.text;
        } else {
            if (isNull(context.appConfig.psHyperlink)) {
                psHref = getWwwAppDirectory() + "privacy-statement.html";
            } else {
                psHref = context.appConfig.psHyperlink;
            }
            psText = bundle.get("settings_read_ps");
        }

        // To prevent javascript injection attack, need to validate psHref, psText and personalInfo
        validateHTMLText(psHref);
        validateHTMLText(psText);
        validateHTMLText(personalInfo);

        var oDialog = new sap.m.Dialog({
            showHeader: false,
            type: "Message",
            content: [
                new sap.m.Title({
                    wrapping: true,
                    width: "100%",
                    text: bundle.getFormatText("ps_consent_title", [appName]),
                    textAlign: "Center"
                }),
                new sap.ui.core.HTML({
                    content: "<p>" + bundle.getFormatText("ps_consent_msg", [appName, personalInfo, psHref, psText]) + "</p>"
                }),
            ],
            endButton: new sap.m.Button({
                type: sap.m.ButtonType.Emphasized,
                text: bundle.get("ps_consent_btn_allow"),
                press: function () {
                    oDialog.close();
                    resolve({
                        accept: true
                    });
                }
            }),
            beginButton: new sap.m.Button({
                text: bundle.get("ps_consent_btn_deny"),
                press: function () {
                    oDialog.close();
                    resolve({
                        accept: false
                    });
                }
            }),
            afterClose: function () {
                oDialog.destroy();
            }
        });

        oDialog.open();
    });
}

//expose public property and method
module.exports = {
    onSubmitScreen: onSubmitScreen,
    onGetAppConfig: onGetAppConfig,
    onRegistrationSuccess: onRegistrationSuccess,
    onRegistrationError: onRegistrationError,
    retrieveAppID: retrieveAppID,
    retrieveFioriURLIsSMP: retrieveFioriURLIsSMP,
    goToFioriURL: goToFioriURL,
    setFioriURL: setFioriURL,
    getFioriURL: getFioriURL,
    getIdpLogonURL: getIdpLogonURL,
    clearBrowserCache: clearBrowserCache,
    clearLog: clearLog,
    handleOpenURL: handleOpenURL,
    showLogFile: showLogFile,
    resetSettings: resetSettings,
    showSettings: showSettings,
    openBrowserView: openBrowserView,
    checkAndOpenEulaPsDialog: checkAndOpenEulaPsDialog,
    checkAndOpenEulaPsDialogForMultiUser: checkAndOpenEulaPsDialogForMultiUser,
    openPsConsentDialog: openPsConsentDialog,
    saveAgreementForUser: saveAgreementForUser
};
