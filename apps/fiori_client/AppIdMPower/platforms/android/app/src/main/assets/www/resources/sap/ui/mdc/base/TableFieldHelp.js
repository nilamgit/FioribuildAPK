/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */
sap.ui.define(['./FieldHelpBase','sap/ui/model/ChangeReason','sap/ui/model/base/ManagedObjectModel','sap/ui/base/ManagedObjectObserver',"sap/ui/model/Filter","sap/ui/model/FilterOperator",'sap/base/strings/capitalize'],function(F,C,M,a,b,c,d){"use strict";var T=F.extend("sap.ui.mdc.base.TableFieldHelp",{metadata:{library:"sap.ui.mdc",properties:{getTextForKey:{type:"function",group:"Data"},getKeyForText:{type:"function",group:"Data"},getKeyFromItem:{type:"function",group:"Data"},getTextFromItem:{type:"function",group:"Data"}},aggregations:{table:{type:"sap.m.Table",multiple:false}},defaultAggregation:"table",events:{itemSelect:{parameters:{item:{type:"sap.m.ListItemBase"}}},navigateToItem:{parameters:{step:{type:"int"},selectedItem:{type:"sap.m.ListItemBase"}}},filterItems:{parameters:{filterText:{type:"string"}}}}}});T.prototype.init=function(){F.prototype.init.apply(this,arguments);this._oObserver=new a(_.bind(this));this._oObserver.observe(this,{properties:["filterValue","conditions"],aggregations:["table"]});};T.prototype.exit=function(){F.prototype.exit.apply(this,arguments);this._oObserver.disconnect();this._oObserver=undefined;};T.prototype._createPopover=function(){var p=F.prototype._createPopover.apply(this,arguments);if(p){var o=this._getField();if(o){p.setInitialFocus(o);}p._getAllContent=function(){var P=this.getParent();if(P){var i=[];i.push(P.getTable());return i;}else{return this.getContent();}};if(this._bNavigate){this._bNavigate=false;this.navigate(this._iStep);this._iStep=null;}}return p;};T.prototype._handleAfterOpen=function(E){F.prototype._handleAfterOpen.apply(this,arguments);var t=this.getTable();var s=t.getSelectedItem();if(s){s.getDomRef().scrollIntoView();}};T.prototype.open=function(s){var p=this.getAggregation("_popover");if(p){var o=this._getField();p.setInitialFocus(o);}F.prototype.open.apply(this,arguments);return this;};T.prototype._handleAfterClose=function(E){F.prototype._handleAfterClose.apply(this,arguments);if(this._bUpdateFilterAfterClose){this._bUpdateFilterAfterClose=false;l.call(this,this._sFilterValueAfterClose);this._sFilterValueAfterClose=null;}};function _(o){if(o.name==="table"){this.fireDataUpdate();var t=o.child;var p=this.getAggregation("_popover");if(o.mutation==="remove"){t.detachEvent("itemPress",e,this);t.detachEvent("updateFinished",h,this);}else{t.setMode(sap.m.ListMode.SingleSelectMaster);t.setRememberSelections(false);t.attachEvent("itemPress",e,this);t.attachEvent("updateFinished",h,this);j.call(this);}if(p){p.invalidate();}}if(o.name==="conditions"){k.call(this,o.current);}if(o.name==="filterValue"){if(this._bClosing){this._bUpdateFilterAfterClose=true;this._sFilterValueAfterClose=o.current;}else{l.call(this,o.current);}}}T.prototype.openByTyping=function(){return true;};T.prototype.navigate=function(s){var p=this._getPopover();if(!p){this._bNavigate=true;this._iStep=s;return;}var t=this.getTable();var S=t.getSelectedItem();if(this.hasListeners("navigateToItem")){if(!p.isOpen()){this.open();}this.fireNavigateToItem({step:s,selectedItem:S});}else{var i=t.getItems();var I=i.length;var n=0;if(S){n=t.indexOfItem(S);n=n+s;if(n<0){n=0;}else if(n>=I-1){n=I-1;}}else if(s>=0){n=s-1;}else{n=I+s;}var o=i[n];if(o&&o!==S){o.setSelected(true);var K=f.call(this,o);var q=g.call(this,o);m.call(this,K,q);if(!p.isOpen()){this.open();}else{o.getDomRef().scrollIntoView();}this.fireNavigate({value:q,key:K});}}};T.prototype.getTextForKey=function(K){var t="";var n=this.getGetTextForKey();if(n){t=n(K);if(typeof t!=="string"){throw new Error("function getTextForKey must return a string");}}else{var o=this.getTable();var N=false;if(o){var I=o.getItems();if(I.length>0){for(var i=0;i<I.length;i++){var p=I[i];if(p.getCells){var q=p.getCells();if(q.length>1){if(q[0].getText&&q[1].getText){if(q[0].getText()===K){t=q[1].getText();break;}}else{N=true;}}else{N=true;}}else{N=true;}}if(N){throw new Error("function getTextForKey is missing");}}}}return t;};T.prototype.getKeyForText=function(t){var K="";var n=this.getGetKeyForText();if(n){K=n(t);}else{var o=this.getTable();var N=false;if(o){var I=o.getItems();if(I.length>0){for(var i=0;i<I.length;i++){var p=I[i];if(p.getCells){var q=p.getCells();if(q.length>1){if(q[0].getText&&q[1].getText){if(q[1].getText()===t){K=q[0].getText();break;}}else{N=true;}}else{N=true;}}else{N=true;}}if(N){throw new Error("function getKeyForText is missing");}}}}return K;};function e(E){var i=E.getParameter("listItem");var s=i.getSelected();if(s){if(this.hasListeners("itemSelect")){this.close();this.fireItemSelect({item:i});}else{var K=f.call(this,i);var t=g.call(this,i);m.call(this,K,t);this.close();this.fireSelect({value:t,key:K,coditions:this.getConditions(),add:true});}}}function f(i){var K;var n=this.getGetKeyFromItem();if(n){K=n(i);}else{if(i.getCells){var o=i.getCells();if(o.length>0){if(o[0].getText){K=o[0].getText();}}}if(!K){throw new Error("function getKeyFromItem is missing");}}return K;}function g(i){var t;var n=this.getGetTextFromItem();if(n){t=n(i);if(typeof t!=="string"){throw new Error("function getTextFromItem must return a string");}}else{if(i.getCells){var o=i.getCells();if(o.length>1){if(o[1].getText){t=o[1].getText();}}}if(!t){throw new Error("function getTextFromItem is missing");}}return t;}function h(E){j.call(this);if(E.getParameter("reason")!==d(C.Filter)){this.fireDataUpdate();}}function j(s){var t=this.getTable();if(t){var n=this.getConditions();var s;if(n.length>0&&(n[0].operator==="EEQ"||n[0].operator==="EQ")){s=n[0].values[0];}var I=t.getItems();for(var i=0;i<I.length;i++){var o=I[i];var K=f.call(this,o);if(K===s){o.setSelected(true);}else{o.setSelected(false);}}}}function k(i){if(!this._bConditionUpdate){j.call(this);}}function l(s){if(this.hasListeners("filterItems")){this.fireFilterItems({filterText:s});}else{var t=this.getTable();var S=false;var B=t.getBinding("items");if(B){var o=t.getBindingInfo("items");if(o&&o.template.getCells&&o.template.getCells().length>1){o=o.template.getCells()[1].getBindingInfo("text");if(o&&o.parts&&o.parts.length>0){var p=o.parts[0].path;var i=new b(p,c.StartsWith,s);B.filter(i);S=true;}}if(!S){throw new Error("event filterItems must be implemented");}}}}function m(K,D){this._bConditionUpdate=true;var o={fieldPath:this.getFieldPath(),operator:"EEQ",values:[K]};if(D){o.values.push(D);}this.setProperty("conditions",[o],true);this._bConditionUpdate=false;}return T;},true);
