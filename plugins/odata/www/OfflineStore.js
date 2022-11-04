// 4.5.3
var exec = require('cordova/exec'),
    urlutil = require('cordova/urlutil');

/**
 * @class
 * @classdesc Provides methods for interacting with the offline OData store.
 * @memberof sap
 */
var OfflineStore = function (properties) {
    /**
     * The unique name of the store.
     * @type {String}
     * @readonly
     */
    this.name = null;

    /**
     * Identifies the root of an OData service.  This can be relative to the host and should be set to a backend connection name from the server.
     * @type {String}
     * @readonly
     */
    this.serviceRoot = null;

    /**
     * Object that contains the coverage of data as name value pairs. The names are arbitrary and used when performing
     * refreshes with subsets.  The values are OData URLs represent the coverage of data to be managed by the store.
     * @type {Object}
     * @readonly
     */
    this.definingRequests = {};

    /**
     * The host of the server.
     * @type {String}
     * @readonly
     */
    this.host = null;

    /**
     * The port of the server.
     * @type {Number}
     * @readonly
     */
    this.port = 80;

    /**
     * The URL suffix path to the server
     * @type {String}
     * @readonly
     */
    this.urlSuffix = null;

    /**
     * Whether to use HTTP or HTTPS.  Default is HTTP.
     * @type {Boolean}
     * @readonly
     */
    this.https = false;

    /**
     * Any additional stream parameters.
     * @type {String}
     * @readonly
     */
    this.streamParams = null;

    /**
     * Object that contains the headers to send as name value pairs.
     * @type {Object}
     * @readonly
     */
    this.customHeaders = {};

    /**
     * Object that contains the cookies to send as name value pairs.
     * @type {Object}
     * @readonly
     */
    this.customCookies = {};

    /**
     * If the OData Producer is able to support repeatable requests then enable use of this.
     * @type {Boolean}
     * @readonly
     */
    this.enableRepeatableRequests = false;

    /**
     * Specifies whether or not the backend server supports bind operations.
     * @type {Boolean}
     * @readonly
     */
    this.serverSupportsBind = true;

    /**
     * Specifies the maximum number of entities that can be returned in a single read request.
     * @type {Number}
     * @readonly
     */
    this.pageSize = -1;

    /**
     * The file system path to store the local data store.
     * If omitted a default location will be chosen.
     * To place the store on the SDCard for Android, add the Cordova file plugin and set the value for this property to `cordova.file.externalRootDirectory`.
     * The output from the toURL method on the DirectoryEntry object from the Cordova file plugin is a valid value.
     */
    this.storePath = null;

    /**
     * Called whenever the store state changes during the initialization and opening of the Offline Store.
     */
    this.onstatechanged = null;

    /**
     * Called once for each notification that is available while opening the store.
     */
    this.onnotification = null;

    /**
     * Called when a modification request fails against the OData producer.
     * This can be called multiple times during a single flush if there is a bunch of pending modifications.
     * @type {OfflineStore~requesterror}
     * @example
     * store.onrequesterror = function(error) {
     *    console.log("Error occurred while sending modification to server. " + error);
     * };
     */
    this.onrequesterror = null;

    /**
     * Once this value is turned to true, client would remove error archive request on requesting new data
     * @type {Boolean}
     * @readonly
     */
    this.enableIndividualErrorArchiveDeletion = false

    // Set the properties for the store.
    for (var i in properties) {
        if (typeof this[i] !== 'undefined' && properties.hasOwnProperty(i)) {
            this[i] = properties[i];
        }
    }

    // Correct types if required
    if (typeof this.port === 'string' || this.port instanceof String) {
        this.port = Number(this.port);
    }

    if (typeof this.https === 'string' || this.https instanceof String) {
        this.https = (this.https === "true") ? true : false
    }

    /**
     * Return path in format "/path"
     * @private
     */
    function formatPath(path) {
        if (path && path.indexOf("/") !== 0) {
            path = "/" + path;
        }

        if (path && path.lastIndexOf("/") === path.length - 1) {
            path = path.substring(0, path.length - 1);
        }

        return path ? path : "";
    }

    if (this.serviceRoot.indexOf("http://") === 0 || this.serviceRoot.indexOf("https://") === 0) {
        this.serviceUri = this.serviceRoot;
    } else {
        function isDefault(port) {
            return port === 80 || port === 443;
        }

        if (cordova.require("cordova/platform").id === "windows") {
            this.serviceUri = (this.https ? "https" : "http") + "://" + this.host + (isDefault(this.port) ? "" : (":" + this.port)) + formatPath(this.urlSuffix) + formatPath(this.serviceRoot);
        } else {
            this.serviceUri = (this.https ? "https" : "http") + "://" + this.host + ":" + this.port + formatPath(this.urlSuffix) + formatPath(this.serviceRoot);
        }
    }

    if (cordova.require("cordova/platform").id === "windows") {
        this.serviceUri = urlutil.makeAbsolute(this.serviceUri);
    }

    /**
     * Offline service root that can be used for media entry create requests.
     * This property will be set after the store has been opened.
     * @example
     * // !! Assumes media_file exists as a file input element in the DOM.
     * var file = document.getElementById("media_file").files[0];
     * var xhr = new XMLHttpRequest();
     * // Third paramenter (async) must always be true.
     * xhr.open("POST", store.offlineServiceRoot + "Drivers", true);
     * xhr.setRequestHeader("Accept", "application/json");
     * xhr.onreadystatechange = function() {
     *    if (xhr.readyState === 4) {
     *       if (xhr.status === 201) {
     *          console.log("Media Created");
     *       } else {
     *          console.log("Failed to create media");
     *       }
     *    }
     * }
     * xhr.send(file);
     */
    this.offlineServiceRoot = this.serviceUri + "/";
};

