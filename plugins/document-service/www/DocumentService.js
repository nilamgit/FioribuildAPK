var CmisService = require('./CmisService');

var url;
var session;
var rootObject;
var localStorageRoot;
var storage = window.localStorage;
var encryptOption = true;
var encryptionStore;

var TAG = "DocumentServicePlugin";
var REQUEST_TIMEOUT = 25000;
//Error Codes
/**
 * This error code indicates an error occurred from local file system operations.
 * (eg: fail to read/create/delete local file/directory, fail to get file metadata)
 * @memberof sap.DocumentService
 * @name sap.DocumentService#LOCAL_FILE_SYSTEM_ERR
 * @constant
 */
var LOCAL_FILE_SYSTEM_ERR = 10;
/**
 * This error code indicates an error occurred from server side file system operations.
 * (eg: fail to read/create/delete remote file/directory)
 * @memberof sap.DocumentService
 * @name sap.DocumentService#REMOTE_FILE_SYSTEM_ERR
 * @constant
 */
var REMOTE_FILE_SYSTEM_ERR = 11;
/**
 * This error code indicates an error occurred when using the Cordova File Transfer Plugin.
 * More description can be found on https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file-transfer/#filetransfererror
 * (eg: failure in download/upload)
 * @memberof sap.DocumentService
 * @name sap.DocumentService#FILE_TRANSFER_FAIL
 * @constant
 */
var FILE_TRANSFER_FAIL = 12;
/**
 * This error code indicates that an error in network connection has occurred.
 * (eg: http request not completed, fail to stream file content, authentication expired, download timeout, etc.)
 * @memberof sap.DocumentService
 * @name sap.DocumentService#
 * @constant
 */
var NETWORK_ERR = 13;
/**
 * This error code indicates that an error has occurred when handling resumable download.
 * @memberof sap.DocumentService
 * @name sap.DocumentService#RESUMABLE_HANDLING_ERR
 * @constant
 */
var RESUMABLE_HANDLING_ERR = 14;
/**
 * This error code indicates that an error occurred when device permission on storage operations is not turned on.
 * @memberof sap.DocumentService
 * @name sap.DocumentService#STORAGE_PERMISSION_NOT_ON
 * @constant
 */
var STORAGE_PERMISSION_NOT_ON = 15;
/**
 * This error code indicates that a file with unexpected file type has been detected.
 * @memberof sap.DocumentService
 * @name sap.DocumentService#FILE_TYPE_INCORRECT
 * @constant
 */
var FILE_TYPE_INCORRECT = 16;
/**
 * This error code indicates that file decryption has failed using stored password.
 * @memberof sap.DocumentService
 * @name sap.DocumentService#FILE_DECRYPTION_FAIL
 * @constant
 */
var FILE_DECRYPTION_FAIL = 17;
/**
 * This error code indicates that the object body from response cannot be parsed.
 * @memberof sap.DocumentService
 * @name sap.DocumentService#OBJECT_CANNOT_BE_PARSED
 * @constant
 */
var OBJECT_CANNOT_BE_PARSED = 18;


// Determine if a folder is the root folder 
function isRootFolder(filePath){
    return (filePath == "/");
}

// Recursively creates a directory with parents
function createDirectories(folderPath, isEncrypt, successCallback, errorCallback){
    
    var dirEntry;
    var dirs;

    if (isEncrypt) {
        dirEntry = window.decryptRoot;
    } else {
        dirEntry = window.fsRoot;
    }

    if (!folderPath || folderPath === "/" ){
        successCallback(dirEntry);
        return;
    }
        
    if (folderPath[0] === "/" ){
        folderPath = folderPath.slice(1);
    }

    if ( folderPath[folderPath.length - 1] == "/" ){
        folderPath = folderPath.substring(0, folderPath.length-1);
    }

    dirs = folderPath.split("/");

    var onDirectoryCreated = function(subDirEntry){
        sap.Logger.debug("Directory created.", TAG);
        dirEntry = subDirEntry;
        if(dirs.length > 0){
            createDir(dirs.shift());
        }else{
            sap.Logger.debug("All directories created.", TAG);
            successCallback(subDirEntry);
        }
    };

    var onDirectoryCreateFail = function(){
        var err = {
            code : LOCAL_FILE_SYSTEM_ERR,
            message : "Failed to create directory: " + dir,
            values : []
        };
        sap.Logger.error("Failed to create directory " + dir, TAG);
        errorCallback(err);
    };

    var createDir = function(dir){
        sap.Logger.debug("Creating directory: " + dir, TAG);
        dirEntry.getDirectory(dir, {
            create : true,
            exclusive : false
        }, onDirectoryCreated, onDirectoryCreateFail);
    };

    createDir(dirs.shift());
}

// Create blob for upload 
function createBlob(data, type) {
    var blob;
    try {
        blob = new window.Blob([data], {type: type});
    }
    catch (e) {

        window.BlobBuilder = $window.BlobBuilder ||
        window.WebKitBlobBuilder ||
        window.MozBlobBuilder ||
        window.MSBlobBuilder;

        if (e.name === 'TypeError' && window.BlobBuilder) {
            var blobBuilder = new BlobBuilder();
            blobBuilder.append([data.buffer]);
            blob = blobBuilder.getBlob(type);
            }
        else if (e.name == "InvalidStateError") {

            blob = new $window.Blob([data.buffer], {type: type});
        }
        else {
            throw e;
        }
    }

    return blob;
}

// Get File Mime type 
function getMimeType(fileName) {

    //Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
    var mimetypes = {
        '.aac'       : 'audio/aac',
        '.abw'       : 'application/x-abiword',
        '.arc'       : 'application/octet-stream',
        '.avi'       : 'video/x-msvideo',
        '.azw'       : 'application/vnd.amazon.ebook',
        '.bin'       : 'application/octet-stream',
        '.bz'        : 'application/x-bzip',
        '.bz2'       : 'application/x-bzip2',
        '.csh'       : 'application/x-csh',
        '.css'       : 'text/css',
        '.csv'       : 'text/csv',
        '.doc'       : 'application/msword',
        '.docx'      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.eot'       : 'application/vnd.ms-fontobject',
        '.epub'      : 'application/epub+zip',
        '.gif'       : 'image/gif',
        '.htm'       : 'text/html',
        '.html'      : 'text/html',
        '.ico'       : 'image/x-icon',
        '.ics'       : 'text/calendar',
        '.jar'       : 'application/java-archive',
        '.jpeg'      : 'image/jpeg',
        '.jpg'       : 'image/jpeg',
        '.js'        : 'application/javascript',
        '.json'      : 'application/json',
        '.mid'       : 'audio/midi',
        '.midi'      : 'audio/midi',
        '.mpeg'      : 'video/mpeg',
        '.mpkg'      : 'application/vnd.apple.installer+xml',
        '.odp'       : 'application/vnd.oasis.opendocument.presentation',
        '.ods'       : 'application/vnd.oasis.opendocument.spreadsheet',
        '.odt'       : 'application/vnd.oasis.opendocument.text',
        '.oga'       : 'audio/ogg',
        '.ogv'       : 'video/ogg',
        '.ogx'       : 'application/ogg',
        '.otf'       : 'font/otf',
        '.png'       : 'image/png',
        '.pdf'       : 'application/pdf',
        '.ppt'       : 'application/vnd.ms-powerpoint',
        '.rar'       : 'application/x-rar-compressed',
        '.rtf'       : 'application/rtf',
        '.sh'        : 'application/x-sh',
        '.svg'       : 'image/svg+xml',
        '.swf'       : 'application/x-shockwave-flash',
        '.tar'       : 'application/x-tar',
        '.tif'       : 'image/tiff',
        '.tiff'      : 'image/tiff',
        '.ts'        : 'application/typescript',
        '.ttf'       : 'font/ttf',
        '.txt'       : 'text/plain',
        '.vsd'       : 'application/vnd.visio',
        '.wav'       : 'audio/x-wav',
        '.weba'      : 'audio/webm',
        '.webm'      : 'video/webm',
        '.webp'      : 'image/webp',
        '.woff'      : 'font/woff',
        '.woff2'     : 'font/woff2',
        '.xhtml'     : 'application/xhtml+xml',
        '.xls'       : 'application/vnd.ms-excel',
        '.xlsx'      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xml'       : 'application/xml',
        '.xul'       : 'application/vnd.mozilla.xul+xml',
        '.zip'       : 'application/zip',
        '.3gp'       : 'video/3gpp',
        '.3g2'       : 'video/3gpp2',
        '.7z'        : 'application/x-7z-compressed',

     };

    var extension = '.' + fileName.split('.').pop();

    return mimetypes.hasOwnProperty(extension) ?
        mimetypes[extension] : undefined;
}

