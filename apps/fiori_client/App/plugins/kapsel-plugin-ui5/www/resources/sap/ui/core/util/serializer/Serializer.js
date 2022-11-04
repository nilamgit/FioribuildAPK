/*
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/base/EventProvider',"sap/base/assert"],function(E,a){"use strict";var S=E.extend("sap.ui.core.util.serializer.Serializer",{constructor:function(r,s,b,w,f,c){E.apply(this);this._oRootControl=r;this._delegate=s;this._bSkipRoot=!!b;this._oWindow=w||window;this._fnSkipAggregations=f;this._fnSkipElement=c;}});S.prototype.serialize=function(){return this._serializeRecursive(this._oRootControl,0);};S.prototype._serializeRecursive=function(c,l,A,b){a(typeof c!=="undefined","The control must not be undefined");var C=[];var w=(!this._bSkipRoot||l!==0);if(w){var s=this._delegate.start(c,A,b);var m=this._delegate.middle(c,A,b);C.push(s+m);}var d=c.getMetadata().getAllAggregations();if(d){for(var n in d){if(this._fnSkipAggregations&&this._fnSkipAggregations(c,n)){continue;}var e=[];var o=d[n];var v=c[o._sGetter]();if(c.getBindingPath(n)&&c.getBindingInfo(n).template){e.push(c.getBindingInfo(n).template);}else if(v&&v.length){for(var i=0;i<v.length;i++){var O=v[i];if(this._isObjectSerializable(O)){e.push(O);}}}else if(this._isObjectSerializable(v)){e.push(v);}if(e.length>0){if(w){C.push(this._delegate.startAggregation(c,n));}var f=this._isDefaultAggregation(c,n);for(var j=0;j<e.length;j++){C.push(this._serializeRecursive(e[j],l+1,n,f));}if(w){C.push(this._delegate.endAggregation(c,n));}}}}if(w){var g=this._delegate.end(c,A,b);C.push(g);}return C.join("");};S.prototype._isObjectSerializable=function(o){return o instanceof this._oWindow.sap.ui.core.Element&&!(this._fnSkipElement&&this._fnSkipElement(o));};S.prototype._isDefaultAggregation=function(c,A){return c.getMetadata().getDefaultAggregationName()===A;};return S;});
