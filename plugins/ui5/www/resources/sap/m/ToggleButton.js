/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./Button','./library','sap/ui/core/EnabledPropagator','./ToggleButtonRenderer',"sap/ui/events/KeyCodes"],function(B,l,E,T,K){"use strict";var a=B.extend("sap.m.ToggleButton",{metadata:{library:"sap.m",designtime:"sap/m/designtime/ToggleButton.designtime",properties:{pressed:{type:"boolean",group:"Data",defaultValue:false}}}});E.call(a.prototype);a.prototype.ontap=function(e){e.setMarked();if(this.getEnabled()){this.setPressed(!this.getPressed());this.firePress({pressed:this.getPressed()});}};a.prototype.setPressed=function(p){p=!!p;if(p!=this.getPressed()){this.setProperty("pressed",p,true);this.$().attr("aria-pressed",p);this.$("inner").toggleClass("sapMToggleBtnPressed",p&&!this._isUnstyled());}return this;};a.prototype.onkeydown=function(e){if(e.which===K.SPACE||e.which===K.ENTER){this.ontap(e);}};a.prototype.onkeyup=function(e){if(e.which===K.SPACE||e.which===K.ENTER){e.setMarked();}};a.prototype.getAccessibilityInfo=function(){var i=B.prototype.getAccessibilityInfo.apply(this,arguments);if(this.getPressed()){i.description=((i.description||"")+" "+sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_STATE_PRESSED")).trim();}return i;};return a;});