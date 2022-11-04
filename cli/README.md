Kapsel CLI
==========
A command-line tool for Kapsel applications; the CLI exposes commands that allow a developer to:

1. Package a Kapsel application's web application content for deployment to a SMP server.
2. Deploy updates to a Kapsel application's content to an SMP Server.

Getting Started
--------------------
In order to use the Kapsel CLI, you must first install nodeJS from nodejs.org. If you are running the Kapsel CLI on a system that is already used for Kapsel or Cordova development, you should have the required tools already installed.

To validate that your system is properly configured to use the Kapsel CLI, open a terminal window and execute the following command:

	node -v

It should return a number such as v8.9.4.  If an error message is displayed, validate that nodeJS is properly installed.

Cordova 8.0.0 should be used if using SMP 3.1 SDK. Use the following command to install Apache Cordova:

    npm install -g cordova@8.0.0

Note that if you are on a Mac, use

    sudo npm install -g cordova@8.0.0

In order to be able to use the Kapsel CLI with any Kapsel application, you must install the Kapsel CLI so it is available globally (from any folder). The installation instructions will vary depending on whether the development system is running Windows or OS X.  

The CLI installation will add several node modules to your local system's configuration; if you are running in a corporate environment with a proxy, you may first have to create the following environment variables for npm depending.

	http_proxy=http://proxy.phl.sap.corp:8080
	https_proxy=$http_proxy

You will need to substitute the correct proxy server address (and optionally port number).


### Windows Installation
To install the CLI, open a terminal window and navigate to the Kapsel CLI folder. On Windows, the SDK installer installs the SDK by default in C:\SAP\MobileSDK3\, so the Kapsel CLI can be found in C:\SAP\MobileSDK3\KapselSDK\cli. With a terminal window open to the cli folder, issue the following command:

	npm -g install

Kapsel applications require Windows platform version 5.0.0. Use the following command to add the correct version of Windows platform: 

	cordova platform add windows@5.0.0

Similarly, to add the correct version of Android platform:

    cordova -d platform add android@7.0.0

or iOS platform:

    cordova -d platfrom add ios@4.5.4

### Macintosh OS X Installation
To install the CLI, open a terminal window and navigate to the Kapsel CLI folder. On OS X, the SDK installer installs the SDK by default in /users/user_name/SAP/MobileSDK3/ (replacing user_name with the login name for the user performing the installation), so the Kapsel CLI can usually be found in /users/user_name/SAP/MobileSDK3/KapselSDK\cli. With a terminal window open to the cli folder, issue the following command:

	sudo npm -g install

You will be prompted to enter the system password before the installation will begin.

### Validating the Installation
To validate that the Kapsel CLI installation completed successfully, open a terminal window, navigate to any folder **except** the cli folder from where you installed the Kapsel CLI and issue the following command:

	kapsel

If the Kapsel CLI is installed correctly, you should see the contents of the Kapsel CLI help file displayed in the terminal window.

Using the Kapsel CLI
--------------------
To use the Kapsel CLI, open a terminal window, navigate to a Kapsel project folder and issue one of the available commands in the following format:

	kapsel command [options]

The Kapsel CLI supports the following commands:

+ package
+ deploy
+ status
+ upload
+ remove
+ promote
+ stage
+ unstage

The [options] parameter refers to optional command parameters that can be passed on the command line.

**Note** The Kapsel CLI will only function when executed from a valid Kapsel project folder.

### Package Command

A Kapsel application is usually deployed with an initial version of the application's web content. When the web application is updated, an organization will use the SMP server's life-cycle management capabilities and the Kapsel AppUpdate plugin to deploy the update to users that already have the application deployed to their device.  

The package command is used to create a local archive (.zip file) containing a Kapsel web application's content so that the application updates can be deployed to a SMP server. The format for the package command is:

	kapsel package [platform_list]

A Kapsel project can target Android and/or iOS devices; the platform_list parameter is used to instruct the Kapsel CLI which target mobile platforms to include in the archive. Valid platforms options are: android and ios.

