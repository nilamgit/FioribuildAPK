/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","sap/base/util/ObjectPath","sap/ui/core/mvc/View"],function(L,O,V){"use strict";sap.ui.extensionpoint=function(c,e,C,t,a){L.warning("Do not use deprecated factory function 'sap.ui.extensionpoint'. Use 'sap.ui.core.ExtensionPoint.load' instead","sap.ui.extensionpoint",null,function(){return{type:"sap.ui.extensionpoint",name:e};});return E._factory(c,e,C,t,a);};var E=sap.ui.extensionpoint;E._factory=function(c,e,C,t,a){var b,v,r;var d=sap.ui.require('sap/ui/core/CustomizingConfiguration'),V=sap.ui.require('sap/ui/core/mvc/View'),F=sap.ui.require('sap/ui/core/Fragment');if(d){if(V&&c instanceof V){b=d.getViewExtension(c.sViewName,e,c);v=c;}else if(F&&c instanceof F){b=d.getViewExtension(c.getFragmentName(),e,c);v=c._oContainingView;}if(b){if(b.className){var f=sap.ui.requireSync(b.className.replace(/\./g,"/"));f=f||O.get(b.className);var I=v&&b.id?v.createId(b.id):b.id;L.info("Customizing: View extension found for extension point '"+e+"' in View '"+v.sViewName+"': "+b.className+": "+(b.viewName||b.fragmentName));if(b.className==="sap.ui.core.Fragment"){var o=new f({id:I,type:b.type,fragmentName:b.fragmentName,containingView:v});r=(Array.isArray(o)?o:[o]);}else if(b.className==="sap.ui.core.mvc.View"){var v=V._legacyCreate({type:b.type,viewName:b.viewName,id:I});r=[v];}else{L.warning("Customizing: Unknown extension className configured (and ignored) in Component.js for extension point '"+e+"' in View '"+v.sViewName+"': "+b.className);}}else{L.warning("Customizing: no extension className configured in Component.js for extension point '"+e+"' in View '"+v.sViewName+"': "+b.className);}}}if(!r&&typeof C==='function'){r=C();}var p=function(r){if(r&&!Array.isArray(r)){r=[r];}if(r&&t){var A=t.getMetadata().getAggregation(a);if(A){for(var i=0,l=r.length;i<l;i++){t[A._sMutator](r[i]);}}else{L.error("Creating extension point failed - Tried to add extension point with name "+e+" to an aggregation of "+t.getId()+" in view "+v.sViewName+", but sAggregationName was not provided correctly and I could not find a default aggregation");}}return r||[];};if(r&&typeof r.then==='function'){return r.then(p);}else{return p(r);}};E.load=function(o){return Promise.resolve(E._factory(o.container,o.name,o.createDefaultContent));};return E;});
