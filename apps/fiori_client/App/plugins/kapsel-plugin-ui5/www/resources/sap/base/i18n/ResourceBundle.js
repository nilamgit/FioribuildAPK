/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/base/assert','sap/base/Log','sap/base/strings/formatMessage','sap/base/util/Properties'],function(a,L,f,P){"use strict";var r=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;var M={"he":"iw","yi":"ji","id":"in","sr":"sh","nb":"no"};var b={"iw":"he","ji":"yi","in":"id","sh":"sr","no":"nb"};var c={"en_US_saptrc":"1Q","en_US_sappsd":"2Q"};var d=/(?:^|-)(saptrc|sappsd)(?:-|$)/i;function n(i){var m;if(typeof i==='string'&&(m=r.exec(i.replace(/_/g,'-')))){var p=m[1].toLowerCase();p=M[p]||p;var S=m[2]?m[2].toLowerCase():undefined;var q=m[3]?m[3].toUpperCase():undefined;var v=m[4]?m[4].slice(1):undefined;var u=m[6];if((u&&(m=d.exec(u)))||(v&&(m=d.exec(v)))){return"en_US_"+m[1].toLowerCase();}if(p==="zh"&&!q){if(S==="hans"){q="CN";}else if(S==="hant"){q="TW";}}return p+(q?"_"+q+(v?"_"+v.replace("-","_"):""):"");}}function e(){var i;if(window.sap&&window.sap.ui&&sap.ui.getCore){i=sap.ui.getCore().getConfiguration().getLanguage();i=n(i);}return i||"en";}function g(i){if(!i){return null;}if(i==="zh_HK"){return"zh_TW";}var p=i.lastIndexOf('_');if(p>=0){return i.slice(0,p);}return i!=='en'?'en':'';}function h(i){var m;if(typeof i==='string'&&(m=r.exec(i.replace(/_/g,'-')))){var p=m[1].toLowerCase();p=b[p]||p;return p+(m[3]?"-"+m[3].toUpperCase()+(m[4]?"-"+m[4].slice(1).replace("_","-"):""):"");}}var j=/^((?:[^?#]*\/)?[^\/?#]*)(\.[^.\/?#]+)((?:\?([^#]*))?(?:#(.*))?)$/;var A=[".properties",".hdbtextbundle"];function s(u){var m=j.exec(u);if(!m||A.indexOf(m[2])<0){throw new Error("resource URL '"+u+"' has unknown type (should be one of "+A.join(",")+")");}return{url:u,prefix:m[1],ext:m[2],query:m[4],hash:(m[5]||""),suffix:m[2]+(m[3]||"")};}function R(u,i,I,m){this.sLocale=this._sNextLocale=n(i)||e();this.oUrlInfo=s(u);this.bIncludeInfo=I;this.aCustomBundles=[];this.aPropertyFiles=[];this.aLocales=[];if(m){var p=function(){return this;}.bind(this);return l(this).then(p,p);}k(this);}R.prototype._enhance=function(C){if(C instanceof R){this.aCustomBundles.push(C);}else{L.error("Custom resource bundle is either undefined or not an instanceof sap/base/i18n/ResourceBundle. Therefore this custom resource bundle will be ignored!");}};R.prototype.getText=function(K,i,I){var v=this._getTextFromProperties(K,i);if(v!=null){return v;}v=this._getTextFromFallback(K,i);if(v!=null){return v;}a(false,"could not find any translatable text for key '"+K+"' in bundle '"+this.oUrlInfo.url+"'");if(I){return undefined;}else{return this._formatValue(K,K,i);}};R.prototype._formatValue=function(v,K,i){if(typeof v==="string"){if(i){v=f(v,i);}if(this.bIncludeInfo){v=new String(v);v.originInfo={source:"Resource Bundle",url:this.oUrlInfo.url,locale:this.sLocale,key:K};}}return v;};R.prototype._getTextFromFallback=function(K,m){var v,i;for(i=this.aCustomBundles.length-1;i>=0;i--){v=this.aCustomBundles[i]._getTextFromFallback(K,m);if(v!=null){return v;}}while(typeof v!=="string"&&this._sNextLocale!=null){var p=k(this);if(p){v=p.getProperty(K);if(typeof v==="string"){return this._formatValue(v,K,m);}}}return null;};R.prototype._getTextFromProperties=function(K,m){var v=null,i;for(i=this.aCustomBundles.length-1;i>=0;i--){v=this.aCustomBundles[i]._getTextFromProperties(K,m);if(v!=null){return v;}}for(i=0;i<this.aPropertyFiles.length;i++){v=this.aPropertyFiles[i].getProperty(K);if(typeof v==="string"){return this._formatValue(v,K,m);}}return null;};R.prototype.hasText=function(K){return this.aPropertyFiles.length>0&&typeof this.aPropertyFiles[0].getProperty(K)==="string";};function l(B){if(B._sNextLocale!=null){return t(B,true).then(function(p){return p||l(B);});}return Promise.resolve(null);}function k(B){while(B._sNextLocale!=null){var p=t(B,false);if(p){return p;}}return null;}function o(i,S){return!S||S.length===0||S.indexOf(i)>=0;}function t(B,i){var m=B._sNextLocale;B._sNextLocale=g(m);var S=window.sap&&window.sap.ui&&sap.ui.getCore&&sap.ui.getCore().getConfiguration().getSupportedLanguages();if(m!=null&&o(m,S)){var u=B.oUrlInfo,U,H;if(u.ext==='.hdbtextbundle'){if(c[m]){U=u.prefix+u.suffix+'?'+(u.query?u.query+"&":"")+"sap-language="+c[m]+(u.hash?"#"+u.hash:"");}else{U=u.url;}H={"Accept-Language":h(m)||""};}else{U=u.prefix+(m?"_"+m:"")+u.suffix;}var p=P.create({url:U,headers:H,async:!!i,returnNullIfMissing:true});var q=function(v){if(v){B.aPropertyFiles.push(v);B.aLocales.push(m);}return v;};return i?p.then(q):q(p);}return i?Promise.resolve(null):null;}R.create=function(p){p=Object.assign({url:"",locale:undefined,includeInfo:false},p);return new R(p.url,p.locale,p.includeInfo,!!p.async);};R._getFallbackLocales=function(i,S){var T=n(i),m=[];while(T!=null){if(o(T,S)){m.push(T);}T=g(T);}return m;};return R;});
