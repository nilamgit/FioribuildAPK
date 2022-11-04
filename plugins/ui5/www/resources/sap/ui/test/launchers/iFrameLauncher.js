/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/thirdparty/URI','sap/ui/Device','sap/ui/test/_LogCollector',"sap/base/Log","sap/ui/thirdparty/jquery",'sap/base/util/ObjectPath'],function(U,D,_,L,q,O){"use strict";var f=null,F=null,$=null,o=null,a=null,b=null,r=false,u=false,A=null,c=null,s;function h(){f=F[0].contentWindow;e();g();}function d(w,H){if(w){F.css("width",w);$.css("padding-left",w);}else{F.addClass("default-scale-x");}if(H){F.css("height",H);}else{F.addClass("default-scale-y");}if(!w&&!H){F.addClass("default-scale-both");}}function e(){var i=f.onerror;f.onerror=function(E,w,x,C,y){var R=false;if(i){R=i.apply(this,arguments);}setTimeout(function(){var z=C?"\ncolumn: "+C:"";var I=y&&"\niFrame error: "+(y.stack?y.message+"\n"+y.stack:y)||"";throw new Error("Error in launched application iFrame: "+E+"\nurl: "+w+"\nline: "+x+z+I);},0);return R;};}function g(){if(u){return true;}if(f&&f.sap&&f.sap.ui&&f.sap.ui.getCore){if(!r){f.sap.ui.getCore().attachInit(j);}r=true;}return u;}function l(i){f.sap.ui.require(["sap/ui/thirdparty/sinon"],function(w){if(!w){setTimeout(function(){l(i);},50);}else{i();}});}function j(){m();if(D.browser.firefox){l(p);}else{p();}}function k(){b.sap.log.addLogListener(_.getInstance()._oListener);u=true;}function m(){b=f.jQuery;t("sap/ui/test");t("sap/ui/qunit");t("sap/ui/thirdparty");}function n(i,H,w){var x=new w(),y=new H(x),z=i.setHash,B=i.getHash,C,K=false,E=f.history.go;i.replaceHash=function(J){K=true;var M=this.getHash();C=J;x.fireEvent("hashReplaced",{sHash:J});this.changed.dispatch(J,M);};i.setHash=function(J){K=true;var R=B.call(this);C=J;x.fireEvent("hashSet",{sHash:J});z.apply(this,arguments);if(R===this.getHash()){this.changed.dispatch(R,y.aHistory[y.iHistoryPosition]);}};i.getHash=function(){if(C===undefined){return B.apply(this,arguments);}return C;};i.changed.add(function(N){if(!K){x.fireEvent("hashSet",{sHash:N});C=N;}K=false;});x.init();function G(){K=true;var N=y.aHistory[y.iHistoryPosition],J=y.getPreviousHash();C=J;i.changed.dispatch(J,N);}function I(){K=true;var N=y.aHistory[y.iHistoryPosition+1],J=y.aHistory[y.iHistoryPosition];if(N===undefined){L.error("Could not navigate forwards, there is no history entry in the forwards direction",this);return;}C=N;i.changed.dispatch(N,J);}f.history.back=G;f.history.forward=I;f.history.go=function(S){if(S===-1){G();return;}else if(S===1){I();return;}L.error("Using history.go with a number greater than 1 is not supported by OPA5",this);return E.apply(f.history,arguments);};}function p(){f.sap.ui.require(["sap/ui/test/OpaPlugin","sap/ui/test/autowaiter/_autoWaiter","sap/ui/test/_OpaLogger","sap/ui/qunit/QUnitUtils","sap/ui/thirdparty/hasher","sap/ui/core/routing/History","sap/ui/core/routing/HashChanger"],function(i,w,x,Q,y,H,z){x.setLevel(s);o=new i();A=w;a=Q;n(y,H,z);c=z;k();});}function t(R){var i=sap.ui.require.toUrl(R);var w=new U(i).absoluteTo(document.baseURI).search("").toString();var C=O.get("sap.ui._ui5loader.config",f)||O.get("sap.ui.loader.config",f);if(C){var x={};x[R]=w;C({paths:x});}else if(b&&b.sap&&b.sap.registerResourcePath){b.sap.registerResourcePath(R,w);}else{throw new Error("iFrameLauncher.js: UI5 module system not found.");}}function v(){if(!f){throw new Error("sap.ui.test.launchers.iFrameLauncher: Teardown was called before launch. No iFrame was loaded.");}f.onerror=q.noop;for(var i=0;i<F.length;i++){F[0].src="about:blank";F[0].contentWindow.document.write('');F[0].contentWindow.close();}if(typeof CollectGarbage=="function"){CollectGarbage();}F.remove();$.remove();b=null;o=null;a=null;f=null;u=false;r=false;A=null;c=null;}return{launch:function(i){if(f){throw new Error("sap.ui.test.launchers.iFrameLauncher: Launch was called twice without teardown. Only one iFrame may be loaded at a time.");}F=q("#"+i.frameId);if(!F.length){if(!i.source){L.error("No source was given to launch the IFrame",this);}$=q("<div class='opaFrameContainer'></div>");F=q('<IFrame id="'+i.frameId+'" class="opaFrame" src="'+i.source+'"></IFrame>');$.append(F);q("body").append($);d(i.width,i.height);}if(F[0].contentDocument&&F[0].contentDocument.readyState==="complete"){h();}else{F.on("load",h);}s=i.opaLogLevel;return g();},hasLaunched:function(){g();return u;},teardown:function(){v();},getHashChanger:function(){if(!c){return null;}return c.getInstance();},getPlugin:function(){return o;},getJQuery:function(){return b;},getUtils:function(){return a;},getWindow:function(){return f;},_getAutoWaiter:function(){return A;}};},true);