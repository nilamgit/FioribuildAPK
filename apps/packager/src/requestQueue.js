var request = require('request').defaults({ jar: true, forever: true}),
    path = require('path'),
    shell = require('shelljs'),
    fs = require('fs'),
    Q = require('q'),
    os = require('os'),
    crypto = require('crypto');

function RequestQueue(options, args) {
    this.ITEM_QUEUED = 0;
    this.ITEM_RUNNING = 1;
    this.options = options;
    this.args = args;
    this.maxQueueSize = options.maxReqs || 20;
    this.sapClient = options.sapClient || null;

    this._queue = [];
    this._active = 0;
    this.hits = 0;
    this.misses = 0;
    this.cacheable = !args.noCache;

    // create cache location
    if (this.cacheable) {
        var tmpDir = os.tmpdir();

        var key = options.hostname + ':' + options.port + ':' + options.username + ':' + options.password;
        var hash = crypto.createHash('md5').update(key).digest('hex');

        this._tmpDir = path.join(tmpDir, 'packager', hash);

        try {
            if (args.cleanCache) {
                shell.rm("-rf", this._tmpDir);
            } else if (args.cleanAppCache) {
                shell.rm("-rf", path.join(this._tmpDir, "sap", "bc", "ui5_ui5", "sap"));
            }
        } catch (e) {
            var error = new Error("Unable to clean cache: " + e);
            throw error;
        }
        
        try {
            shell.mkdir("-p", this._tmpDir);
            //console.log('TMP Dir: ' + this._tmpDir);
        } catch (e) {
            var error = new Error("Failed to create temp dir: " + shell.state);
            throw error;
        }
    }
}

    /**
     ** Remove item from queue and find next one to submit
     **/
RequestQueue.prototype._findNext = function (item) {
    // item remove from queue
    for (var idx in this._queue) {
        var el = this._queue[idx];
        if (el.path == item.path) {
            if (el.state != this.ITEM_RUNNING) {
                console.log('Warning: TODO strange, should not get here: '+item.path);
            }
            this._queue.splice(idx, 1);
            this._active--;
            // check to see if there is an item ready to go
            for (var idx2 = 0; this._active < this.maxQueueSize && idx2 < this._queue.length; idx2++) {
                var el = this._queue[idx2];
                if (el.state == this.ITEM_QUEUED) {
                    //console.log("load request from queue: "+ el.path);
                    this._sendRequest(el);
                }
            }
            break;
        }
    }
}

RequestQueue.prototype._checkIfCachedContent = function (item) {
    var tmpDir = this._tmpDir;
    var fullPath = path.join(tmpDir, item.path);
    try {
        var stat = fs.statSync(fullPath);
        this.hits++;
    } catch (e) {
        this.misses++;
        return false;
    }
    return true;
}

RequestQueue.prototype._getCachedContent = function (item) {
    var that = this;
    if (this._checkIfCachedContent(item)) {
        function cb (error, data) {
            if (!error) {
                item._deferred.resolve({
                    item: item,
                    response: data,
                    statusCode: 200,
	            headers: {},
                    isCached: true
                });
            } else {
                item._deferred.reject(error);
            }
            that._findNext(item);
        }
        
        var tmpDir = this._tmpDir;
        var fullPath = path.join(tmpDir, item.path);
        fs.readFile(fullPath, cb);
        return true;
    } else {
        return false;
    }
}

RequestQueue.prototype._setCachedContent = function (item, content) {
    var tmpDir = this._tmpDir;
    var fullPath = path.join(tmpDir, item.path);

    var index = fullPath.lastIndexOf(path.sep);
    if (index >= 0) {
        var prePath = fullPath.substring(0, index);
        shell.mkdir("-p", prePath);
    }

    function cb(error) {
    }

    fs.writeFile(fullPath, content, cb);
}

//when the response is received, the promise object in item.deferred will be resolved.
RequestQueue.prototype._sendRequest = function(item) {
//	console.log("RequestQueue sendRequest: "+ item.path);
    var that = this;

    this._active++;

    item.state = this.ITEM_RUNNING;
    item.method = item.method || "GET";

    // check cache ...
    if (this.cacheable && item.cacheable && this._getCachedContent(item)) {
        return;
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function startsWith(str, prefix) {
        return str.indexOf(prefix) === 0;
    }

    var path = item.path;
    if (this.sapClient) {
	if (path.indexOf('?') >= 0) {
	    path += "&sap-client="+this.sapClient;
	} else {
	    path += "?sap-client="+this.sapClient;
	}
    }

    var options = {
        url: (this.options.https ? "https" : "http") + "://" + this.options.hostname + ":" + this.options.port + path,
        auth: {
            user: this.options.username,
            pass: this.options.password,
            sendImmediately: false
        },
        strictSSL: this.options.rejectUnauthorized,
        method: item.method,
        headers: item.headers,
        body: item.body,
        encoding : null /* Force response data encoding as a Buffer instead of default UTF-8 */
    };

    if (options.proxyHost) {
        options.proxy = "http://" + options.proxyHost + ":" + options.proxyPort;
    }

    request(options, function(error, response, body) {
        if (error) {
            console.log("ERROR: Problem with request for path '" + item.path + "' : " + error);
            item._deferred.reject(error);
            that._findNext(item);
        }
        else {
            item._deferred.resolve({
                item: item,
                response: body,
                statusCode: response.statusCode,
                headers: response.headers
            });

            if (that.cacheable && item.cacheable && response.statusCode == 200) {
                that._setCachedContent(item, body);
            }

            that._findNext(item);
        }
    });
}

RequestQueue.prototype.add = function(item) {
    var deferred = Q.defer();
    item._deferred = deferred;
    item.state = this.ITEM_QUEUED;
    this._queue.push(item);
    if (this._active < this.maxQueueSize) {
        this._sendRequest(item);
    }
    return deferred.promise;
}

module.exports = RequestQueue;
