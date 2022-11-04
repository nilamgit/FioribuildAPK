/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.global","sap/ui/support/supportRules/Storage","sap/ui/support/supportRules/Constants"],function(q,s,c){"use strict";var r={};var R=function(S){S=S||{};if(!S.name){q.sap.log.error("Please provide a name for the RuleSet.");}if(r[S.name]){return r[S.name];}this._oSettings=S;this._mRules={};r[S.name]=this;};R.clearAllRuleSets=function(){r={};};R.prototype.getRules=function(){return this._mRules;};R.prototype.updateRule=function(a,O){var b=this._verifySettingsObject(O,true);if(b==="success"){delete this._mRules[a];this._mRules[O.id]=O;}return b;};R.prototype._verifySettingsObject=function(S,u){if(!S.id){q.sap.log.error("Support rule needs an id.");return"Support rule needs an unique id.";}if(!u&&this._mRules[S.id]){q.sap.log.error("Support rule with the id "+S.id+" already exists.");return"Support rule with the id "+S.id+" already exists.";}if(!S.check){q.sap.log.error("Support rule with the id "+S.id+" needs a check function.");return"Support rule with the id "+S.id+" needs a check function.";}if(!S.title){q.sap.log.error("Support rule with the id "+S.id+" needs a title.");return"Support rule with the id "+S.id+" needs a title.";}if(!S.description){q.sap.log.error("Support rule with the id "+S.id+" needs a description.");return"Support rule with the id "+S.id+" needs a description.";}if(!S.resolution&&(!S.resolutionurls||!S.resolutionurls.length>0)){q.sap.log.error("Support rule with the id "+S.id+" needs either a resolution or resolutionurls or should have a ticket handler function");return"Support rule with the id "+S.id+" needs either a resolution or resolutionurls or should have a ticket handler function";}if(!S.audiences||S.audiences.length===0){q.sap.log.error("Support rule with the id "+S.id+" should have an audience. Applying audience ['Control']");S.audiences=[sap.ui.support.Audiences.Control];}if(S.audiences&&S.audiences.forEach){var i=false,a="";S.audiences.forEach(function(b){if(!sap.ui.support.Audiences[b]){i=true;a=b;}});if(i){q.sap.log.error("Audience "+a+" does not exist. Please use the audiences from sap.ui.support.Audiences");return"Audience "+a+" does not exist. Please use the audiences from sap.ui.support.Audiences";}}if(!S.categories||S.categories.length===0){q.sap.log.error("Support rule with the id "+S.id+" should have a category. Applying category ['Performance']");S.categories=["Performance"];}if(S.categories&&S.categories.forEach){var I=false,C="";S.categories.forEach(function(b){if(!sap.ui.support.Categories[b]){I=true;C=b;}});if(I){q.sap.log.error("Category "+C+" does not exist. Please use the categories from sap.ui.support.Categories");return"Category "+C+" does not exist. Please use the categories from sap.ui.support.Categories";}}return"success";};R.prototype.addRule=function(S,v){var C=R.versionInfo?R.versionInfo.version:v.version;var a=S.minversion?S.minversion:'';if(a==='-'){a='';}if(a&&q.sap.Version(C).compareTo(a)<0){return"Rule "+S.id+" should be used with a version >= "+S.minversion;}var b=this._verifySettingsObject(S);if(b==="success"){this._mRules[S.id]=S;S.libName=this._oSettings.name;}return b;};R.prototype.removeRule=function(o){if(this._mRules[o.id]){delete this._mRules[o.id];}};R.storeSelectionOfRules=function(l){var a=R._extractRulesSettingsToSave(l);s.setSelectedRules(a);};R.loadSelectionOfRules=function(l){var a=s.getSelectedRules();if(!a){return;}for(var i=0;i<l.length;i+=1){var b=l[i].rules;var d=l[i].title;for(var e=0;e<b.length;e+=1){if(a[d]&&a[d].hasOwnProperty(b[e].id)){b[e].selected=a[d][b[e].id].selected;}}}};R._extractRulesSettingsToSave=function(l){var L={};var a;var b=l.length;var d;var e;var f;for(var g=0;g<b;g+=1){e=l[g].title;L[e]={};a=l[g].rules;d=a.length;for(var h=0;h<d;h+=1){f={};f.id=a[h].id;f.selected=a[h].selected;L[e][f.id]=f;}}return L;};return R;},true);