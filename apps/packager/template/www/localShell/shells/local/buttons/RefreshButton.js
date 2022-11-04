/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.ushell.shells.local.buttons.RefreshButton");jQuery.sap.require("sap.ushell.library");jQuery.sap.require("sap.m.Button");sap.m.Button.extend("sap.ushell.shells.local.buttons.RefreshButton",{metadata:{library:"sap.ushell"}});
// Copyright (c) 2013 SAP AG, All Rights Reserved
(function(){"use strict";jQuery.sap.require("sap.ui.layout.form.SimpleForm");jQuery.sap.require("sap.m.ObjectHeader");jQuery.sap.require("sap.m.VBox");jQuery.sap.require("sap.m.Dialog");jQuery.sap.require("sap.m.Button");jQuery.sap.require("sap.ushell.resources");jQuery.sap.declare("sap.ushell.shells.local.buttons.RefreshButton");sap.ushell.shells.local.buttons.RefreshButton.prototype.init=function(){var oResourceBundle=sap.ui.getCore().getLibraryResourceBundle("sap.ushell.shells.local");this.setIcon('sap-icon://hint');this.setWidth('100%');this.setText(oResourceBundle.getText("refreshBtn_title"));this.setTooltip(oResourceBundle.getText("refreshBtn_tooltip"));this.attachPress(this.showRefreshDialog);this.setEnabled();if(sap.m.Button.prototype.init){sap.m.Button.prototype.init.apply(this,arguments)}};sap.ushell.shells.local.buttons.RefreshButton.prototype.showRefreshDialog=function(){var oResourceBundle=sap.ui.getCore().getLibraryResourceBundle("sap.ushell.shells.local");sap.smp.registration.store.refresh(function(){sap.m.MessageBox.alert(oResourceBundle.getText("storeRefreshed"));},function(){sap.m.MessageBox.alert(oResourceBundle.getText("storeFailedRefresh"));});};}());
