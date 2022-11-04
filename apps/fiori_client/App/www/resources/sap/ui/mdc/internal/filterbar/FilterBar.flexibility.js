/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/mdc/FilterField","sap/ui/mdc/odata/v4/CommonHelper","sap/ui/model/odata/v4/ODataModel","sap/base/Log"],function(F,C,v,L){"use strict";function g(f,M){return f.get_content();}function a(e,p,l,f,M,o){var b=o.getMetaModel(),c=b.requestObject('/'+e+'/'+p);var i=g(f,M);return c.then(function(){var d=F.createInstance({entitySet:e,propertyPath:p,metaModel:b,parent:f,withLabel:true});d.sId=f.getId()+'--template::FilterField::'+C.replaceSpecialCharsInId(p);if(l){d.get_content().getItems()[0].setText(l);}M.insertAggregation(i,"content",d,1);return d;});}function r(e,f,M){var I=g(f,M),b=M.getAggregation(I,"content"),R={},o;for(var i=0;i<b.length;i++){if(M.getId(b[i])===e){o=b[i];R.index=i;R.entitySet=o._getEntitySet();R.propertyPath=o._getPropertyPath();M.removeAggregation(I,"content",o);return R;}}}function m(e,t,f,M){var I=g(f,M),b=M.getAggregation(I,"content");for(var i=0;i<b.length;i++){if(M.getId(b[i])===e){M.removeAggregation(I,"content",b[i]);M.insertAggregation(I,"content",b[i],t);}}}return{"addFilter":{changeHandler:{applyChange:function(c,f,p){var o=c.getDefinition(),P=o.content.sFieldPath,l=o.content.label,M=p.modifier,b=p.appComponent||p.view,d=b?b.getModel():undefined,e=o.content.sEntitySet;if(!d instanceof v){L.error("Change can't be applied without a container having a Odata v4 model assigned");return false;}return a(e,P,l,f,M,d).then(function(h){c.setRevertData({elementId:M.getId(h)});});},completeChangeContent:function(c,s,p){var f=p.modifier.byId(c.getSelector().id);c.setContent({sFieldPath:s.content.columnKey,label:s.content.text,sEntitySet:f._getEntitySet()});},revertChange:function(c,f,p){var R=c.getRevertData();if(R){r(R.elementId,f,p.modifier);c.resetRevertData();}else{L.error("Attempt to revert an unapplied change.");return false;}return true;}},layers:{"USER":true}},"moveFilters":{changeHandler:{applyChange:function(c,f,p){var o=c.getDefinition(),M=o.content.movedElements;for(var x=0;x<M.length;x++){m(M[x].id,M[x].targetIndex,f,p.modifier);}return true;},completeChangeContent:function(c,s,p){c.setContent({movedElements:s.movedElements});},revertChange:function(c,f,p){var o=c.getDefinition(),M=o.content.movedElements;for(var x=0;x<M.length;x++){m(M[x].element,M[x].sourceIndex,f,p.modifier);}return true;}},layers:{"USER":true}},"removeFilter":{changeHandler:{applyChange:function(c,f,p){var o=c.getDefinition(),R;R=r(o.content.removedElement,f,p.modifier);c.setRevertData(R);return true;},completeChangeContent:function(c,s,p){c.setContent({removedElement:s.content.removedElement});},revertChange:function(c,t,p){var R=c.getRevertData(),M=p.appComponent||p.view,o=M?M.getModel():undefined;if(R){return a(R.entitySet,R.propertyPath,R.index,R.label,t,p.modifier,o).then(function(){c.resetRevertData();});}else{L.error("Attempt to revert an unapplied change.");return false;}}},layers:{"USER":true}}};},false);