/**
 * Offline OData store opening states.
 * These states represent the major activities during initialization and opening of the Offline Store.
 * @readonly
 * @enum {number}
 */
OfflineStore.State = {
    /** The store has started to open */
    OPENING: 0,
    /** Initializing the resources for a new store. Not applicable on Windows */
    INITIALIZING: 1,
    /** Populating the store. */
    POPULATING: 2,
    /** Downloading the store. */
    DOWNLOADING: 3,
    /** The store has opened successfully */
    OPEN: 4,
    /** The store has been closed by the user while opening */
    CLOSED: 5
};

/**
 * Offline OData store notifications.
 * Notifications are hints to the application about the current state of the Offline Store.
 * They indicate that either a refresh or flush operation was previously interrupted and
 * may be recovered if performed again.
 * @readonly
 * @enum {number}
 */
OfflineStore.Notification = {
    /** The store was closed while performing a refresh.
     * It may be possible to continue the pending refresh by triggering a new refresh. */
    PENDING_REFRESH: 0,
    /** The store was closed while flushing the request queue.
     * It may be possible to continue the pending flush by triggering a new flush. */
    PENDING_FLUSH: 1
};

/**
 * Offline OData store progress states.
 * @readonly
 * @enum {number}
 */
OfflineStore.ProgressState = {
    /** Downloading offline store. */
    STORE_DOWNLOADING: 0,
    /** Refreshing offline store. */
    REFRESH: 1,
    /** Flushing request queue. */
    FLUSH_REQUEST_QUEUE: 2,
    /** Opening, Refreshing, FlusingRequestQueue progress is completed. */
    DONE: 3
};

/**
 * Offline store flush error callback.
 * @callback sap.OfflineStore~requesterror
 * @param {String} error - The error message.
 */

/**
 * Offline store success callback.
 * @callback sap.OfflineStore~success
 */

/**
 * Offline store error callback.
 * @callback sap.OfflineStore~error
 * @param {String} error - The error message.
 */

/**
 * Offline store progress callback.
 * @callback sap.OfflineStore~progress
 * @param {Object} progressStatus - This progress status contains updates from Offline Store during opening, refresh and flush request queue.
 * @param {number} progressStatus.bytesSent - Number of bytes sent to server
 * @param {number} progressStatus.bytesRecv - Number of bytes received from server
 * @param {number} progressStatus.fileSize - Store size in number of bytes
 * @param {sap.OfflineStore.ProgressState} progressStatus.progressState - Progress state
 */

/**
 * Opens the store.
 * The store will be available for offline access only after it is open successfully.
 * @memberof sap.OfflineStore
 * @function open
 * @instance
 * @param {sap.OfflineStore~success} success - Called when store successfully opens.
 * @param {sap.OfflineStore~error} error - Called when store fails to open.
 * @param {Object} [options] - Options used when opening the store object
 * @param {String} [options.storeEncryptionKey] - Key to use to encrypt the local data store.
 * @param {sap.OfflineStore~progress} [progress] - Called every time when there is an update while the store is being opened.
 */
