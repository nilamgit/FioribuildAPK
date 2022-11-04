/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/base/ManagedObject',"sap/ui/test/_OpaLogger",'sap/ui/thirdparty/jquery',"sap/ui/test/selectors/_ControlSelectorValidator",'sap/ui/test/selectors/_selectors'],function(M,_,$,a,s){"use strict";var b=M.extend("sap.ui.test.selectors._ControlSelectorGenerator");var c=_.getLogger("sap.ui.test.selectors._ControlSelectorGenerator");b._generate=function(o){var S=[];var d=new a(S,o.validationRoot);var O=[s.globalID,s.viewID,s.labelFor,s.bindingPath,s.properties,s.dropdownItem,s.tableRowItem];O.forEach(function(g){var r;var A;var G=g._getAncestors(o.control);if(G&&!o.validationRoot){if(G.validation){r=b._generate({control:o.control,validationRoot:G.validation});}if(G.selector){A=b._generate({control:G.selector});}}var v=g.generate(o.control,A,r);if($.isArray(v)){v.forEach(function(e){if($.isArray(e)){e.forEach(function(p){d._validate(p);});}else{d._validate(e);}});}else{d._validate(v);}});if(S[0]){c.debug("The top matching unique selector is: "+JSON.stringify(S[0]));return S[0];}else{throw new Error("Could not generate a selector for control "+o.control);}};return b;});