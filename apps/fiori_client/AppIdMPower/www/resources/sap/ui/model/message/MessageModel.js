/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/model/BindingMode','sap/ui/model/ClientModel','sap/ui/model/Context','./MessageListBinding','./MessagePropertyBinding',"sap/base/Log"],function(B,C,a,M,b,L){"use strict";var c=C.extend("sap.ui.model.message.MessageModel",{constructor:function(m){C.apply(this,arguments);this.sDefaultBindingMode=B.OneWay;this.mSupportedBindingModes={"OneWay":true,"TwoWay":false,"OneTime":false};this.oMessageManager=m;}});c.prototype.setData=function(d){this.oData=d;this.checkUpdate();};c.prototype.fireMessageChange=function(A){this.fireEvent("messageChange",A);return this;};c.prototype.bindProperty=function(p,o,P){var d=new b(this,p,o,P);return d;};c.prototype.bindList=function(p,o,s,f,P){var d=new M(this,p,o,s,f,P);return d;};c.prototype.setProperty=function(p,v,o){L.error(this+"not implemented: Only 'OneWay' binding mode supported");};c.prototype.getProperty=function(p,o){return this._getObject(p,o);};c.prototype._getObject=function(p,o){var n;if(o instanceof a){n=this._getObject(o.getPath());}else if(o){n=o;}if(!p){return n;}var P=p.split("/"),i=0;if(!P[0]){n=this.oData;i++;}while(n&&P[i]){n=n[P[i]];i++;}return n;};return c;});