OfflineStore.prototype.open = function (success, error, options, progress) {
    var self = this;

    var win = function (result) {
        // Store events share open success callback.
        if (result && result.event) {
            if (result.event === "progress") {
                if (progress) {
                    progress(result.message);
                }
            } else {
                var callback = "on" + result.event;
                if (self[callback]) {
                    self[callback](result.message);
                }
            }
        } else {
            if (result && result.offlineServiceRoot) {
                self.offlineServiceRoot = result.offlineServiceRoot;
            }

            // Remove old instance
            for (var i = 0; i < sap.OData.stores.length; i++) {
                if (self.name === sap.OData.stores[i].name) {
                    sap.OData.stores.splice(i, 1);
                }
            }

            sap.OData.stores.push(self);
            success();
        }
    };

    exec(win, error, 'OData', 'openOfflineStore', [self, options ? options : {}]);
};

/**
 * Closes the store and releases its resources.
 * Closing the store will attempt to interrupt any operation already occurring against
 * this store, and will block until the other operations have finished.
 * @memberof sap.OfflineStore
 * @function close
 * @instance
 * @param {sap.OfflineStore~success} success - Called when store successfully closes.
 * @param {sap.OfflineStore~error} error - Called when store fails to close.
 */
OfflineStore.prototype.close = function (success, error) {
    var that = this;

    var win = function () {
        var index = sap.OData.stores.indexOf(that);
        if (index > -1) {
            sap.OData.stores.splice(index, 1);
        }
        success();
    };

    exec(win, error, 'OData', 'close', [this.serviceUri]);
};

/**
 * Sends offline store to SMP/CPms server.
 * @memberof sap.OfflineStore
 * @function sendStore
 * @instance
 * @param {sap.OfflineStore~success} success - Called when send is finished.
 * @param {sap.OfflineStore~error} error - Called if send fails.
 */
OfflineStore.prototype.sendStore = function (success, error) {
    exec(success, error, 'OData', 'sendStore', [this.serviceUri]);
};

/**
 * Sends encrypted offline store to SMP/CPms server.
 * Only for iOS and Android platforms
 * @memberof sap.OfflineStore
 * @function sendEncryptedStore
 * @instance
 * @param {sap.OfflineStore~success} success - Called when send is finished.
 * @param {sap.OfflineStore~error} error - Called if send fails.
 * @param {string} encryptedKey - The encrypted Key
 */
OfflineStore.prototype.sendEncryptedStore = function (success, error, encryptedKey) {
    exec(success, error, 'OData', 'sendEncryptedStore', [this.serviceUri, encryptedKey]);
};

/**
 * Cancels the current flush.
 * @memberof sap.OfflineStore
 * @function cancelFlush
 * @instance
 * @param {sap.OfflineStore~success} success - Called when cancel flush operation succeeded.
 * @param {sap.OfflineStore~error} error - Called when cancel flush operation failed.
 */
OfflineStore.prototype.cancelFlush = function (success, error) {
    exec(success, error, 'OData', 'cancelFlush', [this.serviceUri]);
};

/**
 * Cancels all refreshes and file downloads including those that are pending.
 * This method will also cancel an initial download and file download if it is called while the store is opening for the first time.
 * @memberof sap.OfflineStore
 * @function cancelDownload
 * @instance
 * @param {sap.OfflineStore~success} success - Called when cancel download operation succeeded.
 * @param {sap.OfflineStore~error} error - Called when cancel download operation failed.
 */
OfflineStore.prototype.cancelDownload = function (success, error) {
    exec(success, error, 'OData', 'cancelDownload', [this.serviceUri]);
};

/**
 * Refreshes the store with the OData service.
 * The application must have network connectivity to perform this operation.
 * @memberof sap.OfflineStore
 * @function refresh
 * @instance
 * @param {sap.OfflineStore~success} success - Called when store is successfully refreshed.
 * @param {sap.OfflineStore~error} error - Called if store fails to refresh itself.
 * @param {Array} [subset] - List of the names of the defining requests to refresh.
 * @param {sap.OfflineStore~progress} [progress] - Called every time when there is an update while the store is being refreshed.
 */
