/**
 **  CLI for packager
 **/

var shell = require('shelljs'),
    path = require('path'),
    fs = require('fs'),
    https = require('https'),
    RequestQueue = require('./requestQueue.js'),
    Q = require("q"),
    xml = require("xml2js"),
    prompt = require('prompt');

/**
 ** Constructor for Packager
 **
 **/
function Packager(args, config) {
    this.args = args;
    this.config = config;
    
    if (args && args.theme) {
        // Replace config theme with args one if provided
        this.config.theme = args.theme;
    }
}

/**
 ** Add libraries to set of UI5 libs
 **/
function addToUI5Libs(libsToAdd, ui5Libs, applications) {
    var idx, found, ui5Lib;
    var added = [];

    for (ui5Lib in libsToAdd) {
        // check if this is already in our list of libs or components
        found = false;
        for (idx in ui5Libs) {
            if (ui5Lib == ui5Libs[idx]) {
                found = true;
                break;
            }
        }
        // check if it might be a reuse component in our component list
        // NOTE: we have our full set of components by now so the dependency is either
        // a new lib to be added or an existing component or lib we can ignore
        if (applications) {
            for (idx in applications) {
                if (ui5Lib == applications[idx].id) {
                    found = true;
                    break;
                }
            }
        }

        // we didn't find it - add it
        if (!found) {
            ui5Libs.push(ui5Lib);
            added.push(ui5Lib);
        }
    }

    return added;
}

/**
 ** Download all a set of resources from the FES
 **/
Packager.prototype.getResources = function(resourceArr, appInfo, skipMerged, requestContext) {
    var that = this;

    for (var idx in resourceArr) {
        var resource = resourceArr[idx];
        // Skip debug files if we are not downloading debug sources ...
        if (!this.args.debugSource && resource.isDebug) {
            continue;
        }
        if (skipMerged && resource.merged && (!(resource.name == '../../../sap-ui-core.js') &&
                                              !(this.args.debugSource && resource.name == '../../../sap-ui-core-dbg.js') &&
                                              !(resource.name == 'library-preload.json') &&
                                              !(resource.name == 'library-preload.js'))) {
            continue;
        }

        // Skip any design time resources
        if (resource.designtime) {
            continue;
        }

        var requestDeferred = Q.defer();  // the content of the fecth
        this.allResources.push(requestDeferred.promise);

        var item = {
            path: appInfo.url + '/' + resource.name,
            targetPath: this.targetWWWPath,
            baseUrl: appInfo.localUrl || appInfo.url,
            resource: resource.name,
            cacheable: true
        };

        if (this.args.verbose) {
            console.log("INFO: getResources: download resource: " + requestContext + "/component:" + appInfo.id + " /resource:" + item.resource);
        }

        this.queue.add(item).then(function(deferred, o) {
            if (o.statusCode == 401) {
                console.log("ERROR: getResources: Access to item is unauthorised: " + requestContext + "/component:" + appInfo.id + " /resource:" + o.item.resource);
                deferred.reject(new Error("Access to item is unauthorised: " + requestContext + "/component:" + appInfo.id + " /resource:" + o.item.resource));
                return;
            }
            if (o.statusCode == 404) {
                console.log("WARNING: getResources: Item not found: " + requestContext + "/component:" + appInfo.id + " /resource:" + o.item.resource);
                deferred.resolve(); // we accept this
                return;
            }
            if (o.statusCode != 200) {
                console.log("ERROR: getResources: Unexpected error accessing resource [" + o.statusCode + "]: " + requestContext + "/component:" + appInfo.id + " /resource:" + o.item.resource);
                deferred.reject(new Error("Unexpected error accessing resource [" + o.statusCode + "]: " + requestContext + "/component:" + appInfo.id + " /resource:" + o.item.resource));
                return;
            }

            // received the actual resource file
            that.createResource(o.item, o.response, requestContext).then(function () {
                deferred.resolve();
            }, function (e) {
                deferred.reject(e);
            });
        }.bind(null, requestDeferred), function(deferred, rejectReason) {
            console.log("ERROR: getResources: attempt to fetch item failed [" + rejectReason + "]: " + requestContext + "/component:" + appInfo.id);
            deferred.reject(rejectReason);
        }.bind(null, requestDeferred));
    }
}

/**
 ** Find Resources for BSP app using Team Provider API
 **/
Packager.prototype.findResourcesForBSP = function(object, resources) {
    var that = this;
    var deferred = Q.defer();

    var item = {
        path: '/sap/bc/adt/filestore/ui5-bsp/objects/' + object + '/content'
    };

    this.queue.add(item).then(function(deferred, o) {
        if (o.statusCode != 200) {
            deferred.reject(new Error('Unexpected response received when retrieving information for BSP object ' + object + ': [' + o.statusCode + ']'));
            return;
        }

        //console.log('Status: ' + o.statusCode);
        //console.log('Body:\n' + o.response);

        xml.parseString(o.response, function(err, result) {
            if (!err) {
                //console.log(result);

                var adtPromises = [];
                var atomFeed = result["atom:feed"];
                var atomEntries = atomFeed["atom:entry"];
                for (var e in atomEntries) {
                    var entry = atomEntries[e];
                    var content = entry["atom:content"][0];
                    var title = entry["atom:title"][0];
                    var id = entry["atom:id"][0];
                    var category = entry["atom:category"][0];
                    var objectType = category['$']['term']
                    //console.log(indent + ">>>> " + title +  ' ['+id+'] ' +  ' - '  + objectType);

                    if (objectType === 'folder') {
                        adtPromises.push(that.findResourcesForBSP(id, resources));
                    } else {
                        var resource = title.substring(title.indexOf('/')+1);
                        // add to resources list in a way that is compatible with the resources.json format
                        resources.push({
                            "name": resource,
                            "merged": false,
                            "isDebug": (title.indexOf('-dbg.js') >= 0)
                        });
                    }
                }

                Q.allSettled(adtPromises).then(function() {
                    deferred.resolve();
                }, function(e) {
                    deferred.reject(e);
                });

            } else {
                console.log("ERROR: Failed to parse response details for BSP object " + object + ": [" + err + "]");
                deferred.reject(err);
            }
        });

    }.bind(null, deferred), function(deferred, rejectReason) {
        deferred.reject(rejectReason);
    }.bind(null, deferred));

    return deferred.promise;
}

/**
 ** Create resource in local file system
 **/
Packager.prototype.createResource = function(item, content, requestContext) {
    if (this.args.verbose) {
        console.log("INFO: createResource: " + requestContext + "/createResource:" + item.baseUrl + '/' + item.resource);
    }

    var promises = [];

    promises.push(createFile(path.join(item.targetPath, item.baseUrl, item.resource), content));
    if (item.copyTo) {
        promises.push(createFile(path.join(item.targetPath, item.baseUrl, item.copyTo), content));
    }

    return Q.all(promises);
}

var dirsCreated = {};  // maintain a list of directories we have created ...

function createFile(fullPath, content) {
    var deferred = Q.defer();

    var index = fullPath.lastIndexOf(path.sep);
    if (index >= 0) {
        var prePath = fullPath.substring(0, index);
        if (!dirsCreated[prePath]) {
            shell.mkdir("-p", prePath);
            dirsCreated[prePath] = prePath;
        }
    }

    function cb(error) {
        if (error) {
            console.log("ERROR: createFile: Unable to create file at '"+fullPath+"': " + error);
            deferred.reject(error);
        } else {
            deferred.resolve();
        }
    }

    fs.writeFile(fullPath, content, cb);

    return deferred.promise;
}

function getLibInfo(lib, basePath) {
    if (!basePath) {
        basePath = "/sap/bc/ui5_ui5/ui2/ushell";
    }

    libInfo = {
        url: basePath + "/resources/" + lib.replace(/\./g, '/'),
        localUrl: "resources/" + lib.replace(/\./g, '/'),
        id: lib
    };

    return libInfo;
}

/**
 ** Handle Library Manifest file
 **/
