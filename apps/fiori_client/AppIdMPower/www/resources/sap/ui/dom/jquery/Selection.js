/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";jQuery.fn.disableSelection=function(){return this.on(("onselectstart"in document.createElement("div")?"selectstart":"mousedown")+".ui-disableSelection",function(e){e.preventDefault();});};jQuery.fn.enableSelection=function(){return this.off(".ui-disableSelection");};return jQuery;});
