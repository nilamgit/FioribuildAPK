(function() {
    jQuery.sap.require("sap.m.Button");
    jQuery.sap.require("sap.m.ButtonRenderer");
    jQuery.sap.require("sap.m.Label");
    jQuery.sap.require("sap.m.Text");
    jQuery.sap.require("sap.m.Dialog");
    jQuery.sap.require("sap.m.MessageBox");
    jQuery.sap.require("sap.ui.layout.form.SimpleForm");
    jQuery.sap.require("sap.ushell.library");
    jQuery.sap.require("sap.ui.core.Renderer");
    
    if (!sap) {
        sap = {};
    }
 
    if (!sap.smp) {
        sap.smp = {};
 
 
    }
    if (!sap.smp.packaged) {
        sap.smp.packaged = {};
        sap.smp.packaged.bundle = sap.ui.getCore().getLibraryResourceBundle("sap.ushell.shells.local");
    }

    var isStoreRequestQueueEmpty = function (store) {
        var deferred = new jQuery.Deferred();
        store.getRequestQueueStatus(function (status) {
            deferred.resolve(status.isEmpty);
        }, function (e) {
            deferred.reject({
                msg: "Error checking store request queue..."
            });
        });
        return deferred;
    }

    var isAllStoreRequestQueuesEmpty = function () {
        var deferred = new jQuery.Deferred();
        var deferreds = [];

        for (var idx in sap.smp.registration.stores) {
            var storeInfo = sap.smp.registration.stores[idx];
            deferreds.push(isStoreRequestQueueEmpty(storeInfo.store));
        }

        jQuery.when.apply(jQuery, deferreds).done(function () {
            var empty = true;
            for (var idx in arguments) {
                if (arguments[idx] === false) {
                    empty = false;
                    break;
                }
            }
            deferred.resolve(empty);
        }).fail(deferred.reject);

        return deferred;
    }

    //----------------
    var unregisterUser = function() {
        var errMessageText = sap.smp.packaged.bundle.getText("unregisterError");
        var oErrDialog = new sap.m.Dialog({
            title: sap.smp.packaged.bundle.getText("confirm_title"),
            type: 'Message',
            content: new sap.m.Text({ text: errMessageText }),
            beginButton: new sap.m.Button({                                  
                text: sap.smp.packaged.bundle.getText("okButtonText"),
                press: function () {
                    oErrDialog.close();
                    window.location.reload();
                }
            }),
            endButton: new sap.m.Button({
                text: sap.smp.packaged.bundle.getText("cancelButtonText"),
                press: function () {
                    oErrDialog.close();
                    window.location.reload();
                }
            }),
            afterClose: function () {
                oErrDialog.destroy();
            }
        });
 
        function removeRegistration() {
            function deleteRegistrationSuccessCallback() {
                // The application will be reloaded by the reset call.
                function resetSuccessCallback() {
                }

                // in case something goes wrong
                function resetErrorCallback() {
                    oErrDialog.open();
                }

                sap.logon.Core.reset(resetSuccessCallback, resetErrorCallback);
            }

            function errorCallback() {
                // Delete registration can fail if no connection.
                // We should still reset the app.
                sap.logon.Core.reset(function() {}, function() {});
            }

            sap.logon.Core.deleteRegistration(deleteRegistrationSuccessCallback, errorCallback);
        }
 
        function closeAndClearStore(store) {
            function storeCloseSuccess() {
                function storeClearSuccess() {
                    deferred.resolve();
                }

                function storeClearError() {
                    deferred.reject({msg: "Error clearing store ..."});
                }

                store.clear(storeClearSuccess, storeClearError);
            }

            function storeCloseError() {
                deferred.reject({msg: "Error closing store ..."});
            }

            var deferred = new jQuery.Deferred();

            store.close(storeCloseSuccess, storeCloseError);

            return deferred;
        }

        function removeStores() {
            var deferreds = [];
 
            for (var idx in sap.smp.registration.stores) {
                var storeInfo = sap.smp.registration.stores[idx];
                deferreds.push(closeAndClearStore(storeInfo.store));
            }
            
            return jQuery.when.apply(jQuery, deferreds);
        }
 
        if (jQuery.sap.getObject("sap.smp.registration.stores")) {
            removeStores().done(removeRegistration).fail(oErrDialog.open);
        }
        else {
            removeRegistration().fail(oErrDialog.open);
        }
    }
 
    sap.smp.packaged.UnregisterButton = function() {
        this.init();
    }
    
    sap.m.Button.extend("sap.smp.packaged.UnregisterButton",{metadata:{library:"sap.ushell"}});
    
    sap.smp.packaged.UnregisterButton.prototype.init = function () {        
        this.setIcon('sap-icon://sys-cancel-2');
        this.setText(sap.smp.packaged.bundle.getText("unregisterButtonText"));
        this.setTooltip(sap.smp.packaged.bundle.getText("unregisterButtonToolTip"));
        this.attachPress(this.showUnregisterDialog);
    };
    
    sap.smp.packaged.UnregisterButton.prototype.showUnregisterDialog = function() {
        sap.ushell.Container.getGlobalDirty().done(function(d) {
            var L = {},
            r = sap.ushell.resources.i18n;
            
            if (d === sap.ushell.Container.DirtyState.DIRTY) {
                L.message = r.getText('unsaved_data_warning_popup_message');
                L.icon = sap.m.MessageBox.Icon.WARNING;
                L.messageTitle = r.getText('unsaved_data_warning_popup_title');
            } else {
                L.message = r.getText('logoutConfirmationMsg');
                L.icon = sap.m.MessageBox.Icon.QUESTION;
                L.messageTitle = r.getText('logoutMsgTitle');
            }
            
            sap.m.MessageBox.show(L.message, L.icon, L.messageTitle, [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL], function (a) {
                if (a === sap.m.MessageBox.Action.OK) {
                    sap.ushell.Container.logout();
                }
            }, sap.ui.core.ElementMetadata.uid('confirm'));
        });
    }
    
    //----------------

    sap.smp.packaged.UnregisterButtonRenderer = sap.ui.core.Renderer.extend(sap.m.ButtonRenderer)
    
    //----------------

    sap.smp.packaged.EmailLogButton = function() {
        this.init();
    }
    
    sap.m.Button.extend("sap.smp.packaged.EmailLogButton",{metadata:{library:"sap.ushell"}});
    
    sap.smp.packaged.EmailLogButton.prototype.init = function () {        
        this.setIcon('sap-icon://email');
 
 
        this.setText(sap.smp.packaged.bundle.getText("emailButtonText"));
        this.setTooltip(sap.smp.packaged.bundle.getText("emailButtonTootTip"));
        //this.attachPress(this.showEmailLogDialog);
        this.attachPress(function () {sap.Logger.emailLog('',sap.smp.packaged.bundle.getText("mailTheLog"));});
    };
 
    
    //----------------
    
    sap.smp.packaged.EmailLogButtonRenderer = sap.ui.core.Renderer.extend(sap.m.ButtonRenderer)
    
    //----------------
    
    sap.smp.packaged.LogSettingsButton = function() {
        this.init();
    }
    
    sap.m.Button.extend("sap.smp.packaged.LogSettingsButton",{metadata:{library:"sap.ushell"}});
    
    sap.smp.packaged.LogSettingsButton.prototype.init = function () {        
        this.setIcon('sap-icon://settings');
        this.setText(sap.smp.packaged.bundle.getText("logSettingButtonText"));
        this.setTooltip(sap.smp.packaged.bundle.getText("logSettingToolTip"));
        this.attachPress(this.showLogSettingsDialog);
    };
    
    sap.smp.packaged.LogSettingsButton.prototype.showLogSettingsDialog = function() {
        
        function setLogLevel(curLevel) {

            var selectedValue = 'Error';
            var selectedId = 'errorId';  // default
            if (curLevel) {
                if (curLevel.toLowerCase() === 'error') {
                    selectedId = 'errorId';
                    selectedValue = 'Error';
                } else if (curLevel.toLowerCase() === 'warn' || curLevel.toLowerCase() === 'warning') {
                    selectedId = 'warnId';
                    selectedValue = 'Warn';
                } else if (curLevel.toLowerCase() === 'info') {
                    selectedId = 'infoId';
                    selectedValue = 'Info';
                } else if (curLevel.toLowerCase() === 'debug') {
                    selectedId = 'debugId';
                    selectedValue = 'Debug';
                }
            }
        
            var oDialog = new sap.m.Dialog({
                title: sap.smp.packaged.bundle.getText("confirm_title"),
                type: 'Message',
                content: [
                    new sap.ui.layout.form.SimpleForm({
                            editable: true,
                            content: [
                                new sap.m.Label({ text: sap.smp.packaged.bundle.getText("logLevel") }),
                                new sap.m.Select({
                                        items: [
                                            new sap.ui.core.Item({ id: 'errorId', key: 'ERROR', text: sap.smp.packaged.bundle.getText("errorLogLevel") }),
                                            new sap.ui.core.Item({ id: 'warnId', key: 'WARN', text: sap.smp.packaged.bundle.getText("warnLogLevel") }),
                                            new sap.ui.core.Item({ id: 'infoId', key: 'INFO', text: sap.smp.packaged.bundle.getText("infoLogLevel") }),
                                            new sap.ui.core.Item({ id: 'debugId', key: 'DEBUG', text: sap.smp.packaged.bundle.getText("debugLogLevel") })
                                        ],
                                        change: function (oEvent) {
                                            selectedValue = oEvent.getSource().getSelectedItem().getText();
                                        },
                                        selectedItemId : selectedId
                                    })
                            ]
                        })
                ],
                beginButton: new sap.m.Button({
                    text: sap.smp.packaged.bundle.getText("okButtonText"),
                    press: function () {
                        
                        function successCallback() {
                                            
                            sap.m.MessageToast.show('Successfully set the log level to ' + selectedValue);

                            oDialog.close();
                        }
                        
                        function errorCallback() {
                            
                            oDialog.close();                            
                        }
                                                
                        sap.Logger.setLogLevel(selectedValue, successCallback, errorCallback);
                    }
                }),
                endButton: new sap.m.Button({
                    text: sap.smp.packaged.bundle.getText("cancelButtonText"),
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function() {
                    oDialog.destroy();
                }
            });
        
            oDialog.open();
        }

        function loglevelSuccess(level) {
            setLogLevel(level);
        }
        
        function loglevelError() {
            // use a default setting of level ...
            setLogLevel(null);
        }
        
        // get the current level ...
        sap.Logger.getLogLevel(loglevelSuccess, loglevelError);
    }
    
    //----------------
    
    sap.smp.packaged.LogSettingsButtonRenderer = sap.ui.core.Renderer.extend(sap.m.ButtonRenderer)
 
    sap.smp.packaged.openActionSheet = function(sheet, oControl)
    {
        var oControl1 = document.getElementById('actionsBtn-name');
        sheet.openBy(oControl1);
    }

    sap.smp.packaged.configureLaunchpadMenu = function () {
        var emailButton = new sap.smp.packaged.EmailLogButton();
        var unregButton = new sap.smp.packaged.UnregisterButton();
        var logButton = new sap.smp.packaged.LogSettingsButton();
        var actionButtons = [];

        // For 1.40+ systems we need this additional button to access the menu
        var result = /^([0-9]+).([0-9]+).([0-9]+)*/g.exec(sap.ui.version);
        if (result && parseInt(result[1]) >= 1 && parseInt(result[2]) >= 40) {
            var states = window["sap-ushell-config"].renderers.fiori2.componentData.config.states;
            states.app.headItems.unshift("meAreaHeaderButton");
            states.home.headItems.unshift("meAreaHeaderButton");
            actionButtons.push(emailButton, logButton);
        } else {
            actionButtons.push(emailButton, unregButton, logButton);
        }

        // Replace the global dirty state call as it is async
        // Ideally we would use registerDirtyStateProvider but it is only supports sync providers
        var originalGetGlobalDirty = sap.ushell.Container.getGlobalDirty;
        sap.ushell.Container.getGlobalDirty = function (done) {
            
            if (jQuery.sap.getObject("sap.smp.registration.stores")) {
                var D = new jQuery.Deferred()
                isAllStoreRequestQueuesEmpty().done(function (empty) {
                    if (!empty) {
                        D.resolve(sap.ushell.Container.DirtyState.DIRTY);
                        
                    } else {
                        originalGetGlobalDirty.call(sap.ushell.Container).done(function (dirty) {
                            D.resolve(dirty);
                        });
                    }
                });
                return D.promise();
            } else {
                return originalGetGlobalDirty.call(sap.ushell.Container);
            }
        }

        // Map the Sign Out to our unregister logic
        sap.ushell.Container.logout = function () {
            unregisterUser();
        };

        var actionSheet = new sap.m.ActionSheet("Toolbar", {
            placement: "Auto",
            showCancelButton: true,
            cancelButtonText: sap.smp.packaged.bundle.getText("cancelButtonText"),
            //title:"EMail Log",
            buttons: actionButtons,
        });

        var rendererExt = sap.ushell.renderers.fiori2.RendererExtensions;
        var settingsButton = new sap.m.Button("test1", {
            text: sap.smp.packaged.bundle.getText("application_settings"),
            icon: 'sap-icon://wrench',
            press: function () {
                sap.smp.packaged.openActionSheet(actionSheet, this);
            }
        });

        rendererExt.addOptionsActionSheetButton(settingsButton, rendererExt.LaunchpadState.Home, rendererExt.LaunchpadState.App);
    }

    sap.smp.packaged.getUserName = function (ctx, done) {
        var userNameKey = "userNameKey";
        var defaultUserName = ctx ? {
            id: ctx.user,
            firstName: ctx.user,
            lastName: ctx.user,
            fullName: ctx.user
        } : {};

        var loadSavedUsername = function () {
            var d = $.Deferred();
            sap.Logon.get(function (serializedUserName) {
                if (serializedUserName === null) {
                    d.resolve(null);
                } else {
                    d.resolve(JSON.parse(serializedUserName));
                }
            }, d.reject, userNameKey);
            return d.promise();
        };

        var saveUserName = function (userName) {
            var d = $.Deferred();
            sap.Logon.set(function () {
                d.resolve();
            }, d.reject, userNameKey, JSON.stringify(userName));
            return d.promise();
        };

        var requestUserName = function () {
            var d = $.Deferred();

            var headers;
            var sapClient = jQuery.sap.getUriParameters().get("sap-client");
            if (sapClient) {
                headers = {
                    "sap-client": sapClient
                };
            }

            $.get({
                    url: fiori_client_appConfig.fioriURL + "/sap/bc/ui2/start_up",
                    headers: headers
                })
                .done(function (data) {
                    var userName = defaultUserName;

                    if (data) {
                        if (data.id) {
                            userName.id = data.id;
                        }
                        if (data.fullName) {
                            userName.fullName = data.fullName;
                        }
                        if (data.firstName) {
                            userName.firstName = data.firstName;
                        }
                        if (data.lastName) {
                            userName.lastName = data.lastName;
                        }
                    }

                    d.resolve(userName);
                })
                .fail(function () {
                    // Fallback to older launchpad style for getting user info.
                    $.get({
                            url: fiori_client_appConfig.fioriURL + "/fiori/cp/runtime/v1/sites/DEFAULT",
                            headers: headers
                        })
                        .done(function (data) {
                            var userName = defaultUserName;

                            if (data.user) {
                                if (data.user.userFullName) {
                                    userName.fullName = data.user.userFullName;
                                }
                                if (data.user.userFirstName) {
                                    userName.firstName = data.user.userFirstName;
                                }
                                if (data.user.userLastName) {
                                    userName.lastName = data.user.userLastName;
                                }
                            }

                            d.resolve(userName);
                        })
                        .fail(function () {
                            d.reject();
                        });
                });
            return d.promise();
        };

        loadSavedUsername()
            .done(function (userName) {
                if (userName) {
                    done(userName);
                } else {
                    requestUserName()
                        .done(function (userName) {
                            saveUserName(userName).done(function () {
                                done(userName);
                            }).fail(function () {
                                done(defaultUserName);
                            });
                        })
                        .fail(function () {
                            done(defaultUserName);
                        });
                }
            })
            .fail(function () {
                done(defaultUserName);
            });
    }
}());