// Re-authenticate expired session 
function reauthenticateExpiredSession(e, errorCallback){
    if(e.getResponseHeader("com.sap.cloud.security.login") == "login-request"){

        sap.Logon.performSAMLAuth(function () {}, errorCallback);
        var err = {
            code : NETWORK_ERR,
            message : "SAML Session expired, please retry after authentication",
            values : [e]
        };
        sap.Logger.error("SAML Session expired, please retry after authentication", TAG);
        errorCallback(err);
        return true;

    } else if (e.getResponseHeader("X-SMP-AUTHENTICATION-STATUS-MESSAGE") == "Bearer token for OAuth2 is missing"){

        sap.Logon.refreshSession(function() {}, errorCallback);
        var err = {
            code : NETWORK_ERR,
            message : "Oauth Session expired, plese retry after authentication",
            values : [e]
        };
        sap.Logger.error("Oauth Session expired, plese retry after authentication", TAG);
        errorCallback(err);
        return true;
        
    } else {

        return false;
    }
}

// Check for active connection to server 
function checkConnection(successCallback,errorCallback){
    if (session==undefined) {
        errorCallback("Server not connected.");
        return;
    }
    session.loadRepositories({
        request: {
            success : function(){
                successCallback();
            },
            error : function() {
                errorCallback("Connection lost/Auth has expired.");
            },
            xhr : function(){
                var xhr = new window.XMLHttpRequest();
                xhr.timeout = REQUEST_TIMEOUT;

                return xhr;
            }
        }
    });
}

// Perform download tasks 
function doDownload(destFolderPath, uri, partialFileEntry, streamLength, successCallback, errorCallback, progressCallback) {

    var offset = null;    

    partialFileEntry.getMetadata(
        function(metadata){

            offset = metadata.size - 1;
            if(offset < 0){
                offset = 0;
            }

            window.resolveLocalFileSystemURL( window.fsRoot.toURL() + "/" + destFolderPath,
                function(directoryEntry){
                    directoryEntry.getFile(partialFileEntry.name + ".download" , {create: true, exclusive: false},
                        function(downloadEntry){
                            doResumableDownload(destFolderPath, uri , partialFileEntry, downloadEntry,  offset, streamLength, successCallback, errorCallback, progressCallback);
                        },
                        function(e){
                            var err = {
                                code : LOCAL_FILE_SYSTEM_ERR,
                                message : "Unable to generate download file",
                                values : [e]
                            };
                            sap.Logger.error("Unable to generate download file", TAG);
                            errorCallback(err);
                        }

                    );
                }
            );

        },
        function(e){
            var err = {
                code : LOCAL_FILE_SYSTEM_ERR,
                message : "Unable to retrieve file Metadata",
                values : [e]
            };
            sap.Logger.error("Unable to retrieve file Metadata", TAG);
            errorCallback(err);
        }
    );
}


function doResumableDownload(destFolderPath, uri, partialFileEntry, downloadEntry, offset, streamLength, successCallback, errorCallback, progressCallback){

    var fileTransfer = new FileTransfer();
    var startat = offset;
    var downloadTimer;
    var copyToTempTimer;
    var merged = false;
    var tempFile = null;
    var copyExists = false;
    var isCopying = false;
    var downloadErrorCalled = false;

    var fileName  = partialFileEntry.name.substring(0, partialFileEntry.name.length-8);
    var filePath  = partialFileEntry.toURL().substring(0, partialFileEntry.toURL().length-8);

    var downloadError = function(error) {
        downloadErrorCalled = true;
        if(!error){
            //If timeout
            sap.Logger.debug("Download timed out", TAG);
            if (!merged) {
                downloadDone(tempFile, function(){ fileTransfer.abort(); } );
            }
            var err = {
                code : NETWORK_ERR,
                message : "Download timed out",
                values : []
            };
            errorCallback(err);
        } else { //If file transfer error
            var err = {
                code : FILE_TRANSFER_FAIL,
                message : "Download Error: " + error.code,
                values : [error]
            };
            sap.Logger.error("Download Error: " + error.code, TAG);
            errorCallback(err);
        }
    };

    var downloadDone = function(downloadedFile, errorHandler) {

        clearTimeout(downloadTimer);
      
        var deleteTempFile = function () {
            sap.DocumentService.deleteLocal("/copy_" + fileName, function(){
                sap.Logger.debug(fileName + " - temporary file deleted", TAG);
            }, function(){
                sap.Logger.error(fileName + " - temporary file not deleted", TAG);
            })
        }

        var fail = function(error) {
            var err = {
                code : RESUMABLE_HANDLING_ERR,
                message : "Resumable Handling Error: " + error.code,
                values : [error]
            };
            sap.Logger.error(error, TAG);
            deleteTempFile();
            errorCallback(err);
        };

        var mergeFileSuccess = function(){

            var getParentSuccess = function(parent){
                partialFileEntry.moveTo(parent, fileName,
                    function(movedEntry){
                        //remove '.partial.download' at the end of the string
                        var realPath;
                        if (downloadedFile.toURL().slice(-17) == '.partial.download') {
                            realPath = downloadedFile.toURL().slice(0,-17);
                        }

                        //set the sync time
                        storage.setItem(realPath,new Date().getTime());

                        if (encryptOption) {
                            var store = new sap.EncryptedStorage(window.encryptedStoreName);
                            var uri = movedEntry.toURL().substring(7);
                                uri = decodeURI(uri);
                                encryptionStore.encryptFileWithStorePassword(uri, null,
                                function(encryptedEntry) {
                                    movedEntry.remove (

                                        function(){
                                            sap.Logger.debug("Encrypted Download complete: " + encryptedEntry, TAG);
                                            successCallback(encryptedEntry);
                                            if(progressCallback !== undefined){
                                                //download complete
                                                progressUpdate.progress = 100;
                                                progressCallback(progressUpdate);
                                            }
                                        },
                                        fail
                                    );
                                },
                                fail
                            );

                        } else {
                            sap.Logger.debug("Download fully complete: " + movedEntry.toURL(), TAG);
                            successCallback(movedEntry);
                            if(progressCallback !== undefined){
                                //download complete
                                progressUpdate.progress = 100;
                                progressCallback(progressUpdate);
                            }
                        }

                        deleteTempFile();
                    },
                    fail
                );
            };

            var getParentError = function(error) {
                var err = {
                    code : RESUMABLE_HANDLING_ERR,
                    message : "Resumable Handling Error: " + error.code,
                    values : [error]
                };
                sap.Logger.error(error, TAG);
                deleteTempFile();
                errorCallback(err);
            };

            //Remove partial file if download is complete
            if(errorHandler === undefined ){
                if (destFolderPath === "/") {// if download from root folder
                    getParentSuccess(window.fsRoot);
                } else {
                    //To use getDirectory function, remove slashes from the beginning and the end of the path string
                    window.fsRoot.getDirectory(destFolderPath.substring(1, destFolderPath.length-1), { create: false },
                        getParentSuccess, 
                        getParentError
                    );  
                }
            } 

            if( errorHandler ){
                errorHandler();
                deleteTempFile();
            }
        }

        var containsSpecialChar = false; // only for windows

        // windows platforms does not handle special characters automatically, but file transfer plugin does.
        // For file names containing special characters, content will be downloaded to a new file with encoded name
        // therefore, retrieve this new file and delete the previously created downloadEntry, and set downloadEntry
        // to be the file retrieved
        if (device.platform === "windows") {
            if (downloadedFile.name !== encodeURI(downloadedFile.name)) {
                containsSpecialChar = true;
                window.fsRoot.getDirectory(destFolderPath.substring(1, destFolderPath.length-1), { create: false },
                    function(parentDirectory) {
                        parentDirectory.getFile(encodeURI(downloadedFile.name), { create: false },
                            function(realDownEntry) {
                                sap.DocumentService.deleteLocal(destFolderPath + downloadedFile.name,
                                function() {
                                    merged = true;
                                    mergePartialFiles(realDownEntry, partialFileEntry, offset, mergeFileSuccess, fail);
                                }, fail);
                            },
                            fail
                        );
                    }, 
                    fail
                );
            }
        }

        //Merge Temp Download file into partial download file.
        if (!containsSpecialChar) {
            merged = true;
            mergePartialFiles(downloadedFile, partialFileEntry, offset, mergeFileSuccess, fail);
        }
    };

    if(progressCallback !== undefined){

        var progressUpdate;
        progressUpdate = {"file": fileName, "localPath": filePath };

        fileTransfer.onprogress = function(evt) {

            //Calculate progress percentage
            var perc;
            perc = Math.floor( ((evt.loaded + startat) / streamLength) * 100);
            progressUpdate.progress = perc;
            progressUpdate.loaded = (evt.loaded + startat);

            progressCallback(progressUpdate);

            //While downloadEntry still have valid metadata
            //Copy the downloadEntry to temporary file to avoid losing the already downloaded data
            //aborted by the errorCallback call from "fileTransfer.download"
            var copyToTemp = function() {
                clearTimeout(copyToTempTimer);
                copyToTempTimer = null;
                if(!downloadErrorCalled) {
                    var copyFile = function() {
                        isCopying = true;
                        downloadEntry.copyTo(window.fsRoot, "copy_" + fileName, function(tempFileEntry){
                            tempFile = tempFileEntry;
                            copyExists = true;
                            isCopying = false;
                        }, function(err) {
                            console.error("Failed to copy to temporary file");
                            isCopying = false;
                        });
                    }

                    downloadEntry.getMetadata( function(meta) {
                        if (copyExists && !isCopying) {
                            sap.DocumentService.deleteLocal("/copy_" + fileName, function() {
                                console.log(fileName + " - temporary file deleted")
                                copyExists = false;
                                copyFile();
                            }, function() {
                                console.error(fileName + " - temporary file not deleted");
                            })
                        } else if (!isCopying) {
                            copyFile();
                        }
                    }, function(err) {
                        console.error(err.code);
                    });
                }
            }

            if (!copyToTempTimer) {
                copyToTempTimer = setTimeout(copyToTemp, 300);
            }

            //Keep connection alive if progress updates are coming through
            if (downloadTimer) {
                clearTimeout(downloadTimer);
                downloadTimer = null;
            }

            downloadTimer = setTimeout(downloadError, REQUEST_TIMEOUT);

        };

        //download starting
        progressUpdate.progress = 0;
        progressUpdate.loaded = 0;
        progressCallback(progressUpdate);
    }

    downloadTimer = setTimeout(downloadError, REQUEST_TIMEOUT);

    fileTransfer.download(
        uri,
        downloadEntry.toURL(),
        downloadDone,
        downloadError,
        false,
        {
            headers: {
                "Accept-Encoding": "gzip",
                "Range": "bytes=" + offset + "- "
            }
        }
    );
}


