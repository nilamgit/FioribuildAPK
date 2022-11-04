
///////////////////////////////  AuthProxy ///////////////////////////////////
module.exports = {

    sendRequest: function (success, fail, args) {

        var method = args[0];
        var url = args[1];
        var header = args[2];
        var requestBody = args[3];
        var user = args[4];
        var password = args[5];
        var timeout = args[6];
        var certSource = args[7];
        //var ap = new AuthProxyPlugin.AuthProxy();
        var ap = new SAP.AuthProxy.AuthProxy();

        var headerStr = (header == "undefined") ? header : JSON.stringify(header);
        var certSourceStr = (certSource == "undefined") ? certSource : JSON.stringify(certSource);

        ap.sendRequest(method, url, headerStr, requestBody, user, password, timeout, certSourceStr)
            .then(
                // success handler
                function (jsonResult) {
                    var result = JSON.parse(jsonResult);
                    if (result.errorCode == undefined && result.exceptionCode == undefined)
                        success(result);
                    else
                        fail(result);
                },
                // error handler
                function (err) {
                    _handleError(fail, err.message);
                }
            );
    },

    sendRequest2: function (success, fail, args) {

        var method = args[0];
        var url = args[1];
        var header = args[2];
        var requestBody = args[3];
        var timeout = args[4];
        var authConfig = args[5];

        var ap = new SAP.AuthProxy.AuthProxy();

        var headerStr = (header == "undefined") ? header : JSON.stringify(header);
        var authConfigStr = (authConfig == "undefined") ? authConfig : JSON.stringify(authConfig);

        ap.sendRequest2(method, url, headerStr, requestBody, timeout, authConfigStr)
            .then(
                // success handler
                function (jsonResult) {
                    var result = JSON.parse(jsonResult);
                    if (result.errorCode == undefined && result.exceptionCode == undefined) {
                        var authConfiguration = ap.authConfig != null ? ap.authConfig.samlAuthConfiguration : null;
                        var authChallengeHeader = authConfiguration != null ? authConfiguration.samlauthChallengeHeader : null;

                        if (result.status === 401 && ap.basicAuthRealmToCache != null && ap.basicAuthRealmToCache != "" && ap.allowBasicAuthUI) {
                            //check Basic Auth Challenge and prompt Basic Auth Dialog
                            createBasicAuthDialog(function (evt) {
                                if (evt.buttonIndex === 0) { // OK is pressed
                                    var username = evt.input1;
                                    var password = evt.input2;
                                    ap.resendRequestWithCredential(username, password)
                                        .then(function (jsonResult) {
                                            var result = JSON.parse(jsonResult);
                                            success(result);
                                        },
                                            function (err) {
                                                _handleError(fail, err.message);
                                            }
                                        );
                                } else { // Cancel is pressed
                                    result.userCancelled = true;
                                    success(result);
                                }
                            }, result.requestUri);
                        } else if (authChallengeHeader != null && result.headers != null && result.headers[authChallengeHeader] == "login-request") {
                            // check SAML2 Challenge
                            console.log("SAML authentication challenge!");

                            sap.AuthProxy.doSAMLAuthenticationInWebview(authConfiguration.endpoint, authConfiguration.redirectParam);

                            var samlAuthenticationCompleteHandler = function () {
                                WinJS.Application.removeEventListener("samlAuthenticationComplete", samlAuthenticationCompleteHandler, false);
                                module.exports.sendRequest2(success, fail, args);
                            };
                            WinJS.Application.addEventListener("samlAuthenticationComplete", samlAuthenticationCompleteHandler, false);
                        } else {
                            success(result);
                        }
                    } else {
                        fail(result);
                    }
                },
                // error handler
                function (err) {
                    _handleError(fail, err.message);
                }
            );
    },

    samlAuthenticationComplete: function (success, fail, args) {
        if (args[1]) {
            WinJS.Application.queueEvent({ type: "samlAuthenticationComplete" });
        }
    },

    get: function (success, fail, args) {

        var url = args[0];
        var header = args[1];
        var user = args[2];
        var password = args[3];
        var timeout = args[4];
        var certSource = args[5];
        var ap = new SAP.AuthProxy.AuthProxy();

        var headerStr = (header == "undefined") ? header : JSON.stringify(header);
        var certSourceStr = (certSource == "undefined") ? certSource : JSON.stringify(certSource);

        ap.get(url, header, requestBody, user, password, timeout, certSourceStr)
            .then(
                // success handler
                function (jsonResult) {
                    var result = JSON.parse(jsonResult);
                    if (result.errorCode == undefined && result.exceptionCode == undefined)
                        success(result);
                    else
                        fail(result);
                },
                // error handler
                function (err) {
                    _handleError(fail, err.message);
                }
            );
    },

    deleteCertificateFromStore: function (success, fail, arg) {
        var CertificateKey = args[0];
        var ap = new SAP.AuthProxy.AuthProxy();

        ap.deleteCertificateFromStore(CertificateKey)
            .then(
                // success handler
                function (jsonResult) {
                    var result = JSON.parse(jsonResult);
                    if (result.errorCode == undefined && result.exceptionCode == undefined)
                        success(result);
                    else
                        fail(result);
                },
                // error handler
                function (err) {
                    _handleError(fail, err.message);
                }
            );
    }

};


