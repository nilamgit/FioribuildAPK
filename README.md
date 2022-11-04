SAP Mobile Platform - Kapsel SDK
================================

Kapsel is part of the SAP Mobile Platform SDK and a suite of enterprise plugins for the open-source Apache Cordova framework (www.cordova.io). Kapsel plugins provide a Cordova application with some enterprise capabilities and expose APIs that give an application access to enterprise services provided by the SMP server.

The Getting Started with Kapsel Guide located at [https://blogs.sap.com/2016/10/20/getting-started-kapsel-part-1-sp13/](https://blogs.sap.com/2016/10/20/getting-started-kapsel-part-1-sp13/ "Getting Started with Kapsel") provides step by step instructions demonstrating many of the plugins provided by Kapsel.

SDK Folders
-----------
The Kapsel SDK folder where this file is located contains the following subfolders:

+ apps - This folder contains tools that can be used with Kapsel SDK.  
The "fiori_client" subfolder contains a Node.js application to create a custom SAP Fiori Client application using kapsel plugins.  
The "packager" subfolder contains a Node.js application to create and build a pre-packaged Fiori application using the mobile cloud build service.

+ cli - Contains the installation files for the Kapsel Command-line Interface (CLI). The Kapsel CLI exposes a set of commands that allow a developer to package a Kapsel application's web content for deployment to a SMP server as well as deploy the files to the SMP server. Refer to the cli/readme.md file for details how to install and use the Kapsel CLI.

+ docs - Contains a set of API documentation for the Kapsel plugins.

+ plugins - The Kapsel plugin files (in a separate folder for each plugin). The Kapsel plugins are described at ["Hybrid SDK (Kapsel) Plugins"](https://help.sap.com/viewer/42dc90f1e1ed45d9aafad60c80646d10/3.1.4/en-US/7c041aaa7006101481a7fc662daecd3f.html).

Requirements
------------
Kapsel currently supports Android, iOS, and Windows applications.  For additional details on Windows support see [Creating an Application on Windows](https://help.sap.com/viewer/42dc90f1e1ed45d9aafad60c80646d10/3.1.4/en-US/10e4e12b7a7d4de3a2b80c9c935aded2.html).

The Kapsel plugins are compiled and tested against a particular version of the Cordova CLI and platform.

It is recommended to use Cordova 9.0.0 with SDK 3.1 and add the required platforms as follows.
cordova platform add android@8.0.0
cordova platform add ios@6.1.0
cordova platform add windows@7.0.1
