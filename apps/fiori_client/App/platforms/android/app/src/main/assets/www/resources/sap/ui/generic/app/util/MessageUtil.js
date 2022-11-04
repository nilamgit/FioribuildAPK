/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */
sap.ui.getCore().loadLibrary("sap.m");sap.ui.define(["sap/ui/core/ValueState","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/m/MessageToast","sap/ui/core/syncStyleClass"],function(V,F,a,M,s){"use strict";var h={badRequest:"400",unauthorized:"401",forbidden:"403",notFound:"404",methodNotAllowed:"405",preconditionFailed:"428",internalServerError:"500",notImplemented:"501",badGateway:"502",serviceUnavailable:"503",gatewayTimeout:"504",httpVersionNotSupported:"505"};var o={callAction:"callAction",addEntry:"addEntry",saveEntity:"saveEntity",deleteEntity:"deleteEntity",editEntity:"editEntity",modifyEntity:"modifyEntity",activateDraftEntity:"activateDraftEntity",saveAndPrepareDraftEntity:"saveAndPrepareDraftEntity",getCollection:"getCollection"};var m;function g(R){var t=[],e;var f=sap.ui.getCore().getMessageManager();var j=f.getMessageModel().getData();for(var i=0;i<j.length;i++){e=j[i];if(e.getPersistent()){t.push(e);}}return t;}function c(P,C){var D;D=function(n,f){var e;var i={onMessageDialogClose:function(){f.onMessageDialogClose();e.destroy();}};e=sap.ui.xmlfragment(n,i);if(C){s(C,P,e);}P.addDependent(P);return e;};return D;}function b(v,A){var S,D,B,e;var f={onMessageDialogClose:function(){B.setVisible(false);e.navigateBack();D.close();r();},onBackButtonPress:function(){B.setVisible(false);e.navigateBack();},onMessageSelect:function(){B.setVisible(true);},getGroupName:function(w){var E,x,y,z,H,G,T;var I=D.getModel();var J=I.getMetaModel();if(!w){return l.getText("GENERAL_TITLE");}if(w.lastIndexOf("/")>0){w=w.substring(0,w.lastIndexOf("/"));}E=w.substring(1,w.indexOf('('));x=E&&J.getODataEntitySet(E);y=x&&J.getODataEntityType(x.entityType);H=y&&y["com.sap.vocabularies.UI.v1.HeaderInfo"];T=H&&H.Title&&H.Title.Value&&H.Title.Value.Path;z=I.getProperty(w);G=z&&z[T];return G?G:l.getText("GENERAL_TITLE");}};var t=g();var l=sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app");if(t.length===0){return false;}else if(t.length===1&&t[0].type===V.Success){M.show(t[0].message,{onClose:r});}else{if(typeof v=="function"){D=v("sap.ui.generic.app.fragments.MessageDialog",f);}else if(typeof v=="object"){D=c(v.owner,v.contentDensityClass)("sap.ui.generic.app.fragments.MessageDialog",f);}else{return undefined;}var C=D.getAggregation("customHeader");var B=C.getContentLeft()[0];var e=D.getAggregation("content")[0];var j=sap.ui.getCore().getMessageManager().getMessageModel();D.setModel(j,"message");var k=D.getContent()[0];var n=k.getBinding("items");n.filter(new F("persistent",a.EQ,true));var q=new sap.ui.model.json.JSONModel();D.setModel(q,"settings");q.setProperty("/closeButtonText",l.getText("DIALOG_CLOSE"));for(var i=0;i<t.length;i++){var u=t[i];if(u.type===sap.ui.core.MessageType.Error){S=sap.ui.core.ValueState.Error;break;}if(u.type===sap.ui.core.MessageType.Warning){S=sap.ui.core.ValueState.Warning;continue;}if(u.type===sap.ui.core.MessageType.Information||u.type===sap.ui.core.MessageType.None){S=sap.ui.core.ValueState.None;continue;}S=sap.ui.core.ValueState.Success;}q.setProperty("/state",S);if(A){q.setProperty("/title",A);}else{q.setProperty("/title",l.getText("DIALOG_TITLE"));}D.open();}}function r(){var e=sap.ui.getCore().getMessageManager();var t=g();if(t.length>0){e.removeMessages(t);}}function d(e,D,f){var t=new sap.ui.core.message.Message({message:e,description:D,type:sap.ui.core.MessageType.Error,processor:f,target:'',persistent:true});sap.ui.getCore().getMessageManager().addMessages(t);}function p(e){var R;m=e&&e.url;if(m){m="/"+m.substring(0,m.indexOf(")")+1);}var f=sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app").getText("ERROR_UNKNOWN");var H;if(e instanceof Error){if(e.message){f=e.message;}}else if(e.response){if(e.response.message){f=e.response.message;}if(e.response.statusCode){H=e.response.statusCode;}if(e.response.headers){for(var i in e.response.headers){if(i.toLowerCase()==="content-type"){var j=e.response.headers[i];if(j.toLowerCase().indexOf("application/json")===0){if(e.response.responseText){var O=JSON.parse(e.response.responseText);if(O&&O.error&&O.error.message&&O.error.message.value){f=O.error.message.value;}}}else if(e.message){f=e.message;}break;}}}}var t=g(e);R={httpStatusCode:H,messageText:f,description:null,containsTransientMessage:(t.length===0)?false:true};return R;}return{operations:o,httpStatusCodes:h,handleTransientMessages:b,removeTransientMessages:r,addTransientErrorMessage:d,parseErrorResponse:p};},true);
