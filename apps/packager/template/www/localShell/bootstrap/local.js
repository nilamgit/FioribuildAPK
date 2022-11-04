// Copyright (c) 2013 SAP AG, All Rights Reserved
/**
 * @fileOverview The Unified Shell's bootstrap code for offline.
 *
 * @version @version@
 */
(function () {
    "use strict";
    /*global jQuery, sap, window */

    window['sap-ui-config'] = {
        "xx-bootTask": function (fnCallback) {
           jQuery.sap.registerModulePath("sap.ushell.shells.local", "localShell/shells/local/");
           fnCallback();
        },

       "oninit": function() {
           // Move the logic for ushell boot strap into the oninit to avoid the 'initLibrary' error with UI5 1.71
           jQuery.sap.require("sap.ushell.services.Container");
           // tell SAPUI5 that this boot task is done once the container has loaded
           sap.ushell.bootstrap("local");
       }
   };
}());