**Note** If you omit the platform_list parameter, web content for all target platforms will be included in the archive.

The output of this command is an archive called packagedKapselApp.zip which will be written to the root folder of the project.

**Note** Be sure to execute the Cordova CLI prepare command prior to executing the Kapsel package command to ensure that the latest version of the application's web content has been copied into the target mobile device platform project folders.

#### Example usage:
To package the web application content for the Android platform only use:

    kapsel package android

To package the web application content for the iOS platform only use:

    kapsel package ios

To package the web application content for all target platforms use:

	kapsel package

You can also accomplish the same thing by specifying all of the target platforms on the command line:

	kapsel package android ios

### Deploy Command
The deploy command is used to upload an archive containing a Kapsel application's web application content to the SMP server for distribution to an existing Kapsel application. The archive can be one created using the Kapsel CLI package command or created through some other process. The format for the deploy command is:

	kapsel deploy <app_id> <server_host[:server_port]> <user_name> <user_password>

The deploy command requires 4 parameters:

+ app_id: The application's unique ID as defined on the SMP server
+ server_host: The SMP server host address (and optionally port number)
+ user_name: A valid SMP administrator user name
+ user_password: The password for the specified SMP Administrator

**Note** The application must already have been created on the SMP server before running the deploy command.

#### Example usage
To deploy updates to an existing Kapsel application with an ID (as defined on the SMP server) of KapselApp to a SMP server called server3 use the following:

    kapsel deploy KapselApp server3 theadmin thepass

The admin user name (theadmin) and password (thepass) must be valid user credentials for the server or the command will fail.

For environments where the SMP server port has been changed from its default (8083) you can append the port number to the server host address in the format server_host:server_port. In the following example, the server port has been changed from 8083 to 8085:

    kapsel deploy KapselApp server3:8085 theadmin thepass

The deploy command will automatically increment the revision number for the application on the SMP server. To see the revision of the app on the server, go to applications screen, click on the app, go to the Application specific settings tab.

### Status Command
The status command is used to check the version and modification time of Kapsel application revisions that are deployed on a SMP server. The command will list the current, pending, and staged revisions for the given application and its platforms. The format for the package command is:

	kapsel status <app_id> <server_host[:server_port]> <user_name> <user_password>

The status command requires 4 parameters:

+ app_id: The application's unique ID as defined on the SMP server
+ server_host: The SMP server host address (and optionally port number)
+ user_name: A valid SMP administrator user name
+ user_password: The password for the specified SMP Administrator

**Note** The application must already have been created on the SMP server before running the status command.

#### Example usage
To check the update status of an existing Kapsel application with an ID (as defined on the SMP server) of KapselApp to a SMP server called server3, use the following:

    kapsel status KapselApp server3 theadmin thepass

The admin user name (theadmin) and password (thepass) must be valid user credentials for the server or the command will fail.

### Upload Command
The upload command is used to upload the zip file generated by the package command as a new pending application version to the SMP server. The command will add the package with a negative revision number and it will remain as pending until an action such as the remove, promote, or stage commands is performed. The format for the upload command is:

    kapsel upload <app_id> <server_host[:server_port]> <user_name> <user_password>

The status command requires 4 parameters:

+ app_id: The application's unique ID as defined on the SMP server
+ server_host: The SMP server host address (and optionally port number)
+ user_name: A valid SMP administrator user name
+ user_password: The password for the specified SMP Administrator

**Note** The application must already have been created on the SMP server before running the upload command.

#### Example usage
To upload a new pending revision of an existing Kapsel application with an ID (as defined on the SMP server) of KapselApp to a SMP server called server3, use the following:

    kapsel upload KapselApp server3 theadmin thepass

The admin user name (theadmin) and password (thepass) must be valid user credentials for the server or the command will fail.

Uploading a new revision will not overwrite any existing pending revisions and will add the new revision under a new revision number.

### Remove Command
The remove command is used to remove a pending revision of a Kapsel application from a SMP server. This command cannot be used to remove the current version of the application. The format for the remove command is:

    kapsel remove <app_id> <platform> <revision> <server_host[:server_port]> <user_name> <password>

