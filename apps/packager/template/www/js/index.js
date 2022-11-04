/*jslint browser:true*/
/*global sap*/

(function () {
    "use strict";

    //add an event listener for the Cordova deviceReady event.
    document.addEventListener('deviceready', function () {
        if (cordova.require("cordova/platform").id === "ios")
        {
            StatusBar.backgroundColorByName("white");
            StatusBar.styleDefault();
            StatusBar.overlaysWebView(false);
        }
        
        sap.FioriClient = cordova.require("kapsel-plugin-fioriclient.FioriClient");


        //for prepackaged app, load fioriclient.js as a resource
        sap.FioriClient.loadByIndexPage = true;

        // Workaround CORS on WKWebView by using AuthProxy for datajs calls.
        if (window.webkit && window.webkit.messageHandlers) {
            jQuery.sap.require("sap.ui.thirdparty.datajs");
            OData.defaultHttpClient = sap.AuthProxy.generateODataHttpClient2();
        }
    });
}());
