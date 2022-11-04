/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/base/EventProvider','sap/ui/core/routing/async/_TargetCache','sap/ui/core/routing/sync/_TargetCache',"sap/base/assert","sap/base/Log","sap/ui/thirdparty/jquery"],function(E,a,s,b,L,q){"use strict";var T=E.extend("sap.ui.core.routing.TargetCache",{constructor:function(o){if(!o){o={};}this._oCache={view:{},component:{}};this._oComponent=o.component;if(this._oComponent){b(this._oComponent.isA("sap.ui.core.UIComponent"),this+' - the component passed to the constructor needs to be an instance of UIComponent');}E.apply(this,arguments);this.async=o.async;if(this.async===undefined){this.async=true;}var C=this.async?a:s;for(var f in C){this[f]=C[f];}},metadata:{publicMethods:["get","set"]},get:function(o,t){var O;try{if(t==="Component"&&!this.async){L.error("sap.ui.core.routing.Target doesn't support loading component in synchronous mode, please switch routing to async");throw new Error("sap.ui.core.routing.Target doesn't support loading component in synchronous mode, please switch routing to async");}if(!o){L.error("the oOptions parameter of getObject is mandatory",this);throw new Error("the oOptions parameter of getObject is mandatory");}O=this._get(o,t);}catch(e){return Promise.reject(e);}if(O instanceof Promise){return O;}else if(O.isA("sap.ui.core.mvc.View")){return O.loaded();}else{return Promise.resolve(O);}},set:function(n,t,o){this._checkName(n,t);b(t==="View"||t==="Component","sType must be either 'View' or 'Component'");this._oCache[t.toLowerCase()][n]=o;return this;},destroy:function(){E.prototype.destroy.apply(this);if(this.bIsDestroyed){return this;}function d(o){if(o&&o.destroy){o.destroy();}}Object.keys(this._oCache).forEach(function(t){var o=this._oCache[t];Object.keys(o).forEach(function(k){var O=o[k];if(O instanceof Promise){O.then(d);}else{d(O);}});}.bind(this));this._oCache=undefined;this.bIsDestroyed=true;return this;},attachCreated:function(d,f,l){return this.attachEvent("created",d,f,l);},detachCreated:function(f,l){return this.detachEvent("created",f,l);},fireCreated:function(A){return this.fireEvent("created",A);},_get:function(o,t,g){var O;switch(t){case"View":O=this._getView(o,g);break;case"Component":O=this._getComponent(o,g);break;default:throw Error("The given sType: "+t+" isn't supported by TargetCache.getObject");}return O;},_getView:function(o,g){if(!g){o=this._createId(o);}return this._getViewWithGlobalId(o);},_getComponent:function(o,g){if(!g){o=this._createId(o);}return this._getComponentWithGlobalId(o);},_createId:function(o){if(this._oComponent&&o.id){o=q.extend({},o,{id:this._oComponent.createId(o.id)});}return o;},_checkName:function(n,t){if(!n){var m="A name for the "+t.toLowerCase()+" has to be defined";L.error(m,this);throw Error(m);}}});return T;});