function mergePartialFiles(margeFrom, mergeInto, offset, successCallback, errorCallback){
    
    var writerCreated = function(writer) {
        
        var fileRetrieved = function(file) {
            var reader = new FileReader();
           
            reader.onloadend = function(evt) {
                writer.seek(offset);
                writer.write(evt.target.result);
            };

            reader.readAsArrayBuffer(file);
        };

        margeFrom.file(fileRetrieved, errorCallback);

        writer.onwrite = function(evt) {
            sap.Logger.debug("Partial File Merged", TAG);
            margeFrom.remove(successCallback, errorCallback);
        };
        
    };

    mergeInto.createWriter(writerCreated, errorCallback);
}

// Perform create remote document if necessary, then call doContentUpload
function doUploadPath(destFolderPath, fileID, fileEntry, successCallback, errorCallback, progressCallback) {

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function(fileReadResult) {
            sap.Logger.debug("Successful file read: " + this.result, TAG);

            var data = new Uint8Array(fileReadResult.target.result);
            var blob;
            if (device.platform === "windows") {
                blob = createBlob(data, getMimeType(file.name));
            } else {
                blob = createBlob(data, file.type || getMimeType(file.name));
            }

            if( fileID == null ){
                 session.getObjectByPath(destFolderPath, {
                    includeRelationships : 'both',
                    request: {
                        success : function(data){

                            var folderId = data.properties['cmis:objectId'].value;

                            session.createDocument(folderId, blob, file.name , file.type, "major", null, null, null, {
                                request : {
                                    success : function(data) {
                                        myfileId = data.properties["cmis:objectId"].value;
                                        sap.Logger.debug("Create Document Success", TAG);
                                        
                                        if( progressCallback !== undefined){
                                            var progressUpdate = {"file": file.name, "localPath": file.fullPath };
                                            //upload starting
                                            progressUpdate.progress = 0;
                                            progressCallback(progressUpdate);
                                        }

                                        doContentUpload(myfileId, blob, fileEntry, file, successCallback, errorCallback, progressCallback);

                                    },
                                    error : function(e) {
                                        var err = {
                                            code : REMOTE_FILE_SYSTEM_ERR,
                                            message : e.responseJSON.message,
                                            values : [e.responseJSON]
                                        };
                                        sap.Logger.error(e.responseJSON.message, TAG);
                                        errorCallback(err);
                                    }
                                }
                            }); //End Create Document
                        },
                        error : function(e) {
                            // get file by destination path failed
                            var err = {
                                code : REMOTE_FILE_SYSTEM_ERR,
                                message : e.responseJSON.message,
                                values : [e.responseJSON]
                            };
                            sap.Logger.error(e.responseJSON.message + " " + e.responseJSON.exception, TAG);
                            errorCallback(err);
                        }
                    }
                });
            } else {
                doContentUpload(fileID, blob, fileEntry, file, successCallback, errorCallback, progressCallback);
            }
        };

        reader.readAsArrayBuffer(file);

    }, function(e){
        sap.Logger.error("Unsuccessful file read: " + this.result, TAG);
    });
}

// Perform upload from file chooser tasks 
function doUploadWithFilePicker(destFolderPath, file, successCallback, errorCallback, progressCallback) {
    session.getObjectByPath(destFolderPath, {
        includeRelationships : 'both',
        request: {
            success : function(data){
                
                var folderId = data.properties['cmis:objectId'].value;

                session.createDocument(folderId, file, file.name , file.type, "major", null, null, null, {
                    request : {
                        success : function(data) {
                            myfileId = data.properties["cmis:objectId"].value;
                            sap.Logger.debug("Create Document Success", TAG);

                            doContentUpload(myfileId, file, null, file, successCallback, errorCallback, progressCallback);

                        },
                        error : function(e) {
                            var err = {
                                code : REMOTE_FILE_SYSTEM_ERR,
                                message : "Create Document Error " + e.responseJSON.message,
                                values : [e.responseJSON]
                            };
                            sap.Logger.error("Create Document Error " + e.responseJSON.message, TAG);
                            errorCallback(err);
                        }
                    }
                });

            },
            error : function(e) {
                var err = {
                    code : REMOTE_FILE_SYSTEM_ERR,
                    message : "Destination Folder does not exist",
                    values : [e.responseJSON]
                };
                sap.Logger.error("Destination Folder does not exist: " + e.responseJSON.message, TAG);
                errorCallback(err);
            }
        }
    });
}

// Perform upload task
function doContentUpload(fileId, blob, fileEntry, file, successCallback, errorCallback, progressCallback){
    // Upload content
    session.setContentStream(fileId, blob, true, file.type, {
        request : {
            success : function(data) {
                if(fileEntry){
                    storage.setItem(fileEntry.toURL(),new Date().getTime());
                }
                sap.Logger.debug("Upload Success: " + file.name, TAG);
                successCallback();
            },
            error : function(e) {
                var err = {
                    code : NETWORK_ERR,
                    message : "Upload Error",
                    values : [e]
                };
                sap.Logger.error("Upload Error " + e, TAG);
                errorCallback(err);
            },
            xhr : function(){
                var xhr = new window.XMLHttpRequest();

                if( progressCallback !== undefined){
                    var progressUpdate = {"file": file.name };

                    if(file.fullPath){
                        progressUpdate.localPath = file.fullPath;
                    }

                    //Updating Percentage of Upload Progress
                    xhr.upload.addEventListener("progress", function(evt) {
                        var perc = Math.floor(evt.loaded / evt.total * 100);
                        progressUpdate.progress = perc;
                        progressUpdate.loaded = evt.loaded;
                        progressCallback(progressUpdate);
                    }, false);

                    //Upload Complete
                    xhr.upload.addEventListener("load", function(evt) {
                        progressUpdate.progress = 100;
                        progressUpdate.loaded = evt.loaded;
                        progressCallback(progressUpdate);
                    }, false);

                    //Upload Starting
                    xhr.upload.addEventListener("loadstart", function(evt) {
                        progressUpdate.progress = 0;
                        progressCallback(progressUpdate);
                   }, true);
                }

               return xhr;
           }
        }
    });
}

//error handler for checkConnection calls
var connectionFail = function (e) {
    var err = {
        code : NETWORK_ERR,
        message : "Fail to connect to server" + e,
        values : []
    };
    sap.Logger.error("Fail to connect to server:" + e, TAG);
    errorCallback(err);
}


// =================== exported (public) members ====================

/**
 * This plugin provides Document Service integration and synchronization functionality.<br/>
 * <br/>
 * <br/>
 * <b>Adding and Removing the Document Service Plugin</b><br/>
 * The Document Service plugin is added and removed using the
 * <a href="http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-line%20Interface">Cordova CLI</a>.<br/>
 * <br/>
 * To add the Document Service plugin to your project, use the following command:<br/>
 * cordova plugin add kapsel-plugin-document-service<br/>
 * <br/>
 * To remove the Document Service plugin from your project, use the following command:<br/>
 * cordova plugin rm kapsel-plugin-document-service
 * @namespace
 * @alias DocumentService
 * @memberof sap
 */
 
