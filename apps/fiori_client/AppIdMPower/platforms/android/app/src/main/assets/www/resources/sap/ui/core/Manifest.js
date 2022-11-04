/*
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/thirdparty/jquery','sap/ui/base/Object','sap/ui/thirdparty/URI','sap/base/util/Version','sap/base/Log','sap/ui/dom/includeStylesheet','sap/base/i18n/ResourceBundle','sap/base/util/uid','sap/base/util/isPlainObject','sap/base/util/LoaderExtensions'],function(q,B,U,V,L,a,R,u,b,c){"use strict";var r=/\{\{([^\}\}]+)\}\}/g;function g(v){var o=V(v);return o.getSuffix()?V(o.getMajor()+"."+o.getMinor()+"."+o.getPatch()):o;}function p(o,C){for(var k in o){if(!o.hasOwnProperty(k)){continue;}var v=o[k];switch(typeof v){case"object":if(v){p(v,C);}break;case"string":C(o,k,v);break;default:}}}function d(o,P){if(o&&P&&typeof P==="string"&&P[0]==="/"){var e=P.substring(1).split("/"),s;for(var i=0,l=e.length;i<l;i++){s=e[i];o=o.hasOwnProperty(s)?o[s]:undefined;if(o===null||typeof o!=="object"){if(i+1<l&&o!==undefined){o=undefined;}break;}}return o;}return o&&o[P];}function f(o){if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.freeze(o);for(var k in o){if(o.hasOwnProperty(k)){f(o[k]);}}}}var M=B.extend("sap.ui.core.Manifest",{constructor:function(m,o){B.apply(this,arguments);this._uid=u();this._iInstanceCount=0;this._bIncludesLoaded=false;this._oRawManifest=m;this._bProcess=!(o&&o.process===false);this._bAsync=!(o&&o.async===false);this._sComponentName=o&&o.componentName;var C=this.getComponentName(),s=o&&o.baseUrl||C&&sap.ui.require.toUrl(C.replace(/\./g,"/"))+"/";if(s){this._oBaseUri=new U(s).absoluteTo(new U(document.baseURI).search(""));}if(o&&typeof o.url==="string"){this._oManifestBaseUri=new U(o.url).absoluteTo(new U(document.baseURI).search("")).search("");}else{this._oManifestBaseUri=this._oBaseUri;}f(this._oRawManifest);this._oManifest=q.extend(true,{},this._oRawManifest);if(this._bProcess){this._processI18n();}},_processI18n:function(A){var I=[];p(this._oManifest,function(o,k,v){var m=v.match(r);if(m){I.push({object:o,key:k});}});if(I.length>0){var e=function(o){var h=function(m,s){return o.getText(s);};for(var i=0,l=I.length;i<l;i++){var P=I[i];P.object[P.key]=P.object[P.key].replace(r,h);}};if(A){return this._loadI18n(A).then(e);}else{e(this._loadI18n(A));}}else{return A?Promise.resolve():undefined;}},_loadI18n:function(A){var m=this._oRawManifest,i=(m["sap.app"]&&m["sap.app"]["i18n"])||"i18n/i18n.properties",I=new U(i);return R.create({url:this._resolveUri(I,"manifest").toString(),async:A});},getJson:function(){return this._oManifest;},getRawJson:function(){return this._oRawManifest;},getEntry:function(P){if(!P||P.indexOf(".")<=0){L.warning("Manifest entries with keys without namespace prefix can not be read via getEntry. Key: "+P+", Component: "+this.getComponentName());return null;}var m=this.getJson();var e=d(m,P);if(P&&P[0]!=="/"&&!b(e)){L.warning("Manifest entry with key '"+P+"' must be an object. Component: "+this.getComponentName());return null;}return e;},checkUI5Version:function(){var m=this.getEntry("/sap.ui5/dependencies/minUI5Version");if(m&&L.isLoggable(L.Level.WARNING)&&sap.ui.getCore().getConfiguration().getDebug()){sap.ui.getVersionInfo({async:true}).then(function(v){var o=g(m);var e=g(v&&v.version);if(o.compareTo(e)>0){L.warning("Component \""+this.getComponentName()+"\" requires at least version \""+o.toString()+"\" but running on \""+e.toString()+"\"!");}}.bind(this),function(e){L.warning("The validation of the version for Component \""+this.getComponentName()+"\" failed! Reasion: "+e);}.bind(this));}},loadIncludes:function(){if(this._bIncludesLoaded){return;}var e=this.getEntry("/sap.ui5/resources");if(!e){return;}var C=this.getComponentName();var J=e["js"];if(J){for(var i=0;i<J.length;i++){var o=J[i];var F=o.uri;if(F){var m=F.match(/\.js$/i);if(m){var s=C.replace(/\./g,'/')+(F.slice(0,1)==='/'?'':'/')+F.slice(0,m.index);L.info("Component \""+C+"\" is loading JS: \""+s+"\"");sap.ui.requireSync(s);}}}}var h=e["css"];if(h){for(var j=0;j<h.length;j++){var k=h[j];if(k.uri){var l=this.resolveUri(k.uri);L.info("Component \""+C+"\" is loading CSS: \""+l+"\"");a(l,{id:k.id,"data-sap-ui-manifest-uid":this._uid});}}}this._bIncludesLoaded=true;},removeIncludes:function(){if(!this._bIncludesLoaded){return;}var m=this.getEntry("/sap.ui5/resources");if(!m){return;}var C=this.getComponentName();var e=m["css"];if(e){var l=document.querySelectorAll("link[data-sap-ui-manifest-uid='"+this._uid+"']");for(var i=0;i<l.length;i++){var o=l[i];L.info("Component \""+C+"\" is removing CSS: \""+o.href+"\"");o.parentNode.removeChild(o);}}this._bIncludesLoaded=false;},loadDependencies:function(){var D=this.getEntry("/sap.ui5/dependencies"),C=this.getComponentName();if(D){var l=D["libs"];if(l){for(var s in l){if(!l[s].lazy){L.info("Component \""+C+"\" is loading library: \""+s+"\"");sap.ui.getCore().loadLibrary(s);}}}var m=D["components"];if(m){for(var n in m){if(!m[n].lazy){var e=n.replace(/\./g,"/")+"/Component";var i=sap.ui.loader._.getModuleState(e+".js");if(i===-1){sap.ui.requireSync(e);}else if(i===0){L.info("Component \""+C+"\" is loading component: \""+n+".Component\"");sap.ui.requireSync("sap/ui/core/Component");sap.ui.component.load({name:n});}}}}}},defineResourceRoots:function(){var m=this.getEntry("/sap.ui5/resourceRoots");if(m){for(var s in m){var e=m[s];var o=new U(e);if(o.is("absolute")||(o.path()&&o.path()[0]==="/")){L.error("Resource root for \""+s+"\" is absolute and therefore won't be registered! \""+e+"\"",this.getComponentName());continue;}e=this._resolveUri(o).toString();var P={};P[s.replace(/\./g,"/")]=e;sap.ui.loader.config({paths:P});}}},getComponentName:function(){var o=this.getRawJson();return this._sComponentName||d(o,"/sap.ui5/componentName")||d(o,"/sap.app/id");},resolveUri:function(s,e){var o=this._resolveUri(new U(s),e);return o&&o.toString();},_resolveUri:function(o,s){return M._resolveUriRelativeTo(o,s==="manifest"?this._oManifestBaseUri:this._oBaseUri);},init:function(i){if(this._iInstanceCount===0){this.checkUI5Version();this.defineResourceRoots();this.loadDependencies();this.loadIncludes();this.activateCustomizing();}if(i){this.activateCustomizing(i);}this._iInstanceCount++;},exit:function(i){var I=Math.max(this._iInstanceCount-1,0);if(i){this.deactivateCustomizing(i);}if(I===0){this.deactivateCustomizing();this.removeIncludes();}this._iInstanceCount=I;},activateCustomizing:function(i){var o=this.getEntry("sap.ui5",true),e=o&&o["extends"]&&o["extends"].extensions;if(!q.isEmptyObject(e)){var C=sap.ui.requireSync('sap/ui/core/CustomizingConfiguration');if(!i){C.activateForComponent(this.getComponentName());}else{C.activateForComponentInstance(i);}}},deactivateCustomizing:function(i){var C=sap.ui.require('sap/ui/core/CustomizingConfiguration');if(C){if(!i){C.deactivateForComponent(this.getComponentName());}else{C.deactivateForComponentInstance(i);}}}});M._resolveUriRelativeTo=function(o,e){if(o.is("absolute")||(o.path()&&o.path()[0]==="/")){return o;}var P=new U(document.baseURI).search("");e=e.absoluteTo(P);return o.absoluteTo(e).relativeTo(P);};M.load=function(o){var m=o&&o.manifestUrl,C=o&&o.componentName,A=o&&o.async,F=o&&o.failOnError;var e=new U(m);["sap-language","sap-client"].forEach(function(n){if(!e.hasQuery(n)){var v=sap.ui.getCore().getConfiguration().getSAPParam(n);if(v){e.addQuery(n,v);}}});m=e.toString();L.info("Loading manifest via URL: "+m);var h=c.loadResource({url:m,dataType:"json",async:typeof A!=="undefined"?A:false,headers:{"Accept-Language":sap.ui.getCore().getConfiguration().getLanguageTag()},failOnError:typeof F!=="undefined"?F:true});var s={componentName:C,url:m,process:false};if(A){return h.then(function(h){return new M(h,s);});}return new M(h,s);};return M;});