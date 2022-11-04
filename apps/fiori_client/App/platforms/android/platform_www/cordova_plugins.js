cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-camera.Camera",
      "file": "plugins/cordova-plugin-camera/www/CameraConstants.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "Camera"
      ]
    },
    {
      "id": "cordova-plugin-camera.CameraPopoverOptions",
      "file": "plugins/cordova-plugin-camera/www/CameraPopoverOptions.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "CameraPopoverOptions"
      ]
    },
    {
      "id": "cordova-plugin-camera.camera",
      "file": "plugins/cordova-plugin-camera/www/Camera.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "navigator.camera"
      ]
    },
    {
      "id": "cordova-plugin-camera.CameraPopoverHandle",
      "file": "plugins/cordova-plugin-camera/www/CameraPopoverHandle.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "CameraPopoverHandle"
      ]
    },
    {
      "id": "cordova-plugin-device.device",
      "file": "plugins/cordova-plugin-device/www/device.js",
      "pluginId": "cordova-plugin-device",
      "clobbers": [
        "device"
      ]
    },
    {
      "id": "cordova-plugin-dialogs.notification",
      "file": "plugins/cordova-plugin-dialogs/www/notification.js",
      "pluginId": "cordova-plugin-dialogs",
      "merges": [
        "navigator.notification"
      ]
    },
    {
      "id": "cordova-plugin-dialogs.notification_android",
      "file": "plugins/cordova-plugin-dialogs/www/android/notification.js",
      "pluginId": "cordova-plugin-dialogs",
      "merges": [
        "navigator.notification"
      ]
    },
    {
      "id": "cordova-plugin-file.DirectoryEntry",
      "file": "plugins/cordova-plugin-file/www/DirectoryEntry.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.DirectoryEntry"
      ]
    },
    {
      "id": "cordova-plugin-file.DirectoryReader",
      "file": "plugins/cordova-plugin-file/www/DirectoryReader.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.DirectoryReader"
      ]
    },
    {
      "id": "cordova-plugin-file.Entry",
      "file": "plugins/cordova-plugin-file/www/Entry.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.Entry"
      ]
    },
    {
      "id": "cordova-plugin-file.File",
      "file": "plugins/cordova-plugin-file/www/File.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.File"
      ]
    },
    {
      "id": "cordova-plugin-file.FileEntry",
      "file": "plugins/cordova-plugin-file/www/FileEntry.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.FileEntry"
      ]
    },
    {
      "id": "cordova-plugin-file.FileError",
      "file": "plugins/cordova-plugin-file/www/FileError.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.FileError"
      ]
    },
    {
      "id": "cordova-plugin-file.FileReader",
      "file": "plugins/cordova-plugin-file/www/FileReader.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.FileReader"
      ]
    },
    {
      "id": "cordova-plugin-file.FileSystem",
      "file": "plugins/cordova-plugin-file/www/FileSystem.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.FileSystem"
      ]
    },
    {
      "id": "cordova-plugin-file.FileUploadOptions",
      "file": "plugins/cordova-plugin-file/www/FileUploadOptions.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.FileUploadOptions"
      ]
    },
    {
      "id": "cordova-plugin-file.FileUploadResult",
      "file": "plugins/cordova-plugin-file/www/FileUploadResult.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.FileUploadResult"
      ]
    },
    {
      "id": "cordova-plugin-file.FileWriter",
      "file": "plugins/cordova-plugin-file/www/FileWriter.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.FileWriter"
      ]
    },
    {
      "id": "cordova-plugin-file.Flags",
      "file": "plugins/cordova-plugin-file/www/Flags.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.Flags"
      ]
    },
    {
      "id": "cordova-plugin-file.LocalFileSystem",
      "file": "plugins/cordova-plugin-file/www/LocalFileSystem.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.LocalFileSystem"
      ],
      "merges": [
        "window"
      ]
    },
    {
      "id": "cordova-plugin-file.Metadata",
      "file": "plugins/cordova-plugin-file/www/Metadata.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.Metadata"
      ]
    },
    {
      "id": "cordova-plugin-file.ProgressEvent",
      "file": "plugins/cordova-plugin-file/www/ProgressEvent.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.ProgressEvent"
      ]
    },
    {
      "id": "cordova-plugin-file.fileSystems",
      "file": "plugins/cordova-plugin-file/www/fileSystems.js",
      "pluginId": "cordova-plugin-file"
    },
    {
      "id": "cordova-plugin-file.requestFileSystem",
      "file": "plugins/cordova-plugin-file/www/requestFileSystem.js",
      "pluginId": "cordova-plugin-file",
      "clobbers": [
        "window.requestFileSystem"
      ]
    },
    {
      "id": "cordova-plugin-file.resolveLocalFileSystemURI",
      "file": "plugins/cordova-plugin-file/www/resolveLocalFileSystemURI.js",
      "pluginId": "cordova-plugin-file",
      "merges": [
        "window"
      ]
    },
    {
      "id": "cordova-plugin-file.isChrome",
      "file": "plugins/cordova-plugin-file/www/browser/isChrome.js",
      "pluginId": "cordova-plugin-file",
      "runs": true
    },
    {
      "id": "cordova-plugin-file.androidFileSystem",
      "file": "plugins/cordova-plugin-file/www/android/FileSystem.js",
      "pluginId": "cordova-plugin-file",
      "merges": [
        "FileSystem"
      ]
    },
    {
      "id": "cordova-plugin-file.fileSystems-roots",
      "file": "plugins/cordova-plugin-file/www/fileSystems-roots.js",
      "pluginId": "cordova-plugin-file",
      "runs": true
    },
    {
      "id": "cordova-plugin-file.fileSystemPaths",
      "file": "plugins/cordova-plugin-file/www/fileSystemPaths.js",
      "pluginId": "cordova-plugin-file",
      "merges": [
        "cordova"
      ],
      "runs": true
    },
    {
      "id": "cordova-plugin-geolocation.geolocation",
      "file": "plugins/cordova-plugin-geolocation/www/android/geolocation.js",
      "pluginId": "cordova-plugin-geolocation",
      "clobbers": [
        "navigator.geolocation"
      ]
    },
    {
      "id": "cordova-plugin-geolocation.PositionError",
      "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
      "pluginId": "cordova-plugin-geolocation",
      "runs": true
    },
    {
      "id": "es6-promise-plugin.Promise",
      "file": "plugins/es6-promise-plugin/www/promise.js",
      "pluginId": "es6-promise-plugin",
      "runs": true
    },
    {
      "id": "cordova-plugin-screen-orientation.screenorientation",
      "file": "plugins/cordova-plugin-screen-orientation/www/screenorientation.js",
      "pluginId": "cordova-plugin-screen-orientation",
      "clobbers": [
        "cordova.plugins.screenorientation"
      ]
    },
    {
      "id": "cordova-plugin-splashscreen.SplashScreen",
      "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
      "pluginId": "cordova-plugin-splashscreen",
      "clobbers": [
        "navigator.splashscreen"
      ]
    },
    {
      "id": "cordova-plugin-statusbar.statusbar",
      "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
      "pluginId": "cordova-plugin-statusbar",
      "clobbers": [
        "window.StatusBar"
      ]
    },
    {
      "id": "cordova-plugin-network-information.network",
      "file": "plugins/cordova-plugin-network-information/www/network.js",
      "pluginId": "cordova-plugin-network-information",
      "clobbers": [
        "navigator.connection",
        "navigator.network.connection"
      ]
    },
    {
      "id": "cordova-plugin-network-information.Connection",
      "file": "plugins/cordova-plugin-network-information/www/Connection.js",
      "pluginId": "cordova-plugin-network-information",
      "clobbers": [
        "Connection"
      ]
    },
    {
      "id": "de.appplant.cordova.plugin.printer.Printer",
      "file": "plugins/de.appplant.cordova.plugin.printer/www/printer.js",
      "pluginId": "de.appplant.cordova.plugin.printer",
      "clobbers": [
        "plugin.printer",
        "cordova.plugins.printer"
      ]
    },
    {
      "id": "kapsel-plugin-apppreferences.AppPreferences",
      "file": "plugins/kapsel-plugin-apppreferences/www/apppreferences.js",
      "pluginId": "kapsel-plugin-apppreferences",
      "clobbers": [
        "sap.AppPreferences"
      ]
    },
    {
      "id": "kapsel-plugin-inappbrowser.inappbrowser",
      "file": "plugins/kapsel-plugin-inappbrowser/www/inappbrowser.js",
      "pluginId": "kapsel-plugin-inappbrowser",
      "clobbers": [
        "cordova.InAppBrowser.open",
        "window.open"
      ]
    },
    {
      "id": "kapsel-plugin-i18n.i18n",
      "file": "plugins/kapsel-plugin-i18n/www/i18n.js",
      "pluginId": "kapsel-plugin-i18n"
    },
    {
      "id": "kapsel-plugin-authproxy.AuthProxy",
      "file": "plugins/kapsel-plugin-authproxy/www/authproxy.js",
      "pluginId": "kapsel-plugin-authproxy",
      "clobbers": [
        "sap.AuthProxy"
      ]
    },
    {
      "id": "kapsel-plugin-authproxy.oauth2",
      "file": "plugins/kapsel-plugin-authproxy/www/oauth2.js",
      "pluginId": "kapsel-plugin-authproxy",
      "clobbers": [
        "sap.AuthProxy.OAuth2"
      ]
    },
    {
      "id": "kapsel-plugin-authproxy.saml2",
      "file": "plugins/kapsel-plugin-authproxy/www/saml2.js",
      "pluginId": "kapsel-plugin-authproxy",
      "clobbers": [
        "sap.AuthProxy.SAML2"
      ]
    },
    {
      "id": "kapsel-plugin-authproxy.otp",
      "file": "plugins/kapsel-plugin-authproxy/www/otp.js",
      "pluginId": "kapsel-plugin-authproxy",
      "clobbers": [
        "sap.AuthProxy.OTP"
      ]
    },
    {
      "id": "kapsel-plugin-authproxy.datajsClient",
      "file": "plugins/kapsel-plugin-authproxy/www/datajsClient.js",
      "pluginId": "kapsel-plugin-authproxy",
      "runs": true
    },
    {
      "id": "kapsel-plugin-authproxy.utils",
      "file": "plugins/kapsel-plugin-authproxy/www/utils.js",
      "pluginId": "kapsel-plugin-authproxy",
      "runs": true
    },
    {
      "id": "kapsel-plugin-authproxy.webStrategies",
      "file": "plugins/kapsel-plugin-authproxy/www/webStrategies.js",
      "pluginId": "kapsel-plugin-authproxy",
      "runs": true
    },
    {
      "id": "kapsel-plugin-attachmentviewer.AttachmentViewer",
      "file": "plugins/kapsel-plugin-attachmentviewer/www/attachmentviewer.js",
      "pluginId": "kapsel-plugin-attachmentviewer",
      "clobbers": [
        "sap.AttachmentViewer"
      ]
    },
    {
      "id": "kapsel-plugin-barcodescanner.BarcodeScanner",
      "file": "plugins/kapsel-plugin-barcodescanner/www/barcodescanner.js",
      "pluginId": "kapsel-plugin-barcodescanner",
      "clobbers": [
        "cordova.plugins.barcodeScanner"
      ]
    },
    {
      "id": "kapsel-plugin-online.Online",
      "file": "plugins/kapsel-plugin-online/www/online.js",
      "pluginId": "kapsel-plugin-online",
      "clobbers": [
        "sap.Online"
      ]
    },
    {
      "id": "kapsel-plugin-cachemanager.CacheManager",
      "file": "plugins/kapsel-plugin-cachemanager/www/cachemanager.js",
      "pluginId": "kapsel-plugin-cachemanager",
      "clobbers": [
        "sap.CacheManager"
      ]
    },
    {
      "id": "kapsel-plugin-logon.LogonCore",
      "file": "plugins/kapsel-plugin-logon/www/common/modules/MAFLogonCorePlugin.js",
      "pluginId": "kapsel-plugin-logon",
      "clobbers": [
        "sap.logon.Core"
      ]
    },
    {
      "id": "kapsel-plugin-logon.LogonLocalStorage",
      "file": "plugins/kapsel-plugin-logon/www/common/modules/LogonCoreLocalStorage.js",
      "pluginId": "kapsel-plugin-logon",
      "clobbers": [
        "sap.logon.CoreLocalStorage"
      ]
    },
    {
      "id": "kapsel-plugin-logon.LogonUtils",
      "file": "plugins/kapsel-plugin-logon/www/common/modules/Utils.js",
      "pluginId": "kapsel-plugin-logon",
      "clobbers": [
        "sap.logon.Utils"
      ]
    },
    {
      "id": "kapsel-plugin-logon.LogonStaticScreens",
      "file": "plugins/kapsel-plugin-logon/www/common/modules/StaticScreens.js",
      "pluginId": "kapsel-plugin-logon",
      "clobbers": [
        "sap.logon.StaticScreens"
      ]
    },
    {
      "id": "kapsel-plugin-logon.LogonDynamicScreens",
      "file": "plugins/kapsel-plugin-logon/www/common/modules/DynamicScreens.js",
      "pluginId": "kapsel-plugin-logon",
      "clobbers": [
        "sap.logon.DynamicScreens"
      ]
    },
    {
      "id": "kapsel-plugin-logon.Logon",
      "file": "plugins/kapsel-plugin-logon/www/common/modules/LogonController.js",
      "pluginId": "kapsel-plugin-logon",
      "clobbers": [
        "sap.Logon"
      ]
    },
    {
      "id": "kapsel-plugin-logon.LogonJsView",
      "file": "plugins/kapsel-plugin-logon/www/common/modules/LogonJsView.js",
      "pluginId": "kapsel-plugin-logon",
      "clobbers": [
        "sap.logon.LogonJsView",
        "sap.logon.IabUi"
      ]
    },
    {
      "id": "kapsel-plugin-consent.Consent",
      "file": "plugins/kapsel-plugin-consent/www/Consent.js",
      "pluginId": "kapsel-plugin-consent",
      "clobbers": [
        "sap.Consent"
      ]
    },
    {
      "id": "kapsel-plugin-fioriclient.FioriClient",
      "file": "plugins/kapsel-plugin-fioriclient/www/fioriclient.js",
      "pluginId": "kapsel-plugin-fioriclient",
      "clobbers": [
        "sap.FioriClient"
      ]
    },
    {
      "id": "kapsel-plugin-fioriclient.FioriClient-Launchpad",
      "file": "plugins/kapsel-plugin-fioriclient/www/launchpad.js",
      "pluginId": "kapsel-plugin-fioriclient"
    },
    {
      "id": "kapsel-plugin-logger.Logging",
      "file": "plugins/kapsel-plugin-logger/www/logger.js",
      "pluginId": "kapsel-plugin-logger",
      "clobbers": [
        "sap.Logger"
      ]
    },
    {
      "id": "kapsel-plugin-settings.Settings",
      "file": "plugins/kapsel-plugin-settings/www/settings.js",
      "pluginId": "kapsel-plugin-settings",
      "clobbers": [
        "sap.Settings"
      ]
    },
    {
      "id": "kapsel-plugin-settings.AppSettings",
      "file": "plugins/kapsel-plugin-settings/www/appsettings.js",
      "pluginId": "kapsel-plugin-settings",
      "merges": [
        "sap.Settings"
      ]
    },
    {
      "id": "kapsel-plugin-toolbar.toolbar",
      "file": "plugins/kapsel-plugin-toolbar/www/toolbar.js",
      "pluginId": "kapsel-plugin-toolbar",
      "clobbers": [
        "window.sap.Toolbar"
      ]
    },
    {
      "id": "cordova-plugin-customurlscheme.LaunchMyApp",
      "file": "plugins/cordova-plugin-customurlscheme/www/android/LaunchMyApp.js",
      "pluginId": "cordova-plugin-customurlscheme",
      "clobbers": [
        "window.plugins.launchmyapp"
      ]
    },
    {
      "id": "cordova-plugin-mock-gps-checker.MockGpsChecker",
      "file": "plugins/cordova-plugin-mock-gps-checker/www/mockgps.js",
      "pluginId": "cordova-plugin-mock-gps-checker",
      "clobbers": [
        "window.plugins.mockgpschecker"
      ]
    },
    {
      "id": "cordova-plugin-android-gpsdetect.gpsDetect",
      "file": "plugins/cordova-plugin-android-gpsdetect/www/gpsDetectionPlugin.js",
      "pluginId": "cordova-plugin-android-gpsdetect",
      "clobbers": [
        "gpsDetect"
      ]
    },
    {
      "id": "cordova-plugin-root-detection.RootDetection",
      "file": "plugins/cordova-plugin-root-detection/www/rootdetection.js",
      "pluginId": "cordova-plugin-root-detection",
      "clobbers": [
        "rootdetection"
      ]
    },
    {
      "id": "cordova-plugin-sslcertificatechecker.SSLCertificateChecker",
      "file": "plugins/cordova-plugin-sslcertificatechecker/www/SSLCertificateChecker.js",
      "pluginId": "cordova-plugin-sslcertificatechecker",
      "clobbers": [
        "window.plugins.sslCertificateChecker"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-android-support-gradle-release": "2.1.0",
    "cordova-plugin-camera": "4.0.3",
    "cordova-plugin-device": "2.0.1",
    "cordova-plugin-dialogs": "2.0.1",
    "cordova-plugin-file": "6.0.1",
    "cordova-plugin-geolocation": "4.0.1",
    "es6-promise-plugin": "4.2.2",
    "cordova-plugin-screen-orientation": "3.0.1",
    "cordova-plugin-splashscreen": "5.0.2",
    "cordova-plugin-statusbar": "4.5.3",
    "cordova-plugin-network-information": "2.0.1",
    "cordova-plugin-whitelist": "1.3.3",
    "cordova-plugin-privacyscreen": "4.5.3",
    "kapsel-plugin-corelibs": "4.5.3",
    "de.appplant.cordova.plugin.printer": "4.5.3",
    "kapsel-plugin-apppreferences": "4.5.3",
    "kapsel-plugin-inappbrowser": "4.5.3",
    "kapsel-plugin-i18n": "4.5.3",
    "kapsel-plugin-authproxy": "4.5.3",
    "kapsel-plugin-attachmentviewer": "4.5.3",
    "kapsel-plugin-barcodescanner": "4.5.3",
    "kapsel-plugin-online": "4.5.3",
    "kapsel-plugin-cachemanager": "4.5.3",
    "kapsel-plugin-ui5": "4.5.3",
    "kapsel-plugin-logon": "4.5.3",
    "kapsel-plugin-cdsprovider": "4.5.3",
    "kapsel-plugin-consent": "4.5.3",
    "kapsel-plugin-fioriclient": "4.5.3",
    "kapsel-plugin-logger": "4.5.3",
    "kapsel-plugin-multidex": "4.5.3",
    "kapsel-plugin-settings": "4.5.3",
    "kapsel-plugin-toolbar": "4.5.3",
    "kapsel-plugin-keychaincertprovider": "4.5.3",
    "cordova-plugin-customurlscheme": "4.4.0",
    "cordova-plugin-mock-gps-checker": "1.0.0",
    "cordova-plugin-android-gpsdetect": "0.0.3",
    "cordova-plugin-root-detection": "0.1.1",
    "cordova-plugin-sslcertificatechecker": "6.0.0"
  };
});