The remove command requires 6 parameters:

+ app_id: The application's unique ID as defined on the SMP server
+ platform: The platform of the specified pending revision
+ revision: The revision number of the specified pending revision
+ server_host: The SMP server host address (and optionally port number)
+ user_name: A valid SMP administrator user name
+ user_password: The password for the specified SMP Administrator

**Note** The application must already have been created on the SMP server and a pending revision uploaded before running the remove command.

#### Example usage
To remove a pending revision for Android with the revision id of -1 from an existing Kapsel application with an ID (as defined on the SMP server) of KapselApp to a SMP server called server3, use the following:

    kapsel remove KapselApp android -1 server3 theadmin thepass

The admin user name (theadmin) and password (thepass) must be valid user credentials for the server or the command will fail.

### Promote Command
The promote command is used to promote a pending revision into the current version of a Kapsel application on a SMP server. This command will automatically increment the revision number for the application on the SMP server. The format for the promote command is:

    kapsel promote <app_id> <platform> <revision> <server_host[:server_port]> <user_name> <password>

The promote command requires 6 parameters:

+ app_id: The application's unique ID as defined on the SMP server
+ platform: The platform of the specified pending revision
+ revision: The revision number of the specified pending revision
+ server_host: The SMP server host address (and optionally port number)
+ user_name: A valid SMP administrator user name
+ user_password: The password for the specified SMP Administrator

**Note** The application must already have been created on the SMP server and a pending revision uploaded before running the promote command.

#### Example usage
To promote a pending revision for Android with the revision id of -1 for an existing Kapsel application with an ID (as defined on the SMP server) of KapselApp to a SMP server called server3, use the following:

    kapsel promote KapselApp android -1 server3 theadmin thepass

The admin user name (theadmin) and password (thepass) must be valid user credentials for the server or the command will fail.

### Stage Command
The stage command is used to stage a pending revision of a Kapsel application on a SMP server. The staged revision will be made available to only tester users. This command will use an automatically incremented revision number for the staged version. The format for the stage command is:

    kapsel stage <app_id> <platform> <revision> <server_host[:server_port]> <user_name> <password>

The unstage command requires 6 parameters:

+ app_id: The application's unique ID as defined on the SMP server
+ platform: The platform of the specified pending revision
+ revision: The revision number of the specified pending revision
+ server_host: The SMP server host address (and optionally port number)
+ user_name: A valid SMP administrator user name
+ user_password: The password for the specified SMP Administrator

**Note** The application must already have been created on the SMP server and a pending revision uploaded before running the stage command.

#### Example usage
To stage a pending revision for Android with the revision id of -1 for an existing Kapsel application with an ID (as defined on the SMP server) of KapselApp to a SMP server called server3, use the following:

    kapsel stage KapselApp android -1 server3 theadmin thepass

The admin user name (theadmin) and password (thepass) must be valid user credentials for the server or the command will fail.

If a staged version already exists for the specified application and platform, it will be overwritten.

### Unstage Command
The unstage command is used to remove the current staged version of a Kapsel application on a SMP server. The unstaged revision will be stashed as a pending revision, similarly to the result of the upload command. The format for the unstage command is:

    kapsel unstage <app_id> <platform> <server_host[:server_port]> <user_name> <password>

The unstage command requires 5 parameters:

+ app_id: The application's unique ID as defined on the SMP server
+ platform: The platform of the specified pending revision
+ server_host: The SMP server host address (and optionally port number)
+ user_name: A valid SMP administrator user name
+ user_password: The password for the specified SMP Administrator

**Note** The application must already have been created on the SMP server and a pending version staged before running the unstage command.

#### Example usage
To unstage a staged revision for Android for an existing Kapsel application with an ID (as defined on the SMP server) of KapselApp to a SMP server called server3, use the following:

  	kapsel unstage KapselApp android server3 theadmin thepass

The admin user name (theadmin) and password (thepass) must be valid user credentials for the server or the command will fail.

**Note** The unstaged revision number will not necessarily be the same as the revision number before it was initially staged.
