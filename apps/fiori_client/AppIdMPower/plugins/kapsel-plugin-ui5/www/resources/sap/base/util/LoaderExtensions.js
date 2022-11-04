/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/thirdparty/jquery','sap/base/Log','sap/base/assert'],function(q,L,a){"use strict";var b={};var F="fragment";var V="view";var K={js:[V,F,"controller","designtime"],xml:[V,F],json:[V,F],html:[V,F]};var r;(function(){var s="";for(var t in K){s=(s?s+"|":"")+t;}s="\\.("+s+")$";r=new RegExp(s);}());b.getKnownSubtypes=function(){return K;};b.getAllRequiredModules=function(){var m=[],M=sap.ui.loader._.getAllModules(true),o;for(var s in M){o=M[s];if(o.ui5&&o.state!==-1){m.push(o.ui5);}}return m;};var f=Object.create(null);b.registerResourcePath=function(R,u){if(!u){u={url:null};}if(!f[R]){var U;if(typeof u==="string"||u instanceof String){U=u;}else{U=u.url;if(u.final){f[R]=u.final;}}var o=sap.ui.require.toUrl(R);var c;if(U!==o||u.final){c={paths:{}};c.paths[R]=U;sap.ui.loader.config(c);L.info("LoaderExtensions.registerResourcePath ('"+R+"', '"+U+"')"+(u['final']?" (final)":""));}}else{L.warning("LoaderExtensions.registerResourcePath with prefix "+R+" already set as final. This call is ignored.");}};b.loadResource=function(R,o){var t,D,u,E,c,s;if(typeof R==="string"){o=o||{};}else{o=R||{};R=o.name;}o=q.extend({failOnError:true,async:false},o);t=o.dataType;if(t==null&&R){t=(t=r.exec(R||o.url))&&t[1];}a(/^(xml|html|json|text)$/.test(t),"type must be one of xml, html, json or text");c=o.async?new q.Deferred():null;function h(d,e){if(d==null&&o.failOnError){E=e||new Error("no data returned for "+R);if(o.async){c.reject(E);L.error(E);}return null;}if(o.async){c.resolve(d);}return d;}function g(d){var C=q.ajaxSettings.converters["text "+t];if(typeof C==="function"){d=C(d);}return h(d);}D=sap.ui.loader._.getModuleContent(R,o.url);if(D!=undefined){if(o.async){setTimeout(function(){g(D);},0);}else{D=g(D);}}else{s=sap.ui.loader._.getSyncCallBehavior();if(!o.async&&s){if(s>=1){L.error("[nosync] loading resource '"+(R||o.url)+"' with sync XHR");}else{throw new Error("[nosync] loading resource '"+(R||o.url)+"' with sync XHR");}}q.ajax({url:u=o.url||sap.ui.loader._.getResourcePath(R),async:o.async,dataType:t,headers:o.headers,success:function(d,e,x){D=h(d);},error:function(x,d,e){E=new Error("resource "+R+" could not be loaded from "+u+". Check for 'file not found' or parse errors. Reason: "+e);E.status=d;E.error=e;E.statusCode=x.status;D=h(null,E);}});}if(o.async){return Promise.resolve(c);}if(E!=null&&o.failOnError){throw E;}return D;};return b;});