function createContentPlaceFunction(ctx) {
    function loadScenario() {
        var scenario = {
            moduleName: "__SCENARIO_ID__",
            urlPrefix: "__SCENARIO_PATH__",
            initModuleName: "__SCENARIO_INIT__"
        };

        if (scenario.moduleName.indexOf("__") === 0) {
            console.log("Skipping load of scenario");
        } else {
            jQuery.sap.registerModulePath(scenario.moduleName, scenario.urlPrefix);
            jQuery.sap.require(scenario.initModuleName);
            var object = jQuery.sap.getObject(scenario.initModuleName);
            if (object && object.init) {
                object.init();
            } else {
                console.log("Unable to init scenario at " + scenario.initModuleName + ".init()");
            }
        }
    }

    function createStores() {
        sap.smp.registration.setup(ctx, function() {
            loadCanvas();
            loadScenario();
        }, function(error) {
            if (fiori_client_custom && fiori_client_custom.onCreateStoreError){
                fiori_client_custom.onCreateStoreError(error);
            }
            else{
                jQuery.sap.require("sap.m.MessageBox");
                sap.m.MessageBox.show("Failed to start the app: " + error.msg,
                    sap.m.MessageBox.Icon.ERROR,
                    "Error",
                    [sap.m.MessageBox.Action.OK],
                    function (a) {
                        if (a === sap.m.MessageBox.Action.OK) {
                            sap.ushell.Container.logout();
                        }
                    }
                );
            }
        });
    }

    function loadCanvas() {
        var oContent = sap.ushell.Container.createRenderer("fiori2");
        jQuery("#canvas").empty();
        sap.smp.packaged.configureLaunchpadMenu();
        oContent.placeAt("canvas");
    }

    if (fiori_client_appConfig.offline) {
        return createStores;
    } else {
        return loadCanvas;
    }
}
