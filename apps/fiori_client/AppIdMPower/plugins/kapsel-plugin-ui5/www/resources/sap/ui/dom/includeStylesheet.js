/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/Device","sap/base/assert"],function(D,a){"use strict";function i(e){if(D.browser.msie||D.browser.edge){try{if(e.target.sheet.rules.length>0){return false;}}catch(b){}return true;}else{return false;}}function _(u,A,l,e){var c=function(){var L=document.createElement("link");L.rel="stylesheet";L.href=u;if(A&&typeof A==="object"){Object.keys(A).forEach(function(k){if(A[k]!=null){L.setAttribute(k,A[k]);}});}function b(E){var d=E.type==="error"||i(E);L.setAttribute("data-sap-ui-ready",!d);L.removeEventListener("load",b);L.removeEventListener("error",b);var f=d?e:l;if(typeof f==="function"){f();}}L.addEventListener("load",b);L.addEventListener("error",b);return L;};var s=A&&A.id;var o=document.getElementById(s);var L=c();if(o&&o.tagName==="LINK"&&o.rel==="stylesheet"){if(typeof l==="function"||typeof e==="function"||o.href!==L.href){if(o.getAttribute("data-sap-ui-foucmarker")===s){o.removeAttribute("id");o.parentNode.insertBefore(L,o);}else{o.parentNode.replaceChild(L,o);}}else if(o.getAttribute("data-sap-ui-foucmarker")===s){o.removeAttribute("data-sap-ui-foucmarker");}}else{var C=document.getElementById("sap-ui-core-customcss");if(C){C.parentNode.insertBefore(L,C);}else{document.head.appendChild(L);}}}var I=function includeStyleSheet(u,v,l,e){var A;if(typeof u==="string"){A=typeof v==="string"?{id:v}:v;_(u,A,l,e);}else{a(typeof u==='object'&&u.url,"vUrl must be an object and requires a URL");A=Object.assign({},u.attributes);if(u.id){A.id=u.id;}return new Promise(function(r,R){_(u.url,A,r,R);});}};return I;});
