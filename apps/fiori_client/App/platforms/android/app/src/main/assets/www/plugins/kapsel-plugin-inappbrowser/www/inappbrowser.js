cordova.define("kapsel-plugin-inappbrowser.inappbrowser", function(require, exports, module) {
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/
/**
 * NOTE: This file is kapsel SDK patched to fix:
 * 1. Add back button event support
 */
(function() {
    // special patch to correctly work on Ripple emulator (CB-9760)
    if (window.parent && !!window.parent.ripple) { // https://gist.github.com/triceam/4658021
        module.exports = window.open.bind(window); // fallback to default window.open behaviour
        return;
    }

    var exec = require('cordova/exec');
    var channel = require('cordova/channel');
    var modulemapper = require('cordova/modulemapper');
    var urlutil = require('cordova/urlutil');

    function InAppBrowser() {
       this.channels = {
            'beforeload': channel.create('beforeload'),
            'loadstart': channel.create('loadstart'),
            'loadstop' : channel.create('loadstop'),
            'loaderror' : channel.create('loaderror'),
            'exit' : channel.create('exit'),
            'customscheme': channel.create('customscheme'),
            'backbutton' : channel.create('backbutton') // Kapsel Patch - Add back button event support
       };
       
       this._alive = true; // Kapsel Patch - Keep track of if inappbrowser is alive.
    }

    InAppBrowser.prototype = {
        _eventHandler: function (event) {
            if (event && (event.type in this.channels)) {
                if (event.type === 'beforeload') {
                    this.channels[event.type].fire(event, this._loadAfterBeforeload);
                } else {
                    this.channels[event.type].fire(event);
                }
            }
        },
        _loadAfterBeforeload: function (strUrl) {
            if (this._alive) {  
               strUrl = urlutil.makeAbsolute(strUrl);
               exec(null, null, 'InAppBrowser', 'loadAfterBeforeload', [strUrl]);
            }
        },
        close: function (eventname) {
            if (this._alive) {
                this._alive = false;
                exec(null, null, 'InAppBrowser', 'close', []);
            }
        },
        show: function (eventname) {
            if (this._alive) {
                exec(null, null, 'InAppBrowser', 'show', []);
            }
        },
        hide: function (eventname) {
            if (this._alive) {
                exec(null, null, 'InAppBrowser', 'hide', []);
            }
        },
        addEventListener: function (eventname,f) {
            if (eventname in this.channels) {
                this.channels[eventname].subscribe(f);
            }
        },
        removeEventListener: function(eventname, f) {
            if (eventname in this.channels) {
                this.channels[eventname].unsubscribe(f);
            }
        },

        executeScript: function(injectDetails, cb) {
            if (injectDetails.code) {
                exec(cb, null, 'InAppBrowser', 'injectScriptCode', [injectDetails.code, !!cb]);
            } else if (injectDetails.file) {
                exec(cb, null, 'InAppBrowser', 'injectScriptFile', [injectDetails.file, !!cb]);
            } 
            //kapsel customization begin
            else if (injectDetails.codeFromFile) {
                exec(cb, null, "InAppBrowser", "injectScriptCodeFromFile", [injectDetails.codeFromFile, !!cb]);
            }
            //kapsel customization end
            else {
                throw new Error('executeScript requires exactly one of code or file to be specified');
            }
        },

        insertCSS: function(injectDetails, cb) {
            if (injectDetails.code) {
                exec(cb, null, 'InAppBrowser', 'injectStyleCode', [injectDetails.code, !!cb]);
            } else if (injectDetails.file) {
                exec(cb, null, 'InAppBrowser', 'injectStyleFile', [injectDetails.file, !!cb]);
            } else {
                throw new Error('insertCSS requires exactly one of code or file to be specified');
            }
        }
    };

    module.exports = function(strUrl, strWindowName, strWindowFeatures, callbacks) {
        //kapsel change start
        //usewkWebView parameter in strWindowFeature is used to decide whether using WKWebView is used or not. By default, wkWebView is not used.
        //In kapsel, always uses wkwebview in inappbrowser if wkwebview is used for main cordova webview, so useWKWebView parameter needs to be set automatically.
        if (!(strWindowFeatures && strWindowFeatures.indexOf("usewkwebview")!=-1)){
            if (window.webkit && window.webkit.messageHandlers){
                if (strWindowFeatures){
                    strWindowFeatures = strWindowFeatures + ",usewkwebview=yes";
                }
                else{
                    strWindowFeatures = "usewkwebview=yes";
                }
            }
        }
        //kapsel change end
        // Don't catch calls that write to existing frames (e.g. named iframes).
        if (window.frames && window.frames[strWindowName]) {
            var origOpenFunc = modulemapper.getOriginalSymbol(window, 'open');
            return origOpenFunc.apply(window, arguments);
        }

        strUrl = urlutil.makeAbsolute(strUrl);
        var iab = new InAppBrowser();

        callbacks = callbacks || {};
        for (var callbackName in callbacks) {
            iab.addEventListener(callbackName, callbacks[callbackName]);
        }

        var cb = function(eventname) {
           iab._eventHandler(eventname);
        };

        strWindowFeatures = strWindowFeatures || '';

        exec(cb, cb, 'InAppBrowser', 'open', [strUrl, strWindowName, strWindowFeatures]);
        return iab;
    };
})();
});