OfflineStore.prototype.refresh = function (success, error, subset, progress) {
    var self = this;

    var win = function (result) {
        if (result && result.event) {
            if (result.event === "progress") {
                if (progress) {
                    progress(result.message);
                }
            }
        } else {
            success();
        }
    };

    exec(win, error, 'OData', 'refresh', [self.serviceUri, subset]);
};

/**
 * Removes the physical store from the filesystem. The store must be closed before clearing.
 * @memberof sap.OfflineStore
 * @function clear
 * @instance
 * @param {sap.OfflineStore~success} success - Called when store is successfully cleared.
 * @param {sap.OfflineStore~error} error - Called if store cannot be cleared.
 */
OfflineStore.prototype.clear = function (success, error) {
    exec(success, error, 'OData', 'clear', [this]);
};

/**
 * Starts sending pending modification requests to the server.
 * The application must have network connectivity to perform this operation.
 * @memberof sap.OfflineStore
 * @function flush
 * @instance
 * @param {sap.OfflineStore~success} success - Called when flush has finished.
 * @param {sap.OfflineStore~error} error - Called if error calling flush.
 * @param {sap.OfflineStore~progress} [progress] - Called every time when there is an update while the store is being flushed.
 */
OfflineStore.prototype.flush = function (success, error, progress) {
    var self = this;

    exec(function (result) {
        if (result && result.event) {
            if (result.event === "progress") {
                if (progress) {
                    progress(result.message);
                }
            } else {
                var callback = "on" + result.event;
                if (self[callback]) {
                    self[callback](result.message);
                }
            }
        } else {
            success();
        }
    }, error, 'OData', 'flush', [self.serviceUri]);
};

/**
 * Starts sending partial pending modification requests those defined with the categories to the server.
 * Only for iOS and Android platforms
 * The application must have network connectivity to perform this operation.
 * @memberof sap.OfflineStore
 * @function partialFlush
 * @instance
 * @param {sap.OfflineStore~success} success - Called when flush has finished.
 * @param {sap.OfflineStore~error} error - Called if error calling flush.
 * @param {array} [categories] - Partial categories to be flushed
 */
OfflineStore.prototype.partialFlush = function (success, error, categories) {
    exec(success, error, 'OData', 'partialFlush', [this.serviceUri, categories]);
};

/**
 * Offline store queue status success callback.
 * @callback sap.OfflineStore~successQueueStatus
 * @param {Object} [status] - Status for the request queue.
 * @param {String} [status.isEmpty] - True if request queue is empty.
 */

/**
 * Returns whether or not the there are any pending requests stored in the request queue that have
 * not yet been flushed.
 * @memberof sap.OfflineStore
 * @function getRequestQueueStatus
 * @instance
 * @param {sap.OfflineStore~successQueueStatus} success - Called with the status of the request queue.
 * @param {sap.OfflineStore~error} error - Called if there was an issue determining queue state.
 */
OfflineStore.prototype.getRequestQueueStatus = function (success, error) {
    exec(success, error, 'OData', 'getRequestQueueStatus', [this.serviceUri]);
};

/**
 * Registers a request to download an individual media stream.
 * The registered request must be the read link of the media entity (not the media stream).
 * You must refresh the store for the stream to be downloaded.  To download just the stream
 * call refresh with the subset parameter set to the name you registered the stream with.
 * @memberof sap.OfflineStore
 * @function registerStreamRequest
 * @instance
 * @param name an arbitrary and unique name associated with the defining request.
 * @param resourcePath the path to the media entity
 * @param {sap.OfflineStore~success} success - Called when registration is successful.
 * @param {sap.OfflineStore~error} error - Called if registraion fails.
 */
OfflineStore.prototype.registerStreamRequest = function (name, resourcePath, success, error) {
    exec(success, error, 'OData', 'registerStreamRequest', [this.serviceUri, name, resourcePath]);
};

/**
 * Unregisters a previously registered stream request
 *
 * @memberof sap.OfflineStore
 * @function unregisterStreamRequest
 * @instance
 * @param name The name of the request to unregister
 * @param {sap.OfflineStore~success} success - Called when unregistration is successful.
 * @param {sap.OfflineStore~error} error - Called if unregistraion fails.
 */
OfflineStore.prototype.unregisterStreamRequest = function (name, success, error) {
    exec(success, error, 'OData', 'unregisterStreamRequest', [this.serviceUri, name]);
};

module.exports = OfflineStore;