function processLibraryManifestResponse(deferred, libInfo, requestContext, o) {
    var ui5Libs = null;
    if (o.statusCode == 401) {
        console.log("ERROR: getLibrary: Unauthorized access for manifest file: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path);
        deferred.reject(new Error("Unauthorized access for manifest file: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path));
        return;
    }
    if (o.statusCode == 404) {
        console.log("WARNING: getLibrary: Manifest file not found: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path);
        // get the list from the local config (if present)
        var foundManifest = false;
        for (var i in this.packagerConfig.libraries) {
            var libDetail = this.packagerConfig.libraries[i];
            if (libDetail.id == o.item.x) {
                ui5Libs = libDetail.manifest["sap.ui5"].dependencies.libs;
                if (this.args.verbose) console.log("INFO: getLibrary: Manifest file not found, load from package config instead: " + requestContext + "/library:" + o.item.x);
                foundManifest = true;

                break;
            }
        }
        if (!foundManifest) {
            console.log("ERROR: getLibrary: No manifest details for library: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path);
            deferred.reject(new Error("No manifest details for library: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path));
            return;
        }
        // fall through to below ...
    } else if (o.statusCode != 200) {
        console.log("ERROR: getLibrary: Unexpected error accessing the manifest file ["+o.statusCode+"]: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path);
        deferred.reject(new Error("Unexpected error accessing the manifest file ["+o.statusCode+"]: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path));
        return;
    } else {
        try {
            ui5Libs = JSON.parse(o.response)["sap.ui5"].dependencies.libs;
        } catch (e) {
            console.log("ERROR: getLibrary: Error parsing manifest file [" + e + "]: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path);
            deferred.reject(new Error("Error parsing manifest file [" + e + "]: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path));
            return;
        }
    }

    var dependentLibManifestPromises = [];
    if (!ui5Libs) {
        console.log("WARNING: getLibrary: No dependent UI5 lib available for " + requestContext + "/library:" + o.item.x);
    } else {
        var added = addToUI5Libs(ui5Libs, this.allUI5Libs, null);

        for (var idx in added) {
            var ui5Lib = added[idx];
            if (this.args.verbose) console.log("INFO: getLibrary: Get dependent ui5 library: " + requestContext + "/library:" + o.item.x + " /lib:" + ui5Lib)

            var libInfoInner = getLibInfo(ui5Lib, this.applications[0].url);

            dependentLibManifestPromises.push(this.getLibrary(libInfoInner, requestContext + "/library:" + o.item.x));
        }
    }

    if (this.args.verbose) console.log("INFO: getLibrary: " + requestContext + "/library:" + o.item.x);
    Q.all(dependentLibManifestPromises).then(function() {
        deferred.resolve();
    }, function(e) {
        deferred.reject(e);
    });
}

/**
 ** Handle Library Preload JSON file
 **/
function processLibraryPreloadResponse(deferred, libInfo, resources, requestContext, o) {
    if (o.statusCode != 200) {
        console.log("ERROR: getLibrary: Unable to retrieve library-preload.json: /component:" + libInfo.id + " /resource:" + o.item.resource);
        deferred.reject(new Error("Unable to retrieve library-preload.json: /component:" + libInfo.id + " /resource:" + o.item.resource));
        return;
    }

    try {
        var preloadJson = JSON.parse(o.response);
    } catch (e) {
        console.log("ERROR: getLibrary: Unable to parse library-preload.json ["+e+"]: /component:" + libInfo.id + " /resource:" + o.item.resource);
        deferred.reject(new Error("Unable to parse library-preload.json ["+e+"]: /component:" + libInfo.id + " /resource:" + o.item.resource));
        return;
    }

    this.createResource(o.item, o.response, " /component:" + libInfo.id).then(function () {
    }, function (e) {
        console.log("ERROR: getLibrary: Unable to create library-preload.json ["+e+"]: /component:" + libInfo.id + " /resource:" + o.item.resource);
        deferred.reject(new Error("Unable to create library-preload.json ["+e+"]: /component:" + libInfo.id + " /resource:" + o.item.resource));
        return;
    });

    var modules = preloadJson.modules;
    for (var idx in modules) {
        var module = modules[idx];
        var requestDeferred = Q.defer();

        this.allResources.push(requestDeferred.promise);

        this.createResource({targetPath:this.targetWWWPath, baseUrl:"resources/", resource: idx}, module, " /component:" + libInfo.id).then(function (deferred) {
            deferred.resolve();
        }.bind(null, requestDeferred), function (deferred, e) {
            deferred.reject(e);
        }.bind(null, requestDeferred));
    }

    var resourceArr = [];
    // remove all the JS files etc. we got in the preload json file from the resources array
    var libPrefix = libInfo.id.replace(/\./g, '/');
    for (var idx in resources.resources) {
        var resource = resources.resources[idx];
        // is this in the now copied preload list?
        var found = false;
        for (var idx2 in modules) {
            if ((libPrefix + '/' + resource.name) === idx2) {
                found = true;
                break;
            }
        }
        if (!found) {
            resourceArr.push(resource);
        }
    }

    this.getResources(resourceArr, libInfo, true, requestContext);

    deferred.resolve();
}

/**
 ** Handle Library Preload JS file
 **/
function processLibraryPreloadJSResponse(deferred, libInfo, resources, requestContext, o) {
    if (o.statusCode != 200) {
        console.log("ERROR: getLibrary: Unable to retrieve library-preload.js: /component:" + libInfo.id + " /resource:" + o.item.resource);
        deferred.reject(new Error("Unable to retrieve library-preload.js: /component:" + libInfo.id + " /resource:" + o.item.resource));
        return;
    }

    this.createResource(o.item, o.response, " /component:" + libInfo.id).then(function () {
    }, function (e) {
        console.log("ERROR: getLibrary: Unable to create library-preload.js ["+e+"]: /component:" + libInfo.id + " /resource:" + o.item.resource);
        deferred.reject(new Error("Unable to create library-preload.js ["+e+"]: /component:" + libInfo.id + " /resource:" + o.item.resource));
        return;
    });
    
    var modules = [];
    // To get all preload included resources file from resources.json when the library-preload.js has been downloaded successfully and 'withPreloadIncluded' is false
    if (o.response.length > 0 && !this.args.withPreloadIncluded) {
        // Get all included resources files names for library-preload.js according to the resources.json
        for (var idx in resources.resources) {
            if (resources.resources[idx].name === o.item.resource) {
                modules = resources.resources[idx].included;
                break;
            }
        }
    } 
    
    var resourceArr = [];
    // remove all the JS files etc. we got in the preload js file from the resources array
    var libPrefix = libInfo.id.replace(/\./g, '/');
    for (var idx in resources.resources) {
        var resource = resources.resources[idx];
        var found = false;
        for (var idx2 in modules) {
            if (resource.module === modules[idx2] || (libPrefix + '/' + resource.name) === modules[idx2]) {
                found = true;
                break;
            }
        }
        // Skip 'library-preload.json' and 'library-preload.js' as the 'library-preload.js' has been here.
        if (!found && resource.name != "library-preload.json" && resource.name != "library-preload.js") {
            resourceArr.push(resource);
        }
    }
    
    this.getResources(resourceArr, libInfo, true, requestContext);

    deferred.resolve();
}

/**
 ** Handle library
 **/
function processLibraryResourcesResponse(deferred, libInfo, requestContext, o) {
    var that = this;
    var resources = {};
    if (o.statusCode == 401) {
        console.log("ERROR: getLibrary: Unauthorised access for resource: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path);
        deferred.reject(new Error("Unauthorised access for resource: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path));
        return;
    }
    if (o.statusCode == 404) {
        console.log("WARNING: getLibrary: Resources list not found: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path);
        // get the list from the local config (if present)
        for (var i in this.packagerConfig.libraries) {
            var libDetail = this.packagerConfig.libraries[i];
            if (libDetail.id == libInfo.id) {
                resources.resources = libDetail.resources;
                break;
            }
        }
        if (!resources.resources) {
            for (var i in this.config.resources) {
                var detail = this.config.resources[i];
                if (detail.id == libInfo.id) {
                    resources.resources = detail.resources;
                    break;
                }
            }
            if (!resources.resources) {
                console.log("ERROR: getLibrary: Failed to find any resources: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path);
                deferred.reject(new Error("Failed to find any resources: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path));
                return;
            }
            // fall through to the resource analysis below
        }
    } else if (o.statusCode != 200) {
        console.log("ERROR: getLibrary: Unexpected error accessing resource ["+o.statusCode+"]: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path);
        deferred.reject(new Error("Unexpected error accessing resource ["+o.statusCode+"]: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path));
        return;
    } else {
        // received the resources.json
        try {
            resources = JSON.parse(o.response);
        } catch (e) {
            console.log("ERROR: getLibrary: Failed to parse resources.json [" + e + "]: " + requestContext + "/library:" + o.item.x + " /path:" + o.item.path);
            deferred.reject(e);
            return;
        }
    }

    // we're happy with the content of the resources ...
    if (!resources.resources) {
        console.log("WARNING: getLibrary: Could not find resources for " + requestContext + "/library:" + o.item.x);
        deferred.resolve();
        return;
    }

    // The manifest file sometimes does not report the theme we want as
    // supported.  This can resolve to the base theme or to the actual theme
    // even though the server said it was not supported.
    var defaultTheme = this.config.theme ? this.config.theme : "sap_bluecrystal";
    // We always want to download blue crystal
    var requiredThemes = defaultTheme !== "sap_bluecrystal" ? [defaultTheme, "sap_bluecrystal"] : [defaultTheme];
    var additionalResources = [];
    // Check resources for theme related files and make sure we have the required ones
    for (idx in resources.resources) {
        var resource = resources.resources[idx];
        var themesIdx = resource.name.indexOf("themes/base/");
        if (themesIdx >= 0) {
            requiredThemes.forEach(function(theme) {
                var file = resource.name.substring(0, themesIdx) + "themes/" + theme + "/" + resource.name.substring(themesIdx + 12); // the non-theme specific name
                var skip = false;
                for (var idx2 in resources.resources) {
                    var resource2 = resources.resources[idx2];
                    if (resource2.name === file) {
                        skip = true;
                        break;
                    }
                }
                if (!skip) {
                    var missingResource = JSON.parse(JSON.stringify(resource));
                    missingResource.name = file;
                    missingResource.theme = theme;
                    additionalResources.push(missingResource);
                }
            });
        }
    }

    // Download any missing theme files
    if (additionalResources.length > 0) {
        resources.resources = resources.resources.concat(additionalResources);
    }

    // The 'library-preload.json' was removed from UI5 1.67. The 'library-preload.js' should be downloaded
    var downloadPreloadJS = false;
    if (this.args.preload) {
        for (var idx in resources.resources) {
            if (resources.resources[idx].name === 'library-preload.js') {
                // we remove all the js files from the resources list
                downloadPreloadJS = true;
                break;
            }
        }
    }

    // if the resources list includes a library-preload.json, download it but don't download the contained JS files.
    var downloadPreload = false;
    // Try to download the library-preload.json if there is no library-preload.js
    if (this.args.preload && !downloadPreloadJS) {
        for (var idx in resources.resources) {
            if (resources.resources[idx].name === 'library-preload.json') {
                // we remove all the js files from the resources list
                downloadPreload = true;
                break;
            }
        }
    }
    
    if (downloadPreloadJS) {
        var preloadItem = {
            path: libInfo.url + '/library-preload.js',
            targetPath: this.targetWWWPath,
            baseUrl: libInfo.localUrl,
            resource: "library-preload.js",
            cacheable: true
        };

        this.queue.add(preloadItem).then(processLibraryPreloadJSResponse.bind(this, deferred, libInfo, resources, requestContext), function (deferred, rejectReason) {
            deferred.reject(rejectReason);
        }.bind(this, deferred));
    } else if (downloadPreload) {
        var preloadItem = {
            path: libInfo.url + '/library-preload.json',
            targetPath: this.targetWWWPath,
            baseUrl: libInfo.localUrl,
            resource: "library-preload.json",
            cacheable: true
        };

        this.queue.add(preloadItem).then(processLibraryPreloadResponse.bind(this, deferred, libInfo, resources, requestContext), function (deferred, rejectReason) {
            deferred.reject(rejectReason);
        }.bind(this, deferred));
    } else {
        this.getResources(resources.resources, libInfo, true, requestContext);
        deferred.resolve();
    }
}

/**
 ** Get library from FES
 ** the first request gets library manifest.json which contains the dependent libraries
 ** the second request gets resources.json, which contains each resource items
 **/
Packager.prototype.getLibrary = function(libInfo, requestContext) {
    if (this.args.verbose) console.log("INFO: getLibrary: " + requestContext + "/library:" + libInfo.id);

    var that = this;
    var libManifestDeferred = Q.defer();
    var item = {
        x: libInfo.id,
        path: libInfo.url + '/manifest.json',
        targetPath: this.targetWWWPath,
        cacheable: true
    };

    if (this.args.verbose) console.log("INFO: getLibrary: Request manifest: " + requestContext + "/library:" + item.x + " /path:" + item.path);

    this.queue.add(item).then(processLibraryManifestResponse.bind(this, libManifestDeferred, libInfo, requestContext), function(deferred, rejectReason) {
        console.log("ERROR: getLibrary: Fetch of manifest.json failed [" + rejectedReason + "]: " + requestContext + "/library:" + libInfo.id);
        deferred.reject(rejectReason);
    }.bind(this, libManifestDeferred));

    var libResourcesDeferred = Q.defer();   // used to validate the actual content
    this.libResourcePromises.push(libResourcesDeferred.promise);

    var libResourcesItem = {
        x: libInfo.id,
        path: libInfo.url + '/resources.json',
        cacheable: true
    }
    
    this.queue.add(libResourcesItem).then(processLibraryResourcesResponse.bind(this, libResourcesDeferred, libInfo, requestContext), function(deferred, rejectReason) {
        console.log("ERROR: getLibrary: Failed to fetch resources.json [" + rejectReason + "]: " + requestContext + "/library:" + libInfo.id);
        deferred.reject(rejectReason);
    }.bind(this, libResourcesDeferred));

    return libManifestDeferred.promise;
}

/**
 ** Handle the AppIndex Query response
 **/
function processAppIndexResponse(deferred, app, requestContext, o) {
    //console.log("getAppInfo response: "+ o.statusCode + " for getAppInfo: " + requestContext + "/app:" + app.id );
    if (o.statusCode == 401) {
        console.log("ERROR: getAppInfo: Unauthorised access to application details API: " + requestContext + "/app:" + app.id);
        deferred.reject(new Error("Unauthorised access to application details API: " + requestContext + "/app:" + app.id));
        return;
    }
    if (o.statusCode == 404) {
        if (o.item.path.substring(0, 12) == "/sap/bc/ui2/") {
            // retry with older API (without the ui2 piece)

            var appInfoItem2 = {
                path: '/sap/bc/app_index/ui5_app_info?id=' + app.id
            }

            this.queue.add(appInfoItem2).then(processAppIndexResponse.bind(this, deferred, app, requestContext), function(deferred, e) {
                console.log("ERROR: getAppInfo: Unable to retrieve application details [" + e + "]: " + requestContext + "/app:" + app.id);
                deferred.reject(new Error("Unable to retrieve application details: " + e));
            }.bind(this, deferred));

            return;
        }

        console.log("ERROR: getAppInfo: Application details API not present: " + requestContext + "/app:" + app.id);
        deferred.reject(new Error("Application details API not present: " + requestContext + "/app:" + app.id));
        return;
    } else if (o.statusCode != 200) {
        console.log("ERROR: getAppInfo: Unexpected error accessing application details API ["+o.statusCode+"]: " + requestContext + "/app:" + app.id);
        deferred.reject(new Error("Unexpected error accessing application details API ["+o.statusCode+"]: " + requestContext + "/app:" + app.id));
        return;
    }

    // received the app info
    try {
        var appInfos = JSON.parse(o.response);
    } catch (e) {
        console.log('ERROR: getAppInfo: Failed to parse application details response [' + e + ']: ' + requestContext + "/app:" + app.id);
        deferred.reject(new Error("Failed to parse application details response [" + e + "]"));
        return;
    }

    // locate the app we want
    if (!appInfos) {
        console.log("ERROR: getAppInfo: Unable to locate any information in application details API response: " + requestContext + "/app:" + app.id);
        deferred.reject(new Error("Unable to locate any information in application details API response: " + requestContext + "/app:" + app.id));
        return;
    }

    var appInfo = appInfos[app.id];
    if (!appInfo) {
        console.log("ERROR: getAppInfo: Unable to find details of application in application details API response: " + requestContext + "/app:" + app.id);
        deferred.reject(new Error("Unable to find details of application in application details API response: " + requestContext + "/app:" + app.id));
        return;
    }

    var dependencies = appInfo.dependencies;
    for (var idx in dependencies) {
        var dependency = dependencies[idx];

        if (dependency.error && dependency.error !== false) {
            console.log("WARNING: getAppInfo: Dependency '" + dependency.id + "' shows as error: " + requestContext + "/app:" + app.id + " - ignoring");
            continue;
        }

        if (dependency.type != "UI5LIB" && dependency.type != "UI5COMP") {
            console.log("WARNING: getAppInfo: Dependency '" + dependency.id + "' shows as type '" + dependency.type + "': " + requestContext + "/app:" + app.id + " - ignoring");
            continue;
        }

        if (dependency.url && dependency.url.length > 0) {
            // check to see if the component is already noted, else add
            var found = false;
            for (var idx in this.applications) {
                if (this.applications[idx].id == dependency.id) {
                    this.applications[idx].url = dependency.url;  // remember the url
                    found = true;
                    break;
                }
            }
            if (!found) {
                var appInfo = {
                    id: dependency.id,
                    url: dependency.url,
                    reuse: true   // it must be reuse component as it's not in our app list so it will be hidden
                }
                this.applications.push(appInfo);
            }
        }
    }

    deferred.resolve();
}

/**
 ** Get the app's ui5_app_info in json format,
 ** /sap/bc/ui2/app_index/ui5_app_info?id=nw.epm.refapps.lib.reuse
 ** for returned library, if ending with reuse, then getappInfo to get the reuse app
 ** for returned component, call getComponent to get the component

 ** sample response:
 ** {
 ** 	"nw.epm.refapps.shop":{
 **
 ** 		"dependencies":[
 ** 			{"id":"nw.epm.refapps.shop","type":"UI5COMP","url":"/sap/bc/ui5_ui5/sap/epm_ref_shop","error":false},
 ** 			{"id":"sap.ca.scfld.md","type":"UI5COMP","url":"","error":false},
 ** 			{"id":"nw.epm.refapps.lib.reuse","type":"UI5LIB","url":"/sap/bc/ui5_ui5/sap/epm_ref_lib","error":false},
 ** 			{"id":"sap.m","type":"UI5LIB","url":"","error":false},
 ** 			{"id":"sap.ui.core","type":"UI5LIB","url":"","error":false},
 ** 			{"id":"sap.me","type":"UI5LIB","url":"","error":false},
 ** 			{"id":"sap.ui.commons","type":"UI5LIB","url":"","error":false},
 ** 			{"id":"sap.ui.comp","type":"UI5LIB","url":"","error":false},
 ** 			{"id":"sap.ui.table","type":"UI5LIB","url":"","error":false},
 ** 			{"id":"sap.ushell","type":"UI5LIB","url":"","error":false}
 ** 		],
 ** 		"error":false
 ** 	}
 ** }
 **
 **/
Packager.prototype.getAppInfo = function(app, requestContext) {
    if (this.args.verbose) console.log("INFO: getAppInfo: " + requestContext + "/app:" + app.id);

    var that = this;

    //deferred promise is resolved when all libraries and components belong to this application are downloaded
    var deferred = Q.defer();

    if (!app.reuse) {
        app.reuse = false;
        app.root = true;
    } else {
        app.reuse = true;
        app.root = false;
    }

    //if application url is specified in the appconfig.js then directly get component for the app without requesting it from front end server
    if (app.url) {
        var hidden = false;
        if (app.reuse) {
            hidden = true;
        }
        if (this.args.verbose) console.log("INFO: getAppInfo: download component based app url from appconfig.js " + requestContext + "/app:" + app.id);

        deferred.resolve();
    } else {
        var appInfoItem = {
            path: '/sap/bc/ui2/app_index/ui5_app_info?id=' + app.id
        }
        that.queue.add(appInfoItem).then(processAppIndexResponse.bind(this, deferred, app, requestContext), function(deferred, e) {
            console.log("ERROR: getAppInfo: Unable to retrieve application details [" + e + "]: " + requestContext + "/app:" + app.id);
            deferred.reject(new Error("Unable to retrieve application details [" + e + "]: " + requestContext + "/app:" + app.id));
        }.bind(this, deferred));
    }

    return deferred.promise;
}

/**
 ** Handle response from fetch of manifest for component
 **/
function processComponentManifestResponse(deferred, appInfo, requestContext, o) {
    // received the manifest.json
    if (o.statusCode == 401) {
        console.log("ERROR: getComponent: Unauthorised access for manifest: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path);
        deferred.reject(new Error("Unauthorised access for manifest: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path));
        return;
    }
    if (o.statusCode == 404) {
        // No manifest file ...
        console.log("WARNING: getComponent: Manifest not found: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path);

        if (this.args.verbose) console.log("INFO: getComponent: Using provided configuration data (" + JSON.stringify(appInfo) + "): " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path);

        // ensure we have these libs added
        addToUI5Libs(appInfo.libs, this.allUI5Libs, null);
        //addToUI5Libs({"sap.uxap":{}, "sap.uiext.inbox":{}, "sap.ui.ux3":{}, "sap.ui.commons":{}}, libs, null);

        deferred.resolve();
        return;
    }
    if (o.statusCode != 200) {
        console.log("ERROR: getComponent: Unexpected error accessing manifest ["+o.statusCode+"]: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path);
        deferred.reject(new Error("Unexpected error accessing manifest ["+o.statusCode+"]: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path));
        return;
    }

    var ui5Libs = null;

    // if (args.verbose) console.log("Downloaded [" + o.item.path + "]");

    try {
        var content = o.response;
        var manifestData = JSON.parse(content);
        if (manifestData["sap.ui5"]) {
            ui5Libs = manifestData["sap.ui5"].dependencies.libs;
        }

        // set application title based on manifest file
        if (!appInfo.title && manifestData["sap.app"] && manifestData["sap.app"].title) {
            appInfo.title = manifestData["sap.app"].title;
            if (manifestData["sap.app"].i18n) {
                appInfo.i18n = manifestData["sap.app"].i18n;
            }
        }

        // set application icon based on manifest file
        if (!appInfo.icon && manifestData["sap.ui"] && manifestData["sap.ui"].icons && manifestData["sap.ui"].icons["icon"]) {
            appInfo.icon = manifestData["sap.ui"].icons["icon"];
        }

        // set the scenario and store info in the app detail
        if (manifestData["sap.mobile"]) {
            if (manifestData["sap.mobile"].scenario) {
                appInfo.scenarioInit = manifestData["sap.mobile"].scenario;
            }
        }
    } catch (e) {
        console.log("ERROR: getComponent: Error parsing manifest [" + e + "]: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path);
        deferred.reject(new Error("Error parsing manifest [" + e + "]: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path));
        return;
    }

    if (!ui5Libs) {
        console.log("WARNING: getComponent: Could not find any ui5 dependent libraries: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path);
    } else {
        addToUI5Libs(ui5Libs, this.allUI5Libs, this.applications);
    }

    if (this.args.verbose) console.log("INFO: getComponent: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path);

    deferred.resolve();
}

/**
 ** Handle Cojmponent resources.json response
 **/
function processComponentResourcesResponse(deferred, appInfo, requestContext, o) {
    if (o.statusCode == 401) {
        console.log("ERROR: getComponent: Unauthorised access for resources file: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path);
        deferred.reject(new Error("Unauthorised access for resources file: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path));
        return;
    }

    if (o.statusCode == 404) {
        console.log("WARNING: getComponent: Resources file not found: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path);
        var resourceArr = [];
        var bspName = appInfo.url.substring(appInfo.url.lastIndexOf('/') + 1);
        var that = this;
        this.findResourcesForBSP(bspName, resourceArr).done(function() {
            that.getResources(resourceArr, appInfo, false, requestContext);
            deferred.resolve();
        }, function (e) {
            console.log("ERROR: getComponent: Failed to find resources [" + e + "]: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path);
            deferred.reject(e);
        });
        return;
    }

    if (o.statusCode != 200) {
        console.log("ERROR: getComponent: Unexpected error accessing resources file ["+o.statusCode+"]: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path);
        deferred.reject(new Error("Unexpected error accessing resources file ["+o.statusCode+"]: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path));
        return;
    }

    var resources = {};
    // received the resources.json
    try {
        resources = JSON.parse(o.response);
    } catch (e) {
        console.log("WARNING: Error parsing resources file: " + e);
    }

    if (!resources || !resources.resources) {
        console.log("ERROR: getComponent: Could not find resources: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path);
        deferred.reject(new Error("Could not find resources: " + requestContext + "/component:" + appInfo.id + " /path:" + o.item.path));
        return;
    }

    this.getResources(resources.resources, appInfo, false, requestContext);

    deferred.resolve();
}

/**
 ** Get component from FES.
 ** component manifest file: "/sap/bc/ui5_ui5/sap/epm_ref_shop/manifest.json".
 ** manifest.json is app descriptor. The handler of manifest.json will save the manifest.json file and then
 ** add all dependent library into libs collection, so they will be downloaded later by getLibrary method
 **
 ** component resource file: "/sap/bc/ui5_ui5/sap/epm_ref_shop/resources.json"
 ** resouces.json contains all the resouce items and the handler of resources.json will download and save each
 ** resource item
 **
 **/
Packager.prototype.getComponent = function(appInfo, requestContext) {
    if (this.args.verbose) console.log("INFO: getComponent: " + requestContext + "/component:" + appInfo.id);

    var that = this;
    var manifestDeferred = Q.defer();

    if (!appInfo.url) {
        manifestDeferred.reject(new Error("Missing url for component: " + appInfo.id));
        return manifestDeferred.promise;
    }

    var appManifestItem = {
        x: appInfo.id,
        path: appInfo.url + '/manifest.json',
        targetPath: this.targetWWWPath,
        baseUrl: appInfo.url,
        resource: 'manifest.json',
        cacheable: true
    }
    this.queue.add(appManifestItem).then(processComponentManifestResponse.bind(this, manifestDeferred, appInfo, requestContext), function(deferred, rejectReason) {
        console.log("ERROR: getComponent: Error retrieving manifest file [" + rejectReason + "]: " + requestContext + "/component:" + appInfo.id);
        deferred.reject(rejectReason);
    }.bind(this, manifestDeferred));

    // now sort out resources ...
    var resourceDeferred = Q.defer();
    this.componentResourcePromises.push(resourceDeferred.promise);

    if (appInfo.useADT) {
        var resourceArr = [];
        var bspName = appInfo.url.substring(appInfo.url.lastIndexOf('/') + 1);
        that.findResourcesForBSP(bspName, resourceArr).done(function() {
            that.getResources(resourceArr, appInfo, resourceDeferred, false, requestContext);
        }, function (e) {
            console.log("ERROR: getComponent: Failed to find resources for BSP: " + e);
            resourceDeferred.reject(e);
        });
        return manifestDeferred;
    }

    var appResourcesItem = {
        path: appInfo.url + '/resources.json',
        cacheable: true
    }
    this.queue.add(appResourcesItem).then(processComponentResourcesResponse.bind(this, resourceDeferred, appInfo, requestContext), function(deferred, rejectReason) {
        console.log("ERROR: getComponent: Failed to retrieve resource [" + rejectReason + "]: " + requestContext + "/component:" + appInfo.id);
        deferred.reject(rejectReason);
    }.bind(this, resourceDeferred));

    return manifestDeferred.promise;
}

/**
 ** Handle the sap-ui-version.json response
 **/
function processUI5LibsResponse(deferred, ui5versionInfo, requestContext, response) {
    if (response.statusCode == 401) {
        console.log("ERROR: getUI5Libs: Unauthorised access for resources file: " + requestContext + ui5versionInfo.path);
        deferred.reject(new Error("Unauthorised access for resources file: " + requestContext + ui5versionInfo.path));
        return;
    }

    if (response.statusCode == 404) {
        console.log("ERROR: getUI5Libs: Failed to find resources file: " + requestContext + ui5versionInfo.path);
        deferred.reject(new Error("ERROR: getUI5Libs: Failed to find resources file: " + requestContext + ui5versionInfo.path));
        return;
    }

    if (response.statusCode != 200) {
        console.log("ERROR: getUI5Libs: Unexpected error accessing resources file ["+response.statusCode+"]: " + requestContext + ui5versionInfo.path);
        deferred.reject(new Error("Unexpected error accessing resources file ["+response.statusCode+"]: " + requestContext + ui5versionInfo.path));
        return;
    }

    var ui5versionJson = {};
    
    try {
        ui5versionJson = JSON.parse(response.response);
    } catch (e) {
        console.log("ERROR: Error parsing resources file: " + e);
        deferred.reject(new Error("Error parsing resources file ["+e+"]"));
        return;
    }

    for (var idx in ui5versionJson.libraries) {
        var theLib = ui5versionJson.libraries[idx];
        // With UI5 1.7x, the 'sap.ui.integration' lib was mandatory. But, somehow, there is no dependcy on other component with it, so, we have to access the sap-ui-version.json to check this version dependent lib.
        // If the 'sap.ui.integration' was found in the sap-ui-version.json, then, package it and add it into the index.html(data-sap-ui-libs). Also with 'sap.f' lib.
        // Notes: for now, only found this can work with 1.7x. But, if all libs declared in sap-ui-version.json were packaged, it can't work. 
        // Be aware that the lib contains libs start with 'themelib_' should not be packaged in future if packager need package all libs according to this response 
        if (theLib.name === "sap.ui.integration") {
            if (this.args.verbose) console.log("INFO: Add the lib '" + theLib.name +"' into the UI5 lib list");
            this.allUI5Libs.push(theLib.name);
            this.dataSapUILibs.push(theLib.name);
            this.dataSapUILibs.push("sap.f");
        }
    }
    
    deferred.resolve();
}

Packager.prototype.getUI5VersionLibs = function(requestContext) {
    if (this.args.verbose) console.log("INFO: getUI5VersionLibs: " + requestContext + "/sap-ui-version.json");

    var that = this;
    var ui5VersionLibsDeferred = Q.defer();

    var ui5VersionLibsItem = {
        path: '/sap/public/bc/ui5_ui5/resources/sap-ui-version.json',
        cacheable: true
    }
    this.queue.add(ui5VersionLibsItem).then(processUI5LibsResponse.bind(this, ui5VersionLibsDeferred, ui5VersionLibsItem, requestContext), function(ui5VersionLibsDeferred, rejectReason) {
        console.log("ERROR: getComponent: Failed to retrieve resource [" + rejectReason + "]: " + ui5VersionLibsItem.path);
        deferred.reject(rejectReason);
    }.bind(this, ui5VersionLibsDeferred));

    return ui5VersionLibsDeferred.promise;
}

/**
 ** Setup for the packager
 **
 **/
Packager.prototype.setup = function() {
    var that = this;
    var deferred = Q.defer();

    if (!this.config.frontEndServer.host ||
        !this.config.frontEndServer.port ||
        (typeof this.config.frontEndServer.https === "undefined")) {
        console.log("ERROR: Must fully define front end server connection details!");
        deferred.reject(new Error("Must fully define front end server connection details!"));
        return deferred.promise;
    }

    //allow user to input credential from command line
    var needPromptForUsername = false;
    if (this.args.username) {
        this.config.frontEndServer.username = this.args.username;
    } else {
        needPromptForUsername = true;
    }

    var needPromptForPassword = false;
    if (this.args.password) {
        this.config.frontEndServer.password = this.args.password;
    } else {
        needPromptForPassword = true;
    }

    if (needPromptForUsername || needPromptForPassword) {
        prompt.message = "Input Front End Server's ";
        prompt.delimiter = '';
        prompt.start();
        var promptNames = [];
        if (needPromptForUsername) {
            promptNames.push({
                name: 'username',
                required: true,
                message: 'username'
            });
        }

        if (needPromptForPassword) {
            promptNames.push({
                name: 'password',
                hidden: true,
                required: true,
                message: 'password:'
            });
        }

        prompt.get(promptNames, function(err, result) {
            if (needPromptForUsername) {
                that.config.frontEndServer.username = result.username;
            }

            if (needPromptForPassword) {
                that.config.frontEndServer.password = result.password;
            }
            deferred.resolve();
        });
    } else {
        deferred.resolve();
    }

    return deferred.promise;
}

/**
 ** Build the cordova project.
 **
 **/
Packager.prototype.prepareAndBuild = function() {
    var deferred = Q.defer();

    shell.cd(this.args.targetDir);
    shell.exec('cordova prepare ' + this.args.platform + ' --searchpath ' + path.normalize(path.join(__dirname, '..', '..', '..', 'plugins')));
    shell.exec('cordova build ' + this.args.platform);
    deferred.resolve();

    return deferred.promise;
}

function listAssets(assetPath, callback) {
    fs.readdirSync(assetPath).forEach(function (name) {
        var filePath = path.join(assetPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            var asset = filePath.substring(filePath.indexOf('www') + 4);
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            listAssets(filePath, callback);
        }
    });
}

/**
 ** Upload the project content to an SMP/HCPms server for AppUpdate.  If the app is sucessfully
 ** uploaded, set the hybridapprevision to the new revision.  On Android, also build an
 ** asset.index file to help with performance.
 **
 **/
Packager.prototype.deploy = function() {
    var deferred = Q.defer();

    if (this.args.platform.length === 0 || this.args.platform === 'android') {
        var stats = fs.lstatSync(path.normalize(path.join(shell.pwd().toString(), this.args.targetDir, '/platforms/android/assets/www')));
        if (stats.isDirectory()) {
            // If Android is there, build an asset.index file.
            var assets = '';
            listAssets(path.normalize(path.join(shell.pwd().toString(), this.args.targetDir, '/platforms/android/assets/www')), function(filePath, stat) {
                assets += filePath.substring(filePath.indexOf('www') + 4) + '\n';
            });
            fs.writeFileSync(path.normalize(path.join(shell.pwd().toString(), this.args.targetDir, '/platforms/android/assets/asset.index')),assets);
        }
    }
      
    shell.cd(this.args.targetDir);
    
    // Some SMP and HCPms servers are unable to promote large uploads, and return a 403.
    // Do android and ios package and deploy separately, as required.
    if (this.args.platform.length === 0 || this.args.platform === 'android') {
        // Some SMP and HCPms servers incorrectly complain about references to icon and splash entities in config.xml.
        // Remove those entities.

        // Make a temporary backup of the config file.
        fs.writeFileSync(
            path.normalize(path.join(shell.pwd().toString(), 'platforms','android','res','xml','config.xml.backup')),
            fs.readFileSync(path.normalize(path.join(shell.pwd().toString(), 'platforms','android','res','xml','config.xml'))));

        // Remove lines that give us a problem,
        shell.sed('-i', /^.*<icon.*$/g, '', path.normalize(path.join(shell.pwd().toString(), 'platforms','android','res','xml','config.xml')));
        shell.sed('-i', /^.*<splash.*$/g, '', path.normalize(path.join(shell.pwd().toString(), 'platforms','android','res','xml','config.xml')));
        shell.sed('-i', /^\s*$/g, '', path.normalize(path.join(shell.pwd().toString(), 'platforms','android','res','xml','config.xml')));

        shell.exec('kapsel package android');

        var deploy = shell.exec('kapsel deploy ' + this.config.appID + ' ' + this.args.host + ':' + this.args.port + ' ' + this.args.username + ' ' + this.args.password, {silent:true}).stdout;
        console.log(deploy);        

        if (deploy && deploy.length > 0) {
            var androidRevision = -1;
            var index = deploy.indexOf('android at revision ');
            if (index > -1) {
                var androidSubstr = deploy.substring(index + 20);
                var androidNL = androidSubstr.indexOf('\n');
                androidRevision = androidSubstr.substring(0, androidNL);
            }
        
            // <preference name="hybridapprevision" value="10" />
            if (androidRevision > -1) {
                // Delete any existing hybridapprevision.
                shell.sed('-i', /<platform name="android">?\n?.*?hybridapprevision.*\n?/,'<platform name="android">\n',path.normalize(path.join(shell.pwd().toString(),'config.xml')));
                // Insert current hybridapprevision
                shell.sed(
                    '-i',
                    '<platform name="android">',
                    '<platform name="android">\n        <preference name="hybridapprevision" value="' + androidRevision + '" />',
                    path.normalize(path.join(shell.pwd().toString(),'config.xml')));
            }
        }

        // Clean up temporary file and restore original
        shell.mv(
            '-f',
            path.join(shell.pwd().toString(), 'platforms','android','res','xml','config.xml.backup'),
            path.normalize(path.join(shell.pwd().toString(), 'platforms','android','res','xml','config.xml')));
    }

    if (this.args.platform.length === 0 || this.args.platform === 'ios') {
        // Some SMP and HCPms servers incorrectly complain about references to icon and splash entities in config.xml.
        // Remove those entities.
        
        // Make a temporary backup of the config file.
        fs.writeFileSync(
            path.normalize(path.normalize(path.join(shell.pwd().toString(), 'platforms','ios',this.config.appName,'config.xml.backup'))),
            fs.readFileSync(path.normalize(path.join(shell.pwd().toString(), 'platforms','ios',this.config.appName,'config.xml'))));
        // Remove lines that give us a problem,
        shell.sed('-i', /^.*<icon.*$/g, '', path.normalize(path.join(shell.pwd().toString(), 'platforms','ios',this.config.appName,'config.xml')));
        shell.sed('-i', /^.*<splash.*$/g, '', path.normalize(path.join(shell.pwd().toString(), 'platforms','ios',this.config.appName,'config.xml')));
        shell.sed('-i', /^\s*$/g, '', path.normalize(path.join(shell.pwd().toString(), 'platforms','ios',this.config.appName,'config.xml')));

        shell.exec('kapsel package ios');
    
        var deploy = shell.exec('kapsel deploy ' + this.config.appID + ' ' + this.args.host + ':' + this.args.port + ' ' + this.args.username + ' ' + this.args.password, {silent:true}).stdout;
        console.log(deploy);        

        if (deploy && deploy.length > 0) {
            var iosRevision = -1;
            var index = deploy.indexOf('ios at revision ');
            if (index > -1) {
                var iosSubstr = deploy.substring(index + 16);
                var iosNL = iosSubstr.indexOf('\n');
                iosRevision = iosSubstr.substring(0, iosNL);
            }
        
            // <preference name="hybridapprevision" value="10" />
            if (iosRevision > -1) {
                // Delete any existing hybridapprevision.
                shell.sed('-i', /<platform name="ios">?\n?.*?hybridapprevision.*\n?/, '<platform name="ios">\n', path.normalize(path.join(shell.pwd().toString(),'config.xml')));
                // Insert current hybridapprevision
                shell.sed(
                    '-i',
                    '<platform name="ios">','<platform name="ios">\n        <preference name="hybridapprevision" value="' + iosRevision + '" />',
                    path.normalize(path.join(shell.pwd().toString(),'config.xml')));
            }
            shell.exec('cordova prepare ' + this.args.platform + ' --searchpath ' + path.normalize(path.join(__dirname, '..', '..', '..', 'plugins')));
        }
        
        // Clean up temporary file and restore original
        shell.mv(
            '-f',
            path.join(shell.pwd().toString(), 'platforms','ios',this.config.appName,'config.xml.backup'),
            path.normalize(path.join(shell.pwd().toString(), 'platforms','ios',this.config.appName,'config.xml')));
    }
    
    shell.exec('cordova prepare ' + this.args.platform + ' --searchpath ' + path.normalize(path.join(__dirname, '..', '..', '..', 'plugins')));
    
    deferred.resolve();

    return deferred.promise;
}

/**
 ** Download the project contents from an SMP/HCPms server form AppUpdate.  If the app is sucessfully
 ** downloaded, set the hybridapprevision to the new revision.
 **
 **/
Packager.prototype.fetch = function() {
    var deferred = Q.defer();
    
    shell.cd(this.args.targetDir);
    // kapsel fetch <appId> <server>:<port> <user> <password> <optional platform - defaults to android>
    var fetch = shell.exec('kapsel fetch ' + this.config.appID + ' ' + this.args.host + ':' + this.args.port + ' ' + this.args.username + ' ' + this.args.password + ' ' + this.args.platform, {silent:true}).stdout;
    
    // Expecting fetch to look something like: Revision 44 is available.
    if (fetch && fetch.length > 0) {
        var revision = -1;
        var index = fetch.indexOf('Revision ');
        if (index > -1) {
            var substr = fetch.substring(index + 9);
            revision = substr.substring(0, substr.indexOf(' '));
        }
        
        if (revision > -1) {
            // Unzip the download into a temporary directory named download
            var downloadDir = path.normalize(path.join(shell.pwd().toString(),'download'));
            if (!fs.existsSync(downloadDir)) {
                fs.mkdirSync(downloadDir);
            }

            var AdmZip = require('adm-zip');
            var stats = fs.lstatSync(path.normalize(path.join(shell.pwd().toString(),'download.zip')));
            var zip = new AdmZip(path.normalize(path.join(shell.pwd().toString(),'download.zip')));
            zip.extractAllTo(downloadDir, true);
    
            // Delete platform specific files and files installed with plugins from the download.
            var rimraf = require('rimraf');
            rimrafHandler = function(err) {
                if (err) {
                    console.log(err);
                }
            }
            rimraf.sync(path.normalize(path.join(shell.pwd().toString(),'download', 'www', 'plugins')), [], rimrafHandler);
            rimraf.sync(path.normalize(path.join(shell.pwd().toString(),'download', 'www', 'cordova-js-src')), [], rimrafHandler);
            rimraf.sync(path.normalize(path.join(shell.pwd().toString(),'download', 'www', 'smp')), [], rimrafHandler);
            rimraf.sync(path.normalize(path.join(shell.pwd().toString(),'download', 'www', 'cordova_plugins.js')), [], rimrafHandler);
            rimraf.sync(path.normalize(path.join(shell.pwd().toString(),'download', 'www', 'cordova.js')), [], rimrafHandler);

            // Copy the downloaded files.
            var copydir = require('copy-dir');
            copydir.sync(path.normalize(path.join(shell.pwd().toString(),'download', 'www')), path.normalize(path.join(shell.pwd().toString(),'www')));
    
            // Delete downloaded files.
            rimraf.sync(path.normalize(path.join(shell.pwd().toString(),'download')), [], rimrafHandler);
            rimraf.sync(path.normalize(path.join(shell.pwd().toString(),'download.zip')), [], rimrafHandler);
            
            // Update hybridapprevision
            if (this.args.platform === 'ios') {
                // iOS config.xml: <targetDir>/platforms/ios/<appName>/config.xml
                // Delete any existing hybridapprevision.
                shell.sed('-i', /<platform name="ios">\n.*?hybridapprevision.*\n?/, '<platform name="ios">\n', path.normalize(path.join(shell.pwd().toString(),'config.xml')));
                // Insert current hybridapprevision
                shell.sed(
                    '-i',
                    '<platform name="ios">','<platform name="ios">\n        <preference name="hybridapprevision" value="' + iosRevision + '" />',
                    path.normalize(path.join(shell.pwd().toString(),'config.xml')));
            } else {
                // Android config.xml: <targetDir>/platforms/android/res/xml/config.xml
                // Delete any existing hybridapprevision.
                shell.sed('-i', /<platform name="android">?\n?.*?hybridapprevision.*\n?/,'<platform name="android">\n',path.normalize(path.join(shell.pwd().toString(),'config.xml')));
                // Insert current hybridapprevision
                shell.sed(
                    '-i',
                    '<platform name="android">',
                    '<platform name="android">\n        <preference name="hybridapprevision" value="' + androidRevision + '" />',
                    path.normalize(path.join(shell.pwd().toString(),'config.xml')));
            }

            shell.exec('cordova prepare ' + this.args.platform + ' --searchpath ' + path.normalize(path.join(__dirname, '..', '..', '..', 'plugins')));
        } else {
            console.log("ERROR: problem downloading from server")
        }
    }
    
    deferred.resolve();

    return deferred.promise;
}

/**
 ** Create a local package by downloading resources from the Front End Server
 **
 **/
Packager.prototype.createPackage = function() {
    console.log("Download from Front End Server has started.");
    console.log("If you are not using the cache for this Front End Server, or the cache is empty, this command may take up to 20 minutes to complete.");

    var that = this;

    // the libs variable specifies all ui5 library used by local launchpad. L
    // local launchpad cannot not be downloaded from front end server
    this.allUI5Libs = ["sap.ui.core", "sap.ushell", "sap.m", "sap.ui.layout", "sap.ui.unified", "sap.fiori", "sap.ca.scfld.md", "sap.ca.ui", "sap.me", "sap.suite.ui.commons", "sap.collaboration", "sap.viz"];
    this.dataSapUILibs = ["sap.fiori", "sap.m", "sap.ushell"];

    this.componentManifestPromises = [];
    this.componentResourcePromises = [];
    this.libManifestPromises = [];
    this.libResourcePromises = [];
    this.allResources = [];
    this.ui5VersionLibsPromises = [];

    var targetPath = this.args.targetDir;
    this.targetWWWPath = path.join(targetPath, "www");
    this.applications = this.config.applications;
    var packagerTemplateDir = path.join(__dirname, "..", "template");

    var options = {
        hostname: this.config.frontEndServer.host,
        port: this.config.frontEndServer.port,
        username: this.config.frontEndServer.username,
        password: this.config.frontEndServer.password,
        https: true,
        rejectUnauthorized: false,
        maxReqs: this.args.maxReqs
    }

    if (this.config.frontEndServer.proxyHost) {
        options.proxyHost = this.config.frontEndServer.proxyHost;
        options.proxyPort = this.config.frontEndServer.proxyPort;
    }

    if (this.config.frontEndServer.sapClient) {
        options.sapClient = this.config.frontEndServer.sapClient;
    }

    try {
        this.queue = new RequestQueue(options, this.args);
    } catch (e) {
        return Q.reject(e);
    }

    var deferred = Q.defer();

    var boot = Q.defer();
    boot.resolve();
    boot.promise.
        then(function() {
        // ==========
        // Phase 1: create file system structure and get app component details
        // ==========
        if (!that.applications || that.applications.length == 0) {
            console.log("ERROR: No application is defined in the appConfig.js file");
            deferred.reject(new Error("No application is defined in the appConfig.js file"));
            return deferred.promise;
        }

        if (shell.test('-e', that.args.targetDir)) {
            if (that.args.force) {
                try {
                    shell.rm("-rf", that.args.targetDir);
                    var err = shell.error();
                    if (err) {
                        console.log("ERROR: Failed to remove directory: " + err);
                        deferred.reject(new Error("Failed to remove directory: " + err));
                        return deferred.promise;
                    }
                } catch (e) {
                    console.log("ERROR: Unable to remove existing target!");
                    deferred.reject(new Error("Unable to remove existing target!"));
                    return deferred.promise;
                }
            } else {
                console.log("ERROR: Path '" + that.args.targetDir + "' already exists");
                deferred.reject(new Error("Path '" + that.args.targetDir + "' already exists"));
                return deferred.promise;
            }
        }


        if (that.args.verbose) console.log("INFO: Create directory at '" + targetPath + "'");

        shell.cp('-R', packagerTemplateDir, targetPath);

        //copy appconfig.js to www folder - rename to standard name when doing this
        shell.cp(that.args.config, path.join(that.targetWWWPath, "appConfig.js"));

        if (that.args.client) {
            shell.sed("-i", /index.html/, "index.html?sap-client=" + that.args.client, path.join(targetPath, "config.xml"));
        }

        if (that.config.bundleID) {
            shell.sed("-i", /com.sap.mobile.fioripackaged/, that.config.bundleID, path.join(targetPath, "config.xml"));
        }

        if (that.config.appVersion) {
            shell.sed("-i", /0.0.1/, that.config.appVersion, path.join(targetPath, "config.xml"));
        }

        if (that.config.appName) {
            shell.sed("-i", /LocalLaunchPad/, that.config.appName, path.join(targetPath, "config.xml"));
        }

        if (that.config.theme) {
        	shell.sed("-i", /sap_bluecrystal/g, that.config.theme, path.join(that.targetWWWPath, "index.html"));

            shell.sed("-i", /\"theme\"\s*:\s*\".*\",/g, "\"theme\": \"" + that.config.theme + "\",", path.join(that.targetWWWPath, "appConfig.js"));
        }

        // Create the Fiori Applications definition
        if (that.args.verbose) {
            console.log("INFO: Packaging these apps:");
            for (var app in that.applications) {
                console.log("    " + that.applications[app].id);
            }
        }

        //
        // Copy Apps from the FES
        //

        if (that.args.verbose) console.log("INFO: Get the Application content from the front end server");

        // This promise array is resolved when all application manifests are downloaded.
        var appInfoPromises = [];
        for (var idx in that.applications) {
            var app = that.applications[idx];

            appInfoPromises.push(that.getAppInfo(app, ""));
        }

        return Q.all(appInfoPromises);
    }, function(e) {
        var rejected = Q.defer();
        rejected.reject(e);
        return rejected.promise;
    }).
    then(function() {
        // ==========
        // Phase 2: try to get all UI5 libs for current UI5 version by the sap-ui-version.json
        // ==========

        if (that.args.verbose) console.log("INFO: Fetch sap-ui-version.json");
        
        that.ui5VersionLibsPromises.push(that.getUI5VersionLibs(""));

        return Q.all(that.ui5VersionLibsPromises);
    }, function(e) {
        var rejected = Q.defer();
        rejected.reject(e);
        return rejected.promise;
    }).
    then(function() {
        // ==========
        // Phase 2: we have a list of components to package: get the component content (manifests and resources.json files)
        // ==========

        if (that.args.verbose) console.log("INFO: All application info loaded");

        if (that.applications.length == 0) {
            return Q.reject(new Error("No components found to package"));
        }

        // now we have the list of components
        for (var idx in that.applications) {
            var appInfo = that.applications[idx];

            that.componentManifestPromises.push(that.getComponent(appInfo, ""));
        }

        return Q.all(that.componentManifestPromises);
    }, function(e) {
        var rejected = Q.defer();
        rejected.reject(e);
        return rejected.promise;
    }).
    then(function() {
        // ==========
        // Phase 3: adjust files and get the UI5 libs
        // ==========

        if (that.args.verbose) console.log("INFO: All manifests for the components have been loaded");

        // we have our full list of libraries and apps now

        // Apply optional scenario
        if (that.config.offline === true) {
            for (var i in that.applications) {
                app = that.applications[i];
                if (app.scenarioInit) {
                    shell.sed("-i", /__SCENARIO_ID__/g, app.id, path.join(that.targetWWWPath, "js", "contentplace.js"));
                    var url = app.url;
                    if (url.charAt(0) == '/') {
                        url = url.substring(1);
                    }
                    shell.sed("-i", /__SCENARIO_PATH__/g, url, path.join(that.targetWWWPath, "js", "contentplace.js"));
                    shell.sed("-i", /__SCENARIO_INIT__/g, app.scenarioInit, path.join(that.targetWWWPath, "js", "contentplace.js"));
                    break;
                }
            }
        }

        // patch up the resource roots to add reuse/hidden components
        var resourceRoots = "{\"\":\"resources\"";
        for (var idx in that.applications) {
            var appDetail = that.applications[idx];
            if (!appDetail.reuse) {
                continue;
            }

            // don't include leading / in url
            resourceRoots += ",\"" + appDetail.id + "\":\"" + appDetail.url.substring(1) + "\"";
        }
        resourceRoots += "}";
        shell.sed("-i", "__RESOURCEROOTS__", resourceRoots, path.join(that.targetWWWPath, "index.html"));

        // Create the application list
        var applicationsJs = "var applications = {};\n";
        for (var app in that.applications) {
            var appDetail = that.applications[app];
            if (!appDetail.root) continue;

            if (!appDetail.url) {
                console.log("ERROR: Missing url for app '" + appDetail.id + "'");
                deferred.reject(new Error("Missing url for app '" + appDetail.id + "'"));
                return deferred.promise;
            }

            // don't include leading / in url
            applicationsJs += "applications[\"" + appDetail.intent + "\"] = {\n" +
                "  additionalInformation: \"" + "SAPUI5.Component=" + appDetail.id + "\",\n" +
                "  applicationType: \"URL\",\n" +
                "  url: \"" + appDetail.url.substring(1) + "\"\n" +
                "};" + "\n";
        }

        fs.writeFileSync(path.join(that.targetWWWPath, "applications.js"), applicationsJs, "utf8");

        // Now create the Tile layouts

        var tilesJs = "var tiles = [];\n";
        var i = 0;
        for (var app in that.applications) {
            var appDetail = that.applications[app];
            if (!appDetail.root) continue;

            if (!appDetail.title) {
                console.log("ERROR: Missing title for app '"+appDetail.id+"'");
                deferred.reject(new Error("Missing title for app '" + appDetail.id + "'"));
                return deferred.promise;
            }

            if (!appDetail.icon) {
                console.log("WARNING: Missing icon for app '"+appDetail.id+"'");
            }

            tilesJs += "tiles[" + i + "] = {\n" +
                "  id: \"tile_" + i + "\",\n" +
                "  title: \"" + (appDetail.i18n ? (appDetail.id + ".title") : (appDetail.title)) + "\",\n" +
                "  size: \"1x1\",\n" +
                "  tileType: \"sap.ushell.ui.tile.StaticTile\",\n" +
                "  properties: {\n" +
                "    title: \"" + (appDetail.i18n ? (appDetail.id + ".title") : (appDetail.title)) + "\",\n" +
                "    subtitle: \"\",\n" +
                "    info: \"\",\n" +
                "    icon: \"" + appDetail.icon + "\",\n" +
                "    targetURL: \"#" + appDetail.intent + "\"\n" +
                "  }\n" +
                "};\n";
            i++;
        }

        fs.writeFileSync(path.join(that.targetWWWPath, "tiles.js"), tilesJs, "utf8");

        //
        // Copy SAP UI5 from the FES
        //
        var packagerConfigPath = path.join(__dirname, "..", "config", "config.json");
        var packagerConfigStr = fs.readFileSync(packagerConfigPath, {
            encoding: "utf8"
        });
        try {
            that.packagerConfig = JSON.parse(packagerConfigStr);
        } catch (e) {
            console.log("ERROR: Failed to parse config file: " + e);
            deferred.reject(new Error("Failed to parse config file: " + e));
            return deferred.promise;
        }

        if (that.args.verbose) console.log("INFO: Get the SAP UI5 libraries from the front end server ...");

        for (var idx in that.allUI5Libs) {
            var lib = that.allUI5Libs[idx];

            if (that.args.verbose) console.log('INFO: Need to download SAP UI5 library [' + lib + ']');

            var libInfo = getLibInfo(lib, that.applications[0].url);

            that.libManifestPromises.push(that.getLibrary(libInfo, ""));
        }

        // wait for the UI5 manifests ...
        return Q.all(that.libManifestPromises);
    }, function(e) {
        var rejected = Q.defer();
        rejected.reject(e);
        return rejected.promise;
    }).
    then(function() {
        // ==========
        // Phase 4: we now have all the UI5 lib manifests
        // ==========

        // We've got all the UI5 manifest files
        if (that.args.verbose) console.log("INFO: All UI5 manifests loaded");

        // patch up the index.html with the correct libs list in the boot of SAP UI5
        var bootLibs = [];
        for (var i in that.dataSapUILibs) {
            bootLibs.push(that.dataSapUILibs[i]);
        }
        var libsStr = bootLibs.join();
        if (that.args.verbose) console.log("INFO: Replace the __LIBS__ with: " + libsStr);
        shell.sed("-i", "__LIBS__", libsStr, path.join(that.targetWWWPath, "index.html"));

        // now wait for various resource.json loads
        // first the component resource.jsons
        return Q.all(that.componentResourcePromises).
            then(function() {
                // then the library resource.jsons
                return Q.all(that.libResourcePromises);
            }).
            then(function() {
                // then wait for the actual resources themselves ...
                return Q.all(that.allResources);
            });
    }, function(e) {
        var rejected = Q.defer();
        rejected.reject(e);
        return rejected.promise;
    }).
    then(function() {
        // ==========
        // Phase 5: we have all the resources for all components and libs: finish up
        // ==========

        // Now we have all the file fetches complete

        // create the message bundle that contains the tile names
        var messageBundle = "";
        try {
            for (var idx in that.applications) {
                var appDetail = that.applications[idx];
                if (appDetail.reuse) {
                    continue;
                }
                var appTitle = appDetail.title;
                var appI18n = appDetail.i18n;
                if (appI18n) {
                    if (appTitle.indexOf('{{') === 0) {
                        appTitle = appTitle.substring(2, appTitle.length - 2);

                        var i18nFile = fs.readFileSync(path.join(that.targetWWWPath, appDetail.url, appI18n), {encoding: 'utf8'});
                        var lines = i18nFile.split('\n');
                        for (var idx2 in lines) {
                            var line = lines[idx2];
                            if (line.indexOf(appTitle+'=') === 0) {
                                messageBundle += appDetail.id + ".title=" + line.split('=')[1] + '\n';
                            }
                        }
                    } else {
                        messageBundle += appDetail.id + ".title=" + appTitle + '\n';
                    }
                }
            }
        } catch (e) {
            console.log("WARNING: Unable to set the message properties for the Application labels in launchpad: " + e);
        }

        fs.writeFileSync(path.join(that.targetWWWPath, "messagebundle.properties"), messageBundle, "utf8");

        try {
            fs.writeFileSync(path.join(that.args.targetDir, "packagerStatus.json"), "{\"packagerStatus\": {\"status\": \"downloaded\"}}");
        } catch (e) {
            console.log("ERROR: writing packager status: " + e);
        }
        if (that.args.verbose) console.log("INFO: cli completed");

        deferred.resolve();
        return deferred.promise;
    }, function(e) {
        deferred.reject(e);
        return deferred.promise;
    });

    if (this.args.verbose) console.log("INFO: cli returned");

    return deferred.promise;
};

module.exports = Packager;
