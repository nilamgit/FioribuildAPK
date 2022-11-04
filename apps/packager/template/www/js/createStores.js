jQuery.sap.require("sap.ui.thirdparty.datajs");
jQuery.sap.require("sap.m.BusyDialog");

if (!sap) {
    sap = {};
}
if (!sap.smp) {
    sap.smp = {};
}

if (!sap.smp.packaged) {
    sap.smp.packaged = {};
}

if(!sap.smp.packaged.bundle){
    sap.smp.packaged.bundle = sap.ui.getCore().getLibraryResourceBundle("sap.ushell.shells.local");
}


sap.smp.registration = {

    stores: null,

    setup: function (ctx, success, failure) {
        var that = this;

         this._getManifestStores().then(function (manifestStores) {
            if (jQuery.isEmptyObject(manifestStores)) {
                console.log("WARNING: No stores defined in application manifest files");
                success();
            } else {
                that._getStoreEncryptionKey(function (storeEncryptionKey) {
                    var deferreds = [];
                    that.stores = {};

                    for (var storesName in manifestStores) {
                        var store = manifestStores[storesName];
                        var storeOptions = {
                            storeEncryptionKey: storeEncryptionKey
                        };

                        deferreds.push(that._setupStore(ctx, store, storeOptions));
                    }

                    new sap.m.BusyDialog("_offline_busy_", {
                        text: sap.smp.packaged.bundle.getText("provision_local_store"),
                        title: sap.smp.packaged.bundle.getText("wait_text")
                    }).open();

                    jQuery.when.apply(jQuery, deferreds).then(function () {
                        // success
                        sap.ui.getCore().byId("_offline_busy_").close();

                        success();
                    }, function (e) {
                        // failure
                        sap.ui.getCore().byId("_offline_busy_").close();

                        failure(e);
                    });
                }, failure);
            }
        });
    },

    _readApplicationManifest: function (application) {
        var urlutil = cordova.require('cordova/urlutil');
        var options = { async: true, dataType: "json" };
        var applicationURL;

        if (application.url) {
            applicationURL = application.url;
        }
        else if (application.intent && window.applications[application.intent] && window.applications[application.intent].url) {
            applicationURL = window.applications[application.intent].url;
        }

        if (applicationURL) {
            // Application manifests must be explicitly loaded with URL as the resource paths
            // are only registered when the tile is loaded.
            var manifestURL = applicationURL + "/manifest.json";
            if (manifestURL.indexOf('/') === 0) {
                manifestURL = manifestURL.substring(1);
            }
            
            // URL must be absolute so we load the local file version
            options.url = urlutil.makeAbsolute(manifestURL);
            return jQuery.sap.loadResource(manifestURL, options);
        }
        else {
            // Must be a reuse component.  Try load with resource name as it should already be in the resource path.
            var resourceName = application.id.replace(/\./g, "/") + "/manifest.json";
            return jQuery.sap.loadResource(resourceName, options);
        }
    },

    _getManifestStores: function (done) {
        var that = this;
        var deferreds = [];
        var manifestStores = {};
        fiori_client_appConfig.applications.forEach(function (application) {
            var deferred = jQuery.Deferred();
            that._readApplicationManifest(application).then(function (manifest) {
                if (manifest && manifest["sap.mobile"] && manifest["sap.mobile"]["stores"]) {
                    var stores = manifest["sap.mobile"]["stores"];
                    
                    // Old format has stores as an Array while new format is an object
                    if (stores.constructor === Array) {
                        stores.forEach(function(store) {
                            manifestStores[store.name] = store;
                        });
                    }
                    else if (typeof stores === 'object') { alert("new");
                        for (var storeName in stores) {
                            manifestStores[storeName] = stores[storeName];
                        }
                    }
                }
                deferred.resolve();
            }, function () {
                deferred.resolve();
            });

            deferreds.push(deferred);
        });

        return jQuery.when.apply(jQuery, deferreds).then(function () {
            for (var storeName in manifestStores) {
                var manifestStore = manifestStores[storeName];
                if (manifestStore.serviceRoot.indexOf('/') === 0) {
                    manifestStore.serviceRoot = fiori_client_appConfig.fioriURL + manifestStore.serviceRoot;
                }
            };

            return manifestStores;
        });
    },

    /*****************************************************
     * Perform store initialization
     *****************************************************/
    _setupStore: function(ctx, storeInfo, storeOptions) {
        var that = this;
        var deferred = jQuery.Deferred();

        var customHeaders = {
            'accept-language':sap.ui.getCore().getConfiguration().getLanguage()
        };

        var sapClient = jQuery.sap.getUriParameters().get("sap-client");
        if (sapClient) {
            customHeaders["sap-client"] = sapClient;
        }

        var properties = {
            name             : storeInfo.name,
            host             : ctx.serverHost,
            port             : ctx.serverPort === 0 ? (ctx.https ? 443 : 80) : ctx.serverPort,
            https            : ctx.https,
            serviceRoot      : storeInfo.serviceRoot,
            definingRequests : storeInfo.definingRequests,
            customHeaders    : customHeaders
        };

        function _storeOpenSuccess() {
            console.log("Offline store opened OK");

            sap.OData.applyHttpClient();

            this.stores[storeInfo.name] = store;

            deferred.resolve(store);
        }

        function _storeOpenFailure(e) {
            console.error("Failed to create offline store: "+ e);

            if (e && e.indexOf("BAD_ENCRYPTION_KEY") >= 0) {
                // Store might have been created with no encryption.
                store.store.open(function() {
                    // If store is not encrypted and has no queued items
                    // recreate with encryption.
                    store.store.getRequestQueueStatus(function(status) {
                        if  (status.isEmpty) {
                            that._recreateStore(store.store, storeOptions).done(jQuery.proxy(_storeOpenSuccess, that))
                                .fail(jQuery.proxy(_storeOpenFailure, that));
                        } else {
                            console.log("Pending items in store.");
                            _storeOpenSuccess();
                        }
                    }, function(e) {
                        console.log("Unable to determine queue status. " + e);
                        _storeOpenSuccess();
                    });
                }, function() {
                    console.error("Removing store with bad encryption key.");
                    that._recreateStore(store.store, storeOptions).done(jQuery.proxy(_storeOpenSuccess, that))
                        .fail(jQuery.proxy(_storeOpenFailure, that));
                });
            }
            else {
                deferred.reject({msg: "Failed to provision the local store: " + e});
            }
        }

        console.log("Creating offline store");

        var store = storeInfo;

        store.store = sap.OData.createOfflineStore(properties);

        // Listen for optional events
        store.store.onrequesterror = function(error) {
            console.error("Error occurred while sending offline modification(s) to server. " + error);
        };

        store.store.open(jQuery.proxy(_storeOpenSuccess, this), jQuery.proxy(_storeOpenFailure, this), storeOptions);

        console.log("Called store open ...");

        return deferred;
    },

    _recreateStore: function(store, storeOptions) {
        var d = $.Deferred();
        this._removeStore(store).done(function() {
            store.open(d.resolve, d.reject, storeOptions);
            console.log("Called store open ...");
        }).fail(d.reject);
        return d.promise();
    },

    _removeStore: function(store) {
        var d = $.Deferred();
        var clearStore = function() {
            store.clear(d.resolve, d.reject);
            console.log("Called store clear ...");
        };
        store.close(clearStore, clearStore);
        console.log("Called store close ...");
        return d.promise();
    },

    _getStoreEncryptionKey: function (success, failure) {
        var dataVaultKey = "storeEncryptionKey";
        var randomString = function (length) {
            var charset = "!@#$%^*()_+{}:?|,[]./~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var i;
            var result = "";
            if(window.crypto && window.crypto.getRandomValues) {
                var values = new Uint8Array(length);
                window.crypto.getRandomValues(values);
                for(i = 0; i < length; i++) {
                    result += charset[values[i] % charset.length];
                }
                return result;
            }
            else {
                return null;
            }
        };

        sap.Logon.get(function(storeEncryptionKey) {
            if (storeEncryptionKey === null) {
                storeEncryptionKey = randomString(64);

                if (storeEncryptionKey) {
                    sap.Logon.set(function() {
                        success(storeEncryptionKey);
                    }, failure, dataVaultKey, storeEncryptionKey);
                }
                else {
                    failure({msg: "Failed to generate encryption key"});
                }
            } else {
                success(storeEncryptionKey);
            }
        }, failure, dataVaultKey);
    }
};
