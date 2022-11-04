kapsel-plugin-keychainCertProvider
==================================
An iOS-specific Kapsel plugin that will enable the following functionality in an iOS Kapsel application.
1. Import a client certificate that has an extension of fccert from a file, link or email attachment to the app's keychain.
2. Use a X509FileCertProvider to import a client certificate from a local p12 file into the app's keychain and use the imported client cert for SAP Mobile Platform or SAP Cloud Platform Mobile Services registration.
3. Use a keychainCertProvider to enable the use of a client cert from another app's keychain during an SAP Mobile Platform or SAP Cloud Platform registration. 

How to Add This Plugin to an Existing Kapsel Application
--------------------------------------------------------
```
$ cordova plugin add kapsel-plugin-keychaincertprovider --searchpath <path_to_plugin_folder>
```
