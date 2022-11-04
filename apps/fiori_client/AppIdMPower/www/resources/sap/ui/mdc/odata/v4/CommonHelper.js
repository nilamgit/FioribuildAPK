/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/mdc/ResourceModel","sap/base/Log"],function(R,L){"use strict";var H={isPropertyFilterable:function(p,i){var e,P,I=false,m=i.context.getModel(),s=i.context.getPath();if(m.getObject(s+"@com.sap.vocabularies.UI.v1.Hidden")){return false;}if(m.getObject(s+"@com.sap.vocabularies.UI.v1.HiddenFilter")){return false;}e=H._getEntitySetPath(m,s);if(typeof(p)==="string"){P=p;}else{P=m.getObject(s+"@sapui.name");}if(P.indexOf("/")<0){I=H._isInNonFilterableProperties(m,e,P);}else{I=H._isContextPathFilterable(m,e,P);}return!I;},_isInNonFilterableProperties:function(m,e,c){var i=false;var a=m.getObject(e+"@Org.OData.Capabilities.V1.FilterRestrictions");if(a&&a.NonFilterableProperties){i=a.NonFilterableProperties.some(function(p){return p.$NavigationPropertyPath===c||p.$PropertyPath===c;});}return i;},_isContextPathFilterable:function(m,e,c){var C=c.split("/"),i=false,s="";C.some(function(a,b,d){if(s.length>0){s+="/"+a;}else{s=a;}if(b===d.length-1){i=H._isInNonFilterableProperties(m,e,s);}else if(m.getObject(e+"/$NavigationPropertyBinding/"+a)){i=H._isInNonFilterableProperties(m,e,s);s="";e="/"+m.getObject(e+"/$NavigationPropertyBinding/"+a);}return i===true;});return i;},replaceSpecialCharsInId:function(i){if(i.indexOf(" ")>=0){L.error("Annotation Helper: Spaces are not allowed in ID parts. Please check the annotations, probably something is wrong there.");}return i.replace(/@/g,"").replace(/\//g,"::").replace(/#/g,"::");},formatDraftLockText:function(I,a,b){if(!I){return sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("draft.DRAFT_OBJECT");}else if(a){if(b){return R.getText("draft.LOCKED_OBJECT");}else{return R.getText("draft.UNSAVED_CHANGES");}}else{return"";}},_getEntitySetPath:function(m,p){var l;var e=p.slice(0,p.indexOf("/",1));if(m.getObject(e+"/$kind")==="EntityContainer"){l=e.length+1;e=p.slice(l,p.indexOf("/",l));}return e;},_resolveValueHelpField:function(c){var v=c.getModel();var V=v.getObject("/");return V.$model.getMetaModel().createBindingContext('/'+V.CollectionPath+'/'+c.getObject());},_extendValueListMetadata:function(m,e,P,v){var a;var f=function(b){return b.Property.$PropertyPath===P;};var M=function(b){var t=b.$Type;if(t==="com.sap.vocabularies.Common.v1.ValueListParameterInOut"||t==="com.sap.vocabularies.Common.v1.ValueListParameterOut"){this.oLocalDataToValueListMap[b.LocalDataProperty.$PropertyPath]=b.ValueListProperty;}};var s,F=m.getObject("/"+e+"@Org.OData.Capabilities.V1.FilterRestrictions");var o=F&&F.FilterExpressionRestrictions&&F.FilterExpressionRestrictions.filter(f);if(o&&(o.length>0)&&(o[0].AllowedExpressions.indexOf("SingleValue")>-1)){s="Single";}else{s="Multi";}for(var p in v){var S=v[p].$model.getMetaModel().getObject("/"+v[p].CollectionPath+"@Org.OData.Capabilities.V1.SearchRestrictions");v[p].$mdc={};v[p].$mdc.qualifier=e+'/'+P+'#'+(p||"default");v[p].$mdc.sSelectionMode=s;v[p].$mdc.bSearchable=(S&&S.Searchable===false)?S.Searchable:true;a=v[p].Parameters;var l=m.getObject('/'+e+'/'+P+"@sapui.name");for(var i=0;i<a.length;i++){if(a[i].LocalDataProperty&&a[i].LocalDataProperty.$PropertyPath===l){v[p].$mdc.keyPath=a[i].ValueListProperty;v[p].$mdc.descriptionPath=v[p].$model.getMetaModel().getObject("/"+v[p].CollectionPath+"/"+a[i].ValueListProperty+"@com.sap.vocabularies.Common.v1.Text/$Path");break;}}v[p].$mdc.oLocalDataToValueListMap={};v[p].Parameters.forEach(M.bind(v[p].$mdc));}return v;}};H.isPropertyFilterable.requiresIContext=true;return H;},true);
