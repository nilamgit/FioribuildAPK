/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/rta/command/BaseCommand','sap/ui/core/util/reflection/JsControlTreeModifier','sap/ui/fl/Utils'],function(B,J,f){"use strict";var C=B.extend("sap.ui.rta.command.ControlVariantConfigure",{metadata:{library:"sap.ui.rta",properties:{control:{type:"any"},changes:{type:"array"}},associations:{},events:{}}});C.prototype.MODEL_NAME="$FlexVariants";C.prototype.prepare=function(F,v){this.sLayer=F.layer;return true;};C.prototype.getPreparedChange=function(){if(!this._aPreparedChanges){return undefined;}return this._aPreparedChanges;};C.prototype.execute=function(){var v=this.getControl();this.oAppComponent=f.getAppComponentForControl(v);this.oModel=this.oAppComponent.getModel(this.MODEL_NAME);this.sVariantManagementReference=J.getSelector(v,this.oAppComponent).id;this._aPreparedChanges=[];this.getChanges().forEach(function(c){c.appComponent=this.oAppComponent;this._aPreparedChanges.push(this.oModel.setVariantProperties(this.sVariantManagementReference,c,true));}.bind(this));return Promise.resolve().then(function(){this.oModel.checkUpdate(true);}.bind(this));};C.prototype.undo=function(){var p;this.getChanges().forEach(function(c,i){p={};Object.keys(c).forEach(function(P){var o="original"+P.charAt(0).toUpperCase()+P.substr(1);if(P==="visible"){p[P]=true;}else if(c[o]){p[P]=c[o];p[o]=c[P];}else if(P.indexOf("original")===-1){p[P]=c[P];}});p.change=this._aPreparedChanges[i];this.oModel.setVariantProperties(this.sVariantManagementReference,p,false);}.bind(this));return Promise.resolve().then(function(){this.oModel.checkUpdate(true);this._aPreparedChanges=null;}.bind(this));};return C;},true);