function _handleError(errorCallback, errorMessage) {
    if (errorCallback != null) {
        var errorCode = 0;
        if (errorMessage != null && errorMessage !== undefined) {
            var ERROR_CODE_STR = "error code:";
            var chunks = errorMessage.split(ERROR_CODE_STR);
            if (chunks.length > 1) {
                errorCode = parseInt(chunks[1]);
            }
        }
        errorCallback(errorCode > 1 ? errorCode : errorMessage);
    }
}

var urlutil = require('cordova/urlutil');
var i18n = require('kapsel-plugin-i18n.i18n');

function createBasicAuthDialog(callback, url) {
    // extract host from url
    var host;
    var oUrl;
    try {
        oUrl = new URL(url);
        host = oUrl.origin;
    } catch (e) {
        host = encodeURI(url); // encodeURI to protect XSS attack
    }

    i18n.load({
        path: "smp/logon/i18n",
        name: "i18n"
    }, function (bundle) {
        continueWith(bundle);
    }
    );

    function continueWith(bundle) {
        createCSSElem("notification.css");

        var dlgWrap = document.createElement("div");
        dlgWrap.className = "dlgWrap";

        var dlg = document.createElement("div");
        dlg.className = "dlgContainer";
        dlg.className += " dlgContainer-windows";
        dlg.style.paddingBottom = "2%";
        dlg.innerHTML = "<span id='lbl-title'></span><br/>" + // title
            "<span id='lbl-message'></span><br/>" + // message
            "<input id='prompt-input-user'/><br/>" + // user name input field
            "<input id='prompt-input-pwd' type='password'/><br/>"; // password input field
        dlg.querySelector("#lbl-title").appendChild(document.createTextNode(bundle.get("SIGN_IN_TITLE")));
        dlg.querySelector("#lbl-message").appendChild(document.createTextNode(host));

        var inputUser = dlg.querySelector("#prompt-input-user");
        inputUser.setAttribute("placeholder", bundle.get("SIGN_IN_USERNAME"));
        inputUser.style.width = "100%";
        var inputPwd = dlg.querySelector("#prompt-input-pwd");
        inputPwd.setAttribute("placeholder", bundle.get("SIGN_IN_PASSWORD"));
        inputPwd.style.width = "100%";

        // OK and Cancel buttons
        addButton(1, bundle.get("SIGN_IN_CANCEL_BTN"));
        addButton(0, bundle.get("SIGN_IN_OK_BTN"));
        dlgWrap.appendChild(dlg);
        document.body.appendChild(dlgWrap);
        dlg.querySelector("#prompt-input-user").select();

        // add Enter/Return key handling
        var defaultButton = dlg.querySelector(".dlgButtonFirst");
        dlg.addEventListener("keypress", function (e) {
            if (e.keyCode === 13) { // enter key
                if (defaultButton) {
                    defaultButton.click();
                }
            }
        });
        return;

        function makeButtonCallback(idx) {
            return function () {
                var usernameValue = dlg.querySelector("#prompt-input-user").value;
                var pwdValue = dlg.querySelector("#prompt-input-pwd").value;
                dlgWrap.parentNode.removeChild(dlgWrap);
                if (callback) {
                    callback({
                        input1: usernameValue,
                        input2: pwdValue,
                        buttonIndex: idx
                    });
                }
            }
        }

        function addButton(idx, label) {
            var button = document.createElement("button");
            button.className = "dlgButton";
            button.tabIndex = idx;
            button.onclick = makeButtonCallback(idx);
            if (idx === 0) {
                button.className += " dlgButtonFirst";
            }
            button.appendChild(document.createTextNode(label));
            dlg.appendChild(button);
        }
    }

    function createCSSElem(fileName) {
        var elemId = fileName.substr(0, fileName.lastIndexOf('.')) + '-plugin-style';
        // If the CSS element exists, don't recreate it.
        if (document.getElementById(elemId)) {
            return false;
        }

        // Create CSS and append it to DOM.
        var $elem = document.createElement('link');
        $elem.id = elemId;
        $elem.rel = 'stylesheet';
        $elem.type = 'text/css';
        $elem.href = urlutil.makeAbsolute('/www/css/' + fileName);

        document.head.appendChild($elem);
        return true;
    }

}

require("cordova/exec/proxy").add("AuthProxy", module.exports);


/////////////////////////////////////////////////////////////////////////


