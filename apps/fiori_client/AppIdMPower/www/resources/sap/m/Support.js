/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/thirdparty/jquery','sap/ui/Device',"sap/base/security/encodeXML","sap/base/util/isPlainObject"],function(q,D,e,a){"use strict";var S=(function($,d){var b,s,c,l,t=0,m=3000,h=2,f=3,r=1,o={},g={btnStart:"startE2ETrace",selLevel:"logLevelE2ETrace",taContent:"outputE2ETrace",infoText:"Ent-to-End trace is running in the background."+" Navigate to the URL that you would like to trace."+" The result of the trace will be shown in dialog after the trace is terminated.",infoDuration:5000},j={dvLoadedLibs:"LoadedLibs",dvLoadedModules:"LoadedModules"},w;function k(i,v,E,F,G){i.push("<tr class='sapUiSelectable'><td class='sapUiSupportTechInfoBorder sapUiSelectable'><label class='sapUiSupportLabel sapUiSelectable'>",e(F),"</label><br>");var H=G;if(q.isFunction(G)){H=G(i)||"";}i.push(e(H));i.push("</td></tr>");}function n(E,F,G,H,I){k(E,F,G,H,function(E){E.push("<table class='sapMSupportTable' border='0' cellspacing='5' cellpadding='5' width='100%'><tbody>");q.each(I,function(i,v){var J="";if(v!==undefined&&v!==null){if(typeof(v)=="string"||typeof(v)=="boolean"||(Array.isArray(v)&&v.length==1)){J=v;}else if((Array.isArray(v)||a(v))&&window.JSON){J=window.JSON.stringify(v);}}k(E,false,false,i,""+J);});E.push("</tbody></table>");});}function p(F){o={version:F.commonInformation.version,build:F.commonInformation.buildTime,change:F.commonInformation.lastChange,useragent:F.commonInformation.userAgent,docmode:F.commonInformation.documentMode,debug:F.commonInformation.debugMode,bootconfig:F.configurationBootstrap,config:F.configurationComputed,loadedlibs:F.loadedLibraries,modules:F.loadedModules,uriparams:F.URLParameters,appurl:F.commonInformation.applicationHREF};var E=["<table class='sapUiSelectable' border='0' cellspacing='5' cellpadding='5' width='100%'><tbody class='sapUiSelectable'>"];k(E,true,true,"SAPUI5 Version",function(i){i.push(o.version," (built at ",o.build,", last change ",o.change,")");});k(E,true,true,"User Agent",function(i){i.push(o.useragent,(o.docmode?", Document Mode '"+o.docmode+"'":""));});k(E,true,true,"Debug Sources",function(i){i.push((o.debug?"ON":"OFF"));});k(E,true,true,"Application",o.appurl);n(E,true,true,"Configuration (bootstrap)",o.bootconfig);n(E,true,true,"Configuration (computed)",o.config);n(E,true,true,"URI Parameters",o.uriparams);k(E,true,true,"End-to-End Trace",function(i){i.push("<label class='sapUiSupportLabel'>Trace Level:</label>","<select id='"+u(g.selLevel)+"' class='sapUiSupportTxtFld' >","<option value='low'>LOW</option>","<option value='medium' selected>MEDIUM</option>","<option value='high'>HIGH</option>","</select>");i.push("<button id='"+u(g.btnStart)+"' class='sapUiSupportBtn'>Start</button>");i.push("<div class='sapUiSupportDiv'>");i.push("<label class='sapUiSupportLabel'>XML Output:</label>");i.push("<textarea id='"+u(g.taContent)+"' class='sapUiSupportTxtArea sapUiSelectable' readonly ></textarea>");i.push("</div>");});k(E,true,true,"Loaded Libraries",function(G){G.push("<ul class='sapUiSelectable'>");q.each(o.loadedlibs,function(i,v){if(v&&(typeof(v)==="string"||typeof(v)==="boolean")){G.push("<li class='sapUiSelectable'>",i+" "+v,"</li>");}});G.push("</ul>");});k(E,true,true,"Loaded Modules",function(i){i.push("<div class='sapUiSupportDiv sapUiSelectable' id='"+u(j.dvLoadedModules)+"'></div>");});E.push("</tbody></table>");return new sap.ui.core.HTML({content:E.join("").replace(/\{/g,"&#123;").replace(/\}/g,"&#125;")});}function u(i){return b.getId()+"-"+i;}function x(v,E){var F="Modules";var G=0,H=[];G=E.length;q.each(E.sort(),function(i,J){H.push(new sap.m.Label({text:" - "+J}).addStyleClass("sapUiSupportPnlLbl"));});var I=new sap.m.Panel({expandable:true,expanded:false,headerToolbar:new sap.m.Toolbar({design:sap.m.ToolbarDesign.Transparent,content:[new sap.m.Label({text:F+" ("+G+")",design:sap.m.LabelDesign.Bold})]}),content:H});I.placeAt(u(v),"only");}function y(){if(b.traceXml){b.$(g.taContent).text(b.traceXml);}if(b.e2eLogLevel){b.$(g.selLevel).val(b.e2eLogLevel);}x(j.dvLoadedModules,o.modules);b.$(g.btnStart).one("tap",function(){b.e2eLogLevel=b.$(g.selLevel).val();b.$(g.btnStart).addClass("sapUiSupportRunningTrace").text("Running...");b.traceXml="";b.$(g.taContent).text("");sap.ui.core.support.trace.E2eTraceLib.start(b.e2eLogLevel,function(i){b.traceXml=i;});sap.m.MessageToast.show(g.infoText,{duration:g.infoDuration});b.close();});}function z(){if(b){return b;}var i=sap.ui.requireSync("sap/m/Dialog");var v=sap.ui.requireSync("sap/m/Button");sap.ui.requireSync("sap/ui/core/HTML");sap.ui.requireSync("sap/m/MessageToast");sap.ui.requireSync("sap/ui/core/support/trace/E2eTraceLib");b=new i({title:"Technical Information",horizontalScrolling:true,verticalScrolling:true,stretch:D.system.phone,buttons:[new v({text:"Close",press:function(){b.close();}})],afterOpen:function(){S.off();},afterClose:function(){S.on();}}).addStyleClass("sapMSupport");return b;}function A(E){if(E.touches){var i=E.touches.length;if(D.browser.mobile&&(D.browser.name===D.browser.BROWSER.INTERNET_EXPLORER||D.browser.name===D.browser.BROWSER.EDGE)){w=i;}if(i>f){d.removeEventListener('touchend',B);return;}switch(i){case h:s=Date.now();d.addEventListener('touchend',B);break;case f:if(s){t=Date.now()-s;l=E.touches[i-1].identifier;}break;}}}function B(E){var i=D.browser.mobile&&(D.browser.name===D.browser.BROWSER.INTERNET_EXPLORER||D.browser.name===D.browser.BROWSER.EDGE)&&w==f;d.removeEventListener('touchend',B);if(t>m&&(E.touches.length===h||i)&&E.changedTouches.length===r&&E.changedTouches[0].identifier===l){t=0;s=0;C();}}function C(){sap.ui.require(['sap/ui/core/support/ToolsAPI'],function(T){var i=z();i.removeAllAggregation("content");i.addAggregation("content",p(T.getFrameworkInformation()));b.open();y();});}return({on:function(){if(!c&&"ontouchstart"in d){c=true;d.addEventListener("touchstart",A);}return this;},off:function(){if(c){c=false;d.removeEventListener("touchstart",A);}return this;},open:function(){C();},isEventRegistered:function(){return c;}}).on();}(q,document));return S;},true);
