/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./_AnnotationHelperExpression"],function(E){"use strict";var r=/[\\\{\}:]/,a=/\/\$count$/,A={getNavigationBinding:function(p){p=A.getNavigationPath(p);if(r.test(p)){throw new Error("Invalid OData identifier: "+p);}return p?"{"+p+"}":p;},getNavigationPath:function(p){var i;if(!p||p[0]==="@"){return"";}if(a.test(p)){return p.slice(0,-7);}i=p.indexOf("@");if(i>-1){p=p.slice(0,i);}if(p[p.length-1]==="/"){p=p.slice(0,-1);}if(p.indexOf(".")>-1){p=p.split("/").filter(function(s){return s.indexOf(".")<0;}).join("/");}return p;},getValueListType:function(R,d){var p=typeof R==="string"?"/"+d.schemaChildName+"/"+R:d.context.getPath();return d.$$valueAsPromise?d.context.getModel().fetchValueListType(p).unwrap():d.context.getModel().getValueListType(p);},isMultiple:function(p,d){var i;function b(v){return v===true;}if(!p||p[0]==="@"){return false;}if(a.test(p)){return true;}i=p.indexOf("@");if(i>-1){p=p.slice(0,i);}if(p[p.length-1]!=="/"){p+="/";}p="/"+d.schemaChildName+"/"+p+"$isCollection";return d.$$valueAsPromise?d.context.getModel().fetchObject(p).then(b).unwrap():d.context.getObject(p)===true;},label:function(R,d){var n;if(R.Label){return A.value(R.Label,{context:d.context.getModel().createBindingContext("Label",d.context)});}if(R.Value&&R.Value.$Path){n=d.context.getModel().createBindingContext("Value/$Path@com.sap.vocabularies.Common.v1.Label",d.context);if(d.$$valueAsPromise){return n.getModel().fetchObject("",n).then(function(o){return A.value(o,{context:n});}).unwrap();}return A.value(n.getObject(""),{context:n});}},value:function(R,d){var p=d.context.getPath();if(p.slice(-1)==="/"){p=p.slice(0,-1);}return E.getExpression({asExpression:false,model:d.context.getModel(),path:p,value:R});}};return A;},true);