module.exports = {

    /**
     * Initialize the Document Service Plugin. Must be called before any other functions.
     *
     * This function first calls the android file system to request file permissions to write to storage. It then
     * creates directories for both encrypted (if encryption is enabled ) and unencrypted files using config parameters
     * where they are available
     *
     * @param {Function} successCallback - Success callback function
     * @param {Function} errorCallback   - Error callback function
     */
    init : function (successCallback, errorCallback){
        // Defaults
        var rootDir = cordova.file.dataDirectory;
        var subFolder = "Download";
        window.encryptedStoreName = "documentServiceEncryptedStore";
        encryptionStore = new sap.EncryptedStorage(window.encryptedStoreName);

        //Check config data
        var callback = function(configData) {

            //Set root directory
            if (configData.storageFolderName != undefined) { 
                subFolder = configData.storageFolderName; 
            }

            if (cordova.platformId == 'android' && configData.storageLocation != undefined && configData.storageLocation == "EXTERNAL") { 
                rootDir = cordova.file.externalDataDirectory; 
            }

            window.resolveLocalFileSystemURL(rootDir,
                function(fileSystem) {
                    window.fsRoot = fileSystem;
                    createDirectories( subFolder, false,
                        function(directory) {
                            window.fsRoot = directory;
                            window.storageLocation = rootDir + subFolder;
                            sap.Logger.debug("Root directory set to: " + window.storageLocation, TAG);
                            sap.Logger.debug("Document Service Initialized", TAG);
                            successCallback();
                        },
                        function(e) {
                            var err = {
                                code : LOCAL_FILE_SYSTEM_ERR,
                                message : "Unable to set Root Directory",
                                values : [e]
                            };
                            sap.Logger.error(e, TAG);
                            errorCallback(err);
                        }
                    );
                },
                function (e) {
                    var err = {
                        code : LOCAL_FILE_SYSTEM_ERR,
                        message : "Error retrieving local file system",
                        values : [e]
                    };
                    sap.Logger.error(e, TAG);
                    errorCallback(err);
                }
            );

            //Set encryption option
            if (configData.encryption == "false") {
                encryptOption = false;
            }

            //Windows platforms are set to be non-encrypted
            if (device.platform === "windows") {
                encryptOption = false;
            }

            //Encryption setup
            if (encryptOption) {

                //Create directory for decrypted files
                createDecrypted = function(){
                    window.resolveLocalFileSystemURL(rootDir,
                        function(fileSystem) {
                        window.decryptRoot = fileSystem;
                        createDirectories('Decrypted', true,
                            function(directory) {
                                sap.Logger.debug("Decrypt root directory set.", TAG);
                                window.decryptRoot = directory;
                                window.decryptLocation = rootDir + subFolder;
                            },
                            function(e) {
                                var err = {
                                    code : LOCAL_FILE_SYSTEM_ERR,
                                    message : "Unable to set decrypt root directory: ",
                                    values : [e]
                                };
                                sap.Logger.error("Unable to set decrypt root directory:" + e, TAG);
                                errorCallback(err);
                            }
                        );
                    },
                    function (e) {
                        var err = {
                        code : LOCAL_FILE_SYSTEM_ERR,
                        message : "Error retrieving local file system",
                        values : [e]
                    };
                    sap.Logger.error("Error retrieving local file system", TAG);
                    errorCallback(err);
                    });
                };
                
                //Delete the old decrypted files
                window.resolveLocalFileSystemURL(rootDir+"Decrypted",
                    function(dir){
                        dir.removeRecursively(createDecrypted);
                    },
                    createDecrypted
                );
            }
        };

        //Check/Get file writing permissions
        //Windows platform does not support cordova.plugins.permissions
        if (device.platform !== "windows") {   
            var permissions = cordova.plugins.permissions;

            permissions.checkPermission(permissions.WRITE_EXTERNAL_STORAGE,function(status){
                if (!status.hasPermission) {
                    var error = function() {
                        var err = {
                            code : STORAGE_PERMISSION_NOT_ON,
                            message : "Storage permission is not turned on",
                            values : []
                        };
                        sap.Logger.warn("Storage permission is not turned on", TAG);
                        errorCallback(err);
                    };
                    var success = function success( status ) {
                        if( !status.hasPermission ) {
                            error();
                        } else {
                            CustomConfigParameters.get(callback,callback,['storageLocation','storageFolderName','encryption']);
                        }
                    };
                    permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE, success, error);
                } else {
                    CustomConfigParameters.get(callback,callback,['storageLocation','storageFolderName','encryption']);
                }
            });
        } else {
            CustomConfigParameters.get(callback,callback,['storageLocation','storageFolderName','encryption']);
        }
        
        //BCP 1980506593 [iOS][SMPSDK][WK] Cannot display remote information by document service
        //WKWebView handling for cross domain
        if (cordova.require("cordova/platform").id == "ios" && sap.Xhook &&
            window.webkit && window.webkit.messageHandlers) {
            var isDocumentServiceRequest = function (url) {
                if (url && url.indexOf("/mobileservices/persistence/v1/json") > -1) {
                    return true;
                }
                return false;
            };

            sap.Xhook.enable();
            sap.Xhook.before(function (request, callback) {
                if (isDocumentServiceRequest(request.url)) {
                    var normalizeRequest = function (request, done) {
                        if (request.body && request.body.entries && request.body.entries.length > 0) {
                            var file = null;
                            var url = request.url;
                            var entries = request.body.entries;
                            var length = entries.length;
                            //Check file content
                            for (var i = 0 ; i < length ; i++) {
                                var entry = entries[i];
                                if (entry[0] == 'content' && entry[1] && ((entry[1] instanceof Blob) || (entry[1] instanceof File))) {
                                    file = entry[1];
                                    entries.splice(i,1);
                                    break;
                                }
                            }
                            length = entries.length;
                            //If parameter value is boolean value, convert it to string
                            for (var i = 0 ; i < length ; i++) {
                                var entry = entries[i];
                                if (entry[1] && (typeof(entry[1]) == "boolean")) {
                                    entry[1] = entry[1].toString();
                                }
                            }
                            if (file) {
                                // Convert file to base64 so we can send over bridge
                                var fileReader = new FileReader();
                                fileReader.onload = function (event) {
                                    var content = event.target.result.split(",")[1];
                                    var entry = ['content', file.name, file.type, content];
                                    entries.push(entry);
                                    request.body = entries;
                                    done();
                                };
                                fileReader.readAsDataURL(file);
                            } else {
                                request.body = entries;
                                done();
                            }
                        } else {
                            done();
                        }
                    };
                    normalizeRequest(request, function () {
                        var httpClient = sap.AuthProxy.generateDocumentServiceHttpClient();
                        httpClient.request(
                            request,
                            function(response) {
                                callback({
                                    status: response.statusCode,
                                    statusText: response.statusText,
                                    text: response.body,
                                    headers: response.headers
                                });
                            },
                            function(response) {
                                callback({
                                    status: response.response.statusCode,
                                    statusText: response.response.statusText,
                                    text: response.response.body,
                                    headers: response.response.headers
                                });
                            }
                        );
                    });
                } else {
                    callback();
                }
            });
        }
    },
    
    /**
     * Delete all decrypted files on plugin exit
     * 
     * This function should be called when the application is being closed/loses focus. It deletes all files in the decrypted 
     * directory to prevent unauthorized access outside of the application.
     */
    exit : function (){
        if (window.decryptRoot != undefined) {
            window.decryptRoot.removeRecursively(
                function(){
                    sap.Logger.debug("Delete succeeded.", TAG);
                },
                function(){
                    sap.Logger.error("Delete failed.", TAG);
                }
            );
            window.decryptRoot = undefined;
        }
    },

    /**
     * @summary Create a new session to the CMIS document repository
     *
     * @description Creates a session that connects to the SAP server and prepares your application to utilize online features of the plugin.
     * 
     * @param {String}   serverURL       - URL to CPMs application
     * @param {Function} successCallback - Success callback function
     * @param {Function} errorCallback   - Error callback function
     * 
     * @example
     * sap.DocumentService.createSession("https://hcpms-ixxxxxxtrial.hanatrial.ondemand.com/mobileservices/persistence/v1/json/com.example.app/", successCallback, errorCallback);
     */
    createSession: function (serverURL, successCallback, errorCallback) {
        sap.Logger.debug("Attempting to connect to " + serverURL, TAG);
        url = serverURL;

        session = cmis.createSession(serverURL + "$metadata");

        session.loadRepositories( {
            request : {
                success : function(data) {
                    successCallback();
                },
                error : function(e) {
                    if (reauthenticateExpiredSession(e, errorCallback)) {
                        return;
                    } else {
                        var err = {
                            code : NETWORK_ERR,
                            message : "Connection Error: " + e.statusText,
                            values : [e]
                        };
                        sap.Logger.error("Connection Error: " + e.statusText, TAG);
                        errorCallback(err);
                    }
                },
                xhr : function(){
                    var xhr = new window.XMLHttpRequest();
                    xhr.timeout = REQUEST_TIMEOUT;

                    return xhr;
                }
            }
        });
    },

    /**
     * @summary Create a new folder in the specified path
     *
     * @description Creates a new folder in the remote repository of the connected session. 
     * 
     * @param {String}   folderName      - Name of the new folder
     * @param {String}   folderPath      - Path where the new folder is located
     * @param {Function} successCallback - Success callback function
     * @param {Function} errorCallback   - Error callback function
     * 
     * @example
     * sap.DocumentService.createFolder("New Folder", "/", successCallback, errorCallback);
     */
    createFolder: function (folderName, folderPath, successCallback, errorCallback) {
        checkConnection(function() {
            session.getObjectByPath(folderPath, {
            includeRelationships : 'both',
            request: {
                success : function(data) {
                    var folderId = data.properties['cmis:objectId'].value;
                    session.createFolder(folderId,folderName,null,null,null,{
                        request: {
                            success : function(data) {
                                sap.Logger.debug("Folder Create Success: " + folderName, TAG);
                                successCallback();
                            },
                            error : function(e) {
                                var err = {
                                    code : REMOTE_FILE_SYSTEM_ERR,
                                    message : "Folder Create Error: " + e.responseJSON.message,
                                    values : [e.responseJSON.message]
                                };
                                sap.Logger.error("Folder Create Error: " + e.responseJSON.message, TAG);
                                errorCallback(err);
                            }
                        }
                     });
                },
                error : function(e) {
                    var err = {
                        code : REMOTE_FILE_SYSTEM_ERR,
                        message : "Destination Folder does not exist " + e.responseJSON.message,
                        values : [e.responseJSON]
                    };
                    sap.Logger.error("Destination Folder does not exist " + e.responseJSON.message, TAG);
                    errorCallback(err);
                }
            }
        });
        },
        connectionFail
        );
    },

    /**
     * @summary Create a new local folder in the specified path
     *
     * @description Creates a new folder in the local repository of the connected session. 
     * 
     * @param {String}   folderPath      - Path where the new folder is located including the folder name
     * @param {Function} successCallback - Success callback function
     * @param {Function} errorCallback   - Error callback function
     * 
     * @example
     * sap.DocumentService.createLocalFolder("/New Folder", successCallback, errorCallback);
     */
    createLocalFolder: function (folderPath, successCallback, errorCallback) {
        createDirectories(folderPath, encryptOption, successCallback, errorCallback);
    },

    /**
     * @summary List remote files in specified path in JSON format
     *
     * @description Calls the remote server to obtain a list of all files in the specified path relative to the root folder. Returns an array 
     * containing objects representing a file or folder. The array also contains a boolean value that shows if the folder being 
     * listed is the root of the connected repository.
     *
     * <p>Return Structure:</p>
     * <ul>
     * <li>{</li>
     * <li>    isRootFolder: true</li>
     * <li>    Object[0]:{name:"Folder1Name", type:"CMIS Folder"},</li>
     * <li>    Object[1]:{name:"File1Name", type:"CMIS File"}</li>
     * <li>}</li>
     * <ul>
     * 
     * 
     * @param {String}   targetFolderPath - Path where the target folder is located
     * @param {Function} successCallback  - Success callback function
     * @param {Function} errorCallback    - Error callback function
     * 
     * @example
     * sap.DocumentService.listRemote("/", successCallback, errorCallback);
     */
    listRemote: function (targetFolderPath, successCallback, errorCallback) {
        checkConnection(function(){
            if (targetFolderPath == undefined) {
                targetFolderPath = "";
            }

            var url = "https://" + applicationContext.registrationContext.serverHost + "/mobileservices/persistence/v1/json/" + appId + targetFolderPath;
            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {

                        var children;
                        
                        try {
                            children = JSON.parse(this.responseText).objects;
                        } catch(e) {
                            var err = {
                                code : OBJECT_CANNOT_BE_PARSED,
                                message : "Error in Parsing Children: 0" + e,
                                values : []
                            };
                            sap.Logger.error("Error in Parsing Children: 0" + e, TAG);
                            errorCallback(err);
                        }

                        fileArray = [];

                        for (var i = 0, len = children.length; i < len; i++) {

                            var type;
                            if(children[i].object.properties["cmis:objectTypeId"].value == "cmis:folder"){
                                type = "CMIS Folder";
                            }
                            else if(children[i].object.properties["cmis:objectTypeId"].value == "cmis:document"){
                                type = "CMIS File";
                            } else {
                                var err = {
                                    code : FILE_TYPE_INCORRECT,
                                    message : "File Type Error",
                                    values : []
                                };
                                sap.Logger.error("File Type Error", TAG);
                                errorCallback(err);
                            }

                            var file = {
                                "name": children[i].object.properties["cmis:name"].value,
                                "type": type
                            };

                            fileArray.push(file);
                        }

                        successCallback( {"isRootFolder": isRootFolder(targetFolderPath), "files" : fileArray} );

                    }
                    else {
                        var err = {
                            code : NETWORK_ERR,
                            message : "List Files Error",
                            values : []
                        };
                        sap.Logger.error("List Files Error", TAG);
                        errorCallback(err);
                    }
                }
            };

            xmlhttp.open("GET", url, true);
            xmlhttp.send();
        },
        connectionFail
        );
    },

    /**
     * @summary List local files in specified path in JSON format
     *
     * @description Calls the local system to obtain a list of all files in the specified path relative to the root folder. Returns an array 
     * containing objects representing a file or folder. The array also contains a boolean value that shows if the folder being 
     * listed is the root of the connected repository.
     *
     * <p>Return Structure:</p>
     * <ul>
     * <li>{</li>
     * <li>    isRootFolder: true</li>
     * <li>    Object[0]:{name:"Folder1Name", type:"Local Folder"},</li>
     * <li>    Object[1]:{name:"File1Name", type:"Local File"}</li>
     * <li>}</li>
     * </ul>
     * 
     * 
     * @param {String}   targetFolderPath - Local path to list all the files/folders
     * @param {Function} successCallback  - Success callback function
     * @param {Function} errorCallback    - Error callback function
     * 
     * @example
     * sap.DocumentService.listLocalFiles("/",successCallback, errorCallback);
     */
    listLocal: function (targetFolderPath, successCallback, errorCallback) {
        function success(entry){
            var fileArray = [];
            var dirReader = entry.createReader();

            dirReader.readEntries(
                function (entries) {
                    var i;
                    for (i = 0; i < entries.length; i++) {
                        var type;
                        var name = entries[i].name;

                        if (entries[i].isDirectory) {
                            type = "Local Folder";
                        } else if(entries[i].isFile){
                            type = "Local File";
                        } else{
                            var err = {
                                code : FILE_TYPE_INCORRECT,
                                message : "File Type Error",
                                values : []
                            };
                            sap.Logger.error("File Type Error", TAG);
                            errorCallback(err);
                        }

                        var file = {
                            "name" : name,
                            "type" : type,
                            "url"  : entries[i].nativeURL
                        };

                        if (encryptOption && name.substring(name.length-5,name.length) =='.encr') {
                            file.name = name.slice(0,-5);
                            file.encrypted = true;
                        }

                        if(name.substring(name.length-8,name.length) =='.partial'){
                            file.name = name.slice(0,-8);
                            file.partial = true;
                        }

                        if(name.substring(name.length-17,name.length) !='.partial.download'){
                            fileArray.push(file);
                        }
                    }

                    successCallback( {"isRootFolder": isRootFolder(targetFolderPath), "files" : fileArray} );
                },
            
                function (error) {
                    var err = {
                        code : LOCAL_FILE_SYSTEM_ERR,
                        message : "ReadEntries error: " + error.code,
                        values : [error]
                    };
                    sap.Logger.error("ReadEntries error: " + error.code, TAG);
                    errorCallback(err);
                }
            );

        }

        function error(e) {
            if (e.code == 1) {
                var err = {
                    code : LOCAL_FILE_SYSTEM_ERR,
                    message : "There is no local file",
                    values : [e]
                };
                sap.Logger.error("There is no local file", TAG);
                errorCallback(err);
            } else if (e.code == 4) {
                var err = {
                    code : LOCAL_FILE_SYSTEM_ERR,
                    message : "Local file is not readable",
                    values : [e]
                };
                sap.Logger.error("Local file is not readable", TAG);
                errorCallback(err);
            } else {
                var err = {
                    code : LOCAL_FILE_SYSTEM_ERR,
                    message : "Error when reading local file, Error Code: "+ e.code,
                    values : [e]
                };
                sap.Logger.error("Error when reading local file, Error Code: "+ e.code, TAG);
                errorCallback(err);
            }
        }

        window.resolveLocalFileSystemURL(window.storageLocation + targetFolderPath,success,error);
    },

    /**
     * @summary Delete a File/Folder from remote server
     *
     * @description Deletes a file on the remote server. File is located at the provided file path and the path is relative to the root folder
     * of the repository. Calls the error callback if remote folder is not empty.
     * 
     * @param {String}   filePath        - Path where the file/folder is located
     * @param {Function} successCallback - Success callback function
     * @param {Function} errorCallback   - Error callback function
     * 
     * @example
     * sap.DocumentService.deleteRemote("/", successCallback, errorCallback);
     */
    deleteRemote: function (filePath, successCallback, errorCallback) {
        checkConnection(function() {
            session.getObjectByPath(filePath, {
                includeRelationships : 'both',
                request: {
                    success : function(data){
                        
                        session.deleteObject(data.properties['cmis:objectId'].value, null, {
                            request: {
                                success : function(res){
                                    sap.Logger.debug("Delete complete", TAG);
                                    successCallback();
                                },
                                error : function(xhr, status, error){
                                    if( xhr.status == 200 ){
                                        sap.Logger.debug("Delete complete", TAG);
                                        successCallback();
                                    } else{
                                        var err = {
                                            code : REMOTE_FILE_SYSTEM_ERR,
                                            message : "Could not delete file: ",
                                            values : [error]
                                        };
                                        sap.Logger.error("Could not delete file: " + error, TAG);
                                        errorCallback(err);
                                    }
                                }
                            }
                        });

                    },
                    error : function(e) {
                        var err = {
                            code : REMOTE_FILE_SYSTEM_ERR,
                            message : "Destination Folder does not exist" + e.responseJSON.message,
                            values : [e.responseJSON]
                        };
                        sap.Logger.error("Destination Folder does not exist: " + e.responseJSON.message, TAG);
                        errorCallback(err);
                    }
                }
            });
        },
        connectionFail
        );
    },
    
    /**
     * @summary Delete a File/Folder from local device
     *
     * @description Deletes a file on the local device. File is located at the provided file path and the path is relative to the root folder
     * of the repository.
     * 
     * @param {String}   filePath        - Path where the file/folder is located
     * @param {Function} successCallback - Success callback function
     * @param {Function} errorCallback   - Error callback function
     * 
     * @example
     * sap.DocumentService.deleteLocal("/", successCallback, errorCallback);
     */
    deleteLocal: function (filePath, successCallback, errorCallback) {
        var triedEncr = false;
        function success(entry) {
            var deleteSuccess = function(){
                sap.Logger.debug("Target file/folder deleted", TAG);
                successCallback();
            };
            var deleteError = function(e){
                var err = {
                    code : LOCAL_FILE_SYSTEM_ERR,
                    message : "Delete failed, error code: " + e.code,
                    values : [e]
                };
                sap.Logger.error("Delete failed, error code: " + e.code, TAG);
                errorCallback(err);
            };
            if (entry.isFile) {
                entry.remove(deleteSuccess,deleteError);
            } else {
                entry.removeRecursively(deleteSuccess,deleteError);
            }
        }

        function error(e) {
            //Catch for encrypted files
            if (encryptOption && !triedEncr) {
                filePath+='.encr';
                triedEncr = true;
                window.resolveLocalFileSystemURL(window.storageLocation + filePath, success, error);
            } else {
                var err = {
                    code : LOCAL_FILE_SYSTEM_ERR,
                    message : "File doesn't exist locally",
                    values : [e]
                };
                sap.Logger.error("File doesn't exist locally", TAG);
                errorCallback(err);
            }
        }

        window.resolveLocalFileSystemURL(window.storageLocation + filePath, success, error);
    },

    /**
     * @summary Checks whether a file exists locally
     *
     * @description Checks if a file exists locally and calls the success callback with the string concatenation of the 
     * filename, a colon (:) and a boolean.
     * 
     * @param {String}   filePath        - Path where the downloaded file is located
     * @param {Function} successCallback - Success callback function
     * @param {Function} errorCallback   - Error callback function
     * 
     * @example
     * sap.DocumentService.isFileDownloaded("/Mario/koopa.png", successCallback, errorCallback);
     */
    isFileDownloaded: function (filePath, successCallback, errorCallback) {
        
        var fileName = filePath.substring(filePath.lastIndexOf('/')+1,filePath.length);
        var searchPath = window.storageLocation + filePath;
        var triedEncr = false;
        var triedPartial = false;
        
        var file = {
            "name": fileName,
            "downloaded" : false,
            "partial" : false,
            "encrypted" : false
        };

        function fileFound(e) {
            file.downloaded = true;
            
            if(triedPartial){
                file.partial = true;
            }

            if(triedEncr){
                file.encrypted = true;
            }

            successCallback(file);
        }

        function fileNotFound(e) {
            //Catch for encrypted and partial files
            if (encryptOption && !triedEncr) {
                var encrSearhPath = searchPath + '.encr';
                triedEncr = true;
                window.resolveLocalFileSystemURL(encrSearhPath, fileFound, fileNotFound);
            } else if (!triedPartial) {
                var partialSearhPath = searchPath + '.partial';
                triedPartial = true;
                window.resolveLocalFileSystemURL(partialSearhPath, fileFound, fileNotFound);
            } else {
                file.downloaded = false;
                successCallback(file);
            }
        }

        window.resolveLocalFileSystemURL(searchPath, fileFound, fileNotFound);
    },

    /**
     * @summary Download specified file/folder from the server to the device
     *
     * @description Download the specified file path, which should be given relative to the remote repository root, to the equivalent local folder. 
     * It creates intermediate folders if necessary. If the overwrite flag is set, existing local files/folders will be replaced with the remote 
     * copy. If not, it calls the error callback with an error object showing the details of the conflicting files.
     *
     * @param {String}   filePath         - Path of file/folder on the server, defaults to root
     * @param {boolean}  overwrite        - Overwrite existing local files
     * @param {Function} successCallback  - Success callback function
     * @param {Function} errorCallback    - Error callback function
     * @param {Function} progressCallback - Progress callback function
     * 
     * @example
     * sap.DocumentService.download('/', successCallback, errorCallback, progressCallback);
     */
    download: function (filePath, overwrite, successCallback, errorCallback, progressCallback) {
        if (filePath == undefined) {
            filePath = "/";
        }
        checkConnection(
            function(){
                var uri = encodeURI(url + filePath);
                var path = filePath;
                var localPath = window.storageLocation + filePath;
                var destFolderPath = path.substring(0, path.lastIndexOf('/')+1);

                // Check remote file/folder exists
                session.getObjectByPath(filePath, {
                    includeRelationships : 'both',
                    request: {
                        success : function(data){
                            var fileName = data.properties["cmis:name"].value;

                            if(data.properties["cmis:objectTypeId"].value == "cmis:document") {

                                //If file, Download File
                                if (encryptOption) path+='.encr';
                                var pathloc = path;
                                if (path[0]=='/') { 
                                    pathloc = path.substring(1); 
                                }

                                //Check for existence of local file
                                window.fsRoot.getFile(pathloc, {create: false},
                                    function(fileEntry){
                                        //Force Download and overwrite
                                        if(overwrite){

                                            sap.Logger.warn("Overwriting old file.", TAG);
                                            //To use getDirectory function, remove slashes from the beginning and the end of the path string
                                            window.fsRoot.getDirectory(destFolderPath.substring(1, destFolderPath.length-1), { create: false },
                                                function(parentDirectory){
                                                    // Remove old file
                                                    fileEntry.remove(null, 
                                                        function (e) {
                                                            var err = {
                                                                code : LOCAL_FILE_SYSTEM_ERR,
                                                                message : "Error deleting existing file",
                                                                values : [e]
                                                            };
                                                            sap.Logger.error("Error deleting existing file.", TAG);
                                                            errorCallback(err);
                                                        }
                                                    );

                                                    // Create new partial file for download
                                                    parentDirectory.getFile(fileName + ".partial", {create: true, exclusive: false},
                                                        function (fileEntry) {
                                                            doDownload(destFolderPath, uri, fileEntry, data.properties["cmis:contentStreamLength"].value, successCallback, errorCallback, progressCallback);
                                                        }, function (e) {
                                                            var err = {
                                                                code : LOCAL_FILE_SYSTEM_ERR,
                                                                message : "Error creating partial download file",
                                                                values : [e]
                                                            };
                                                            sap.Logger.error("Error creating partial download file", TAG);
                                                            errorCallback(err);
                                                        }
                                                    );

                                                }, 
                                                function (e) {
                                                    var err = {
                                                        code : LOCAL_FILE_SYSTEM_ERR,
                                                        message : "Error getting parent Directory",
                                                        values : [e]
                                                    };
                                                    sap.Logger.error(e, TAG);
                                                    errorCallback(err);
                                                }

                                            );
                                            
                                        } else { 

                                            //Local file exists. Get details and call error callback
                                            fileEntry.getMetadata(
                                                function(metadata){

                                                    var fileURL = fileEntry.toURL(); 
                                                    if ( encryptOption && fileURL.substring( fileURL.length-5 , fileURL.length ) =='.encr' ){
                                                        fileURL = fileURL.slice(0,-5);
                                                        path = path.slice(0,-5);
                                                    }

                                                    var lastSyncTime = parseInt(storage.getItem(fileURL));
                                                    lastSyncTime = isNaN(lastSyncTime) ? 0 : lastSyncTime;

                                                    var file = {
                                                        "fileName": fileName,
                                                        "url" : path,
                                                        "fullPath" : fileURL,
                                                        "localLastModifiedTime" : metadata.modificationTime.getTime(),
                                                        "remoteLastModifiedTime" : data.properties["cmis:lastModificationDate"].value,
                                                        "lastSyncTime" : lastSyncTime,
                                                        "encrypted" : encryptOption
                                                    };

                                                    var err = {
                                                        code : LOCAL_FILE_SYSTEM_ERR,
                                                        message : "Local File already exists",
                                                        values : [file]
                                                    };
                                                    sap.Logger.error("Local File already exists", TAG);
                                                    errorCallback(err);

                                                },
                                                function(e){
                                                    var err = {
                                                        code : LOCAL_FILE_SYSTEM_ERR,
                                                        message : "Unable to retrieve file Metadata",
                                                        values : [e]
                                                    };
                                                    sap.Logger.error("Unable to retrieve file Metadata", TAG);
                                                    errorCallback(err);
                                                }
                                            );
                                        }
                                    },
                                    function(error) {

                                        if(error.code == 1){

                                            //File Created
                                            createDirectories(destFolderPath, false,
                                                function(fileSystem){
                                                    fileSystem.getFile(fileName + ".partial", {create: true, exclusive: false},
                                                        function (fileEntry) {
                                                            doDownload(destFolderPath, uri, fileEntry, data.properties["cmis:contentStreamLength"].value, successCallback, errorCallback, progressCallback);
                                                        }, function (e) {
                                                            var err = {
                                                                code : LOCAL_FILE_SYSTEM_ERR,
                                                                message : "Error creating file",
                                                                values : [e]
                                                            };
                                                            sap.Logger.error("Error creating file", TAG);
                                                            errorCallback(err);
                                                        }
                                                    );
                                                },
                                                function (e) {
                                                    var err = {
                                                        code : LOCAL_FILE_SYSTEM_ERR,
                                                        message : "Error creating directories",
                                                        values : [e]
                                                    };
                                                    sap.Logger.error(e, TAG);
                                                    errorCallback(err);
                                                }
                                            );
                                        
                                        } else {
                                            var err = {
                                                code : LOCAL_FILE_SYSTEM_ERR,
                                                message : "Unable to find local file, error code: " + error.code,
                                                values : [error]
                                            };
                                            sap.Logger.error("Unable to find local file", TAG);
                                            errorCallback(err);
                                        }
                                    }
                                );
                        

                            } else {

                                //If folder, recursively download each file and sub-folder 
                                var xmlhttp = new XMLHttpRequest();
                                xmlhttp.onreadystatechange = function() {
                                    if (xmlhttp.readyState == 4) {
                                        if (xmlhttp.status == 200) {
                                            var children = JSON.parse(this.responseText);

                                            var numFiles = children.objects.length;

                                            //Tracks number of downloaded files before sending success callback
                                            var fileSuccess = function(message){
                                                numFiles = numFiles - 1;
                                                if (numFiles == 0){
                                                    successCallback(message);
                                                }
                                            };

                                            var fileError = function(message){
                                                errorCallback(message);
                                                numFiles = numFiles - 1;
                                                if (numFiles == 0){
                                                    successCallback(message);
                                                }
                                            };

                                            if(children.objects.length == 0){
                                                sap.Logger.debug("Download Folder Empty.", TAG);
                                                sap.DocumentService.createLocalFolder(filePath, successCallback, errorCallback);
                                            }

                                            for (var i = 0; i <children.objects.length; i++) {
                                                if (children.objects[i].object.properties["cmis:baseTypeId"].value == 'cmis:folder') {
                                                    var folderName = children.objects[i].object.properties["cmis:name"].value;
                                                    if (filePath.slice(-1) !== "/") {
                                                        filePath = filePath + "/";
                                                    }
                                                    sap.DocumentService.download(filePath + folderName, overwrite, fileSuccess, fileError, progressCallback);
                                                } else {
                                                    var name = children.objects[i].object.properties["cmis:name"].value;
                                                     if (filePath.slice(-1) !== "/") {
                                                        filePath = filePath + "/";
                                                    }
                                                    sap.DocumentService.download(filePath + name, overwrite, fileSuccess, fileError, progressCallback);
                                                }
                                            }

                                        } else {
                                            var err = {
                                                code : NETWORK_ERR,
                                                message : "Download error code: " + xmlhttp.status,
                                                values : []
                                            };
                                            sap.Logger.error("Download error code " + xmlhttp.status, TAG);
                                            errorCallback(err);
                                        }
                                    }
                                };
                                xmlhttp.open("GET", uri, true);
                                xmlhttp.setRequestHeader("Accept", "application/xml");
                                xmlhttp.send();
                            }
                        },
                        error : function(e) {
                            //Remote File/Folder does not exist
                            var err = {
                                code : REMOTE_FILE_SYSTEM_ERR,
                                message : "Remote source path does not exist: " + e.responseJSON.message,
                                values : [e.responseJSON]
                            };
                            sap.Logger.error("Remote source path does not exist: " + e.responseJSON.message, TAG);
                            errorCallback(err);
                        }
                    }
                }
            );
        },
        connectionFail
        );
    },

    /**
     * @summary Upload specified file/folder from the device to the server
     * 
     * @description Upload the specified file path, which should be given relative to the local repository root, to the equivalent remote folder. 
     * If the remote destination folder does not exist, an error is thrown. If the overwrite flag is set, existing remote files/folders will be 
     * replaced with the local copy. If not, it calls the error callback with an error object showing the details of the conflicting files. This
     * function does not exist if encryption is on because files in the local repository are not modifiable.
     * 
     * @param {String}   filePath         - Path of file/folder on the device, defaults to root
     * @param {boolean}  overwrite        - Overwrite existing remote files
     * @param {Function} successCallback  - Success callback function
     * @param {Function} progressCallback - Progress callback function
     * 
     * @example
     * sap.DocumentService.upload('/', successCallback, errorCallback);
     */
    upload: function (filePath, overwrite, successCallback, errorCallback, progressCallback) {

        //Upload disabled for encryption because files are not modifiable.
        if( encryptOption ) {
            sap.Logger.error("Encryption On. Upload Disabled", TAG);
            return;
        }

        if (filePath == undefined) {
            filePath = "/";
        }

        var path = filePath;
        var uri = encodeURI(url + filePath);
        var destFolderPath = path.substring(0, path.lastIndexOf('/')+1);
        var localPath = window.storageLocation + filePath;

        checkConnection(function(){
            
            //Check if path exists locally
            window.resolveLocalFileSystemURL( localPath,
                function(entry){

                    //Local file exists
                    if(entry.isFile){
                        
                        //Check if remote file exists
                        session.getObjectByPath(path, {
                            includeRelationships : 'both',
                            request: {
                                success : function(data){
                                    
                                    //Remote file exists
                                    var fileName = data.properties["cmis:name"].value;
                                    var fileID = data.properties["cmis:objectId"].value;

                                    if(data.properties["cmis:objectTypeId"].value == "cmis:document" && overwrite){
                                    
                                        //Force Upload and overwrite
                                        doUploadPath(destFolderPath, fileID, entry, successCallback, errorCallback, progressCallback);
                                    } else { 

                                        //Remote file/folder exists. Get details and call error callback
                                        entry.getMetadata(
                                            function(metadata){

                                                var fileURL = entry.toURL(); 

                                                var lastSyncTime = parseInt(storage.getItem(fileURL));
                                                lastSyncTime = isNaN(lastSyncTime) ? 0 : lastSyncTime;

                                                var file = {
                                                    "fileName": fileName,
                                                    "url" : path,
                                                    "fullPath" : entry.nativeURL,
                                                    "localLastModifiedTime" : metadata.modificationTime.getTime(),
                                                    "remoteLastModifiedTime" : data.properties["cmis:lastModificationDate"].value,
                                                    "lastSyncTime" : lastSyncTime
                                                };

                                                var code;
                                                if (data.properties["cmis:objectTypeId"].value == "cmis:document" ){
                                                    ercode = REMOTE_FILE_SYSTEM_ERR;
                                                } else {
                                                    ercode = REMOTE_FILE_SYSTEM_ERR;
                                                }

                                                var err = {
                                                    code : ercode,
                                                    message : "Remote File already exists",
                                                    values: [file]
                                                };
                                                sap.Logger.error("Remote File already exists", TAG);
                                                errorCallback(err);

                                            },
                                            function(e){
                                                var err = {
                                                    code : LOCAL_FILE_SYSTEM_ERR,
                                                    message : "Unable to retrieve file Metadata",
                                                    values : [e]
                                                };
                                                sap.Logger.error("Unable to retrieve file Metadata", TAG);
                                                errorCallback(err);
                                            }
                                        );
                                    }
                                },
                                error : function(e) {
                                    
                                    if(e.responseJSON.exception == "objectNotFound"){
                                        //Remote file does not exist, do upload
                                        doUploadPath(destFolderPath, null, entry, successCallback, errorCallback, progressCallback);

                                    } else{
                                        var err = {
                                            code : NETWORK_ERR,
                                            message : "Error in server connection: " + e.responseJSON.message,
                                            values : [e.responseJSON]
                                        };
                                        sap.Logger.error("Error in server connection: " + e.responseJSON.message, TAG);
                                        errorCallback(err);
                                    }
                                }
                            }
                        });

                    } else {
                        //If path is a folder
                        sap.Logger.debug("Uploading Folder: " + path, TAG);

                        var reader = entry.createReader();

                        var onFolderExist = function (subEntries) {
                            if(subEntries.length == 0){
                                sap.Logger.debug("Upload Folder Empty: ", TAG);
                                successCallback();
                            }

                            for(var i=0; i < subEntries.length ; i++){
                                var entryPath = subEntries[i].fullPath.substring(subEntries[i].fullPath.indexOf("/", 2), subEntries[i].fullPath.length+1 );
                                sap.DocumentService.upload( entryPath, overwrite, successCallback, errorCallback, progressCallback);
                            }   
                        };

                        var success = function(entries){
                            //local folder read success
                            session.getObjectByPath(path, {
                                includeRelationships : 'both',
                                request: {
                                    success : function(data){
                                        //Remote folder exists
                                        onFolderExist(entries);                               
                                    },
                                    error : function(e) {
                                        if(e.responseJSON.exception == "objectNotFound"){
                                            //Remote folder does not exist, create remote folder
                                            if(filePath.slice(-1) === "/"){
                                                filePath = filePath.slice(0, -1);
                                            }
                                            var slashIndex = filePath.lastIndexOf("/");
                                            var folderName = filePath.slice(slashIndex+1);
                                            var folderPath = filePath.substring(0, slashIndex);
                                            sap.DocumentService.createFolder(folderName, folderPath, function() {
                                                onFolderExist(entries);
                                            }, errorCallback);
                                        } else{
                                            var err = {
                                                code : NETWORK_ERR,
                                                message : "Error in server connection: " + e.responseJSON.message,
                                                values : [e.responseJSON]
                                            };
                                            sap.Logger.error("Error in server connection: " + e.responseJSON.message, TAG);
                                            errorCallback(err);
                                        }
                                    }
                                }
                            });
                        };

                        var error = function(e) {
                            var err = {
                                code : LOCAL_FILE_SYSTEM_ERR,
                                message : "Error reading Directory: " + e.responseJSON.message,
                                values : [e.responseJSON]
                            };
                            sap.Logger.error("Error reading Directory: " + e.responseJSON.message, TAG);
                            errorCallback(err);
                        };

                        reader.readEntries(success, error);
                    }
                },
                function(file){
                    var err = {
                        code : LOCAL_FILE_SYSTEM_ERR,
                        message : "File path does not exist: " + path,
                        values : []
                    };
                    sap.Logger.error("File path does not exist: " + path, TAG);
                    errorCallback(err);
                }
            );
        },
        connectionFail
        );
    },

    /**
     * @summary Upload a file using the webview file chooser to to the specified path
     *
     * @description Used to upload files that are returned when an html input element is used to select the file from the device 
     * to be uploaded to the specified destination folder. The folder path must be given relative to the remote root folder.
     *
     * @param {String}   destFolderPath   - Path where the destination folder is located
     * @param {File}     file             - File object being uploaded
     * @param {Function} successCallback  - Success callback function
     * @param {Function} errorCallback    - Error callback function
     * @param {Function} progressCallback - Progress callback function
     * 
     * @example
     * sap.DocumentService.uploadWithFilePicker("/", successCallback, errorCallback);
     */
    uploadWithFilePicker: function (destFolderPath, file, successCallback, errorCallback, progressCallback) {

        //Upload disabled for encryption because files are not modifiable.
        if( encryptOption ) {
            sap.Logger.error("Encryption On. Upload Disabled", TAG);
            return;
        }

        if (destFolderPath == undefined) {
            destFolderPath = "/";
        }

        checkConnection(function(){
            var dest = destFolderPath;
            doUploadWithFilePicker(destFolderPath, file, successCallback, errorCallback);
        },
        connectionFail
        );
    },

    /**
     * @summary Sync updates of the specified files between the server and the device.
     *
     * @description Syncs files by first performing a download and then an upload. Path must be provided relative to the root folder.
     * 
     * @param {String}   filePath         - Path of file/folder on the device/remote server to sync, defaults to root
     * @param {Function} successCallback  - Success callback function
     * @param {Function} errorCallback    - Error callback function
     * @param {Function} progressCallback - Progress callback function
     * 
     * @example
     * sap.DocumentService.synchronization('/', successCallback, errorCallback);
     */
    synchronization: function (filePath, successCallback, errorCallback, progressCallback) {
        
        if (filePath == undefined) {
            filePath = "/";
        }

        var success = function(){
            sap.Logger.debug("Synch Complete.", TAG);
            successCallback();
        };

        var doUpload = function(){

            sap.DocumentService.upload(filePath, true, success , errorCallback, progressCallback);

        };

        sap.DocumentService.download(filePath, true, doUpload, errorCallback, progressCallback);
    },
    
    /**
     * @summary Opens a local file
     * 
     * @description Use the attachment viewer plugin to open the target file. If the encryption option is on, decrypt the file before opening.
     *
     * @param {String}   filePath        - Path of the file to open
     * @param {Function} successCallback - Success callback function
     * @param {Function} errorCallback   - Error callback function
     *
     * @example
     * sap.DocumentService.openFile("/Mario/koopa.png", successCallback, errorCallback);
     */
    openFile: function (filePath, successCallback, errorCallback){
        
        if (encryptOption==false){
            if(device.platform === 'windows') {
                window.open(window.storageLocation+filePath,'_system');
                return;
            }
            window.open(window.storageLocation+filePath,'_blank');
            return;
        } else {
            filePath+='.encr';
        }

        if (filePath[0]=='/') { 
            filePath=filePath.substring(1);
        }

        //Get local File
        window.fsRoot.getFile(filePath,
            {create: false}, 
            function(fs){
                var folderPath = filePath.substring(0,filePath.lastIndexOf('/'));

                //Create temporary location for decrypted file and copy encrypted file
                createDirectories(folderPath, true,
                    function(tfs){
                        fs.copyTo(tfs,filePath.substring(filePath.lastIndexOf('/')+1,filePath.length),
                            function(copy){
                                
                                var store = new sap.EncryptedStorage("decryptStore");
                                
                                //Decrypt and open file.
                                encryptionStore.decryptFileWithStorePassword(decodeURIComponent(copy.nativeURL.substring(7)),
                                    null,
                                    function(decryptedFile){
                                        window.open(decryptedFile,'_blank');
                                        successCallback(decryptedFile);
                                    },
                                    function(e){
                                        var err = {
                                            code : FILE_DECRYPTION_FAIL,
                                            message : "Failed to decrypt file using stored password",
                                            values : [e]
                                        };
                                        sap.Logger.error("Failed to decrypt file using stored password", TAG);
                                        errorCallback(err);
                                    }
                                );
                            },
                            function(e) {
                                var err = {
                                    code : LOCAL_FILE_SYSTEM_ERR,
                                    message : "Failed to copy to temporary file",
                                    values : [e]
                                };
                                sap.Logger.error("Failed to copy to temporary file", TAG);
                                errorCallback(err);
                            }
                        );
                    },
                    function(e) {
                        var err = {
                            code : LOCAL_FILE_SYSTEM_ERR,
                            message : "Unable to set Root Directory",
                            values : [e]
                        };
                        sap.Logger.error(e, TAG);
                        errorCallback(err);
                    }
                );
            },
            function(e) {
                var err = {
                    code : LOCAL_FILE_SYSTEM_ERR,
                    message : "Unable to find local file, error code: " + e.code,
                    values : [e]
                };
                sap.Logger.error("Unable to find local file", TAG);
                errorCallback(err);
            }
        );
    }
 
};
