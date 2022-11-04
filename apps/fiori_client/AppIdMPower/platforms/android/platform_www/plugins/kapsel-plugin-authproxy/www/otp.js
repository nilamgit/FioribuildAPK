cordova.define("kapsel-plugin-authproxy.otp", function(require, exports, module) {
var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec'),
    utils = require('./utils'),
    currentConfig = null,
    requestActive = false,
    queue = [],
    ref = null,
    otpAuthenticationAttempted = false;

/**
 * Queue the token request.  When the active request is finished,
 * all the queued requests wil be called.
 * @private
 * @param {function} successCallback 
 * @param {function} errorCallback 
 */
function addRequestToQueue(successCallback, errorCallback) {
    queue.push({
        success: successCallback,
        error: errorCallback
    });
}

function emptyRequestQueue(error) {
    var pendingRequests = queue;
    queue = [];

    for (var i = 0; i < pendingRequests.length; i++) {
        if (error) {
            var errorCallback = pendingRequests[i].error;
            if (errorCallback) {
                errorCallback.apply(null, [error]);
            }
        } else {
            var successCallback = pendingRequests[i].success;
            if (successCallback) {
                successCallback.apply(null, []);
            }
        }
    }
}

/**
 * Acquires a OTP session with the server. This will show a webview.
 * @public
 * @param {function} successCallback
 * @param {function} errorCallback
 * @param {String} url
 * @memberof sap.AuthProxy.OTP
 */
function authenticate(successCallback, errorCallback, url) {
    utils.log("otp authenticate called");
    otpAuthenticationAttempted = true;
    var doAuthenticate = function() {
        //append additional parameter
        if (url.indexOf('?') > -1){
            url = url + "&" + currentConfig.UrlAdditonalParam;
        }
        else{
            url = url + "?" + currentConfig.UrlAdditonalParam;
        }

        // Only allow one request to get a token at a time
        // When the first request finishes.  All queued requests
        // will get the same result as the first request.
        if (requestActive) {
            addRequestToQueue(successCallback, errorCallback);
            return;
        }

        var win = function () {
            if (successCallback) {
                successCallback();
            }
            requestActive = false;
            emptyRequestQueue();
        };

        var fail = function (error) {
            if (errorCallback) {
                errorCallback(error);
            }

            requestActive = false;
            emptyRequestQueue(error);
        }

        requestActive = true;

        if (!currentConfig) {
            fail({message: "No active otp config"});
            return;
        }

        ref = cordova.InAppBrowser.open(url, '_blank', 'location=no,toolbar=yes,hardwareback=no');
        var success = false;
        var loadListener = function(event) {
            if (event.url.indexOf(currentConfig.finishEndpoint) >= 0) {
                success = true;
                ref.close();
                if (cordova.require("cordova/platform").id.indexOf("windows") === 0) {
                    exitListener();
                }
            }
        };
        var errorListener = function(event) {
            if (cordova.require("cordova/platform").id == "ios" ){
                // -999 is the error code for a request not being completed.  102 is for interrupted by
                // policy change. 1 is for page reload before previous loading is finished. Neither should be fatal.
                if (event && (event.code === -999 || event.code === 102 || event.code === 1)) {
                    utils.log("OTP errorListener ignoring spurious error " + event.code);
                    return;
                }
            }
            ref.close();
        };
        var exitListener = function(event) {
            if (success) {
                win();
            } else {
                fail({ message: "OTP authentication failed"});
            }
        };
        ref.addEventListener('loadstart', loadListener);
        ref.addEventListener('loaderror', errorListener);
        ref.addEventListener('exit', exitListener);
    };
    if (sap.logon) {
        sap.logon.LogonJsView.close(doAuthenticate, true);
    } else {
        doAuthenticate();
    }
}

/**
 * Determines if this is an OTP challenge
 * @public
 * @param {Object} response
 * @returns true if this is a challenge
 * @memberof sap.AuthProxy.OTP
 */
function isChallenge(response) {
    if (currentConfig && response) {
        if (response.headers) {
            var challenge = utils.findHeader(currentConfig.challengeHeaderName, response.headers);
            return (challenge == currentConfig.challengeHeaderValue);
        }
    }
    return false;
}

/*
 * Enable OTP challenge support
 * @param {function} successCallback
 * @param {function} errorCallback
 * @memberof sap.AuthProxy.OTP
 */
function enable(successCallback, errorCallback) {
    currentConfig = {
        challengeHeaderName: "x-smp-authentication",
        challengeHeaderValue: "otp-challenge",
        UrlAdditonalParam: "redirecttooriginalurl=false",
        finishEndpoint: "finished=true"
    };
    if (cordova.require("cordova/platform").id !== 'windows') {
        exec(successCallback, errorCallback, 'AuthProxy', 'enableOTP', [currentConfig]);
    }
    else if (successCallback) {
        successCallback();
    }
}

/**
 * Disable OTP challenge support
 * @param {function} successCallback
 * @param {function} errorCallback
 * @memberof sap.AuthProxy.OTP
 */
function disable(successCallback, errorCallback) {
    currentConfig = null;
    if (cordova.require("cordova/platform").id !== 'windows') {
        exec(successCallback, errorCallback, 'AuthProxy', 'disableSAML2', []);
    }
    else if (successCallback) {
        successCallback();
    }
}

/**
 * Handle the callback from SAP Authenticator
 * @param {String} credential URL parameter
 */
function credentialCallback(credential) {
   var script = "if (window.location.href.indexOf('?')>-1) {window.location.replace(window.location.href + '&" + credential + "');}else { window.location.replace(window.location.href + '?"+credential+"');};";
    ref.executeScript({code:script});
}

function isInUse() {
    return otpAuthenticationAttempted;
}

/**
 * @namespace
 * @alias OTP
 * @memberof sap.AuthProxy
 */
module.exports = {
    enable: enable,
    disable: disable,
    authenticate: authenticate,
    isChallenge: isChallenge,
    credentialCallback: credentialCallback,
    isInUse: isInUse
};

});
