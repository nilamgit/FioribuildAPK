    /**
     * appConfig - This object is loaded when the client is starting up. It
     * determines the default values of each of its keys. Once the application
     * has loaded the values at runtime, these values are copied into AppPreferences,
     * where they can be modified by the user. From that point on, any value in AppPreferences
     * will override any value of the same key here.
     */
    fiori_client_appConfig = {
        /**
         * appID - The appID used to identify the application to the data vault.
         * If you are using SMP, this should be consistent with the appID of the
         * target application. Note that this value is distinct from the packageName,
         * which is mainly used to identify your application in app stores.
         */
         "appID": "",        
         //"appID": "EPMRA_SHOP",
        /**
         * appName - The application name to be used in the Cloud Build create step.
         * This is also the app name that will appear on the device.
         */
        "appName": "",
        //"appName": "EPM Shop",
        /**
         * appVersion - The version to be attached to the app at build time
         */
        "appVersion": "",
        //"appVersion": "0.0.1",
        /**
         * bundleID - The app's reverse-domain identifier. eg. com.example.hello
         */
        "bundleID": "",
        /**
         * androidSigningID - Signing ID used by Cloud Build.  This ID is known by Cloud Build and corresponds to
         * a certificate uploaded into Mobile Secure and will be used when a build is triggered
         */
        "androidSigningID": "",
        /**
         * iosSigningID - Signing ID used by Cloud Build.  This ID is known by Cloud Build and corresponds to
         * a certificate/provisioning profile uploaded into Mobile Secure and will be used when a build is triggered
         */
        "iosSigningID": "",
        
        /**
         * theme - The theme for UI5 library used by Fiori app.
         */
        "theme": "sap_bluecrystal",

        /**
         * fioriURL - The full URL of the target application.
         * If "FioriURLIsSMP":true, then enter the URL of the SAP Mobile Platform server,
         * if "FioriURLIsSMP":false, then enter the URL of the Fiori front-end server.
         * The format is <protocol>://<host>:<port>.
         */
         "fioriURL": "",
        //"fioriURL": "https://front_end_server:8081",
        //"fioriURL": "https://smp_server_host:8081",
      
        /**
         * fioriURLIsSMP - Set this to true if your are using SMP.
         * If set to true, the application will perform SMP registration.
         */
         "fioriURLIsSMP": false,

        /** 
         * multiUser - A Boolean property to set whether multi-user support is enabled.
         * If set to true, the Logon plugin will allow multiple users to register, each
         * with a different passcode, and provide a mechanism for switching between users.
         * If the properety is set to false or not specified, the Logon plugin will run in single user mode.
         * 
         * In the current release, multiUser is only supported on iOS and Windows platforms with SMP/HCPms
         * registration. The property is ignored when running on Andorid platform, or when SMP/HCPms 
         * registration is not used.
         */
         "multiUser": false,
      
        /**
         * certificate - Set the client certificate provider
         * for current version, only supports "afaria" as certificate provider. 
         * As afaria seeding data is not supported, so the only use of afaria is for client certificate. 
         */
         "certificate": "",

        /**
         * autoSelectSingleCert - automatically select the client certificate for mutual authentication
         * if only one client certificate is available. (Only supported by iOS)
         * Default value is false
         */
         "autoSelectSingleCert": false,
         
        /**
         * passcodePolicy - Specify the passcodePolicy of the data vault. Note: if you
         * are using SMP, the passcodePolicy is determined by the server.
         * For more information, see documentation of the logon plugin.
         * 
         */
         "passcodePolicy":  {
               "expirationDays":"0",
               "hasDigits":"false",
               "hasLowerCaseLetters":"false",
               "hasSpecialLetters":"false",
               "hasUpperCaseLetters":"false",
               "defaultAllowed":"true",
               "lockTimeout":"300",
               "minLength":"8",
               "minUniqueChars":"0",
               "retryLimit":"10"
          },
          
         
         //configuration for prepackaged fiori app.
         //In addition to the below settings, fioriUrl and appID are also used for prepackaged app
         "prepackaged" : true,
         
         "offline": false,
         
         "applications": [],
         /*"applications": [{   
                "id": "nw.epm.refapps.shop",
                "intent": "EPMProduct-shop",
                "description": "EPM Shop" 
            }
         ]*/ 
                /**
        * keysize - this is an optional argument for the AfariaCertificateProvider, to set the bit rate of the public/private keys.
                    If this value is empty, or invalid, it will be defaulted to 2048.
        */
        "keysize": "",
             
        // Customization options for the Logon screens, uncomment to use

        /**
         * backgroundImage - Path to the background image used for logon screens
         */
        //"backgroundImage": "../../../background.jpg",

        /**
         * styleSheet - Path to the css file used for logon screens
         */
        //"styleSheet": "../../../custom.css",

        /**
         * hideLogoCopyright - Boolean value to hide the logo and copyright text in the footer of logon screens
         */
        //"hideLogoCopyright": false,

        /**
         * copyrightLogo - Path to the logo image in the footer
         */
        //"copyrightLogo": "img/sapLogo.png",

        /**
         * copyrightMsg - An array of 2 strings to specify 2 lines of copyright text in the footer
         */
        //"copyrightMsg": ["Copyright © 2016 SAP SE.", "All rights reserved."],

        /**
         * disablePasscode - Boolean value to disable the passcode screen
         * Note this value should not be set when multi-user support is enabled.
         */
        //"disablePasscode": false

    };
