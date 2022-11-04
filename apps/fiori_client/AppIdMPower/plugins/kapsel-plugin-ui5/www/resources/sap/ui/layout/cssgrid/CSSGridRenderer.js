/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/layout/cssgrid/GridLayoutBase"],function(G){"use strict";var C={};C.render=function(r,c){r.write("<div");r.addClass("sapUiLayoutCSSGrid");r.writeControlData(c);if(c.getWidth()){r.addStyle("width",c.getWidth());}G.renderSingleGridLayout(r,c.getGridLayoutConfiguration());r.writeStyles();r.writeClasses();r.write(">");c.getItems().forEach(r.renderControl);r.write("</div>");};return C;});
